// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isRetryable =
        lastError.message.includes("overloaded") ||
        lastError.message.includes("503") ||
        lastError.message.includes("UNAVAILABLE") ||
        lastError.message.includes("quota") ||
        lastError.message.includes("rate");

      if (!isRetryable || attempt === retries) break;

      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`[generate-blog-post] Intento ${attempt}/${retries} falló: ${lastError.message}. Reintentando en ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Error desconocido");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
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
        JSON.stringify({ error: "Cuerpo de la solicitud inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const topic = (body.topic as string | undefined)?.trim();
    const tone = (body.tone as string | undefined) ?? "profesional";
    const keywords = (body.keywords as string | undefined) ?? "";

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "El campo 'topic' es obligatorio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
    });

    const prompt = `
Actúa como un experto redactor de contenidos y SEO especializado en muebles artesanales, carpintería fina y decoración de interiores para la marca "M&D Hijos del Rey" (Sampués, Sucre, Colombia).
Escribe un artículo de blog completo, elegante y cautivador basado en el siguiente tema: "${topic}".
Tono del artículo: ${tone}.
Palabras clave a incluir de forma natural: ${keywords}.

El artículo debe seguir estrictamente este formato JSON:
{
  "title": "Título atractivo y optimizado para SEO",
  "slug": "slug-optimizado-en-minusculas-con-guiones",
  "excerpt": "Un resumen corto, persuasivo y sin asteriscos de máximo 160 caracteres para la meta-descripción",
  "content": "Contenido completo en formato Markdown bien estructurado. NO incluyas un H1 ni repitas el título al inicio. Comienza directamente con una introducción atractiva de 2 párrafos separados por doble salto de línea. Luego incluye al menos 3 secciones con subtítulos H2 (## Nombre de sección). Incluye listas con viñetas (* ) con tips o ventajas. Resalta con negrita (**texto**) los conceptos importantes. Termina con una conclusión y un CTA invitando a explorar el catálogo de M&D Hijos del Rey o solicitar diseño a medida con envíos a toda Colombia."
}

IMPORTANTE: Devuelve ÚNICAMENTE el objeto JSON válido. Sin bloques de código markdown. Sin texto antes o después del JSON.
`;

    const blogData = await withRetry(async () => {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Extraer JSON robusto: buscar desde { hasta }
      const firstBrace = text.indexOf("{");
      const lastBrace = text.lastIndexOf("}");
      let cleaned = text;
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = text.substring(firstBrace, lastBrace + 1);
      } else {
        cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      }

      return JSON.parse(cleaned);
    });

    if (!blogData.title || !blogData.content) {
      return new Response(
        JSON.stringify({ error: "La IA devolvió datos incompletos. Por favor intenta de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify(blogData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[generate-blog-post] Error final:", msg);

    let userError = "Error al generar el artículo. Intenta de nuevo en unos segundos.";
    if (msg.includes("JSON") || msg.includes("parse")) {
      userError = "La IA devolvió un formato inesperado. Intenta con un tema más específico.";
    } else if (msg.includes("quota") || msg.includes("rate") || msg.includes("overloaded")) {
      userError = "La IA está ocupada en este momento. Espera 30 segundos y vuelve a intentarlo.";
    }

    return new Response(
      JSON.stringify({ error: userError }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});