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
      Actúa como un experto redactor de contenidos y SEO especializado en muebles artesanales, carpintería fina y decoración de interiores para la marca "M&D Hijos del Rey" (Sampués, Sucre, Colombia).
      Escribe un artículo de blog completo, elegante y cautivador basado en el siguiente tema: "${topic}".
      Tono del artículo: ${tone}.
      Palabras clave a incluir de forma natural: ${keywords}.

      El artículo debe seguir estrictamente este formato JSON:
      {
        "title": "Título atractivo y optimizado para SEO",
        "slug": "slug-optimizado-en-minusculas-con-guiones",
        "excerpt": "Un resumen corto, persuasivo y sin asteriscos de máximo 160 caracteres para la meta-descripción",
        "content": "Contenido completo en formato Markdown bien estructurado:
          - No incluyas un H1 ni repitas el título al inicio (la página ya lo muestra en la cabecera). Comienza directamente con una introducción atractiva de 2 párrafos.
          - Al menos 3 secciones temáticas con subtítulos H2 (usa ## Nombre de la Sección).
          - Incluye listas con viñetas (*) con tips prácticos, combinaciones de colores, dimensiones o ventajas de materiales.
          - Resalta conceptos importantes con negrita (**texto**).
          - Asegúrate de separar cada párrafo con dos saltos de línea (\\n\\n) para que la lectura sea fluida.
          - Conclusión reflexiva y un llamado a la acción (CTA) invitando al lector a explorar el catálogo de M&D Hijos del Rey o solicitar su diseño personalizado a medida desde Sampués con envíos a toda Colombia."
      }
      
      IMPORTANTE: Devuelve ÚNICAMENTE el objeto JSON válido, sin bloques de código markdown (como \`\`\`json).
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