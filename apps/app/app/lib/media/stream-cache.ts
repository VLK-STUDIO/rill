interface CachedStream {
  stream: MediaStream;
  refCount: number;
  releaseTimeoutId: ReturnType<typeof setTimeout> | null;
}

export interface StreamHandle {
  stream: MediaStream;
  release: () => void;
}

export class StreamCache {
  private cache = new Map<string, CachedStream>();

  constructor(private lingerMs = 1000) {}

  getStreamKey(
    nodeTypeId: string,
    properties: Record<string, unknown>,
  ): string {
    if (nodeTypeId === "screen_capture") {
      const audio = properties.audio ?? "false";
      return `screen_capture:audio=${audio}`;
    }

    if (nodeTypeId === "camera_feed") {
      const deviceId = properties.deviceId ?? "";
      return `camera_feed:deviceId=${deviceId}`;
    }

    return `${nodeTypeId}:${JSON.stringify(properties)}`;
  }

  async getOrCreateStream(
    key: string,
    factory: () => Promise<MediaStream>,
  ): Promise<MediaStream> {
    const cached = this.cache.get(key);

    if (cached) {
      if (cached.releaseTimeoutId) {
        clearTimeout(cached.releaseTimeoutId);
        cached.releaseTimeoutId = null;
      }

      cached.refCount++;
      this.setupStreamCleanup(key, cached.stream);
      return cached.stream;
    }

    const stream = await factory();

    this.cache.set(key, {
      stream,
      refCount: 1,
      releaseTimeoutId: null,
    });

    this.setupStreamCleanup(key, stream);

    return stream;
  }

  async acquireStream(
    key: string,
    factory: () => Promise<MediaStream>,
  ): Promise<StreamHandle> {
    const stream = await this.getOrCreateStream(key, factory);

    return {
      stream,
      release: () => this.releaseStream(key),
    };
  }

  releaseStream(key: string): void {
    const cached = this.cache.get(key);
    if (!cached) {
      return;
    }

    cached.refCount--;

    if (cached.refCount > 0) {
      return;
    }

    if (cached.releaseTimeoutId) {
      clearTimeout(cached.releaseTimeoutId);
    }

    cached.releaseTimeoutId = setTimeout(() => {
      const latest = this.cache.get(key);

      if (!latest || latest !== cached) {
        return;
      }

      if (latest.refCount > 0) {
        return;
      }

      latest.stream.getTracks().forEach((track) => track.stop());
      this.cache.delete(key);
    }, this.lingerMs);
  }

  private setupStreamCleanup(key: string, stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.addEventListener(
        "ended",
        () => {
          const cached = this.cache.get(key);
          if (cached && cached.stream === stream) {
            this.cache.delete(key);
          }
        },
        { once: true },
      );
    });
  }

  cleanup(): void {
    for (const [key, cached] of this.cache.entries()) {
      if (cached.releaseTimeoutId) {
        clearTimeout(cached.releaseTimeoutId);
      }

      cached.stream.getTracks().forEach((track) => track.stop());
      this.cache.delete(key);
    }
  }
}

export const streamCache = new StreamCache();
