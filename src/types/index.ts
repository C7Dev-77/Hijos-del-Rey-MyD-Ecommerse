// ============================================================
// src/types/index.ts
// Tipos centralizados del dominio — Hijos del Rey M&D
// ============================================================

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

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
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
  dimensions: ProductDimensions;
  materials: string[];
  colors?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;

  // Campos admin adicionales
  technicalDetails?: string;
  shippingInfo?: string;
  returnsInfo?: string;

  rating: number;
  reviewCount: number;
  salesCount?: number;
  createdAt: string;

  // Fabricación a pedido
  manufacturingTime?: '7 días' | '15 días' | '30 días' | '+30 días';
  advancePercentage?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  products: OrderProduct[];
  status: OrderStatus;
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
  /** Producto fabricado a pedido (sin stock en tienda) */
  madeToOrder?: boolean;
}
