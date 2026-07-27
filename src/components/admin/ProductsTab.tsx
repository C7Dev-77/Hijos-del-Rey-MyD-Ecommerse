import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminStore } from '@/store/adminStore';
import { CATEGORIES } from '@/data/mock';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import ImageUploader from '@/components/admin/ImageUploader';
import type { Product } from '@/types';

export function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '', price: '', originalPrice: '', discount: '', stock: '',
    category: '', shortDescription: '', description: '', technicalDetails: '',
    dimWidth: '', dimHeight: '', dimDepth: '', materials: '', salesCount: '',
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', price: '', originalPrice: '', discount: '', stock: '', category: '', shortDescription: '', description: '', technicalDetails: '', dimWidth: '', dimHeight: '', dimDepth: '', materials: '', salesCount: '' });
    setUploadedImages([]);
    setEditingProduct(null);
  };

  const openAddDialog = () => { resetForm(); setIsDialogOpen(true); };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setUploadedImages(product.images ?? []);
    setFormData({
      name: product.name, price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      discount: product.discount?.toString() || '',
      stock: product.stock.toString(), category: product.category,
      shortDescription: product.shortDescription, description: product.description,
      technicalDetails: product.technicalDetails || '',
      dimWidth: product.dimensions?.width?.toString() || '',
      dimHeight: product.dimensions?.height?.toString() || '',
      dimDepth: product.dimensions?.depth?.toString() || '',
      materials: product.materials?.join(', ') || '',
      salesCount: product.salesCount?.toString() || '0',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Completa los campos obligatorios: nombre, categoría y precio.');
      return;
    }
    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      price: parseInt(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : undefined,
      discount: formData.discount ? parseInt(formData.discount) : undefined,
      stock: parseInt(formData.stock) || 0,
      category: formData.category,
      shortDescription: formData.shortDescription,
      description: formData.description,
      technicalDetails: formData.technicalDetails,
      shippingInfo: editingProduct?.shippingInfo,
      returnsInfo: editingProduct?.returnsInfo,
      images: uploadedImages,
      dimensions: {
        width: parseInt(formData.dimWidth) || 0,
        height: parseInt(formData.dimHeight) || 0,
        depth: parseInt(formData.dimDepth) || 0,
      },
      materials: formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(Boolean) : [],
      rating: editingProduct?.rating || 4.5,
      reviewCount: editingProduct?.reviewCount || 0,
      salesCount: parseInt(formData.salesCount) || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0],
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await addProduct(productData);
        toast.success('Producto creado exitosamente');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(editingProduct ? 'Error al actualizar producto' : 'Error al crear producto', { description: msg });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteProduct(deleteId);
        toast.success('Producto eliminado');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error('Error al eliminar producto', { description: msg });
      } finally {
        setDeleteId(null);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={openAddDialog} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" /> Agregar Producto
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Producto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoría</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Precio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ventas</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.shortDescription.slice(0, 40)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge variant="outline" className="capitalize">{product.category}</Badge></td>
                  <td className="py-3 px-4 font-medium">{formatPrice(product.price)}</td>
                  <td className="py-3 px-4">
                    <Badge className={product.stock > 5 ? 'badge-delivered' : product.stock > 0 ? 'badge-pending' : 'badge-cancelled'}>
                      {product.stock} und
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{product.salesCount || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Precio (COP)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
              <div className="space-y-2"><Label>Stock (unidades)</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} /></div>
              <div className="space-y-2"><Label>Ventas (contador)</Label><Input type="number" value={formData.salesCount} onChange={(e) => setFormData({ ...formData, salesCount: e.target.value })} placeholder="Ej: 15" /></div>
              <div className="space-y-2"><Label>Precio Original (opcional)</Label><Input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="Ej: 2500000" /></div>
              <div className="space-y-2"><Label>Descuento (%)</Label><Input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="Ej: 15" /></div>
            </div>
            <div className="space-y-2"><Label>Descripción Corta</Label><Input value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} /></div>
            <div className="space-y-2"><Label>Descripción Completa</Label><Textarea rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Imágenes del Producto
                <span className="text-xs font-normal text-muted-foreground">(JPG, PNG, WEBP · máx. 5 MB c/u)</span>
              </Label>
              <ImageUploader key={editingProduct?.id ?? 'new'} initialUrls={uploadedImages} onChange={setUploadedImages} />
            </div>
            <div className="p-4 rounded-xl border border-border bg-card/50 space-y-4">
              <h4 className="font-semibold text-sm">Detalles Técnicos</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Ancho (cm)</Label><Input type="number" value={formData.dimWidth} onChange={(e) => setFormData({ ...formData, dimWidth: e.target.value })} placeholder="Ej: 150" /></div>
                <div className="space-y-2"><Label>Alto (cm)</Label><Input type="number" value={formData.dimHeight} onChange={(e) => setFormData({ ...formData, dimHeight: e.target.value })} placeholder="Ej: 80" /></div>
                <div className="space-y-2"><Label>Profund. (cm)</Label><Input type="number" value={formData.dimDepth} onChange={(e) => setFormData({ ...formData, dimDepth: e.target.value })} placeholder="Ej: 50" /></div>
              </div>
              <div className="space-y-2"><Label>Materiales (separados por comas)</Label><Input value={formData.materials} onChange={(e) => setFormData({ ...formData, materials: e.target.value })} placeholder="Ej: Madera de roble, Tela lino" /></div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
              ℹ️ Las políticas de <strong>envío y devoluciones</strong> se aplican a todos los productos por igual.
              Puédelas editar en <strong>Configuración → Políticas</strong>.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. El producto será eliminado permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
