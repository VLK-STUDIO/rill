<script setup lang="ts">
import { reactive, watch } from "vue";
import type { Transform, SceneItem, Node, NodeRenderContext } from "@/lib/core";
import type { PluginContext } from "@/lib/plugins";

const props = defineProps<{
  context: PluginContext;
  itemId: string;
  transform: Transform | null;
  item: SceneItem;
  node: Node;
}>();

const context = props.context;

const transform = reactive({
  x: props.transform?.x ?? 0,
  y: props.transform?.y ?? 0,
  width: props.transform?.width ?? 100,
  height: props.transform?.height ?? 100,
  rotation: props.transform?.rotation ?? 0,
});

watch(
  () => props.transform,
  (newTransform) => {
    if (newTransform) {
      transform.x = newTransform.x;
      transform.y = newTransform.y;
      transform.width = newTransform.width;
      transform.height = newTransform.height;
      transform.rotation = newTransform.rotation;
    }
  },
  { immediate: true },
);

function updateTransform() {
  context.scenes.items.updateTransform(props.itemId, {
    x: transform.x,
    y: transform.y,
    width: transform.width,
    height: transform.height,
    rotation: transform.rotation,
  });
}

function createNodeRenderContext(): NodeRenderContext {
  return {
    streamCache: context.media.streamCache,
    project: {
      width: context.project.dimensions.value.width,
      height: context.project.dimensions.value.height,
    },
  };
}

async function getOriginalVideoDimensions(): Promise<{
  width: number;
  height: number;
} | null> {
  if (props.node.type !== "video" && props.node.type !== "image") {
    return null;
  }

  try {
    const media = await props.node.render(
      props.item.properties as Parameters<typeof props.node.render>[0],
      createNodeRenderContext(),
    );

    if (media instanceof HTMLVideoElement) {
      if (media.readyState >= 1) {
        return {
          width: media.videoWidth,
          height: media.videoHeight,
        };
      }

      return new Promise((resolve) => {
        media.addEventListener("loadedmetadata", () => {
          resolve({
            width: media.videoWidth,
            height: media.videoHeight,
          });
        });
      });
    }

    if (media instanceof HTMLImageElement) {
      if (media.complete && media.naturalWidth > 0) {
        return {
          width: media.naturalWidth,
          height: media.naturalHeight,
        };
      }

      return new Promise((resolve) => {
        media.addEventListener("load", () => {
          resolve({
            width: media.naturalWidth,
            height: media.naturalHeight,
          });
        });
      });
    }

    return null;
  } catch (error) {
    console.error("Failed to get video dimensions:", error);
    return null;
  }
}

async function fitToBounds(
  mode: "contain" | "cover" | "stretch" | "center" | "fitWidth" | "fitHeight",
) {
  const originalDims = await getOriginalVideoDimensions();
  if (!originalDims) {
    return;
  }

  const projectWidth = context.project.dimensions.value.width;
  const projectHeight = context.project.dimensions.value.height;
  const originalAspect = originalDims.width / originalDims.height;

  let newWidth: number;
  let newHeight: number;
  let newX: number;
  let newY: number;

  switch (mode) {
    case "contain": {
      const scale = Math.min(
        projectWidth / originalDims.width,
        projectHeight / originalDims.height,
      );
      newWidth = originalDims.width * scale;
      newHeight = originalDims.height * scale;
      newX = (projectWidth - newWidth) / 2;
      newY = (projectHeight - newHeight) / 2;
      break;
    }
    case "cover": {
      const scale = Math.max(
        projectWidth / originalDims.width,
        projectHeight / originalDims.height,
      );
      newWidth = originalDims.width * scale;
      newHeight = originalDims.height * scale;
      newX = (projectWidth - newWidth) / 2;
      newY = (projectHeight - newHeight) / 2;
      break;
    }
    case "stretch": {
      newWidth = projectWidth;
      newHeight = projectHeight;
      newX = 0;
      newY = 0;
      break;
    }
    case "center": {
      newWidth = transform.width;
      newHeight = transform.height;
      newX = (projectWidth - newWidth) / 2;
      newY = (projectHeight - newHeight) / 2;
      break;
    }
    case "fitWidth": {
      newWidth = projectWidth;
      newHeight = projectWidth / originalAspect;
      newX = 0;
      newY = (projectHeight - newHeight) / 2;
      break;
    }
    case "fitHeight": {
      newWidth = projectHeight * originalAspect;
      newHeight = projectHeight;
      newX = (projectWidth - newWidth) / 2;
      newY = 0;
      break;
    }
  }

  context.scenes.items.updateTransform(props.itemId, {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
    rotation: transform.rotation,
  });
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 border-t border-default">
    <div class="flex flex-col gap-2">
      <div class="text-xs font-semibold text-muted">Transform</div>

      <div class="flex flex-col gap-2">
        <UFormField label="X" size="xs" orientation="horizontal">
          <UInputNumber
            v-model="transform.x"
            size="xs"
            orientation="vertical"
            color="neutral"
            @update:model-value="updateTransform"
          />
        </UFormField>

        <UFormField label="Y" size="xs" orientation="horizontal">
          <UInputNumber
            v-model="transform.y"
            size="xs"
            orientation="vertical"
            color="neutral"
            @update:model-value="updateTransform"
          />
        </UFormField>

        <UFormField label="Width" size="xs" orientation="horizontal">
          <UInputNumber
            v-model="transform.width"
            size="xs"
            orientation="vertical"
            :min="1"
            color="neutral"
            @update:model-value="updateTransform"
          />
        </UFormField>

        <UFormField label="Height" size="xs" orientation="horizontal">
          <UInputNumber
            v-model="transform.height"
            size="xs"
            orientation="vertical"
            :min="1"
            color="neutral"
            @update:model-value="updateTransform"
          />
        </UFormField>

        <UFormField size="xs" label="Rotation" orientation="horizontal">
          <UInputNumber
            v-model="transform.rotation"
            size="xs"
            orientation="vertical"
            color="neutral"
            :format-options="{
              style: 'unit',
              unit: 'degree',
            }"
            :min="-180"
            :max="180"
            @update:model-value="updateTransform"
          />
        </UFormField>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <UFieldGroup size="xs" orientation="horizontal">
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-material-symbols:fit-page-width"
          block
          @click="fitToBounds('contain')"
        >
          Fit
        </UButton>
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-material-symbols:fit-screen"
          block
          @click="fitToBounds('cover')"
        >
          Cover
        </UButton>
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-mdi:stretch-to-page"
          class="grow"
          block
          @click="fitToBounds('stretch')"
        >
          Stretch
        </UButton>
      </UFieldGroup>
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-material-symbols:center-focus-weak-rounded"
        block
        @click="fitToBounds('center')"
      >
        Center
      </UButton>
    </div>
  </div>
</template>
