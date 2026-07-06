// vite.config.ts
import { defineConfig } from "file:///C:/Users/Bienvenido/OneDrive/Desktop/Hijos%20del%20Rey%20MyD/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Bienvenido/OneDrive/Desktop/Hijos%20del%20Rey%20MyD/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/Bienvenido/OneDrive/Desktop/Hijos%20del%20Rey%20MyD/node_modules/lovable-tagger/dist/index.js";
import Sitemap from "file:///C:/Users/Bienvenido/OneDrive/Desktop/Hijos%20del%20Rey%20MyD/node_modules/vite-plugin-sitemap/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Bienvenido\\OneDrive\\Desktop\\Hijos del Rey MyD";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: "https://hijos-del-rey-myd.vercel.app",
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
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    // ── Code Splitting: separar dependencias pesadas en chunks propios ──
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Animaciones (framer-motion es ~140KB)
          "vendor-animations": ["framer-motion"],
          // Componentes UI de Radix (muchos paquetes pequeños → 1 chunk)
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-popover",
            "@radix-ui/react-accordion",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-switch",
            "@radix-ui/react-toggle",
            "@radix-ui/react-slot"
          ],
          // Gráficas (recharts es ~300KB, solo se usa en admin)
          "vendor-charts": ["recharts"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // Formularios
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Utilidades
          "vendor-utils": ["date-fns", "zustand", "@tanstack/react-query", "clsx", "tailwind-merge"]
        }
      }
    },
    // Incrementar ligeramente el warning para chunks (default 500KB)
    chunkSizeWarningLimit: 600
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxCaWVudmVuaWRvXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcSGlqb3MgZGVsIFJleSBNeURcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEJpZW52ZW5pZG9cXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxIaWpvcyBkZWwgUmV5IE15RFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQmllbnZlbmlkby9PbmVEcml2ZS9EZXNrdG9wL0hpam9zJTIwZGVsJTIwUmV5JTIwTXlEL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgU2l0ZW1hcCBmcm9tIFwidml0ZS1wbHVnaW4tc2l0ZW1hcFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiAmJiBjb21wb25lbnRUYWdnZXIoKSxcbiAgICBTaXRlbWFwKHtcbiAgICAgIGhvc3RuYW1lOiBcImh0dHBzOi8vaGlqb3MtZGVsLXJleS1teWQudmVyY2VsLmFwcFwiLFxuICAgICAgZHluYW1pY1JvdXRlczogW1xuICAgICAgICBcIi9jYXRhbG9nb1wiLFxuICAgICAgICBcIi9ub3NvdHJvc1wiLFxuICAgICAgICBcIi9jb250YWN0b1wiLFxuICAgICAgICBcIi9jb3RpemFyXCIsXG4gICAgICAgIFwiL2Jsb2dcIixcbiAgICAgICAgXCIvbG9naW5cIixcbiAgICAgICAgXCIvcmVnaXN0cm9cIlxuICAgICAgXVxuICAgIH0pXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gXHUyNTAwXHUyNTAwIENvZGUgU3BsaXR0aW5nOiBzZXBhcmFyIGRlcGVuZGVuY2lhcyBwZXNhZGFzIGVuIGNodW5rcyBwcm9waW9zIFx1MjUwMFx1MjUwMFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAvLyBSZWFjdCBjb3JlXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAvLyBBbmltYWNpb25lcyAoZnJhbWVyLW1vdGlvbiBlcyB+MTQwS0IpXG4gICAgICAgICAgJ3ZlbmRvci1hbmltYXRpb25zJzogWydmcmFtZXItbW90aW9uJ10sXG4gICAgICAgICAgLy8gQ29tcG9uZW50ZXMgVUkgZGUgUmFkaXggKG11Y2hvcyBwYXF1ZXRlcyBwZXF1ZVx1MDBGMW9zIFx1MjE5MiAxIGNodW5rKVxuICAgICAgICAgICd2ZW5kb3ItcmFkaXgnOiBbXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnUnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10YWJzJyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdG9hc3QnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b29sdGlwJyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3Qtc2VsZWN0JyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtcG9wb3ZlcicsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvbicsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNoZWNrYm94JyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtbGFiZWwnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zY3JvbGwtYXJlYScsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlcGFyYXRvcicsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXN3aXRjaCcsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRvZ2dsZScsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNsb3QnLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgLy8gR3JcdTAwRTFmaWNhcyAocmVjaGFydHMgZXMgfjMwMEtCLCBzb2xvIHNlIHVzYSBlbiBhZG1pbilcbiAgICAgICAgICAndmVuZG9yLWNoYXJ0cyc6IFsncmVjaGFydHMnXSxcbiAgICAgICAgICAvLyBTdXBhYmFzZSBjbGllbnRcbiAgICAgICAgICAndmVuZG9yLXN1cGFiYXNlJzogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcbiAgICAgICAgICAvLyBGb3JtdWxhcmlvc1xuICAgICAgICAgICd2ZW5kb3ItZm9ybXMnOiBbJ3JlYWN0LWhvb2stZm9ybScsICdAaG9va2Zvcm0vcmVzb2x2ZXJzJywgJ3pvZCddLFxuICAgICAgICAgIC8vIFV0aWxpZGFkZXNcbiAgICAgICAgICAndmVuZG9yLXV0aWxzJzogWydkYXRlLWZucycsICd6dXN0YW5kJywgJ0B0YW5zdGFjay9yZWFjdC1xdWVyeScsICdjbHN4JywgJ3RhaWx3aW5kLW1lcmdlJ10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy8gSW5jcmVtZW50YXIgbGlnZXJhbWVudGUgZWwgd2FybmluZyBwYXJhIGNodW5rcyAoZGVmYXVsdCA1MDBLQilcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDYwMCxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1csU0FBUyxvQkFBb0I7QUFDblksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxPQUFPLGFBQWE7QUFKcEIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDMUMsUUFBUTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsZUFBZTtBQUFBLFFBQ2I7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUV6RCxxQkFBcUIsQ0FBQyxlQUFlO0FBQUE7QUFBQSxVQUVyQyxnQkFBZ0I7QUFBQSxZQUNkO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUE7QUFBQSxVQUVBLGlCQUFpQixDQUFDLFVBQVU7QUFBQTtBQUFBLFVBRTVCLG1CQUFtQixDQUFDLHVCQUF1QjtBQUFBO0FBQUEsVUFFM0MsZ0JBQWdCLENBQUMsbUJBQW1CLHVCQUF1QixLQUFLO0FBQUE7QUFBQSxVQUVoRSxnQkFBZ0IsQ0FBQyxZQUFZLFdBQVcseUJBQXlCLFFBQVEsZ0JBQWdCO0FBQUEsUUFDM0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQSxFQUN6QjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
