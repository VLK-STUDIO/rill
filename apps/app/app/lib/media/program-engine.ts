import {
  computed,
  effectScope,
  onScopeDispose,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
import type { Node, Scene, SceneItem } from "@/lib/core";
import type { NodesRegistry } from "@/lib/nodes-registry/nodes-registry";
import type { StreamCache } from "./stream-cache";

export interface ProgramOutput {
  canvas: HTMLCanvasElement;
  stream: MediaStream;
  videoTrack: MediaStreamTrack;
  audioTrack: MediaStreamTrack;
  stop: () => void;
}

export interface UseProgramEngineOptions {
  scene: MaybeRefOrGetter<Scene | null>;
  nodes: NodesRegistry;
  project: { width: number; height: number };
  streamCache: StreamCache;
  fps?: number;
}

type ItemRuntime = {
  itemId: string;
  key: string;
  video: HTMLVideoElement;
  stream: MediaStream;
  audioTrack: MediaStreamTrack | null;
  release: () => void;
};

type MixerChannel = {
  audioCaptureEnabled: boolean;
  muted: boolean;
  gain: number;
  audioTrackId: string;
  sourceNode: MediaStreamAudioSourceNode;
  gainNode: GainNode;
};

type ItemAudioSettings = {
  audioCaptureEnabled: boolean;
  muted: boolean;
  gain: number;
};

const DEFAULT_AUDIO_GAIN = 1;

type ProgramEngineOptions = {
  width: number;
  height: number;
  fps: number;
  nodes: NodesRegistry;
  streamCache: StreamCache;
};

class ProgramEngine {
  private readonly fps: number;
  private readonly nodes: NodesRegistry;
  private readonly streamCache: StreamCache;

  private readonly canvas: HTMLCanvasElement;
  private readonly outputStream: MediaStream;
  private readonly videoTrack: MediaStreamTrack;
  private readonly audioContext: AudioContext;
  private readonly audioDestination: MediaStreamAudioDestinationNode;
  private readonly audioTrack: MediaStreamTrack;
  private readonly silentSource: ConstantSourceNode;
  private readonly silentGain: GainNode;

  private readonly itemRuntimes = new Map<string, ItemRuntime>();
  private readonly mixerChannels = new Map<string, MixerChannel>();

  private scene: Scene | null = null;

  private animationFrameId: number | null = null;
  private lastFrameAt = 0;

  constructor(options: ProgramEngineOptions) {
    this.fps = options.fps;
    this.nodes = options.nodes;
    this.streamCache = options.streamCache;

    const canvas = document.createElement("canvas");
    canvas.width = options.width;
    canvas.height = options.height;
    this.canvas = canvas;

    if (canvas.captureStream) {
      canvas.captureStream(this.fps);
    }

    const capturedVideoTrack = canvas
      .captureStream(this.fps)
      .getVideoTracks()[0];
    if (!capturedVideoTrack) {
      throw new Error("Failed to capture a video track from canvas");
    }
    this.videoTrack = capturedVideoTrack;

    const audioContext = new AudioContext();

    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    this.audioContext = audioContext;

    this.audioDestination = audioContext.createMediaStreamDestination();

    const silentSource = audioContext.createConstantSource();
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    silentSource.connect(silentGain);
    silentGain.connect(this.audioDestination);
    silentSource.start();

    this.silentSource = silentSource;
    this.silentGain = silentGain;

    const destinationTrack =
      this.audioDestination.stream.getAudioTracks()[0] ?? null;
    if (!destinationTrack) {
      throw new Error("Failed to create audio destination track");
    }
    this.audioTrack = destinationTrack;

    this.outputStream = new MediaStream([this.videoTrack, this.audioTrack]);

    this.scheduleRenderLoop();
  }

  public getOutput(): ProgramOutput {
    return {
      canvas: this.canvas,
      stream: this.outputStream,
      videoTrack: this.videoTrack,
      audioTrack: this.audioTrack,
      stop: () => this.dispose(),
    };
  }

  public async setScene(scene: Scene | null) {
    this.scene = scene;

    if (!scene) {
      this.stopAllItems();
      this.clearMixer();
      return;
    }

    const nextItemIds = new Set((scene.items as SceneItem[]).map((i) => i.id));

    for (const item of scene.items as SceneItem[]) {
      const node = this.nodes[item.nodeTypeId];
      if (!node) {
        continue;
      }

      await this.syncItemRuntime(item, node);

      const runtime = this.itemRuntimes.get(item.id);
      if (!runtime) {
        continue;
      }

      const settings = this.getItemAudioSettings(item);

      if (!settings.audioCaptureEnabled) {
        this.removeMixerChannel(item.id);
        continue;
      }

      if (runtime.audioTrack) {
        this.ensureMixerChannel(item.id, runtime.audioTrack);
        this.applyMixerSettings(item, settings);
      } else {
        this.removeMixerChannel(item.id);
      }
    }

    for (const [itemId, runtime] of this.itemRuntimes.entries()) {
      if (!nextItemIds.has(itemId)) {
        this.removeMixerChannel(itemId);
        runtime.release();
        this.itemRuntimes.delete(itemId);
      }
    }

    for (const itemId of this.mixerChannels.keys()) {
      if (!nextItemIds.has(itemId)) {
        this.removeMixerChannel(itemId);
      }
    }
  }

  public dispose() {
    this.stopRenderer();
    this.stopAllItems();
    this.clearMixer();

    this.videoTrack.stop();
    this.audioTrack.stop();

    this.silentSource.disconnect();
    this.silentGain.disconnect();
    this.silentSource.stop();

    this.audioContext.close();
  }

  private stopRenderer() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private stopAllItems() {
    for (const runtime of this.itemRuntimes.values()) {
      runtime.release();
    }
    this.itemRuntimes.clear();
  }

  private getItemAudioSettings(item: SceneItem): ItemAudioSettings {
    const audioCaptureEnabled =
      item.properties.audioCaptureEnabled === undefined
        ? true
        : item.properties.audioCaptureEnabled === true;

    const muted = item.properties.audioMuted === true;

    const rawGain = item.properties.audioGain;
    const gain = typeof rawGain === "number" ? rawGain : DEFAULT_AUDIO_GAIN;

    return {
      audioCaptureEnabled,
      muted,
      gain,
    };
  }

  private async createVideoElementFromNode(
    node: Node,
    item: SceneItem,
  ): Promise<{ key: string; video: HTMLVideoElement; stream: MediaStream }> {
    const key = this.streamCache.getStreamKey(item.nodeTypeId, {
      ...item.properties,
    });

    const video = await node.render(
      item.properties as Parameters<typeof node.render>[0],
      {
        streamCache: this.streamCache,
        project: {
          width: this.canvas.width,
          height: this.canvas.height,
        },
      },
    );

    const stream = video.srcObject;

    if (!(stream instanceof MediaStream)) {
      throw new Error(`Node ${item.nodeTypeId} returned no MediaStream`);
    }

    video.muted = true;
    video.volume = 0;
    video.playsInline = true;

    if (video.readyState < 2) {
      await video.play();
    }

    return {
      key,
      video,
      stream,
    };
  }

  private async syncItemRuntime(item: SceneItem, node: Node) {
    const existing = this.itemRuntimes.get(item.id);

    const nextKey = this.streamCache.getStreamKey(item.nodeTypeId, {
      ...item.properties,
    });

    if (existing && existing.key !== nextKey) {
      this.removeMixerChannel(item.id);
      existing.release();
      this.itemRuntimes.delete(item.id);
    }

    const settings = this.getItemAudioSettings(item);

    const current = this.itemRuntimes.get(item.id);

    if (!current) {
      const created = await this.createVideoElementFromNode(node, item);

      const handle = await this.streamCache.acquireStream(
        created.key,
        async () => created.stream,
      );

      const audioTrack = settings.audioCaptureEnabled
        ? (handle.stream.getAudioTracks()[0] ?? null)
        : null;

      this.itemRuntimes.set(item.id, {
        itemId: item.id,
        key: created.key,
        video: created.video,
        stream: handle.stream,
        audioTrack,
        release: () => {
          handle.release();
        },
      });

      return;
    }

    const currentAudioTrack = current.audioTrack;

    const nextAudioTrack = settings.audioCaptureEnabled
      ? (current.stream.getAudioTracks()[0] ?? null)
      : null;

    if (currentAudioTrack !== nextAudioTrack) {
      current.audioTrack = nextAudioTrack;
    }

    const channel = this.mixerChannels.get(item.id);
    if (channel) {
      channel.audioCaptureEnabled = settings.audioCaptureEnabled;
      channel.muted = settings.muted;
      channel.gain = settings.gain;
    }
  }

  private ensureMixerChannel(itemId: string, audioTrack: MediaStreamTrack) {
    const existing = this.mixerChannels.get(itemId);
    if (existing) {
      if (existing.audioTrackId === audioTrack.id) {
        return;
      }

      this.removeMixerChannel(itemId);
    }

    const stream = new MediaStream([audioTrack]);
    const sourceNode = this.audioContext.createMediaStreamSource(stream);
    const gainNode = this.audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(this.audioDestination);

    this.mixerChannels.set(itemId, {
      audioCaptureEnabled: true,
      muted: false,
      gain: DEFAULT_AUDIO_GAIN,
      audioTrackId: audioTrack.id,
      sourceNode,
      gainNode,
    });
  }

  private removeMixerChannel(itemId: string) {
    const channel = this.mixerChannels.get(itemId);
    if (!channel) {
      return;
    }

    channel.sourceNode.disconnect();
    channel.gainNode.disconnect();
    this.mixerChannels.delete(itemId);
  }

  private clearMixer() {
    for (const itemId of this.mixerChannels.keys()) {
      this.removeMixerChannel(itemId);
    }
  }

  private applyMixerSettings(item: SceneItem, settings: ItemAudioSettings) {
    const channel = this.mixerChannels.get(item.id);
    if (!channel) {
      return;
    }

    if (!settings.audioCaptureEnabled) {
      channel.gainNode.gain.value = 0;
      return;
    }

    channel.gainNode.gain.value = settings.muted ? 0 : settings.gain;
  }

  private drawFrame(items: { item: SceneItem; runtime: ItemRuntime }[]) {
    const ctx = this.canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.fillStyle = "black";

    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const { item, runtime } of items) {
      if (!item.transform) {
        continue;
      }

      const t = item.transform;

      ctx.save();

      ctx.translate(t.x + t.width / 2, t.y + t.height / 2);
      ctx.rotate((t.rotation * Math.PI) / 180);
      ctx.translate(-t.width / 2, -t.height / 2);

      ctx.drawImage(runtime.video, 0, 0, t.width, t.height);

      ctx.restore();
    }
  }

  private scheduleRenderLoop() {
    this.stopRenderer();

    const targetFpsInterval = 1000 / this.fps;

    const tick = (now: number) => {
      this.animationFrameId = requestAnimationFrame(tick);

      if (now - this.lastFrameAt < targetFpsInterval) {
        return;
      }

      this.lastFrameAt = now;

      const items = (this.scene?.items ?? [])
        .map((item: SceneItem) => {
          const runtime = this.itemRuntimes.get(item.id);
          if (!runtime) {
            return null;
          }

          return { item, runtime };
        })
        .filter((entry): entry is { item: SceneItem; runtime: ItemRuntime } =>
          Boolean(entry),
        );

      this.drawFrame(items);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }
}

export function useProgramEngine(options: UseProgramEngineOptions) {
  const fps = options.fps ?? 30;

  const output = shallowRef<ProgramOutput | null>(null);

  const scope = effectScope();

  const sceneValue = computed(() => toValue(options.scene));

  scope.run(() => {
    const engine = new ProgramEngine({
      width: options.project.width,
      height: options.project.height,
      fps,
      nodes: options.nodes,
      streamCache: options.streamCache,
    });

    output.value = engine.getOutput();

    watch(
      sceneValue,
      async (scene) => {
        await engine.setScene(scene);
      },
      { immediate: true },
    );

    onScopeDispose(() => {
      engine.dispose();
    });
  });

  onScopeDispose(() => {
    scope.stop();
  });

  return {
    output: computed(() => output.value),
  };
}
