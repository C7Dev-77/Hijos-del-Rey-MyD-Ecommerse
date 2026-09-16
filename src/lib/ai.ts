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
    } catch (error) {
        console.error("AI Error:", error);
        return "Lo siento, tuve un problema conectando con mi cerebro (IA). Por favor, contacta por WhatsApp mientras lo solucionan. 😅";
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
    } catch (error) {
        console.error("AI Error:", error);
        return "Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.";
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
    } catch (error) {
        console.error("FacturaBot Parse Error:", error);
        return {
            client_id: null,
            client_name: null,
            items: [],
            notes: "",
            confidence: 'low',
            message: "Lo siento, no pude interpretar correctamente los datos de la factura. Por favor, sé más específico o genérala manualmente."
        };
    }
}
