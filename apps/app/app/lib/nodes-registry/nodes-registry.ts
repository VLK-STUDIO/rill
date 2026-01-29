import { inject, provide } from "vue";
import type { Node } from "@/lib/core";

const NODES_REGISTRY_KEY = Symbol("nodes-registry");

export type NodesRegistry = Readonly<Record<string, Node>>;

export function provideNodesRegistry(nodes: NodesRegistry) {
  provide(NODES_REGISTRY_KEY, nodes);
}

export function useNodesRegistry(): NodesRegistry {
  const nodes = inject<NodesRegistry>(NODES_REGISTRY_KEY);

  if (!nodes) {
    throw new Error(
      "useNodesRegistry must be used within a NodesRegistry provider",
    );
  }

  return nodes;
}
