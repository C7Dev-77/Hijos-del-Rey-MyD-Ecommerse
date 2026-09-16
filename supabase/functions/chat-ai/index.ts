// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured in Edge Function");
    }

    const { action, payload } = await req.json();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const MODEL_NAME = "gemini-3.6-flash"; // Modelo correcto para esta API key

    // ─── CHAT NORMAL (asistente de facturación conversacional) ──────────────
    if (action === "chat_invoice") {
      const { userMessage, conversationHistory } = payload;
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: `Eres FacturaBot, un asistente experto en facturación electrónica colombiana.
Eres amigable, conciso y conoces la normativa DIAN, IVA, retención en la fuente y régimen simple.
Manejas descuentos ("20% de descuento"), abreviaciones de cantidad ("una docena" = 12, "medio ciento" = 50).
Confirma siempre el total de los productos antes de generar la factura.
Valida mentalmente que el IVA sea correcto según el tipo de producto.
Si te piden crear una factura, guíalos para que indiquen: cliente, productos/servicios y cantidades.`,
        generationConfig: { temperature: 0.7 },
      });

      const history = (conversationHistory || []).slice(-10).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage([{ text: userMessage }]);
      
      return new Response(JSON.stringify({ reply: result.response.text() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── PARSE INVOICE (extracción de datos de factura) ──────────────────────
    if (action === "parse_invoice") {
      const { userMessage, clients, products } = payload;
      
      const clientList = clients.length > 0
        ? clients.map((c: any) => `  - ID:"${c.id}" | Nombre:"${c.name}" | NIT:${c.nit}`).join("\n")
        : "  (Sin clientes registrados)";
      const productList = products.length > 0
        ? products.map((p: any) => `  - ID:"${p.id}" | Código:"${p.code}" | Nombre:"${p.name}" | Precio:${p.price} | IVA:${p.tax}%`).join("\n")
        : "  (Sin productos registrados)";
        
      const systemPrompt = `Eres un asistente de facturación electrónica colombiana. Tu ÚNICA tarea es extraer datos de factura de texto en lenguaje natural y devolver SOLO un JSON válido, sin texto adicional, sin markdown, sin explicaciones.

CLIENTES REGISTRADOS EN EL SISTEMA:
${clientList}

PRODUCTOS DEL CATÁLOGO:
${productList}

INSTRUCCIONES:
1. Identifica el cliente por nombre (coincidencia flexible, ignora tildes/mayúsculas).
2. Identifica productos por nombre o código (coincidencia flexible).
3. Si el cliente NO está en la lista: client_id=null, client_name=nombre extraído del texto.
4. Si el producto NO está en catálogo: product_id=null, unit_price=precio del texto o 0 si no hay precio.
5. IVA colombiano por defecto: 19% para muebles (a menos que el texto especifique diferente o que el precio ya incluya IVA y sea 0%).
6. Procesa descuentos ajustando el unit_price y anotando en "notes".
7. Procesa cantidades en lenguaje natural ("docena"=12, "par"=2, "unidad"=1).
8. RESPONDE ÚNICAMENTE CON EL JSON. NADA MÁS.

FORMATO DE RESPUESTA:
{"client_id":"uuid o null","client_name":"nombre del cliente","items":[{"product_id":"uuid o null","description":"nombre del producto","quantity":1,"unit_price":900000,"tax":0}],"notes":"notas extras","confidence":"high","message":"Resumen breve"}`;

      // IMPORTANTE: NO usar responseMimeType - no soportado en gemini-1.5-flash via npm
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.1 },
      });

      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage([{ text: userMessage }]);
      const text = result.response.text();
      
      // Extracción robusta del JSON
      let cleaned = text.trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      } else {
        cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
      }
      
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        console.error("JSON parse error. Raw response:", text);
        throw new Error("La IA no devolvió un JSON válido. Intenta de nuevo.");
      }
      
      if (!Array.isArray(parsed.items)) parsed.items = [];
      if (!parsed.confidence) parsed.confidence = "medium";
      if (!parsed.message) parsed.message = "Factura lista para revisar.";

      return new Response(JSON.stringify({ parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── CHAT CLIENTE (bot para la tienda pública) ───────────────────────────
    if (action === "chat_client") {
      const { messages, storeContext } = payload;
      
      const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una prestigiosa tienda artesanal de muebles en Sampués, Sucre, Colombia.
Tu objetivo es ayudar a los usuarios a encontrar el mueble perfecto, responder sus dudas y facilitarles el proceso de compra.

INFORMACIÓN DE CONTACTO Y ENLACES:
- WhatsApp: ${storeContext?.whatsapp || '+57 304 629 7119'}
- Horario: ${storeContext?.schedule || 'Lunes a Sábado 8am - 6pm'}
- Email: ${storeContext?.email || 'info@mydhijosdelrey.com'}
- Dirección: ${storeContext?.address || 'Sampués, Sucre, Colombia'}
- Nosotros: [Conoce nuestra historia](/nosotros)
- Cotizaciones: [Cotiza tu mueble a medida](/cotizar)

FAQ (PREGUNTAS FRECUENTES):
- Garantías: Todos nuestros muebles tienen garantía estructural de 1 a 5 años dependiendo de la madera.
- Tipos de madera: Trabajamos principalmente Roble (resistente, elegante), Cedro (aroma natural, liviano), Pino (económico) y MDF Premium para acabados lacados.
- Tiempos de entrega: Muebles de catálogo (si hay inventario) 3-5 días. Muebles a medida: 15 a 30 días hábiles.
- Envíos: Hacemos envíos nacionales. El costo varía según el destino.

PRODUCTOS DISPONIBLES EN CATÁLOGO:
${storeContext?.products && storeContext.products.length > 0
        ? storeContext.products.slice(0, 30).map((p: any) =>
            `• ${p.name} (Categoría: ${p.category}) — $${p.price?.toLocaleString('es-CO')} COP [Enlace: /producto/${p.slug}]`
        ).join('\n')
        : 'Consulta nuestro catálogo completo en [Catálogo](/catalogo)'}

REGLAS CRÍTICAS DE RESPUESTA:
1. RESPUESTAS SÚPER CORTAS Y DIRECTAS: Tus respuestas deben ser extremadamente concisas y al grano. NUNCA escribas párrafos largos. Usa viñetas.
2. EJEMPLO DE TONO: Si te preguntan qué muebles tienen, responde exactamente así: "¡Hola! 👋 Fabricamos muebles de excelente calidad. Esto es lo principal que manejamos:\n• Salas y Comedores\n• Camas y Alcobas\n• Clósets y Escritorios\n\nPuedes ver fotos y precios de todo en nuestro [Catálogo Virtual](/catalogo). ¿Buscas algo en específico para ayudarte a encontrarlo?"
3. PREGUNTAS DE PRODUCTOS: Si preguntan por un producto específico (ej. "camas", "salas"), busca coincidencias en el catálogo y proporciona los enlaces exactos en el formato [Nombre](/producto/slug). Si no hay exactos, ofrece el catálogo general: [Ver Catálogo](/catalogo).
4. INTENCIÓN DE COMPRA A MEDIDA: Si el cliente quiere un mueble personalizado, con sus propias medidas o diferente al catálogo, invítalo a cotizar con este enlace: [Cotiza tu mueble a medida](/cotizar).
5. CAPTURA DE NOMBRE: Si el cliente te saluda, pregúntale su nombre de forma MUY corta y directa.
6. ESTILO VISUAL: Usa emojis estratégicos, saltos de línea y viñetas (•) para que la lectura sea lo más limpia y ágil posible.`;

      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.7 },
      });

      const history = (messages || []).slice(0, -1).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const lastMessage = messages[messages.length - 1].content;
      const result = await chat.sendMessage([{ text: lastMessage }]);
      
      return new Response(JSON.stringify({ reply: result.response.text() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
