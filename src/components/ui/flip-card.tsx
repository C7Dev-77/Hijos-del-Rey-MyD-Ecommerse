import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface FlipCardProps {
  frontImage: string;
  frontTitle: string;
  frontSubtitle?: string;
  backTitle: string;
  backContent: string;
  fullContent?: string;
  backButtonText?: string;
  backButtonLink?: string;
  /** Si es false, oculta el botón. Por defecto true cuando hay backButtonText. */
  showButton?: boolean;
  className?: string;
}

export function FlipCard({
  frontImage,
  frontTitle,
  frontSubtitle,
  backTitle,
  backContent,
  fullContent,
  backButtonText,
  backButtonLink,
  showButton = true,
  className,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (backButtonLink) {
      if (backButtonLink.startsWith('http')) {
        window.open(backButtonLink, '_blank');
      } else {
        navigate(backButtonLink);
      }
    } else {
      setShowModal(true);
    }
  };

  // El botón solo aparece si showButton=true Y hay texto de botón
  const shouldShowButton = showButton && !!backButtonText;

  return (
    <>
      <div
        className={cn('relative w-full aspect-square cursor-pointer perspective-1000', className)}
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Cara Delantera */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={frontImage}
              alt={frontTitle}
              className="w-full h-full object-cover"
              loading="lazy"
              width={600}
              height={600}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-display text-xl md:text-2xl font-bold text-cream mb-1">
                {frontTitle}
              </h3>
              {frontSubtitle && (
                <p className="text-cream/70 text-sm">{frontSubtitle}</p>
              )}
              <span className="inline-flex items-center text-gold text-xs mt-3 font-medium">
                Toca para ver más
                <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Cara Trasera */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden bg-cream border border-border p-6 flex flex-col"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors z-20"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <h3 className="font-display text-lg md:text-xl font-bold text-charcoal mb-3 pr-8">
              {backTitle}
            </h3>

            <div className="text-muted-foreground text-sm leading-relaxed flex-1 overflow-auto">
              <p>{backContent}</p>
            </div>

            {shouldShowButton && (
              <Button
                className="mt-4 bg-primary text-primary-foreground hover:bg-wood-light w-full"
                size="sm"
                onClick={handleOpenModal}
              >
                {backButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de contenido completo — solo si no hay backButtonLink */}
      {shouldShowButton && !backButtonLink && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{backTitle}</DialogTitle>
              {frontSubtitle && (
                <DialogDescription>{frontSubtitle}</DialogDescription>
              )}
            </DialogHeader>
            <div className="mt-4 prose prose-stone max-w-none">
              <div dangerouslySetInnerHTML={{ __html: fullContent || backContent }} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
