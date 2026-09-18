// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL_NAME = "gemini-2.5-flash"; // Modelo estable y rápido
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1200; // espera base entre reintentos

// Función de pausa
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wrapper con reintentos y backoff exponencial
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  label = "AI request",
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isRetryable =
        lastError.message.includes("overloaded") ||
        lastError.message.includes("503") ||
        lastError.message.includes("500") ||
        lastError.message.includes("UNAVAILABLE") ||
        lastError.message.includes("quota") ||
        lastError.message.includes("rate");

      if (!isRetryable || attempt === retries) break;

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // backoff: 1.2s, 2.4s, 4.8s
      console.warn(`[${label}] Intento ${attempt}/${retries} falló: ${lastError.message}. Reintentando en ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Error desconocido en la API de IA");
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY no configurada en el servidor" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Cuerpo de la solicitud inválido (no es JSON)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { action, payload } = body as { action: string; payload: Record<string, unknown> };
    if (!action || !payload) {
      return new Response(
        JSON.stringify({ error: "Faltan 'action' o 'payload' en la solicitud" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // ─── CHAT CLIENTE (bot para la tienda pública) ────────────────────────────
    if (action === "chat_client") {
      const { messages, storeContext } = payload as {
        messages: { role: string; content: string }[];
        storeContext: Record<string, unknown>;
      };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "messages es requerido y no puede estar vacío" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const ctx = storeContext ?? {};
      const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una prestigiosa tienda artesanal de muebles en Sampués, Sucre, Colombia.
Tu objetivo es ayudar a los usuarios a encontrar el mueble perfecto, responder sus dudas y facilitarles el proceso de compra.

INFORMACIÓN DE CONTACTO:
- WhatsApp: ${ctx.whatsapp ?? "+57 304 629 7119"}
- Horario: ${ctx.schedule ?? "Lunes a Sábado 8am - 6pm"}
- Email: ${ctx.email ?? "info@mydhijosdelrey.com"}
- Dirección: ${ctx.address ?? "Sampués, Sucre, Colombia"}
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
        .map((p) => `• ${p.name} (${p.category}) — $${p.price?.toLocaleString("es-CO")} COP [Ver](/producto/${p.slug})`)
        .join("\n")
    : "Consulta nuestro [Catálogo](/catalogo)."
}

REGLAS:
1. Respuestas MUY cortas y directas. Usa viñetas (•). NUNCA párrafos largos.
2. Para muebles específicos, enlaza al producto: [Nombre](/producto/slug).
3. Para muebles a medida: [Cotiza aquí](/cotizar).
4. Si te saludan, pregunta el nombre de forma muy breve.
5. Usa emojis estratégicos. Sé cálido pero conciso.
6. Si el servicio no está disponible temporalmente, pide que contacten por WhatsApp: [WhatsApp](https://wa.me/${String(ctx.whatsapp ?? "573046297119").replace(/\D/g, "")}).`;

      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      });

      // Separar historial del último mensaje
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
      const lastMessage = messages[messages.length - 1].content;

      const reply = await withRetry(async () => {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage([{ text: lastMessage }]);
        return result.response.text();
      }, MAX_RETRIES, "chat_client");

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── CHAT FACTURACIÓN ─────────────────────────────────────────────────────
    if (action === "chat_invoice") {
      const { userMessage, conversationHistory } = payload as {
        userMessage: string;
        conversationHistory: { role: string; content: string }[];
      };

      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: `Eres FacturaBot, un asistente experto en facturación electrónica colombiana.
Eres amigable, conciso y conoces la normativa DIAN, IVA, retención en la fuente y régimen simple.
Manejas descuentos ("20% de descuento"), abreviaciones de cantidad ("una docena" = 12, "medio ciento" = 50).
Confirma siempre el total de los productos antes de generar la factura.
Si te piden crear una factura, guíalos para que indiquen: cliente, productos/servicios y cantidades.`,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      });

      const history = ((conversationHistory as { role: string; content: string }[]) ?? [])
        .slice(-10)
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

      const reply = await withRetry(async () => {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage([{ text: userMessage }]);
        return result.response.text();
      }, MAX_RETRIES, "chat_invoice");

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── PARSE INVOICE ────────────────────────────────────────────────────────
    if (action === "parse_invoice") {
      const { userMessage, clients, products } = payload as {
        userMessage: string;
        clients: { id: string; name: string; nit: string }[];
        products: { id: string; code: string; name: string; price: number; tax: number }[];
      };

      const clientList =
        clients.length > 0
          ? clients.map((c) => `  - ID:"${c.id}" | Nombre:"${c.name}" | NIT:${c.nit}`).join("\n")
          : "  (Sin clientes registrados)";
      const productList =
        products.length > 0
          ? products
              .map((p) => `  - ID:"${p.id}" | Código:"${p.code}" | Nombre:"${p.name}" | Precio:${p.price} | IVA:${p.tax}%`)
              .join("\n")
          : "  (Sin productos registrados)";

      const systemPrompt = `Eres un asistente de facturación electrónica colombiana. Tu ÚNICA tarea es extraer datos de factura de texto en lenguaje natural y devolver SOLO un JSON válido, sin texto adicional, sin markdown, sin explicaciones.

CLIENTES REGISTRADOS:
${clientList}

PRODUCTOS DEL CATÁLOGO:
${productList}

INSTRUCCIONES:
1. Identifica cliente por nombre (coincidencia flexible).
2. Identifica productos por nombre o código.
3. Si el cliente NO está: client_id=null, client_name=nombre extraído.
4. Si el producto NO está: product_id=null, unit_price=precio del texto o 0.
5. IVA colombiano por defecto: 19%.
6. Procesa descuentos ajustando unit_price y anotando en "notes".
7. Cantidades en lenguaje natural: "docena"=12, "par"=2.
8. RESPONDE ÚNICAMENTE CON EL JSON. NADA MÁS.

FORMATO:
{"client_id":"uuid o null","client_name":"nombre","items":[{"product_id":"uuid o null","description":"nombre","quantity":1,"unit_price":900000,"tax":0}],"notes":"notas","confidence":"high","message":"Resumen breve"}`;

      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      });

      const parsed = await withRetry(async () => {
        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage([{ text: userMessage }]);
        const text = result.response.text();

        let cleaned = text.trim();
        const firstBrace = cleaned.indexOf("{");
        const lastBrace = cleaned.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        } else {
          cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
        }

        return JSON.parse(cleaned);
      }, MAX_RETRIES, "parse_invoice");

      if (!Array.isArray(parsed.items)) parsed.items = [];
      if (!parsed.confidence) parsed.confidence = "medium";
      if (!parsed.message) parsed.message = "Factura lista para revisar.";

      return new Response(JSON.stringify({ parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Acción no reconocida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[chat-ai] Error final:", msg);

    // Diferenciar errores para mensajes más claros
    let userMessage = "Servicio de IA temporalmente no disponible. Intenta de nuevo en unos segundos.";
    if (msg.includes("JSON") || msg.includes("parse")) {
      userMessage = "La IA devolvió una respuesta inesperada. Por favor intenta de nuevo.";
    } else if (msg.includes("quota") || msg.includes("rate")) {
      userMessage = "Límite de solicitudes alcanzado. Espera un momento y vuelve a intentarlo.";
    } else if (msg.includes("API_KEY") || msg.includes("key")) {
      userMessage = "Error de configuración del servidor. Contacta al administrador.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
