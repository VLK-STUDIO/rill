use axum::{
  extract::{ws::Message, Query, State, WebSocketUpgrade},
  response::IntoResponse,
  routing::get,
  Router,
};
use futures_util::StreamExt;
use std::{
  net::SocketAddr,
  sync::{
    atomic::{AtomicU64, Ordering},
    Arc,
  },
};

use super::{ffmpeg::FfmpegSession, state::StreamingState};

#[derive(serde::Deserialize)]
struct LiveStreamQuery {
  rtmp_url: String,
}

pub async fn run_server(state: StreamingState) -> Result<(), String> {
  let app = Router::new()
    .route("/live", get(handle_ws))
    .with_state(state);

  let addr: SocketAddr = ([127, 0, 0, 1], 6009).into();

  log::info!("WS relay listening on ws://{addr}/live");

  let listener = tokio::net::TcpListener::bind(addr)
    .await
    .map_err(|e| format!("Failed to bind WS server: {e}"))?;

  axum::serve(listener, app)
    .await
    .map_err(|e| format!("WS server error: {e}"))
}

async fn handle_ws(
  ws: WebSocketUpgrade,
  State(state): State<StreamingState>,
  Query(query): Query<LiveStreamQuery>,
) -> impl IntoResponse {
  ws.on_upgrade(move |socket| handle_socket(socket, state, query.rtmp_url))
}

async fn handle_socket(
  mut socket: axum::extract::ws::WebSocket,
  state: StreamingState,
  rtmp_url: String,
) {
  if rtmp_url.trim().is_empty() {
    let _ = socket
      .send(Message::Close(Some(axum::extract::ws::CloseFrame {
        code: axum::extract::ws::close_code::POLICY,
        reason: "Missing rtmp_url".into(),
      })))
      .await;

    return;
  }

  if !state.try_acquire().await {
    let _ = socket
      .send(Message::Close(Some(axum::extract::ws::CloseFrame {
        code: axum::extract::ws::close_code::POLICY,
        reason: "Only one active stream allowed".into(),
      })))
      .await;

    return;
  }

  log::info!("WS client connected");

  let bytes_total = Arc::new(AtomicU64::new(0));
  let bytes_total_for_task = Arc::clone(&bytes_total);

  let metrics_task = tokio::spawn(async move {
    let mut prev_total = 0u64;

    loop {
      tokio::time::sleep(std::time::Duration::from_secs(1)).await;

      let total = bytes_total_for_task.load(Ordering::Relaxed);
      let delta = total.saturating_sub(prev_total);
      prev_total = total;

      log::info!("WS throughput: {} B/s", delta);
    }
  });

  let mut ffmpeg = match FfmpegSession::spawn(rtmp_url) {
    Ok(session) => session,
    Err(err) => {
      log::error!("{err}");
      state.release().await;
      return;
    }
  };

  while let Some(msg) = socket.next().await {
    let msg = match msg {
      Ok(m) => m,
      Err(e) => {
        log::info!("WS receive error: {e}");
        break;
      }
    };

    match msg {
      Message::Binary(data) => {
        bytes_total.fetch_add(data.len() as u64, Ordering::Relaxed);

        if let Err(e) = ffmpeg.write(&data).await {
          log::info!("{e}");
          break;
        }
      }
      Message::Close(_) => break,
      _ => {}
    }
  }

  log::info!("WS client disconnected");

  metrics_task.abort();
  ffmpeg.shutdown().await;
  state.release().await;
}
