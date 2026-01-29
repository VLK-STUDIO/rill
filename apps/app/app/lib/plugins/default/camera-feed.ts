import type { Plugin } from "@/lib/core";
import { h } from "vue";
import UIcon from "@nuxt/ui/runtime/components/Icon.vue";

export const cameraFeedPlugin: Plugin = {
  id: "camera_feed",
  nodes: {
    camera_feed: {
      label: "Camera Feed",
      icon: () =>
        h(UIcon, {
          name: "i-heroicons-video-camera",
          class: "size-4",
        }),
      type: "video",
      properties: {
        deviceId: {
          type: "select",
          label: "Device",
          options: async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();

            const options = devices
              .filter((device) => device.kind === "videoinput")
              .map((device) => ({
                label: device.label,
                value: device.deviceId,
              }));

            return {
              options,
              default: options[0]!.value,
            };
          },
        },
      },
      render: async ({ deviceId }, context) => {
        const video = document.createElement("video");

        const cacheKey = context.streamCache.getStreamKey("camera_feed", {
          deviceId,
        });

        const stream = await context.streamCache.getOrCreateStream(
          cacheKey,
          async () => {
            return await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: deviceId,
              },
              audio: true,
            });
          },
        );

        video.srcObject = stream;
        video.muted = true;

        video.play();

        return video;
      },
    },
  },
};
