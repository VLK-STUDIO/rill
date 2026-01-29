export interface MediaRecorderWebSocketSinkOptions {
  stream: MediaStream;
  url: string;
  timesliceMs?: number;
}

export type MediaRecorderState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "streaming" }
  | { status: "error"; message: string };

const DEFAULT_MIME_TYPES = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4"];

export function pickMp4MimeType(): string {
  for (const mimeType of DEFAULT_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  throw new Error("No supported MP4 MediaRecorder mimeType found");
}

export class MediaRecorderWebSocketSink {
  private ws: WebSocket | null = null;
  private recorder: MediaRecorder | null = null;
  private mimeType: string | null = null;

  constructor(private options: MediaRecorderWebSocketSinkOptions) {}

  start() {
    if (this.ws || this.recorder) {
      throw new Error("Sink already started");
    }

    this.mimeType = pickMp4MimeType();

    this.ws = new WebSocket(`ws://localhost:6009/live?rtmp_url=${encodeURIComponent(this.options.url)}`);

    this.ws.binaryType = "arraybuffer";

    const recorder = new MediaRecorder(this.options.stream, {
      mimeType: this.mimeType,
      videoBitsPerSecond: 4_500_000,
      audioBitsPerSecond: 128_000,
    });

    recorder.addEventListener("error", (event) => {
      console.error("MediaRecorder error", event);
    });

    this.recorder = recorder;

    let sawNonEmptyChunk = false;

    recorder.addEventListener("dataavailable", async (event) => {
      if (!(this.ws && this.ws.readyState === WebSocket.OPEN)) {
        return;
      }

      if (!event.data || event.data.size === 0) {
        if (!sawNonEmptyChunk) {
          console.warn(
            "MediaRecorder produced empty chunk; mimeType:",
            recorder.mimeType,
          );
        }

        return;
      }

      sawNonEmptyChunk = true;

      this.ws.send(event.data);
    });

    recorder.addEventListener("stop", () => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    });

    this.ws.addEventListener("open", () => {
      console.log(
        this.options.stream.getTracks().map((t) => [t.kind, t.readyState]),
      );

      const timesliceMs = this.options.timesliceMs ?? 50;

      recorder.start(timesliceMs);
    });

    this.ws.addEventListener("close", () => {
      if (this.recorder && this.recorder.state !== "inactive") {
        this.recorder.stop();
      }
    });

    this.ws.addEventListener("error", () => {
      if (this.recorder && this.recorder.state !== "inactive") {
        this.recorder.stop();
      }
    });
  }

  stop() {
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.stop();
    }

    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
    }

    this.ws = null;
    this.recorder = null;
  }
}
