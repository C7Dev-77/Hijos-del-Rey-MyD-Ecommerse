// ─── Servicio de IA con Groq (Llama 3.3 70B) ─────────────────────────────────
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
    notes?: string | null;
    confidence: "high" | "medium" | "low";
    message: string;
}

export interface GeminiClient {
    id: string;
    name: string;
    nit: string;
}

export interface GeminiProduct {
    id: string;
    name: string;
    code: string;
    price: number;
    tax: number;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const INVOICE_MODEL = "llama-3.3-70b-versatile";
const CHAT_MODEL = "llama-3.1-8b-instant";

function getApiKey(): string {
    const apiKey = (import.meta.env.VITE_GROQ_API_KEY as string)?.trim();
    if (!apiKey) throw new Error("API_KEY_MISSING");
    return apiKey;
}

async function callGroq(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    model: string,
    jsonMode: boolean
): Promise<string> {
    const apiKey = getApiKey();
    const body = {
        model,
        messages,
        temperature: jsonMode ? 0.1 : 0.7,
        max_tokens: 2048,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    };
    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errMsg);
    }
    const data = await response.json();
    return data?.choices?.[0]?.message?.content ?? "";
}

export async function parseInvoiceWithGemini(
    userMessage: string,
    clients: GeminiClient[],
    products: GeminiProduct[],
    conversationHistory: { role: string; content: string }[] = []
): Promise<AIInvoiceResult> {
    const systemPrompt = buildInvoiceSystemPrompt(clients, products);
    const history = conversationHistory.slice(-6).map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
    }));
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage },
    ];
    const raw = await callGroq(messages, INVOICE_MODEL, true);
    try {
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
        const parsed = JSON.parse(cleaned) as AIInvoiceResult;
        if (!Array.isArray(parsed.items)) parsed.items = [];
        if (!parsed.confidence) parsed.confidence = "medium";
        if (!parsed.message) parsed.message = "Factura lista para revisar.";
        return parsed;
    } catch {
        return {
            client_id: null, client_name: null, items: [], confidence: "low",
            message: 'No pude interpretar la solicitud. Prueba: *"Factura para [cliente] con [cantidad] [producto]"*',
        };
    }
}

export async function chatWithGemini(
    userMessage: string,
    conversationHistory: { role: string; content: string }[]
): Promise<string> {
    const history = conversationHistory.slice(-10).map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
    }));
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        {
            role: "system",
            content: `Eres FacturaBot, un asistente experto en facturación electrónica colombiana.
Eres amigable, conciso y conoces la normativa DIAN, IVA, retención en la fuente y régimen simple.
Responde siempre en español, de forma clara y práctica.
Si te piden crear una factura, guíalos para que indiquen: cliente, productos/servicios y cantidades.`,
        },
        ...history,
        { role: "user", content: userMessage },
    ];
    return await callGroq(messages, CHAT_MODEL, false);
}

function buildInvoiceSystemPrompt(clients: GeminiClient[], products: GeminiProduct[]): string {
    const clientList = clients.length > 0
        ? clients.map((c) => `  - ID:"${c.id}" | Nombre:"${c.name}" | NIT:${c.nit}`).join("\n")
        : "  (Sin clientes registrados)";
    const productList = products.length > 0
        ? products.map((p) => `  - ID:"${p.id}" | Código:"${p.code}" | Nombre:"${p.name}" | Precio:${p.price} | IVA:${p.tax}%`).join("\n")
        : "  (Sin productos registrados)";
    return `Eres un asistente de facturación electrónica colombiana. Tu única tarea es extraer datos de factura de texto en lenguaje natural y devolver un JSON estructurado.

CLIENTES REGISTRADOS EN EL SISTEMA:
${clientList}

PRODUCTOS DEL CATÁLOGO:
${productList}

INSTRUCCIONES ESTRICTAS:
1. Identifica el cliente por nombre (coincidencia flexible).
2. Identifica los productos por nombre o código (coincidencia flexible).
3. Si el producto NO está en catálogo: product_id=null, unit_price=0.
4. IVA colombiano por defecto: 19%.
5. Devuelve ÚNICAMENTE el JSON.

FORMATO DE RESPUESTA (JSON estricto):
{
  "client_id": "uuid del cliente o null",
  "client_name": "nombre del cliente encontrado o null",
  "items": [
    { "product_id": "uuid o null", "description": "nombre", "quantity": 1, "unit_price": 0, "tax": 19 }
  ],
  "notes": null,
  "confidence": "high",
  "message": "Resumen breve en español"
}`;
}
