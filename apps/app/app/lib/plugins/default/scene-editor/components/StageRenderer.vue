<script setup lang="ts">
import Konva from "konva";
import { onMounted, onBeforeUnmount, useTemplateRef, computed } from "vue";
import type { Node, Scene, Transform } from "@/lib/core";
import VideoItemRenderer from "./VideoItemRenderer.vue";
import ImageItemRenderer from "./ImageItemRenderer.vue";
import type { PluginContext } from "@/lib/plugins";

const props = defineProps<{
  context: PluginContext;
  scene: Scene;
  nodes: Record<string, Node>;
}>();

const context = props.context;

const stageRef = useTemplateRef<{ getNode: () => Konva.Stage }>("stageRef");
const layerRef = useTemplateRef<{ getNode: () => Konva.Layer }>("layerRef");
const transformerRef = useTemplateRef<{ getNode: () => Konva.Transformer }>(
  "transformerRef",
);
const backgroundRef = useTemplateRef<{ getNode: () => Konva.Rect }>(
  "backgroundRef",
);
const containerRef = useTemplateRef<HTMLDivElement>("containerRef");

let animation: Konva.Animation | null = null;
let resizeObserver: ResizeObserver | null = null;
const nodeToItemIdMap = new Map<Konva.Node, string>();

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== "Backspace" && event.key !== "Delete") {
    return;
  }

  const target = event.target as HTMLElement;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    return;
  }

  event.preventDefault();

  const transformer = transformerRef.value?.getNode();

  if (!transformer) {
    return;
  }

  const selectedNodes = transformer.nodes();

  const selectedNode = selectedNodes[0];

  if (!selectedNode) {
    return;
  }

  const itemId = nodeToItemIdMap.get(selectedNode);

  if (itemId) {
    context.scenes.items.delete(itemId);

    transformer.nodes([]);
  }
}

onMounted(() => {
  const layer = layerRef.value?.getNode();
  const stage = stageRef.value?.getNode();

  if (layer) {
    animation = new Konva.Animation(() => undefined, layer);
    animation.start();
  }

  if (stage && containerRef.value) {
    const updateStageSize = () => {
      if (!containerRef.value) return;

      const containerWidth = containerRef.value.offsetWidth;
      const containerHeight = containerRef.value.offsetHeight;
      const projectWidth = context.project.dimensions.value.width;
      const projectHeight = context.project.dimensions.value.height;

      const scale = Math.min(
        containerWidth / projectWidth,
        containerHeight / projectHeight,
      );

      stage.width(projectWidth);
      stage.height(projectHeight);
      stage.scale({ x: scale, y: scale });

      const stageContainer = stage.container();
      const displayWidth = projectWidth * scale;
      const displayHeight = projectHeight * scale;

      stageContainer.style.width = `${displayWidth}px`;
      stageContainer.style.height = `${displayHeight}px`;
      stageContainer.style.maxWidth = `${displayWidth}px`;
      stageContainer.style.maxHeight = `${displayHeight}px`;
      stageContainer.style.display = "block";
      stageContainer.style.margin = "0";
      stageContainer.style.flexShrink = "0";
    };

    resizeObserver = new ResizeObserver(updateStageSize);
    resizeObserver.observe(containerRef.value);
    updateStageSize();
  }

  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  animation?.stop();
  resizeObserver?.disconnect();
  window.removeEventListener("keydown", handleKeyDown);
  nodeToItemIdMap.clear();
});

function handleNodeSelect(node: Konva.Node, itemId: string) {
  const transformer = transformerRef.value?.getNode();
  if (transformer) {
    transformer.nodes([node]);
    nodeToItemIdMap.set(node, itemId);
  }
}

function handleStageClick(event: Konva.KonvaEventObject<MouseEvent>) {
  const transformer = transformerRef.value?.getNode();
  const stage = stageRef.value?.getNode();
  const background = backgroundRef.value?.getNode();

  if (!(transformer && stage && background)) {
    return;
  }

  const target = event.target;

  if (target === stage || target === background) {
    transformer.nodes([]);
  }
}

function handleItemTransform(itemId: string, transform: Transform) {
  context.scenes.items.updateTransform(itemId, transform);
}

const items = computed(() =>
  props.scene.items.map((item) => {
    const node = props.nodes[item.nodeTypeId];

    if (!node) {
      throw new Error(`Node not found for item ${item.id}`);
    }

    console.log(node);
    return {
      ...item,
      node,
    };
  }),
);
</script>

<template>
  <div
    ref="containerRef"
    class="flex size-full items-center justify-center overflow-hidden"
  >
    <v-stage
      ref="stageRef"
      :config="{
        width: context.project.dimensions.value.width,
        height: context.project.dimensions.value.height,
      }"
      @click="handleStageClick"
    >
      <v-layer ref="layerRef">
        <v-rect
          ref="backgroundRef"
          :config="{
            x: 0,
            y: 0,
            width: context.project.dimensions.value.width,
            height: context.project.dimensions.value.height,
            fill: 'black',
          }"
        />

        <template v-for="item in items" :key="item.id">
          <VideoItemRenderer
            v-if="item.node.type === 'video'"
            :context="context"
            :item="item"
            :node="item.node"
            @select="(node) => handleNodeSelect(node, item.id)"
            @transform="(transform) => handleItemTransform(item.id, transform)"
          />
          <ImageItemRenderer
            v-else-if="item.node.type === 'image'"
            :context="context"
            :item="item"
            :node="item.node"
            @select="(node) => handleNodeSelect(node, item.id)"
            @transform="(transform) => handleItemTransform(item.id, transform)"
          />
        </template>

        <v-transformer ref="transformerRef" />
      </v-layer>
    </v-stage>
  </div>
</template>
