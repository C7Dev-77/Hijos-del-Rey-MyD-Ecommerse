import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de las tablas en Supabase
export type Tables = {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price: number | null;
    discount: number | null;
    stock: number;
    category: string;
    subcategory: string | null;
    description: string;
    short_description: string;
    images: string[];
    dimensions: { width: number; height: number; depth: number };
    materials: string[];
    colors: string[] | null;
    featured: boolean;
    best_seller: boolean;
    new_arrival: boolean;
    technical_details: string | null;
    shipping_info: string | null;
    returns_info: string | null;
    rating: number;
    review_count: number;
    created_at: string;
  };
  blog_posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    author_avatar: string;
    category: string;
    tags: string[];
    read_time: number;
    created_at: string;
  };
  orders: {
    id: string;
    user_id: string;
    products: { product_id: string; quantity: number; price: number }[];
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    shipping_address: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
  };
  contact_messages: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    read: boolean;
    created_at: string;
  };
  site_config: {
    id: string;
    key: string;
    value: string;
    updated_at: string;
  };
};
