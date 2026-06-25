import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BillingCompanySettings {
    company_name: string;
    nit: string;
    phone: string;
    address: string;
    city: string;
    email: string;
    logo_url?: string;
    resolution_number?: string;
    resolution_date?: string;
    prefix?: string;
    start_range?: number;
    end_range?: number;
    current_number?: number;
}

export function useBillingSettings() {
    const [settings, setSettings] = useState<BillingCompanySettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) { console.error('Error fetching settings:', error); return; }
            if (data) {
                setSettings({
                    company_name: data.company_name || '',
                    nit: data.nit || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    email: data.email || '',
                    logo_url: data.logo_url,
                    resolution_number: data.resolution_number,
                    resolution_date: data.resolution_date,
                    prefix: data.prefix,
                    start_range: data.start_range,
                    end_range: data.end_range,
                    current_number: data.current_number
                });
            }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const updateSettings = async (newSettings: Partial<BillingCompanySettings>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { error: 'No usuario autenticado' };
            const { error } = await supabase
                .from('profiles')
                .update(newSettings)
                .eq('id', user.id);
            if (error) throw error;
            setSettings((prev) => prev ? { ...prev, ...newSettings } : null);
            toast.success('Configuración actualizada', { description: 'Los cambios se han guardado correctamente.' });
            return { error: null };
        } catch (error: any) {
            console.error('Error updating settings:', error);
            toast.error('Error al actualizar', { description: error.message });
            return { error };
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    return { settings, loading, updateSettings, fetchSettings };
}
