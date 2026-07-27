import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/store/adminStore';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

export function DashboardTab() {
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

  const ventasMes = salesData[salesData.length - 1]?.ventas ?? 0;

  const chartProducts = [...products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5)
    .map(p => ({ name: p.name.slice(0, 22), ventas: p.salesCount || 0 }));

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

  const getOrderStatusLabel = (status: Order['status']) => {
    const map: Record<Order['status'], string> = {
      pending: 'Pendiente', processing: 'En proceso',
      shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
    };
    return map[status] ?? status;
  };

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
                        {getOrderStatusLabel(order.status)}
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
