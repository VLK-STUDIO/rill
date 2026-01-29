import type { Plugin } from "@/lib/core";
import type { Panel } from "@/lib/plugins";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";
import LivePreviewPanel from "./components/LivePreviewPanel.vue";

export const livePreviewPanelPlugin: Plugin = {
  id: "live-preview",
  panels: {
    livePreview: {
      label: "Live Preview",
      icon: () => h(UIcon, { name: "i-heroicons-tv" }),
      component: LivePreviewPanel,
    } satisfies Panel,
  },
};
