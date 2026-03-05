import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/store/adminStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Store, Link as LinkIcon, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function HomeContentTab() {
    const { homePageContent, updateHomePageContent, storeSettings, updateStoreSettings } = useAdminStore();
    const [homeData, setHomeData] = useState(homePageContent);
    const [storeData, setStoreData] = useState(storeSettings);

    const handleSaveHome = () => {
        updateHomePageContent(homeData);
        toast.success('Contenido de inicio actualizado');
    };

    const handleSaveStore = () => {
        updateStoreSettings(storeData);
        toast.success('Configuración de la tienda actualizada');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="general" className="flex gap-2"><Store className="h-4 w-4" /> General</TabsTrigger>
                        <TabsTrigger value="home" className="flex gap-2"><LinkIcon className="h-4 w-4" /> Inicio</TabsTrigger>
                        <TabsTrigger value="seo" className="flex gap-2"><Search className="h-4 w-4" /> SEO</TabsTrigger>
                        <TabsTrigger value="policies" className="flex gap-2"><Shield className="h-4 w-4" /> Políticas</TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-4">Configuración General</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nombre de la Tienda</Label>
                                    <Input
                                        value={storeData.storeName}
                                        onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                                        placeholder="Mi Tienda"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Moneda</Label>
                                    <Input
                                        value={storeData.currency}
                                        onChange={(e) => setStoreData({ ...storeData, currency: e.target.value })}
                                        placeholder="COP"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Descripción Corta de la Tienda</Label>
                                    <Textarea
                                        value={storeData.storeDescription}
                                        onChange={(e) => setStoreData({ ...storeData, storeDescription: e.target.value })}
                                        placeholder="Mobiliario..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL del Logo</Label>
                                    <Input
                                        value={storeData.logoUrl}
                                        onChange={(e) => setStoreData({ ...storeData, logoUrl: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Impuesto (%)</Label>
                                    <Input
                                        type="number"
                                        value={storeData.taxRate}
                                        onChange={(e) => setStoreData({ ...storeData, taxRate: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Envío Gratis Desde (Monto)</Label>
                                    <Input
                                        type="number"
                                        value={storeData.freeShippingThreshold}
                                        onChange={(e) => setStoreData({ ...storeData, freeShippingThreshold: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveStore} className="w-full bg-primary text-primary-foreground mt-4">
                                <Save className="h-4 w-4 mr-2" /> Guardar Configuración
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Home Settings (Original) */}
                    <TabsContent value="home">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-4">Contenido de Inicio</h3>
                            <div className="space-y-4">
                                <h4 className="font-medium text-muted-foreground">Sección Hero</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Texto del Distintivo (Badge)</Label>
                                        <Input
                                            value={homeData.heroBadgeText}
                                            onChange={(e) => setHomeData({ ...homeData, heroBadgeText: e.target.value })}
                                            placeholder="✨ Nuevos diseños 2025"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Imagen de Fondo (URL)</Label>
                                        <Input
                                            value={homeData.heroImage}
                                            onChange={(e) => setHomeData({ ...homeData, heroImage: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Título Principal</Label>
                                        <Input
                                            value={homeData.heroTitle}
                                            onChange={(e) => setHomeData({ ...homeData, heroTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Subtítulo</Label>
                                        <Textarea
                                            value={homeData.heroSubtitle}
                                            onChange={(e) => setHomeData({ ...homeData, heroSubtitle: e.target.value })}
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-border pt-4">
                                <h4 className="font-medium text-muted-foreground">Títulos de Secciones</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Favoritos</Label>
                                        <Input
                                            value={homeData.favoritesTitle}
                                            onChange={(e) => setHomeData({ ...homeData, favoritesTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Más Vendidos</Label>
                                        <Input
                                            value={homeData.bestSellersTitle}
                                            onChange={(e) => setHomeData({ ...homeData, bestSellersTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Recién Llegados</Label>
                                        <Input
                                            value={homeData.newArrivalsTitle}
                                            onChange={(e) => setHomeData({ ...homeData, newArrivalsTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Diseños</Label>
                                        <Input
                                            value={homeData.designsTitle}
                                            onChange={(e) => setHomeData({ ...homeData, designsTitle: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleSaveHome} className="w-full bg-primary text-primary-foreground">
                                <Save className="h-4 w-4 mr-2" /> Guardar Inicio
                            </Button>
                        </div>
                    </TabsContent>

                    {/* SEO Settings */}
                    <TabsContent value="seo">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-4">Optimización (SEO)</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Meta Título</Label>
                                    <Input
                                        value={storeData.metaTitle}
                                        onChange={(e) => setStoreData({ ...storeData, metaTitle: e.target.value })}
                                        placeholder="M&D Hijos del Rey | Muebles Artesanales"
                                    />
                                    <p className="text-xs text-muted-foreground">El título que aparece en los resultados de búsqueda de Google.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Meta Descripción</Label>
                                    <Textarea
                                        value={storeData.metaDescription}
                                        onChange={(e) => setStoreData({ ...storeData, metaDescription: e.target.value })}
                                        placeholder="Descripción de la tienda para los buscadores..."
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres máximos.</p>
                                </div>
                            </div>
                            <Button onClick={handleSaveStore} className="w-full bg-primary text-primary-foreground mt-4">
                                <Save className="h-4 w-4 mr-2" /> Guardar SEO
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Policies Settings */}
                    <TabsContent value="policies">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                            <h3 className="font-display font-semibold text-lg border-b pb-4">Políticas Legales y de Tienda</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Política de Envíos</Label>
                                    <Textarea
                                        value={storeData.shippingPolicy}
                                        onChange={(e) => setStoreData({ ...storeData, shippingPolicy: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Política de Devoluciones</Label>
                                    <Textarea
                                        value={storeData.returnPolicy}
                                        onChange={(e) => setStoreData({ ...storeData, returnPolicy: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Política de Privacidad</Label>
                                    <Textarea
                                        value={storeData.privacyPolicy}
                                        onChange={(e) => setStoreData({ ...storeData, privacyPolicy: e.target.value })}
                                        rows={4}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveStore} className="w-full bg-primary text-primary-foreground mt-4">
                                <Save className="h-4 w-4 mr-2" /> Guardar Políticas
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </motion.div>
    );
}
