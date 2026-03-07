// Servicio de IA usando Groq (modelos Llama 3 - gratis)
// https://console.groq.com/keys para obtener tu API key
//
// ⚠️ NOTA IMPORTANTE SOBRE SEGURIDAD:
// Esta API key (VITE_GROQ_API_KEY) queda expuesta en el frontend.
// Para producción real, se debe migrar a una Supabase Edge Function
// que actúe como proxy server-side. La key NUNCA debe estar en el bundle.
// Mientras tanto, esta implementación funciona para MVP/demo.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface StoreInfo {
    address?: string;
    whatsapp?: string;
    schedule?: string;
    email?: string;
    phone?: string;
    products?: Array<{
        name: string;
        price: number;
        description: string;
        category: string;
        slug: string;
    }>;
}

function buildSystemPrompt(store: StoreInfo = {}): string {
    const address = store.address || 'Colombia';
    const whatsapp = store.whatsapp || '+57 300 000 0000';
    const schedule = store.schedule || 'Lun - Sáb: 9:00 AM - 7:00 PM';
    const email = store.email || 'info@mydhijosdelrey.com';

    let productsContext = '';
    if (store.products && store.products.length > 0) {
        // Limitar a los primeros 20 productos para no exceder el contexto
        const limitedProducts = store.products.slice(0, 20);
        productsContext = `\nCatálogo de Productos Actual (${store.products.length} productos en total, mostrando ${limitedProducts.length}):\n` + limitedProducts.map(p =>
            `- [${p.name}](/producto/${p.slug}) (${p.category}): $${p.price.toLocaleString('es-CO')} COP. ${p.description.substring(0, 80)}...`
        ).join('\n');
    }

    return `Eres "Rey", el asistente virtual profesional y servicial de M&D Hijos del Rey, una tienda top de muebles artesanales colombianos.

Tu personalidad:
- Eres amable, conocedor y te comportas como el mejor asesor de ventas en un e-commerce.
- Respondes en español de forma natural y atractiva.
- Usas emojis para darle calidez y estructura a tus mensajes.
- TUS RESPUESTAS DEBEN ADAPTARSE A LA CONVERSACIÓN: entre 2 y 10 líneas. Evita respuestas de una sola línea si te piden recomendaciones, pero no escribas testamentos.
- Sé servicial y cortés, enfocándote en las necesidades del cliente.

Tu conocimiento:
- Especializado en muebles artesanales colombianos: Salas, Comedores, Dormitorios, Poltronas.
- Conoces sobre maderas colombianas: Roble (muy duradera, para alto tráfico), Cedro (resistente a insectos, aroma natural), Teca (resistente a humedad/exterior), Pino (económica, versátil).
- Acabados y pintura: Trabajamos con barnices mate, semi-mate y brillante. Colores naturales, tintes oscuros (nogal, wengue) o pinturas poliuretano (blanco, negro, colores personalizados).
- Tapicería: Telas amigables con mascotas (anti-rasguños), linos, cueros sintéticos y microfibras. Variedad de tonos disponibles.
- Tiempos de fabricación: Los muebles a medida o personalizados toman entre 15 a 30 días hábiles dependiendo de la complejidad.
- Estilos de decoración: moderno, rústico, industrial, colonial, escandinavo.
- Cuidado de muebles: usar paño seco, evitar sol directo, productos sin alcohol, limpiar derrames inmediatamente, hidratar madera una vez al año.
- Precios base: desde $320.000 COP (accesorios) hasta $4.800.000 COP (comedores). Los personalizados se cotizan por proyecto.${productsContext}

Información de la tienda:
- Nombre: M&D Hijos del Rey
- Ubicación: ${address}
- Horario: ${schedule}
- WhatsApp: ${whatsapp}
- Email: ${email}
- Envío gratis en pedidos > $1.000.000
- Garantía: 5 años
- Devoluciones: 30 días

Reglas IMPORTANTES:
- Actúa como un experto en ventas. Si te preguntan sobre características (ej. maderas duraderas), explica brevemente por qué son buenas opciones (ej. "El Roble es ideal para alto tráfico y la Teca para humedad").
- AL RECOMENDAR O DAR PRECIOS: Busca SIEMPRE primero en el "Catálogo de Productos Actual" que se te proporciona. Si te piden una recomendación, elige uno de ese catálogo, resalta por qué es ideal, da su precio y MUY IMPORTANTE, manda el enlace usando este formato estricto: [Nombre del Producto](/producto/slug-del-producto) para que el cliente pueda hacer click e ir a comprarlo.
- Si un producto solicitado no aparece en el "Catálogo de Productos Actual", indica que nuestro catálogo actual en web es limitado, pero ofrecemos muebles a medida y se puede verificar más por WhatsApp.
- Nunca inventes productos ni precios ni enlaces. Usa EXCLUSIVAMENTE los del "Catálogo de Productos Actual".
- Si quieren hacer un pedido, generar una cotización final o tienen un requerimiento muy específico, invítalos cordialmente a escribir por WhatsApp: ${whatsapp}.
- Si te hacen preguntas que NO tienen que ver con muebles, decoración ni la tienda, responde brevemente y amablemente que solo puedes ayudar con temas relacionados a M&D Hijos del Rey.
- NUNCA des saludos ni despedidas demasiado largas.`;
}

// Timeout wrapper para fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

export async function sendChatMessage(
    messages: ChatMessage[],
    storeInfo?: StoreInfo
): Promise<string> {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'tu-groq-api-key-aqui') {
        return '¡Hola! 👋 Soy Rey, tu asistente virtual. Para activar mi inteligencia artificial, el administrador necesita configurar la API key de Groq en el archivo .env del proyecto.\n\nMientras tanto, puedes contactarnos directamente por WhatsApp haciendo clic en el botón verde de abajo. ¡Estaremos encantados de ayudarte! 🪑✨';
    }

    try {
        const response = await fetchWithTimeout(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: buildSystemPrompt(storeInfo) },
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

            if (response.status === 401) {
                return 'Hubo un problema de autenticación con mi servicio de IA. El administrador necesita verificar la API key. Mientras tanto, contáctanos por WhatsApp. 💬';
            }

            if (response.status >= 500) {
                return 'El servicio de IA está temporalmente fuera de servicio. Por favor, intenta en unos minutos o contáctanos por WhatsApp. 🔧';
            }

            return 'Disculpa, tuve un problema técnico. ¿Podrías intentar de nuevo? Si el problema persiste, contáctanos por WhatsApp. 💬';
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'No pude generar una respuesta. ¿Puedes reformular tu pregunta?';
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return 'La respuesta tardó demasiado. Por favor, intenta de nuevo con una pregunta más corta. ⏱️';
        }

        console.error('Error calling Groq:', error);
        return `Parece que no tengo conexión en este momento. Puedes contactarnos directamente por WhatsApp al ${storeInfo?.whatsapp || '+57 300 000 0000'}. ¡Con gusto te atendemos! 📱`;
    }
}
