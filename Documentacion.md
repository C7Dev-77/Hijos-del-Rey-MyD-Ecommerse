# 📖 Documentación General del Proyecto — Hijos del Rey M&D (E-commerce)

> **Plataforma de Comercio Electrónico Premium para Muebles Artesanales y Ebanistería a Medida**  
> **Desarrollador / Autor:** C7Dev — *Ingeniero de Sistemas*  
> **Repositorio:** [Hijos-del-Rey-MyD-Ecommerse](https://github.com/C7Dev-77/Hijos-del-Rey-MyD-Ecommerse)  
> **Última actualización:** Octubre 2026  

---

## 📌 1. Resumen Ejecutivo y Arquitectura del Sistema

**Hijos del Rey - M&D** es una plataforma de e-commerce de alto rendimiento diseñada específicamente para el sector de carpintería fina, ebanistería y muebles hechos a mano en Colombia (con foco local en Sampués y Sincelejo).

El proyecto combina una interfaz moderna y estética (*Glassmorphism*, paleta dorada y carbón, micro-animaciones fluidas con Framer Motion) con una suite de **Inteligencia Artificial con Google Gemini**, persistencia en tiempo real mediante **Supabase**, y una arquitectura escalable lista para producción en **Vercel**.

### Stack Tecnológico:
- **Frontend:** React 18, TypeScript, Vite.
- **Estilos y UI:** Tailwind CSS, Shadcn UI, Radix Primitives, Lucide Icons, Framer Motion.
- **Gestión de Estado:** Zustand (con persistencia híbrida en Supabase y LocalStorage).
- **Backend as a Service:** Supabase (Auth, PostgreSQL, Row Level Security, Realtime, Storage).
- **Edge Functions (Deno / Supabase):** 
  - `chat-ai`: Asistente virtual seguro.
  - `generate-blog-post`: Creación automática de contenidos para SEO.
  - `send-order-email`: Notificaciones transaccionales vía Resend.
- **Inteligencia Artificial:** Google Gemini (modelos `gemini-2.5-flash` y `gemini-2.5-pro`).
- **Pagos y Facturación:** Wompi Sandbox / Integración con pasarelas, generación de facturas imprimibles y pedidos vía WhatsApp estructurados.

---

## 🚀 2. Registro Cronológico de Cambios y Hitos (Desde la Creación)

---

### 🟢 Fase 1: Creación del Proyecto, Fundación y Primera Versión (Marzo 2026)

#### 1. Initial Commit — Estructura Base del E-commerce
- **Fecha:** 04 de Marzo de 2026 | **Commit:** `082e7cc`
- **Descripción:** Creación del proyecto base con Vite, React y TypeScript. Se implementó la estructura de carpetas, configuración de Tailwind CSS, Shadcn UI y Zustand. Se crearon las páginas iniciales: Inicio (`HomePage`), Catálogo (`CatalogoPage`), Producto (`ProductoPage`), Cotizador (`CotizarPage`), Carrito (`CartDrawer`), Checkout (`CheckoutPage`), Nosotros (`NosotrosPage`), Contacto (`ContactoPage`), Blog (`BlogPage`), Favoritos (`FavoritosPage`), Autenticación (`LoginPage`, `RegistroPage`, `ProfilePage`) y el Panel de Administración central (`AdminPage`).

#### 2. Code Splitting, Chatbot, Seguridad y Pre-producción
- **Fecha:** 06 de Marzo de 2026 | **Commit:** `22c61f2`
- **Descripción:** Optimización masiva del bundle inicial: se redujo el tamaño de 1.46MB a ~804KB (~45% de reducción) mediante `React.lazy` y `Suspense` para todas las páginas y división manual de chunks en Vite (react, framer-motion, radix, recharts, supabase). Se mejoró el Chatbot con persistencia de sesión en `localStorage`, limitador de tasa de mensajes (rate limiting), cierre con tecla ESC y sanitización básica.

#### 3. Optimizaciones Avanzadas de SEO para Posicionamiento
- **Fecha:** 06 de Marzo de 2026 | **Commit:** `a557785`
- **Descripción:** Implementación de datos estructurados JSON-LD con Schema.org para `LocalBusiness` y `Product`. Se añadieron metaetiquetas dinámicas, etiquetas canónicas y OpenGraph para redes sociales, además de la configuración de `sitemap.xml` y `robots.txt`.

#### 4. Mejoras Críticas de Producción y Seguridad de IA
- **Fecha:** 06 de Marzo de 2026 | **Commit:** `1e12153`
- **Descripción:** Se añadió edición de perfil y cambio de contraseña con medidor interactivo de fortaleza en `ProfilePage`. Se migró la llamada de API de IA hacia Supabase Edge Functions (`groq-chat`), protegiendo las credenciales privadas. Se implementó la Edge Function `send-order-email` para enviar correos automáticos de confirmación con Resend.

#### 5. Corrección de Pasarela Wompi
- **Fecha:** 06 de Marzo de 2026 | **Commit:** `e335c7d`
- **Descripción:** Corrección de credenciales de prueba (Sandbox) de Wompi y validación mejorada de formularios en el proceso de pago.

#### 6. Cinco Mejoras Clave de Negocio
- **Fecha:** 06 de Marzo de 2026 | **Commit:** `4eb0a57`
- **Descripción:** Implementación de botón de contacto directo por WhatsApp, páginas de lectura de blog individual (`/blog/:id`), suscripción en tiempo real a notificaciones vía Supabase Realtime, módulo de reseñas verificadas de clientes y barra de búsqueda global interactiva con atajo de teclado (`Cmd+K` / `Ctrl+K`).

#### 7. Generador Automático de Sitemap y Metadatos Dinámicos
- **Fecha:** 06 de Marzo de 2026 | **Commit:** `6263292`
- **Descripción:** Automatización del mapa del sitio (`robots.txt` y `sitemap.xml`) para indexar automáticamente todas las categorías y productos nuevos en los motores de búsqueda.

#### 8. Limpieza de Archivos y Preparación de Producción
- **Fecha:** 07 de Marzo de 2026 | **Commit:** `ff94ea4`
- **Descripción:** Eliminación de scripts SQL obsoletos, logs de pruebas y archivos temporales para un entorno de compilación limpio.

---

### 🟡 Fase 2: Despliegue en Vercel, Core Web Vitals y Enfoque Local (Marzo 2026)

#### 9. Despliegue en Vercel y Configuración SPA
- **Fecha:** 09 de Marzo de 2026 | **Commits:** `0d54d0c`, `0015adf`, `d5ffa90`
- **Descripción:** Configuración de `vercel.json` con reescritura de rutas (`rewrites: [{ "source": "/(.*)", "destination": "/" }]`) para resolver errores 404 al recargar páginas en React Router. Publicación del `README.md` profesional del proyecto con créditos de autoría.

#### 10. Chatbot con Enlaces Directos al Catálogo
- **Fecha:** 09 de Marzo de 2026 | **Commit:** `fe2d827`
- **Descripción:** El chatbot de atención ahora inyecta contexto de los productos reales de la tienda y ofrece enlaces cliqueables directos a los productos consultados por el cliente.

#### 11. Ajustes Legales, UI Flotante y Verificación de Google
- **Fecha:** 09 de Marzo de 2026 | **Commits:** `bc9929d`, `ec32ceb`, `d9e785b`
- **Descripción:** Adición de páginas de Términos y Condiciones y Política de Privacidad. Solución al traslape de botones flotantes (botón de WhatsApp y Chatbot). Incorporación del archivo de verificación de Google Search Console.

#### 12. Auditoría Lighthouse, Core Web Vitals y Rendimiento
- **Fecha:** 09 de Marzo de 2026 | **Commits:** `3827c26`, `d382c3e`, `cf3242e`
- **Descripción:** Optimización profunda de métricas de Google Lighthouse: contraste de colores, atributos `aria-label`, carga diferida de imágenes (`loading="lazy"`), encabezados de caché `Cache-Control` en Vercel, y optimización de LCP (Largest Contentful Paint) y CLS (Cumulative Layout Shift).

#### 13. SEO Local (Sampués / Sincelejo) y Branding de Marca
- **Fecha:** 10 al 27 de Marzo de 2026 | **Commits:** `8d3c593`, `5422469`, `18851f8`
- **Descripción:** Optimización de palabras clave para ebanistería artesanal de Sampués y Sincelejo (Sucre). Actualización integral del favicon en múltiples resoluciones e identidad gráfica de "Hijos del Rey M&D".

#### 14. Modelo de "Fabricación a Pedido" y Políticas Dinámicas
- **Fecha:** 13 al 28 de Marzo de 2026 | **Commits:** `9859a69`, `d4372a5`, `7cca01c`
- **Descripción:** Habilitación de venta sin stock físico para artículos bajo pedido ("Made to Order"). Sidebar colapsable en el panel de administración. Políticas de envío y devoluciones dinámicas gestionables desde la base de datos y mención visible de garantía de 2 años.

---

### 🔵 Fase 3: Dashboard, Facturación Robusta y Persistencia Realtime (Junio - Julio 2026)

#### 15. Automatización de Ventas, Dashboard y Garantías
- **Fecha:** 25 de Junio de 2026 | **Commit:** `5648de8`
- **Descripción:** Cálculo automático de métricas de ventas y productos más vendidos en el panel administrativo. Visualización de ingresos totales y garantía de 2 años en comprobantes.

#### 16. Sistema Consecutivo de Facturación y Solución de Duplicados
- **Fecha:** 25 de Junio de 2026 | **Commits:** `09d629e`, `6038213`, `e8e5c5c`, `19981c1`
- **Descripción:** Sustitución de RPC defectuoso por un generador robusto de numeración secuencial de facturas (ej. `FAC-0001`), contemplando facturas activas y eliminadas para prevenir errores de clave duplicada (`duplicate key violation`).

#### 17. Sincronización Bidireccional de Contenido (Inicio y Nosotros)
- **Fecha:** 25 al 26 de Junio de 2026 | **Commits:** `2123cc4`, `32ff381`, `27de7c4`, `3563ec4`
- **Descripción:** Solución de discrepancias de sincronización en las pestañas de contenido en `AdminPage`. Implementación de lógica de guardado robusta con fallback local y mezcla (*merge*) al consultar Supabase. Limpieza de columnas inexistentes como `sales_count`.

#### 18. Google OAuth y Rediseño de Facturas para Impresión
- **Fecha:** 06 de Julio de 2026 | **Commits:** `137ab60`, `6a60b78`
- **Descripción:** Integración completa de inicio de sesión con Google OAuth. Autocompletado de datos del cliente en el checkout para usuarios con sesión activa. Rediseño del membrete y cabecera de las facturas impresas para alineación de logotipo y eliminación de espacios muertos.

#### 19. Gestión de Equipo, Pestaña de Perfil Admin y Keep-Alive de Supabase
- **Fecha:** 08 de Julio de 2026 | **Commits:** `b523fbd`, `b9d3b59`, `8ae4486`, `717dcf4`, `c7f5f76`
- **Descripción:** Subida directa de imágenes para miembros del equipo en la página Nosotros (evitando URLs externas). Pestaña en el admin para editar credenciales. Componente `AdminRedirect` para redirigir a los administradores al panel tras login con Google. GitHub Action programada para enviar pings regulares a la base de datos de Supabase y evitar el congelamiento por inactividad.

#### 20. Migración Completa de Caché hacia Tablas Supabase y Realtime
- **Fecha:** 10 al 19 de Julio de 2026 | **Commits:** `02fcd87`, `4fffe70`, `7571334`, `9c5b79c`, `46b1bb8`, `50c5b0e`, `12dbe37`, `0f34cd7`, `ec5fa9d`
- **Descripción:** Desacoplamiento de la persistencia de Zustand de `localStorage` hacia la tabla `app_settings` en Supabase. Actualizaciones en vivo mediante Supabase Realtime para que los cambios hechos por el administrador en Inicio o Nosotros se reflejen al instante en todos los navegadores de clientes conectados. Configuración de permisos RLS (`SELECT` público).

#### 21. Refactorización Integral y Modularización de la Administración
- **Fecha:** 27 de Julio de 2026 | **Commit:** `d4a9de3`
- **Descripción:** División del archivo monolítico `AdminPage.tsx` en submódulos y pestañas desacopladas. Centralización de tipos TypeScript, integración del framework de pruebas unitarias Vitest y depuración de código muerto.

---

### 🟣 Fase 4: Inteligencia Artificial Avanzada con Google Gemini (Septiembre 2026)

#### 22. Migración a Google Gemini AI y Prevención de XSS
- **Fecha:** 15 de Septiembre de 2026 | **Commit:** `9d45427`
- **Descripción:** Reemplazo de proveedores previos por la API de Google Gemini mediante la Edge Function `chat-ai`. Filtro estricto y sanitización de respuestas para prevenir vulnerabilidades de Cross-Site Scripting (XSS). Persistencia de cotizaciones personalizadas en la nube.

#### 23. Optimización de Latencia y Respuestas del Chatbot
- **Fecha:** 16 de Septiembre de 2026 | **Commits:** `b9ecbfb`, `c8f5bd9`, `fbef13f`
- **Descripción:** Refinamiento de los prompts del sistema para respuestas más directas y ágiles, reducción del payload de envío y adición de logs detallados para depuración de peticiones de IA.

#### 24. Reorganización Visual del Dashboard de Administración
- **Fecha:** 16 de Septiembre de 2026 | **Commit:** `787389f`
- **Descripción:** Reestructuración de la barra lateral del administrador en categorías semánticas (Ventas, Catálogo, Contenido, Sistema) para una navegación más limpia y productiva.

#### 25. Creación de "FacturaBot": Asistente de Facturación con IA
- **Fecha:** 16 de Septiembre de 2026 | **Commits:** `24a826e`, `8346b66`, `6efe0ca`, `68c70df`, `a468bfa`, `b4f5056`, `882989e`, `ee3a6a7`, `4a8d15e`
- **Descripción:** Desarrollo de un asistente capaz de interpretar solicitudes en lenguaje natural (ej. *"Generar factura para Carlos Gómez por una cama king size de roble con 15% de descuento"*). 
  - Creación automática de clientes y productos si no existen en la base de datos.
  - Corrección de colisiones de bloqueos concurrentes en Supabase (`AbortError: Lock broken`).
  - Ajuste de modelos Gemini estables (`gemini-2.5-flash` / `gemini-3.6-flash`).

#### 26. Generador Automático de Artículos de Blog con IA y Markdown
- **Fecha:** 16 de Septiembre de 2026 | **Commits:** `d12ad0f`, `32f64eb`, `fa8378e`, `d47a00a`, `2f85fe2`, `5445341`, `3299694`
- **Descripción:** Módulo `BlogGenerator` en el panel administrativo. Genera publicaciones completas sobre carpintería, cuidado de la madera y diseño de interiores optimizadas para SEO.
  - Almacenamiento seguro en la tabla `blog_posts`.
  - Parseo dinámico de Markdown a HTML utilizando la librería `marked`.
  - Activación y personalización de `@tailwindcss/typography` (`prose`) para renderizar títulos, citas, viñetas y espaciados de alta estética editorial.

#### 27. Nueva Arquitectura del Chatbot Rey e Inventario Flexible
- **Fecha:** 18 de Septiembre de 2026 | **Commits:** `7b81c10`, `7ea32e2`, `1170c90`
- **Descripción:** Actualización del modelo Gemini a `gemini-2.5-flash` con llamada directa y optimizada. Lógica avanzada de stock que distingue si el producto está en bodega listo para despacho o si requiere tiempo de fabricación en taller.

---

### 🟠 Fase 5: Experiencia "Made to Order" y Perfeccionamiento Técnico (Octubre 2026)

#### 28. Optimización del Flujo de Fabricación a Pedido (Made to Order)
- **Fecha:** 01 de Octubre de 2026 | **Commit:** `d81d2ce`
- **Descripción:** Actualización mayor centrada en la experiencia de compra de muebles personalizados:
  - **Selector de Modalidad de Pago en Checkout:** Permite al cliente escoger entre:
    1. *Anticipo del 40%:* Para dar inicio a la fabricación del mueble en taller, pagando el 60% restante contra entrega.
    2. *Pago Total del 100%:* Despacho directo o pago anticipado completo.
  - **Desglose Financiero en Resumen:** Cálculos dinámicos en pantalla mostrando claramente: Subtotal, Costo de Envío, Total General, Anticipo a Pagar Hoy y Saldo Pendiente.
  - **Notificación Inteligente por WhatsApp:** Formato de mensaje con estructura profesional y desglose financiero exacto enviado directamente al WhatsApp del negocio.
  - **Jerarquía Visual de Badges:** Eliminación de saturación de etiquetas en las tarjetas de producto, priorizando estados únicos y tag automático de "Nuevo".
  - **Mejoras en Páginas de Producto y Cotizar:** Optimización en la carga y subida de imágenes, gestión de errores y UI del asistente.

#### 29. Corrección Profesional de Manejadores onClick en Chatbots
- **Fecha:** 02 de Octubre de 2026 | **Commit:** `4c37850`
- **Descripción:** Resolución de error de tipos en TypeScript (`ts(2322)`) en `AIChatBot.tsx` y `CotizarPage.tsx`. Las funciones `handleSend` y `handleAiSend` recibían inadvertidamente el objeto `MouseEvent` del botón al invocarse directamente con `onClick={handleSend}`, cuando esperaban un parámetro de texto `overrideText?: string`. Se corrigió envolviéndolas en funciones flecha seguras `() => handleSend()`.

---

## 🏗️ 3. Resumen Estructurado por Módulos de la Aplicación

| Módulo | Componentes Clave | Qué se Hizo / Funcionalidad |
| :--- | :--- | :--- |
| **🤖 Inteligencia Artificial** | `src/components/chat/AIChatBot.tsx`<br>`src/components/admin/AIInvoiceAssistant.tsx`<br>`src/components/admin/BlogGenerator.tsx`<br>`supabase/functions/chat-ai` | Chatbot asistente "Rey", generador de facturas en lenguaje natural "FacturaBot", redactor automático de artículos de blog con Gemini, mitigación XSS y rate limiting. |
| **🛍️ Catálogo y Producto** | `src/pages/CatalogoPage.tsx`<br>`src/pages/ProductoPage.tsx`<br>`src/components/products/ProductCard.tsx` | Filtros por madera, tipo y precio, badges inteligentes, selector de stock o fabricación a pedido, galería de imágenes con zoom, reseñas de clientes. |
| **💳 Checkout y Pedidos** | `src/pages/CheckoutPage.tsx`<br>`src/store/cartStore.ts`<br>`src/components/cart/CartDrawer.tsx` | Selección de Anticipo 40% vs Pago Completo 100%, cálculo de saldo contra entrega, integración con Wompi, autocompletado con Google OAuth y mensaje estructurado a WhatsApp. |
| **📐 Cotizador a Medida** | `src/pages/CotizarPage.tsx` | Formulario interactivo para proyectos de carpintería a medida, cálculo estimado de precios por tipo de madera/dimensiones, subida de planos/fotos e integración con asistente IA. |
| **📊 Panel de Administración** | `src/pages/AdminPage.tsx`<br>`src/components/admin/*`<br>`src/store/adminStore.ts` | Gestión modularizada de productos, inventario, pedidos, clientes, facturas secuenciales (`FAC-XXXX`), métricas de ingresos, gestión de equipo y editor en vivo de páginas Inicio/Nosotros. |
| **🌐 CMS y Contenido en Vivo** | `src/pages/HomePage.tsx`<br>`src/pages/NosotrosPage.tsx`<br>`src/pages/BlogPage.tsx`<br>`src/pages/BlogPostPage.tsx` | Contenido dinámico conectado a la tabla `app_settings` y `blog_posts` en Supabase con sincronización Realtime para cambios sin necesidad de redesplegar la web. |
| **⚡ SEO y Rendimiento** | `index.html`<br>`public/sitemap.xml`<br>`public/robots.txt`<br>`vercel.json` | JSON-LD para negocios locales de ebanistería en Sampués/Sincelejo, meta tags dinámicos, lazy loading, Core Web Vitals optimizados y reglas de reescritura en Vercel. |
| **🔒 Seguridad y DevOps** | `.github/workflows/*`<br>`src/components/layout/ProtectedRoute.tsx` | Row Level Security (RLS) en Supabase, protección de API keys en Edge Functions, GitHub Action de keep-alive para la BD y tests con Vitest. |

---

## 🎯 4. Conclusión y Estado Actual del Proyecto

El proyecto **Hijos del Rey - M&D** ha evolucionado desde un prototipo básico hasta convertirse en una **solución integral de comercio electrónico de grado de producción**, adaptada fielmente a los requerimientos de la industria maderera artesanal:
1. **Comercialmente viable:** Permite compras con anticipo del 40%, adaptándose a la realidad de fabricación de muebles sobre pedido.
2. **Impulsada por IA:** Asistencia a clientes 24/7 y herramientas de automatización administrativa para el dueño de la tienda.
3. **Mantenible y Robusta:** Código tipado con TypeScript, arquitectura modular desacoplada y despliegue continuo en Vercel y Supabase.
