import { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';

/**
 * Hook global que sincroniza los meta tags del <head> con los datos
 * del admin (guardados en Supabase vía app_settings).
 * 
 * Aplica:
 *  - <title>
 *  - meta description
 *  - meta og:title, og:description, og:image (Open Graph para redes sociales)
 *  - meta twitter:card
 *  - link canonical (si hay dominio configurado)
 */
export function useSEO() {
    const { storeSettings } = useAdminStore();

    useEffect(() => {
        const { metaTitle, metaDescription, logoUrl, storeName } = storeSettings;

        // ── Title ────────────────────────────────────────────────────────
        if (metaTitle) {
            document.title = metaTitle;
        }

        // ── Helper para crear/actualizar meta tags ───────────────────────
        const setMeta = (selector: string, attr: string, value: string) => {
            if (!value) return;
            let el = document.querySelector<HTMLMetaElement>(selector);
            if (!el) {
                el = document.createElement('meta');
                const [attrName, attrValue] = attr.split('=');
                el.setAttribute(attrName.replace(/[[\]]/g, ''), attrValue.replace(/"/g, ''));
                document.head.appendChild(el);
            }
            el.setAttribute('content', value);
        };

        // ── Meta description ─────────────────────────────────────────────
        setMeta('meta[name="description"]', '[name]="description"', metaDescription);

        // ── Open Graph ───────────────────────────────────────────────────
        setMeta('meta[property="og:title"]', '[property]="og:title"', metaTitle);
        setMeta('meta[property="og:description"]', '[property]="og:description"', metaDescription);
        setMeta('meta[property="og:site_name"]', '[property]="og:site_name"', storeName);
        if (logoUrl) {
            const logoAbsolute = logoUrl.startsWith('http') ? logoUrl : `${window.location.origin}${logoUrl}`;
            setMeta('meta[property="og:image"]', '[property]="og:image"', logoAbsolute);
        }

        // ── Twitter Card ─────────────────────────────────────────────────
        setMeta('meta[name="twitter:card"]', '[name]="twitter:card"', 'summary_large_image');
        setMeta('meta[name="twitter:title"]', '[name]="twitter:title"', metaTitle);
        setMeta('meta[name="twitter:description"]', '[name]="twitter:description"', metaDescription);

    }, [storeSettings]);
}
