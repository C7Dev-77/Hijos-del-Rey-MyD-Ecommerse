import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, AlertCircle, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Configuración ─────────────────────────────────────────────────────────
const BUCKET = 'productos';
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

interface UploadedImage {
  url: string;
  name: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploaderProps {
  /** URLs iniciales (cuando se edita un producto existente) */
  initialUrls?: string[];
  /** Callback que se invoca cuando cambia la lista de URLs */
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ initialUrls = [], onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(
    initialUrls.filter(Boolean).map((url) => ({ url, name: url.split('/').pop() ?? 'imagen' }))
  );
  const [dragOver, setDragOver] = useState(false);

  // Notifica al padre con las URLs finales (sin las que están subiendo o tienen error)
  const notify = (list: UploadedImage[]) => {
    onChange(list.filter((i) => i.url && !i.uploading && !i.error).map((i) => i.url));
  };

  const uploadFile = async (file: File, index: number) => {
    // Validación de tipo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImages((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], error: 'Tipo no admitido. Usa JPG, PNG o WEBP.', uploading: false };
        return next;
      });
      return;
    }

    // Validación de tamaño
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImages((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], error: `El archivo supera los ${MAX_SIZE_MB} MB.`, uploading: false };
        return next;
      });
      return;
    }

    try {
      // Comprimir antes de subir
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, compressed, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      setImages((prev) => {
        const next = [...prev];
        next[index] = { url: publicUrl, name: file.name, uploading: false };
        notify(next);
        return next;
      });
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setImages((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          error: 'Error al subir. Intenta de nuevo.',
          uploading: false,
        };
        return next;
      });
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const filesArray = Array.from(files);
    const startIndex = images.length;

    // Agregar placeholders de carga
    const placeholders: UploadedImage[] = filesArray.map((f) => ({
      url: '',
      name: f.name,
      uploading: true,
    }));

    setImages((prev) => [...prev, ...placeholders]);

    // Subir cada archivo
    filesArray.forEach((file, i) => {
      uploadFile(file, startIndex + i);
    });
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    // Intentar borrar del bucket si la URL es de Supabase
    if (img.url.includes(BUCKET)) {
      const fileName = img.url.split('/').pop();
      if (fileName) {
        await supabase.storage.from(BUCKET).remove([fileName]);
      }
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      notify(next);
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone / botón de subida */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors select-none',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5'
        )}
      >
        <ImagePlus className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground text-center">
          Arrastra imágenes aquí o{' '}
          <span className="text-primary underline underline-offset-2">haz clic para seleccionar</span>
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Máx. {MAX_SIZE_MB} MB por imagen</p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Miniaturas */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted">
              {img.uploading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                  <span className="text-[10px] text-white">Subiendo…</span>
                </div>
              ) : img.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/20 p-1 text-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-[9px] text-destructive leading-tight">{img.error}</p>
                </div>
              ) : (
                <img
                  src={img.url}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Botón eliminar */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>

              {/* Número de orden */}
              {!img.uploading && !img.error && (
                <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] rounded px-1">
                  {i + 1}
                </span>
              )}
            </div>
          ))}

          {/* Botón inline para agregar más */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
          >
            <Upload className="h-5 w-5" />
            <span className="text-[10px]">Agregar</span>
          </button>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.filter(i => !i.uploading && !i.error).length} imagen(es) lista(s) · La primera será la imagen principal del producto.
        </p>
      )}
    </div>
  );
}
