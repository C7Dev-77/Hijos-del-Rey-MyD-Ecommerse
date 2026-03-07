import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/data/mock';
import {
    User, Package, Heart, Settings, MapPin, Clock, CheckCircle2,
    Truck, RefreshCw, XCircle, CreditCard, LogOut, ChevronRight,
    Pencil, Save, X, Eye, EyeOff, Lock, Check, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type TabType = 'perfil' | 'pedidos' | 'favoritos' | 'seguridad';

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

    // ── Estado edición de perfil ────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // ── Estado cambio de contraseña ──────────────────────────────────
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [isChangingPwd, setIsChangingPwd] = useState(false);

    useEffect(() => {
        if (user) {
            setEditName(user.user_metadata?.name || '');
            setEditPhone(user.user_metadata?.phone || '');
        }
    }, [user]);

    useEffect(() => {
        async function fetchMyOrders() {
            if (!user) return;
            setIsLoadingOrders(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) setOrders(data as DBOrder[]);
            setIsLoadingOrders(false);
        }
        fetchMyOrders();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // ── Guardar cambios de perfil ────────────────────────────────────
    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            toast.error('El nombre no puede estar vacío');
            return;
        }
        setIsSaving(true);
        const { error } = await supabase.auth.updateUser({
            data: { name: editName.trim(), phone: editPhone.trim() },
        });

        if (error) {
            toast.error('No se pudo actualizar el perfil: ' + error.message);
        } else {
            // Refrescar sesión para que user_metadata se actualice en el store
            await supabase.auth.refreshSession();
            toast.success('✅ Perfil actualizado correctamente');
            setIsEditing(false);
        }
        setIsSaving(false);
    };

    // ── Cambiar contraseña ───────────────────────────────────────────
    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 8) {
            toast.error('La contraseña nueva debe tener al menos 8 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setIsChangingPwd(true);

        // Verificar contraseña actual reautenticando
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user?.email || '',
            password: currentPassword,
        });

        if (signInError) {
            toast.error('La contraseña actual es incorrecta');
            setIsChangingPwd(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast.error('Error al cambiar contraseña: ' + error.message);
        } else {
            toast.success('🔐 Contraseña cambiada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setIsChangingPwd(false);
    };

    const menuItems: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: 'perfil', label: 'Mis Datos', icon: User },
        { id: 'pedidos', label: 'Mis Pedidos', icon: Package },
        { id: 'favoritos', label: 'Mis Favoritos', icon: Heart },
        { id: 'seguridad', label: 'Seguridad', icon: Lock },
    ];

    const getStatusLabel = (status: string) => ({
        pending: 'Pendiente', processing: 'Procesando',
        shipped: 'Enviado', delivered: 'Entregado',
        cancelled: 'Cancelado'
    }[status] || status);

    const getStatusIcon = (status: string) => {
        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="h-4 w-4" />,
            processing: <RefreshCw className="h-4 w-4" />,
            shipped: <Truck className="h-4 w-4" />,
            delivered: <CheckCircle2 className="h-4 w-4" />,
            cancelled: <XCircle className="h-4 w-4" />,
        };
        return icons[status] ?? <Clock className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => ({
        pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
        processing: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        shipped: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
        delivered: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
        cancelled: 'bg-red-500/15 text-red-600 border-red-500/30',
    }[status] || 'bg-muted text-muted-foreground');

    if (!user) return null;

    const passwordStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score;
    };
    const pwdScore = passwordStrength(newPassword);
    const pwdColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
    const pwdLabels = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-4 py-32">
                <h1 className="font-display text-4xl font-bold mb-8">Mi Cuenta</h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Sidebar ── */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-card border border-border rounded-xl overflow-hidden sticky top-32">
                            {/* Avatar */}
                            <div className="p-6 text-center border-b border-border bg-muted/10">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/20">
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
                            <div className="p-3 border-t border-border">
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

                    {/* ── Main Content ── */}
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >

                                {/* ──────────── TAB: PERFIL ──────────── */}
                                {activeTab === 'perfil' && (
                                    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Settings className="h-5 w-5 text-primary" /> Información Personal
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Actualiza tu nombre y número de teléfono.
                                                </p>
                                            </div>
                                            {!isEditing ? (
                                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                    <Pencil className="h-4 w-4 mr-2" /> Editar
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    setIsEditing(false);
                                                    setEditName(user.user_metadata?.name || '');
                                                    setEditPhone(user.user_metadata?.phone || '');
                                                }}>
                                                    <X className="h-4 w-4 mr-1" /> Cancelar
                                                </Button>
                                            )}
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {!isEditing ? (
                                                <motion.div
                                                    key="view"
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    className="grid sm:grid-cols-2 gap-6"
                                                >
                                                    {[
                                                        { label: 'Nombre Completo', value: user.user_metadata?.name || 'No especificado' },
                                                        { label: 'Correo Electrónico', value: user.email || '' },
                                                        { label: 'Teléfono / WhatsApp', value: user.user_metadata?.phone || 'No agregado' },
                                                        { label: 'Miembro desde', value: new Date(user.created_at || '').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                                    ].map(field => (
                                                        <div key={field.label} className="bg-muted/30 p-4 rounded-lg border border-border">
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">{field.label}</p>
                                                            <p className="font-medium truncate">{field.value}</p>
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="edit"
                                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="space-y-5"
                                                >
                                                    <div className="grid sm:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="editName">Nombre Completo *</Label>
                                                            <Input
                                                                id="editName"
                                                                value={editName}
                                                                onChange={e => setEditName(e.target.value)}
                                                                placeholder="Tu nombre completo"
                                                                className="h-11"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="editPhone">Teléfono / WhatsApp</Label>
                                                            <Input
                                                                id="editPhone"
                                                                value={editPhone}
                                                                onChange={e => setEditPhone(e.target.value)}
                                                                placeholder=" +57 300 123 4567"
                                                                className="h-11"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="bg-muted/40 rounded-lg p-3 flex items-start gap-2 text-sm text-muted-foreground">
                                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                                                        El correo electrónico no se puede cambiar desde aquí.
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Button
                                                            onClick={handleSaveProfile}
                                                            disabled={isSaving}
                                                            className="bg-primary text-primary-foreground hover:bg-wood-light px-6"
                                                        >
                                                            {isSaving
                                                                ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Guardando…</>
                                                                : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>
                                                            }
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* ──────────── TAB: PEDIDOS ──────────── */}
                                {activeTab === 'pedidos' && (
                                    <div className="space-y-6">
                                        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold flex items-center gap-2">
                                                    <Package className="h-5 w-5 text-primary" /> Historial de Pedidos
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">Sigue el estado de tus compras.</p>
                                            </div>
                                        </div>

                                        {isLoadingOrders ? (
                                            <div className="bg-card border border-border rounded-xl p-12 text-center">
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
                                                {orders.map(order => (
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
                                                                    <Clock className="h-3 w-3" /> Realizado el {new Date(order.created_at).toLocaleDateString('es-CO')}
                                                                </p>
                                                            </div>
                                                            <div className="text-left sm:text-right">
                                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
                                                                <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 sm:p-6">
                                                            <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                                <Package className="h-4 w-4" /> Artículos
                                                            </h5>
                                                            <div className="space-y-3">
                                                                {(order.products || []).map((item, idx) => {
                                                                    const name = item.product?.name || item.name || `Producto ${idx + 1}`;
                                                                    const qty = item.quantity || 1;
                                                                    const img = item.product?.images?.[0] || item.image || null;
                                                                    return (
                                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                                                                            {img
                                                                                ? <img src={img} alt={name} className="w-12 h-12 object-cover rounded-md" />
                                                                                : <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground/50" /></div>
                                                                            }
                                                                            <div className="flex-1">
                                                                                <p className="font-medium text-sm">{name}</p>
                                                                                <p className="text-xs text-muted-foreground">Cantidad: {qty}</p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="mt-5 grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                                                <div>
                                                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                                                        <MapPin className="h-3 w-3" /> Envío
                                                                    </h5>
                                                                    <p className="text-sm">{order.shipping_address || '—'}</p>
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                                                        <CreditCard className="h-3 w-3" /> Pago
                                                                    </h5>
                                                                    <p className="text-sm">{order.payment_method || '—'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ──────────── TAB: FAVORITOS ──────────── */}
                                {activeTab === 'favoritos' && (
                                    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                                        <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6">
                                            <Heart className="h-10 w-10 text-gold" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">Tus Favoritos</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                            Tienes <strong className="text-foreground">{wishlistItems.length}</strong> {wishlistItems.length === 1 ? 'producto guardado' : 'productos guardados'} en tu lista de deseos.
                                        </p>
                                        <Link to="/favoritos">
                                            <Button size="lg" className="bg-gold text-charcoal hover:bg-gold/90 font-semibold shadow-lg">
                                                Ir a la Galería de Favoritos
                                                <ChevronRight className="h-5 w-5 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* ──────────── TAB: SEGURIDAD ──────────── */}
                                {activeTab === 'seguridad' && (
                                    <div className="bg-card border border-border rounded-xl p-6 lg:p-8 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Lock className="h-5 w-5 text-primary" /> Cambiar Contraseña
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Por tu seguridad, necesitas confirmar tu contraseña actual.
                                            </p>
                                        </div>

                                        <div className="max-w-md space-y-5">
                                            {/* Contraseña actual */}
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPwd">Contraseña actual</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="currentPwd"
                                                        type={showCurrentPwd ? 'text' : 'password'}
                                                        value={currentPassword}
                                                        onChange={e => setCurrentPassword(e.target.value)}
                                                        placeholder="Tu contraseña actual"
                                                        className="h-11 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCurrentPwd(v => !v)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Nueva contraseña */}
                                            <div className="space-y-2">
                                                <Label htmlFor="newPwd">Nueva contraseña</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPwd"
                                                        type={showNewPwd ? 'text' : 'password'}
                                                        value={newPassword}
                                                        onChange={e => setNewPassword(e.target.value)}
                                                        placeholder="Mínimo 8 caracteres"
                                                        className="h-11 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPwd(v => !v)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {/* Indicador de fortaleza */}
                                                {newPassword && (
                                                    <div className="space-y-1.5 pt-1">
                                                        <div className="flex gap-1">
                                                            {[0, 1, 2, 3].map(i => (
                                                                <div
                                                                    key={i}
                                                                    className={cn(
                                                                        'h-1.5 flex-1 rounded-full transition-all',
                                                                        i < pwdScore ? pwdColors[pwdScore - 1] : 'bg-muted'
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Fortaleza: <span className="font-medium">{newPassword ? pwdLabels[pwdScore - 1] || 'Muy débil' : ''}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Confirmar contraseña */}
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPwd">Confirmar nueva contraseña</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPwd"
                                                        type={showConfirmPwd ? 'text' : 'password'}
                                                        value={confirmPassword}
                                                        onChange={e => setConfirmPassword(e.target.value)}
                                                        placeholder="Repite la nueva contraseña"
                                                        className={cn('h-11 pr-10', confirmPassword && (confirmPassword === newPassword ? 'border-emerald-500' : 'border-red-500'))}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPwd(v => !v)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {confirmPassword && confirmPassword !== newPassword && (
                                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                                        <X className="h-3 w-3" /> Las contraseñas no coinciden
                                                    </p>
                                                )}
                                                {confirmPassword && confirmPassword === newPassword && (
                                                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                                                        <Check className="h-3 w-3" /> Las contraseñas coinciden
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={isChangingPwd || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                                className="w-full bg-primary text-primary-foreground hover:bg-wood-light h-11"
                                            >
                                                {isChangingPwd
                                                    ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Actualizando…</>
                                                    : <><Lock className="h-4 w-4 mr-2" /> Cambiar Contraseña</>
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
