import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart, Clock, RefreshCw, Truck, CheckCircle2, XCircle,
  Filter, Search, Package, PackageOpen, MapPin, CreditCard, User,
  AlertTriangle, Trash2, DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminStore } from '@/store/adminStore';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Order, Product } from '@/types';

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente', processing: 'Procesando',
    shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  };
  return map[status] || status;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'processing': return <RefreshCw className="h-4 w-4" />;
    case 'shipped': return <Truck className="h-4 w-4" />;
    case 'delivered': return <CheckCircle2 className="h-4 w-4" />;
    case 'cancelled': return <XCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    case 'processing': return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    case 'shipped': return 'bg-purple-500/15 text-purple-600 border-purple-500/30';
    case 'delivered': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    case 'cancelled': return 'bg-red-500/15 text-red-600 border-red-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function OrdersTab() {
  const { orders, updateOrderStatus, fetchOrders, isLoadingOrders } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;

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
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteId) return;
    await updateOrderStatus(deleteId, 'cancelled');
    toast.success('Pedido cancelado');
    setDeleteId(null);
    if (selectedOrder?.id === deleteId) setSelectedOrder(null);
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

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ID, dirección..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchOrders()} disabled={isLoadingOrders}>
            <RefreshCw className={cn('h-4 w-4', isLoadingOrders && 'animate-spin')} />
          </Button>
        </div>
      </div>

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
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{order.id?.slice(0, 8)}...</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{order.createdAt}</td>
                    <td className="py-3 px-4 text-sm max-w-[220px] truncate">{order.shippingAddress}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" />{order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}{getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
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
          <div className="bg-muted/30 px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Mostrando {filteredOrders.length} de {orders.length} pedidos</span>
            <span className="font-medium text-foreground">
              Total visible: {formatPrice(filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
            </span>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Package className="h-5 w-5 text-primary" /></div>
                  <div>
                    <span className="block">Detalle del Pedido</span>
                    <span className="text-xs font-mono text-muted-foreground font-normal">{selectedOrder.id}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border', getStatusColor(selectedOrder.status))}>
                      {getStatusIcon(selectedOrder.status)}{getStatusLabel(selectedOrder.status)}
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Dirección de Envío</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Método de Pago</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.paymentMethod}</p>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mt-3"><User className="h-4 w-4 text-primary" /> ID de Usuario</h4>
                    <p className="text-xs text-muted-foreground font-mono">{selectedOrder.userId || 'N/A'}</p>
                  </div>
                </div>
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2.5">
                    <h4 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Productos del Pedido</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {Array.isArray(selectedOrder.products) && selectedOrder.products.length > 0 ? (
                      selectedOrder.products.map((item: { product?: Product; name?: string; price?: number; quantity?: number; image?: string }, idx: number) => {
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
                        <AlertTriangle className="h-4 w-4 inline-block mr-1" />Sin detalle de productos disponible
                      </div>
                    )}
                  </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este pedido?</AlertDialogTitle>
            <AlertDialogDescription>El pedido será marcado como cancelado. Esta acción se puede revertir cambiando el estado nuevamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground">Sí, cancelar pedido</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unused import kept for type completeness */}
      <Badge className="hidden" />
    </motion.div>
  );
}
