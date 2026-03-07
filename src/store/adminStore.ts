import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { Product, BlogPost, Order } from '@/data/mock';

// Interfaces
interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  schedule: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    pinterest: string;
  };
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  logoUrl: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  metaTitle: string;
  metaDescription: string;
  shippingPolicy: string;
  returnPolicy: string;
  privacyPolicy: string;
}

interface HomePageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  favoritesTitle: string;
  bestSellersTitle: string;
  newArrivalsTitle: string;
  designsTitle: string;
  heroBadgeText: string;
  heroButton1Text: string;
  heroButton2Text: string;
  aboutSectionTitle: string;
  aboutSectionText: string;
  aboutSectionButtonText: string;
}

export interface Quote {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userCity: string;
  furnitureType: string;
  width?: string;
  height?: string;
  depth?: string;
  material?: string;
  description: string;
  images: string[]; // Base64 strings for local persistence
  status: 'pending' | 'reviewed' | 'contacted' | 'archived';
  createdAt: string;
}

interface AdminState {
  products: Product[];
  blogPosts: BlogPost[];
  contactInfo: ContactInfo;
  homePageContent: HomePageContent;
  storeSettings: StoreSettings;
  isLoadingProducts: boolean;
  isLoadingBlog: boolean;
  isLoadingOrders: boolean;
  isLoadingSettings: boolean;

  // Settings
  fetchSettings: () => Promise<void>;

  // Products CRUD
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Blog CRUD
  fetchBlogPosts: () => Promise<void>;
  addBlogPost: (post: BlogPost) => Promise<void>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;

  // Orders
  orders: Order[]; // Usaremos Order de mock por ahora
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;

  // Contact, Home, Store Settings (Ahora se guardan en Supabase)
  updateContactInfo: (info: Partial<ContactInfo>) => Promise<void>;
  updateHomePageContent: (content: Partial<HomePageContent>) => Promise<void>;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<void>;

  // Quotes (Cotizaciones)
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
  deleteQuote: (id: string) => void;
}

const defaultContactInfo: ContactInfo = {
  phone: '+57 304 629 7119',
  email: 'info@mydhijosdelrey.com',
  address: 'Barrio 12 de Octubre, Sampués, Sucre, Colombia',
  whatsapp: '+57 324 425 9132',
  schedule: 'Lun - Sáb: 8:00 AM - 6:00 PM',
  socialLinks: {
    facebook: 'https://facebook.com/mydhijosdelrey',
    instagram: 'https://instagram.com/mydhijosdelrey',
    pinterest: 'https://pinterest.com/mydhijosdelrey',
  },
};

const defaultHomePageContent: HomePageContent = {
  heroTitle: 'Muebles que Cuentan Historias',
  heroSubtitle: 'Artesanía colombiana en cada detalle',
  heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920',
  favoritesTitle: 'Los Favoritos',
  bestSellersTitle: 'Más Vendidos',
  newArrivalsTitle: 'Recién Llegados',
  designsTitle: 'Diseños que Transforman Espacios',
  heroBadgeText: '✨ Nuevos diseños 2025',
  heroButton1Text: 'Explorar Catálogo',
  heroButton2Text: 'Cotizar Mueble a Medida',
  aboutSectionTitle: 'Artesanía de Excelencia',
  aboutSectionText: 'Nuestro compromiso es crear piezas únicas que transformen tus espacios. Cada mueble está fabricado con maderas de origen sostenible y mentes creativas.',
  aboutSectionButtonText: 'Conoce Nuestra Historia',
};

const defaultStoreSettings: StoreSettings = {
  storeName: 'M&D Hijos del Rey',
  storeDescription: 'Mobiliario y decoración artesanal en Colombia.',
  logoUrl: '/logo.png',
  currency: 'COP',
  taxRate: 19,
  freeShippingThreshold: 5000000,
  metaTitle: 'M&D Hijos del Rey | Muebles Artesanales',
  metaDescription: 'Descubre nuestros diseños exclusivos y muebles hechos a mano en Colombia.',
  shippingPolicy: 'Envíos a nivel nacional en Colombia con tiempos de entrega de 5 a 10 días hábiles.',
  returnPolicy: 'Se aceptan devoluciones dentro de los 15 días posteriores a la entrega.',
  privacyPolicy: 'Tus datos están seguros con nosotros.',
};

