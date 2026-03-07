/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// Supabase Edge Function — send-order-email
// Se activa automáticamente mediante un Database Webhook de Supabase
// cuando se inserta o actualiza una fila en la tabla 'orders'.
//
// Setup:
// 1. Despliega la función: supabase functions deploy send-order-email
// 2. En Supabase Dashboard → Database → Webhooks → Create Webhook
//    - Tabla: orders
//    - Eventos: INSERT, UPDATE
//    - URL: https://<tu-proyecto>.supabase.co/functions/v1/send-order-email
//    - Headers: { "Authorization": "Bearer <anon-key>" }
// 3. Agrega RESEND_API_KEY en Supabase → Settings → Edge Functions → Secrets
//    Obtén tu clave gratis en https://resend.com (100 emails/día gratis)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Traducciones de estado ────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente de confirmación',
  processing: 'En preparación',
  shipped: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

// ── Generador de emails HTML ──────────────────────────────────────────
function buildCustomerEmail(order: Record<string, unknown>, isNew: boolean): string {
  const status = order.status as string || 'pending';
  const orderId = (order.id as string || '').slice(0, 8).toUpperCase();
  const total = (order.total as number || 0).toLocaleString('es-CO');
  const statusText = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || '#5C3D2E';

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isNew ? 'Confirmación de Pedido' : 'Actualización de Pedido'} — M&D Hijos del Rey</title>
</head>
<body style="font-family: 'Georgia', serif; background:#f5f0eb; margin:0; padding:20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #5C3D2E 0%, #8B5E3C 100%); padding:40px 32px; text-align:center;">
      <h1 style="color:#F5E6D3; font-size:28px; margin:0; letter-spacing:1px;">M&D Hijos del Rey</h1>
      <p style="color:#D4A57A; margin:8px 0 0; font-size:14px;">Muebles Artesanales Colombianos</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h2 style="color:#2D1B0E; font-size:22px; margin:0 0 8px;">
        ${isNew ? '¡Pedido Recibido! 🎉' : 'Actualización de tu Pedido'}
      </h2>
      <p style="color:#6B5744; line-height:1.6; margin:0 0 24px;">
        ${isNew
      ? 'Gracias por tu compra. Hemos registrado tu pedido y lo estamos procesando con cuidado.'
      : `El estado de tu pedido ha sido actualizado.`
    }
      </p>

      <!-- Order Info Box -->
      <div style="background:#F9F4EF; border-radius:12px; padding:20px; margin-bottom:24px; border-left:4px solid ${statusColor};">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <p style="color:#9B7B5C; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin:0 0 4px;">Número de Pedido</p>
            <p style="color:#2D1B0E; font-size:20px; font-weight:bold; margin:0; font-family:monospace;">#${orderId}</p>
          </div>
          <div style="text-align:right;">
            <p style="color:#9B7B5C; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin:0 0 4px;">Estado</p>
            <span style="background:${statusColor}20; color:${statusColor}; font-size:13px; font-weight:bold; padding:4px 12px; border-radius:20px;">${statusText}</span>
          </div>
        </div>
        <hr style="border:none; border-top:1px solid #E8D5C0; margin:16px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <p style="color:#9B7B5C; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin:0;">Total</p>
          <p style="color:#2D1B0E; font-size:22px; font-weight:bold; margin:0;">$${total} COP</p>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center; margin:28px 0;">
        <a href="https://mydhijosdelrey.com/perfil"
           style="display:inline-block; background:linear-gradient(135deg, #5C3D2E, #8B5E3C); color:#F5E6D3; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:bold;">
          Ver Mi Pedido →
        </a>
      </div>

      <!-- Contact -->
      <div style="background:#F9F4EF; border-radius:12px; padding:18px; text-align:center;">
        <p style="color:#6B5744; font-size:13px; margin:0 0 8px;">¿Tienes alguna pregunta?</p>
        <a href="https://wa.me/573046297119" style="color:#25D366; font-weight:bold; text-decoration:none; font-size:14px;">
          💬 Escríbenos por WhatsApp
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F0E8DF; padding:20px 32px; text-align:center;">
      <p style="color:#9B7B5C; font-size:12px; margin:0;">
        M&D Hijos del Rey · Sampués, Sucre, Colombia<br>
        <a href="https://mydhijosdelrey.com" style="color:#8B5E3C;">mydhijosdelrey.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildAdminEmail(order: Record<string, unknown>, isNew: boolean): string {
  const status = order.status as string || 'pending';
  const orderId = (order.id as string || '').slice(0, 8).toUpperCase();
  const total = (order.total as number || 0).toLocaleString('es-CO');
  const method = order.payment_method as string || 'No especificado';
  const address = order.shipping_address as string || 'No especificado';

  return `
<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#f5f5f5;padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
    <h2 style="color:#5C3D2E;margin:0 0 16px;">${isNew ? '🛍️ Nuevo Pedido' : '🔄 Pedido Actualizado'} — #${orderId}</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#666;width:40%;">Estado:</td><td style="padding:8px 0;font-weight:bold;">${STATUS_LABELS[status] || status}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Total:</td><td style="padding:8px 0;font-weight:bold;color:#5C3D2E;">$${total} COP</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Método de pago:</td><td style="padding:8px 0;">${method}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Dirección:</td><td style="padding:8px 0;">${address}</td></tr>
    </table>
    <div style="margin-top:20px;text-align:center;">
      <a href="https://mydhijosdelrey.com/admin" style="display:inline-block;background:#5C3D2E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Ir al Panel Admin →</a>
    </div>
  </div>
</body></html>`;
}

// ── Servidor principal ────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const order = payload.record as Record<string, unknown>;
    const isNew = payload.type === 'INSERT';

    if (!order) {
      return new Response(JSON.stringify({ error: 'No order data' }), { status: 400, headers: corsHeaders });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.warn('RESEND_API_KEY no configurada — emails deshabilitados');
      return new Response(JSON.stringify({ message: 'Email omitido: RESEND_API_KEY no configurada' }), { status: 200 });
    }

    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'info@mydhijosdelrey.com';
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@mydhijosdelrey.com';
    const customerEmail = order.customer_email as string;

    const sendEmail = async (to: string, subject: string, html: string) => {
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: `M&D Hijos del Rey <${FROM_EMAIL}>`, to, subject, html }),
      });
      if (!res.ok) console.error('Resend error:', await res.text());
      return res.ok;
    };

    const orderId = (order.id as string || '').slice(0, 8).toUpperCase();
    const promises = [];

    // Email al admin siempre
    promises.push(sendEmail(
      ADMIN_EMAIL,
      `${isNew ? '🛍️ Nuevo Pedido' : '🔄 Pedido Actualizado'} #${orderId}`,
      buildAdminEmail(order, isNew)
    ));

    // Email al cliente si tiene correo
    if (customerEmail) {
      promises.push(sendEmail(
        customerEmail,
        isNew ? `✅ Pedido confirmado #${orderId} — M&D Hijos del Rey` : `📦 Actualización de tu pedido #${orderId}`,
        buildCustomerEmail(order, isNew)
      ));
    }

    await Promise.all(promises);

    return new Response(
      JSON.stringify({ success: true, message: `${promises.length} email(s) enviado(s)` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error en send-order-email:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
