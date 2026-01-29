import VueKonva from "vue-konva";
import { defineNuxtPlugin } from "#imports";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueKonva);
});

