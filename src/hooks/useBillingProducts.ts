import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BillingProduct {
    id: string;
    code: string;
    name: string;
    description: string;
    category: string;
    price: number;
    tax: number;
    stock: number;
    status: 'active' | 'inactive' | 'low_stock';
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface BillingProductInput {
    code: string;
    name: string;
    description: string;
    category: string;
    price: number;
    tax: number;
    stock: number;
    status: 'active' | 'inactive' | 'low_stock';
}

export const BILLING_PRODUCT_CATEGORIES = [
    'Dormitorios',
    'Oficina',
    'Decoración',
    'Salas',
    'Poltronas',
    'Comedores',
] as const;

export function useBillingProducts() {
    const [products, setProducts] = useState<BillingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('billing_products')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setProducts(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error al cargar productos:', err);
            setError(err.message);
            toast.error('Error al cargar productos', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async (productData: BillingProductInput) => {
        try {
            const status = productData.stock === 0 ? 'inactive' : productData.stock <= 5 ? 'low_stock' : 'active';
            const { data, error } = await supabase
                .from('billing_products')
                .insert([{ ...productData, status }])
                .select()
                .single();
            if (error) throw error;
            setProducts((prev) => [data, ...prev]);
            toast.success('Producto creado', { description: `${productData.name} ha sido agregado correctamente` });
            return { data, error: null };
        } catch (err: any) {
            console.error('Error al crear producto:', err);
            if (err.code === '23505' && err.message.includes('code')) {
                toast.error('Código duplicado', { description: 'Ya existe un producto con este código' });
            } else {
                toast.error('Error al crear producto', { description: err.message });
            }
            return { data: null, error: err };
        }
    };

    const updateProduct = async (id: string, productData: Partial<BillingProductInput>) => {
        try {
            let updateData = { ...productData };
            if (productData.stock !== undefined) {
                updateData.status = productData.stock === 0 ? 'inactive' : productData.stock <= 5 ? 'low_stock' : 'active';
            }
            const { data, error } = await supabase
                .from('billing_products')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            setProducts((prev) => prev.map((product) => (product.id === id ? data : product)));
            toast.success('Producto actualizado', { description: 'Los cambios han sido guardados correctamente' });
            return { data, error: null };
        } catch (err: any) {
            console.error('Error al actualizar producto:', err);
            toast.error('Error al actualizar producto', { description: err.message });
            return { data: null, error: err };
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await supabase
                .from('billing_products')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            setProducts((prev) => prev.filter((product) => product.id !== id));
            toast.success('Producto eliminado', { description: 'El producto ha sido eliminado correctamente' });
            return { error: null };
        } catch (err: any) {
            console.error('Error al eliminar producto:', err);
            toast.error('Error al eliminar producto', { description: err.message });
            return { error: err };
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct };
}
