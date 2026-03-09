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
    Save, Store, Shield, Search, Globe, AlertTriangle, CheckCircle2, Eye, Zap
} from 'lucide-react';
import { toast } from 'sonner';



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
    const { storeSettings, updateStoreSettings, contactInfo, updateContactInfo } = useAdminStore();
    const [storeData, setStoreData] = useState(storeSettings);
    const [contactData, setContactData] = useState(contactInfo);
    const [isSaving, setIsSaving] = useState(false);

    // Sincronizar si el store cambia (por fetchSettings)
    useEffect(() => { setStoreData(storeSettings); }, [storeSettings]);
    useEffect(() => { setContactData(contactInfo); }, [contactInfo]);

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



    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="general" className="flex gap-1.5"><Store className="h-4 w-4" />General</TabsTrigger>
                        <TabsTrigger value="seo" className="flex gap-1.5"><Search className="h-4 w-4" />SEO</TabsTrigger>
                        <TabsTrigger value="policies" className="flex gap-1.5"><Shield className="h-4 w-4" />Políticas</TabsTrigger>
                        <TabsTrigger value="integrations" className="flex gap-1.5"><Zap className="h-4 w-4" />Pagos e Integraciones</TabsTrigger>
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

                    {/* ── INTEGRACIONES Y CHECKOUT ───────────────────────────────── */}
                    <TabsContent value="integrations">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-3 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" /> Configuraciones de Pagos e Integraciones
                            </h3>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm space-y-1">
                                <p className="font-medium text-primary">Ajustes avanzados y Checkout</p>
                                <p className="text-muted-foreground">Configura los mensajes para tus clientes y las llaves de pasarelas de pago. Protege siempre tu llave privada.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Llave Pública de Wompi (Public Key)</Label>
                                    <Input
                                        value={storeData.wompiPublicKey || ''}
                                        onChange={e => setStoreData({ ...storeData, wompiPublicKey: e.target.value })}
                                        placeholder="pub_test_..."
                                    />
                                    <p className="text-xs text-muted-foreground">Tu llave pública para transacciones seguras. Empieza por pub_test_ o pub_prod_</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Plantilla de mensaje Botón Flotante WhatsApp</Label>
                                    <Textarea
                                        value={storeData.whatsappMessage || ''}
                                        onChange={e => setStoreData({ ...storeData, whatsappMessage: e.target.value })}
                                        rows={2}
                                        placeholder="Hola, tengo una duda..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Instrucciones de Checkout Manual (WhatsApp)</Label>
                                    <Textarea
                                        value={storeData.checkoutMessage || ''}
                                        onChange={e => setStoreData({ ...storeData, checkoutMessage: e.target.value })}
                                        rows={3}
                                        placeholder="Te redireccionaremos a WhatsApp para completar..."
                                    />
                                    <p className="text-xs text-muted-foreground">Este mensaje aparece como alternativa o junto al botón de pago con Wompi.</p>
                                </div>
                            </div>
                            <Button onClick={handleSaveStore} disabled={isSaving} className="w-full bg-primary text-primary-foreground">
                                <Save className="h-4 w-4 mr-2" /> Guardar Integraciones
                            </Button>
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
