# Hijos del Rey - M&D Ecommerce 👑

![Banner](https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920)

¡Bienvenido al repositorio oficial de **Hijos del Rey - M&D**, una plataforma de comercio electrónico moderna, rápida y elegante diseñada para ofrecer una experiencia de usuario excepcional!

Esta aplicación de alto rendimiento está construida con las últimas tecnologías del ecosistema web. Se enfoca en la velocidad de carga, una estética premium (Glassmorphism, animaciones fluidas) y una gestión robusta e inteligente de los datos mediante Inteligencia Artificial de vanguardia.

## 🚀 Características Principales

- **Diseño Premium**: Interfaz moderna con efectos de desenfocado, gradientes suaves y micro-animaciones usando Framer Motion.
- **Asistentes de Inteligencia Artificial (Gemini AI)**: 
  - **"Rey" (Atención al Cliente)**: Chatbot avanzado integrado que guía a los clientes, provee enlaces al catálogo y soluciona dudas basándose en la información real de la tienda.
  - **"FacturaBot" (Administración)**: Un asistente inteligente que procesa requerimientos en lenguaje natural y genera facturas automáticas aplicando descuentos e impuestos, ¡todo en la nube!
- **Catálogo Inteligente**: Búsqueda avanzada y filtros de productos en tiempo real.
- **Cotizaciones Dinámicas**: Sistema de cotizaciones a medida persistido en la nube de forma segura.
- **Panel de Administración Inteligente**: Gestión completa de inventario, pedidos, configuraciones y SEO de la tienda, 100% en vivo.
- **Seguridad Robusta**: Sanitización estricta para prevención de ataques XSS y protección avanzada de API Keys utilizando Edge Functions de Supabase.

## 🛠️ Stack Tecnológico

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Gestor de Estado**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend / Database / Auth**: [Supabase](https://supabase.com/)
- **Inteligencia Artificial**: [Google Gemini](https://ai.google.dev/) (Vía Supabase Edge Functions)
- **Herramientas de Construcción**: [Vite](https://vitejs.dev/)
- **Despliegue Automático**: [Vercel](https://vercel.com)

## 👨‍💻 Creador

Este proyecto ha sido desarrollado y es mantenido por:

**C7Dev**  
*Ingeniero de Sistemas*

---

## 🏗️ Instalación Local

Si deseas ejecutar o auditar este proyecto en tu entorno local, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/C7Dev-77/Hijos-del-Rey-MyD-Ecommerse.git
   cd Hijos-del-Rey-MyD-Ecommerse
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz (basándote en `.env.example`):
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_key_anonima
   ```
   *Nota: La clave de Gemini no se expone en el cliente por motivos de seguridad; se configura directamente en el servidor (Edge Functions) de Supabase.*

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🌐 Despliegue

El proyecto está optimizado y actualmente desplegado en **Vercel**, con backend gestionado en **Supabase**. Cada commit en la rama `main` activa un despliegue automático hacia producción.

---
© 2026 Hijos del Rey - M&D | Desarrollado por **C7Dev**
