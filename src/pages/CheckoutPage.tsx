import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Truck,
  ChevronRight,
  Check,
  Building2,
  SmartphoneNfc,
  MessageCircle,
  ShoppingCart,
  ShieldCheck
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/store/cartStore';
import { useAdminStore } from '@/store/adminStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/data/mock';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono requerido asignado'),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Departamento requerido'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState<'domicilio' | 'agencia'>('domicilio');
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'nequi' | 'wompi'>('wompi');

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<'wompi' | 'whatsapp' | false>(false);
  const navigate = useNavigate();

  const { items, getTotal, clearCart } = useCartStore();
  const { contactInfo } = useAdminStore();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Inicia Sesión",
        description: "Debes estar logueado para realizar un pedido.",
        variant: "destructive"
      });
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const subtotal = getTotal();
  const shipping = deliveryMethod === 'agencia' ? 0 : (subtotal > 1000000 ? 0 : 80000);
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);

    if (paymentMethod === 'wompi') {
      try {
        // Validar que la llave de Wompi esté configurada correctamente
        const wompiPublicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
        const isKeyInvalid =
          !wompiPublicKey ||
          wompiPublicKey === '' ||
          wompiPublicKey.includes('PEGA_TU') ||
          // Detecta el formato incorrecto 'pub_prod_pub_test_...' que mezcla ambos prefijos
          (wompiPublicKey.startsWith('pub_prod_') && wompiPublicKey.includes('pub_test')) ||
          (!wompiPublicKey.startsWith('pub_test_') && !wompiPublicKey.startsWith('pub_prod_'));

        if (isKeyInvalid) {
          setIsProcessing(false);
          toast({
            title: "Llave de pago incorrecta",
            description: "La llave de Wompi tiene un formato incorrecto. Mientras, puedes pagar por WhatsApp o transferencia.",
            variant: "destructive"
          });
          return;
        }

        const isSandbox = wompiPublicKey.startsWith('pub_test_');
        if (isSandbox) {
          toast({
            title: "🧪 Modo Sandbox — Cuenta en revisión",
            description: "Wompi está en modo de PRUEBA. Los cobros no son reales hasta que Wompi apruebe tu cuenta.",
            variant: "default"
          });
          // Sigue el flujo — útil para probar la integración completa
        }

        const reference = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 1. Registrar intención en Supabase primero
        const { error: dbError } = await supabase.from('orders').insert([
          {
            user_id: user?.id,
            products: items,
            total: total,
            shipping_address: `${data.firstName} ${data.lastName} | ${data.address}, ${data.city} (${data.state}) | Tel: ${data.phone}`,
            payment_method: 'wompi',
            status: 'pending',
            reference: reference
          }
        ]);

        if (dbError) throw dbError;

        // 2. Abrir Widget de Wompi
        const checkout = new window.WidgetCheckout({
          currency: 'COP',
          amountInCents: total * 100,
          reference: reference,
          publicKey: wompiPublicKey,
          customerData: {
            email: data.email,
            fullName: `${data.firstName} ${data.lastName}`,
            phoneNumber: data.phone,
            phoneNumberPrefix: '+57'
          },
          shippingAddress: {
            addressLine1: data.address,
            city: data.city,
            phoneNumber: data.phone,
            region: data.state,
            country: 'CO'
          }
        });

        checkout.open((result: any) => {
          const transaction = result.transaction;
          if (transaction.status === 'APPROVED') {
            toast({
              title: "¡Pago aprobado!",
              description: "Tu pedido ha sido procesado con éxito.",
              variant: "default"
            });
            // 3. Actualizar estado en Supabase
            supabase.from('orders')
              .update({ status: 'processing' })
              .eq('reference', reference)
              .then(({ error }) => {
                if (error) console.error("Error updating order status:", error);
              });

            setIsProcessing(false);
            setOrderComplete('wompi');
            clearCart();
          } else {
            setIsProcessing(false);
            toast({
              title: "Pago no completado",
              description: `Estado: ${transaction.status}. Intenta de nuevo o usa WhatsApp.`,
              variant: "destructive"
            });
          }
        });

        return; // Detener aquí para Wompi
      } catch (e) {
        console.error("Wompi Error:", e);
        setIsProcessing(false);
        toast({
          title: "Error al iniciar pago",
          description: "No pudimos conectar con la pasarela. Prueba WhatsApp.",
          variant: "destructive"
        });
        return;
      }
    }

    // 1. Preparar el mensaje de WhatsApp detallado (Flujo Anterior)
    let msj = `¡Hola! 👋 Me gustaría concretar el siguiente pedido:\n\n`;
    // ... rest of WhatsApp logic ...
    msj += `*👤 DATOS DEL CLIENTE*\n`;
    msj += `- Nombre: ${data.firstName} ${data.lastName}\n`;
    msj += `- Teléfono: ${data.phone}\n`;
    msj += `- Email: ${data.email}\n`;
    msj += `- Dirección: ${data.address}, ${data.city} (${data.state})\n`;
    if (data.notes) msj += `- Notas: ${data.notes}\n`;

    msj += `\n*⚙️ OPCIONES SELECCIONADAS*\n`;
    msj += `- Entrega: ${deliveryMethod === 'domicilio' ? 'Envío a Domicilio' : 'Recogida / Agencia'}\n`;
    msj += `- Pago: ${paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 'Nequi / Daviplata'}\n`;

    msj += `\n*📦 RESUMEN DEL PEDIDO*\n`;
    items.forEach((item, index) => {
      msj += `${index + 1}. ${item.product.name} (x${item.quantity}) - ${formatPrice(item.product.price * item.quantity)}\n`;
    });

    msj += `\n- Subtotal: ${formatPrice(subtotal)}\n`;
    msj += `- Envío: ${shipping === 0 ? 'Gratis' : formatPrice(shipping)}\n`;
    msj += `*💰 TOTAL: ${formatPrice(total)}*\n\n`;

    msj += `Quedo atento(a) para confirmar la disponibilidad y realizar el pago. ¡Gracias! ✨`;

    try {
      await supabase.from('orders').insert([
        {
          user_id: user?.id,
          products: items,
          total: total,
          shipping_address: `${data.firstName} ${data.lastName} | ${data.address}, ${data.city} (${data.state}) | Tel: ${data.phone}`,
          payment_method: paymentMethod,
          status: 'pending'
        }
      ]);
    } catch (e) { console.error(e); }

    const whatsappNumber = contactInfo.whatsapp.replace(/[^0-9+]/g, '').replace('+', '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msj)}`;
    window.open(whatsappUrl, '_blank');

    setIsProcessing(false);
    setOrderComplete('whatsapp');
    clearCart();
  };

  // ------------------------------------------------------------------
  // ESTADOS DE LA VISTA
  // ------------------------------------------------------------------

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center flex-1 flex flex-col justify-center items-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Aún no has agregado muebles a tu carrito. Explora nuestro catálogo y encuentra la pieza perfecta para ti.
          </p>
          <Link to="/catalogo">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-wood-light">
              Ir al Catálogo
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    const isWompi = orderComplete === 'wompi';
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center max-w-lg flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${isWompi
              ? 'bg-primary shadow-primary/30'
              : 'bg-[#25D366] shadow-[#25D366]/30'
              }`}
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold mb-4">
            {isWompi ? '¡Pago Aprobado!' : '¡Redirigiendo a WhatsApp!'}
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            {isWompi
              ? 'Tu pago fue procesado exitosamente. Recibirás confirmación de tu pedido pronto.'
              : 'Te hemos llevado a nuestro chat de WhatsApp con el resumen completo de tu pedido para coordinar el pago y la entrega.'}
          </p>

          <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left border border-border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {isWompi
                ? <ShieldCheck className="h-5 w-5 text-primary" />
                : <MessageCircle className="h-5 w-5 text-[#25D366]" />}
              ¿Qué sigue ahora?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {isWompi ? (
                <>
                  <li>1. Tu pedido está registrado y en proceso.</li>
                  <li>2. Nos pondremos en contacto para confirmar el envío.</li>
                  <li>3. Recibirás actualizaciones del estado de tu entrega.</li>
                </>
              ) : (
                <>
                  <li>1. Envíanos el mensaje pre-generado por WhatsApp.</li>
                  <li>2. Te confirmaremos disponibilidad y tiempos de entrega.</li>
                  <li>3. Te proporcionaremos los datos exactos para el pago.</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/')}>
              Volver al Inicio
            </Button>
            <Button size="lg" onClick={() => navigate('/catalogo')} className="bg-primary text-primary-foreground">
              Ver más muebles
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Inicio</Link>
            <span>/</span>
            <span className="text-foreground">Checkout Directo</span>
          </nav>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Confirmar Pedido
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario Principal */}
            <div className="lg:col-span-2 space-y-8">
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* 1. Información del Cliente */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border text-charcoal">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="font-bold text-gold">1</span>
                    </div>
                    <h2 className="font-display text-xl font-bold">Datos Personales y Envío</h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Nombre *</label>
                      <Input {...register('firstName')} placeholder="Ej: Carlos" className="bg-white" />
                      {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Apellido *</label>
                      <Input {...register('lastName')} placeholder="Ej: Rodríguez" className="bg-white" />
                      {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email *</label>
                      <Input {...register('email')} type="email" placeholder="correo@ejemplo.com" className="bg-white" />
                      {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">WhatsApp / Celular *</label>
                      <Input {...register('phone')} placeholder="+57 320..." className="bg-white" />
                      {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <label className="block text-sm font-medium mb-1.5">Dirección Exacta *</label>
                      <Input {...register('address')} placeholder="Calle, Carrera, No., Conjunto/Apto..." className="bg-white" />
                      {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Ciudad *</label>
                      <Input {...register('city')} placeholder="Ej: Bogotá" className="bg-white" />
                      {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Departamento *</label>
                      <Input {...register('state')} placeholder="Ej: Cundinamarca" className="bg-white" />
                      {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
                    </div>

                    <div className="sm:col-span-2 mt-2">
                      <label className="block text-sm font-medium mb-1.5">Notas del pedido (opcional)</label>
                      <Textarea
                        {...register('notes')}
                        placeholder="Instrucciones en portería, horarios de entrega preferidos, etc."
                        className="bg-white resize-none h-24"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* 2. Opciones de Entrega y Pago */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border text-charcoal">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="font-bold text-gold">2</span>
                    </div>
                    <h2 className="font-display text-xl font-bold">Opciones del Pedido</h2>
                  </div>

                  {/* Método de Entrega */}
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Método de Entrega</h3>
                    <div className="grid sm:grid-cols-2 gap-4">

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('domicilio')}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                          deliveryMethod === 'domicilio'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/60 hover:border-primary/40 bg-white'
                        )}
                      >
                        <div className={cn("p-2 rounded-full", deliveryMethod === 'domicilio' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal">Envío a Domicilio</p>
                          <p className="text-sm text-muted-foreground mt-1">Llevamos el mueble hasta tu hogar ($80.000 o Gratis &gt;$1M).</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('agencia')}
                        className={cn(
                          'flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all',
                          deliveryMethod === 'agencia'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/60 hover:border-primary/40 bg-white'
                        )}
                      >
                        <div className={cn("p-2 rounded-full", deliveryMethod === 'agencia' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal">Agencia / Retiro</p>
                          <p className="text-sm text-muted-foreground mt-1">Pagas el envío contra entrega mediante InterRapidísimo u otros.</p>
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Preferencia de Pago</h3>
                    <div className="grid sm:grid-cols-2 gap-4">

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wompi')}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                          paymentMethod === 'wompi'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/60 hover:border-primary/40 bg-white'
                        )}
                      >
                        <CreditCard className={cn("h-6 w-6 shrink-0", paymentMethod === 'wompi' ? 'text-primary' : 'text-muted-foreground')} />
                        <div className="flex-1">
                          <span className="font-medium text-charcoal block">Tarjeta / PSE / Otros</span>
                          <span className="text-[10px] text-muted-foreground">Pago Seguro via Wompi</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('transferencia')}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                          paymentMethod === 'transferencia'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/60 hover:border-primary/40 bg-white'
                        )}
                      >
                        <Building2 className={cn("h-6 w-6 shrink-0", paymentMethod === 'transferencia' ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="font-medium text-charcoal">Transferencia Bancaria</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('nequi')}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                          paymentMethod === 'nequi'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/60 hover:border-primary/40 bg-white'
                        )}
                      >
                        <SmartphoneNfc className={cn("h-6 w-6 shrink-0", paymentMethod === 'nequi' ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="font-medium text-charcoal">Nequi / DaviPlata</span>
                      </button>

                    </div>
                  </div>
                </motion.div>
              </form>
            </div>

            {/* Sidebar Resumen */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 sticky top-28"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <h2 className="font-display text-xl font-bold">Resumen</h2>
                  <Badge className="bg-charcoal text-cream">{items.length} items</Badge>
                </div>

                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-charcoal line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Cant: {item.quantity}</p>
                        <p className="text-sm font-medium text-primary mt-1">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-cream p-4 rounded-xl space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal Muebles</span>
                    <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Costo de Envío</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-forest bg-forest/10 px-2 py-0.5 rounded-md">Gratis/Pendiente</span>
                      ) : (
                        <span className="text-charcoal">{formatPrice(shipping)}</span>
                      )}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between font-display text-xl font-bold text-charcoal">
                    <span>Total Estimado</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {subtotal < 1000000 && deliveryMethod === 'domicilio' && (
                  <p className="text-xs text-center text-muted-foreground mb-6 bg-muted/50 p-2 rounded-lg">
                    Añade <strong>{formatPrice(1000000 - subtotal)}</strong> más a tu carrito <br /> para obtener <strong>envío gratis</strong> 🚚.
                  </p>
                )}

                {/* Botón Flujo de Wompi o WhatsApp */}
                <Button
                  type="submit"
                  form="checkout-form" // Link to the form above
                  size="lg"
                  disabled={isProcessing}
                  className={cn(
                    "w-full text-white hover:shadow-lg transition-all h-14 text-base relative overflow-hidden group",
                    paymentMethod === 'wompi' ? "bg-primary hover:bg-wood-light" : "bg-[#25D366] hover:bg-[#20bd5a]"
                  )}
                >
                  {paymentMethod === 'wompi' ? (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      {isProcessing ? 'Procesando Pago...' : 'Pagar de forma segura'}
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      {isProcessing ? 'Generando Pedido...' : 'Enviar Pedido por WhatsApp'}
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground mt-4 leading-relaxed">
                  Al hacer clic serás redirigido a WhatsApp para coordinar los detalles finales y el pago directamente con nuestro equipo. 🔒
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
