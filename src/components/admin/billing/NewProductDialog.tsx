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
import { Package } from "lucide-react";
import { toast } from "sonner";
import { BILLING_PRODUCT_CATEGORIES } from "@/hooks/useBillingProducts";

export interface ProductFormData {
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  tax: number;
  stock: number;
}

interface NewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductFormData) => void;
  initialData?: ProductFormData;
}

const emptyProduct: ProductFormData = {
  code: "",
  name: "",
  description: "",
  category: BILLING_PRODUCT_CATEGORIES[0],
  price: 0,
  tax: 19,
  stock: 999,
};

export function NewProductDialog({ open, onOpenChange, onSave, initialData }: NewProductDialogProps) {
  const [form, setForm] = useState<ProductFormData>(emptyProduct);
  const [saving, setSaving] = useState(false);

  // Cargar datos iniciales al abrir
  useEffect(() => {
    if (open) {
      setForm(initialData || emptyProduct);
    }
  }, [open, initialData]);

  const update = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Código y nombre son obligatorios");
      return;
    }
    if (form.price < 0) {
      toast.error("El precio no puede ser negativo");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      onSave(form);
      setForm(emptyProduct);
      setSaving(false);
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{initialData ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              <DialogDescription>{initialData ? "Modificar los datos del producto" : "Agregar producto o servicio al catálogo"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Código *</label>
              <input
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="Ej: SOF-001"
                className={cn(
                  "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={cn(
                  "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
                  "text-foreground cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              >
                {BILLING_PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ej: Sofá Chester 3 Puestos"
              className={cn(
                "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Ej: Tapizado en tela anti-fluidos, color gris plomo"
              rows={2}
              className={cn(
                "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm resize-none",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              )}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Precio (COP) *</label>
              <input
                type="number"
                value={form.price || ""}
                onChange={(e) => update("price", Number(e.target.value))}
                placeholder="0"
                min={0}
                className={cn(
                  "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">IVA %</label>
              <select
                value={form.tax}
                onChange={(e) => update("tax", Number(e.target.value))}
                className={cn(
                  "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
                  "text-foreground cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                )}
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={19}>19%</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => update("stock", Number(e.target.value))}
                min={0}
                className={cn(
                  "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Guardando..." : "Guardar Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
