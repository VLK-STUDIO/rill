import type { Plugin } from "@/lib/core";
import type { Panel } from "@/lib/plugins";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";
import SceneEditorPanel from "./components/SceneEditorPanel.vue";

export const sceneEditorPlugin: Plugin = {
  id: "scene-editor",
  panels: {
    "scene-editor": {
      label: "Editor",
      icon: () =>
        h(UIcon, {
          name: "i-heroicons-cube-transparent",
          class: "size-3 shrink-0",
        }),
      component: SceneEditorPanel,
      hideLabel: true,
    } satisfies Panel,
  },
};
