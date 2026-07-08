import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const BUCKET = 'productos';
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
};

interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  placeholder?: string;
}

export default function SingleImageUploader({
  value,
  onChange,
  className,
  placeholder = 'https://...',
}: SingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo de archivo
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Tipo de archivo no admitido. Usa JPG, PNG o WEBP.');
      return;
    }

    // Validación de tamaño
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_SIZE_MB} MB.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Comprimir antes de subir
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

      // Crear un nombre de archivo único
      const fileName = `team-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, compressed, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      onChange(publicUrl);
    } catch (err: any) {
      console.error('Error subiendo imagen de equipo:', err);
      setError('Error al subir. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (value && value.includes(BUCKET)) {
      const fileName = value.split('/').pop();
      if (fileName) {
        try {
          await supabase.storage.from(BUCKET).remove([fileName]);
        } catch (err) {
          console.error('Error al remover imagen anterior del almacenamiento:', err);
        }
      }
    }
    onChange('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        {/* Caja de Vista Previa */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 flex items-center justify-center group">
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 text-white animate-spin" />
            </div>
          ) : value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Botones de acción y campo de entrada */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-2">
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-8 text-xs bg-background flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 px-2.5 flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
              <Upload className="h-3 w-3" />
              Subir
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      {error && (
        <p className="text-[10px] text-destructive font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
