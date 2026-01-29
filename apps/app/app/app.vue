<script setup lang="ts">
import { providePluginsRegistry } from "@/lib/plugins/registry";
import { provideNodesRegistry } from "@/lib/nodes-registry";
import { useHead } from "#app";

const { nodes } = providePluginsRegistry();

provideNodesRegistry(nodes.value);

useHead({
  meta: [
    {
      "http-equiv": "content-security-policy",
      content:
        "img-src * data: blob: 'self' 'unsafe-inline' 'unsafe-eval'; media-src * data: blob: 'self' 'unsafe-inline' 'unsafe-eval';",
    },
  ],
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
