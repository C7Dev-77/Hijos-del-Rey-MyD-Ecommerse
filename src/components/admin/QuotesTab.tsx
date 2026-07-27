import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Trash2, Phone, MapPin, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminStore, type Quote } from '@/store/adminStore';
import { cn } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente', reviewed: 'Revisado',
    contacted: 'Contactado', archived: 'Archivado',
  };
  return map[status] || status;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    case 'reviewed': return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    case 'contacted': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    case 'archived': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function QuotesTab() {
  const { quotes, updateQuoteStatus, deleteQuote } = useAdminStore();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredQuotes = quotes.filter(q =>
    statusFilter === 'all' || q.status === statusFilter
  );

  const handleUpdateStatus = (id: string, status: string) => {
    updateQuoteStatus(id, status as Quote['status']);
    toast.success('Estado actualizado');
    if (selectedQuote?.id === id) {
      setSelectedQuote({ ...selectedQuote, status: status as Quote['status'] });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteQuote(deleteId);
      toast.success('Cotización eliminada');
      setDeleteId(null);
      if (selectedQuote?.id === deleteId) setSelectedQuote(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {['all', 'pending', 'reviewed', 'contacted', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
              )}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuotes.map(quote => (
          <motion.div
            key={quote.id}
            layoutId={quote.id}
            className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelectedQuote(quote)}
          >
            <div className="flex justify-between items-start mb-4">
              <Badge className={cn('font-normal', getStatusColor(quote.status))}>{getStatusLabel(quote.status)}</Badge>
              <span className="text-xs text-muted-foreground">{quote.createdAt}</span>
            </div>
            <h3 className="font-display font-semibold text-lg mb-1">{quote.furnitureType}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{quote.description}</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {quote.userName.charAt(0)}
                </div>
                <div className="text-sm">
                  <p className="font-medium leading-none">{quote.userName}</p>
                  <p className="text-xs text-muted-foreground">{quote.userCity}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(quote.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold opacity-50">No hay cotizaciones para mostrar</h3>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedQuote && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start mr-8">
                  <DialogTitle className="font-display text-2xl">Ref: {selectedQuote.id}</DialogTitle>
                  <Select value={selectedQuote.status} onValueChange={(v: string) => handleUpdateStatus(selectedQuote.id, v)}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewed">Revisado</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="archived">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-8 mt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Cliente</h4>
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <p className="flex items-center gap-2 text-sm"><User className="h-4 w-4" /> {selectedQuote.userName}</p>
                      <p className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {selectedQuote.userPhone}</p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground italic truncate">{selectedQuote.userEmail}</p>
                      <p className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> {selectedQuote.userCity}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Mueble solicitado</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground">Tipo:</span>
                        <span className="text-sm font-medium">{selectedQuote.furnitureType}</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground">Material:</span>
                        <span className="text-sm font-medium">{selectedQuote.material || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-sm text-muted-foreground">Medidas (AnxAlxPr):</span>
                        <span className="text-sm font-medium">
                          {selectedQuote.width || '?'} x {selectedQuote.height || '?'} x {selectedQuote.depth || '?'} cm
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground block mb-2">Descripción:</span>
                        <p className="text-sm bg-muted/30 p-4 rounded-lg leading-relaxed">{selectedQuote.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Imágenes de Referencia</h4>
                  {selectedQuote.images && selectedQuote.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedQuote.images.map((img: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-border group relative">
                          <img src={img} alt="Referencia" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={() => window.open(img, '_blank')}>Ver Grande</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl bg-muted/30 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border">
                      <ImageIcon className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-xs">Sin imágenes</p>
                    </div>
                  )}
                  <div className="mt-8 pt-6 border-t border-border">
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 font-bold"
                      onClick={() => {
                        const msg = `Hola ${selectedQuote.userName}, soy el administrador de M&D Hijos del Rey. Recibimos tu cotización para un ${selectedQuote.furnitureType}. ¿Hablamos?`;
                        window.open(`https://wa.me/${selectedQuote.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                    >
                      <Phone className="h-4 w-4" />Contactar por WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción es permanente y eliminará la información enviada por el cliente.</AlertDialogDescription>
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
