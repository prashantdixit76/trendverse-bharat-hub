import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // Outside Lovable's build (e.g. on Vercel), force the nitro vercel preset.
  // Inside Lovable previews this is ignored and cloudflare is used.
  nitro: { preset: "vercel" },
});