// Helper: convierte snake_case de Supabase a camelCase del frontend
function mapProductFromDB(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    price: row.price as number,
    originalPrice: row.original_price as number | undefined,
    discount: row.discount as number | undefined,
    stock: row.stock as number,
    category: row.category as string,
    subcategory: row.subcategory as string | undefined,
    description: row.description as string,
    shortDescription: row.short_description as string,
    images: (row.images as string[]) || [],
    dimensions: (row.dimensions as { width: number; height: number; depth: number }) || { width: 0, height: 0, depth: 0 },
    materials: (row.materials as string[]) || [],
    colors: row.colors as string[] | undefined,
    featured: (row.featured as boolean) || false,
    bestSeller: (row.best_seller as boolean) || false,
    newArrival: (row.new_arrival as boolean) || false,
    technicalDetails: row.technical_details as string | undefined,
    shippingInfo: row.shipping_info as string | undefined,
    returnsInfo: row.returns_info as string | undefined,
    rating: (row.rating as number) || 4.5,
    reviewCount: (row.review_count as number) || 0,
    createdAt: row.created_at as string,
  };
}

// Helper: convierte camelCase del frontend a snake_case para Supabase
function mapProductToDB(product: Product): Record<string, unknown> {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    original_price: product.originalPrice || null,
    discount: product.discount || null,
    stock: product.stock,
    category: product.category,
    subcategory: product.subcategory || null,
    description: product.description,
    short_description: product.shortDescription,
    images: product.images,
    dimensions: product.dimensions,
    materials: product.materials,
    colors: product.colors || null,
    featured: product.featured || false,
    best_seller: product.bestSeller || false,
    new_arrival: product.newArrival || false,
    technical_details: product.technicalDetails || null,
    shipping_info: product.shippingInfo || null,
    returns_info: product.returnsInfo || null,
    rating: product.rating,
    review_count: product.reviewCount,
  };
}

function mapBlogFromDB(row: Record<string, unknown>): BlogPost {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    image: row.image as string,
    author: row.author as string,
    authorAvatar: (row.author_avatar as string) || '',
    category: row.category as string,
    tags: (row.tags as string[]) || [],
    readTime: (row.read_time as number) || 3,
    createdAt: row.created_at as string,
  };
}

function mapBlogToDB(post: BlogPost): Record<string, unknown> {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    image: post.image,
    author: post.author,
    author_avatar: post.authorAvatar,
    category: post.category,
    tags: post.tags,
    read_time: post.readTime,
  };
}

