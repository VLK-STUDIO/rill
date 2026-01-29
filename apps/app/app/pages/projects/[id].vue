<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { createPluginContext } from "../../lib/plugins";
import { usePluginsRegistry } from "../../lib/plugins/registry";
import PanelsContainer from "../../lib/panels/components/PanelsContainer.vue";
import StatusBar from "../../components/StatusBar.vue";

const route = useRoute();

const projectId = computed(() => route.params.id as string);

const { panels } = usePluginsRegistry();

const context = createPluginContext({
  projectId,
});
</script>

<template>
  <main class="relative h-screen w-screen flex flex-col">
    <PanelsContainer
      :registered-panels="panels"
      :context="context"
      class="flex-1 min-h-0"
    />
    <StatusBar />
  </main>
</template>
