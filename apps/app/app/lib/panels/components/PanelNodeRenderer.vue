<script setup lang="ts">
import { computed } from "vue";
import type { PluginContext, Panel } from "@/lib/plugins";
import type { PanelTreeItem } from "../types";
import PanelItem from "./PanelTreeLeaf.vue";
import PanelTreeNode from "./PanelTreeNode.vue";

const props = defineProps<{
  context: PluginContext;
  node: PanelTreeItem;
  registeredPanels: Record<string, Panel>;
  path: number[];
}>();

const emit = defineEmits<{
  (e: "split", path: number[], orientation: "horizontal" | "vertical"): void;
  (e: "delete", path: number[]): void;
  (e: "change-panel-type", path: number[], panelTypeId: string): void;
}>();

const depth = computed(() => props.path.length);
const index = computed(() =>
  depth.value > 0 ? props.path[depth.value - 1] : 0,
);
</script>

<template>
  <PanelItem
    v-if="props.node.type === 'leaf'"
    :context="props.context"
    :node="props.node"
    :registered-panels="props.registeredPanels"
    :path="props.path"
    @split="(path, orientation) => emit('split', path, orientation)"
    @delete="(path) => emit('delete', path)"
    @change-panel-type="
      (path, panelTypeId) => emit('change-panel-type', path, panelTypeId)
    "
  />
  <PanelTreeNode
    v-else
    :id="`${depth + 1}-${index}`"
    :orientation="props.node.orientation"
    :last="index === props.node.children.length - 1"
    :context="props.context"
    :node="props.node"
    :registered-panels="props.registeredPanels"
    :path="props.path"
    @split="(path, orientation) => emit('split', path, orientation)"
    @delete="(path) => emit('delete', path)"
    @change-panel-type="
      (path, panelTypeId) => emit('change-panel-type', path, panelTypeId)
    "
  />
</template>