// Helpers for Settings DB mapping
function mapSettingsFromDB(row: Record<string, unknown>) {
  return {
    storeSettings: {
      storeName: row.store_name as string,
      storeDescription: row.store_description as string,
      logoUrl: row.logo_url as string,
      currency: row.currency as string,
      taxRate: row.tax_rate as number,
      freeShippingThreshold: row.free_shipping_threshold as number,
      metaTitle: row.meta_title as string,
      metaDescription: row.meta_description as string,
      shippingPolicy: row.shipping_policy as string,
      returnPolicy: row.return_policy as string,
      privacyPolicy: row.privacy_policy as string,
    },
    homePageContent: {
      heroTitle: row.hero_title as string,
      heroSubtitle: row.hero_subtitle as string,
      heroImage: row.hero_image as string,
      heroBadgeText: row.hero_badge_text as string,
      favoritesTitle: row.favorites_title as string,
      bestSellersTitle: row.best_sellers_title as string,
      newArrivalsTitle: row.new_arrivals_title as string,
      designsTitle: row.designs_title as string,
      heroButton1Text: (row.hero_button1_text as string) || defaultHomePageContent.heroButton1Text,
      heroButton2Text: (row.hero_button2_text as string) || defaultHomePageContent.heroButton2Text,
      aboutSectionTitle: (row.about_section_title as string) || defaultHomePageContent.aboutSectionTitle,
      aboutSectionText: (row.about_section_text as string) || defaultHomePageContent.aboutSectionText,
      aboutSectionButtonText: (row.about_section_button_text as string) || defaultHomePageContent.aboutSectionButtonText,
    },
    contactInfo: {
      phone: row.contact_phone as string,
      email: row.contact_email as string,
      address: row.contact_address as string,
      whatsapp: row.contact_whatsapp as string,
      schedule: row.contact_schedule as string,
      socialLinks: {
        facebook: row.social_facebook as string,
        instagram: row.social_instagram as string,
        pinterest: row.social_pinterest as string,
      }
    }
  };
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Estado inicial vacío (sin datos falsos)
      products: [],
      blogPosts: [],
      contactInfo: defaultContactInfo,
      homePageContent: defaultHomePageContent,
      storeSettings: defaultStoreSettings,
      isLoadingProducts: false,
      isLoadingBlog: false,
      isLoadingOrders: false,
      isLoadingSettings: false,
      orders: [],
      quotes: [],

      // ─── Products ──────────────────────────────────────────────
      fetchProducts: async () => {
        set({ isLoadingProducts: true });
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase no disponible, usando datos mock:', error.message);
          set({ isLoadingProducts: false });
          return;
        }

        if (data && data.length > 0) {
          set({ products: data.map(mapProductFromDB), isLoadingProducts: false });
        } else {
          // Si la tabla está vacía, se quedan los datos mock
          set({ isLoadingProducts: false });
        }
      },

      addProduct: async (product) => {
        const { error } = await supabase
          .from('products')
          .insert(mapProductToDB(product));

        if (error) {
          console.error('Error al crear producto:', error.message);
          // Fallback: agregar solo localmente
          set((state) => ({ products: [...state.products, product] }));
          return;
        }

        await get().fetchProducts();
      },

      updateProduct: async (id, updatedProduct) => {
        const current = get().products.find((p) => p.id === id);
        if (!current) return;
        const merged = { ...current, ...updatedProduct };

        const { error } = await supabase
          .from('products')
          .update(mapProductToDB(merged))
          .eq('id', id);

        if (error) {
          console.error('Error al actualizar producto:', error.message);
        }

        // Actualizar localmente siempre (UX inmediata)
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? merged : p)),
        }));
      },

      deleteProduct: async (id) => {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error al eliminar producto:', error.message);
        }

        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      // ─── Blog ──────────────────────────────────────────────────
      fetchBlogPosts: async () => {
        set({ isLoadingBlog: true });
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase no disponible, usando datos mock:', error.message);
          set({ isLoadingBlog: false });
          return;
        }

        if (data && data.length > 0) {
          set({ blogPosts: data.map(mapBlogFromDB), isLoadingBlog: false });
        } else {
          set({ isLoadingBlog: false });
        }
      },

      addBlogPost: async (post) => {
        const { error } = await supabase
          .from('blog_posts')
          .insert(mapBlogToDB(post));

        if (error) {
          console.error('Error al crear artículo:', error.message);
          set((state) => ({ blogPosts: [...state.blogPosts, post] }));
          return;
        }

        await get().fetchBlogPosts();
      },

      updateBlogPost: async (id, updatedPost) => {
        const current = get().blogPosts.find((p) => p.id === id);
        if (!current) return;
        const merged = { ...current, ...updatedPost };

        const { error } = await supabase
          .from('blog_posts')
          .update(mapBlogToDB(merged))
          .eq('id', id);

        if (error) {
          console.error('Error al actualizar artículo:', error.message);
        }

        set((state) => ({
          blogPosts: state.blogPosts.map((p) => (p.id === id ? merged : p)),
        }));
      },

      deleteBlogPost: async (id) => {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error al eliminar artículo:', error.message);
        }

        set((state) => ({
          blogPosts: state.blogPosts.filter((p) => p.id !== id),
        }));
      },

      // ─── Orders CRUD ─────────────────────────────────────────────
      fetchOrders: async () => {
        set({ isLoadingOrders: true });

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error.message);
          set({ isLoadingOrders: false });
          return;
        }

        const orders: Order[] = (data || []).map(row => ({
          id: row.id,
          userId: row.user_id,
          products: row.products || [],
          status: row.status as Order['status'],
          total: row.total,
          shippingAddress: row.shipping_address,
          paymentMethod: row.payment_method,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        set({ orders, isLoadingOrders: false });
      },

      updateOrderStatus: async (id: string, status: string) => {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id);

        if (error) {
          console.error('Error updating order:', error.message);
          return;
        }

        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o))
        }));
      },

      // ─── Contact & Home & Store Settings (Supabase) ─────────────────
      fetchSettings: async () => {
        set({ isLoadingSettings: true });
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) {
          console.warn('Error fetching app settings, using fallback/local storage:', error.message);
          set({ isLoadingSettings: false });
          return;
        }

        if (data) {
          const parsed = mapSettingsFromDB(data);
          set({
            storeSettings: parsed.storeSettings,
            homePageContent: parsed.homePageContent,
            contactInfo: parsed.contactInfo,
          });
        }
        set({ isLoadingSettings: false });
      },

      updateContactInfo: async (info) => {
        set((state) => ({ contactInfo: { ...state.contactInfo, ...info } }));
        const updated = get().contactInfo;

        await supabase.from('app_settings').update({
          contact_phone: updated.phone,
          contact_email: updated.email,
          contact_address: updated.address,
          contact_whatsapp: updated.whatsapp,
          contact_schedule: updated.schedule,
          social_facebook: updated.socialLinks.facebook,
          social_instagram: updated.socialLinks.instagram,
          social_pinterest: updated.socialLinks.pinterest,
        }).eq('id', 1);
      },

      updateHomePageContent: async (content) => {
        set((state) => ({ homePageContent: { ...state.homePageContent, ...content } }));
        const updated = get().homePageContent;

        const { error } = await supabase.from('app_settings').update({
          hero_title: updated.heroTitle,
          hero_subtitle: updated.heroSubtitle,
          hero_image: updated.heroImage,
          hero_badge_text: updated.heroBadgeText,
          favorites_title: updated.favoritesTitle,
          best_sellers_title: updated.bestSellersTitle,
          new_arrivals_title: updated.newArrivalsTitle,
          designs_title: updated.designsTitle,
          // Intenta también actualizar las nuevas si existen (si la tabla se actualizó)
          hero_button1_text: updated.heroButton1Text,
          hero_button2_text: updated.heroButton2Text,
          about_section_title: updated.aboutSectionTitle,
          about_section_text: updated.aboutSectionText,
          about_section_button_text: updated.aboutSectionButtonText,
        }).eq('id', 1);

        if (error) {
          console.warn('Algunas columnas nuevas podrían no estar en Supabase, error ignorado localmente:', error.message);
        }
      },

      updateStoreSettings: async (settings) => {
        set((state) => ({ storeSettings: { ...state.storeSettings, ...settings } }));
        const updated = get().storeSettings;

        await supabase.from('app_settings').update({
          store_name: updated.storeName,
          store_description: updated.storeDescription,
          logo_url: updated.logoUrl,
          currency: updated.currency,
          tax_rate: updated.taxRate,
          free_shipping_threshold: updated.freeShippingThreshold,
          meta_title: updated.metaTitle,
          meta_description: updated.metaDescription,
          shipping_policy: updated.shippingPolicy,
          return_policy: updated.returnPolicy,
          privacy_policy: updated.privacyPolicy,
        }).eq('id', 1);
      },

      // ─── Quotes ────────────────────────────────────────────────
      addQuote: (quote) =>
        set((state) => ({
          quotes: [quote, ...state.quotes],
        })),

      updateQuoteStatus: (id, status) =>
        set((state) => ({
          quotes: state.quotes.map((q) => (q.id === id ? { ...q, status } : q)),
        })),

      deleteQuote: (id) =>
        set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id),
        })),
    }),
    {
      name: 'myd-admin-store',
      // Todavía persistimos en local como fallback rápido visual (cargos optimistas)
      partialize: (state) => ({
        contactInfo: state.contactInfo,
        homePageContent: state.homePageContent,
        storeSettings: state.storeSettings,
        quotes: state.quotes,
      }),
    }
  )
);
