import { motion } from 'framer-motion';
import { useAdminStore } from '@/store/adminStore';

export function PromoMarquee() {
  const { homePageContent } = useAdminStore();
  const promos = homePageContent.promos || [];

  if (promos.length === 0) return null;

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
          {promos.map((promo, index) => (
            <span key={index} className="flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">{promo.icon}</span>
              <span>{promo.text}</span>
              <span className="text-gold mx-4">•</span>
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {promos.map((promo, index) => (
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
