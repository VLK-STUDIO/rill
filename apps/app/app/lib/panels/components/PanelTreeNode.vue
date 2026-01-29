<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from "reka-ui";
import { computed } from "vue";
import type { PluginContext, Panel } from "@/lib/plugins";
import type { PanelTreeNode } from "../types";
import PanelNodeRenderer from "./PanelNodeRenderer.vue";

const props = defineProps<{
  orientation: "horizontal" | "vertical";
  path: number[];
  context: PluginContext;
  registeredPanels: Record<string, Panel>;
  node: PanelTreeNode;
}>();

const depth = computed(() => props.path.length);

const index = computed(() =>
  depth.value > 0 ? props.path[depth.value - 1] : 0,
);

const emit = defineEmits<{
  (e: "split", path: number[], orientation: "horizontal" | "vertical"): void;
  (e: "delete", path: number[]): void;
  (e: "change-panel-type", path: number[], panelTypeId: string): void;
}>();

const children = computed(() =>
  props.node.children.map((child, index) => ({
    id: `${depth.value + 1}-${index}`,
    path: [...props.path, index],
    context: props.context,
    node: child,
    registeredPanels: props.registeredPanels,
    last: index === props.node.children.length - 1,
  })),
);
</script>

<template>
  <SplitterGroup
    :id="`panel-splitter-${depth}-${index}`"
    :direction="props.orientation"
  >
    <template v-for="child in children" :key="child.id">
      <SplitterPanel :id="child.id" :default-size="child.node.size">
        <PanelNodeRenderer
          :context="child.context"
          :node="child.node"
          :registered-panels="child.registeredPanels"
          :path="child.path"
          @split="(path, orientation) => emit('split', path, orientation)"
          @delete="(path) => emit('delete', path)"
          @change-panel-type="
            (path, panelTypeId) => emit('change-panel-type', path, panelTypeId)
          "
        />
      </SplitterPanel>
      <SplitterResizeHandle
        v-if="!child.last"
        :id="`${child.id}-resize-handle`"
        :class="[
          'bg-inverted/20 hover:bg-accented z-20 ',
          props.orientation === 'horizontal' ? 'w-px' : 'h-px',
        ]"
      />
    </template>
  </SplitterGroup>
</template>
