import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/data/mock';
import {
    User,
    Package,
    Heart,
    Settings,
    MapPin,
    Clock,
    CheckCircle2,
    Truck,
    RefreshCw,
    XCircle,
    CreditCard,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type TabType = 'perfil' | 'pedidos' | 'favoritos';

interface DBOrder {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
    total: number;
    shipping_address?: string;
    payment_method?: string;
    products: {
        product?: { name?: string; images?: string[] };
        name?: string;
        quantity?: number;
        image?: string;
    }[];
}

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const { items: wishlistItems } = useWishlistStore();
    const [activeTab, setActiveTab] = useState<TabType>('perfil');
    const [orders, setOrders] = useState<DBOrder[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMyOrders() {
            if (!user) return;
            setIsLoadingOrders(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOrders(data as DBOrder[]);
            }
            setIsLoadingOrders(false);
        }
        fetchMyOrders();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const menuItems = [
        { id: 'perfil' as TabType, label: 'Mis Datos', icon: User },
        { id: 'pedidos' as TabType, label: 'Mis Pedidos', icon: Package },
        { id: 'favoritos' as TabType, label: 'Mis Favoritos', icon: Heart },
    ];

    const getStatusLabel = (status: string) => {
        const map: Record<string, string> = {
            pending: 'Pendiente', processing: 'Procesando',
            shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado'
        };
        return map[status] || status;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <RefreshCw className="h-4 w-4" />;
            case 'shipped': return <Truck className="h-4 w-4" />;
            case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
            case 'cancelled': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
            case 'processing': return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
            case 'shipped': return 'bg-purple-500/15 text-purple-600 border-purple-500/30';
            case 'delivered': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
            case 'cancelled': return 'bg-red-500/15 text-red-600 border-red-500/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-32">
                <h1 className="font-display text-4xl font-bold mb-8">Mi Cuenta</h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-32">
                            <div className="p-6 text-center border-b border-border bg-muted/10">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="h-10 w-10 text-primary" />
                                </div>
                                <h2 className="font-semibold text-lg">{user.user_metadata?.name || 'Cliente'}</h2>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <div className="p-3 space-y-1">
                                {menuItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors',
                                            activeTab === item.id
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </span>
                                        {(item.id === 'pedidos' && orders.length > 0) && (
                                            <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                                                {orders.length}
                                            </span>
                                        )}
                                        {(item.id === 'favoritos' && wishlistItems.length > 0) && (
                                            <span className="bg-gold text-charcoal font-bold text-[10px] px-2 py-0.5 rounded-full">
                                                {wishlistItems.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="p-3 border-t border-border mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >

                            {/* PERFIL */}
                            {activeTab === 'perfil' && (
                                <div className="bg-card border border-border rounded-xl p-6 lg:p-8 space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                                            <Settings className="h-5 w-5 text-primary" /> Información Personal
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-6">Administra tus datos básicos de la cuenta heredados de tu registro.</p>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Nombre Completo</p>
                                                <p className="font-medium">{user.user_metadata?.name || 'No especificado'}</p>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Correo Electrónico</p>
                                                <p className="font-medium truncate">{user.email}</p>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Rol de Cuenta</p>
                                                <p className="font-medium capitalize">{user.user_metadata?.role || 'Cliente VIP'}</p>
                                            </div>
                                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Miembro desde</p>
                                                <p className="font-medium">{new Date(user.created_at || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-border">
                                        <p className="text-sm text-muted-foreground">
                                            * Para actualizar tu contraseña o correo, por favor contáctanos directamente por WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* PEDIDOS */}
                            {activeTab === 'pedidos' && (
                                <div className="space-y-6">
                                    <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Package className="h-5 w-5 text-primary" /> Historial de Pedidos
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">Sigue el estado de tus compras de muebles.</p>
                                        </div>
                                    </div>

                                    {isLoadingOrders ? (
                                        <div className="text-center py-12">
                                            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                            <p className="mt-4 text-muted-foreground">Cargando tus pedidos...</p>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="bg-card border border-border rounded-xl p-12 text-center">
                                            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                            <h4 className="text-lg font-semibold mb-2">Aún no tienes pedidos</h4>
                                            <p className="text-muted-foreground mb-6">Explora nuestro catálogo y empieza a amueblar tu hogar.</p>
                                            <Link to="/catalogo">
                                                <Button className="bg-primary text-primary-foreground">Ir al Catálogo</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map((order) => (
                                                <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                                    <div className="p-4 sm:p-6 bg-muted/10 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="font-mono text-sm font-semibold">
                                                                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                                                                </span>
                                                                <Badge className={cn('gap-1', getStatusColor(order.status))}>
                                                                    {getStatusIcon(order.status)}
                                                                    {getStatusLabel(order.status)}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="h-3 w-3" /> Realizado el {new Date(order.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total a pagar</p>
                                                            <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 sm:p-6">
                                                        <h5 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                                            <Package className="h-4 w-4" /> Artículos
                                                        </h5>
                                                        <div className="space-y-3">
                                                            {(order.products || []).map((item: DBOrder['products'][0], idx: number) => {
                                                                const prodName = item.product?.name || item.name || `Producto ${idx + 1}`;
                                                                const prodQty = item.quantity || 1;
                                                                const prodImg = item.product?.images?.[0] || item.image || null;
                                                                return (
                                                                    <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border">
                                                                        {prodImg ? (
                                                                            <img src={prodImg} alt={prodName} className="w-12 h-12 object-cover rounded-md" />
                                                                        ) : (
                                                                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                                                                <Package className="h-5 w-5 text-muted-foreground/50" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-sm">{prodName}</p>
                                                                            <p className="text-xs text-muted-foreground">Cantidad: {prodQty}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="mt-6 grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                                            <div>
                                                                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> Info Envío
                                                                </h5>
                                                                <p className="text-sm line-clamp-2">{order.shipping_address}</p>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                                                    <CreditCard className="h-3 w-3" /> Formato de Pago
                                                                </h5>
                                                                <p className="text-sm">{order.payment_method}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FAVORITOS */}
                            {activeTab === 'favoritos' && (
                                <div className="bg-card border border-border rounded-xl p-6 lg:p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                                        <Heart className="h-10 w-10 text-gold" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Tus Favoritos</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                        Actualmente tienes <strong className="text-foreground">{wishlistItems.length}</strong> productos guardados en tu lista de deseos.
                                    </p>
                                    <Link to="/favoritos">
                                        <Button size="lg" className="bg-gold text-charcoal hover:bg-gold/90 font-semibold shadow-lg">
                                            Ir a la Galería de Favoritos
                                            <ChevronRight className="h-5 w-5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            )}

                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
