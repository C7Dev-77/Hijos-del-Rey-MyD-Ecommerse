import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    product_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    tax: number;
    total: number;
    created_at: string;
}

export interface Invoice {
    id: string;
    number: string;
    client_id: string;
    date: string;
    due_date: string;
    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    client?: {
        id: string;
        name: string;
        nit: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
    };
    invoice_items?: InvoiceItem[];
}

export interface InvoiceItemInput {
    product_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    tax: number;
}

export interface InvoiceInput {
    client_id: string;
    date: string;
    due_date: string;
    notes?: string;
    items: InvoiceItemInput[];
}

export function useInvoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const generateInvoiceNumber = async (): Promise<string> => {
        try {
            const { data, error } = await supabase.rpc('generate_invoice_number');
            if (error) throw error;
            if (data) return data as string;
            throw new Error('No se recibió número de factura');
        } catch (err) {
            console.error('Error al generar número con RPC, usando fallback seguro:', err);
            try {
                const { data: lastInvoice } = await supabase
                    .from('invoices')
                    .select('number')
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                if (lastInvoice?.number) {
                    const match = lastInvoice.number.match(/-(\d+)$/);
                    if (match) {
                        const nextNum = parseInt(match[1], 10) + 1;
                        return `FE-${String(nextNum).padStart(3, '0')}`;
                    }
                }
                return 'FE-001';
            } catch (fallbackErr) {
                console.error('Error en fallback de numeración:', fallbackErr);
                return 'FE-001';
            }
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    *,
                    client:billing_clients!client_id (
                        id, name, nit, email, phone, address, city
                    ),
                    invoice_items (
                        id, product_id, description, quantity, unit_price, tax, total
                    )
                `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setInvoices(data || []);
            setError(null);
        } catch (err: any) {
            console.error('Error al cargar facturas:', err);
            setError(err.message);
            toast.error('Error al cargar facturas', { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const createInvoice = async (invoiceData: InvoiceInput) => {
        try {
            let subtotal = 0;
            let tax_amount = 0;
            const itemsWithTotals = invoiceData.items.map((item) => {
                const itemSubtotal = item.quantity * item.unit_price;
                const itemTax = (itemSubtotal * item.tax) / 100;
                const itemTotal = itemSubtotal + itemTax;
                subtotal += itemSubtotal;
                tax_amount += itemTax;
                return { ...item, total: itemTotal };
            });
            const total_amount = subtotal + tax_amount;
            const number = await generateInvoiceNumber();
            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert([{
                    number,
                    client_id: invoiceData.client_id,
                    date: invoiceData.date,
                    due_date: invoiceData.due_date,
                    status: 'pending',
                    subtotal,
                    tax_amount,
                    total_amount,
                    notes: invoiceData.notes || null,
                }])
                .select()
                .single();
            if (invoiceError) throw invoiceError;
            const itemsToInsert = itemsWithTotals.map((item) => ({
                invoice_id: invoice.id,
                ...item,
            }));
            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);
            if (itemsError) throw itemsError;
            for (const item of invoiceData.items) {
                if (item.product_id) {
                    await supabase.rpc('decrement_billing_product_stock', {
                        p_product_id: item.product_id,
                        p_quantity: item.quantity,
                    });
                }
            }
            await fetchInvoices();
            toast.success('Factura creada', { description: `Factura ${number} creada correctamente` });
            return { data: invoice, error: null };
        } catch (err: any) {
            console.error('Error al crear factura:', err);
            toast.error('Error al crear factura', { description: err.message });
            return { data: null, error: err };
        }
    };

    const updateInvoiceStatus = async (id: string, status: 'paid' | 'pending' | 'overdue' | 'cancelled') => {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({ status })
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? { ...invoice, status } : invoice)));
            toast.success('Estado actualizado', { description: `La factura ahora está marcada como ${status}` });
            return { data, error: null };
        } catch (err: any) {
            console.error('Error al actualizar estado:', err);
            toast.error('Error al actualizar estado', { description: err.message });
            return { data: null, error: err };
        }
    };

    const updateInvoice = async (id: string, invoiceData: InvoiceInput) => {
        try {
            let subtotal = 0;
            let tax_amount = 0;
            const itemsWithTotals = invoiceData.items.map((item) => {
                const itemSubtotal = item.quantity * item.unit_price;
                const itemTax = (itemSubtotal * item.tax) / 100;
                const itemTotal = itemSubtotal + itemTax;
                subtotal += itemSubtotal;
                tax_amount += itemTax;
                return { ...item, total: itemTotal };
            });
            const total_amount = subtotal + tax_amount;
            const { error: invoiceError } = await supabase
                .from('invoices')
                .update({
                    client_id: invoiceData.client_id,
                    date: invoiceData.date,
                    due_date: invoiceData.due_date,
                    notes: invoiceData.notes || null,
                    subtotal, tax_amount, total_amount,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);
            if (invoiceError) throw invoiceError;
            const { error: deleteItemsError } = await supabase
                .from('invoice_items')
                .delete()
                .eq('invoice_id', id);
            if (deleteItemsError) throw deleteItemsError;
            const itemsToInsert = itemsWithTotals.map((item) => ({ invoice_id: id, ...item }));
            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsToInsert);
            if (itemsError) throw itemsError;
            await fetchInvoices();
            toast.success('Factura actualizada', { description: 'Los cambios se guardaron correctamente' });
            return { error: null };
        } catch (err: any) {
            console.error('Error al actualizar factura:', err);
            toast.error('Error al actualizar factura', { description: err.message });
            return { error: err };
        }
    };

    const deleteInvoice = async (id: string) => {
        try {
            const { error } = await supabase
                .from('invoices')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
            toast.success('Factura eliminada', { description: 'La factura ha sido eliminada correctamente' });
            return { error: null };
        } catch (err: any) {
            console.error('Error al eliminar factura:', err);
            toast.error('Error al eliminar factura', { description: err.message });
            return { error: err };
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    return { invoices, loading, error, fetchInvoices, createInvoice, updateInvoice, updateInvoiceStatus, deleteInvoice, generateInvoiceNumber };
}
