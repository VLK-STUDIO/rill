use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Clone)]
pub struct StreamingState {
  active: Arc<Mutex<bool>>,
}

impl StreamingState {
  pub fn new() -> Self {
    Self {
      active: Arc::new(Mutex::new(false)),
    }
  }

  pub async fn try_acquire(&self) -> bool {
    let mut guard = self.active.lock().await;

    if *guard {
      return false;
    }

    *guard = true;
    true
  }

  pub async fn release(&self) {
    let mut guard = self.active.lock().await;
    *guard = false;
  }
}
