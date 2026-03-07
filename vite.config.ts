import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: "https://mydhijosdelrey.com",
      dynamicRoutes: [
        "/catalogo",
        "/nosotros",
        "/contacto",
        "/cotizar",
        "/blog",
        "/login",
        "/registro"
      ]
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // ── Code Splitting: separar dependencias pesadas en chunks propios ──
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animaciones (framer-motion es ~140KB)
          'vendor-animations': ['framer-motion'],
          // Componentes UI de Radix (muchos paquetes pequeños → 1 chunk)
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-toggle',
            '@radix-ui/react-slot',
          ],
          // Gráficas (recharts es ~300KB, solo se usa en admin)
          'vendor-charts': ['recharts'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // Formularios
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utilidades
          'vendor-utils': ['date-fns', 'zustand', '@tanstack/react-query', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Incrementar ligeramente el warning para chunks (default 500KB)
    chunkSizeWarningLimit: 600,
  },
}));
