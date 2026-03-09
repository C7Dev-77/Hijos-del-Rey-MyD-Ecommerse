import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product, formatPrice, CATEGORIES } from '@/data/mock';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, index = 0 }, ref) => {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/producto/${product.slug}`}>
        <div className="relative overflow-hidden rounded-xl bg-card border border-border card-hover">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.discount && (
                <Badge className="bg-accent text-accent-foreground">
                  -{product.discount}%
                </Badge>
              )}
              {product.newArrival && (
                <Badge className="bg-forest text-cream">
                  Nuevo
                </Badge>
              )}
              {product.bestSeller && (
                <Badge className="bg-gold text-charcoal">
                  Top Ventas
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <Button
                size="icon"
                variant="secondary"
                aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
                className={cn(
                  "h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-md transition-colors",
                  isWishlisted && "text-red-500 hover:text-red-600"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isWishlisted) {
                    removeFromWishlist(product.id);
                  } else {
                    addToWishlist(product);
                  }
                }}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Ver detalles"
                className="h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-md"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary text-primary-foreground hover:bg-wood-light shadow-lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Añadir al Carrito
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Category */}
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {CATEGORIES.find(c => c.slug === product.category)?.name || product.category}
            </span>

            {/* Name */}
            <h3 className="font-display text-lg font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

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
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";
