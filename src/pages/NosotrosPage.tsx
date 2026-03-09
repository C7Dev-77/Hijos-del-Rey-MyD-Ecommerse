import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, Award, Leaf, type LucideIcon } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FlipCard } from '@/components/ui/flip-card';
import { usePageSEO } from '@/hooks/useSEO';
import { useAdminStore } from '@/store/adminStore';

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Users,
  Award,
  Leaf,
};

export default function NosotrosPage() {
  const { aboutPageContent: a } = useAdminStore();

  usePageSEO({
    title: 'Nuestra Historia — Más de 30 Años de Artesanía',
    description: 'Conoce la historia de M&D Hijos del Rey, fabricantes de muebles artesanales en Sampués, Sucre, Colombia. Más de 30 años de tradición carpintera, madera sostenible y diseño de excelencia.',
    path: '/nosotros',
  });

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Un pequeño timeout asegura que la página haya renderizado antes de hacer scroll
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${a.heroImage})` }}
        />
        <div className="absolute inset-0 bg-charcoal/70" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-center mx-auto"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-cream mb-6">
              {a.heroTitle}
            </h1>
            <p className="text-cream/80 text-xl">{a.heroSubtitle}</p>
          </motion.div>
        </div>
      </section>

      <main>
        {/* Story Section */}
        <section className="py-24 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-sm text-primary font-medium uppercase tracking-wider">
                  {a.storyTag}
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2 mb-6">
                  {a.storyTitle}
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>{a.storyP1}</p>
                  <p>{a.storyP2}</p>
                  <p>{a.storyP3}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={a.storyImage}
                    alt="Taller artesanal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl">
                  <div className="font-display text-4xl font-bold">{a.storyBadgeNumber}</div>
                  <div className="text-sm">{a.storyBadgeText}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {a.timelineTag}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                {a.timelineTitle}
              </h2>
            </motion.div>

            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />
              {a.timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} pl-20 md:pl-0`}>
                    <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <span className="inline-block px-4 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium mb-2">
                        {item.year}
                      </span>
                      <h3 className="font-display text-xl font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-6 md:left-1/2 w-5 h-5 rounded-full bg-gold border-4 border-background -translate-x-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold">{a.valuesTitle}</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {a.values.map((value, index) => {
                const Icon = ICON_MAP[value.icon] ?? Heart;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center group"
                  >
                    <motion.div
                      whileHover={{ rotateY: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center"
                    >
                      <Icon className="h-8 w-8 text-gold" />
                    </motion.div>
                    <h3 className="font-display text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-primary-foreground/70 text-sm">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {a.teamTag}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2">
                {a.teamTitle}
              </h2>
              <p className="text-muted-foreground mt-4 max-w-lg mx-auto">{a.teamSubtitle}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {a.team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FlipCard
                    frontImage={member.image}
                    frontTitle={member.name}
                    frontSubtitle={member.role}
                    backTitle={member.name}
                    backContent={member.bio}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Políticas y Términos */}
        <section id="privacidad" className="py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-8 border-b border-border pb-4">
                Política de Privacidad
              </h2>
              <div className="prose prose-stone max-w-none text-muted-foreground space-y-4">
                <p>
                  En <strong>M&D Hijos del Rey</strong> valoramos y respetamos tu privacidad. Esta política de privacidad describe cómo recopilamos, utilizamos y protegemos la información personal que nos proporcionas cuando visitas nuestro sitio web o te comunicas con nosotros.
                </p>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">1. Información que Recopilamos</h3>
                <p>
                  Recopilamos información que nos proporcionas de forma voluntaria, como tu nombre, dirección de correo electrónico, número de teléfono y dirección de envío cuando realizas una cotización, te registras en nuestra página o nos contactas a través de nuestros canales (WhatsApp, correo electrónico).
                </p>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">2. Uso de la Información</h3>
                <p>
                  Utilizamos tu información personal principalmente para:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Procesar y gestionar tus cotizaciones y pedidos.</li>
                  <li>Comunicarnos contigo respecto al estado de tu pedido, consultas o soporte.</li>
                  <li>Mejorar nuestros productos, servicios y la experiencia en nuestro sitio web.</li>
                </ul>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">3. Protección de Datos</h3>
                <p>
                  Implementamos medidas de seguridad para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. No vendemos, intercambiamos ni transferimos tu información a terceros, excepto cuando sea estrictamente necesario para cumplir con un pedido (por ejemplo, servicios de mensajería) o cuando la ley lo exija.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="terminos" className="py-24 bg-cream">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-8 border-b border-border pb-4">
                Términos y Condiciones
              </h2>
              <div className="prose prose-stone max-w-none text-muted-foreground space-y-4">
                <p>
                  Al acceder y utilizar el sitio web de <strong>M&D Hijos del Rey</strong>, aceptas estar sujeto a los siguientes términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, te recomendamos no utilizar nuestro sitio.
                </p>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">1. Productos y Cotizaciones</h3>
                <p>
                  Nuestros muebles son fabricados de manera artesanal. Las imágenes en nuestra web son representativas y pueden presentar ligeras variaciones en la textura y el color de la madera, ya que cada pieza es única. Todas las cotizaciones están sujetas a la disponibilidad de materiales y la confirmación final por parte de nuestro equipo a través de WhatsApp.
                </p>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">2. Precios y Pagos</h3>
                <p>
                  Los precios mostrados en la página o compartidos en cotizaciones son valores de referencia. El monto final, que puede incluir costos de personalización y envío, será confirmado durante la comunicación directa. Los pagos se procesan a través de los medios autorizados (Wompi, transferencias o consignaciones directas que te indicaremos oportunamente).
                </p>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">3. Envíos y Entregas</h3>
                <p>
                  Los tiempos de entrega varían según la complejidad del pedido y la disponibilidad logística. Te informaremos el tiempo estimado al confirmar tu pedido. M&D Hijos del Rey hace todo lo posible por cumplir con los plazos acordados, pero no se hace responsable de retrasos causados por terceros en logística.
                </p>
                <h3 className="font-display text-xl font-semibold text-charcoal mt-6 mb-2">4. Garantía y Cambios</h3>
                <p>
                  Ofrecemos garantía por defectos de fabricación. Sin embargo, no aceptamos devoluciones por cambios de opinión o daños ocasionados por mal uso, humedad excesiva u otros factores externos después de la entrega. Ante cualquier novedad de fabricación, por favor contáctenos durante los primeros 5 días luego de recibir su producto.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
