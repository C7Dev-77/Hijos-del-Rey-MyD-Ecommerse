import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  Settings, 
  Sparkles, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Download, 
  Loader2, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  FileDown,
  Save,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPICard } from './KPICard';
import { RecentSalesTable } from './RecentSalesTable';
import { NewInvoiceDialog } from './NewInvoiceDialog';
import { EditInvoiceDialog } from './EditInvoiceDialog';
import { NewClientDialog, type ClientFormData } from './NewClientDialog';
import { NewProductDialog, type ProductFormData } from './NewProductDialog';
import { AIInvoiceAssistant } from './AIInvoiceAssistant';
import { useInvoices, type Invoice, type InvoiceInput } from '@/hooks/useInvoices';
import { useBillingClients, type BillingClient } from '@/hooks/useBillingClients';
import { useBillingProducts, type BillingProduct } from '@/hooks/useBillingProducts';
import { useBillingSettings } from '@/hooks/useBillingSettings';
import { exportToCSV, formatCurrencyCOP, formatDateCO, downloadInvoicePDF } from '@/lib/billing-utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from 'sonner';

type BillingSubTab = 'dashboard' | 'invoices' | 'clients' | 'products' | 'settings';

export function BillingTab() {
  const [activeTab, setActiveTab] = useState<BillingSubTab>('dashboard');

  const navItems = [
    { id: 'dashboard' as BillingSubTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices' as BillingSubTab, label: 'Facturas', icon: FileText },
    { id: 'clients' as BillingSubTab, label: 'Clientes', icon: Users },
    { id: 'products' as BillingSubTab, label: 'Productos/Servicios', icon: Package },
    { id: 'settings' as BillingSubTab, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navegación */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === item.id 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && <BillingDashboard key="dashboard" onTabChange={setActiveTab} />}
        {activeTab === 'invoices' && <BillingInvoices key="invoices" />}
        {activeTab === 'clients' && <BillingClients key="clients" />}
        {activeTab === 'products' && <BillingProducts key="products" />}
        {activeTab === 'settings' && <BillingSettings key="settings" />}
      </AnimatePresence>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function BillingDashboard({ onTabChange }: { onTabChange: (tab: BillingSubTab) => void }) {
  const { invoices } = useInvoices();
  const { clients } = useBillingClients();
  const { products } = useBillingProducts();
  
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const { createInvoice } = useInvoices();

  const now = new Date();
  const currentYear = now.getFullYear();
  const isSecondSemester = now.getMonth() >= 6;
  const semesterStartDate = new Date(currentYear, isSecondSemester ? 6 : 0, 1);

  const totalVentas = invoices
    .filter(i => {
      if (i.status === 'cancelled') return false;
      const invoiceDate = new Date(i.date);
      return invoiceDate >= semesterStartDate;
    })
    .reduce((sum, i) => sum + i.total_amount, 0);
    
  const ventasPendientes = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.total_amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Resumen de Facturación</h2>
          <p className="text-sm text-muted-foreground">Métricas generales del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border-purple-200" onClick={() => setIsAIOpen(true)}>
            <Sparkles className="w-4 h-4" />
            Asistente IA
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsNewInvoiceOpen(true)}>
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Ventas" subtitle={isSecondSemester ? "2º Semestre" : "1er Semestre"} value={formatCurrencyCOP(totalVentas)} icon={FileText} className="bg-primary/5 border border-primary/10 shadow-sm" iconClassName="bg-primary/20 text-primary" />
        <KPICard title="Por Cobrar" value={formatCurrencyCOP(ventasPendientes)} icon={FileText} className="bg-amber-50/50 border border-amber-200/50 shadow-sm" iconClassName="bg-amber-100 text-amber-700" />
        <KPICard title="Total Clientes" value={clients.length} icon={Users} className="bg-blue-50/50 border border-blue-200/50 shadow-sm" iconClassName="bg-blue-100 text-blue-700" />
        <KPICard title="Catálogo" value={products.length} subtitle="Productos/Servicios" icon={Package} className="bg-emerald-50/50 border border-emerald-200/50 shadow-sm" iconClassName="bg-emerald-100 text-emerald-700" />
      </div>

      <RecentSalesTable />

      <NewInvoiceDialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen} onSave={async (data) => {
          const res = await createInvoice(data);
          if (!res.error) setIsNewInvoiceOpen(false);
      }} />
      <AIInvoiceAssistant open={isAIOpen} onOpenChange={setIsAIOpen} />
    </motion.div>
  );
}

