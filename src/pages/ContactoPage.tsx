import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/store/adminStore';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(20, 'El mensaje debe tener al menos 20 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const { contactInfo } = useAdminStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Guardar mensaje en Supabase
      const { error } = await supabase.from('contact_messages').insert([{
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        read: false,
      }]);

      if (error) throw error;

      toast({
        title: '¡Mensaje enviado!',
        description: 'Hemos recibido tu mensaje. Nos pondremos en contacto contigo pronto.',
      });
      reset();
    } catch (err) {
      console.error('Error al guardar mensaje de contacto:', err);
      // Fallback: abrir WhatsApp con el mensaje si Supabase falla
      const whatsappNumber = contactInfo.whatsapp.replace(/\D/g, '') || '573001234567';
      const fallbackMsg = `Hola, soy ${data.name}.\n\n*Asunto:* ${data.subject}\n\n${data.message}`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fallbackMsg)}`, '_blank');
      toast({
        title: 'Error de conexión',
        description: 'No pudimos guardar tu mensaje. Te redirigimos a WhatsApp para que no se pierda.',
        variant: 'destructive',
      });
    }
  };


  const contactCards = [
    {
      icon: MapPin,
      title: 'Visítanos',
      lines: [contactInfo.address || 'Bogotá, Colombia'],
    },
    {
      icon: Phone,
      title: 'Llámanos',
      lines: [contactInfo.phone || '+57 300 000 0000'],
    },
    {
      icon: Mail,
      title: 'Escríbenos',
      lines: [contactInfo.email || 'info@mydhijosdelrey.com'],
    },
    {
      icon: Clock,
      title: 'Horario',
      lines: [contactInfo.schedule || 'Lun - Sáb: 9:00 AM - 7:00 PM'],
    },
  ];

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
              Contacto
            </h1>
            <p className="text-muted-foreground mt-4">
              Estamos aquí para ayudarte. Contáctanos y resolveremos todas tus
              dudas sobre nuestros muebles artesanales.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              {contactCards.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-muted-foreground text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Social Links */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-display font-semibold mb-4">Síguenos</h3>
                <div className="flex gap-3">
                  {[Facebook, Instagram, Twitter].map((Icon, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <motion.a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '') || '573001234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-4 bg-forest text-cream rounded-xl"
              >
                <MessageCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">¿Prefieres WhatsApp?</p>
                  <p className="text-sm text-cream/80">Chatea con nosotros directamente</p>
                </div>
              </motion.a>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-card border border-border rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold mb-6">
                  Envíanos un Mensaje
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre Completo *
                      </label>
                      <Input
                        {...register('name')}
                        placeholder="Tu nombre"
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Correo Electrónico *
                      </label>
                      <Input
                        {...register('email')}
                        type="email"
                        placeholder="tu@email.com"
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Teléfono
                      </label>
                      <Input
                        {...register('phone')}
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Asunto *
                      </label>
                      <Input
                        {...register('subject')}
                        placeholder="¿En qué podemos ayudarte?"
                        className={errors.subject ? 'border-destructive' : ''}
                      />
                      {errors.subject && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mensaje *
                    </label>
                    <Textarea
                      {...register('message')}
                      placeholder="Cuéntanos más detalles..."
                      rows={6}
                      className={errors.message ? 'border-destructive' : ''}
                    />
                    {errors.message && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-wood-light"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Mapa Real — Google Maps Embed (no requiere API key) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 rounded-2xl overflow-hidden h-96 shadow-lg border border-border"
          >
            <iframe
              title="Ubicación M&D Hijos del Rey — Sampués, Sucre"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15717.22!2d-75.3872!3d9.1836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e59a9b5e5e5e5e5%3A0x1234567890abcdef!2sSamp%C3%BAes%2C%20Sucre%2C%20Colombia!5e0!3m2!1ses!2sco!4v1000000000000!5m2!1ses!2sco"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
