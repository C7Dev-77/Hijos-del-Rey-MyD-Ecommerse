import { InvoiceStatusBadge } from "@/components/ui/status-badge";
import { Eye, FileText, Mail, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvoices, type Invoice } from "@/hooks/useInvoices";
import { formatCurrencyCOP, downloadInvoicePDF } from "@/lib/billing-utils";
import { useBillingSettings, type BillingCompanySettings } from "@/hooks/useBillingSettings";
import { toast } from "sonner";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ActionButton({ invoice, settings }: { invoice: Invoice, settings: BillingCompanySettings | null }) {
  const handleDownload = () => {
    const pdfData = {
      number: invoice.number,
      client: invoice.client?.name || "Consumidor Final",
      nit: invoice.client?.nit || "222222222222",
      clientAddress: invoice.client?.address,
      clientPhone: invoice.client?.phone,
      clientCity: invoice.client?.city,
      clientEmail: invoice.client?.email,
      date: invoice.date,
      dueDate: invoice.due_date,
      items: invoice.invoice_items?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        tax: item.tax
      })) || []
    };

    downloadInvoicePDF(pdfData, settings);
  };

  const handleEmail = () => {
    if (!invoice.client?.email) {
      toast.error("El cliente no tiene email registrado");
      return;
    }
    toast.success(`Factura enviada a ${invoice.client.email}`);
  };

  const handleWhatsApp = () => {
    if (!invoice.client?.phone) {
      toast.error("El cliente no tiene teléfono registrado");
      return;
    }
    const message = `Hola ${invoice.client.name}, adjunto la factura ${invoice.number}.`;
    window.open(`https://wa.me/57${invoice.client.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Ver / Descargar PDF"
        onClick={handleDownload}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Descargar PDF"
        onClick={handleDownload}
      >
        <FileText className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        title="Enviar por email"
        onClick={handleEmail}
      >
        <Mail className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-green-600"
        title="Enviar por WhatsApp"
        onClick={handleWhatsApp}
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
    </>
  );
}

export function RecentSalesTable() {
  const { invoices, loading } = useInvoices();
  const { settings } = useBillingSettings();

  // Obtener las últimas 5 facturas (excluyendo canceladas)
  const recentInvoices = invoices
    .filter(inv => inv.status !== 'cancelled')
    .slice(0, 5);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Ventas Recientes</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Últimas facturas emitidas</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (recentInvoices.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Ventas Recientes</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Últimas facturas emitidas</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">No hay facturas aún</p>
          <p className="text-sm text-muted-foreground mt-1">
            Las facturas que crees aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-semibold text-foreground">Ventas Recientes</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Últimas facturas emitidas</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Factura
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Monto
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-foreground">{invoice.number}</span>
                </td>
                <td className="px-6 py-4 text-foreground">
                  {invoice.client?.name || 'Cliente Eliminado'}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{formatDate(invoice.date)}</td>
                <td className="px-6 py-4 text-right font-semibold text-foreground">
                  {formatCurrencyCOP(invoice.total_amount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <ActionButton invoice={invoice} settings={settings} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
