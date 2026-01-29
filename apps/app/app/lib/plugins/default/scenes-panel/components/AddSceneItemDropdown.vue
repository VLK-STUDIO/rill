<script setup lang="ts">
import { computed } from "vue";
import type { PluginContext } from "@/lib/plugins";

const props = defineProps<{
  context: PluginContext;
}>();

const items = computed(() => {
  return [
    Object.entries(props.context.nodes).map(([nodeTypeId, node]) => ({
      label: node.label,
      icon: node.icon,
      onSelect: () => props.context.scenes.items.add(nodeTypeId),
    })),
  ];
});
</script>

<template>
  <UDropdownMenu :items="items" size="sm" arrow>
    <UButton
      variant="subtle"
      size="sm"
      color="neutral"
      block
      icon="i-heroicons-plus"
    >
      Add item
    </UButton>
  </UDropdownMenu>
</template>