// ─── LISTADO DE FACTURAS ─────────────────────────────────────────────────────
function BillingInvoices() {
  const { invoices, loading, createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice } = useInvoices();
  const { settings } = useBillingSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue' | 'cancelled'>('all');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.client?.nit || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    downloadInvoicePDF({
      number: invoice.number,
      client: invoice.client?.name || 'Cliente sin nombre',
      nit: invoice.client?.nit || '',
      clientAddress: invoice.client?.address,
      clientPhone: invoice.client?.phone,
      clientCity: invoice.client?.city,
      clientEmail: invoice.client?.email,
      date: formatDateCO(invoice.date),
      dueDate: formatDateCO(invoice.due_date),
      items: invoice.invoice_items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        tax: item.tax
      })) || []
    }, settings || undefined);
  };

  const handleExport = () => {
    exportToCSV(
      filteredInvoices.map(inv => ({
        Numero: inv.number,
        Cliente: inv.client?.name || '',
        NIT: inv.client?.nit || '',
        Fecha: inv.date,
        Vencimiento: inv.due_date,
        Total: inv.total_amount,
        Estado: inv.status
      })),
      'Facturas_M_D',
      [
        { key: 'Numero', label: 'Número' },
        { key: 'Cliente', label: 'Cliente' },
        { key: 'NIT', label: 'NIT Cliente' },
        { key: 'Fecha', label: 'Fecha Emisión' },
        { key: 'Vencimiento', label: 'Vencimiento' },
        { key: 'Total', label: 'Total COP' },
        { key: 'Estado', label: 'Estado' }
      ]
    );
    toast.success('Facturas exportadas a CSV');
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Facturas</h2>
          <p className="text-sm text-muted-foreground">Historial y gestión de facturas electrónicas emitidas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button className="gap-2" onClick={() => setIsNewOpen(true)}>
            <Plus className="w-4 h-4" /> Nueva Factura
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {(['all', 'pending', 'paid', 'overdue', 'cancelled'] as const).map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="text-xs capitalize"
            >
              {status === 'all' ? 'Todos' : getStatusLabel(status)}
            </Button>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Número</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Fecha</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/25 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{invoice.number}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{invoice.client?.name || 'Cliente sin Nombre'}</p>
                      <p className="text-xs text-muted-foreground">NIT: {invoice.client?.nit || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-foreground">{formatDateCO(invoice.date)}</p>
                    <p className="text-[10px] text-muted-foreground">Vence: {formatDateCO(invoice.due_date)}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">{formatCurrencyCOP(invoice.total_amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={getStatusBadgeVariant(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(invoice)} title="Descargar PDF">
                      <FileDown className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingInvoice(invoice)} title="Editar Factura">
                      <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    {invoice.status === 'pending' && (
                      <Button variant="ghost" size="sm" onClick={() => updateInvoiceStatus(invoice.id, 'paid')} title="Marcar como Pagada" className="text-emerald-600 hover:text-emerald-700">
                        ✓
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => {
                      if (confirm('¿Deseas eliminar esta factura?')) deleteInvoice(invoice.id);
                    }} title="Eliminar" className="text-rose-600 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron facturas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewInvoiceDialog open={isNewOpen} onOpenChange={setIsNewOpen} onSave={async (data) => {
        const res = await createInvoice(data);
        if (!res.error) setIsNewOpen(false);
      }} />

      {editingInvoice && (
        <EditInvoiceDialog
          open={!!editingInvoice}
          onOpenChange={(open) => !open && setEditingInvoice(null)}
          invoice={editingInvoice}
          onSave={async (id: string, data: InvoiceInput) => {
            const res = await updateInvoice(id, data);
            if (!res.error) setEditingInvoice(null);
            return res;
          }}
        />
      )}
    </motion.div>
  );
}

