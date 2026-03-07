import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Phone, LogOut,
  TrendingUp, DollarSign, Eye, Menu, X, Plus, Pencil, Trash2,
  Save, Image as ImageIcon, Search, Home, Clock, Truck, CheckCircle2,
  XCircle, MapPin, CreditCard, User, ChevronRight,
  Filter, RefreshCw, PackageOpen, AlertTriangle, Settings, ClipboardList
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore, Quote } from '@/store/adminStore';
import { CATEGORIES, formatPrice, Product, BlogPost, Order } from '@/data/mock';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import HomeContentTab from '@/components/admin/HomeContentTab';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'blog' | 'quotes' | 'home';

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { user, logout } = useAuthStore();
  const { fetchProducts, fetchBlogPosts, fetchOrders, fetchSettings } = useAdminStore();
  const navigate = useNavigate();

  // Cargar datos de Supabase al entrar al panel
  useEffect(() => {
    fetchProducts();
    fetchBlogPosts();
    fetchOrders();
    fetchSettings();
  }, [fetchProducts, fetchBlogPosts, fetchOrders, fetchSettings]);

  const handleLogout = async () => { await logout(); navigate('/'); };


  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Productos', icon: Package },
    { id: 'orders' as AdminTab, label: 'Pedidos', icon: ShoppingCart },
    { id: 'quotes' as AdminTab, label: 'Cotizaciones', icon: ClipboardList },
    { id: 'blog' as AdminTab, label: 'Blog', icon: FileText },
    { id: 'home' as AdminTab, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="font-display text-lg font-bold text-sidebar-foreground">
              {sidebarOpen ? <span>M&D <span className="text-gold">Admin</span></span> : 'M&D'}
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  activeTab === item.id ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <item.icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />{sidebarOpen && <span>Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">
              {{
                dashboard: 'Dashboard',
                products: 'Productos',
                orders: 'Pedidos',
                quotes: 'Cotizaciones',
                blog: 'Blog',
                home: 'Configuración',
              }[activeTab] ?? activeTab}
            </h1>
            <p className="text-muted-foreground">Bienvenido, {user?.user_metadata?.name || user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
          {activeTab === 'products' && <ProductsTab key="products" />}
          {activeTab === 'orders' && <OrdersTab key="orders" />}
          {activeTab === 'quotes' && <QuotesTab key="quotes" />}
          {activeTab === 'blog' && <BlogTab key="blog" />}
          {activeTab === 'home' && <HomeContentTab key="home" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Dashboard Tab — Datos reales desde Supabase
function DashboardTab() {
  const { products, orders } = useAdminStore();

  // ── Calcular ventas de los últimos 6 meses ─────────────────────────
  const salesData = (() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const months: { month: string; ventas: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      const ventas = orders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return (
            orderDate.getMonth() === d.getMonth() &&
            orderDate.getFullYear() === d.getFullYear() &&
            o.status !== 'cancelled'
          );
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);
      months.push({ month: label, ventas });
    }
    return months;
  })();

  // ── Ventas del mes actual ──────────────────────────────────────────
  const ventasMes = salesData[salesData.length - 1]?.ventas ?? 0;

  // ── Top Productos contados desde los items reales de las órdenes ──
  // Los pedidos pueden tener dos formatos: {product:{id,name},quantity} o {productId,quantity,price}
  const productCount: Record<string, { name: string; ventas: number }> = {};
  for (const order of orders) {
    if (!Array.isArray(order.products)) continue;
    for (const rawItem of order.products as unknown[]) {
      const item = rawItem as Record<string, unknown>;
      // Formato del carrito: { product: { id, name }, quantity }
      if (item.product && typeof item.product === 'object') {
        const p = item.product as { id?: string; name?: string };
        const id = p.id;
        if (!id) continue;
        if (!productCount[id]) productCount[id] = { name: (p.name || 'Producto').slice(0, 22), ventas: 0 };
        productCount[id].ventas += (item.quantity as number) ?? 1;
        continue;
      }
      // Formato alternativo: { productId, quantity }
      const id = item.productId as string;
      if (!id) continue;
      if (!productCount[id]) productCount[id] = { name: id.slice(0, 22), ventas: 0 };
      productCount[id].ventas += (item.quantity as number) ?? 1;
    }
  }
  const topProducts = Object.values(productCount)
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 5);

  // Si no hay datos reales de pedidos, mostramos los productos del catálogo con 0
  const chartProducts = topProducts.length > 0
    ? topProducts
    : products.slice(0, 5).map(p => ({ name: p.name.slice(0, 22), ventas: 0 }));

  // ── KPIs ─────────────────────────────────────────────────────────
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const stats = [
    {
      label: 'Ventas del Mes',
      value: formatPrice(ventasMes),
      icon: DollarSign,
      color: 'text-forest',
      sublabel: ventasMes === 0 ? 'Sin pedidos este mes' : 'Suma de pedidos activos',
    },
    {
      label: 'Total Pedidos',
      value: orders.length.toString(),
      icon: ShoppingCart,
      color: 'text-gold',
      sublabel: `${pendingOrders} pendiente${pendingOrders !== 1 ? 's' : ''}`,
    },
    {
      label: 'Productos',
      value: products.length.toString(),
      icon: Package,
      color: 'text-primary',
      sublabel: 'En catálogo',
    },
    {
      label: 'Pedidos Activos',
      value: orders.filter(o => o.status === 'processing' || o.status === 'shipped').length.toString(),
      icon: TrendingUp,
      color: 'text-terracotta',
      sublabel: 'En proceso o enviados',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Stats KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={cn('h-8 w-8', stat.color)} />
              <span className="text-xs font-medium text-muted-foreground">{stat.sublabel}</span>
            </div>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Ventas mensuales reales */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-1">Ventas Mensuales</h3>
          <p className="text-xs text-muted-foreground mb-4">Últimos 6 meses — datos reales de pedidos</p>
          {orders.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              Sin pedidos registrados aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => formatPrice(v)} />
                <Line type="monotone" dataKey="ventas" stroke="hsl(var(--gold))" strokeWidth={2} dot={{ fill: 'hsl(var(--gold))' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Productos reales */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-semibold mb-1">Top Productos</h3>
          <p className="text-xs text-muted-foreground mb-4">Unidades vendidas por producto</p>
          {chartProducts.every(p => p.ventas === 0) ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm text-center px-4">
              Los productos más vendidos aparecerán aquí cuando haya pedidos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={110} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v} uds.`, 'Vendidos']} />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pedidos Recientes */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display font-semibold mb-4">Pedidos Recientes</h3>
        {orders.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no hay pedidos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
              </tr></thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{order.id.slice(0, 8)}…</td>
                    <td className="py-3 px-4 text-sm">{order.createdAt}</td>
                    <td className="py-3 px-4 text-sm font-medium">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <Badge className={cn(
                        order.status === 'delivered' ? 'badge-delivered' :
                          order.status === 'pending' ? 'badge-pending' :
                            order.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                              'bg-primary/20 text-primary'
                      )}>
                        {order.status === 'delivered' ? 'Entregado' :
                          order.status === 'pending' ? 'Pendiente' :
                            order.status === 'processing' ? 'En proceso' :
                              order.status === 'shipped' ? 'Enviado' :
                                order.status === 'cancelled' ? 'Cancelado' :
                                  order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}


// Products Tab with CRUD
function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '',
    category: '',
    shortDescription: '',
    description: '',
    technicalDetails: '',
    images: '',
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', price: '', originalPrice: '', discount: '', stock: '', category: '', shortDescription: '', description: '', technicalDetails: '', images: '' });
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discount: product.discount?.toString() || '',
      stock: product.stock.toString(),
      category: product.category,
      shortDescription: product.shortDescription,
      description: product.description,
      technicalDetails: product.technicalDetails || '',
      images: product.images.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      price: parseInt(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
      discount: formData.discount ? parseInt(formData.discount) : undefined,
      stock: parseInt(formData.stock) || 0,
      category: formData.category,
      shortDescription: formData.shortDescription,
      description: formData.description,
      technicalDetails: formData.technicalDetails,
      shippingInfo: editingProduct?.shippingInfo,
      returnsInfo: editingProduct?.returnsInfo,
      images: formData.images.split(',').map(url => url.trim()).filter(Boolean),
      dimensions: editingProduct?.dimensions || { width: 0, height: 0, depth: 0 },
      materials: editingProduct?.materials || [],
      rating: editingProduct?.rating || 4.5,
      reviewCount: editingProduct?.reviewCount || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Producto actualizado exitosamente');
    } else {
      addProduct(productData);
      toast.success('Producto creado exitosamente');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      toast.success('Producto eliminado');
      setDeleteId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Precio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.shortDescription.slice(0, 40)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="capitalize">{product.category}</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4">
                    <Badge className={product.stock > 5 ? 'badge-delivered' : product.stock > 0 ? 'badge-pending' : 'badge-cancelled'}>
                      {product.stock} und
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio (COP)</Label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock (unidades)</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Precio Original (opcional, si hay descuento)</Label>
                <Input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="Ej: 2500000" />
              </div>
              <div className="space-y-2">
                <Label>Descuento (%)</Label>
                <Input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="Ej: 15" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción Corta</Label>
              <Input value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción Completa</Label>
              <Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>URLs de Imágenes (separadas por coma)</Label>
              <Textarea rows={2} value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://imagen1.jpg, https://imagen2.jpg" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Detalles Técnicos</Label>
                <Textarea rows={4} value={formData.technicalDetails} onChange={(e) => setFormData({ ...formData, technicalDetails: e.target.value })} placeholder="Especificaciones técnicas del producto..." />
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
                ℹ️ Las políticas de <strong>envío y devoluciones</strong> se aplican a todos los productos por igual.
                Puédelas editar en <strong>Configuración → Políticas</strong>.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. El producto será eliminado permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// Orders Tab – Phase 5: Gestión Profesional de Pedidos
function OrdersTab() {
  const { orders, updateOrderStatus, fetchOrders, isLoadingOrders } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // KPIs
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.paymentMethod?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateStatus = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success(`Estado actualizado a: ${getStatusLabel(newStatus)}`);
    // Actualizar el modal si está abierto
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus as Order['status']
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteId) return;
    // Por ahora, solo actualizamos el estado a 'cancelled'
    await updateOrderStatus(deleteId, 'cancelled');
    toast.success('Pedido cancelado');
    setDeleteId(null);
    if (selectedOrder?.id === deleteId) setSelectedOrder(null);
  };

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pedidos', value: orders.length, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Pendientes', value: pendingOrders, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'En Proceso', value: processingOrders, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Ingresos Totales', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('p-2 rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar: Filtros + Búsqueda + Refresh */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Filtros de estado */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  statusFilter === status
                    ? status === 'all' ? 'bg-primary text-primary-foreground border-primary' : getStatusColor(status)
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                )}
              >
                {status === 'all' ? 'Todos' : getStatusLabel(status)}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Refresh */}
          <Button variant="outline" size="icon" onClick={() => fetchOrders()} disabled={isLoadingOrders}>
            <RefreshCw className={cn('h-4 w-4', isLoadingOrders && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Tabla de pedidos o estado vacío */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            {statusFilter !== 'all' ? `No hay pedidos "${getStatusLabel(statusFilter)}"` : 'Sin pedidos aún'}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {statusFilter !== 'all'
              ? 'Intenta con otro filtro o espera nuevos pedidos.'
              : 'Cuando un cliente complete un pedido por WhatsApp, aparecerá aquí automáticamente.'}
          </p>
        </motion.div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pedido</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente / Dirección</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pago</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {order.id?.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{order.createdAt}</td>
                    <td className="py-3 px-4 text-sm max-w-[220px] truncate">{order.shippingAddress}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" />
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="processing">Procesando</SelectItem>
                            <SelectItem value="shipped">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteId(order.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer con resumen */}
          <div className="bg-muted/30 px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Mostrando {filteredOrders.length} de {orders.length} pedidos</span>
            <span className="font-medium text-foreground">
              Total visible: {formatPrice(filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
            </span>
          </div>
        </div>
      )}

      {/* ──────── MODAL: Detalle del Pedido ──────── */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block">Detalle del Pedido</span>
                    <span className="text-xs font-mono text-muted-foreground font-normal">{selectedOrder.id}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                {/* Estado actual */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border', getStatusColor(selectedOrder.status))}>
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                    <span className="text-sm text-muted-foreground">· {selectedOrder.createdAt}</span>
                  </div>
                  <Select value={selectedOrder.status} onValueChange={(v) => updateStatus(selectedOrder.id, v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="processing">Procesando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info del cliente */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Dirección de Envío
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Método de Pago
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.paymentMethod}</p>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mt-3">
                      <User className="h-4 w-4 text-primary" /> ID de Usuario
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">{selectedOrder.userId || 'N/A'}</p>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2.5">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" /> Productos del Pedido
                    </h4>
                  </div>
                  <div className="divide-y divide-border">
                    {Array.isArray(selectedOrder.products) && selectedOrder.products.length > 0 ? (
                      selectedOrder.products.map((item: { product?: Product, name?: string, price?: number, quantity?: number, image?: string }, idx: number) => {
                        // Los productos pueden venir en formato de carrito (con item.product) o como referencia simple
                        const productName = item.product?.name || item.name || `Producto ${idx + 1}`;
                        const productPrice = item.product?.price || item.price || 0;
                        const quantity = item.quantity || 1;
                        const productImage = item.product?.images?.[0] || item.image || null;

                        return (
                          <div key={idx} className="flex items-center gap-4 p-4">
                            {productImage && (
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{productName}</p>
                              <p className="text-xs text-muted-foreground">Cantidad: {quantity}</p>
                            </div>
                            <p className="font-semibold text-sm">{formatPrice(productPrice * quantity)}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                        Sin detalle de productos disponible
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">Total del Pedido</span>
                    <span className="text-lg font-bold text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmación de cancelación */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              El pedido será marcado como cancelado. Esta acción se puede revertir cambiando el estado nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground">Sí, cancelar pedido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ──────── COTIZACIONES TAB ────────
function QuotesTab() {
  const { quotes, updateQuoteStatus, deleteQuote } = useAdminStore();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredQuotes = quotes.filter(q =>
    statusFilter === 'all' || q.status === statusFilter
  );

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pendiente', reviewed: 'Revisado',
      contacted: 'Contactado', archived: 'Archivado'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
      case 'reviewed': return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      case 'contacted': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateQuoteStatus(id, status);
    toast.success('Estado actualizado');
    if (selectedQuote?.id === id) setSelectedQuote({ ...selectedQuote, status });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteQuote(deleteId);
      toast.success('Cotización eliminada');
      setDeleteId(null);
      if (selectedQuote?.id === deleteId) setSelectedQuote(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'pending', 'reviewed', 'contacted', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
              )}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuotes.map(quote => (
          <motion.div
            key={quote.id}
            layoutId={quote.id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelectedQuote(quote)}
          >
            <div className="flex justify-between items-start mb-4">
              <Badge className={cn('font-normal', getStatusColor(quote.status))}>
                {getStatusLabel(quote.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">{quote.createdAt}</span>
            </div>

            <h3 className="font-display font-semibold text-lg mb-1">{quote.furnitureType}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quote.description}</p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {quote.userName.charAt(0)}
                </div>
                <div className="text-sm">
                  <p className="font-medium leading-none">{quote.userName}</p>
                  <p className="text-xs text-muted-foreground">{quote.userCity}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(quote.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold opacity-50">No hay cotizaciones para mostrar</h3>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedQuote && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start mr-8">
                  <DialogTitle className="font-display text-2xl">Ref: {selectedQuote.id}</DialogTitle>
                  <Select value={selectedQuote.status} onValueChange={(v: string) => handleUpdateStatus(selectedQuote.id, v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewed">Revisado</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Cliente</h4>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4" /> {selectedQuote.userName}</p>
                      <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {selectedQuote.userPhone}</p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground italic truncate">{selectedQuote.userEmail}</p>
                      <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> {selectedQuote.userCity}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Mueble solicitado</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="text-sm font-medium">{selectedQuote.furnitureType}</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground">Material:</span>
                        <span className="text-sm font-medium">{selectedQuote.material || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground">Medidas (AnxAlxPr):</span>
                        <span className="text-sm font-medium">
                          {selectedQuote.width || '?'} x {selectedQuote.height || '?'} x {selectedQuote.depth || '?'} cm
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-2">Descripción:</span>
                        <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">{selectedQuote.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Imágenes de Referencia</h4>
                  {selectedQuote.images && selectedQuote.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedQuote.images.map((img: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-border group relative">
                          <img src={img} alt="Referencia" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => window.open(img, '_blank')}>
                              Ver Grande
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl bg-muted/30 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-xs">Sin imágenes</p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-border">
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 font-bold"
                      onClick={() => {
                        const msg = `Hola ${selectedQuote.userName}, soy el administrador de M&D Hijos del Rey. Recibimos tu cotización para un ${selectedQuote.furnitureType}. ¿Hablamos?`;
                        window.open(`https://wa.me/${selectedQuote.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                    >
                      <Phone className="h-4 w-4" />
                      Contactar por WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es permanente y eliminará la información enviada por el cliente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// Blog Tab with CRUD
function BlogTab() {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useAdminStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image: '',
    author: '',
  });

  const resetForm = () => {
    setFormData({ title: '', excerpt: '', content: '', category: '', image: '', author: '' });
    setEditingPost(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      image: post.image,
      author: post.author,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const postData: BlogPost = {
      id: editingPost?.id || Date.now().toString(),
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      excerpt: formData.excerpt,
      content: formData.content,
      image: formData.image,
      author: formData.author,
      authorAvatar: editingPost?.authorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: formData.category,
      tags: editingPost?.tags || [],
      readTime: Math.ceil(formData.content.split(' ').length / 200),
      createdAt: editingPost?.createdAt || new Date().toISOString().split('T')[0],
    };

    if (editingPost) {
      updateBlogPost(editingPost.id, postData);
      toast.success('Artículo actualizado');
    } else {
      addBlogPost(postData);
      toast.success('Artículo creado');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBlogPost(deleteId);
      toast.success('Artículo eliminado');
      setDeleteId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex justify-end mb-6">
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artículo
        </Button>
      </div>

      <div className="grid gap-4">
        {blogPosts.map(post => (
          <div key={post.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
            <img src={post.image} alt={post.title} className="w-24 h-24 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{post.category}</Badge>
                  <h3 className="font-display font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{post.author} • {post.readTime} min de lectura</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Decoración, Tendencias..." />
              </div>
              <div className="space-y-2">
                <Label>Autor</Label>
                <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL de Imagen</Label>
              <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Extracto</Label>
              <Textarea rows={2} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contenido</Label>
              <Textarea rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {editingPost ? 'Guardar' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// Contact Tab
function ContactTab() {
  const { contactInfo, updateContactInfo } = useAdminStore();
  const [formData, setFormData] = useState(contactInfo);

  const handleSave = () => {
    updateContactInfo(formData);
    toast.success('Información de contacto actualizada');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="max-w-2xl">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <h3 className="font-display font-semibold text-lg">Información de Contacto</h3>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Horario</Label>
              <Input value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="font-medium mb-4">Redes Sociales</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={formData.socialLinks.facebook} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={formData.socialLinks.instagram} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })} />
              </div>
              <div className="space-y-2">
                <Label>Pinterest</Label>
                <Input value={formData.socialLinks.pinterest} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, pinterest: e.target.value } })} />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
