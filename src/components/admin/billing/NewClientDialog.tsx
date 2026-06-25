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
import { Building2 } from "lucide-react";
import { toast } from "sonner";

export interface ClientFormData {
  name: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface NewClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: ClientFormData) => void;
  initialData?: ClientFormData;
}

const emptyClient: ClientFormData = { name: "", nit: "", email: "", phone: "", address: "", city: "" };

export function NewClientDialog({ open, onOpenChange, onSave, initialData }: NewClientDialogProps) {
  const [form, setForm] = useState<ClientFormData>(emptyClient);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialData || emptyClient);
    }
  }, [open, initialData]);

  const update = (field: keyof ClientFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.nit.trim()) {
      toast.error("Nombre y NIT son obligatorios");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      onSave(form);
      setForm(emptyClient);
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
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{initialData ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
              <DialogDescription>{initialData ? "Modificar los datos del cliente" : "Registrar un nuevo cliente o tercero"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Razón Social *" value={form.name} onChange={(v) => update("name", v)} placeholder="Nombre de la empresa" />
            <FormInput label="NIT *" value={form.nit} onChange={(v) => update("nit", v)} placeholder="900.123.456-7" />
            <FormInput label="Correo Electrónico" value={form.email} onChange={(v) => update("email", v)} placeholder="contacto@empresa.com" type="email" />
            <FormInput label="Teléfono" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+57 1 234 5678" />
            <FormInput label="Dirección" value={form.address} onChange={(v) => update("address", v)} placeholder="Cra 45 #67-89" />
            <FormInput label="Ciudad" value={form.city} onChange={(v) => update("city", v)} placeholder="Bogotá" />
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "transition-all duration-200"
        )}
      />
    </div>
  );
}
