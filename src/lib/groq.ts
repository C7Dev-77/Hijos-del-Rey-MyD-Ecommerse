import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// groq.ts — Servicio del Chatbot IA "Rey"
//
// ✅ SEGURO: La API key de Groq vive en una Supabase Edge Function (servidor).
//           El frontend NUNCA toca la clave directamente.
//
// Flujo:
//   AIChatBot.tsx → sendChatMessage() → Supabase Edge Function "groq-chat"
//                                               ↓
//                                       api.groq.com (con la clave segura)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface StoreContext {
    address?: string;
    whatsapp?: string;
    schedule?: string;
    email?: string;
    phone?: string;
    products?: { name: string; price: number; category: string; slug: string }[];
}

/**
 * Envía mensajes al chatbot IA a través de la Supabase Edge Function segura.
 * Si la función no está desplegada aún, cae en un fallback local.
 */
export async function sendChatMessage(
    messages: ChatMessage[],
    storeContext?: StoreContext
): Promise<string> {
    try {
        // ── Llamada a la Edge Function de Supabase ────────────────────────
        const { data, error } = await supabase.functions.invoke('groq-chat', {
            body: {
                messages: messages.slice(-20), // solo últimos 20 mensajes
                storeContext,
            },
        });

        if (error) {
            console.error('[groq.ts] Edge function error:', error);
            // Si la función no existe aún, intentamos el fallback directo
            if (error.message?.includes('not found') || error.message?.includes('404')) {
                return await sendChatMessageDirect(messages, storeContext);
            }
            throw new Error(error.message || 'Error en el servicio de IA');
        }

        if (!data?.reply) {
            throw new Error('Respuesta vacía del servidor');
        }

        return data.reply as string;

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);

        // Mensajes de error amigables al usuario
        if (message.includes('429')) return 'Estoy recibiendo muchas preguntas ahora mismo. ¡Inténtalo en unos segundos! 🙏';
        if (message.includes('401')) return 'El servicio de IA no está disponible en este momento. Puedes contactarnos directamente por WhatsApp.';
        if (message.includes('timeout') || message.includes('fetch')) return 'La conexión tardó demasiado. Verifica tu conexión a internet e inténtalo de nuevo.';

        console.error('[groq.ts] Error:', message);
        return 'Tuve un problema técnico. Por favor, contáctanos directamente por WhatsApp para una respuesta inmediata. 😊';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK: llamada directa a Groq (solo para desarrollo local antes de
// desplegar la Edge Function). En producción esto NO debería ejecutarse.
//
// ⚠️ ADVERTENCIA: Esto expone VITE_GROQ_API_KEY en el bundle del cliente.
//    Despliega la Edge Function cuanto antes para eliminar este fallback.
// ─────────────────────────────────────────────────────────────────────────────
async function sendChatMessageDirect(
    messages: ChatMessage[],
    storeContext?: StoreContext
): Promise<string> {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
        return 'El servicio de IA no está configurado. Por favor, contáctanos por WhatsApp.';
    }

    // Advertencia solo en desarrollo
    if (import.meta.env.DEV) {
        console.warn(
            '⚠️ [groq.ts] Usando API Key directa (fallback de desarrollo).\n' +
            'Despliega la Edge Function "groq-chat" para eliminar esta vulnerabilidad:\n' +
            'npx supabase functions deploy groq-chat'
        );
    }

    const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una prestigiosa tienda artesanal de muebles en Sampués, Sucre, Colombia.
Tu objetivo es ayudar a los usuarios a encontrar el mueble perfecto y facilitarles el enlace directo para verlo o comprarlo.

INFORMACIÓN DE CONTACTO:
- WhatsApp: ${storeContext?.whatsapp || '+57 304 629 7119'}
- Horario: ${storeContext?.schedule || 'Lunes a Sábado 8am - 6pm'}
- Email: ${storeContext?.email || 'info@mydhijosdelrey.com'}

PRODUCTOS DISPONIBLES EN CATÁLOGO:
${storeContext?.products && storeContext.products.length > 0
            ? storeContext.products.slice(0, 30).map(p =>
                `• ${p.name} (Categoría: ${p.category}) — $${p.price?.toLocaleString('es-CO')} COP [Enlace: /producto/${p.slug}]`
            ).join('\n')
            : 'Consulta nuestro catálogo completo en /catalogo'}

REGLAS CRÍTICAS DE RESPUESTA:
1. NUNCA digas "no tengo links directos" o "no puedo darte enlaces". SIEMPRE tienes los enlaces en la lista de PRODUCTOS DISPONIBLES.
2. Formato de Enlace OBLIGATORIO: Usa estrictamente [Nombre del Producto](/producto/slug). Ejemplo: [Cama Majestic](/producto/cama-majestic).
3. Si el usuario pregunta por una categoría (ej. "camas"), busca productos que coincidan y dáselos como enlaces.
4. Si no encuentras un producto específico, ofrece el enlace al catálogo general: [Ver Catálogo Completo](/catalogo).
5. Mantén un tono profesional, experto en maderas (Roble, Cedro, Teca) y muy cálido (estilo costeño elegante).
6. Sé conciso: máximo 2 o 3 párrafos y usa listas con emojis para que sea fácil de leer.

EJEMPLO DE RESPUESTA CORRECTA:
Usuario: "quiere ver una cama"
Tú:
"¡Claro que sí! En M&D Hijos del Rey tenemos opciones preciosas para tu descanso. Aquí te comparto algunas de nuestras favoritas:

🛏️ **Camas Destacadas:**
• [Cama Majestic Gold](/producto/cama-majestic-gold) — Diseño imponente y artesanal.
• [Cama Heritage](/producto/cama-heritage) — Elegancia clásica en madera de roble.

¿Te gustaría conocer más detalles sobre alguna de estas o buscas una medida en particular?"`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-20)],
                temperature: 0.7,
                max_tokens: 800,
            }),
        });

        clearTimeout(timeout);

        if (!response.ok) {
            if (response.status === 429) throw new Error('429');
            if (response.status === 401) throw new Error('401');
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';

    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}
