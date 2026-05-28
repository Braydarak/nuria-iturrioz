import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

function normalizeBase(value: string) {
  if (value === "./") return "./";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = normalizeBase(env.VITE_BASE_PATH ?? "/");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const require = createRequire(import.meta.url);
  const vitePrerender = require("vite-plugin-prerender");

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      vitePrerender({
        staticDir: path.join(__dirname, "dist"),
        routes: ["/", "/carrer", "/stats", "/contact"],
        renderer: new vitePrerender.PuppeteerRenderer({
          executablePath:
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          headless: true,
          navigationOptions: {
            timeout: 120000,
          },
        }),
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (
              id.includes("i18next") ||
              id.includes("react-i18next") ||
              id.includes("i18next-browser-languagedetector")
            ) {
              return "vendor-i18n";
            }

            if (id.includes("gsap")) return "vendor-gsap";
            if (id.includes("react-simple-maps") || id.includes("d3-"))
              return "vendor-maps";
            if (id.includes("@emailjs")) return "vendor-emailjs";

            return "vendor";
          },
        },
      },
    },
  };
});
