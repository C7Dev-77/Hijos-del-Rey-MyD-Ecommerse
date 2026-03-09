import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/store/adminStore';
import { CATEGORIES } from '@/data/mock';

export function Footer() {
  const { contactInfo } = useAdminStore();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream">


      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/logo.png" alt="M&D Hijos del Rey" className="h-12 w-auto" />
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed">
              Muebles artesanales colombianos de alta calidad. Cada pieza cuenta
              una historia de tradición y calidad hecha en Sampués, Sucre.
            </p>
            <div className="flex space-x-4">
              {contactInfo.socialLinks?.facebook && (
                <a
                  href={contactInfo.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {contactInfo.socialLinks?.instagram && (
                <a
                  href={contactInfo.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {contactInfo.socialLinks?.pinterest && (
                <a
                  href={contactInfo.socialLinks.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', to: '/' },
                { label: 'Catálogo', to: '/catalogo' },
                { label: 'Nosotros', to: '/nosotros' },
                { label: 'Cotizar', to: '/cotizar' },
                { label: 'Blog', to: '/blog' },
                { label: 'Contacto', to: '/contacto' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-cream/70 hover:text-gold transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories — estáticas desde CATEGORIES */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">
              Categorías
            </h3>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/catalogo?categoria=${cat.slug}`}
                    className="text-cream/70 hover:text-gold transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info — datos dinámicos desde adminStore/Supabase */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">
              Contacto
            </h3>
            <ul className="space-y-4">
              {contactInfo.address && (
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-cream/70 text-sm">{contactInfo.address}</span>
                </li>
              )}
              {contactInfo.phone && (
                <li className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gold shrink-0" />
                  <a
                    href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                    className="text-cream/70 hover:text-gold text-sm"
                  >
                    {contactInfo.phone}
                  </a>
                </li>
              )}
              {contactInfo.email && (
                <li className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gold shrink-0" />
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-cream/70 hover:text-gold text-sm"
                  >
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo.schedule && (
                <li className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                  <span className="text-cream/70 text-sm">{contactInfo.schedule}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-cream/50 text-sm">
              © {currentYear} M&amp;D Hijos del Rey. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/nosotros#privacidad" className="text-cream/50 hover:text-gold transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/nosotros#terminos" className="text-cream/50 hover:text-gold transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
