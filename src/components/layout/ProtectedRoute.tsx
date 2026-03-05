import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

/**
 * Wrapper de ruta protegida.
 * - Si no está autenticado → redirige a /login
 * - Si requireAdmin=true y no es admin → redirige a / con mensaje
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
    const location = useLocation();

    // Mientras se inicializa la sesión, no redirigir todavía
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Guardar la ruta original para redirigir después del login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="font-display text-2xl font-bold mb-4">Acceso Denegado</h1>
                    <p className="text-muted-foreground mb-6">No tienes permisos para acceder a esta página.</p>
                    <a href="/" className="text-primary hover:underline">Volver al inicio</a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
