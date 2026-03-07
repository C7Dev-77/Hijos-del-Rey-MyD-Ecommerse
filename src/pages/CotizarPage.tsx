import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, User, Sofa, Upload, Check, X,
  Sparkles, Loader2, MessageSquare, Lightbulb, Ruler, TreePine,
  RefreshCw, Send
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/store/adminStore';
import { sendChatMessage } from '@/lib/groq';
import { usePageSEO } from '@/hooks/useSEO';

// ── Schemas de validación ─────────────────────────────────────────────────────
const step1Schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido (mín. 10 dígitos)'),
  city: z.string().min(2, 'Ciudad requerida'),
});

const step2Schema = z.object({
  furnitureType: z.string().min(1, 'Selecciona un tipo de mueble'),
  width: z.string().optional(),
  height: z.string().optional(),
  depth: z.string().optional(),
  material: z.string().optional(),
  description: z.string().min(20, 'Mínimo 20 caracteres — cuéntanos más sobre tu idea'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

// ── Opciones ──────────────────────────────────────────────────────────────────
const furnitureTypes = [
  { label: 'Juego de Sala / Sofá', emoji: '🛋️' },
  { label: 'Juego de Comedor', emoji: '🍽️' },
  { label: 'Cama / Dormitorio', emoji: '🛏️' },
  { label: 'Poltrona / Silla', emoji: '🪑' },
  { label: 'Consola', emoji: '🪞' },
  { label: 'Mesa de Centro', emoji: '☕' },
  { label: 'Otro', emoji: '✏️' },
];

const materials = [
  { label: 'Roble', description: 'Resistente y elegante', emoji: '🟤' },
  { label: 'Cedro', description: 'Aroma natural, liviano', emoji: '🌿' },
  { label: 'Pino', description: 'Económico y versátil', emoji: '🌲' },
  { label: 'Nogal', description: 'Premium y oscuro', emoji: '⬛' },
  { label: 'MDF Premium', description: 'Ideal para lacados', emoji: '🔲' },
  { label: 'Sin preferencia', description: 'Nos adaptamos a tu presupuesto', emoji: '💡' },
];

const styleExamples = [
  { label: 'Rústico', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200' },
  { label: 'Moderno', img: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=200' },
  { label: 'Minimalista', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
  { label: 'Industrial', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200' },
];

// Helper para parsear de manera sencilla los enlaces de markdown generados por la IA [texto](/url) -> <Link>
function renderAiMessageText(content: string) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const text = match[1];
    const url = match[2];
    parts.push(
      <Link
        key={match.index}
        to={url}
        target={url.startsWith('http') ? '_blank' : undefined}
        rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="font-semibold underline decoration-2 decoration-primary/50 underline-offset-2 hover:decoration-primary transition-colors text-primary"
      >
        {text}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts.map((p, i) => <span key={i}>{p}</span>)}</>;
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CotizarPage() {
  usePageSEO({
    title: 'Cotiza tus Muebles a Medida',
    description: '¿Tienes un diseño en mente? Envíanos tus medidas, ideas o fotos y los maestros ebanistas de M&D Hijos del Rey lo harán realidad. Cotización de muebles sin compromiso.',
    path: '/cotizar',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [styleSelected, setStyleSelected] = useState('');

  // IA assistant state
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const aiMessagesEnd = useRef<HTMLDivElement>(null);

  const { contactInfo, products } = useAdminStore();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || {},
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data || {},
  });

  const steps = [
    { number: 1, title: 'Tus Datos', icon: User, description: 'Para poder contactarte' },
    { number: 2, title: 'Tu Mueble', icon: Sofa, description: 'Cuéntanos tu idea' },
    { number: 3, title: 'Inspiración', icon: Upload, description: 'Imágenes de referencia' },
    { number: 4, title: 'Confirmar', icon: Check, description: 'Revisa y envía' },
  ];

  // ── IA Assistant ─────────────────────────────────────────────────────────
  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiLoading(true);
    setAiExpanded(true);

    try {
      const contextMessage = step2Data
        ? `El cliente quiere cotizar: ${step2Data.furnitureType}. Material: ${step2Data.material || 'sin preferencia'}. Descripción: ${step2Data.description}.`
        : 'El cliente está llenando el formulario de cotización de muebles a medida.';

      const history = [
        ...aiMessages,
        {
          role: 'user' as const,
          content: `[Contexto: ${contextMessage}] ${userMsg}`
        }
      ];

      const reply = await sendChatMessage(history, {
        address: contactInfo.address,
        whatsapp: contactInfo.whatsapp,
        schedule: contactInfo.schedule,
        email: contactInfo.email,
        products: products,
      });

      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, tuve un problema. Pregunta directamente en WhatsApp: ' + contactInfo.whatsapp
      }]);
    } finally {
      setIsAiLoading(false);
      setTimeout(() => aiMessagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const askAiSuggestion = async (prompt: string) => {
    setAiInput(prompt);
    await handleAiSend();
  };

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleStep1Submit = (data: Step1Data) => { setStep1Data(data); setCurrentStep(2); };
  const handleStep2Submit = (data: Step2Data) => { setStep2Data(data); setCurrentStep(3); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files].slice(0, 5));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const base64Images = await Promise.all(
      uploadedImages.map(file => new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }))
    );

    const quoteId = `QT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    useAdminStore.getState().addQuote({
      id: quoteId,
      userName: step1Data?.name || '',
      userEmail: step1Data?.email || '',
      userPhone: step1Data?.phone || '',
      userCity: step1Data?.city || '',
      furnitureType: step2Data?.furnitureType || '',
      width: step2Data?.width,
      height: step2Data?.height,
      depth: step2Data?.depth,
      material: step2Data?.material,
      description: step2Data?.description || '',
      images: base64Images,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('es-CO'),
    });

    // Usar \n en lugar de %0A, y encodear todo adecuadamente
    const messageRaw =
      `¡Hola M&D Hijos del Rey! 👋\n\n` +
      `Solicito cotización (Ref: ${quoteId}):\n\n` +
      `👤 *Datos:*\n` +
      `• Nombre: ${step1Data?.name}\n` +
      `• Tel: ${step1Data?.phone}\n` +
      `• Ciudad: ${step1Data?.city}\n\n` +
      `🛋️ *Mueble:*\n` +
      `• Tipo: ${step2Data?.furnitureType}\n` +
      `${step2Data?.width ? `• Medidas: ${step2Data.width}×${step2Data.height}×${step2Data.depth} cm\n` : ''}` +
      `${step2Data?.material ? `• Material: ${step2Data.material}\n` : ''}` +
      `${styleSelected ? `• Estilo: ${styleSelected}\n` : ''}` +
      `• Idea: ${step2Data?.description}\n\n` +
      `📷 Imágenes adjuntas: ${uploadedImages.length > 0 ? `${uploadedImages.length} imagen(es) compartida(s) en la web` : 'Sin imágenes'}`;

    const phone = contactInfo.whatsapp.replace(/\D/g, '') || '573001234567';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageRaw)}`, '_blank');

    toast({ title: '🎉 ¡Redirigiendo a WhatsApp!', description: 'Envía el mensaje pre-escrito para continuar.' });
    setIsSubmitting(false);

    // Enviar al paso de "Éxito"
    setCurrentStep(5);

    // Limpiar los datos en el fondo (opcional) pero dejamos un rato antes de limpiar por si el usuario vuelve
    setTimeout(() => {
      setStep1Data(null); setStep2Data(null);
      setUploadedImages([]); setStyleSelected('');
      step1Form.reset(); step2Form.reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/95 to-background" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <Badge className="bg-gold/20 text-gold border-gold/30 mb-4 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Con asistencia de IA
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-charcoal">
              Diseña tu Mueble<br className="hidden md:block" /> <span className="text-primary">a Medida</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-4 max-w-xl">
              Completa el formulario guiado en 4 pasos. Nuestro asistente IA te ayuda a
              describir tu idea perfectamente para que nuestros artesanos la hagan realidad.
            </p>
            <div className="flex flex-wrap gap-6 mt-6 text-sm text-muted-foreground">
              {[
                { icon: '⚡', text: 'Respuesta en menos de 24h' },
                { icon: '💰', text: 'Cotización sin compromiso' },
                { icon: '🤝', text: 'Asesoría personalizada' },
              ].map(item => (
                <span key={item.text} className="flex items-center gap-1.5">
                  {item.icon} {item.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">

          {/* ── Progress Steps ── */}
          {currentStep < 5 && (
            <div className="mb-10">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          backgroundColor: currentStep >= step.number ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          scale: currentStep === step.number ? 1.15 : 1,
                        }}
                        className={cn(
                          'w-11 h-11 rounded-full flex items-center justify-center ring-4 ring-offset-2 ring-transparent transition-all',
                          currentStep >= step.number ? 'text-primary-foreground ring-primary/20' : 'text-muted-foreground'
                        )}
                      >
                        {currentStep > step.number ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                      </motion.div>
                      <span className="text-xs mt-2 font-medium text-center hidden sm:block">
                        <span className={currentStep === step.number ? 'text-primary' : 'text-muted-foreground'}>
                          {step.title}
                        </span>
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        'flex-1 h-1 mx-2 rounded-full transition-all duration-500',
                        currentStep > step.number ? 'bg-primary' : 'bg-muted'
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Main Form ── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">

                {/* ── STEP 1: Datos ── */}
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="bg-card border border-border rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold">Tus Datos de Contacto</h2>
                        <p className="text-muted-foreground text-sm">Para enviarte la cotización personalizada</p>
                      </div>
                    </div>
                    <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                          <Input {...step1Form.register('name')} placeholder="Ej: María García" className="h-11" />
                          {step1Form.formState.errors.name && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
                          <Input {...step1Form.register('email')} type="email" placeholder="tu@correo.com" className="h-11" />
                          {step1Form.formState.errors.email && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.email.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">WhatsApp / Teléfono *</label>
                          <Input {...step1Form.register('phone')} placeholder="+57 300 123 4567" className="h-11" />
                          {step1Form.formState.errors.phone && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.phone.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Ciudad / Municipio *</label>
                          <Input {...step1Form.register('city')} placeholder="Ej: Sampués, Sucre" className="h-11" />
                          {step1Form.formState.errors.city && <p className="text-destructive text-xs mt-1">{step1Form.formState.errors.city.message}</p>}
                        </div>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-wood-light px-8">
                          Continuar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ── STEP 2: Mueble ── */}
                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="bg-card border border-border rounded-2xl p-8 space-y-7">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sofa className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold">Tu Mueble Ideal</h2>
                        <p className="text-muted-foreground text-sm">Selecciona el tipo y cuéntanos tu visión</p>
                      </div>
                    </div>

                    <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-7">
                      {/* Tipo de mueble */}
                      <div>
                        <label className="block text-sm font-semibold mb-3">¿Qué tipo de mueble necesitas? *</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {furnitureTypes.map(({ label, emoji }) => (
                            <label key={label} className={cn(
                              'flex flex-col items-center gap-1 p-3 border-2 rounded-xl cursor-pointer transition-all text-center',
                              step2Form.watch('furnitureType') === label
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-border hover:border-primary/40 hover:bg-muted/50'
                            )}>
                              <input type="radio" {...step2Form.register('furnitureType')} value={label} className="sr-only" />
                              <span className="text-2xl">{emoji}</span>
                              <span className="text-xs font-medium">{label}</span>
                            </label>
                          ))}
                        </div>
                        {step2Form.formState.errors.furnitureType && (
                          <p className="text-destructive text-xs mt-1">{step2Form.formState.errors.furnitureType.message}</p>
                        )}
                      </div>

                      {/* Medidas */}
                      <div>
                        <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" /> Medidas aproximadas (cm) — Opcional
                        </label>
                        <p className="text-xs text-muted-foreground mb-3">Si no sabes exactamente, no te preocupes. Nuestro equipo te ayudará a definirlas.</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[{ name: 'width', label: 'Ancho' }, { name: 'height', label: 'Alto' }, { name: 'depth', label: 'Profundidad' }].map(f => (
                            <div key={f.name}>
                              <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                              <Input {...step2Form.register(f.name as 'width' | 'height' | 'depth')} placeholder={f.label} type="number" className="h-11" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Material */}
                      <div>
                        <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                          <TreePine className="h-4 w-4 text-muted-foreground" /> Material preferido
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {materials.map(({ label, description, emoji }) => (
                            <label key={label} className={cn(
                              'flex items-start gap-2.5 p-3 border-2 rounded-xl cursor-pointer transition-all',
                              step2Form.watch('material') === label
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:border-primary/40'
                            )}>
                              <input type="radio" {...step2Form.register('material')} value={label} className="sr-only" />
                              <span className="text-xl mt-0.5">{emoji}</span>
                              <div>
                                <p className="text-sm font-medium leading-tight">{label}</p>
                                <p className="text-xs text-muted-foreground">{description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Estilo visual */}
                      <div>
                        <label className="block text-sm font-semibold mb-3">Estilo que te inspira — Opcional</label>
                        <div className="grid grid-cols-4 gap-2">
                          {styleExamples.map(({ label, img }) => (
                            <button type="button" key={label}
                              onClick={() => setStyleSelected(styleSelected === label ? '' : label)}
                              className={cn(
                                'relative rounded-xl overflow-hidden aspect-video border-2 transition-all',
                                styleSelected === label ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                              )}>
                              <img src={img} alt={label} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-charcoal/50 flex items-end p-1.5">
                                <span className="text-cream text-xs font-medium">{label}</span>
                              </div>
                              {styleSelected === label && (
                                <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Descripción */}
                      <div>
                        <label className="block text-sm font-semibold mb-1">Describe tu idea *</label>
                        <p className="text-xs text-muted-foreground mb-3">
                          Cuéntanos: colores, funcionalidades especiales, espacio donde va, si ya viste algo similar…
                          Cuanto más detallado, mejor será la cotización. 💡 <span className="text-primary font-medium">El asistente IA de la derecha puede ayudarte.</span>
                        </p>
                        <Textarea {...step2Form.register('description')}
                          placeholder="Ej: Quiero un sofá de 3 puestos en color gris oscuro, con tela antimanchas, de estilo moderno. El espacio es de sala pequeña de aprox. 4x3 metros. Me gustaría que tenga almacenamiento bajo los cojines si es posible."
                          rows={5} className="resize-none" />
                        <div className="flex justify-between items-center mt-1">
                          {step2Form.formState.errors.description
                            ? <p className="text-destructive text-xs">{step2Form.formState.errors.description.message}</p>
                            : <p className="text-xs text-muted-foreground">{step2Form.watch('description')?.length || 0} caracteres (mín. 20)</p>
                          }
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
                          <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                        <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-wood-light px-8">
                          Continuar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ── STEP 3: Imágenes ── */}
                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="bg-card border border-border rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold">Imágenes de Inspiración</h2>
                        <p className="text-muted-foreground text-sm">Opcional — Máximo 5 imágenes</p>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 text-sm flex gap-3">
                      <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary">¿Por qué subir imágenes?</p>
                        <p className="text-muted-foreground mt-0.5">Una imagen vale más que mil palabras. Si viste algo en Pinterest, Instagram o en una tienda, ¡muéstranoslo! Nos ayuda a entender exactamente tu gusto.</p>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center mb-6 hover:border-primary/50 transition-colors">
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="image-upload" />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <span className="text-base font-medium mb-1">Arrastra aquí o haz clic para subir</span>
                        <span className="text-sm text-muted-foreground">PNG, JPG, WEBP — Hasta 5 imágenes</span>
                        <Button type="button" variant="outline" size="sm" className="mt-4 pointer-events-none">
                          Seleccionar imágenes
                        </Button>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img src={URL.createObjectURL(file)} alt={`Ref ${index + 1}`} className="w-full h-full object-cover rounded-xl" />
                            <button onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                              className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep(2)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                      </Button>
                      <Button size="lg" onClick={() => setCurrentStep(4)} className="bg-primary text-primary-foreground hover:bg-wood-light px-8">
                        Revisar cotización <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: Resumen ── */}
                {currentStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="bg-card border border-border rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Check className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold">Resumen de tu Solicitud</h2>
                        <p className="text-muted-foreground text-sm">Revisa los datos antes de enviar</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      {/* Datos personales */}
                      <div className="bg-muted/40 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" /> Tus Datos
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{step1Data?.name}</span></div>
                          <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{step1Data?.email}</span></div>
                          <div><span className="text-muted-foreground">Teléfono:</span> <span className="font-medium">{step1Data?.phone}</span></div>
                          <div><span className="text-muted-foreground">Ciudad:</span> <span className="font-medium">{step1Data?.city}</span></div>
                        </div>
                      </div>

                      {/* Mueble */}
                      <div className="bg-muted/40 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Sofa className="h-4 w-4" /> Tu Mueble
                        </h3>
                        <div className="space-y-1.5 text-sm">
                          <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{step2Data?.furnitureType}</span></div>
                          {step2Data?.width && <div><span className="text-muted-foreground">Medidas:</span> <span className="font-medium">{step2Data.width} × {step2Data.height} × {step2Data.depth} cm</span></div>}
                          {step2Data?.material && <div><span className="text-muted-foreground">Material:</span> <span className="font-medium">{step2Data.material}</span></div>}
                          {styleSelected && <div><span className="text-muted-foreground">Estilo:</span> <span className="font-medium">{styleSelected}</span></div>}
                          <div className="pt-1"><span className="text-muted-foreground">Descripción:</span><p className="font-medium mt-1 bg-background rounded-lg p-3">{step2Data?.description}</p></div>
                        </div>
                      </div>

                      {/* Imágenes */}
                      {uploadedImages.length > 0 && (
                        <div className="bg-muted/40 rounded-xl p-5">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            📷 Imágenes ({uploadedImages.length})
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            {uploadedImages.map((file, i) => (
                              <img key={i} src={URL.createObjectURL(file)} alt={`Ref ${i + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Proceso */}
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                        <p className="text-sm font-semibold text-primary mb-3">¿Qué sigue después de enviar?</p>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {['Tu solicitud llega a WhatsApp de M&D Hijos del Rey', 'Un asesor revisa los detalles en menos de 24 horas', 'Te contactamos con la cotización personalizada', 'Si apruebas, acordamos materiales y fecha de entrega'].map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep(3)}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                      </Button>
                      <Button onClick={handleFinalSubmit} disabled={isSubmitting} size="lg"
                        className="bg-gold text-charcoal hover:bg-gold/90 font-bold px-8">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…</> : <>Enviar por WhatsApp <Send className="ml-2 h-4 w-4" /></>}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 5: Éxito ── */}
                {currentStep === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 ring-8 ring-emerald-50">
                      <Check className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="font-display text-3xl font-bold mb-4 text-charcoal">¡Gracias por tu solicitud!</h2>
                    <p className="text-muted-foreground max-w-sm mb-8">
                      Hemos intentado abrir WhatsApp con todos los detalles.
                      <strong className="text-charcoal block mt-2">Por favor, envía el mensaje que se generó en el chat.</strong>
                      Un maestro ebanista revisará tu idea y te responderemos a la mayor brevedad posible.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <Button asChild onClick={() => setCurrentStep(1)} size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-wood-light">
                        <Link to="/catalogo">Seguir Explorando</Link>
                      </Button>
                      <Button variant="outline" onClick={() => setCurrentStep(1)} size="lg" className="w-full sm:w-auto">
                        Cotizar otro mueble
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Sidebar IA ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Asistente IA */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-primary to-wood-dark p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Asistente M&D</p>
                      <p className="text-white/70 text-xs">Impulsado por IA • En línea</p>
                    </div>
                    <button onClick={() => setAiExpanded(!aiExpanded)} className="ml-auto text-white/70 hover:text-white">
                      {aiExpanded ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {aiExpanded && aiMessages.length > 0 && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden">
                        <div className="p-3 max-h-64 overflow-y-auto space-y-3">
                          {aiMessages.map((msg, i) => (
                            <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                              <div className={cn(
                                'rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] leading-relaxed whitespace-pre-wrap',
                                msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                              )}>
                                {renderAiMessageText(msg.content)}
                              </div>
                            </div>
                          ))}
                          {isAiLoading && (
                            <div className="flex justify-start">
                              <div className="bg-muted rounded-2xl px-3.5 py-2.5 flex gap-1">
                                {[0, 0.2, 0.4].map((d, i) => (
                                  <motion.div key={i} className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                                ))}
                              </div>
                            </div>
                          )}
                          <div ref={aiMessagesEnd} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input IA */}
                  <div className="p-3 border-t border-border">
                    <div className="flex gap-2">
                      <Input value={aiInput} onChange={e => setAiInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiSend(); } }}
                        placeholder="Pregúntame sobre materiales, estilos…" className="text-sm h-9" />
                      <Button size="icon" onClick={handleAiSend} disabled={isAiLoading || !aiInput.trim()} className="h-9 w-9 bg-primary shrink-0">
                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sugerencias rápidas */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Lightbulb className="h-4 w-4 text-gold" /> Preguntas frecuentes
                  </p>
                  <div className="space-y-2">
                    {[
                      '¿Cuáles maderas son más duraderas?',
                      '¿Cuánto tarda un mueble a medida?',
                      '¿Pueden hacer envíos a todo Colombia?',
                      '¿Puedo ver diseños antes de aprobar?',
                    ].map(q => (
                      <button key={q} onClick={() => { setAiInput(q); setAiExpanded(true); }}
                        className="w-full text-left text-xs text-muted-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info de contacto */}
                <div className="bg-muted/50 rounded-2xl p-4 text-sm text-center">
                  <p className="font-medium">¿Prefieres hablar directo?</p>
                  <p className="text-muted-foreground text-xs mt-1 mb-3">Nuestro equipo está disponible en:</p>
                  <p className="text-xs text-muted-foreground">{contactInfo.schedule}</p>
                  <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="mt-3 w-full gap-2">
                      <RefreshCw className="h-3.5 w-3.5" /> WhatsApp directo
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
