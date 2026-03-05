import { motion } from 'framer-motion';

const promoMessages = [
  { icon: '🛡️', text: 'Garantía Extendida: Todos nuestros diseños incluyen una Garantía de 5 años contra defectos de fabricación. ¡Inversión a largo plazo asegurada!' },
  { icon: '💳', text: 'Paga a tu Ritmo: Financia tu compra hasta en 12 cuotas sin intereses con Bancolombia. ¡Renueva tu hogar hoy!' },
  { icon: '📐', text: 'Diseño a Medida: ¿No encuentras la medida perfecta? Pregunta por nuestro servicio de personalización de muebles. ¡Creamos tu visión!' },
  { icon: '⏳', text: 'Colección Limitada: ¡Solo quedan 48 horas para conseguir la Silla de Diseño Exclusivo Copenhagen! Edición de temporada.' },
  { icon: '🥇', text: 'Más de 2,500 Clientes Felices: Hemos amueblado más de 2,500 hogares con muebles de calidad superior. ¡Únete a la comunidad!' },
];

export function PromoMarquee() {
  return (
    <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden">
      <div className="relative flex">
        <motion.div
          className="flex gap-16 whitespace-nowrap"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {/* First set */}
          {promoMessages.map((promo, index) => (
            <span key={index} className="flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">{promo.icon}</span>
              <span>{promo.text}</span>
              <span className="text-gold mx-4">•</span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {promoMessages.map((promo, index) => (
            <span key={`dup-${index}`} className="flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">{promo.icon}</span>
              <span>{promo.text}</span>
              <span className="text-gold mx-4">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
