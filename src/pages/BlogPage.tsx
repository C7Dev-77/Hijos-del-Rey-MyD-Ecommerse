import { motion } from 'framer-motion';
import { BookOpen, Pencil } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FlipCard } from '@/components/ui/flip-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/adminStore';
import { Link } from 'react-router-dom';
import { usePageSEO } from '@/hooks/useSEO';

export default function BlogPage() {
  const { blogPosts } = useAdminStore();
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  usePageSEO({
    title: 'Blog de Decoración y Muebles Artesanales',
    description: 'Aprende sobre cuidado de madera, tendencias de decoración, y el arte detrás de nuestros muebles hechos a mano en Colombia.',
    path: '/blog',
  });

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
            <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal">
              Blog &amp; Noticias
            </h1>
            <p className="text-muted-foreground mt-4">
              Consejos de decoración, tendencias en muebles y las historias detrás de
              nuestras creaciones artesanales.{' '}
              <span className="font-medium text-primary">Haz clic en cada tarjeta para descubrir más.</span>
            </p>
          </motion.div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4 lg:px-8">

          {/* ── ESTADO VACÍO ── */}
          {blogPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center mb-6 shadow-inner">
                <BookOpen className="h-10 w-10 text-primary/60" />
              </div>
              <h2 className="font-display text-2xl font-bold text-charcoal mb-3">
                Aún no hay artículos
              </h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Estamos preparando contenido increíble sobre decoración, carpintería artesanal
                y tendencias en muebles. ¡Vuelve pronto!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="outline">
                  <Link to="/catalogo">Ver nuestros muebles</Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link to="/cotizar">
                    <Pencil className="mr-2 h-4 w-4" />
                    Cotiza tu diseño
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── ARTÍCULO DESTACADO (FlipCard grande) ── */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 max-w-2xl mx-auto"
            >
              <Badge className="mb-4 bg-gold text-charcoal">⭐ Destacado</Badge>
              <FlipCard
                frontImage={featuredPost.image}
                frontTitle={featuredPost.title}
                frontSubtitle={`${featuredPost.readTime} min de lectura • ${featuredPost.category}`}
                backTitle={featuredPost.title}
                backContent={featuredPost.excerpt + ' ' + featuredPost.content.slice(0, 300) + '...'}
                fullContent={featuredPost.content}
                backButtonText="Leer Artículo Completo"
                className="aspect-[4/3]"
              />
            </motion.div>
          )}

          {/* ── GRID DE ARTÍCULOS (FlipCards) ── */}
          {otherPosts.length > 0 && (
            <>
              <h2 className="font-display text-2xl font-bold text-charcoal mb-8">
                Más Artículos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <FlipCard
                      frontImage={post.image}
                      frontTitle={post.title}
                      frontSubtitle={`${post.readTime} min • ${post.category}`}
                      backTitle={post.title}
                      backContent={post.excerpt}
                      fullContent={post.content}
                      backButtonText="Leer Artículo Completo"
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
