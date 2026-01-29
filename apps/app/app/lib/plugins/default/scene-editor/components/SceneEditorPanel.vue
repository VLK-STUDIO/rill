<script setup lang="ts">
import type { PluginContext } from "@/lib/plugins";
import { computed } from "vue";
import StageRenderer from "./StageRenderer.vue";

const props = defineProps<{
  context: PluginContext;
}>();

const scene = computed(() => props.context.editor.currentScene.value);
</script>

<template>
  <div
    v-if="!scene"
    class="flex size-full flex-col items-center justify-center gap-1 text-center"
  >
    <h3 class="font-medium text-lg">Select a scene to edit</h3>
    <p class="max-w-sm text-pretty text-sm text-muted">
      You can select a scene to start editing by clicking on it in the scenes
      panel.
    </p>
  </div>

  <div
    v-else
    class="absolute h-full inset-0 bg-muted flex flex-col justify-center items-center overflow-hidden w-full"
  >
    <StageRenderer
      :context="props.context"
      :nodes="context.nodes"
      :scene="scene"
    />
  </div>
</template>
