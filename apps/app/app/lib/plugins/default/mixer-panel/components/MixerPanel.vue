<script setup lang="ts">
import { computed } from "vue";
import type { PluginContext } from "@/lib/plugins";

const props = defineProps<{
  context: PluginContext;
}>();

const scene = computed(() => props.context.program.currentScene.value);

type MixerItem = {
  id: string;
  label: string;
  gain: number;
  muted: boolean;
  captureEnabled: boolean;
};

const items = computed<MixerItem[]>(() => {
  const current = scene.value;
  if (!current) {
    return [];
  }

  return current.items.map((item) => {
    const gain =
      typeof item.properties.audioGain === "number"
        ? item.properties.audioGain
        : 1;

    return {
      id: item.id,
      label: item.label,
      gain,
      muted: item.properties.audioMuted === true,
      captureEnabled:
        item.properties.audioCaptureEnabled === undefined
          ? true
          : item.properties.audioCaptureEnabled === true,
    };
  });
});

function setGain(itemId: string, gain: number) {
  props.context.scenes.items.updateProperty(itemId, "audioGain", gain);
}

function setMuted(itemId: string, muted: boolean) {
  props.context.scenes.items.updateProperty(itemId, "audioMuted", muted);
}

function setCaptureEnabled(itemId: string, enabled: boolean) {
  props.context.scenes.items.updateProperty(
    itemId,
    "audioCaptureEnabled",
    enabled,
  );
}
</script>

<template>
  <div class="flex flex-col gap-2 p-2">
    <div v-if="!scene" class="text-sm text-muted">
      Select a program scene to configure audio.
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-md border border-default bg-muted p-2"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="text-sm font-medium">{{ item.label }}</div>
          <UButton
            size="xs"
            variant="subtle"
            :color="item.muted ? 'error' : 'neutral'"
            :label="item.muted ? 'Muted' : 'Mute'"
            @click="setMuted(item.id, !item.muted)"
          />
        </div>

        <div class="mt-2 flex items-center gap-2">
          <div class="text-xs text-muted w-12">Vol</div>
          <URange
            :model-value="item.gain"
            :min="0"
            :max="1"
            :step="0.01"
            class="flex-1"
            @update:model-value="(v: number) => setGain(item.id, v)"
          />
          <div class="w-12 text-xs text-muted text-right">
            {{ Math.round(item.gain * 100) }}%
          </div>
        </div>

        <div class="mt-2 flex items-center justify-between">
          <div class="text-xs text-muted">Capture audio</div>
          <USwitch
            :model-value="item.captureEnabled"
            @update:model-value="
              (v) => setCaptureEnabled(item.id, v as boolean)
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
