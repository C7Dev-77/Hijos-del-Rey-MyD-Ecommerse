import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdminStore, type HomePageContent } from '@/store/adminStore';
import { toast } from 'sonner';

// ── Componentes auxiliares internos ──────────────────────
const HomeSec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl border border-border p-6 mb-6">
    <h3 className="font-display text-lg font-semibold mb-4 pb-3 border-b border-border">{title}</h3>
    {children}
  </div>
);

const HomeF = ({
  label, value, onChange, multi = false, ph = '', help,
}: {
  label: string; value: string; onChange: (v: string) => void;
  multi?: boolean; ph?: string; help?: string;
}) => (
  <div className="mb-4">
    <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
    {multi
      ? <Textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="resize-none" placeholder={ph} />
      : <Input value={value} onChange={e => onChange(e.target.value)} placeholder={ph} />}
    {help && <p className="text-[10px] text-muted-foreground mt-1">{help}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────
// HomeTab — Editor de la página de Inicio
// ─────────────────────────────────────────────────────────
export function HomeTab() {
  const { homePageContent: h, updateHomePageContent } = useAdminStore();
  const [form, setForm] = useState<HomePageContent>({ ...h });

  useEffect(() => {
    setForm(h);
  }, [h]);

  const setField = <K extends keyof HomePageContent>(key: K, value: HomePageContent[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await updateHomePageContent(form);
      toast.success('Página de Inicio actualizada ✓');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error('Error al actualizar Inicio', { description: msg });
    }
  };

  const setPromoItem = (idx: number, field: 'icon' | 'text', val: string) =>
    setForm(prev => { const p = [...prev.promos]; p[idx] = { ...p[idx], [field]: val }; return { ...prev, promos: p }; });
  const addPromoItem = () => setForm(prev => ({ ...prev, promos: [...prev.promos, { icon: '✨', text: '' }] }));
  const removePromoItem = (idx: number) => setForm(prev => ({ ...prev, promos: prev.promos.filter((_, i) => i !== idx) }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-16">
      <div className="flex justify-end sticky top-0 z-10 bg-muted/80 backdrop-blur-sm py-3 px-1">
        <Button onClick={handleSave} className="bg-primary text-primary-foreground gap-2 shadow-md">
          <Save className="h-4 w-4" /> Guardar Cambios del Inicio
        </Button>
      </div>

      <HomeSec title="🖼️ Portada Gigante (Hero)">
        <HomeF label="Distintivo superior (Badge)" value={form.heroBadgeText} onChange={v => setField('heroBadgeText', v)} ph="✨ Nuevos diseños 2025" />
        <HomeF label="Título principal gigante" value={form.heroTitle} onChange={v => setField('heroTitle', v)} multi />
        <HomeF label="Subtítulo" value={form.heroSubtitle} onChange={v => setField('heroSubtitle', v)} multi />
        <div className="grid md:grid-cols-2 gap-4">
          <HomeF label="Botón Primario" value={form.heroButton1Text} onChange={v => setField('heroButton1Text', v)} />
          <HomeF label="Botón Secundario" value={form.heroButton2Text} onChange={v => setField('heroButton2Text', v)} />
        </div>
        <HomeF label="URL imagen de fondo" value={form.heroImage} onChange={v => setField('heroImage', v)} ph="https://..." />
        {form.heroImage && <img src={form.heroImage} className="mt-1 h-32 w-full object-cover rounded-lg opacity-75" alt="preview" />}
      </HomeSec>

      <HomeSec title="📢 Marquesina Animada (Anuncios Rápidos)">
        <p className="text-sm text-muted-foreground mb-4">Aparecen en la banda que se mueve sola debajo de "Recién llegados". Usa emojis para que destaquen.</p>
        <div className="space-y-4">
          {form.promos.map((promo, idx) => (
            <div key={idx} className="border border-border rounded-lg p-5 relative bg-white shadow-sm">
              <button onClick={() => removePromoItem(idx)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
              <div className="flex gap-4">
                <div className="w-20"><Label className="text-xs text-muted-foreground">Emoji</Label><Input value={promo.icon} onChange={e => setPromoItem(idx, 'icon', e.target.value)} className="mt-1 text-center font-emoji" /></div>
                <div className="flex-1"><Label className="text-xs text-muted-foreground">Mensaje / Promoción</Label><Input value={promo.text} onChange={e => setPromoItem(idx, 'text', e.target.value)} className="mt-1" /></div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addPromoItem} className="mt-4 gap-2 whitespace-nowrap"><Plus className="h-4 w-4" /> Nuevo Anuncio</Button>
      </HomeSec>

      <HomeSec title="🏷️ Títulos de las Secciones">
        <div className="grid md:grid-cols-2 gap-4">
          <HomeF label="Rótulo Favoritos (Ej: Los Favoritos)" value={form.favoritesTitle} onChange={v => setField('favoritesTitle', v)} />
          <HomeF label="Título Más Vendidos" value={form.bestSellersTitle} onChange={v => setField('bestSellersTitle', v)} />
          <HomeF label="Rótulo Novedades" value={form.newArrivalsTitle} onChange={v => setField('newArrivalsTitle', v)} />
          <HomeF label="Título Sección Novedades" value={form.designsTitle} onChange={v => setField('designsTitle', v)} />
        </div>
        <p className="text-sm text-muted-foreground mt-2 border-t pt-2">Nota: Los productos "Más vendidos" y "Novedades" se eligen en la pestaña <strong>Productos</strong>, activando las opciones "Destacado" o "Más Vendido".</p>
      </HomeSec>

      <HomeSec title="📖 Sección Historia en Inicio (Fondo Oscuro Inferior)">
        <HomeF label="Título de la sección" value={form.aboutSectionTitle} onChange={v => setField('aboutSectionTitle', v)} />
        <HomeF label="Párrafo sobre la empresa" value={form.aboutSectionText} onChange={v => setField('aboutSectionText', v)} multi />
        <HomeF label="Texto del botón (Va a /nosotros)" value={form.aboutSectionButtonText} onChange={v => setField('aboutSectionButtonText', v)} />
      </HomeSec>
    </motion.div>
  );
}
