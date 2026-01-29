import { env } from "./env";

export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui", "@pinia/nuxt"],
  components: {
    dirs: [],
  },
  imports: {
    autoImport: false,
  },
  ssr: false,
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-01-15",
  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    server: {
      strictPort: true,
    },
  },
  runtimeConfig: {
    public: {
      rtmpUrl: env.NUXT_PUBLIC_RTMP_URL,
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        allowArbitraryExtensions: true,
      },
    },
  },
  // Avoids error [unhandledRejection] EMFILE: too many open files, watch
  ignore: ["**/src-tauri/**"],
});
