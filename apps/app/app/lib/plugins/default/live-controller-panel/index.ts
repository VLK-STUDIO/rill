import type { Plugin } from "@/lib/core";
import type { Panel } from "@/lib/plugins";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";
import LiveControllerPanel from "./components/LiveControllerPanel.vue";

export const liveControllerPanelPlugin: Plugin = {
  id: "live-controller",
  panels: {
    liveController: {
      label: "Live Controller",
      icon: () => h(UIcon, { name: "i-heroicons-signal" }),
      component: LiveControllerPanel,
    } satisfies Panel,
  },
};
