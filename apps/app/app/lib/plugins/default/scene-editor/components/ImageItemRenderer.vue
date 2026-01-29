<script setup lang="ts">
import type Konva from "konva";
import { ref, onMounted, computed } from "vue";
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

const imageElement = ref<HTMLImageElement | null>(null);
const metadataLoaded = ref(false);

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
  console.log("ImageItemRenderer mounted");

  const image = await props.node.render(
    props.item.properties as Parameters<typeof props.node.render>[0],
    createNodeRenderContext(),
  );

  console.log("ImageItemRenderer rendered");

  if (!(image instanceof HTMLImageElement)) {
    throw new Error("ImageItemRenderer requires an image node");
  }

  console.log("ImageItemRenderer got image element");

  imageElement.value = image;

  if (image.complete && image.naturalWidth > 0) {
    metadataLoaded.value = true;
  } else {
    image.addEventListener("load", () => {
      metadataLoaded.value = true;
    });
  }
});

const currentTransform = computed(() => {
  if (!imageElement.value || !metadataLoaded.value) return null;

  if (props.item.transform) {
    return props.item.transform;
  }

  return {
    x: 0,
    y: 0,
    width: imageElement.value.naturalWidth,
    height: imageElement.value.naturalHeight,
    rotation: 0,
  };
});

const imageConfig = computed(() => {
  if (!imageElement.value || !currentTransform.value) return null;

  return {
    image: imageElement.value,
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
