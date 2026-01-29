> [!WARNING]
> Rill is just starting to form. This is mostly a proof-of-concept and is not yet ready for public use. We appreciate you tinkering with it and providing feedback, but please be aware that it may be unstable and lack many features.

---

# Rill Studio

Rill is a hackable broadcasting app powered by web technologies. It is designed with extensibility as its core principle, with a plugin system that allows developers to create and share new nodes, UI panels, and other features.

## Features

- Live broadcasting to YouTube/Twitch/Custom RTMP
- Support for camera feeds, mic audio, screen sharing and images
- Dynamic plugin-driven UI
- Extension-based core

## Local development

1. Clone the repo
2. Run `bun install` to install dependencies
3. `cd` into the `apps/app` folder
4. Copy `.env.example` to `.env` and fill in a valid RTMP URL for streaming
5. Run `bunx tauri dev` to start the app in development mode
