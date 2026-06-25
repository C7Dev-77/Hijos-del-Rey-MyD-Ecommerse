import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrencyCOP } from "@/lib/billing-utils";
import { useBillingClients } from "@/hooks/useBillingClients";
import { useBillingProducts } from "@/hooks/useBillingProducts";
import { useInvoices } from "@/hooks/useInvoices";
import { NewClientDialog, ClientFormData } from "@/components/admin/billing/NewClientDialog";
import { NewProductDialog, ProductFormData } from "@/components/admin/billing/NewProductDialog";

interface InvoiceItem {
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  tax: number;
}

export interface InvoiceFormData {
  client_id: string;
  date: string;
  due_date: string;
  items: InvoiceItem[];
}

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (invoice: InvoiceFormData) => void;
}

const emptyItem: InvoiceItem = { product_id: null, description: "", quantity: 1, unit_price: 0, tax: 19 };

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass = cn(
  "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
  "text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
);

function InvoiceItemCard({
  item,
  index,
  products,
  onUpdate,
  onRemove,
  canRemove,
  onProductSelect,
}: {
  item: InvoiceItem;
  index: number;
  products: { id: string; code: string; name: string; price: number; tax: number; status: string }[];
  onUpdate: (index: number, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  onProductSelect: (index: number, productId: string) => void;
}) {
  const itemTotal = item.quantity * item.unit_price * (1 + item.tax / 100);

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3 relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ítem #{index + 1}
        </span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            canRemove
              ? "text-muted-foreground hover:text-red-600 hover:bg-red-50"
              : "text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <FormField label="Producto del catálogo">
        <select
          className={inputClass}
          value={item.product_id || ""}
          onChange={(e) => onProductSelect(index, e.target.value)}
        >
          <option value="">— Seleccionar producto —</option>
          {products
            .filter((p) => p.status === "active" || p.status === "low_stock")
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          <option value="custom">✏️ Otro / Personalizado</option>
        </select>
      </FormField>

      <FormField label="Descripción">
        <input
          type="text"
          className={inputClass}
          value={item.description}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
          placeholder="Descripción del producto o servicio..."
        />
      </FormField>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Cantidad">
          <input
            type="number"
            min="1"
            className={inputClass}
            value={item.quantity}
            onChange={(e) => onUpdate(index, "quantity", e.target.value)}
          />
        </FormField>
        <FormField label="Precio Unit.">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={item.unit_price}
            onChange={(e) => onUpdate(index, "unit_price", e.target.value)}
          />
        </FormField>
        <FormField label="IVA %">
          <select
            className={inputClass}
            value={item.tax}
            onChange={(e) => onUpdate(index, "tax", e.target.value)}
          >
            <option value={0}>0%</option>
            <option value={5}>5%</option>
            <option value={19}>19%</option>
          </select>
        </FormField>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border/60">
        <span className="text-xs text-muted-foreground">Total ítem (con IVA):</span>
        <span className="text-sm font-bold text-foreground">
          {formatCurrencyCOP(itemTotal)}
        </span>
      </div>
    </div>
  );
}

export function NewInvoiceDialog({ open, onOpenChange, onSave }: NewInvoiceDialogProps) {
  const { clients, createClient } = useBillingClients();
  const { products, createProduct } = useBillingProducts();
  const { generateInvoiceNumber } = useInvoices();

  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem]);
  const [nextNumber, setNextNumber] = useState("Cargando...");

  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      generateInvoiceNumber().then(setNextNumber);
      setClientId("");
      setDate(new Date().toISOString().split("T")[0]);
      setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setItems([emptyItem]);
    }
  }, [open]);

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const totalTax = items.reduce(
    (sum, i) => sum + i.quantity * i.unit_price * (i.tax / 100),
    0
  );
  const total = subtotal + totalTax;

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        product_id: product.id,
        description: product.name,
        quantity: 1,
        unit_price: product.price,
        tax: product.tax,
      };
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === "quantity" || field === "unit_price" || field === "tax") {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const handleCreateClient = async (data: ClientFormData) => {
    const { data: newClient, error } = await createClient(data);
    if (!error && newClient) {
      setClientDialogOpen(false);
      setClientId(newClient.id);
    }
  };

  const handleCreateProduct = async (data: ProductFormData) => {
    const { data: newProduct, error } = await createProduct({
      ...data,
      status: data.stock === 0 ? "inactive" : data.stock <= 5 ? "low_stock" : "active",
    });
    if (!error && newProduct) {
      setProductDialogOpen(false);
      const emptyIndex = items.findIndex((i) => !i.product_id);
      if (emptyIndex !== -1) {
        handleProductSelect(emptyIndex, newProduct.id);
      } else {
        setItems([
          ...items,
          {
            product_id: newProduct.id,
            description: newProduct.name,
            quantity: 1,
            unit_price: newProduct.price,
            tax: newProduct.tax,
          },
        ]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Selecciona un cliente");
      return;
    }
    if (items.some((item) => !item.description || item.quantity <= 0 || item.unit_price < 0)) {
      toast.error("Revisa los ítems de la factura");
      return;
    }
    onSave({ client_id: clientId, date: new Date(date).toISOString(), due_date: new Date(dueDate).toISOString(), items });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Nueva Factura de Venta
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Consecutivo:{" "}
                <span className="font-mono font-medium text-foreground">
                  {nextNumber}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Cliente *">
              <div className="flex gap-2">
                <select
                  className={cn(inputClass, "flex-1")}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.nit}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setClientDialogOpen(true)}
                  title="Crear nuevo cliente"
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </FormField>

            <FormField label="Fecha de Emisión">
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormField>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Productos / Servicios
                </h3>
                <button
                  type="button"
                  onClick={() => setProductDialogOpen(true)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  + Nuevo producto
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="gap-1.5 text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar ítem
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <InvoiceItemCard
                  key={index}
                  item={item}
                  index={index}
                  products={products}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                  onProductSelect={handleProductSelect}
                />
              ))}
            </div>
          </div>

          <div className="bg-muted/40 rounded-xl border border-border p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrencyCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA:</span>
                <span className="font-medium">{formatCurrencyCOP(totalTax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Total a Pagar:</span>
                <span className="text-primary">{formatCurrencyCOP(total)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              Crear Factura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <NewClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onSave={handleCreateClient}
      />
      <NewProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleCreateProduct}
      />
    </Dialog>
  );
}
