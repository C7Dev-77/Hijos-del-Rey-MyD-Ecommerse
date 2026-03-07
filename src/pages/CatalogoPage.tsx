import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3X3,
  LayoutList
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CATEGORIES, formatPrice, Product } from '@/data/mock';
import { useAdminStore } from '@/store/adminStore';
import { usePageSEO } from '@/hooks/useSEO';

interface FiltersContentProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  inStockOnly: boolean;
  setInStockOnly: (value: boolean) => void;
  clearFilters: () => void;
  allProducts: Product[];
}

const FiltersContent = ({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  toggleCategory,
  priceRange,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  clearFilters,
  allProducts,
}: FiltersContentProps) => (
  <div className="space-y-8">
    {/* Search */}
    <div>
      <h3 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">
        Buscar
      </h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>

    {/* Categories */}
    <div>
      <h3 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">
        Categorías
      </h3>
      <div className="space-y-3">
        {CATEGORIES.map((category) => {
          const count = allProducts.filter(p => p.category === category.slug || p.category === category.name).length;
          return (
            <label
              key={category.id}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({count})
              </span>
            </label>
          )
        })}
      </div>
    </div>

    {/* Price Range */}
    <div>
      <h3 className="font-display text-sm font-semibold mb-4 uppercase tracking-wider">
        Precio
      </h3>
      <Slider
        value={priceRange}
        onValueChange={setPriceRange}
        min={0}
        max={6000000}
        step={100000}
        className="mb-4"
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatPrice(priceRange[0])}</span>
        <span>{formatPrice(priceRange[1])}</span>
      </div>
    </div>

    {/* Stock */}
    <div>
      <label className="flex items-center space-x-3 cursor-pointer">
        <Checkbox
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <span className="text-sm">Solo productos en stock</span>
      </label>
    </div>

    {/* Clear Filters */}
    <Button
      variant="outline"
      className="w-full"
      onClick={clearFilters}
    >
      Limpiar Filtros
    </Button>
  </div>
);

export default function CatalogoPage() {
  const { products: allProducts } = useAdminStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 6000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categoria') ? [searchParams.get('categoria')!] : []
  );

  const activeCategoryName = selectedCategories.length === 1
    ? CATEGORIES.find(c => c.slug === selectedCategories[0])?.name
    : null;

  usePageSEO({
    title: activeCategoryName
      ? `Comprar ${activeCategoryName} de Madera`
      : 'Catálogo de Muebles Artesanales',
    description: activeCategoryName
      ? `Descubre nuestro catálogo exclusivo de ${activeCategoryName.toLowerCase()} hechos a mano. Diseños únicos en madera con envío garantizado.`
      : 'Explora el catálogo completo de muebles artesanales de M&D Hijos del Rey. Salas, comedores, alcobas, poltronas y decoración. Muebles colombianos de madera de alta calidad con envío a todo el país.',
    path: activeCategoryName ? `/catalogo?categoria=${selectedCategories[0]}` : '/catalogo',
  });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) => {
          const catName = CATEGORIES.find((c) => c.slug === p.category)?.name || '';
          return p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            catName.toLowerCase().includes(query);
        }
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const matchingCategory = CATEGORIES.find(c => c.slug === p.category || c.name === p.category);
        return matchingCategory ? selectedCategories.includes(matchingCategory.slug) : false;
      });
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategories, priceRange, inStockOnly, sortBy, allProducts]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 6000000]);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const filtersProps = {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    clearFilters,
    allProducts
  };

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
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">Inicio</Link>
              <span>/</span>
              <span className="text-foreground">Catálogo</span>
            </nav>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal">
              Nuestro Catálogo
            </h1>
            <p className="text-muted-foreground mt-4">
              Descubre nuestra colección completa de muebles artesanales, cada pieza
              diseñada para transformar tu hogar.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-28">
                <FiltersContent {...filtersProps} />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredProducts.length}</span> productos encontrados
                </p>

                <div className="flex items-center gap-4">
                  {/* Mobile Filters */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filtros
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle className="font-display">Filtros</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersContent {...filtersProps} />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    <option value="featured">Destacados</option>
                    <option value="newest">Más nuevos</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="rating">Mejor valorados</option>
                  </select>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center border border-input rounded-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-muted' : ''}`}
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || searchQuery || inStockOnly) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {CATEGORIES.find((c) => c.slug === cat)?.name}
                      <button onClick={() => toggleCategory(cat)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Products */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    No se encontraron productos con los filtros seleccionados.
                  </p>
                  <Button onClick={clearFilters}>Limpiar Filtros</Button>
                </div>
              ) : (
                <motion.div
                  layout
                  className={`grid gap-6 ${viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                    }`}
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
