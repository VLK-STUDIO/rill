<script setup>
useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "apple-mobile-web-app-title", content: "Rill" },
  ],
  link: [
    { rel: "manifest", href: "/site.webmanifest" },
    { rel: "icon", href: "/favicon.ico" },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon-96x96.png",
      sizes: "96x96",
    },
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "shortcut icon", href: "/favicon.ico" },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Rill Studio - Powerful broadcasting for everyone";
const description =
  "Rill Studio is an open-source, easy-to-use broadcasting software that empowers creators to produce professional live streams and recordings.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
