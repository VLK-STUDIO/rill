<script setup lang="ts">
import type { Scene } from "@/lib/core";

const props = defineProps<{
  scene: Scene;
}>();

const emit = defineEmits<{
  (e: "delete"): void;
}>();

function handleDelete() {
  emit("delete");
}
</script>

<template>
  <UModal title="Delete Scene" :ui="{ footer: 'justify-end' }">
    <UButton
      variant="ghost"
      size="xs"
      color="error"
      square
      icon="i-heroicons-trash"
    />
    <template #body>
      <p class="text-sm text-muted">
        Are you sure you want to delete "{{ props.scene.label }}"?
      </p>
    </template>
    <template #footer="{ close }">
      <UButton variant="subtle" color="neutral" @click="close">
        Cancel
      </UButton>
      <UButton
        color="error"
        icon="i-heroicons-trash"
        @click="
          () => {
            handleDelete();
            close();
          }
        "
      >
        Delete
      </UButton>
    </template>
  </UModal>
</template>
