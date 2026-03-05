import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface FlipCardProps {
  frontImage: string;
  frontTitle: string;
  frontSubtitle?: string;
  backTitle: string;
  backContent: string; // Used for excerpt
  fullContent?: string; // Used for full content html
  backButtonText?: string;
  backButtonLink?: string;
  className?: string;
}

export function FlipCard({
  frontImage,
  frontTitle,
  frontSubtitle,
  backTitle,
  backContent,
  fullContent,
  backButtonText = 'Ver más',
  backButtonLink,
  className,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
      <div
        className={cn(
          'relative w-full aspect-square cursor-pointer perspective-1000',
          className
        )}
        onClick={handleFlip}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <img
              src={frontImage}
              alt={frontTitle}
              className="w-full h-full object-cover relative z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
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

          {/* Back Face */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden bg-cream border border-border p-6 flex flex-col backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
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

            <Button
              className="mt-4 bg-primary text-primary-foreground hover:bg-wood-light w-full"
              size="sm"
              onClick={handleOpenModal}
            >
              {backButtonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{backTitle}</DialogTitle>
            {frontSubtitle && (
              <DialogDescription>{frontSubtitle}</DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-4 prose prose-stone max-w-none">
            {/* If fullContent contains HTML */}
            <div dangerouslySetInnerHTML={{ __html: fullContent || backContent }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
