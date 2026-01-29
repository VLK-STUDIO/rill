<script setup lang="ts">
import type Konva from "konva";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import type { Node, SceneItem, Transform, NodeRenderContext } from "@/lib/core";
import type { PluginContext } from "@/lib/plugins";

const props = defineProps<{
  context: PluginContext;
  item: SceneItem;
  node: Node;
}>();

const emit = defineEmits<{
  select: [node: Konva.Node, itemId: string];
  transform: [transform: Transform];
}>();

const context = props.context;

const videoElement = ref<HTMLVideoElement | null>(null);
const metadataLoaded = ref(false);
let cacheKey: string | null = null;

function createNodeRenderContext(): NodeRenderContext {
  return {
    streamCache: context.media.streamCache,
    project: {
      width: context.project.dimensions.value.width,
      height: context.project.dimensions.value.height,
    },
  };
}

onMounted(async () => {
  cacheKey = context.media.streamCache.getStreamKey(
    props.item.nodeTypeId,
    props.item.properties,
  );

  const media = await props.node.render(
    props.item.properties as Parameters<typeof props.node.render>[0],
    createNodeRenderContext(),
  );

  if (!(media instanceof HTMLVideoElement)) {
    throw new Error("VideoItemRenderer requires a video node");
  }

  videoElement.value = media;

  if (media.readyState >= 1) {
    metadataLoaded.value = true;
  } else {
    media.addEventListener("loadedmetadata", () => {
      metadataLoaded.value = true;
    });
  }
});

onBeforeUnmount(() => {
  if (cacheKey) {
    context.media.streamCache.releaseStream(cacheKey);
    cacheKey = null;
  }
});

const currentTransform = computed(() => {
  if (!videoElement.value || !metadataLoaded.value) return null;

  if (props.item.transform) {
    return props.item.transform;
  }

  return {
    x: 0,
    y: 0,
    width: videoElement.value.videoWidth,
    height: videoElement.value.videoHeight,
    rotation: 0,
  };
});

const imageConfig = computed(() => {
  if (!videoElement.value || !currentTransform.value) return null;

  return {
    image: videoElement.value,
    x: currentTransform.value.x,
    y: currentTransform.value.y,
    width: currentTransform.value.width,
    height: currentTransform.value.height,
    rotation: currentTransform.value.rotation,
    draggable: true,
  };
});

function handleTransformEnd(event: Konva.KonvaEventObject<Event>) {
  const node = event.target;

  const width = node.width() * node.scaleX();
  const height = node.height() * node.scaleY();

  node.scaleX(1);
  node.scaleY(1);

  emit("transform", {
    x: node.x(),
    y: node.y(),
    width,
    height,
    rotation: node.rotation(),
  });
}

function handleSelect(event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
  emit("select", event.target, props.item.id);
}
</script>

<template>
  <v-image
    v-if="imageConfig"
    :config="imageConfig"
    @click="handleSelect"
    @tap="handleSelect"
    @dragend="handleTransformEnd"
    @transformend="handleTransformEnd"
  />
</template>
