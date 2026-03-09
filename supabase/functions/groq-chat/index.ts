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
        const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una prestigiosa tienda artesanal colombiana de muebles de alta calidad en Sampués, Sucre.
Tu objetivo es guiar a los clientes y facilitarles el acceso directo a los productos que buscan.

INFORMACIÓN DE LA TIENDA:
- Dirección: ${storeContext?.address || 'Barrio 12 de Octubre, Sampués, Sucre'}
- WhatsApp: ${storeContext?.whatsapp || '+57 304 629 7119'}
- Horario: ${storeContext?.schedule || 'Lunes a Sábado 8am - 6pm'}
- Email: ${storeContext?.email || 'info@mydhijosdelrey.com'}

PRODUCTOS DISPONIBLES EN SISTEMA:
${storeContext?.products && storeContext.products.length > 0
                ? storeContext.products.slice(0, 30).map((p) =>
                    `• ${p.name} ($${p.price?.toLocaleString('es-CO')} COP) - Categoría: ${p.category} - Slug: ${p.slug}`
                ).join('\n')
                : 'Salas, comedores, alcobas y poltronas artesanales. Ver más en /catalogo'}

REGLAS DE ORO (SÍGUELAS SIEMPRE):
1. NUNCA digas que no tienes enlaces. SIEMPRE usa los slugs que te proporciono.
2. FORMATO DE ENLACE: Usa estrictamente [Nombre del Producto](/producto/slug). Ejemplo: [Sofá Royal](/producto/sofa-royal).
3. Si el usuario pide ver "camas", busca en la lista de PRODUCTOS las que sean de esa categoría y enlaza 2 o 3.
4. Si no hay stock o no encuentras el producto exacto, envía este enlace: [Explorar nuestro Catálogo](/catalogo).
5. Usa listas con puntos (•) y emojis para que la respuesta sea visualmente atractiva.
6. Mantén un tono cálido, profesional y experto en ebanistería. Se conciso (máx. 120 palabras).
7. Solo menciona el WhatsApp si el cliente quiere comprar, cotizar algo a medida o tiene un problema.

EJEMPLO DE RESPUESTA:
"¡Qué buen gusto tienes! 🪵 Nuestras camas son talladas a mano por maestros artesanos. Aquí tienes algunas opciones disponibles:

🛏️ **Camas Recomendadas:**
• [Cama Majestic Noir](/producto/cama-majestic-noir) — Estilo elegante y robusto.
• [Cama Heritage](/producto/cama-heritage) — Madera de roble seleccionada.

¿Te gustaría ver más fotos o conocer las medidas de alguna en particular?"`;


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
