/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// Supabase Edge Function — groq-chat
// Actúa como proxy seguro para la API de Groq.
// La API Key NUNCA sale al frontend.
// Deploy: supabase functions deploy groq-chat

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
    // Manejar preflight de CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { messages, storeContext } = await req.json();

        // Obtener la API key del entorno del servidor (NUNCA expuesta al cliente)
        const groqApiKey = Deno.env.get('GROQ_API_KEY');
        if (!groqApiKey) {
            return new Response(
                JSON.stringify({ error: 'Groq API key no configurada en el servidor' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Construir el system prompt con el contexto de la tienda
        const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una tienda artesanal colombiana de muebles de alta calidad en Sampués, Sucre.

INFORMACIÓN DE LA TIENDA:
- Dirección: ${storeContext?.address || 'Barrio 12 de Octubre, Sampués, Sucre'}
- WhatsApp: ${storeContext?.whatsapp || '+57 304 629 7119'}
- Horario: ${storeContext?.schedule || 'Lunes a Sábado 8am - 6pm'}
- Email: ${storeContext?.email || 'info@mydhijosdelrey.com'}

PRODUCTOS DISPONIBLES:
${storeContext?.products?.slice(0, 20).map((p) =>
            `• ${p.name} — $${p.price?.toLocaleString('es-CO')} COP (Categoría: ${p.category}, Slug: ${p.slug})`
        ).join('\n') || 'Salas, comedores, alcobas y poltronas artesanales'}

REGLAS DE FORMATO (OBLIGATORIAS — siempre aplícalas):
1. Usa listas con viñetas (•) para enumerar características, productos o pasos. Nunca pongas todo en un solo párrafo.
2. Usa emojis al inicio de cada sección o punto clave para hacer el texto visual y amigable.
3. Si la respuesta tiene más de un tema, separa con saltos de línea y mini-encabezados en **negrita**.
4. Sé conciso: máximo 120 palabras por respuesta. Prefiere calidad sobre cantidad.
5. Nunca termines con frases genéricas como "para más información contáctanos..." a menos que el usuario haya mostrado intención real de compra o cotización.
6. Menciona el WhatsApp SOLO cuando el usuario pregunta cómo comprar, pedir cotización, o quiere contactar directamente. No lo menciones en respuestas informativas generales.
7. IMPORTANTE: Cuando un cliente pregunte por un tipo de producto o categoría, DEBES sugerirle siempre entre 1 y 3 opciones del catálogo con su link para comprar directamente usando el formato de Markdown: [Nombre del Producto](/producto/slug). Extrae el 'Slug' desde PRODUCTOS DISPONIBLES.
8. Si preguntan algo fuera del tema de muebles o la tienda, responde amablemente que solo puedes ayudar con M&D Hijos del Rey.
9. Responde SIEMPRE en español colombiano, cálido y profesional.

EJEMPLOS DE FORMATO CORRECTO:
Pregunta: "¿qué maderas tienen?"
Respuesta:
"🪵 **Maderas disponibles:**
• Roble — resistente y elegante
• Cedro — aroma natural, liviano
• Pino — económico y versátil

Todas nuestras maderas son seleccionadas por maestros artesanos con más de 30 años de experiencia. ¿Tienes alguna preferencia?"

Pregunta: "recomiéndame un sofá"
Respuesta:
"🛋️ **Sofás recomendados:**
• [Sofá Arabia](/producto/sofa-arabia) — $3.500.000 COP
• [Sofá Belgrado](/producto/sofa-belgrado) — $3.500.000 COP

¿Te gustaría saber más sobre alguno de estos y ver fotos detalladas?"

Pregunta: "¿hacen envíos?"
Respuesta:
"🚚 **Envíos a todo Colombia**
• Trabajamos con transportadoras certificadas
• Tiempo estimado: 5 a 15 días hábiles según la ciudad
• Los muebles van embalados con protección especial

¿A qué ciudad necesitas el envío? Así te damos el costo exacto."`;


        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.slice(-20), // solo los últimos 20 mensajes
                ],
                temperature: 0.7,
                max_tokens: 800,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Groq API error:', response.status, errText);

            const errorMessages = {
                401: 'API key inválida. Contacta al administrador.',
                429: 'Demasiadas consultas. Intenta en unos segundos.',
            };

            return new Response(
                JSON.stringify({ error: errorMessages[response.status] || 'Error del servicio de IA. Intenta de nuevo.' }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'No pude generar una respuesta. Inténtalo de nuevo.';

        return new Response(
            JSON.stringify({ reply }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        console.error('Edge function error:', err);
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
