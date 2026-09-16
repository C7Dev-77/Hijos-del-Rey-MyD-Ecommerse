import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Save, Sparkles, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminStore } from '@/store/adminStore';
import { toast } from 'sonner';
import type { BlogPost } from '@/types';
import { BlogGenerator } from '@/components/admin/BlogGenerator';

export function BlogTab() {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useAdminStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '', excerpt: '', content: '', category: '', image: '', author: '',
  });

  const resetForm = () => {
    setFormData({ title: '', excerpt: '', content: '', category: '', image: '', author: '' });
    setEditingPost(null);
  };

  const openAddDialog = () => { resetForm(); setIsDialogOpen(true); };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({ title: post.title, excerpt: post.excerpt, content: post.content, category: post.category, image: post.image, author: post.author });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const postData: BlogPost = {
      id: editingPost?.id || Date.now().toString(),
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      excerpt: formData.excerpt,
      content: formData.content,
      image: formData.image,
      author: formData.author,
      authorAvatar: editingPost?.authorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: formData.category,
      tags: editingPost?.tags || [],
      readTime: Math.ceil(formData.content.split(' ').length / 200),
      createdAt: editingPost?.createdAt || new Date().toISOString().split('T')[0],
    };

    try {
      if (editingPost) {
        await updateBlogPost(editingPost.id, postData);
        toast.success('Artículo actualizado');
      } else {
        await addBlogPost(postData);
        toast.success('Artículo creado');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(editingPost ? 'Error al actualizar artículo' : 'Error al crear artículo', { description: msg });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteBlogPost(deleteId);
        toast.success('Artículo eliminado');
        setDeleteId(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error('Error al eliminar artículo', { description: msg });
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Tabs defaultValue="articulos">
        <TabsList className="mb-6">
          <TabsTrigger value="articulos" className="flex items-center gap-2">
            <List className="h-4 w-4" /> Artículos
          </TabsTrigger>
          <TabsTrigger value="generar" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Generar con IA
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Lista de Artículos ── */}
        <TabsContent value="articulos">
          <div className="flex justify-end mb-6">
            <Button onClick={openAddDialog} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Artículo
            </Button>
          </div>

          <div className="grid gap-4">
            {blogPosts.map(post => (
              <div key={post.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <img src={post.image} alt={post.title} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">{post.category}</Badge>
                      <h3 className="font-display font-semibold">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(post)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(post.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{post.author} • {post.readTime} min de lectura</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab: Generador IA ── */}
        <TabsContent value="generar">
          <BlogGenerator />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Título</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Categoría</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Decoración, Tendencias..." /></div>
              <div className="space-y-2"><Label>Autor</Label><Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>URL de Imagen</Label><Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Extracto</Label><Textarea rows={2} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} /></div>
            <div className="space-y-2"><Label>Contenido</Label><Textarea rows={8} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              <Save className="h-4 w-4 mr-2" />{editingPost ? 'Guardar' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar artículo?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
