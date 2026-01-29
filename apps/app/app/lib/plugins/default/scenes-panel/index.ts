import type { Plugin } from "@/lib/core";
import type { Panel } from "@/lib/plugins";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";
import ScenesPanel from "./components/ScenesPanel.vue";

export const scenesPanelPlugin: Plugin = {
  id: "scenes",
  panels: {
    scenes: {
      label: "Scenes",
      icon: () => h(UIcon, { name: "i-heroicons-queue-list" }),
      component: ScenesPanel,
    } satisfies Panel,
  },
};
