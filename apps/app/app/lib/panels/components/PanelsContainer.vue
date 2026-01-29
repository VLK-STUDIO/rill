<script setup lang="ts">
import { ref } from "vue";
import type { PluginContext, Panel } from "@/lib/plugins";
import {
  deleteNodeAtPath,
  generateDefaultPanelStructure,
  splitNodeAtPath,
  updatePanelTypeAtPath,
} from "../utils";
import PanelTreeNode from "./PanelTreeNode.vue";
import type { PanelTreeNode as PanelTreeNodeType } from "../types";

const props = defineProps<{
  registeredPanels: Record<string, Panel>;
  context: PluginContext;
}>();

const rootNode = ref<PanelTreeNodeType>(generateDefaultPanelStructure());

function splitPanel(path: number[], orientation: "horizontal" | "vertical") {
  rootNode.value = splitNodeAtPath(rootNode.value, path, orientation);
}

function deletePanel(path: number[]) {
  console.log({ path });
  rootNode.value = deleteNodeAtPath(rootNode.value, path);
}

function changePanelType(path: number[], panelTypeId: string) {
  rootNode.value = updatePanelTypeAtPath(
    rootNode.value,
    path,
    panelTypeId,
  ) as PanelTreeNodeType;
}
</script>

<template>
  <PanelTreeNode
    :node="rootNode"
    :registered-panels="props.registeredPanels"
    :orientation="rootNode.orientation"
    :path="[]"
    :context="props.context"
    @split="splitPanel"
    @delete="deletePanel"
    @change-panel-type="changePanelType"
  />
</template>
