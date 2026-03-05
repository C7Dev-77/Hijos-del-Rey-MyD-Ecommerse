// Servicio de IA usando Groq (modelos Llama 3 - gratis)
// https://console.groq.com/keys para obtener tu API key

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const SYSTEM_PROMPT = `Eres "Rey", el asistente virtual de M&D Hijos del Rey, una tienda de muebles artesanales colombianos de alta calidad ubicada en Sampués, Colombia.

Tu personalidad:
- Eres amable, profesional y conocedor de muebles y decoración interior
- Respondes en español con un tono cálido y cercano
- Usas emojis moderadamente para hacer la conversación más amigable
- Eres conciso (máximo 2-3 párrafos por respuesta)

Tu conocimiento:
- Especializado en muebles artesanales colombianos: Colección de Salas, Colección de Comedores, Colección de Dormitorio y Colección de poltronas
- Conoces sobre maderas colombianas (roble, cedro, teca, pino), técnicas de carpintería artesanal
- Puedes asesorar sobre estilos de decoración: moderno, rústico, industrial, colonial, escandinavo
- Conoces sobre cuidado y mantenimiento de muebles de madera
- Los precios van desde $320.000 COP (accesorios) hasta $4.800.000 COP (comedores completos)

Información de la tienda:
- Nombre: M&D Hijos del Rey
- Ubicación: Calle 85 #15-30, Bogotá, Colombia
- Horario: Lun - Sáb: 9:00 AM - 7:00 PM
- WhatsApp: +57 300 123 4567
- Envío gratis en pedidos superiores a $1.000.000
- Garantía de 5 años en todos los muebles
- Devoluciones aceptadas dentro de 30 días

Reglas:
- Si te preguntan por productos específicos, recomienda visitar el catálogo en la web
- Si quieren hacer un pedido o cotización personalizada, recomienda contactar por WhatsApp o usar el formulario de cotización
- Nunca inventes productos que no existan; sugiere categorías generales
- Si no sabes algo, sé honesto y sugiere contactar al equipo por WhatsApp
- No proporciones información fuera del contexto de la tienda de muebles`;

export async function sendChatMessage(
    messages: ChatMessage[]
): Promise<string> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'tu-groq-api-key-aqui') {
        return '¡Hola! 👋 Soy Rey, tu asistente virtual. Para activar mi inteligencia artificial, el administrador necesita configurar la API key de Groq en el archivo .env del proyecto.\n\nMientras tanto, puedes contactarnos directamente por WhatsApp haciendo clic en el botón verde de abajo. ¡Estaremos encantados de ayudarte! 🪑✨';
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 512,
                top_p: 0.9,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Groq API error:', response.status, errorData);

            if (response.status === 429) {
                return 'Estoy recibiendo muchas consultas en este momento. Por favor, intenta de nuevo en unos segundos. 🙏';
            }

            return 'Disculpa, tuve un problema técnico. ¿Podrías intentar de nuevo? Si el problema persiste, contáctanos por WhatsApp. 💬';
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'No pude generar una respuesta. ¿Puedes reformular tu pregunta?';
    } catch (error) {
        console.error('Error calling Groq:', error);
        return 'Parece que no tengo conexión en este momento. Puedes contactarnos directamente por WhatsApp al +57 300 123 4567. ¡Con gusto te atendemos! 📱';
    }
}