// ─── DIRECTORIO DE CLIENTES ──────────────────────────────────────────────────
function BillingClients() {
  const { clients, loading, createClient, updateClient, deleteClient } = useBillingClients();
  const { invoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<BillingClient | null>(null);

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.nit || '').includes(searchTerm) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clientStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    invoices.forEach(inv => {
      if (inv.status === 'cancelled') return;
      if (!stats[inv.client_id]) stats[inv.client_id] = { count: 0, total: 0 };
      stats[inv.client_id].count += 1;
      stats[inv.client_id].total += inv.total_amount;
    });
    return stats;
  }, [invoices]);

  const handleExport = () => {
    exportToCSV(
      filteredClients.map(c => ({
        Nombre: c.name,
        NIT: c.nit,
        Email: c.email,
        Telefono: c.phone,
        Direccion: c.address,
        Ciudad: c.city
      })),
      'Clientes_Facturacion',
      [
        { key: 'Nombre', label: 'Nombre' },
        { key: 'NIT', label: 'NIT' },
        { key: 'Email', label: 'Email' },
        { key: 'Telefono', label: 'Teléfono' },
        { key: 'Direccion', label: 'Dirección' },
        { key: 'Ciudad', label: 'Ciudad' }
      ]
    );
    toast.success('Clientes exportados a CSV');
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Clientes de Facturación</h2>
          <p className="text-sm text-muted-foreground">Listado e información fiscal de terceros y clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button className="gap-2" onClick={() => { setEditingClient(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre, NIT o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No hay clientes encontrados</h3>
          <p className="text-muted-foreground text-sm mt-1">Crea un nuevo cliente para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground line-clamp-1 text-sm">{client.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">NIT: {client.nit}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> <span className="truncate">{client.email || 'Sin correo'}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> <span>{client.phone || 'Sin teléfono'}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> <span className="truncate">{client.address || 'Sin dirección'}, {client.city || ''}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Facturas</p>
                    <p className="text-sm font-bold text-foreground">{clientStats[client.id]?.count || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total Compras</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrencyCOP(clientStats[client.id]?.total || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setEditingClient(client); setIsDialogOpen(true); }}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-rose-600 hover:text-rose-700" onClick={() => {
                  if (confirm('¿Deseas eliminar este cliente?')) deleteClient(client.id);
                }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={async (data) => {
          let res;
          if (editingClient) res = await updateClient(editingClient.id, data);
          else res = await createClient(data);
          if (!res.error) setIsDialogOpen(false);
        }}
        initialData={editingClient || undefined}
      />
    </motion.div>
  );
}

// ─── CATÁLOGO DE PRODUCTOS/SERVICIOS ──────────────────────────────────────────
function BillingProducts() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useBillingProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BillingProduct | null>(null);

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: string, stock: number) => {
    if (stock <= 0) return { variant: 'destructive' as const, label: 'Sin Stock' };
    if (stock <= 5) return { variant: 'warning' as const, label: 'Stock Bajo' };
    return { variant: 'success' as const, label: 'Activo' };
  };

  const handleExport = () => {
    exportToCSV(
      filteredProducts.map(p => ({
        Codigo: p.code,
        Nombre: p.name,
        Categoria: p.category,
        Precio: p.price,
        IVA: p.tax,
        Stock: p.stock
      })),
      'Productos_Facturacion',
      [
        { key: 'Codigo', label: 'Código' },
        { key: 'Nombre', label: 'Nombre' },
        { key: 'Categoria', label: 'Categoría' },
        { key: 'Precio', label: 'Precio COP' },
        { key: 'IVA', label: 'IVA %' },
        { key: 'Stock', label: 'Stock' }
      ]
    );
    toast.success('Catálogo exportado a CSV');
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Productos y Servicios</h2>
          <p className="text-sm text-muted-foreground">Catálogo de facturación independiente del inventario web</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button className="gap-2" onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No hay productos en catálogo</h3>
          <p className="text-muted-foreground text-sm mt-1">Agrega tu primer producto de facturación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(prod => {
            const statusConfig = getStatusConfig(prod.status, prod.stock);
            return (
              <div key={prod.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground line-clamp-1 text-sm">{prod.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">Cod: {prod.code}</p>
                      </div>
                    </div>
                    <StatusBadge status={statusConfig.variant}>{statusConfig.label}</StatusBadge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{prod.description || 'Sin descripción.'}</p>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Precio base</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrencyCOP(prod.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Stock actual</p>
                      <p className="text-sm font-bold text-foreground">{prod.stock} unidades</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-muted/30 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] bg-background border border-border px-2 py-0.5 rounded text-muted-foreground">{prod.category}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => { setEditingProduct(prod); setIsDialogOpen(true); }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-rose-600 hover:text-rose-700" onClick={() => {
                      if (confirm('¿Deseas eliminar este producto?')) deleteProduct(prod.id);
                    }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NewProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={async (data) => {
          let res;
          if (editingProduct) res = await updateProduct(editingProduct.id, data);
          else res = await createProduct({
            ...data,
            status: data.stock === 0 ? 'inactive' : data.stock <= 5 ? 'low_stock' : 'active'
          });
          if (!res.error) setIsDialogOpen(false);
        }}
        initialData={editingProduct || undefined}
      />
    </motion.div>
  );
}

// ─── CONFIGURACIÓN DE FACTURACIÓN ───────────────────────────────────────────
function BillingSettings() {
  const { settings, loading, updateSettings } = useBillingSettings();
  const [formData, setFormData] = useState({
    company_name: '',
    nit: '',
    phone: '',
    address: '',
    city: '',
    email: '',
    resolution_number: '',
    resolution_date: '',
    prefix: '',
    start_range: 1,
    end_range: 10000,
    current_number: 1
  });
  const [saving, setSaving] = useState(false);

  // Cargar datos cuando cargue la base
  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        nit: settings.nit || '',
        phone: settings.phone || '',
        address: settings.address || '',
        city: settings.city || '',
        email: settings.email || '',
        resolution_number: settings.resolution_number || '',
        resolution_date: settings.resolution_date || '',
        prefix: settings.prefix || '',
        start_range: settings.start_range || 1,
        end_range: settings.end_range || 10000,
        current_number: settings.current_number || 1
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await updateSettings(formData);
      if (error) throw error;
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Configuración de Facturación</h2>
        <p className="text-sm text-muted-foreground">Datos comerciales, resolución de numeración DIAN y prefijos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-sm border-b border-border pb-2 text-foreground">Información Comercial y Fiscal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Nombre Comercial / Razón Social</label>
              <input type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">NIT de la Empresa</label>
              <input type="text" value={formData.nit} onChange={e => setFormData({ ...formData, nit: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Teléfono de Contacto</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email de Facturación</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Dirección Fiscal</label>
              <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ciudad - País</label>
              <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          <h3 className="font-semibold text-sm border-b border-border pb-2 text-foreground">Resolución de Numeración DIAN</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Número de Resolución</label>
              <input type="text" value={formData.resolution_number} onChange={e => setFormData({ ...formData, resolution_number: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Fecha de Resolución</label>
              <input type="date" value={formData.resolution_date} onChange={e => setFormData({ ...formData, resolution_date: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Prefijo de Factura</label>
              <input type="text" value={formData.prefix} placeholder="Ej: AA" onChange={e => setFormData({ ...formData, prefix: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Rango Inicial</label>
              <input type="number" value={formData.start_range} onChange={e => setFormData({ ...formData, start_range: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Rango Final</label>
              <input type="number" value={formData.end_range} onChange={e => setFormData({ ...formData, end_range: parseInt(e.target.value) || 10000 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Consecutivo Actual</label>
              <input type="number" value={formData.current_number} onChange={e => setFormData({ ...formData, current_number: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground text-emerald-600 font-bold" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={saving} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Configuración
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
