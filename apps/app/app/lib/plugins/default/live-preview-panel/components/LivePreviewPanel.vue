<script setup lang="ts">
import { computed } from "vue";
import type { PluginContext } from "@/lib/plugins";
import { useProgramEngine } from "@/lib/media";

const props = defineProps<{
  context: PluginContext;
}>();

const project = props.context.project.dimensions.value;

const output = useProgramEngine({
  scene: computed(() => props.context.program.currentScene.value),
  nodes: props.context.nodes,
  project,
  streamCache: props.context.media.streamCache,
  fps: 30,
}).output;
</script>

<template>
  <video
    v-if="output"
    :srcObject="output.stream"
    autoplay
    muted
    playsinline
    class="h-full min-h-0"
  />
</template>
