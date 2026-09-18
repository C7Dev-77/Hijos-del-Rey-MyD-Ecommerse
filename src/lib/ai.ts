import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// ─── CHATBOT PÚBLICO (llamada directa a Gemini, sin pasar por Supabase) ────────
// Esto evita el rate limit compartido de la API key del servidor y es más rápido.
export async function sendChatMessage(
    messages: ChatMessage[],
    storeContext: Record<string, unknown>
): Promise<string> {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
        console.error('VITE_GEMINI_API_KEY no configurada');
        return 'Lo siento, el asistente no está configurado correctamente. Contáctanos por 📱 WhatsApp.';
    }

    try {
        const ctx = storeContext ?? {};
        const genAI = new GoogleGenerativeAI(API_KEY);

        const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una prestigiosa tienda artesanal de muebles en Sampués, Sucre, Colombia.
Tu objetivo es ayudar a los usuarios a encontrar el mueble perfecto, responder sus dudas y facilitarles el proceso de compra.

INFORMACIÓN DE CONTACTO:
- WhatsApp: ${ctx.whatsapp ?? '+57 304 629 7119'}
- Horario: ${ctx.schedule ?? 'Lunes a Sábado 8am - 6pm'}
- Email: ${ctx.email ?? 'info@mydhijosdelrey.com'}
- Dirección: ${ctx.address ?? 'Sampués, Sucre, Colombia'}
- Cotizaciones: [Cotiza tu mueble a medida](/cotizar)
- Catálogo: [Ver catálogo completo](/catalogo)

FAQ:
- Garantías: 1 a 5 años según el tipo de madera.
- Maderas: Roble, Cedro, Pino y MDF Premium.
- Tiempos de entrega: 3-5 días (catálogo), 15-30 días hábiles (a medida).
- Envíos: Nacionales a toda Colombia. Costo según destino.

PRODUCTOS DISPONIBLES:
${
    Array.isArray(ctx.products) && (ctx.products as unknown[]).length > 0
        ? (ctx.products as { name: string; category: string; price: number; slug: string }[])
              .slice(0, 25)
              .map((p) => `• ${p.name} (${p.category}) — $${p.price?.toLocaleString('es-CO')} COP [Ver](/producto/${p.slug})`)
              .join('\n')
        : 'Consulta nuestro [Catálogo](/catalogo).'
}

REGLAS:
1. Respuestas MUY cortas y directas. Usa viñetas (•). NUNCA párrafos largos.
2. Para muebles específicos, enlaza al producto: [Nombre](/producto/slug).
3. Para muebles a medida: [Cotiza aquí](/cotizar).
4. Si te saludan, pregunta el nombre de forma muy breve.
5. Usa emojis estratégicos. Sé cálido pero conciso.
6. Si el servicio no está disponible, pide que contacten por WhatsApp.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt,
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
        });

        // Separar historial del último mensaje
        const history = messages.slice(0, -1)
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({
                role: m.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: m.content }],
            }));
        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({ history });
        const result = await chat.sendMessage([{ text: lastMessage }]);
        return result.response.text();
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('AI Chat Error:', msg);

        if (msg.includes('quota') || msg.includes('rate') || msg.includes('429')) {
            return 'El asistente está recibiendo muchas consultas. Por favor espera un momento e inténtalo de nuevo. 🙏';
        }
        return 'Lo siento, tuve un problema al conectar con la IA. Por favor intenta de nuevo en unos segundos. Si persiste, contáctanos por 📱 WhatsApp.';
    }
}

// ─── CHAT FACTURACIÓN (sigue usando Supabase Edge, solo para admin) ───────────
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

// ─── PARSE INVOICE (sigue usando Supabase Edge, solo para admin) ─────────────
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
