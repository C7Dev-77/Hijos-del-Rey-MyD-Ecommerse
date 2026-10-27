// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GROQ_MODEL = "openai/gpt-oss-120b";
const GEMINI_MODEL = "gemini-2.5-flash";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!groqKey && !geminiKey) {
      return new Response(
        JSON.stringify({ error: "No hay claves de API configuradas en Supabase Secrets (GROQ_API_KEY o GEMINI_API_KEY)" }),
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

    const systemPrompt = `Actúa como un experto redactor de contenidos y SEO especializado en muebles artesanales, carpintería fina y decoración de interiores para la marca "M&D Hijos del Rey" (Sampués, Sucre, Colombia).
Escribe un artículo de blog completo, elegante y cautivador basado en el tema solicitado.
El artículo debe responder ESTRICTAMENTE en formato JSON con estas claves:
{
  "title": "Título atractivo y optimizado para SEO",
  "slug": "slug-optimizado-en-minusculas-con-guiones",
  "excerpt": "Un resumen corto persuasivo sin asteriscos de máximo 160 caracteres",
  "content": "Contenido completo en formato Markdown bien estructurado. NO incluyas un H1 ni repitas el título al inicio. Comienza directamente con una introducción atractiva de 2 párrafos separados por doble salto de línea. Luego incluye al menos 3 secciones con subtítulos H2 (## Nombre). Incluye listas con viñetas (* ) con tips o ventajas. Resalta con negrita (**texto**). Termina con conclusión y CTA invitando a explorar el catálogo de M&D Hijos del Rey o solicitar diseño a medida con envíos a toda Colombia."
}
Responde únicamente con el JSON válido.`;

    const userMessage = `Tema: "${topic}". Tono: ${tone}. Palabras clave: ${keywords}`;

    let rawText = "";

    // 1. Intentar con Groq
    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 3500,
          }),
          signal: AbortSignal.timeout(20000),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          rawText = groqData?.choices?.[0]?.message?.content ?? "";
          console.info("[generate-blog-post] Éxito con Groq");
        } else {
          console.warn("[generate-blog-post] Groq falló, recurriendo a Gemini...");
        }
      } catch (err) {
        console.warn("[generate-blog-post] Error llamando a Groq:", err);
      }
    }

    // 2. Fallback a Gemini si Groq no respondió
    if (!rawText && geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
      });
      const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
      rawText = result.response.text().trim();
      console.info("[generate-blog-post] Éxito con Gemini");
    }

    if (!rawText) {
      throw new Error("No se pudo generar el artículo con ningún proveedor de IA");
    }

    // Limpiar JSON
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    let cleaned = rawText;
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else {
      cleaned = cleaned.replace(/```json/gi, "").replace(/```/g, "").trim();
    }

    const blogData = JSON.parse(cleaned);

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

    return new Response(
      JSON.stringify({ error: "Error al generar el artículo: " + msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});