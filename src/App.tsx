import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScrollToTop from "./components/layout/ScrollToTop";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";
import { WhatsAppButton } from "./components/chat/WhatsAppButton";
import { AIChatBot } from "./components/chat/AIChatBot";
import HomePage from "./pages/HomePage";
import CatalogoPage from "./pages/CatalogoPage";
import ProductoPage from "./pages/ProductoPage";
import NosotrosPage from "./pages/NosotrosPage";
import ContactoPage from "./pages/ContactoPage";
import BlogPage from "./pages/BlogPage";
import CotizarPage from "./pages/CotizarPage";
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritosPage from "./pages/FavoritosPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
  const { fetchProducts, fetchBlogPosts } = useAdminStore();

  // Inicializar Supabase Auth y cargar datos al arrancar la app
  useEffect(() => {
    initialize();
    fetchProducts();
    fetchBlogPosts();
  }, [initialize, fetchProducts, fetchBlogPosts]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/producto/:slug" element={<ProductoPage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/cotizar" element={<CotizarPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/favoritos" element={<FavoritosPage />} />

        {/* Rutas protegidas — requieren login */}
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
