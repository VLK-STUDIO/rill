<script setup lang="ts">
import { computed } from "vue";

const isRecording = computed(() => false);
const durationSeconds = computed(() => 0);

const formattedDuration = computed(() => {
  const minutes = Math.floor(durationSeconds.value / 60);
  const seconds = durationSeconds.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const formattedFileSize = computed(() => {
  const secondsElapsed = durationSeconds.value;
  const bytes = (2000000 / 8) * secondsElapsed;
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});
</script>

<template>
  <footer
    class="border-t border-default gap-4 flex items-center justify-start px-3 py-1.5 text-xs tabular-nums"
  >
    <span class="text-muted/30"> Rill v0.0.1 </span>

    <span class="text-muted">
      Status:
      <span :class="isRecording ? 'text-red-500' : ''">
        {{
          isRecording
            ? `Recording (${formattedDuration}, ${formattedFileSize})`
            : "Idle"
        }}
      </span>
    </span>
  </footer>
</template>
