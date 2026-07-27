/**
 * @deprecated Este archivo existe solo por compatibilidad hacia atrás.
 * Importa los tipos desde '@/types' y formatPrice desde '@/lib/utils'.
 *
 * Los tipos y utilidades han sido movidos a:
 *   - Tipos  → src/types/index.ts
 *   - formatPrice → src/lib/utils.ts
 *   - CATEGORIES → src/data/categories.ts
 */

// Re-exportar todos los tipos desde la ubicación canónica
export type {
  User,
  Product,
  ProductDimensions,
  Category,
  Order,
  OrderStatus,
  OrderProduct,
  BlogPost,
  CartItem,
} from '@/types';

// Re-exportar formatPrice desde utils
export { formatPrice } from '@/lib/utils';

// ── Datos estáticos de categorías ────────────────────────────
// TODO: Migrar estas categorías a Supabase (tabla "categories")
//       y remover este archivo completamente.
import type { Category } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Salas',
    slug: 'sala',
    description: 'Piezas diseñadas para aportar personalidad y comodidad al hogar.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    productCount: 8,
  },
  {
    id: '2',
    name: 'Comedores',
    slug: 'comedor',
    description: 'Espacios elegantes y resistentes creados para el encuentro familiar.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    productCount: 6,
  },
  {
    id: '3',
    name: 'Dormitorio',
    slug: 'alcobas',
    description: 'Diseños que combinan confort, funcionalidad y estilo para el descanso.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    productCount: 7,
  },
  {
    id: '4',
    name: 'Poltronas',
    slug: 'poltronas',
    description: 'Poltronas ideales para disfrutar de una buena lectura o descanso.',
    image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
    productCount: 4,
  },
  {
    id: '5',
    name: 'Decoración',
    slug: 'decoracion',
    description: 'Accesorios y piezas decorativas para dar el toque final a tu hogar.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    productCount: 0,
  },
];

// Arrays vacíos mantenidos por compatibilidad
import type { Product, Order, BlogPost } from '@/types';
export const PRODUCTS: Product[] = [];
export const ORDERS: Order[] = [];
export const BLOG_POSTS: BlogPost[] = [];
