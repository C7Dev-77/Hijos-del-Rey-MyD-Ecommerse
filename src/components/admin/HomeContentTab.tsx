import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/store/adminStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Save, Store, Link as LinkIcon, Shield, Search, Users,
    Globe, AlertTriangle, CheckCircle2, Eye, Pencil, Trash2, Plus, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

// ── Tipos del Equipo ──────────────────────────────────────────────────────────
interface TeamMember {
    id: string;
    name: string;
    role: string;
    image: string;
    bio: string;
}

const defaultTeam: TeamMember[] = [
    {
        id: '1',
        name: 'Manuel Rodríguez',
        role: 'Fundador & Maestro Ebanista',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bio: 'Con más de 40 años de experiencia en ebanistería, Manuel es el alma de M&D.',
    },
    {
        id: '2',
        name: 'Daniela Martínez',
        role: 'Co-Fundadora & Directora de Diseño',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        bio: 'Arquitecta de formación, Daniela aporta la visión estética moderna a nuestros diseños.',
    },
    {
        id: '3',
        name: 'Carlos Herrera',
        role: 'Maestro Carpintero Senior',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        bio: 'Carlos lleva 25 años perfeccionando el arte de la carpintería fina. Especialista en técnicas de ensamblaje tradicional japonés.',
    },
    {
        id: '4',
        name: 'Ana Lucía Gómez',
        role: 'Especialista en Tapicería',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        bio: 'Ana Lucía transformó su pasión por los textiles en una maestría en tapicería de alta gama.',
    },
];

const TEAM_KEY = 'myb_team_members';

function loadTeam(): TeamMember[] {
    try {
        const raw = localStorage.getItem(TEAM_KEY);
        return raw ? JSON.parse(raw) : defaultTeam;
    } catch { return defaultTeam; }
}

