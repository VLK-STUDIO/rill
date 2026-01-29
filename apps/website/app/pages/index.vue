<script setup lang="ts">
const REPO_LINK = "https://github.com/vlk-studio/rill";
</script>

<template>
  <div class="h-svh relative overflow-hidden">
    <NuxtPicture
      src="/images/screenshot.jpg"
      :img-attrs="{
        class:
          'absolute inset-0 size-full opacity-50 object-cover object-top-left',
      }"
      alt=""
    />

    <div
      class="absolute inset-0 size-full bg-linear-to-br from-transparent via-default to-default opacity-90"
    />

    <NuxtPicture
      src="/images/bg.jpg"
      :img-attrs="{ class: 'absolute inset-0 size-full opacity-20' }"
      alt=""
    />

    <div class="relative flex flex-col gap-16 h-full w-full z-10">
      <div class="flex justify-between items-center p-8">
        <span class="font-bold text-xl">Rill</span>
        <UButton
          variant="link"
          color="neutral"
          :to="REPO_LINK"
          trailing-icon="i-mdi-github"
          class="px-0"
          size="sm"
          >GitHub</UButton
        >
      </div>
      <div class="flex flex-col justify-end grow gap-6 max-w-xl p-8">
        <h1 class="text-5xl sm:text-7xl max-w-md">
          Powerful, open broadcasting.
        </h1>
        <p>
          Rill is a work-in-progress open source streaming application for
          creating live broadcasts with ease. It focuses on user experience
          backed by a powerful plugin architecture, enabling endless
          customization.
        </p>

        <UButton
          :to="REPO_LINK"
          trailing-icon="i-heroicons-arrow-up-right"
          variant="link"
          size="sm"
          class="px-0 mt-8"
          >Follow the development on GitHub</UButton
        >
      </div>
    </div>
  </div>
</template>
