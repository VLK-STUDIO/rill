import { computed, inject, provide, shallowRef } from "vue";
import type { Plugin, Node } from "@/lib/core";
import type { Panel } from "@/lib/plugins";
import { cameraFeedPlugin } from "../default/camera-feed";
import { scenesPanelPlugin } from "../default/scenes-panel";
import { sceneEditorPlugin } from "../default/scene-editor";
import { liveControllerPanelPlugin } from "../default/live-controller-panel";
import { livePreviewPanelPlugin } from "../default/live-preview-panel";
import { mixerPanelPlugin } from "../default/mixer-panel";
import { imagePlugin } from "../default/image";

import type { ComputedRef } from "vue";

export interface PluginsRegistry {
  plugins: ComputedRef<Plugin[]>;
  panels: ComputedRef<Record<string, Panel>>;
  nodes: ComputedRef<Readonly<Record<string, Node>>>;
}

const PLUGINS_REGISTRY_KEY = Symbol("plugins-registry");

function createPluginsRegistry(): PluginsRegistry {
  const pluginsRef = shallowRef<Plugin[]>([
    cameraFeedPlugin,
    imagePlugin,
    scenesPanelPlugin,
    sceneEditorPlugin,
    liveControllerPanelPlugin,
    livePreviewPanelPlugin,
    mixerPanelPlugin,
  ]);

  const plugins = computed(() => pluginsRef.value);

  const panels = computed(
    () =>
      Object.fromEntries(
        plugins.value.flatMap((plugin) =>
          Object.entries(plugin.panels ?? {}).map(([id, panel]) => [id, panel]),
        ),
      ) as Record<string, Panel>,
  );

  const nodes = computed(() => {
    const allNodes: Record<string, Node> = {};

    for (const plugin of plugins.value) {
      for (const [nodeTypeId, node] of Object.entries(plugin.nodes ?? {})) {
        if (allNodes[nodeTypeId]) {
          throw new Error(`Duplicate node type id registered: ${nodeTypeId}`);
        }

        allNodes[nodeTypeId] = node;
      }
    }

    return Object.freeze(allNodes);
  });

  return {
    plugins,
    panels,
    nodes,
  };
}

export function providePluginsRegistry() {
  const registry = createPluginsRegistry();

  provide(PLUGINS_REGISTRY_KEY, registry);

  return registry;
}

export function usePluginsRegistry(): PluginsRegistry {
  const registry = inject<PluginsRegistry>(PLUGINS_REGISTRY_KEY);

  if (!registry) {
    throw new Error(
      "usePluginsRegistry must be used within a PluginsRegistry provider",
    );
  }

  return registry;
}
