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

export async function sendChatMessage(messages: ChatMessage[], storeContext: any): Promise<string> {
    try {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: { action: 'chat_client', payload: { messages, storeContext } },
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        return data.reply;
    } catch (error: any) {
        console.error("AI Error:", error);
        // No exponemos el error técnico al usuario final
        return 'Lo siento, tuve un problema al conectar con la IA. Por favor intenta de nuevo en unos segundos. Si persiste, contáctanos por 📱 WhatsApp.';
    }
}

export async function chatForInvoice(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
            body: { action: 'chat_invoice', payload: { userMessage, conversationHistory } },
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);

        return data.reply;
    } catch (error: any) {
        console.error("AI Error:", error);
        return 'Hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.';
    }
}

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
    } catch (error: any) {
        console.error("FacturaBot Parse Error:", error);
        return {
            client_id: null,
            client_name: null,
            items: [],
            notes: "",
            confidence: 'low',
            message: `Lo siento, hubo un error técnico procesando la factura: ${error.message || String(error)}. Por favor revisa la consola o inténtalo de nuevo.`
        };
    }
}
