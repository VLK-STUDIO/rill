<script setup lang="ts">
import { computed } from "vue";
import type { Node, Scene } from "@/lib/core";
import type { PluginContext } from "@/lib/plugins";
import SceneItemProperties from "./SceneItemProperties.vue";
import SceneItemTransform from "./SceneItemTransform.vue";

const props = defineProps<{
  context: PluginContext;
  scene: Scene;
  nodes: Record<string, Node>;
}>();

const accordionItems = computed(() =>
  props.scene.items.map((item) => {
    const node = props.nodes[item.nodeTypeId];
    return {
      label: item.label,
      icon: node?.icon,
      value: item.id,
      slot: item.id as string,
    };
  }),
);

const items = computed(() =>
  props.scene.items.map((item) => {
    const node = props.nodes[item.nodeTypeId];

    if (!node) {
      throw new Error(`Node with id ${item.nodeTypeId} not found`);
    }

    return {
      ...item,
      node,
    };
  }),
);
</script>

<template>
  <UAccordion
    :items="accordionItems"
    type="single"
    collapsible
    :ui="{
      root: 'space-y-2',
      item: 'border border-[var(--ui-border)] rounded-md overflow-hidden bg-[var(--ui-bg-elevated)]',
      trigger: 'px-2 py-1.5 text-xs rounded-md gap-2 justify-start',
      trailingIcon: 'size-4',
    }"
  >
    <template #leading="{ item }">
      <component :is="item.icon" v-if="item.icon" class="size-4 text-muted" />
    </template>

    <template v-for="item in items" :key="item.id" #[item.id]>
      <SceneItemProperties
        :context="props.context"
        :item-id="item.id"
        :property-values="item.properties"
        :node="item.node"
      />
      <SceneItemTransform
        :context="props.context"
        :item-id="item.id"
        :transform="item.transform"
        :item="item"
        :node="item.node"
      />
    </template>
  </UAccordion>
</template>
