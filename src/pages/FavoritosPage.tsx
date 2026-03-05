import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/data/mock';
import { cn } from '@/lib/utils';

export default function FavoritosPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore();
    const { addItem: addToCart } = useCartStore();

    const handleAddToCart = (product: typeof items[0]) => {
        addToCart(product);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <CartDrawer />

            {/* Hero */}
            <section className="pt-24 pb-12 bg-cream">
                <div className="container mx-auto px-4 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                            <Link to="/" className="hover:text-primary">Inicio</Link>
                            <span>/</span>
                            <span className="text-foreground">Mis Favoritos</span>
                        </nav>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal flex items-center gap-3">
                            Mis Favoritos
                            <Heart className="h-10 w-10 text-red-500 fill-red-500" />
                        </h1>
                        <p className="text-muted-foreground mt-4">
                            {items.length > 0
                                ? `Tienes ${items.length} ${items.length === 1 ? 'producto guardado' : 'productos guardados'} en tu lista de deseos.`
                                : 'Tu lista de deseos está vacía. ¡Explora nuestro catálogo y guarda tus favoritos!'
                            }
                        </p>
                    </motion.div>
                </div>
            </section>

            <main className="py-12">
                <div className="container mx-auto px-4 lg:px-8">
                    {items.length === 0 ? (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                                <Heart className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <h2 className="font-display text-2xl font-bold mb-3">
                                Aún no tienes favoritos
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                Explora nuestro catálogo y toca el ícono de corazón en los productos
                                que más te gusten para guardarlos aquí.
                            </p>
                            <Link to="/catalogo">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-wood-light">
                                    Explorar Catálogo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            {/* Actions Bar */}
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-muted-foreground">
                                    <span className="font-medium text-foreground">{items.length}</span> {items.length === 1 ? 'producto' : 'productos'}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearWishlist}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Limpiar Lista
                                </Button>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {items.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                            className="group"
                                        >
                                            <div className="relative overflow-hidden rounded-xl bg-card border border-border card-hover">
                                                {/* Image */}
                                                <Link to={`/producto/${product.slug}`}>
                                                    <div className="relative aspect-square overflow-hidden bg-muted">
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />

                                                        {/* Badges */}
                                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                            {product.discount && (
                                                                <Badge className="bg-accent text-accent-foreground">
                                                                    -{product.discount}%
                                                                </Badge>
                                                            )}
                                                            {product.newArrival && (
                                                                <Badge className="bg-forest text-cream">Nuevo</Badge>
                                                            )}
                                                            {product.bestSeller && (
                                                                <Badge className="bg-gold text-charcoal">Top Ventas</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* Content */}
                                                <div className="p-4 space-y-3">
                                                    <div>
                                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                                            {product.category}
                                                        </span>
                                                        <Link to={`/producto/${product.slug}`}>
                                                            <h3 className="font-display text-lg font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                                {product.name}
                                                            </h3>
                                                        </Link>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-display text-lg font-semibold text-primary">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                        {product.originalPrice && (
                                                            <span className="text-sm text-muted-foreground line-through">
                                                                {formatPrice(product.originalPrice)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg
                                                                    key={i}
                                                                    className={cn(
                                                                        'w-4 h-4',
                                                                        i < Math.floor(product.rating)
                                                                            ? 'text-gold fill-gold'
                                                                            : 'text-muted fill-muted'
                                                                    )}
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({product.reviewCount})
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            onClick={() => handleAddToCart(product)}
                                                            className="flex-1 bg-primary text-primary-foreground hover:bg-wood-light"
                                                            size="sm"
                                                        >
                                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                                            Al Carrito
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => removeItem(product.id)}
                                                            className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 h-9 w-9"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Continue Shopping */}
                            <div className="text-center mt-12">
                                <Link to="/catalogo">
                                    <Button variant="outline" size="lg">
                                        Seguir Explorando
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
