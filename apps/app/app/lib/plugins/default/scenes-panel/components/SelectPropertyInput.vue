<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { SelectProperty } from "@/lib/core";

const props = defineProps<{
  property: SelectProperty;
  value: string;
}>();

const emit = defineEmits<{
  (e: "change", value: unknown): void;
}>();

const selectedValue = ref<string | undefined>(props.value);

const options = ref<{ label: string; value: string }[]>([]);

const isLoading = ref(true);

onMounted(async () => {
  const result = await props.property.options();

  options.value = result.options;

  isLoading.value = false;
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs font-medium text-muted">
      {{ property.label }}
    </label>
    <USelect
      v-model="selectedValue"
      :items="options"
      :loading="isLoading"
      :placeholder="`Select ${property.label.toLowerCase()}...`"
      value-key="value"
      size="xs"
      arrow
      :content="{
        sideOffset: 0.2,
      }"
      @update:model-value="(value) => emit('change', value)"
    />
  </div>
</template>
