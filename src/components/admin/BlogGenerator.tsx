import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/store/adminStore';
import type { BlogPost } from '@/types';

const DEFAULT_IMAGES: Record<string, string> = {
  sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  sala: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  comedor: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
  cama: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
  madera: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800',
};

export function BlogGenerator() {
  const { addBlogPost } = useAdminStore();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('profesional');
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('Tendencias');
  const [author, setAuthor] = useState('M&D Hijos del Rey');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Por favor, ingresa un tema para el artículo');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { topic, tone, keywords },
      });
      if (error) {
        const errorBody = error.context ? await error.context.json().catch(() => null) : null;
        const msg = errorBody?.error ?? error.message ?? 'Error desconocido';
        throw new Error(msg);
      }
      if (!data || !data.title) throw new Error('La IA devolvió una respuesta vacía o inválida.');

      // Seleccionar imagen acorde al tema
      const lowerTopic = topic.toLowerCase();
      let selectedImg = DEFAULT_IMAGES.sofa;
      if (lowerTopic.includes('comedor') || lowerTopic.includes('mesa')) selectedImg = DEFAULT_IMAGES.comedor;
      else if (lowerTopic.includes('cama') || lowerTopic.includes('alcoba') || lowerTopic.includes('habitacion')) selectedImg = DEFAULT_IMAGES.cama;
      else if (lowerTopic.includes('madera') || lowerTopic.includes('cuidado') || lowerTopic.includes('mantenimiento')) selectedImg = DEFAULT_IMAGES.madera;
      else if (lowerTopic.includes('sala') || lowerTopic.includes('poltrona') || lowerTopic.includes('silla')) selectedImg = DEFAULT_IMAGES.sala;
      setImage(selectedImg);

      setGeneratedPost(data);
      toast.success('¡Artículo generado con éxito!');
    } catch (error: unknown) {
      toast.error('Error al generar el artículo: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePost = async () => {
    if (!generatedPost) return;
    setIsSaving(true);
    try {
      const words = generatedPost.content.trim().split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(words / 200));

      const tagsArray = keywords
        ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : ['Muebles', 'Decoración', 'Sampués'];

      const cleanSlug = (generatedPost.slug || generatedPost.title)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const postData: BlogPost = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        title: generatedPost.title,
        slug: cleanSlug,
        excerpt: generatedPost.excerpt,
        content: generatedPost.content,
        image: image.trim() || DEFAULT_IMAGES.sofa,
        author: author.trim() || 'M&D Hijos del Rey',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        category: category.trim() || 'Tendencias',
        tags: tagsArray,
        readTime,
        createdAt: new Date().toISOString(),
      };

      await addBlogPost(postData);
      toast.success('¡Artículo publicado correctamente en el blog!');
      setGeneratedPost(null);
      setTopic('');
      setKeywords('');
    } catch (error: unknown) {
      toast.error('Error al guardar: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Generador IA</CardTitle>
          <CardDescription>Crea artículos de blog optimizados para SEO en segundos con Gemini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema del artículo</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: Cómo elegir el sofá perfecto para una sala pequeña" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tono</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesional">Profesional</SelectItem>
                  <SelectItem value="cercano">Cercano y amigable</SelectItem>
                  <SelectItem value="persuasivo">Persuasivo y comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tendencias">Tendencias</SelectItem>
                  <SelectItem value="Guías">Guías</SelectItem>
                  <SelectItem value="Decoración">Decoración</SelectItem>
                  <SelectItem value="Cuidados">Cuidados</SelectItem>
                  <SelectItem value="Consejos">Consejos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Palabras Clave (separadas por coma)</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="optimización de espacio, colores claros, salas modernas" />
          </div>
          <div className="space-y-2">
            <Label>Autor</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="M&D Hijos del Rey" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-primary text-primary-foreground" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando con IA...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generar Artículo</>}
          </Button>
        </CardFooter>
      </Card>

      <Card className={cn(!generatedPost && 'opacity-60', 'transition-opacity')}>
        <CardHeader>
          <CardTitle>Vista Previa y Edición</CardTitle>
          <CardDescription>Revisa o edita los textos antes de guardar en la base de datos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedPost ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={generatedPost.title} onChange={(e) => setGeneratedPost({ ...generatedPost, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL amigable)</Label>
                <Input value={generatedPost.slug} onChange={(e) => setGeneratedPost({ ...generatedPost, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> URL de Imagen de Portada</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/..." />
                {image && (
                  <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-border">
                    <img src={image} alt="Vista previa de portada" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGES.sofa; }} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Resumen</Label>
                <Textarea rows={3} value={generatedPost.excerpt} onChange={(e) => setGeneratedPost({ ...generatedPost, excerpt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contenido completo (Markdown / Texto)</Label>
                <Textarea className="min-h-[220px] font-mono text-xs" value={generatedPost.content} onChange={(e) => setGeneratedPost({ ...generatedPost, content: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="h-[320px] flex flex-col items-center justify-center text-muted-foreground text-center p-4 border border-dashed rounded-lg">
              <Sparkles className="h-8 w-8 mb-2 opacity-50" />
              <p className="font-medium">Esperando generación...</p>
              <p className="text-xs text-muted-foreground mt-1">Completa el formulario de la izquierda y haz clic en "Generar Artículo".</p>
            </div>
          )}
        </CardContent>
        {generatedPost && (
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setGeneratedPost(null)} disabled={isSaving}>
              <Trash2 className="mr-2 h-4 w-4" /> Descartar
            </Button>
            <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSavePost} disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : <><Save className="mr-2 h-4 w-4" /> Publicar en Blog</>}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}