function saveTeam(team: TeamMember[]) {
    localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

// ── Counter badge ─────────────────────────────────────────────────────────────
function CharCounter({ value, max, recommended }: { value: string; max: number; recommended: number }) {
    const len = value.length;
    const ok = len >= 1 && len <= recommended;
    const warn = len > recommended && len <= max;
    const bad = len > max;
    return (
        <span className={`text-xs font-mono ${bad ? 'text-destructive' : warn ? 'text-amber-500' : ok ? 'text-forest' : 'text-muted-foreground'}`}>
            {len}/{max} {ok ? '✓' : bad ? '✗' : ''}
        </span>
    );
}

// ── SEO Preview (simula resultado de Google) ──────────────────────────────────
function SeoPreview({ title, description, url }: { title: string; description: string; url: string }) {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Vista previa en Google
            </p>
            <p className="text-xs text-muted-foreground truncate">{url || 'https://tu-dominio.com'}</p>
            <p className="text-blue-600 text-lg font-medium leading-tight truncate">
                {title || 'Tu título aquí'}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {description || 'Tu descripción aquí. Aparecerá en los resultados de Google.'}
            </p>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function HomeContentTab() {
    const { homePageContent, updateHomePageContent, storeSettings, updateStoreSettings, contactInfo, updateContactInfo } = useAdminStore();
    const [homeData, setHomeData] = useState(homePageContent);
    const [storeData, setStoreData] = useState(storeSettings);
    const [contactData, setContactData] = useState(contactInfo);
    const [team, setTeam] = useState<TeamMember[]>(loadTeam);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sincronizar si el store cambia (por fetchSettings)
    useEffect(() => { setStoreData(storeSettings); }, [storeSettings]);
    useEffect(() => { setHomeData(homePageContent); }, [homePageContent]);
    useEffect(() => { setContactData(contactInfo); }, [contactInfo]);

    const handleSaveHome = async () => {
        setIsSaving(true);
        await updateHomePageContent(homeData);
        toast.success('Contenido de inicio actualizado ✓');
        setIsSaving(false);
    };

    const handleSaveStore = async () => {
        setIsSaving(true);
        await updateStoreSettings(storeData);
        toast.success('Configuración guardada ✓');
        setIsSaving(false);
    };

    const handleSaveContact = async () => {
        setIsSaving(true);
        await updateContactInfo(contactData);
        toast.success('Datos de contacto actualizados ✓');
        setIsSaving(false);
    };

    const handleSaveSEO = async () => {
        setIsSaving(true);
        await updateStoreSettings(storeData);
        // Aplicar inmediatamente al <head>
        document.title = storeData.metaTitle;
        toast.success('SEO actualizado ✓ — Los cambios ya están en el <head>');
        setIsSaving(false);
    };

    const handleSavePolicies = async () => {
        setIsSaving(true);
        await updateStoreSettings(storeData);
        toast.success('Políticas guardadas ✓');
        setIsSaving(false);
    };

    // ── Equipo CRUD ───────────────────────────────────────────────────────────
    const newMember = (): TeamMember => ({
        id: Date.now().toString(),
        name: '', role: '', image: '', bio: '',
    });

    const saveMember = () => {
        if (!editingMember) return;
        const updated = team.some(m => m.id === editingMember.id)
            ? team.map(m => m.id === editingMember.id ? editingMember : m)
            : [...team, editingMember];
        setTeam(updated);
        saveTeam(updated);
        setEditingMember(null);
        toast.success('Miembro del equipo guardado ✓');
    };

    const deleteMember = (id: string) => {
        const updated = team.filter(m => m.id !== id);
        setTeam(updated);
        saveTeam(updated);
        toast.success('Miembro eliminado');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-8">
                        <TabsTrigger value="general" className="flex gap-1.5"><Store className="h-4 w-4" />General</TabsTrigger>
                        <TabsTrigger value="home" className="flex gap-1.5"><LinkIcon className="h-4 w-4" />Inicio</TabsTrigger>
                        <TabsTrigger value="seo" className="flex gap-1.5"><Search className="h-4 w-4" />SEO</TabsTrigger>
                        <TabsTrigger value="team" className="flex gap-1.5"><Users className="h-4 w-4" />Equipo</TabsTrigger>
                        <TabsTrigger value="policies" className="flex gap-1.5"><Shield className="h-4 w-4" />Políticas</TabsTrigger>
                    </TabsList>

                    {/* ── GENERAL ─────────────────────────────────────────────────── */}
                    <TabsContent value="general">
                        <div className="space-y-6">
                            {/* Tienda */}
                            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                                <h3 className="font-display font-semibold text-lg border-b pb-3 flex items-center gap-2">
                                    <Store className="h-5 w-5 text-primary" /> Datos de la Tienda
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre de la Tienda</Label>
                                        <Input value={storeData.storeName} onChange={e => setStoreData({ ...storeData, storeName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Moneda</Label>
                                        <Input value={storeData.currency} onChange={e => setStoreData({ ...storeData, currency: e.target.value })} placeholder="COP" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Descripción Corta</Label>
                                        <Textarea value={storeData.storeDescription} onChange={e => setStoreData({ ...storeData, storeDescription: e.target.value })} rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL del Logo</Label>
                                        <Input value={storeData.logoUrl} onChange={e => setStoreData({ ...storeData, logoUrl: e.target.value })} placeholder="/logo.png" />
                                        {storeData.logoUrl && (
                                            <img src={storeData.logoUrl} alt="Logo preview" className="h-12 object-contain mt-1" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Monto Mínimo para Envío Gratis (COP)</Label>
                                        <Input type="number" value={storeData.freeShippingThreshold} onChange={e => setStoreData({ ...storeData, freeShippingThreshold: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <Button onClick={handleSaveStore} disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                                    <Save className="h-4 w-4 mr-2" /> Guardar Configuración General
                                </Button>
                            </div>

                            {/* Contacto */}
                            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                                <h3 className="font-display font-semibold text-lg border-b pb-3 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" /> Información de Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Teléfono</Label>
                                        <Input value={contactData.phone} onChange={e => setContactData({ ...contactData, phone: e.target.value })} placeholder="+57 300 000 0000" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>WhatsApp (solo números)</Label>
                                        <Input value={contactData.whatsapp} onChange={e => setContactData({ ...contactData, whatsapp: e.target.value })} placeholder="+57 324 000 0000" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Dirección</Label>
                                        <Input value={contactData.address} onChange={e => setContactData({ ...contactData, address: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Horario de Atención</Label>
                                        <Input value={contactData.schedule} onChange={e => setContactData({ ...contactData, schedule: e.target.value })} placeholder="Lun - Sáb: 8AM - 6PM" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Facebook URL</Label>
                                        <Input value={contactData.socialLinks?.facebook || ''} onChange={e => setContactData({ ...contactData, socialLinks: { ...contactData.socialLinks, facebook: e.target.value } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Instagram URL</Label>
                                        <Input value={contactData.socialLinks?.instagram || ''} onChange={e => setContactData({ ...contactData, socialLinks: { ...contactData.socialLinks, instagram: e.target.value } })} />
                                    </div>
                                </div>
                                <Button onClick={handleSaveContact} disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                                    <Save className="h-4 w-4 mr-2" /> Guardar Contacto
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── INICIO ──────────────────────────────────────────────────── */}
                    <TabsContent value="home">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-3">Contenido de Inicio</h3>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sección Hero</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Texto del distintivo (Badge)</Label>
                                        <Input value={homeData.heroBadgeText} onChange={e => setHomeData({ ...homeData, heroBadgeText: e.target.value })} placeholder="✨ Nuevos diseños 2025" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL Imagen de Fondo</Label>
                                        <Input value={homeData.heroImage} onChange={e => setHomeData({ ...homeData, heroImage: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Título Principal</Label>
                                        <Input value={homeData.heroTitle} onChange={e => setHomeData({ ...homeData, heroTitle: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Subtítulo</Label>
                                        <Textarea value={homeData.heroSubtitle} onChange={e => setHomeData({ ...homeData, heroSubtitle: e.target.value })} rows={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Botón Principal (Catálogo)</Label>
                                        <Input value={homeData.heroButton1Text} onChange={e => setHomeData({ ...homeData, heroButton1Text: e.target.value })} placeholder="Explorar Catálogo" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Botón Secundario (Cotizar)</Label>
                                        <Input value={homeData.heroButton2Text} onChange={e => setHomeData({ ...homeData, heroButton2Text: e.target.value })} placeholder="Cotizar Mueble" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Títulos de Secciones</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Favoritos', key: 'favoritesTitle' },
                                        { label: 'Más Vendidos', key: 'bestSellersTitle' },
                                        { label: 'Recién Llegados', key: 'newArrivalsTitle' },
                                        { label: 'Sección Diseños', key: 'designsTitle' },
                                    ].map(({ label, key }) => (
                                        <div key={key} className="space-y-2">
                                            <Label>{label}</Label>
                                            <Input
                                                value={homeData[key as keyof typeof homeData] as string}
                                                onChange={e => setHomeData({ ...homeData, [key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sección Nosotros (Inferior)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Título de la Sección</Label>
                                        <Input value={homeData.aboutSectionTitle} onChange={e => setHomeData({ ...homeData, aboutSectionTitle: e.target.value })} placeholder="Ej: Artesanía de Excelencia" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Texto del Botón</Label>
                                        <Input value={homeData.aboutSectionButtonText} onChange={e => setHomeData({ ...homeData, aboutSectionButtonText: e.target.value })} placeholder="Conoce Nuestra Historia" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Descripción de la Sección</Label>
                                        <Textarea value={homeData.aboutSectionText} onChange={e => setHomeData({ ...homeData, aboutSectionText: e.target.value })} rows={3} placeholder="Contenido que habla de la trayectoria de M&D..." />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleSaveHome} disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                                <Save className="h-4 w-4 mr-2" /> Guardar Inicio
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ── SEO ─────────────────────────────────────────────────────── */}
                    <TabsContent value="seo">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-3 flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" /> Optimización para Buscadores (SEO)
                            </h3>

                            {/* Guía rápida */}
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-1">
                                <p className="font-medium text-primary">¿Por qué importa el SEO?</p>
                                <p className="text-muted-foreground">Estos textos aparecen en Google cuando alguien busca muebles. Un buen título y descripción aumentan las visitas a tu tienda.</p>
                            </div>

                            <div className="space-y-5">
                                {/* Meta Título */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Meta Título</Label>
                                        <CharCounter value={storeData.metaTitle} max={70} recommended={60} />
                                    </div>
                                    <Input
                                        value={storeData.metaTitle}
                                        onChange={e => setStoreData({ ...storeData, metaTitle: e.target.value })}
                                        placeholder="M&D Hijos del Rey | Muebles Artesanales Colombia"
                                    />
                                    <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres. Incluye el nombre de la marca y una palabra clave.</p>
                                </div>

                                {/* Meta Descripción */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Meta Descripción</Label>
                                        <CharCounter value={storeData.metaDescription} max={165} recommended={155} />
                                    </div>
                                    <Textarea
                                        value={storeData.metaDescription}
                                        onChange={e => setStoreData({ ...storeData, metaDescription: e.target.value })}
                                        placeholder="Muebles artesanales colombianos de alta calidad. Sofás, comedores, alcobas y más. Hecho a mano en Sampués, Sucre. ¡Cotiza gratis!"
                                        rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground">Recomendado: 120-155 caracteres. Incluye palabras clave y una llamada a la acción.</p>
                                </div>

                                {/* Preview en tiempo real */}
                                <SeoPreview
                                    title={storeData.metaTitle}
                                    description={storeData.metaDescription}
                                    url={window.location.origin}
                                />

                                {/* Alertas de calidad */}
                                <div className="space-y-2">
                                    {storeData.metaTitle.length < 30 && (
                                        <div className="flex items-center gap-2 text-amber-500 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            El título es muy corto. Agrega el nombre de tu negocio y una descripción.
                                        </div>
                                    )}
                                    {storeData.metaDescription.length < 80 && (
                                        <div className="flex items-center gap-2 text-amber-500 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            La descripción es muy corta. Google muestra hasta 155 caracteres.
                                        </div>
                                    )}
                                    {storeData.metaTitle.length >= 30 && storeData.metaDescription.length >= 80 && (
                                        <div className="flex items-center gap-2 text-forest text-sm">
                                            <CheckCircle2 className="h-4 w-4" />
                                            ¡Buen SEO! Tu título y descripción tienen una longitud correcta.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button onClick={handleSaveSEO} disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                                <Save className="h-4 w-4 mr-2" /> Guardar & Aplicar SEO
                            </Button>
                        </div>
                    </TabsContent>

                    {/* ── EQUIPO ──────────────────────────────────────────────────── */}
                    <TabsContent value="team">
                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center justify-between border-b pb-3 mb-5">
                                    <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" /> Nuestro Equipo
                                    </h3>
                                    <Button size="sm" onClick={() => setEditingMember(newMember())}>
                                        <Plus className="h-4 w-4 mr-1" /> Agregar miembro
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Los cambios aquí se reflejan en la página <strong>/nosotros</strong> al recargar.
                                </p>

                                {/* Lista de miembros */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {team.map(member => (
                                        <div key={member.id} className="flex items-start gap-3 p-4 border border-border rounded-xl hover:border-primary/50 transition-colors">
                                            <img
                                                src={member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'}
                                                alt={member.name}
                                                className="w-14 h-14 rounded-full object-cover shrink-0"
                                                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'; }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{member.name || 'Sin nombre'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{member.bio}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 shrink-0">
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingMember({ ...member })}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMember(member.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panel de edición de miembro */}
                            {editingMember && (
                                <div className="bg-card border-2 border-primary/30 rounded-xl p-6 space-y-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Pencil className="h-4 w-4 text-primary" />
                                        {editingMember.name ? `Editando: ${editingMember.name}` : 'Nuevo miembro'}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nombre</Label>
                                            <Input value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} placeholder="Nombre completo" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cargo / Rol</Label>
                                            <Input value={editingMember.role} onChange={e => setEditingMember({ ...editingMember, role: e.target.value })} placeholder="Maestro Ebanista" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> URL de la Foto</Label>
                                            <Input value={editingMember.image} onChange={e => setEditingMember({ ...editingMember, image: e.target.value })} placeholder="https://..." />
                                            {editingMember.image && (
                                                <img src={editingMember.image} alt="preview" className="h-20 w-20 rounded-full object-cover mt-1" />
                                            )}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Biografía</Label>
                                            <Textarea value={editingMember.bio} onChange={e => setEditingMember({ ...editingMember, bio: e.target.value })} rows={3} placeholder="Breve descripción del artesano..." />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={saveMember} className="flex-1 bg-primary text-primary-foreground">
                                            <Save className="h-4 w-4 mr-2" /> Guardar Miembro
                                        </Button>
                                        <Button variant="outline" onClick={() => setEditingMember(null)} className="flex-1">
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── POLÍTICAS ───────────────────────────────────────────────── */}
                    <TabsContent value="policies">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-3 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" /> Políticas Legales
                            </h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                                <p className="font-medium">Estas políticas se aplican a <strong>todos los productos</strong> por igual.</p>
                                <p>Aparecen en la página de producto, el checkout y el catálogo.</p>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { label: 'Política de Envíos', key: 'shippingPolicy', placeholder: 'Envíos a nivel nacional en Colombia...' },
                                    { label: 'Política de Devoluciones', key: 'returnPolicy', placeholder: 'Se aceptan devoluciones dentro de...' },
                                    { label: 'Política de Privacidad', key: 'privacyPolicy', placeholder: 'Tus datos están seguros con nosotros...' },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Textarea
                                            value={storeData[key as keyof typeof storeData] as string}
                                            onChange={e => setStoreData({ ...storeData, [key]: e.target.value })}
                                            rows={4}
                                            placeholder={placeholder}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSavePolicies} disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                                <Save className="h-4 w-4 mr-2" /> Guardar Políticas
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </motion.div>
    );
}
