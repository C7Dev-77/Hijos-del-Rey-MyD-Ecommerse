import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdminStore, type AboutPageContent, type TimelineItem, type ValueItem, type TeamMember } from '@/store/adminStore';
import { toast } from 'sonner';
import SingleImageUploader from '@/components/admin/SingleImageUploader';

// ── Componentes auxiliares ──────────────────────────────
const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm">
    <h3 className="font-display text-lg font-semibold mb-4 pb-3 border-b border-border">{title}</h3>
    {children}
  </div>
);

const F = ({
  label, value, onChange, multi = false, ph = '',
}: {
  label: string; value: string; onChange: (v: string) => void;
  multi?: boolean; ph?: string;
}) => (
  <div className="mb-4">
    <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
    {multi
      ? <Textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="resize-none bg-background" placeholder={ph} />
      : <Input value={value} onChange={e => onChange(e.target.value)} placeholder={ph} className="bg-background" />}
  </div>
);

// ─────────────────────────────────────────────────────────
// NosotrosTab — Editor de la página "Nosotros"
// ─────────────────────────────────────────────────────────
export function NosotrosTab() {
  const { aboutPageContent: a, updateAboutPageContent } = useAdminStore();
  const [form, setForm] = useState<AboutPageContent>({ ...a });

  useEffect(() => { setForm(a); }, [a]);

  const setField = <K extends keyof AboutPageContent>(key: K, value: AboutPageContent[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await updateAboutPageContent(form);
      toast.success('Página Nosotros actualizada ✓');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error('Error al actualizar Nosotros', { description: msg });
    }
  };

  // Timeline helpers
  const setTimelineItem = (idx: number, field: keyof TimelineItem, val: string) =>
    setForm(prev => { const t = [...prev.timeline]; t[idx] = { ...t[idx], [field]: val }; return { ...prev, timeline: t }; });
  const addTimelineItem = () => setForm(prev => ({ ...prev, timeline: [...prev.timeline, { year: '', title: '', description: '' }] }));
  const removeTimelineItem = (idx: number) => setForm(prev => ({ ...prev, timeline: prev.timeline.filter((_, i) => i !== idx) }));

  // Values helpers
  const setValueItem = (idx: number, field: keyof ValueItem, val: string) =>
    setForm(prev => { const v = [...prev.values]; v[idx] = { ...v[idx], [field]: val }; return { ...prev, values: v }; });
  const addValueItem = () => setForm(prev => ({ ...prev, values: [...prev.values, { icon: 'Heart', title: '', description: '' }] }));
  const removeValueItem = (idx: number) => setForm(prev => ({ ...prev, values: prev.values.filter((_, i) => i !== idx) }));

  // Team helpers
  const setTeamMember = (idx: number, field: keyof TeamMember, val: string) =>
    setForm(prev => { const t = [...prev.team]; t[idx] = { ...t[idx], [field]: val }; return { ...prev, team: t }; });
  const addTeamMember = () => setForm(prev => ({
    ...prev,
    team: [...prev.team, { id: crypto.randomUUID(), name: '', role: '', image: '', bio: '' }],
  }));
  const removeTeamMember = (idx: number) => setForm(prev => ({ ...prev, team: prev.team.filter((_, i) => i !== idx) }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-16">
      <div className="flex justify-end sticky top-0 z-10 bg-muted/80 backdrop-blur-sm py-3 px-1">
        <Button onClick={handleSave} className="bg-primary text-primary-foreground gap-2 shadow-md">
          <Save className="h-4 w-4" /> Guardar Todos los Cambios
        </Button>
      </div>

      <Sec title="🖼️ Hero — Portada">
        <F label="Título principal" value={form.heroTitle} onChange={v => setField('heroTitle', v)} />
        <F label="Subtítulo" value={form.heroSubtitle} onChange={v => setField('heroSubtitle', v)} multi />
        <F label="URL imagen de fondo" value={form.heroImage} onChange={v => setField('heroImage', v)} ph="https://..." />
        {form.heroImage && <img src={form.heroImage} className="mt-1 h-24 w-full object-cover rounded-lg opacity-75" alt="preview" />}
      </Sec>

      <Sec title="📖 Historia — Sección Quiénes Somos">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Etiqueta" value={form.storyTag} onChange={v => setField('storyTag', v)} />
          <F label="Título" value={form.storyTitle} onChange={v => setField('storyTitle', v)} />
        </div>
        <F label="Párrafo 1" value={form.storyP1} onChange={v => setField('storyP1', v)} multi />
        <F label="Párrafo 2" value={form.storyP2} onChange={v => setField('storyP2', v)} multi />
        <F label="Párrafo 3" value={form.storyP3} onChange={v => setField('storyP3', v)} multi />
        <div className="grid md:grid-cols-3 gap-4">
          <F label="URL imagen lateral" value={form.storyImage} onChange={v => setField('storyImage', v)} ph="https://..." />
          <F label="Número badge (ej: 30+)" value={form.storyBadgeNumber} onChange={v => setField('storyBadgeNumber', v)} />
          <F label="Texto badge (ej: Años de Exp.)" value={form.storyBadgeText} onChange={v => setField('storyBadgeText', v)} />
        </div>
        {form.storyImage && <img src={form.storyImage} className="h-24 rounded-lg object-cover" alt="preview" />}
      </Sec>

      <Sec title="⏱️ Línea de Tiempo">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <F label="Etiqueta superior" value={form.timelineTag} onChange={v => setField('timelineTag', v)} />
          <F label="Título de sección" value={form.timelineTitle} onChange={v => setField('timelineTitle', v)} />
        </div>
        <div className="space-y-4">
          {form.timeline.map((item, idx) => (
            <div key={idx} className="border border-border rounded-lg p-5 relative bg-white shadow-sm">
              <button onClick={() => removeTimelineItem(idx)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="space-y-1"><Label className="text-xs text-muted-foreground">Año / Etiqueta</Label><Input value={item.year} onChange={e => setTimelineItem(idx, 'year', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs text-muted-foreground">Título del Hito</Label><Input value={item.title} onChange={e => setTimelineItem(idx, 'title', e.target.value)} /></div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Descripción detallada</Label>
                <Textarea value={item.description} onChange={e => setTimelineItem(idx, 'description', e.target.value)} rows={2} className="resize-none" />
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addTimelineItem} className="mt-4 gap-2 whitespace-nowrap"><Plus className="h-4 w-4" /> Nuevo Hito</Button>
      </Sec>

      <Sec title="💎 Nuestros Valores">
        <F label="Título de la sección de Valores" value={form.valuesTitle} onChange={v => setField('valuesTitle', v)} />
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {form.values.map((val, idx) => (
            <div key={idx} className="border border-border rounded-lg p-5 relative bg-white shadow-sm">
              <button onClick={() => removeValueItem(idx)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
              <div className="space-y-3">
                <div><Label className="text-xs text-muted-foreground">Ícono (Lucide) ej: Heart, Users, Award, Leaf</Label><Input value={val.icon} onChange={e => setValueItem(idx, 'icon', e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Título del Valor</Label><Input value={val.title} onChange={e => setValueItem(idx, 'title', e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Descripción</Label><Textarea value={val.description} onChange={e => setValueItem(idx, 'description', e.target.value)} rows={2} className="mt-1 resize-none" /></div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addValueItem} className="mt-4 gap-2"><Plus className="h-4 w-4" /> Nuevo Valor</Button>
      </Sec>

      <Sec title="👥 Nuestro Equipo">
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <F label="Etiqueta" value={form.teamTag} onChange={v => setField('teamTag', v)} />
          <F label="Título" value={form.teamTitle} onChange={v => setField('teamTitle', v)} />
          <F label="Subtítulo descriptivo" value={form.teamSubtitle} onChange={v => setField('teamSubtitle', v)} />
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {form.team.map((member, idx) => (
            <div key={member.id} className="border border-border rounded-lg p-5 relative bg-white shadow-sm flex flex-col">
              <button onClick={() => removeTeamMember(idx)} className="absolute top-3 right-3 text-destructive hover:bg-destructive/10 p-1 rounded transition-colors z-10"><Trash2 className="h-4 w-4" /></button>
              <div className="flex items-center gap-3 mb-4">
                {member.image
                  ? <img src={member.image} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm border border-border" />
                  : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border">👤</div>}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{member.name || 'Sin nombre'}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role || 'Sin cargo'}</p>
                </div>
              </div>
              <div className="space-y-3 flex-1 flex flex-col">
                <div><Label className="text-xs text-muted-foreground">Nombre completo</Label><Input value={member.name} onChange={e => setTeamMember(idx, 'name', e.target.value)} className="mt-1 h-8 text-sm" /></div>
                <div><Label className="text-xs text-muted-foreground">Cargo / Rol</Label><Input value={member.role} onChange={e => setTeamMember(idx, 'role', e.target.value)} className="mt-1 h-8 text-sm" /></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Foto del Integrante</Label>
                  <SingleImageUploader value={member.image} onChange={url => setTeamMember(idx, 'image', url)} className="mt-1" />
                </div>
                <div className="flex-1 flex flex-col"><Label className="text-xs text-muted-foreground">Biografía (Se ve al girar la tarjeta)</Label><Textarea value={member.bio} onChange={e => setTeamMember(idx, 'bio', e.target.value)} className="mt-1 resize-none flex-1 min-h-[80px] text-sm" /></div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addTeamMember} className="mt-4 gap-2"><Plus className="h-4 w-4" /> Añadir Miembro al Equipo</Button>
      </Sec>
    </motion.div>
  );
}
