// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Modelos activos verificados en Groq
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
];

// Modelos de respaldo en Google Gemini
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

// ─────────────────────────────────────────────────────────────────────────────
// PROVEEDOR 1: GROQ API (Ultra-rápido, chips LPU, compatible OpenAI)
// ─────────────────────────────────────────────────────────────────────────────
interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroq({
  apiKey,
  messages,
  temperature = 0.7,
  maxTokens = 1024,
  expectJson = false,
}: {
  apiKey: string;
  messages: GroqMessage[];
  temperature?: number;
  maxTokens?: number;
  expectJson?: boolean;
}): Promise<string> {
  let lastErr: Error | null = null;

  for (const model of GROQ_MODELS) {
    try {
      const payload: Record<string, unknown> = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (expectJson) {
        payload.response_format = { type: "json_object" };
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Groq [${model}] error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error(`Groq [${model}] no devolvió contenido`);
      }

      console.info(`[chat-ai] Éxito con Groq (${model})`);
      return content;
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(`[chat-ai] Intento con Groq (${model}) falló: ${lastErr.message}`);
    }
  }

  throw lastErr ?? new Error("Todos los modelos de Groq fallaron");
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVEEDOR 2: GOOGLE GEMINI (Respaldo)
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini({
  apiKey,
  systemInstruction,
  messages,
  temperature = 0.7,
  maxOutputTokens = 1024,
}: {
  apiKey: string;
  systemInstruction: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  let lastErr: Error | null = null;
  const genAI = new GoogleGenerativeAI(apiKey.trim());

  const safe = messages.slice(-10);
  const history = safe.slice(0, -1).map((m) => ({
    role: m.role === "assistant" || m.role === "model" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const lastMessage = safe[safe.length - 1]?.content ?? "";

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage([{ text: lastMessage }]);
      const text = result.response.text();
      console.info(`[chat-ai] Éxito con Gemini (${modelName})`);
      return text;
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(`[chat-ai] Intento con Gemini (${modelName}) falló: ${lastErr.message}`);
    }
  }

  throw lastErr ?? new Error("Todos los modelos de Gemini fallaron");
}

// ─────────────────────────────────────────────────────────────────────────────
// ORQUESTADOR CON FAILOVER (GROQ -> GEMINI)
// ─────────────────────────────────────────────────────────────────────────────
async function generateAIResponse({
  systemPrompt,
  messages,
  temperature = 0.7,
  maxTokens = 1024,
  expectJson = false,
}: {
  systemPrompt: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  expectJson?: boolean;
}): Promise<{ reply: string; provider: string }> {
  const groqKey = Deno.env.get("GROQ_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  let groqError: string | null = null;
  let geminiError: string | null = null;

  // 1. Intentar con Groq
  if (groqKey) {
    try {
      const groqMessages: GroqMessage[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: (m.role === "assistant" || m.role === "model" ? "assistant" : "user") as "user" | "assistant",
          content: m.content,
        })),
      ];

      const reply = await callGroq({
        apiKey: groqKey,
        messages: groqMessages,
        temperature,
        maxTokens,
        expectJson,
      });

      return { reply, provider: "groq" };
    } catch (err: unknown) {
      groqError = err instanceof Error ? err.message : String(err);
      console.warn(`[chat-ai] Groq falló: ${groqError}. Intentando Gemini...`);
    }
  } else {
    groqError = "GROQ_API_KEY no configurada";
  }

  // 2. Fallback a Google Gemini
  if (geminiKey) {
    try {
      const reply = await callGemini({
        apiKey: geminiKey,
        systemInstruction: systemPrompt,
        messages,
        temperature,
        maxOutputTokens: maxTokens,
      });

      return { reply, provider: "gemini" };
    } catch (err: unknown) {
      geminiError = err instanceof Error ? err.message : String(err);
      console.error(`[chat-ai] Falló Gemini: ${geminiError}`);
    }
  } else {
    geminiError = "GEMINI_API_KEY no configurada";
  }

  throw new Error(`Todos los proveedores fallaron. Groq: [${groqError}] | Gemini: [${geminiError}]`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVIDOR EDGE FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Cuerpo de solicitud inválido (debe ser JSON)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, payload } = body as { action: string; payload: Record<string, unknown> };
    if (!action || !payload) {
      return new Response(
        JSON.stringify({ error: "Faltan 'action' o 'payload' en la solicitud" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACCIÓN 1: chat_client (Asistente público "Rey")
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "chat_client") {
      const { messages, storeContext } = payload as {
        messages: { role: string; content: string }[];
        storeContext: Record<string, unknown>;
      };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "messages es requerido y no puede estar vacío" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ctx = storeContext ?? {};
      const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una prestigiosa tienda artesanal de muebles en Sampués, Sucre, Colombia.
Tu objetivo es asesorar con calidez a los clientes, resolver sus preguntas y motivar la compra o cotización.

INFORMACIÓN DE CONTACTO:
- WhatsApp: ${ctx.whatsapp ?? "+57 304 629 7119"}
- Horario: ${ctx.schedule ?? "Lunes a Sábado 8am - 6pm"}
- Email: ${ctx.email ?? "info@mydhijosdelrey.com"}
- Dirección: ${ctx.address ?? "Sampués, Sucre, Colombia"}
- Cotizaciones: [Cotiza tu mueble a medida](/cotizar)
- Catálogo: [Ver catálogo completo](/catalogo)

DATOS CLAVE:
- Garantías: 1 a 5 años según la madera (Roble/Cedro/Nogal 5 años, Pino 3 años, MDF 1-2 años).
- Maderas: Roble, Cedro, Nogal, Pino y MDF Premium.
- Tiempos de entrega: 3-5 días hábiles (catálogo), 15-30 días hábiles (a medida).
- Envíos: A toda Colombia.

PRODUCTOS DISPONIBLES EN TIENDA:
${
  Array.isArray(ctx.products) && (ctx.products as unknown[]).length > 0
    ? (ctx.products as { name: string; category: string; price: number; slug: string }[])
        .slice(0, 15)
        .map((p) => `• ${p.name} (${p.category}) — $${p.price?.toLocaleString("es-CO")} COP [Ver](/producto/${p.slug})`)
        .join("\n")
    : "Revisa nuestro [Catálogo](/catalogo)."
}

NORMAS DE RESPUESTA:
1. Respuestas CORTAS, claras y elegantes. Usa viñetas (•) cuando sea útil.
2. Si mencionas un producto específico, enlaza así: [Nombre](/producto/slug).
3. Para muebles a medida: [Cotiza tu mueble aquí](/cotizar).
4. Sé siempre cortés y profesional pero ágil (máximo 2 a 3 párrafos cortos).
5. Si preguntan por contacto humano directo, ofrece el WhatsApp: +57 304 629 7119.`;

      const { reply, provider } = await generateAIResponse({
        systemPrompt,
        messages,
        temperature: 0.7,
        maxTokens: 512,
        expectJson: false,
      });

      return new Response(JSON.stringify({ reply, provider }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACCIÓN 2: chat_invoice (Asistente de facturación interna FacturaBot)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "chat_invoice") {
      const { userMessage, conversationHistory } = payload as {
        userMessage: string;
        conversationHistory: { role: string; content: string }[];
      };

      const systemPrompt = `Eres FacturaBot, un asistente experto en facturación electrónica colombiana para la tienda M&D Hijos del Rey.
Eres amigable, conciso y conoces la normativa DIAN, IVA (19%), retenciones y régimen tributario.
Manejas descuentos ("20% de descuento"), expresiones colombianas y cantidades en lenguaje natural ("docena"=12, "par"=2).
Si te piden emitir o crear una factura, ayuda al usuario indicándole qué datos faltan (cliente, productos, cantidades y precios) de forma rápida y concisa.`;

      const messages = [
        ...((conversationHistory as { role: string; content: string }[]) ?? []),
        { role: "user", content: userMessage },
      ];

      const { reply, provider } = await generateAIResponse({
        systemPrompt,
        messages,
        temperature: 0.7,
        maxTokens: 1024,
        expectJson: false,
      });

      return new Response(JSON.stringify({ reply, provider }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ACCIÓN 3: parse_invoice (Extracción estructurada JSON de facturas)
    // ─────────────────────────────────────────────────────────────────────────
    if (action === "parse_invoice") {
      const { userMessage, clients, products } = payload as {
        userMessage: string;
        clients: { id: string; name: string; nit: string }[];
        products: { id: string; code: string; name: string; price: number; tax: number }[];
      };

      const clientList =
        clients?.length > 0
          ? clients.map((c) => `  - ID:"${c.id}" | Nombre:"${c.name}" | NIT:${c.nit}`).join("\n")
          : "  (Sin clientes registrados)";
      const productList =
        products?.length > 0
          ? products
              .map((p) => `  - ID:"${p.id}" | Código:"${p.code}" | Nombre:"${p.name}" | Precio:${p.price} | IVA:${p.tax}%`)
              .join("\n")
          : "  (Sin productos registrados)";

      const systemPrompt = `Eres un extractor experto de datos para facturación en Colombia.
Tu ÚNICA misión es extraer la información del pedido y responder OBLIGATORIAMENTE con un objeto JSON válido.
NO agregues explicaciones fuera del JSON.

CLIENTES REGISTRADOS EN BASE DE DATOS:
${clientList}

CATÁLOGO DE PRODUCTOS REGISTRADOS:
${productList}

REGLAS DE EXTRACCIÓN:
1. Identifica el cliente: Si coincide con uno de la lista, asigna su "client_id" y su "client_name". Si no existe, pon "client_id": null y "client_name": "Nombre dicho".
2. Identifica los productos: Si coincide con el catálogo, asigna su "product_id", nombre, cantidad y "unit_price" registrado. Si no tiene precio o es un producto nuevo, "product_id": null y coloca el precio mencionado o 0.
3. El IVA estándar por defecto en Colombia es 19 (tax: 19) a menos que se indique lo contrario.
4. Cantidades: Convierte expresiones naturales ("un par" -> 2, "docena" -> 12).
5. Formato de respuesta JSON estricto:
{
  "client_id": "string o null",
  "client_name": "string o null",
  "items": [
    {
      "product_id": "string o null",
      "description": "nombre del producto",
      "quantity": 1,
      "unit_price": 500000,
      "tax": 19
    }
  ],
  "notes": "observaciones o descuentos",
  "confidence": "high" | "medium" | "low",
  "message": "Breve mensaje de confirmación para el usuario"
}`;

      const { reply: rawText, provider } = await generateAIResponse({
        systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.1,
        maxTokens: 1024,
        expectJson: true,
      });

      let cleaned = rawText.trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      } else {
        cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
      }

      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed.items)) parsed.items = [];
      if (!parsed.confidence) parsed.confidence = "medium";
      if (!parsed.message) parsed.message = "Factura procesada y lista para revisar.";

      return new Response(JSON.stringify({ parsed, provider }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Acción no reconocida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[chat-ai] Error general:", msg);

    return new Response(JSON.stringify({ error: "Error en el servicio de IA", details: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
