<script setup lang="ts">
import type { Property } from "@/lib/core";
import SelectPropertyInput from "./SelectPropertyInput.vue";
import TextPropertyInput from "./TextPropertyInput.vue";

defineProps<{
  property: Property & { value: unknown };
}>();

const emit = defineEmits<{
  (e: "change", value: unknown): void;
}>();
</script>

<template>
  <SelectPropertyInput
    v-if="property.type === 'select'"
    :property="property"
    :value="property.value as string"
    @change="(value) => emit('change', value)"
  />
  <TextPropertyInput
    v-else-if="property.type === 'text'"
    :property="property"
    :value="property.value as string"
    @change="(value) => emit('change', value)"
  />
</template>
