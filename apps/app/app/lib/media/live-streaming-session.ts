import { computed, readonly, ref, type ComputedRef, type Ref } from "vue";
import { MediaRecorderWebSocketSink } from "./ws-mediarecorder-sink";
import { useRuntimeConfig } from "#app";

type LiveStreamingSession = {
  isStreaming: ComputedRef<boolean>;
  error: Readonly<Ref<string | null>>;
  setStream: (stream: MediaStream | null) => void;
  start: (stream?: MediaStream) => void;
  stop: () => void;
};

let session: LiveStreamingSession | null = null;

export function useLiveStreamingSession(): LiveStreamingSession {
  const config = useRuntimeConfig();

  if (session) {
    return session;
  }

  const error = ref<string | null>(null);
  const stream = ref<MediaStream | null>(null);
  const sink = ref<MediaRecorderWebSocketSink | null>(null);

  const isStreaming = computed(() => sink.value !== null);

  function stop() {
    if (sink.value) {
      sink.value.stop();
      sink.value = null;
    }
  }

  function start(nextStream?: MediaStream) {
    const currentStream = nextStream ?? stream.value;

    if (!currentStream) {
      error.value = "No program output";
      return;
    }

    error.value = null;

    stop();

    sink.value = new MediaRecorderWebSocketSink({
      stream: currentStream,
      url: config.public.rtmpUrl,
      timesliceMs: 75,
    });

    sink.value.start();
  }

  function setStream(next: MediaStream | null) {
    stream.value = next;

    if (!isStreaming.value) {
      return;
    }

    if (!stream.value) {
      stop();
      error.value = "No program output";
      return;
    }

    start();
  }

  session = {
    isStreaming,
    error: readonly(error),
    setStream,
    start,
    stop,
  };

  return session;
}
