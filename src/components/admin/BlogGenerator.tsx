import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BlogGenerator() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('profesional');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Por favor, ingresa un tema para el artículo');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { topic, tone, keywords },
      });
      if (error) {
        // Extraer el mensaje real del cuerpo de error de la Edge Function
        const errorBody = error.context ? await error.context.json().catch(() => null) : null;
        const msg = errorBody?.error ?? error.message ?? 'Error desconocido';
        throw new Error(msg);
      }
      if (!data || !data.title) throw new Error('La IA devolvió una respuesta vacía o inválida.');
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
    try {
      const { error } = await supabase.from('blog_posts').insert([{
        title: generatedPost.title,
        slug: generatedPost.slug,
        excerpt: generatedPost.excerpt,
        content: generatedPost.content,
        status: 'published',
        category: 'General',
      }]);
      if (error) throw error;
      toast.success('Artículo publicado correctamente');
      setGeneratedPost(null);
      setTopic('');
    } catch (error: unknown) {
      toast.error('Error al guardar: ' + (error as Error).message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Generador IA</CardTitle>
          <CardDescription>Crea contenido SEO en segundos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej: Muebles modernos 2026" />
          </div>
          <div className="space-y-2">
            <Label>Tono</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="profesional">Profesional</SelectItem>
                <SelectItem value="cercano">Cercano</SelectItem>
                <SelectItem value="persuasivo">Persuasivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Palabras Clave</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="muebles, Sampués..." />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generar</>}
          </Button>
        </CardFooter>
      </Card>
      <Card className={cn(!generatedPost && "opacity-50", "transition-opacity")}>
        <CardHeader><CardTitle>Vista Previa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {generatedPost ? (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Título</Label><Input value={generatedPost.title} onChange={(e) => setGeneratedPost({...generatedPost, title: e.target.value})} /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={generatedPost.slug} onChange={(e) => setGeneratedPost({...generatedPost, slug: e.target.value})} /></div>
              <div className="space-y-2"><Label>Resumen</Label><Textarea value={generatedPost.excerpt} onChange={(e) => setGeneratedPost({...generatedPost, excerpt: e.target.value})} /></div>
              <div className="space-y-2"><Label>Contenido</Label><Textarea className="min-h-[200px] font-mono text-xs" value={generatedPost.content} onChange={(e) => setGeneratedPost({...generatedPost, content: e.target.value})} /></div>
            </div>
          ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground italic"> Esperando generación... </div>}
        </CardContent>
        {generatedPost && (
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setGeneratedPost(null)}><Trash2 className="mr-2 h-4 w-4" /> Descartar</Button>
            <Button className="flex-1" onClick={handleSavePost}><Save className="mr-2 h-4 w-4" /> Publicar</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}