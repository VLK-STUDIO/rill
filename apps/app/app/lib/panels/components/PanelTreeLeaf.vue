<script setup lang="ts">
import { computed, markRaw } from "vue";
import type { PluginContext, Panel } from "@/lib/plugins";
import type { PanelTreeLeaf } from "../types";

const props = defineProps<{
  registeredPanels: Record<string, Panel>;
  node: PanelTreeLeaf;
  context: PluginContext;
  path: number[];
}>();

const emit = defineEmits<{
  (e: "split", path: number[], orientation: "horizontal" | "vertical"): void;
  (e: "delete", path: number[]): void;
  (e: "change-panel-type", path: number[], panelTypeId: string): void;
}>();

const panelInfo = computed(() => {
  const info = props.registeredPanels[props.node.panelTypeId];

  if (!info) {
    throw new Error(
      `Panel component for panel type ${props.node.panelTypeId} not found`,
    );
  }

  return info;
});

const dropdownItems = computed(() => {
  return [
    Object.entries(props.registeredPanels).map(([panelTypeId, panel]) => ({
      label: panel.label,
      icon: panel.icon,
      onSelect: () => emit("change-panel-type", props.path, panelTypeId),
    })),
  ];
});

const Component = computed(() => markRaw(panelInfo.value.component));
</script>

<template>
  <section className="relative flex h-full overflow-y-auto flex-col gap-1 p-2">
    <UDropdownMenu :items="dropdownItems" size="xs" arrow>
      <UButton
        variant="link"
        size="xs"
        color="neutral"
        class="font-medium text-muted text-xs justify-start w-fit h-auto p-0 z-10"
        trailing-icon="i-heroicons-chevron-down"
      >
        <span v-if="!panelInfo?.hideLabel">{{ panelInfo.label }}</span>
      </UButton>
    </UDropdownMenu>

    <component
      :is="Component"
      :key="props.node.panelTypeId"
      :context="props.context"
    />

    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        className="absolute top-1/2 -translate-y-1/2 py-4 gap-1 pointer-events-auto right-1 flex flex-col justify-center opacity-10 hover:opacity-100"
      >
        <button
          className="text-default/20 hover:text-default leading-0"
          type="button"
          @click="emit('split', props.path, 'horizontal')"
        >
          <UIcon name="i-heroicons-divide" class="size-4 rotate-90" />
        </button>
        <button
          className="text-default/20 hover:text-default leading-0"
          type="button"
          @click="emit('delete', props.path)"
        >
          <UIcon name="i-heroicons-x-mark" class="size-4" />
        </button>
      </div>
      <div
        className="pointer-events-auto px-4 absolute bottom-1 left-1/2 -translate-x-1/2 text-default/20 hover:text-default opacity-10 hover:opacity-100"
      >
        <button
          className="leading-0 text-default/20 hover:text-default"
          type="button"
          @click="emit('split', props.path, 'vertical')"
        >
          <UIcon name="i-heroicons-divide" class="size-4" />
        </button>
      </div>
    </div>
  </section>
</template>
