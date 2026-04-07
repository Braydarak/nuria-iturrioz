import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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
  const base = normalizeBase(
    env.VITE_BASE_PATH ?? "/",
  );

  return {
    base,
    plugins: [react(), tailwindcss()],
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
