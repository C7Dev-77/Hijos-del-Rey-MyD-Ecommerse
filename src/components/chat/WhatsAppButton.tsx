import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';

export function WhatsAppButton() {
    const [isHovered, setIsHovered] = useState(false);
    const { contactInfo } = useAdminStore();

    // Limpiar el número de WhatsApp para la URL
    const whatsappNumber = contactInfo.whatsapp.replace(/[^0-9+]/g, '').replace('+', '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        '¡Hola! Me gustaría obtener información sobre sus muebles artesanales. 🪑'
    )}`;

    return (
        <motion.div
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        >
            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-3 whitespace-nowrap"
                    >
                        <div className="bg-charcoal text-cream text-sm px-4 py-2.5 rounded-xl shadow-lg font-medium">
                            💬 ¡Chatea con nuestro equipo!
                            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-charcoal rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pulse ring animation */}
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse opacity-10" style={{ animationDelay: '0.5s' }} />

            {/* Main Button */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-full bg-[#25D366] text-white shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_32px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Contactar por WhatsApp"
            >
                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </motion.div>
    );
}
