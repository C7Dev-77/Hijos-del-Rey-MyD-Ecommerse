// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, tone = 'profesional', keywords = '' } = await req.json()

    if (!topic) {
      return new Response(
        JSON.stringify({ error: 'El tema es obligatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY no configurada en el servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // gemini-3.6-flash: modelo confirmado disponible con la API key actual
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
    })


    const prompt = `
      Actúa como un experto en marketing de contenidos y SEO especializado en muebles artesanales y decoración de interiores.
      Escribe un artículo de blog completo y profesional basado en el siguiente tema: "${topic}".
      Tono del artículo: ${tone}.
      Palabras clave a incluir: ${keywords}.

      El artículo debe seguir estrictamente este formato JSON:
      {
        "title": "Título atractivo y optimizado para SEO",
        "slug": "slug-optimizado-en-minusculas-con-guiones",
        "excerpt": "Un resumen corto y persuasivo de máximo 160 caracteres para meta-descripción",
        "content": "Contenido en formato Markdown. Debe incluir:
          - Un H1 al inicio.
          - Una introducción que capte la atención.
          - Al menos tres secciones con H2 y contenido detallado.
          - Listas con viñetas para mejorar la lectura.
          - Una conclusión.
          - Un CTA (Llamado a la acción) invitando a visitar la tienda de M&D Hijos del Rey para comprar muebles artesanales de calidad."
      }
      
      IMPORTANTE: Devuelve ÚNICAMENTE el objeto JSON, sin bloques de código markdown (como \`\`\`json).
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    
    // Limpiar la respuesta en caso de que la IA incluya marcas de bloque de código
    const cleanJson = text.replace(/```json|```/g, '').trim()
    const blogData = JSON.parse(cleanJson)

    return new Response(
      JSON.stringify(blogData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})