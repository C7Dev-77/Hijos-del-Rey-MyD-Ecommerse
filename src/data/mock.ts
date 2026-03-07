// Types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'customer';
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  images: string[];
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  materials: string[];
  colors?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;

  // Extra Admin fields
  technicalDetails?: string;
  shippingInfo?: string;
  returnsInfo?: string;

  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Order {
  id: string;
  userId: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  readTime: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Mock Categories
export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Colección de Salas',
    slug: 'sala',
    description: 'Piezas diseñadas para aportar personalidad y comodidad al hogar.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    productCount: 8,
  },
  {
    id: '2',
    name: 'Colección de Comedores',
    slug: 'comedor',
    description: 'Espacios elegantes y resistentes creados para el encuentro familiar.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    productCount: 6,
  },
  {
    id: '3',
    name: 'Colección de Dormitorio',
    slug: 'alcobas',
    description: 'Diseños que combinan confort, funcionalidad y estilo para el descanso.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    productCount: 7,
  },
  {
    id: '4',
    name: 'Colección de poltronas',
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

export const PRODUCTS: Product[] = [];
export const ORDERS: Order[] = [];
export const BLOG_POSTS: BlogPost[] = [];

// Helper functions
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

