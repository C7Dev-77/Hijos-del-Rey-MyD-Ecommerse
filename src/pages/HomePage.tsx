import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Hammer, Leaf } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { PromoMarquee } from '@/components/ui/promo-marquee';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/data/mock';

import { useAdminStore } from '@/store/adminStore';

// Hero Section with Parallax
function HeroSection() {
  const { homePageContent } = useAdminStore();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const heroSlides = [
    {
      image: homePageContent.heroImage,
      title: homePageContent.heroTitle,
      subtitle: homePageContent.heroSubtitle,
    },
  ];

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroSlides[0].image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex items-center"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-gold/20 text-gold rounded-full text-sm font-medium mb-6"
            >
              {homePageContent.heroBadgeText}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl md:text-7xl font-bold text-cream mb-6 leading-tight"
            >
              {heroSlides[0].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-cream/80 text-xl mb-8"
            >
              {heroSlides[0].subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-gold text-charcoal hover:bg-gold/90 text-lg px-8"
                asChild
              >
                <Link to="/catalogo">
                  {homePageContent.heroButton1Text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-cream text-cream hover:bg-cream hover:text-charcoal transition-colors text-lg px-8"
                asChild
              >
                <Link to="/cotizar">
                  {homePageContent.heroButton2Text}
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-cream/50 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-cream rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Bento Grid Categories
function CategoriesSection() {
  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm text-primary font-medium uppercase tracking-wider">
            Nuestras Colecciones
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-2">
            Encuentra tu Estilo
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
          {CATEGORIES.filter(c => c.slug !== 'decoracion').slice(0, 4).map((category, index) => {
            const sizes = [
              'md:col-span-2 md:row-span-2',
              'md:col-span-2',
              'md:col-span-1',
              'md:col-span-1',
            ];

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl ${sizes[index]}`}
              >
                <Link to={`/catalogo?categoria=${category.slug}`}>
                  <div className="absolute inset-0 img-zoom">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-cream mb-2">
                      {category.name}
                    </h3>
                    <p className="text-cream/70 text-sm hidden md:block mb-4">
                      {category.description}
                    </p>
                    <span className="inline-flex items-center text-gold text-sm font-medium group-hover:gap-2 transition-all">
                      Ver productos
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Featured Products Carousel
function FeaturedSection() {
  const { products, homePageContent } = useAdminStore();
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm text-primary font-medium uppercase tracking-wider">
              {homePageContent.favoritesTitle}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
              {homePageContent.bestSellersTitle}
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="mt-4 md:mt-0 inline-flex items-center text-primary hover:text-primary/80 font-medium group"
          >
            Ver Todo el Catálogo
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Benefits Section
function BenefitsSection() {
  const benefits = [
    {
      icon: Truck,
      title: 'Envío Nacional',
      description: 'Entrega segura a todo el país con seguimiento en tiempo real.',
    },
    {
      icon: Shield,
      title: 'Garantía 5 Años',
      description: 'Respaldamos la calidad de cada pieza con garantía extendida.',
    },
    {
      icon: Hammer,
      title: '100% Artesanal',
      description: 'Cada mueble es elaborado a mano por maestros carpinteros.',
    },
    {
      icon: Leaf,
      title: 'Madera Sostenible',
      description: 'Utilizamos maderas de bosques certificados y renovables.',
    },
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center"
              >
                <benefit.icon className="h-8 w-8 text-gold" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold mb-3">
                {benefit.title}
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// New Arrivals Section
function NewArrivalsSection() {
  const { products, homePageContent } = useAdminStore();
  const featured = products.filter(p => p.featured).slice(0, 2);

  return (
    <section className="py-24 bg-cream-dark">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm text-primary font-medium uppercase tracking-wider">
              {homePageContent.newArrivalsTitle}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-charcoal mt-2 mb-6">
              {homePageContent.designsTitle}
            </h2>
            <p className="text-muted-foreground mb-8">
              Descubre nuestra última colección de muebles artesanales, donde la tradición
              se encuentra con el diseño contemporáneo. Cada pieza es una obra de arte
              funcional creada para elevar tu hogar.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-wood-light"
              asChild
            >
              <Link to="/catalogo?nuevo=true">
                Ver Novedades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 2).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className={index === 0 ? 'mt-8' : ''}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// CTA / About Section
function CTASection() {
  const { homePageContent } = useAdminStore();
  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920)',
        }}
      />
      <div className="absolute inset-0 bg-charcoal/70" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            {homePageContent.aboutSectionTitle}
          </h2>
          <p className="text-cream/80 text-lg mb-8">
            {homePageContent.aboutSectionText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gold text-charcoal hover:bg-gold/90 text-lg px-8"
              asChild
            >
              <Link to="/nosotros">
                {homePageContent.aboutSectionButtonText}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-cream text-cream hover:bg-cream hover:text-charcoal transition-colors text-lg px-8"
              asChild
            >
              <Link to="/contacto">
                Contactar Asesor
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Home Page
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CartDrawer />


      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection />
        <BenefitsSection />
        <NewArrivalsSection />
        <PromoMarquee />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
