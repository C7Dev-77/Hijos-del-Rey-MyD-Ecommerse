import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '../cartStore';
import { useAuthStore } from '../authStore';
import type { Product } from '@/types';

// Mock de toast para evitar errores en pruebas sin DOM completo
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

const mockProduct1: Product = {
  id: 'prod-1',
  name: 'Sofá Moderno',
  slug: 'sofa-moderno',
  price: 1500000,
  stock: 10,
  category: 'sala',
  description: 'Un sofá elegante',
  shortDescription: 'Sofá 3 puestos',
  images: ['https://example.com/sofa.jpg'],
  dimensions: { width: 200, height: 90, depth: 90 },
  materials: ['Madera', 'Cuero'],
  rating: 4.8,
  reviewCount: 12,
  createdAt: '2025-01-01',
};

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Mesa de Comedor',
  slug: 'mesa-comedor',
  price: 2200000,
  stock: 5,
  category: 'comedor',
  description: 'Mesa de roble',
  shortDescription: 'Mesa 6 puestos',
  images: ['https://example.com/mesa.jpg'],
  dimensions: { width: 180, height: 75, depth: 100 },
  materials: ['Madera Roble'],
  rating: 4.9,
  reviewCount: 8,
  createdAt: '2025-01-02',
};

describe('useCartStore', () => {
  beforeEach(() => {
    // Resetear el estado del carrito antes de cada test
    useCartStore.setState({ items: [], isOpen: false });

    // Simular usuario autenticado por defecto para poder añadir items
    useAuthStore.setState({ isAuthenticated: true, user: null, isAdmin: false });
  });

  it('debe iniciar con el carrito vacío', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getItemCount()).toBe(0);
    expect(state.getTotal()).toBe(0);
  });

  it('no debe agregar producto si el usuario NO está autenticado', () => {
    useAuthStore.setState({ isAuthenticated: false });

    useCartStore.getState().addItem(mockProduct1, 1);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('debe agregar un producto al carrito cuando el usuario está autenticado', () => {
    useCartStore.getState().addItem(mockProduct1, 2);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('prod-1');
    expect(items[0].quantity).toBe(2);
    expect(useCartStore.getState().getItemCount()).toBe(2);
    expect(useCartStore.getState().getTotal()).toBe(3000000);
  });

  it('debe incrementar la cantidad si el producto ya existe en el carrito', () => {
    useCartStore.getState().addItem(mockProduct1, 1);
    useCartStore.getState().addItem(mockProduct1, 2);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('debe actualizar la cantidad correctamente', () => {
    useCartStore.getState().addItem(mockProduct1, 1);
    useCartStore.getState().updateQuantity('prod-1', 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
    expect(useCartStore.getState().getTotal()).toBe(7500000);
  });

  it('debe eliminar el producto si la cantidad se actualiza a 0 o menor', () => {
    useCartStore.getState().addItem(mockProduct1, 2);
    useCartStore.getState().updateQuantity('prod-1', 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('debe eliminar un producto por ID', () => {
    useCartStore.getState().addItem(mockProduct1, 1);
    useCartStore.getState().addItem(mockProduct2, 1);

    useCartStore.getState().removeItem('prod-1');

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('prod-2');
  });

  it('debe vaciar el carrito con clearCart', () => {
    useCartStore.getState().addItem(mockProduct1, 2);
    useCartStore.getState().addItem(mockProduct2, 1);

    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
  });

  it('debe detectar ítems bajo pedido (madeToOrder)', () => {
    useCartStore.getState().addItem(mockProduct1, 1, false);
    expect(useCartStore.getState().hasPreOrderItems()).toBe(false);

    useCartStore.getState().addItem(mockProduct2, 1, true);
    expect(useCartStore.getState().hasPreOrderItems()).toBe(true);
  });
});
