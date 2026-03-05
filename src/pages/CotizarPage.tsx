import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  User,
  Sofa,
  Upload,
  Check,
  X
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
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/store/adminStore';

const step1Schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
});

const step2Schema = z.object({
  furnitureType: z.string().min(1, 'Selecciona un tipo'),
  width: z.string().optional(),
  height: z.string().optional(),
  depth: z.string().optional(),
  material: z.string().optional(),
  description: z.string().min(20, 'Describe tu idea con más detalle'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const furnitureTypes = [
  'Sofá',
  'Mesa de Comedor',
  'Cama',
  'Escritorio',
  'Biblioteca',
  'Mueble de TV',
  'Otro',
];

const materials = [
  'Roble',
  'Cedro',
  'Pino',
  'Nogal',
  'MDF Premium',
  'Sin preferencia',
];

export default function CotizarPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || {},
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data || {},
  });

  const steps = [
    { number: 1, title: 'Datos Personales', icon: User },
    { number: 2, title: 'Detalles del Mueble', icon: Sofa },
    { number: 3, title: 'Imágenes de Referencia', icon: Upload },
    { number: 4, title: 'Resumen y Envío', icon: Check },
  ];

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    // Convert images to base64
    const base64Images = await Promise.all(
      uploadedImages.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const quoteId = `QT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // Save to Admin Store
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

    const message = `¡Hola M&D Hijos del Rey! 👋%0A%0A` +
      `Me gustaría solicitar una cotización (Ref: ${quoteId}) con los siguientes detalles:%0A%0A` +
      `👤 *Mis Datos:*%0A` +
      `- Nombre: ${step1Data?.name}%0A` +
      `- Teléfono: ${step1Data?.phone}%0A` +
      `- Ciudad: ${step1Data?.city}%0A` +
      `- Email: ${step1Data?.email}%0A%0A` +
      `🛋️ *Detalles del Mueble:*%0A` +
      `- Tipo: ${step2Data?.furnitureType}%0A` +
      `${step2Data?.width && step2Data?.height && step2Data?.depth ? `- Medidas: ${step2Data.width} x ${step2Data.height} x ${step2Data.depth} cm%0A` : ''}` +
      `${step2Data?.material ? `- Material: ${step2Data.material}%0A` : ''}` +
      `- Descripción: ${step2Data?.description}%0A%0A` +
      `🖼️ *Nota:* ${uploadedImages.length > 0 ? `Ya envié ${uploadedImages.length} imágenes adjuntas a través de su plataforma web.` : 'No adjunté imágenes.'}`;

    const phoneNumber = useAdminStore.getState().contactInfo.whatsapp.replace(/\D/g, '') || "573001234567";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');

    toast({
      title: '¡Cotización Enviada!',
      description: 'Redirigiendo a WhatsApp...',
    });

    setIsSubmitting(false);

    // Reset form after launching WhatsApp
    setTimeout(() => {
      setCurrentStep(1);
      setStep1Data(null);
      setStep2Data(null);
      setUploadedImages([]);
      step1Form.reset();
      step2Form.reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal">
              Cotiza tu Mueble a Medida
            </h1>
            <p className="text-muted-foreground mt-4">
              Cuéntanos tu idea y nuestros artesanos la harán realidad.
              Completa el formulario y recibirás una cotización personalizada.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        backgroundColor: currentStep >= step.number ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                        scale: currentStep === step.number ? 1.1 : 1,
                      }}
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground',
                        currentStep >= step.number ? '' : 'text-muted-foreground'
                      )}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </motion.div>
                    <span className="text-xs mt-2 text-muted-foreground hidden sm:block">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'w-full h-1 mx-2 rounded hidden sm:block',
                        currentStep > step.number ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Data */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl font-bold mb-6">
                  Datos Personales
                </h2>
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre Completo *</label>
                      <Input {...step1Form.register('name')} placeholder="Tu nombre" />
                      {step1Form.formState.errors.name && (
                        <p className="text-destructive text-sm mt-1">
                          {step1Form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Correo Electrónico *</label>
                      <Input {...step1Form.register('email')} type="email" placeholder="tu@email.com" />
                      {step1Form.formState.errors.email && (
                        <p className="text-destructive text-sm mt-1">
                          {step1Form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Teléfono *</label>
                      <Input {...step1Form.register('phone')} placeholder="+57 300 123 4567" />
                      {step1Form.formState.errors.phone && (
                        <p className="text-destructive text-sm mt-1">
                          {step1Form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Ciudad *</label>
                      <Input {...step1Form.register('city')} placeholder="Tu ciudad" />
                      {step1Form.formState.errors.city && (
                        <p className="text-destructive text-sm mt-1">
                          {step1Form.formState.errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-wood-light">
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2: Furniture Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl font-bold mb-6">
                  Detalles del Mueble
                </h2>
                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Tipo de Mueble *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {furnitureTypes.map((type) => (
                        <label
                          key={type}
                          className={cn(
                            'flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors',
                            step2Form.watch('furnitureType') === type
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <input
                            type="radio"
                            {...step2Form.register('furnitureType')}
                            value={type}
                            className="sr-only"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                    {step2Form.formState.errors.furnitureType && (
                      <p className="text-destructive text-sm mt-1">
                        {step2Form.formState.errors.furnitureType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Medidas Aproximadas (cm)</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Input {...step2Form.register('width')} placeholder="Ancho" type="number" />
                      </div>
                      <div>
                        <Input {...step2Form.register('height')} placeholder="Alto" type="number" />
                      </div>
                      <div>
                        <Input {...step2Form.register('depth')} placeholder="Profundo" type="number" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Material Preferido</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {materials.map((material) => (
                        <label
                          key={material}
                          className={cn(
                            'flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors',
                            step2Form.watch('material') === material
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <input
                            type="radio"
                            {...step2Form.register('material')}
                            value={material}
                            className="sr-only"
                          />
                          <span className="text-sm">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Describe tu Idea *</label>
                    <Textarea
                      {...step2Form.register('description')}
                      placeholder="Cuéntanos cómo imaginas tu mueble ideal: estilo, colores, funcionalidades especiales..."
                      rows={4}
                    />
                    {step2Form.formState.errors.description && (
                      <p className="text-destructive text-sm mt-1">
                        {step2Form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-wood-light">
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Images */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl font-bold mb-6">
                  Imágenes de Referencia
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sube imágenes que nos ayuden a entender mejor tu idea (máximo 5).
                </p>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <span className="text-lg font-medium mb-2">
                      Arrastra imágenes aquí o haz clic para subir
                    </span>
                    <span className="text-sm text-muted-foreground">
                      PNG, JPG hasta 5MB cada una
                    </span>
                  </label>
                </div>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Referencia ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="bg-primary text-primary-foreground hover:bg-wood-light"
                  >
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Summary */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <h2 className="font-display text-2xl font-bold mb-6">
                  Resumen de tu Cotización
                </h2>

                <div className="space-y-6">
                  {/* Personal Data Summary */}
                  <div className="border-b border-border pb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Datos Personales
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nombre:</span>{' '}
                        <span className="font-medium">{step1Data?.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>{' '}
                        <span className="font-medium">{step1Data?.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Teléfono:</span>{' '}
                        <span className="font-medium">{step1Data?.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ciudad:</span>{' '}
                        <span className="font-medium">{step1Data?.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Furniture Details Summary */}
                  <div className="border-b border-border pb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Sofa className="h-5 w-5 text-primary" />
                      Detalles del Mueble
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>{' '}
                        <span className="font-medium">{step2Data?.furnitureType}</span>
                      </div>
                      {step2Data?.width && step2Data?.height && step2Data?.depth && (
                        <div>
                          <span className="text-muted-foreground">Medidas:</span>{' '}
                          <span className="font-medium">
                            {step2Data.width} x {step2Data.height} x {step2Data.depth} cm
                          </span>
                        </div>
                      )}
                      {step2Data?.material && (
                        <div>
                          <span className="text-muted-foreground">Material:</span>{' '}
                          <span className="font-medium">{step2Data.material}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Descripción:</span>
                        <p className="font-medium mt-1">{step2Data?.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Images Summary */}
                  {uploadedImages.length > 0 && (
                    <div className="pb-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        Imágenes de Referencia ({uploadedImages.length})
                      </h3>
                      <div className="flex gap-2">
                        {uploadedImages.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Referencia ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="bg-gold text-charcoal hover:bg-gold/90"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
