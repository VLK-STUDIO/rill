import type { Plugin } from "@/lib/core";
import type { Panel } from "@/lib/plugins";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";
import MixerPanel from "./components/MixerPanel.vue";

export const mixerPanelPlugin: Plugin = {
  id: "mixer",
  panels: {
    mixer: {
      label: "Mixer",
      icon: () => h(UIcon, { name: "i-heroicons-speaker-wave" }),
      component: MixerPanel,
    } satisfies Panel,
  },
};
