import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  LogOut,
  LayoutDashboard,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { SearchModal } from './SearchModal';

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Cotizar', href: '/cotizar' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contacto', href: '/contacto' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  const { openCart, getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const itemCount = getItemCount();
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';
  const navBg = isScrolled || !isHome || mobileMenuOpen
    ? 'bg-background/95 backdrop-blur-md shadow-md'
    : 'bg-transparent';
  const textColor = isScrolled || !isHome || mobileMenuOpen
    ? 'text-foreground'
    : 'text-cream';

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      navBg
    )}>
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <img fetchPriority="high" width={200} height={40} src="/logo.png" alt="M&D Hijos del Rey Logo" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className={cn('font-display text-2xl font-bold hidden sm:block', textColor)}>
                M&D <span className="text-gold">Hijos del Rey</span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-gold relative group',
                  textColor,
                  location.pathname === link.href || (link.href === '/catalogo' && location.pathname.startsWith('/catalogo')) ? 'text-gold' : ''
                )}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(textColor, 'hover:text-gold hover:bg-transparent flex items-center justify-center')}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Buscar productos (Ctrl+K)"
            >
              <Search className="h-5 w-5" />
            </Button>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Wishlist */}
            <Link to="/favoritos" aria-label="Ir a favoritos">
              <Button variant="ghost" size="icon" className={cn(textColor, 'hover:text-gold hover:bg-transparent hidden sm:flex relative')} aria-label="Ver favoritos">
                <Heart className={cn("h-5 w-5", wishlistCount > 0 && "text-red-500 fill-red-500")} />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(textColor, 'hover:text-gold hover:bg-transparent relative')}
              onClick={openCart}
              aria-label="Abrir carrito de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-charcoal text-xs font-bold flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn(textColor, 'hover:text-gold hover:bg-transparent')} aria-label="Menú de usuario">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.user_metadata?.name || 'Mi Cuenta'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" aria-label="Iniciar sesión">
                <Button variant="ghost" size="icon" className={cn(textColor, 'hover:text-gold hover:bg-transparent')} aria-label="Iniciar sesión">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(textColor, 'hover:text-gold hover:bg-transparent lg:hidden')}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú principal"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    'block py-2 text-lg font-medium transition-colors hover:text-gold',
                    location.pathname === link.href ? 'text-gold' : 'text-foreground'
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {!isAuthenticated ? (
                <div className="pt-4 border-t border-border space-y-2">
                  <Link to="/login">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-wood-light">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/registro">
                    <Button variant="outline" className="w-full">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-border space-y-2">
                  <Link to="/perfil">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <User className="h-4 w-4" />
                      Mi Perfil
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full text-destructive flex items-center justify-center gap-2"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
