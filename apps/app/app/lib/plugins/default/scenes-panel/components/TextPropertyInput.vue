<script setup lang="ts">
import { ref } from "vue";
import type { TextProperty } from "@/lib/core";

defineProps<{
  property: TextProperty;
  value: string;
}>();

const emit = defineEmits<{
  (e: "change", value: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

function handleTextChange(value: string | number | null | undefined) {
  emit("change", String(value ?? ""));
}

function openFilePicker() {
  inputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0] ?? null;
  if (!file) {
    return;
  }

  const url = URL.createObjectURL(file);
  emit("change", url);

  if (target) {
    target.value = "";
  }
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="text-xs font-medium text-muted">
      {{ property.label }}
    </label>
    <div class="flex items-center gap-2">
      <UInput
        :model-value="value"
        size="xs"
        color="neutral"
        :placeholder="property.placeholder"
        class="flex-1"
        @update:model-value="handleTextChange"
      />
      <UButton
        v-if="property.allowFile"
        size="xs"
        color="neutral"
        variant="subtle"
        @click="openFilePicker"
      >
        Choose file
      </UButton>
      <input
        v-if="property.allowFile"
        ref="inputRef"
        type="file"
        :accept="property.accept"
        class="hidden"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>
