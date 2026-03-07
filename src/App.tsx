import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";
import { useSEO } from "./hooks/useSEO";
import { useRealtimeOrders } from "./hooks/useRealtimeOrders";
import { WhatsAppButton } from "./components/chat/WhatsAppButton";
import { AIChatBot } from "./components/chat/AIChatBot";

// ── Lazy-loaded pages (code splitting) ──────────────────────────────
const HomePage = lazy(() => import("./pages/HomePage"));
const CatalogoPage = lazy(() => import("./pages/CatalogoPage"));
const ProductoPage = lazy(() => import("./pages/ProductoPage"));
const NosotrosPage = lazy(() => import("./pages/NosotrosPage"));
const ContactoPage = lazy(() => import("./pages/ContactoPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const CotizarPage = lazy(() => import("./pages/CotizarPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegistroPage = lazy(() => import("./pages/RegistroPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const FavoritosPage = lazy(() => import("./pages/FavoritosPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// ── Loading Spinner ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
}

// Componente para esconder los botones flotantes en ciertas páginas (como admin)
function FloatingElements() {
  const location = useLocation();
  const hiddenRoutes = ["/admin", "/perfil", "/checkout", "/favoritos"];
  const isHiddenRoute = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (isHiddenRoute) return null;

  return (
    <>
      <WhatsAppButton />
      <AIChatBot />
    </>
  );
}

function AppWithAuth() {
  const { initialize } = useAuthStore();
  const { fetchProducts, fetchBlogPosts, fetchSettings } = useAdminStore();

  // Sincronizar SEO globalmente desde Supabase
  useSEO();

  // Escuchar cambios en los pedidos en tiempo real
  useRealtimeOrders();

  // Inicializar Supabase Auth y cargar datos al arrancar la app
  useEffect(() => {
    initialize();
    fetchProducts();
    fetchBlogPosts();
    fetchSettings(); // ← carga metaTitle, metaDescription, etc. desde Supabase
  }, [initialize, fetchProducts, fetchBlogPosts, fetchSettings]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/producto/:slug" element={<ProductoPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/cotizar" element={<CotizarPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          {/* Rutas protegidas — requieren login */}
          <Route
            path="/favoritos"
            element={
              <ProtectedRoute>
                <FavoritosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Ruta admin — requiere login Y rol admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <FloatingElements />
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppWithAuth />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
