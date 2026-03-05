import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FlipCard } from '@/components/ui/flip-card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/store/adminStore';

export default function BlogPage() {
  const { blogPosts } = useAdminStore();
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

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
              Blog & Noticias
            </h1>
            <p className="text-muted-foreground mt-4">
              Consejos de decoración, tendencias en muebles y las historias detrás de
              nuestras creaciones artesanales.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Featured Post as large FlipCard */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 max-w-2xl mx-auto"
            >
              <Badge className="mb-4 bg-gold text-charcoal">Destacado</Badge>
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

          {/* Posts Grid with FlipCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FlipCard
                  frontImage={post.image}
                  frontTitle={post.title}
                  frontSubtitle={`${post.readTime} min • ${post.category}`}
                  backTitle={post.title}
                  backContent={post.excerpt}
                  fullContent={post.content}
                  backButtonText="Leer Más"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
