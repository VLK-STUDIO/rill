<script setup lang="ts">
import { computed } from "vue";
import type { PluginContext } from "@/lib/plugins";
import type { Scene } from "@/lib/core";
import SceneItemsList from "./SceneItemsList.vue";
import AddSceneItemDropdown from "./AddSceneItemDropdown.vue";
import DeleteSceneButton from "./DeleteSceneButton.vue";
import {
  EditableArea,
  EditableInput,
  EditablePreview,
  EditableRoot,
} from "reka-ui";

const props = defineProps<{
  context: PluginContext;
}>();

const activeScene = computed({
  get: () =>
    props.context.editor.currentScene.value?.id
      ? props.context.editor.currentScene.value.id
      : undefined,
  set: (value: string | undefined) => {
    if (value !== undefined) {
      props.context.editor.setCurrentScene(value);
    } else {
      props.context.editor.clearCurrentScene();
    }
  },
});

interface AccordionSceneItem {
  label: string;
  value: string;
  scene: Scene;
}

const accordionItems = computed<AccordionSceneItem[]>(() =>
  props.context.scenes.list().map((scene) => ({
    label: scene.label,
    value: scene.id,
    scene,
  })),
);

function handleDeleteScene(sceneId: string) {
  props.context.scenes.delete(sceneId);
  if (props.context.editor.currentScene.value?.id === sceneId) {
    props.context.editor.clearCurrentScene();
  }
}

function handleRename(sceneId: string, value: string | null | undefined) {
  if (!value) {
    return;
  }

  props.context.scenes.updateLabel(sceneId, value);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <UButton
      variant="subtle"
      size="sm"
      block
      icon="i-heroicons-plus"
      @click="props.context.scenes.create"
    >
      Add scene
    </UButton>

    <UAccordion
      v-model="activeScene"
      :items="accordionItems"
      :collapsible="false"
      :ui="{
        root: 'space-y-2',
        trigger:
          'text-xs py-1.5 px-2 border-b border-transparent rounded-lg data-[state=open]:border-default',
        item: 'border hover:border-accented rounded-lg overflow-hidden last:border data-[state=open]:border-muted',
        trailingIcon: 'size-4',
        label: 'grow',
        body: 'p-0',
      }"
    >
      <template #default="{ item, open }">
        <EditableRoot
          v-if="open"
          :default-value="item.label"
          activation-mode="dblclick"
          @submit="(value) => handleRename(item.scene.id, value)"
        >
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </EditableRoot>
        <div v-else>
          {{ item.label }}
        </div>
      </template>
      <template #body="{ item }">
        <div class="flex flex-col">
          <div class="p-2 flex flex-col gap-2">
            <AddSceneItemDropdown :context="props.context" />
            <SceneItemsList
              :context="props.context"
              :scene="item.scene"
              :nodes="props.context.nodes"
            />
          </div>
          <div class="border-t border-default flex justify-end p-1 px-2">
            <DeleteSceneButton
              :scene="item.scene"
              @delete="handleDeleteScene(item.scene.id)"
            />
          </div>
        </div>
      </template>
      <template #trailing="{ open }">
        <UBadge v-if="open" variant="subtle" size="sm">Active</UBadge>
        <div v-else class="h-5" />
      </template>
    </UAccordion>
  </div>
</template>
