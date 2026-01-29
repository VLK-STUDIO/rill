use std::process::Stdio;

use tokio::{
  io::AsyncWriteExt,
  process::{ChildStdin, Command},
  task::JoinHandle,
};

pub struct FfmpegSession {
  stdin: ChildStdin,
  stderr_task: JoinHandle<()>,
  exit_task: JoinHandle<()>,
}

impl FfmpegSession {
  pub fn spawn(rtmp_url: String) -> Result<Self, String> {
    let mut cmd = Command::new("ffmpeg");

    cmd
      .arg("-re")
      .arg("-f")
      .arg("mp4")
      .arg("-i")
      .arg("pipe:0")
      .arg("-c:v")
      .arg("copy")
      .arg("-c:a")
      .arg("copy")
      .arg("-f")
      .arg("flv")
      .arg(rtmp_url)
      .stdin(Stdio::piped())
      .stdout(Stdio::null())
      .stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| format!("Failed to spawn ffmpeg: {e}"))?;

    let stdin = child
      .stdin
      .take()
      .ok_or_else(|| "Failed to open ffmpeg stdin".to_string())?;

    let stderr = child
      .stderr
      .take()
      .ok_or_else(|| "Failed to open ffmpeg stderr".to_string())?;

    let stderr_task = tokio::spawn(async move {
      use tokio::io::{AsyncBufReadExt, BufReader};
      let mut lines = BufReader::new(stderr).lines();

      while let Ok(Some(line)) = lines.next_line().await {
        log::info!("[ffmpeg] {line}");
      }
    });

    let mut child_for_exit = child;
    let exit_task = tokio::spawn(async move {
      match child_for_exit.wait().await {
        Ok(status) => log::warn!("ffmpeg exited with status: {status}"),
        Err(err) => log::error!("ffmpeg wait error: {err}"),
      }
    });

    Ok(Self {
      stdin,
      stderr_task,
      exit_task,
    })
  }

  pub async fn write(&mut self, bytes: &[u8]) -> Result<(), String> {
    self
      .stdin
      .write_all(bytes)
      .await
      .map_err(|e| format!("Failed to write to ffmpeg stdin: {e}"))
  }

  pub async fn shutdown(mut self) {
    let _ = self.stdin.shutdown().await;

    if tokio::time::timeout(std::time::Duration::from_secs(2), &mut self.exit_task)
      .await
      .is_err()
    {
      self.exit_task.abort();
    }

    self.stderr_task.abort();
  }
}
