import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, UserCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_name: string;
}

export function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    const fetchReviews = async () => {
        setIsLoading(true);
        // Probamos extraer de la tabla 'reviews' si existe
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            // Posiblemente la tabla aún no fue creada
            console.warn('Reviews table error (might not exist):', error);
            setReviews([]);
        } else if (data) {
            setReviews(data as Review[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !user) {
            toast.error('Debes iniciar sesión para dejar una reseña.');
            return;
        }
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        const { error } = await supabase.from('reviews').insert([
            {
                product_id: productId,
                user_id: user.id,
                user_name: user?.user_metadata?.name || 'Cliente Verificado',
                rating: newRating,
                comment: newComment.trim(),
            },
        ]);

        if (error) {
            if (error.code === '42P01') {
                toast.error('La funcionalidad de reseñas se habilitará pronto.');
            } else {
                toast.error('No se pudo enviar la reseña.');
            }
        } else {
            toast.success('¡Gracias por tu reseña!');
            setNewComment('');
            setNewRating(5);
            fetchReviews();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8 mt-16 pt-8 border-t border-border">
            <h3 className="font-display text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold" />
                Reseñas de Clientes
            </h3>

            {/* Agregar nueva reseña */}
            <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                {isAuthenticated ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h4 className="font-semibold text-charcoal">Escribe tu opinión</h4>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewRating(star)}
                                    className="p-1 hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`w-6 h-6 ${star <= newRating ? 'text-gold fill-gold' : 'text-muted-foreground'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-1 focus:ring-gold outline-none min-h-[100px]"
                            placeholder="¿Qué te pareció este producto?"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground"
                            disabled={isSubmitting || !newComment.trim()}
                        >
                            {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">Debes iniciar sesión para dejar una reseña.</p>
                        <Button asChild variant="outline">
                            <a href="/login">Iniciar sesión</a>
                        </Button>
                    </div>
                )}
            </div>

            {/* Lista de reseñas */}
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground animate-pulse">Cargando reseñas...</div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <UserCircle className="w-8 h-8 text-muted" />
                                    <div>
                                        <p className="font-medium text-charcoal text-sm">{review.user_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-muted-foreground/30'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-charcoal/80 mt-3">{review.comment}</p>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Aún no hay reseñas para este producto.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Sé el primero en compartir tu experiencia.
                    </p>
                </div>
            )}
        </div>
    );
}
