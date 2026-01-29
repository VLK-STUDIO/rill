<script setup lang="ts">
import { computed, watch } from "vue";
import type { PluginContext } from "@/lib/plugins";
import { useLiveStreamingSession, useProgramEngine } from "@/lib/media";

const props = defineProps<{
  context: PluginContext;
}>();

const session = useLiveStreamingSession();

const project = props.context.project.dimensions.value;

const output = useProgramEngine({
  scene: computed(() => props.context.program.currentScene.value),
  nodes: props.context.nodes,
  project,
  streamCache: props.context.media.streamCache,
  fps: 30,
}).output;

watch(
  output,
  (next) => {
    session.setStream(next?.stream ?? null);
  },
  { deep: false },
);

function start() {
  if (!output.value) {
    return;
  }

  session.start(output.value.stream);
}

function stop() {
  session.stop();
}

function transition() {
  const editedScene = props.context.editor.currentScene.value;

  if (!editedScene) {
    return;
  }

  props.context.program.transitionToScene(editedScene);
}
</script>

<template>
  <div class="flex flex-col gap-2 h-full">
    <UButton
      trailing-icon="i-heroicons-arrows-up-down"
      block
      color="neutral"
      variant="subtle"
      :disabled="!props.context.editor.currentScene.value"
      @click="transition"
    >
      Transition
    </UButton>

    <UButton
      v-if="!session.isStreaming.value"
      trailing-icon="i-heroicons-play"
      block
      :disabled="!output"
      class="grow"
      size="xl"
      @click="start"
    >
      Go live
    </UButton>
    <UButton
      v-else
      color="error"
      trailing-icon="i-heroicons-stop"
      block
      class="grow"
      size="xl"
      @click="stop"
    >
      Stop streaming
    </UButton>

    <UButton
      trailing-icon="i-heroicons-play-circle"
      color="error"
      disabled
      size="xl"
      class="grow"
      block
    >
      Start recording</UButton
    >
  </div>
</template>
