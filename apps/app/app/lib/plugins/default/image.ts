import type { Plugin } from "@/lib/core";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";

export const imagePlugin: Plugin = {
  id: "image",
  nodes: {
    image: {
      label: "Image",
      icon: () =>
        h(UIcon, {
          name: "i-heroicons-photo",
          class: "size-4",
        }),
      type: "image",
      properties: {
        src: {
          type: "text",
          label: "Source",
          placeholder: "Paste image URL...",
          allowFile: true,
          accept: "image/*",
          default: "",
        },
      },
      render: async ({ src }) => {
        console.log("rendering image with src:", src);

        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();

          img.src = src || "https://placehold.co/600x400/png";

          img.onload = () => resolve(img);

          img.onerror = (event) => {
            reject(img)
          }
        });

        console.log("image rendered:", image);

        return image;
      },
    },
  },
};
