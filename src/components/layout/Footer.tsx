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
import { CATEGORIES } from '@/data/mock';

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Newsletter Section */}
      <div className="border-b border-cream/10">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-2">
                Suscríbete a nuestro boletín
              </h3>
              <p className="text-cream/70">
                Recibe ofertas exclusivas y novedades directamente en tu correo.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-cream/10 border-cream/20 text-cream placeholder:text-cream/50 w-full md:w-72"
              />
              <Button className="bg-gold text-charcoal hover:bg-gold/90 whitespace-nowrap">
                Suscribirse
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <h2 className="font-display text-2xl font-bold">
                M&D <span className="text-gold">Hijos del Rey</span>
              </h2>
            </Link>
            <p className="text-cream/70 text-sm leading-relaxed">
              Más de 30 años creando muebles artesanales que transforman 
              hogares en espacios únicos. Cada pieza cuenta una historia 
              de tradición y calidad.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              {['Inicio', 'Catálogo', 'Nosotros', 'Cotizar', 'Blog', 'Contacto'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item === 'Inicio' ? '' : item.toLowerCase()}`}
                    className="text-cream/70 hover:text-gold transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">
              Categorías
            </h3>
            <ul className="space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link 
                    to={`/catalogo?categoria=${category.slug}`}
                    className="text-cream/70 hover:text-gold transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="h-4 w-4 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">
              Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="text-cream/70 text-sm">
                  Calle 45 #23-67, Zona Industrial<br />
                  Bogotá, Colombia
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <a href="tel:+573001234567" className="text-cream/70 hover:text-gold text-sm">
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <a href="mailto:info@myd.com" className="text-cream/70 hover:text-gold text-sm">
                  info@mydhijosdelrey.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <span className="text-cream/70 text-sm">
                  Lun - Vie: 8:00 AM - 6:00 PM<br />
                  Sáb: 9:00 AM - 2:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-cream/50 text-sm">
              © 2024 M&D Hijos del Rey. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="#" className="text-cream/50 hover:text-gold transition-colors">
                Política de Privacidad
              </Link>
              <Link to="#" className="text-cream/50 hover:text-gold transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
