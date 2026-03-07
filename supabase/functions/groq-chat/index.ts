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
        const systemPrompt = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una tienda artesanal colombiana de muebles de alta calidad ubicada en Sampués, Sucre.

Tu misión es ayudar a los visitantes a:
- Encontrar el mueble perfecto para su hogar
- Conocer materiales, dimensiones y precios
- Realizar cotizaciones y guiarlos hacia la compra
- Responder dudas sobre envíos, garantías y proceso de fabricación

INFORMACIÓN DE LA TIENDA:
- Dirección: ${storeContext?.address || 'Barrio 12 de Octubre, Sampués, Sucre'}
- WhatsApp: ${storeContext?.whatsapp || '+57 304 629 7119'}
- Horario: ${storeContext?.schedule || 'Lunes a Sábado 8am - 6pm'}
- Email: ${storeContext?.email || 'info@mydhijosdelrey.com'}

PRODUCTOS DISPONIBLES:
${storeContext?.products?.slice(0, 20).map((p) =>
            `• ${p.name} — $${p.price?.toLocaleString('es-CO')} COP (${p.category})`
        ).join('\n') || 'Salas, comedores, alcobas y poltronas artesanales'}

REGLAS:
1. Responde SIEMPRE en español colombiano, cálido y profesional
2. Sé conciso (máximo 3 párrafos por respuesta)
3. Si no sabes algo, invita al usuario a contactar al WhatsApp
4. Puedes sugerir productos usando links: [Nombre del producto](/producto/slug)
5. Si preguntan algo NO relacionado con muebles o la tienda, diles amablemente que solo puedes ayudar con temas de M&D Hijos del Rey
6. Menciona el WhatsApp cuando sea relevante para una venta`;

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
