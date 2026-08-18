import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ВАЖЛИВО: якщо додаток публікується на GitHub Pages за адресою
// https://<username>.github.io/<repo-name>/ — base має дорівнювати "/<repo-name>/".
// Якщо репозиторій буде <username>.github.io (кореневий сайт) — base лишити "/".
export default defineConfig({
  base: "/NTS_Sketch_map/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": __dirname + "/src",
    },
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
