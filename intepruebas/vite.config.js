import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      $: "/src",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        maid: resolve(__dirname, "maid.html"),
        reception: resolve(__dirname, "reception.html"),
        register: resolve(__dirname, "register.html"),
      },
    },
  },
});
