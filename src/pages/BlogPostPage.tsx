import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useAdminStore } from '@/store/adminStore';
import { usePageSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const { blogPosts } = useAdminStore();

    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    usePageSEO({
        title: `${post.title} | Blog M&D Hijos del Rey`,
        description: post.excerpt,
        path: `/blog/${post.slug}`,
        image: post.image,
    });

    const handleShare = () => {
        const url = window.location.href;
        const text = `¡Qué interesante artículo de M&D Hijos del Rey!\n\n*${post.title}*\n\n`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <CartDrawer />

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 lg:px-8">

                    <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
                        <Link to="/blog">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al Blog
                        </Link>
                    </Button>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 text-center"
                    >
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-gold/20 text-gold-dark rounded-full">
                            {post.category}
                        </span>
                        <h1 className="mb-6 font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{post.readTime} min lectura</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                            <div className="flex items-center gap-1.5">
                                <button onClick={handleShare} className="flex items-center gap-1 hover:text-primary transition-colors">
                                    <Share2 className="w-4 h-4" />
                                    Compartir
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12 aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl relative"
                    >
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Content */}
                    <motion.article
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-stone prose-lg max-w-none mx-auto
              prose-headings:font-display prose-headings:text-charcoal
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-gold-dark prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg
              prose-strong:text-charcoal prose-strong:font-semibold"
                    >
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </motion.article>

                    {/* Related Articles or Call to Action could go here */}
                    <div className="mt-16 pt-8 border-t border-border text-center">
                        <h3 className="font-display text-2xl font-bold text-charcoal mb-4">
                            ¿Te inspiró este artículo?
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Descubre nuestra colección de muebles artesanales que pueden hacer realidad tus ideas.
                        </p>
                        <Button asChild className="bg-primary text-primary-foreground">
                            <Link to="/catalogo">Explorar Catálogo</Link>
                        </Button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
