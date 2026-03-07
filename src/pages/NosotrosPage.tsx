import { motion } from 'framer-motion';
import { Heart, Users, Award, Leaf } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FlipCard } from '@/components/ui/flip-card';

// Clave compartida con el panel de admin para persistir el equipo
const TEAM_KEY = 'myb_team_members';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

const defaultTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Manuel Rodríguez',
    role: 'Fundador & Maestro Ebanista',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Con más de 40 años de experiencia en ebanistería, Manuel es el alma de M&D. Su pasión por la madera comenzó a los 12 años en el taller de su abuelo.',
  },
  {
    id: '2',
    name: 'Daniela Martínez',
    role: 'Co-Fundadora & Directora de Diseño',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Arquitecta de formación, Daniela aporta la visión estética moderna a nuestros diseños tradicionales.',
  },
  {
    id: '3',
    name: 'Carlos Herrera',
    role: 'Maestro Carpintero Senior',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Carlos lleva 25 años perfeccionando el arte de la carpintería fina. Especialista en técnicas de ensamblaje tradicional.',
  },
  {
    id: '4',
    name: 'Ana Lucía Gómez',
    role: 'Especialista en Tapicería',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Ana Lucía transformó su pasión por los textiles en una maestría en tapicería de alta gama.',
  },
];

function loadTeam(): TeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    return raw ? JSON.parse(raw) : defaultTeam;
  } catch { return defaultTeam; }
}


export default function NosotrosPage() {
  const timeline = [
    {
      year: '1990',
      title: 'El Comienzo',
      description: 'Manuel y Daniela fundaron un pequeño taller de carpintería con la visión de crear muebles que trascendieran generaciones.',
    },
    {
      year: '2000',
      title: 'Expansión',
      description: 'Abrimos nuestra primera sala de exhibición y formamos un equipo de 15 artesanos especializados.',
    },
    {
      year: '2010',
      title: 'Reconocimiento',
      description: 'Recibimos el Premio Nacional de Artesanía por nuestra contribución a preservar técnicas tradicionales.',
    },
    {
      year: '2020',
      title: 'Transformación Digital',
      description: 'Lanzamos nuestra plataforma digital sin perder la esencia artesanal que nos caracteriza.',
    },
    {
      year: 'Hoy',
      title: 'Líderes en Artesanía',
      description: 'Más de 30 años creando piezas únicas para miles de hogares colombianos.',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Pasión por el Detalle',
      description: 'Cada pieza recibe la dedicación y el amor que merece.',
    },
    {
      icon: Users,
      title: 'Herencia Familiar',
      description: 'Transmitimos conocimientos de generación en generación.',
    },
    {
      icon: Award,
      title: 'Calidad Superior',
      description: 'Solo utilizamos los mejores materiales y técnicas.',
    },
    {
      icon: Leaf,
      title: 'Sostenibilidad',
      description: 'Comprometidos con el medio ambiente y la comunidad.',
    },
  ];

  // Carga el equipo desde localStorage (actualizado por el admin desde /admin → Configuración → Equipo)
  const team = loadTeam();


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920)' }}
        />
        <div className="absolute inset-0 bg-charcoal/70" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-center mx-auto"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-cream mb-6">
              Nuestra Historia
            </h1>
            <p className="text-cream/80 text-xl">
              Más de tres décadas dedicados a crear muebles artesanales que
              transforman casas en hogares.
            </p>
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
                  Quiénes Somos
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2 mb-6">
                  Artesanos de Tradición, Creadores del Futuro
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    En 1990, Manuel y Daniela comenzaron con un sueño: crear muebles que no
                    solo fueran funcionales, sino verdaderas obras de arte que contaran historias
                    y crearan memorias.
                  </p>
                  <p>
                    Hoy, M&D Hijos del Rey es sinónimo de calidad artesanal en Colombia.
                    Cada pieza que sale de nuestro taller lleva consigo el legado de técnicas
                    tradicionales perfeccionadas durante generaciones.
                  </p>
                  <p>
                    Nuestro compromiso va más allá de la madera: trabajamos con proveedores
                    certificados, utilizamos materiales sostenibles y garantizamos condiciones
                    justas para todos nuestros artesanos.
                  </p>
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
                    src="https://images.unsplash.com/photo-1452457750107-cd084dce177d?w=800"
                    alt="Taller artesanal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-primary text-primary-foreground p-6 rounded-xl shadow-xl">
                  <div className="font-display text-4xl font-bold">30+</div>
                  <div className="text-sm">Años de Experiencia</div>
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
                Nuestra Trayectoria
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
                Hitos que Nos Definen
              </h2>
            </motion.div>

            <div className="relative">
              {/* Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />

              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'} pl-20 md:pl-0`}>
                    <div className={`${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <span className="inline-block px-4 py-1 bg-gold/20 text-gold rounded-full text-sm font-medium mb-2">
                        {item.year}
                      </span>
                      <h3 className="font-display text-xl font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Dot */}
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
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Nuestros Valores
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
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
                    <value.icon className="h-8 w-8 text-gold" />
                  </motion.div>
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {value.title}
                  </h3>
                  <p className="text-primary-foreground/70 text-sm">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team with FlipCards */}
        <section className="py-24 bg-cream">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                Nuestro Equipo
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal mt-2">
                Los Artesanos Detrás de la Magia
              </h2>
              <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
                Toca cada tarjeta para conocer más sobre nuestros artesanos
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
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
      </main>

      <Footer />
    </div>
  );
}
