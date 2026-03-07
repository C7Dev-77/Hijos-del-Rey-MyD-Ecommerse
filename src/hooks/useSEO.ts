import { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';

// ── DOMINIO PRINCIPAL ────────────────────────────────────────────────
// Cambia esto cuando tengas dominio propio (ej: https://mydhijosdelrey.com)
const SITE_URL = 'https://mydhijosdelrey.com';

/**
 * Hook de SEO por página.
 * Llámalo en cada página con title y description únicos.
 * Si no se pasa nada, usa los valores globales del admin.
 */
export function usePageSEO(options?: {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
    const { storeSettings } = useAdminStore();

    useEffect(() => {
        const title = options?.title
            ? `${options.title} | M&D Hijos del Rey`
            : storeSettings.metaTitle || 'M&D Hijos del Rey | Muebles Artesanales Colombianos';

        const description = options?.description
            || storeSettings.metaDescription
            || 'Descubre muebles artesanales únicos de Colombia. Salas, comedores, alcobas y poltronas hechos a mano. Hijos del Rey, más de 30 años de tradición.';

        const image = options?.image
            || (storeSettings.logoUrl?.startsWith('http')
                ? storeSettings.logoUrl
                : `${SITE_URL}${storeSettings.logoUrl || '/logo.png'}`);

        const url = options?.path ? `${SITE_URL}${options.path}` : SITE_URL;
        const type = options?.type || 'website';

        // ── Title ─────────────────────────────────────────────────────
        document.title = title;

        // ── Helper ────────────────────────────────────────────────────
        const setMeta = (selector: string, attrKey: string, attrVal: string, content: string) => {
            if (!content) return;
            let el = document.querySelector<HTMLMetaElement>(selector);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrKey, attrVal);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // ── Standard Meta ─────────────────────────────────────────────
        setMeta('meta[name="description"]', 'name', 'description', description);

        // ── Open Graph ────────────────────────────────────────────────
        setMeta('meta[property="og:title"]', 'property', 'og:title', title);
        setMeta('meta[property="og:description"]', 'property', 'og:description', description);
        setMeta('meta[property="og:type"]', 'property', 'og:type', type);
        setMeta('meta[property="og:url"]', 'property', 'og:url', url);
        setMeta('meta[property="og:image"]', 'property', 'og:image', image);
        setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', 'M&D Hijos del Rey');
        setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'es_CO');

        // ── Twitter Card ──────────────────────────────────────────────
        setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
        setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
        setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
        setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

        // ── Canonical URL ─────────────────────────────────────────────
        let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);

        // ── JSON-LD Structured Data ───────────────────────────────────
        if (options?.jsonLd) {
            // Eliminar scripts anteriores de JSON-LD generados por esta función
            document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());

            const schemas = Array.isArray(options.jsonLd) ? options.jsonLd : [options.jsonLd];
            schemas.forEach(schema => {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-seo-jsonld', 'true');
                script.textContent = JSON.stringify(schema);
                document.head.appendChild(script);
            });
        }

        // Cleanup JSON-LD when component unmounts
        return () => {
            document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
        };
    }, [options?.title, options?.description, options?.path, options?.image, options?.type, options?.jsonLd, storeSettings]);
}

/**
 * Hook global (se usa UNA vez en App.tsx).
 * Inyecta JSON-LD de la organización/negocio local.
 */
export function useSEO() {
    const { storeSettings, contactInfo } = useAdminStore();

    useEffect(() => {
        const { metaTitle, metaDescription, logoUrl, storeName } = storeSettings;

        if (metaTitle) document.title = metaTitle;

        const setMeta = (selector: string, attrKey: string, attrVal: string, content: string) => {
            if (!content) return;
            let el = document.querySelector<HTMLMetaElement>(selector);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrKey, attrVal);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        setMeta('meta[name="description"]', 'name', 'description', metaDescription);
        setMeta('meta[property="og:title"]', 'property', 'og:title', metaTitle);
        setMeta('meta[property="og:description"]', 'property', 'og:description', metaDescription);
        setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', storeName);
        setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'es_CO');

        if (logoUrl) {
            const logoAbsolute = logoUrl.startsWith('http') ? logoUrl : `${window.location.origin}${logoUrl}`;
            setMeta('meta[property="og:image"]', 'property', 'og:image', logoAbsolute);
        }

        setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
        setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metaTitle);
        setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);

        // ── JSON-LD: Organización / LocalBusiness ─────────────────────
        // Esto es CRÍTICO para SEO local en Google
        const orgJsonLd = {
            '@context': 'https://schema.org',
            '@type': 'FurnitureStore',
            name: 'M&D Hijos del Rey',
            alternateName: ['Hijos del Rey Muebles', 'MYD Hijos del Rey', 'Hijos del Rey Muebles y Diseños'],
            description: 'Tienda de muebles artesanales colombianos. Fabricamos salas, comedores, alcobas y poltronas en madera de alta calidad. Más de 30 años de experiencia.',
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            image: `${SITE_URL}/logo.png`,
            telephone: contactInfo.phone,
            email: contactInfo.email,
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Barrio 12 de Octubre',
                addressLocality: 'Sampués',
                addressRegion: 'Sucre',
                addressCountry: 'CO',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: 9.1836,
                longitude: -75.3872,
            },
            openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '08:00',
                closes: '18:00',
            },
            sameAs: [
                contactInfo.socialLinks?.facebook,
                contactInfo.socialLinks?.instagram,
            ].filter(Boolean),
            priceRange: '$$',
            currenciesAccepted: 'COP',
            paymentAccepted: 'Cash, Credit Card, Bank Transfer, Nequi',
            areaServed: {
                '@type': 'Country',
                name: 'Colombia',
            },
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Catálogo de Muebles Artesanales',
                itemListElement: [
                    { '@type': 'OfferCatalog', name: 'Salas' },
                    { '@type': 'OfferCatalog', name: 'Comedores' },
                    { '@type': 'OfferCatalog', name: 'Alcobas' },
                    { '@type': 'OfferCatalog', name: 'Poltronas' },
                ],
            },
        };

        // Inyectar JSON-LD global
        let globalScript = document.querySelector<HTMLScriptElement>('script[data-seo-global]');
        if (!globalScript) {
            globalScript = document.createElement('script');
            globalScript.type = 'application/ld+json';
            globalScript.setAttribute('data-seo-global', 'true');
            document.head.appendChild(globalScript);
        }
        globalScript.textContent = JSON.stringify(orgJsonLd);

    }, [storeSettings, contactInfo]);
}
