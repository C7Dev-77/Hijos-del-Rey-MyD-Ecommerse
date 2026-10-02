import { supabase } from '@/lib/supabase';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    isApiKeyError?: boolean;
}

export interface AIInvoiceItem {
    product_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    tax: number;
}

export interface AIInvoiceResult {
    client_id: string | null;
    client_name: string | null;
    items: AIInvoiceItem[];
    notes: string;
    confidence: 'high' | 'medium' | 'low';
    message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 1 — FAQ LOCALES (responden sin consumir ningún token de la API)
// ─────────────────────────────────────────────────────────────────────────────

interface FaqEntry {
    keywords: string[];     // basta con que alguna aparezca en el mensaje
    response: string;
}

const FAQ_LOCAL: FaqEntry[] = [
    {
        keywords: ['envio', 'envios', 'envían', 'envian', 'entregan', 'despacho', 'mandan', 'colombia', 'ciudad', 'municipio', 'llegan'],
        response: '🚚 **Envíos a todo Colombia.**\n\n• Entregamos en cualquier municipio del país.\n• El costo varía según tu ciudad — te lo informamos al cotizar.\n• Productos del catálogo: 3-5 días hábiles.\n• Muebles a medida: 15-30 días hábiles.\n\n¿A qué ciudad necesitas el envío?',
    },
    {
        keywords: ['garantia', 'garantías', 'garantizan', 'dura', 'duracion', 'años de garantia', 'garantiza'],
        response: '🛡️ **Garantía de 1 a 5 años** según el tipo de madera:\n\n• Roble / Cedro / Nogal: **5 años**\n• Pino: **3 años**\n• MDF Premium: **1-2 años**\n\nCubrimos defectos de fabricación y estructura. ¿Tienes alguna consulta puntual sobre garantías?',
    },
    {
        keywords: ['cuanto tarda', 'cuánto tarda', 'tiempo de entrega', 'días', 'semanas', 'plazo', 'cuando llega', 'cuándo llega', 'demora', 'tarda'],
        response: '⏱️ **Tiempos de entrega:**\n\n• Productos del catálogo: **3-5 días hábiles**\n• Muebles a medida: **15-30 días hábiles** (según complejidad)\n\nTe notificamos en cada etapa del proceso. ¿Necesitas algo para una fecha específica?',
    },
    {
        keywords: ['madera', 'maderas', 'material', 'materiales', 'roble', 'cedro', 'pino', 'nogal', 'mdf', 'tipo de madera'],
        response: '🪵 **Trabajamos con 5 tipos de madera:**\n\n• **Roble** — Resistente y elegante, ideal para uso intensivo\n• **Cedro** — Aroma natural, liviano, muy popular\n• **Nogal** — Premium, oscuro, para ambientes exclusivos\n• **Pino** — Económico y versátil\n• **MDF Premium** — Perfecto para lacados y acabados modernos\n\n¿Te ayudo a elegir el mejor material para tu mueble?',
    },
    {
        keywords: ['precio', 'precios', 'cuanto cuesta', 'cuánto cuesta', 'cuanto vale', 'cuánto vale', 'valor', 'costo', 'costos', 'cuanto cobran'],
        response: '💰 **Nuestros precios varían** según el material, dimensiones y diseño.\n\n• Revisa nuestro [Catálogo](/catalogo) para precios de productos estándar.\n• Para muebles a medida: [Solicita tu cotización gratis](/cotizar) — respuesta en menos de 24h.\n\n¿Qué tipo de mueble te interesa?',
    },
    {
        keywords: ['cotizar', 'cotizacion', 'cotización', 'presupuesto', 'medida', 'personalizado', 'a la medida', 'diseño', 'pedido especial'],
        response: '✏️ **¡Hacemos muebles 100% a tu medida!**\n\n📋 [Completa el formulario de cotización](/cotizar) — son solo 4 pasos:\n1. Tus datos de contacto\n2. Tipo de mueble y medidas\n3. Fotos de referencia (opcional)\n4. ¡Listo! Te respondemos en menos de 24h\n\n¿O prefieres escribirnos directamente por WhatsApp?',
    },
    {
        keywords: ['horario', 'horarios', 'atienden', 'abierto', 'abierta', 'hora', 'cuando atienden', 'cuándo atienden', 'disponible'],
        response: '🕐 **Horario de atención:**\n\n**Lunes a Sábado — 8:00 AM a 6:00 PM**\n\nFuera de horario puedes escribirnos al WhatsApp y te respondemos al día siguiente. 📱',
    },
    {
        keywords: ['donde estan', 'dónde están', 'ubicacion', 'ubicación', 'direccion', 'dirección', 'sampues', 'sampués', 'sucre', 'local', 'tienda fisica', 'visitar'],
        response: '📍 **Estamos ubicados en:**\n\n**Sampués, Sucre, Colombia**\n\nPuedes visitarnos en horario de lunes a sábado, 8am–6pm.\n¿Necesitas las indicaciones exactas? Escríbenos por WhatsApp. 📱',
    },
    {
        keywords: ['whatsapp', 'telefono', 'teléfono', 'numero', 'número', 'contacto', 'llamar', 'comunicar', 'escribir'],
        response: '📱 **Contáctanos directamente:**\n\n• **WhatsApp:** +57 304 629 7119\n• **Email:** info@mydhijosdelrey.com\n• **Horario:** Lunes–Sábado 8am–6pm\n\nO usa el botón de WhatsApp en la esquina de la pantalla. 👇',
    },
    {
        keywords: ['hola', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'buenas', 'hey', 'saludos', 'que tal', 'qué tal'],
        response: '¡Hola! 👋 Soy **Rey**, tu asistente de M&D Hijos del Rey.\n\n¿En qué te puedo ayudar hoy?\n\n• 🛋️ Ver el [catálogo](/catalogo)\n• ✏️ [Cotizar un mueble a medida](/cotizar)\n• ❓ Preguntas sobre materiales, envíos o garantías',
    },
    {
        keywords: ['catalogo', 'catálogo', 'productos', 'muebles disponibles', 'que tienen', 'qué tienen', 'ver muebles', 'sofas', 'sofás', 'sillas', 'camas', 'mesas', 'comedores'],
        response: '🛋️ **Nuestro catálogo incluye:**\n\n• Juegos de sala y sofás\n• Juegos de comedor\n• Camas y dormitorios\n• Poltronas y sillas\n• Consolas y mesas de centro\n\n👉 [Ver catálogo completo](/catalogo)\n\nTambién hacemos cualquier mueble **a tu medida**. ¿Qué necesitas?',
    },
];

/**
 * Normaliza un texto para comparación flexible:
 * minúsculas, sin tildes, sin signos de puntuación, espacios simples.
 */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')   // quita tildes
        .replace(/[^a-z0-9\s]/g, ' ')      // quita signos de puntuación
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Busca si el mensaje del usuario coincide con alguna FAQ local.
 * Retorna la respuesta o null si no hay coincidencia.
 */
function matchLocalFaq(userMessage: string): string | null {
    const normalized = normalize(userMessage);
    for (const entry of FAQ_LOCAL) {
        if (entry.keywords.some(kw => normalized.includes(normalize(kw)))) {
            return entry.response;
        }
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPA 2 — CACHÉ EN MEMORIA con TTL de 5 minutos
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_SIZE = 100;          // máximo entradas para no saturar RAM

interface CacheEntry {
    reply: string;
    expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();

/** Genera la clave de caché: normaliza el último mensaje del usuario */
function getCacheKey(userMessage: string): string {
    return normalize(userMessage).slice(0, 200); // truncar a 200 chars
}

function getCached(key: string): string | null {
    const entry = responseCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        responseCache.delete(key);
        return null;
    }
    return entry.reply;
}

function setCache(key: string, reply: string): void {
    // Si supera el límite, eliminar las entradas más antiguas
    if (responseCache.size >= MAX_CACHE_SIZE) {
        const firstKey = responseCache.keys().next().value;
        if (firstKey !== undefined) responseCache.delete(firstKey);
    }
    responseCache.set(key, { reply, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─────────────────────────────────────────────────────────────────────────────
// ERRORES TIPADOS — permiten diferenciar rate limit vs error de red en la UI
// ─────────────────────────────────────────────────────────────────────────────

/** Se lanza cuando la API devuelve 429 o límite de cuota agotado */
export class AIRateLimitError extends Error {
    readonly type = 'rate_limit' as const;
    /** Segundos sugeridos de espera antes de reintentar */
    readonly retryAfterSeconds: number;
    constructor(retryAfterSeconds = 30) {
        super('Límite de solicitudes alcanzado');
        this.name = 'AIRateLimitError';
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

/** Se lanza para cualquier otro error de red o del servidor */
export class AIServiceError extends Error {
    readonly type = 'service_error' as const;
    constructor(message: string) {
        super(message);
        this.name = 'AIServiceError';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHATBOT PÚBLICO — 3 capas: FAQ local → Caché → API
// ─────────────────────────────────────────────────────────────────────────────
export async function sendChatMessage(
    messages: ChatMessage[],
    storeContext: Record<string, unknown>
): Promise<string> {
    const lastUserMessage = messages[messages.length - 1]?.content ?? '';

    // ── CAPA 1: FAQ local (cero llamadas a la API) ──────────────────────────
    const faqReply = matchLocalFaq(lastUserMessage);
    if (faqReply) {
        console.debug('[AI Cache] FAQ local match — sin llamada a API');
        return faqReply;
    }

    // ── CAPA 2: Caché en memoria ────────────────────────────────────────────
    const cacheKey = getCacheKey(lastUserMessage);
    const cached = getCached(cacheKey);
    if (cached) {
        console.debug('[AI Cache] Hit en caché — sin llamada a API');
        return cached;
    }

    // ── CAPA 3: Llamada a la Edge Function ─────────────────────────────────
    try {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: {
                action: 'chat_client',
                payload: { messages, storeContext },
            },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        const reply = data.reply as string;

        // Guardar en caché para próximas preguntas iguales/similares
        setCache(cacheKey, reply);

        return reply;
    } catch (error: unknown) {
        // Re-lanzar si ya es un error tipado nuestro
        if (error instanceof AIRateLimitError || error instanceof AIServiceError) throw error;

        const msg = error instanceof Error ? error.message : String(error);
        console.error('AI Chat Error:', msg);

        // Lanzar errores tipados para que los callers puedan diferenciar
        if (msg.includes('quota') || msg.includes('rate') || msg.includes('429') || msg.includes('Límite')) {
            throw new AIRateLimitError(30);
        }
        throw new AIServiceError(msg);
    }
}


// ─── CHAT FACTURACIÓN (Supabase Edge, solo para admin) ───────────────────────
export async function chatForInvoice(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: { action: 'chat_invoice', payload: { userMessage, conversationHistory } },
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        return data.reply;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('AI Error:', msg);
        return 'Hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.';
    }
}

// ─── PARSE INVOICE (Supabase Edge, solo para admin) ──────────────────────────
export async function parseInvoiceWithAI(
    userMessage: string,
    clients: { id: string, name: string, nit: string }[],
    products: { id: string, code: string, name: string, price: number, tax: number }[],
    conversationHistory: ChatMessage[] = []
): Promise<AIInvoiceResult> {
    try {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: { action: 'parse_invoice', payload: { userMessage, clients, products, conversationHistory } },
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        return data.parsed as AIInvoiceResult;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('FacturaBot Parse Error:', msg);
        return {
            client_id: null,
            client_name: null,
            items: [],
            notes: '',
            confidence: 'low',
            message: `Lo siento, hubo un error técnico procesando la factura: ${msg}. Por favor revisa la consola o inténtalo de nuevo.`
        };
    }
}
