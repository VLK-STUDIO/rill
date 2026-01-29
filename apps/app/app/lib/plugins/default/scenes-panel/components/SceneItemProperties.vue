<script setup lang="ts">
import { computed } from "vue";
import type { Node } from "@/lib/core";
import PropertyInput from "./PropertyInput.vue";
import type { PluginContext } from "@/lib/plugins";

const props = defineProps<{
  context: PluginContext;
  propertyValues: Record<string, unknown>;
  node: Node;
  itemId: string;
}>();

function changeItemProperty(
  itemId: string,
  propertyId: string,
  value: unknown,
) {
  props.context.scenes.items.updateProperty(itemId, propertyId, value);
}

const properties = computed(() =>
  Object.entries(props.node.properties).map(([id, property]) => {
    return {
      ...property,
      id,
      value: props.propertyValues[id],
    };
  }),
);
</script>

<template>
  <div class="space-y-2 p-2">
    <PropertyInput
      v-for="property in properties"
      :key="property.id"
      :property="property"
      @change="(value) => changeItemProperty(props.itemId, property.id, value)"
    />
  </div>
</template>
