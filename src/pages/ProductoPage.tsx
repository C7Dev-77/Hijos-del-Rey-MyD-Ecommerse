import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAdminStore } from '@/store/adminStore';
import { formatPrice } from '@/data/mock';
import { ProductReviews } from '@/components/store/ProductReviews'; // Nuevo componente
import { cn } from '@/lib/utils';
import { usePageSEO } from '@/hooks/useSEO';

export default function ProductoPage() {
  const { slug } = useParams();
  const { products } = useAdminStore();
  const product = products.find(p => p.slug === (slug || ''));
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  // SEO dinámico basado en el producto (con JSON-LD para Google Shopping/Rich Results)
  usePageSEO(product ? {
    title: `${product.name} | Muebles Artesanales`,
    description: product.shortDescription,
    path: `/producto/${product.slug}`,
    image: product.images[0],
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.images,
      sku: product.id,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'COP',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://mydhijosdelrey.com/producto/${product.slug}`
      }
    }
  } : undefined);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Producto no encontrado</h1>
          <Link to="/catalogo">
            <Button>Volver al Catálogo</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span>/</span>
            <Link to="/catalogo" className="hover:text-primary">Catálogo</Link>
            <span>/</span>
            <Link to={`/catalogo?categoria=${product.category}`} className="hover:text-primary capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                className="relative aspect-square rounded-2xl overflow-hidden bg-muted"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-500",
                    isZoomed && "scale-125"
                  )}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.discount && (
                    <Badge className="bg-accent text-accent-foreground">
                      -{product.discount}%
                    </Badge>
                  )}
                  {product.newArrival && (
                    <Badge className="bg-forest text-cream">Nuevo</Badge>
                  )}
                </div>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden shrink-0 ring-2 ring-offset-2 transition-all",
                        selectedImage === index
                          ? "ring-primary"
                          : "ring-transparent hover:ring-muted"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  {product.category}
                </span>
                <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={cn(
                        'w-5 h-5',
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
                <span className="text-sm text-muted-foreground group-hover:text-gold transition-colors cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  {product.rating} (Ver Reseñas)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground">
                {product.shortDescription}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-4 w-4 text-forest" />
                    <span className="text-sm text-forest">
                      En stock ({product.stock} disponibles)
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-destructive">Agotado</span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-input rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-wood-light"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Añadir al Carrito
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    if (product) {
                      if (isInWishlist(product.id)) {
                        removeFromWishlist(product.id);
                      } else {
                        addToWishlist(product);
                      }
                    }
                  }}
                  className={cn(
                    "transition-colors",
                    product && isInWishlist(product.id) && "text-red-500 border-red-500 hover:bg-red-50"
                  )}
                >
                  <Heart className={cn("h-5 w-5", product && isInWishlist(product.id) && "fill-current")} />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
                <div className="text-center">
                  <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Envío Gratis</span>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Garantía 5 Años</span>
                </div>
                <div className="text-center">
                  <RotateCcw className="h-6 w-6 mx-auto text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">30 Días Devolución</span>
                </div>
              </div>

              {/* Accordion Details */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="description">
                  <AccordionTrigger className="font-display font-semibold">
                    Descripción
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details">
                  <AccordionTrigger className="font-display font-semibold">
                    Detalles Técnicos
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Dimensiones</span>
                        <span>{product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Materiales</span>
                        <span>{product.materials.join(', ')}</span>
                      </div>
                      {product.colors && (
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">Colores</span>
                          <span>{product.colors.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger className="font-display font-semibold">
                    Envíos y Devoluciones
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Envío Nacional:</strong> Entrega en 5-10 días hábiles.
                        Envío gratuito en pedidos superiores a $1.000.000.
                      </p>
                      <p>
                        <strong className="text-foreground">Devoluciones:</strong> Aceptamos devoluciones dentro
                        de los 30 días siguientes a la entrega. El producto debe estar en su estado original.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Share */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Compartir:</span>
                <Button
                  variant="outline"
                  className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                  onClick={() => {
                    if (!product) return;
                    const url = window.location.href;
                    const text = `¡Mira este increíble producto de M&D Hijos del Rey!\n\n*${product.name}* - ${formatPrice(product.price)}\n\n`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>

          {/* Seccion de Reseñas Reales */}
          <div id="reviews-section">
            {product && <ProductReviews productId={product.id} />}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <h2 className="font-display text-3xl font-bold mb-8">
                Productos Relacionados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Sticky Mobile Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:hidden z-40">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-display text-lg font-bold">{formatPrice(product.price)}</p>
          </div>
          <Button
            className="flex-1 bg-primary text-primary-foreground"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Añadir al Carrito
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
