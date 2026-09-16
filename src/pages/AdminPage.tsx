import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, FileText, LogOut,
  Menu, X, Home, Settings, ClipboardList, Users2,
  PanelLeftClose, PanelLeftOpen, UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import { cn } from '@/lib/utils';

// ── Tab components (cada uno en su propio archivo) ───────
import { DashboardTab } from '@/components/admin/DashboardTab';
import { HomeTab } from '@/components/admin/HomeTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { QuotesTab } from '@/components/admin/QuotesTab';
import { BlogTab } from '@/components/admin/BlogTab';
import { NosotrosTab } from '@/components/admin/NosotrosTab';
import { ProfileTab } from '@/components/admin/ProfileTab';
import HomeContentTab from '@/components/admin/HomeContentTab';
import { BillingTab } from '@/components/admin/billing/BillingTab';

type AdminTab =
  | 'dashboard' | 'products' | 'orders' | 'blog' | 'quotes'
  | 'home' | 'config' | 'nosotros' | 'billing' | 'perfil';

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { user, logout } = useAuthStore();
  const { fetchProducts, fetchBlogPosts, fetchOrders, fetchSettings } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchBlogPosts();
    fetchOrders();
    fetchSettings();
  }, [fetchProducts, fetchBlogPosts, fetchOrders, fetchSettings]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const navGroups = [
    {
      title: 'Resumen',
      items: [
        { id: 'dashboard' as AdminTab, label: 'Dashboard',       icon: LayoutDashboard },
      ]
    },
    {
      title: 'Ventas & Operaciones',
      items: [
        { id: 'orders'    as AdminTab, label: 'Pedidos',         icon: ShoppingCart },
        { id: 'billing'   as AdminTab, label: 'Facturación',     icon: FileText },
        { id: 'quotes'    as AdminTab, label: 'Cotizaciones',    icon: ClipboardList },
      ]
    },
    {
      title: 'Catálogo',
      items: [
        { id: 'products'  as AdminTab, label: 'Productos',       icon: Package },
      ]
    },
    {
      title: 'Contenido (Web)',
      items: [
        { id: 'home'      as AdminTab, label: 'Página Inicio',   icon: Home },
        { id: 'nosotros'  as AdminTab, label: 'Página Nosotros', icon: Users2 },
        { id: 'blog'      as AdminTab, label: 'Blog',            icon: FileText },
      ]
    },
    {
      title: 'Ajustes y Sistema',
      items: [
        { id: 'config'    as AdminTab, label: 'Configuración',   icon: Settings },
        { id: 'perfil'    as AdminTab, label: 'Mi Perfil',       icon: UserCircle },
      ]
    }
  ];

  const TAB_TITLES: Record<AdminTab, string> = {
    dashboard: 'Dashboard',
    billing:   'Facturación Electrónica',
    products:  'Productos',
    orders:    'Pedidos',
    quotes:    'Cotizaciones',
    blog:      'Blog',
    home:      'Página Inicio',
    nosotros:  'Página Nosotros',
    config:    'Configuración General',
    perfil:    'Mi Perfil',
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 bg-sidebar transition-all duration-300',
        sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border overflow-hidden">
            <Link to="/" className="font-display text-lg font-bold text-sidebar-foreground">
              {sidebarOpen ? <span>M&D <span className="text-gold">Admin</span></span> : <span className="text-gold">M</span>}
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {sidebarOpen && (
                  <h3 className="px-4 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-2 mt-2">
                    {group.title}
                  </h3>
                )}
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={!sidebarOpen ? item.label : ''}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium',
                      !sidebarOpen && 'justify-center',
                      activeTab === item.id
                        ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border flex flex-col gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Colapsar menú' : 'Expandir menú'}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                !sidebarOpen && 'justify-center'
              )}
            >
              {sidebarOpen
                ? <><PanelLeftClose className="h-5 w-5 shrink-0" /><span className="truncate">Colapsar menú</span></>
                : <PanelLeftOpen className="h-5 w-5 shrink-0" />}
            </button>

            <button
              onClick={handleLogout}
              title={!sidebarOpen ? 'Cerrar Sesión' : ''}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground hover:text-destructive transition-colors rounded-lg hover:bg-sidebar-accent',
                !sidebarOpen && 'justify-center'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="truncate">Cerrar Sesión</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">{TAB_TITLES[activeTab]}</h1>
            <p className="text-muted-foreground">Bienvenido, {user?.user_metadata?.name || user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
          {activeTab === 'billing'   && <BillingTab   key="billing" />}
          {activeTab === 'products'  && <ProductsTab  key="products" />}
          {activeTab === 'orders'    && <OrdersTab    key="orders" />}
          {activeTab === 'quotes'    && <QuotesTab    key="quotes" />}
          {activeTab === 'blog'      && <BlogTab      key="blog" />}
          {activeTab === 'nosotros'  && <NosotrosTab  key="nosotros" />}
          {activeTab === 'home'      && <HomeTab      key="home" />}
          {activeTab === 'config'    && <HomeContentTab key="config" />}
          {activeTab === 'perfil'    && <ProfileTab   key="perfil" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
