import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, loginWithGoogle } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser(data.name, data.email, data.password);

    if (result.success) {
      toast({
        title: 'Cuenta creada exitosamente',
        description: 'Revisa tu correo para confirmar tu cuenta. Luego podrás iniciar sesión.',
      });
      navigate('/login');
    } else {
      toast({
        title: 'Error al registrarse',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200)',
          }}
        />
        <div className="absolute inset-0 bg-charcoal/60" />
        <div className="relative z-10 flex flex-col justify-center p-16">
          <Link to="/" className="mb-8">
            <h1 className="font-display text-3xl font-bold text-cream">
              M&D <span className="text-gold">Hijos del Rey</span>
            </h1>
          </Link>
          <h2 className="font-display text-4xl font-bold text-cream mb-4">
            Únete a Nuestra Familia
          </h2>
          <p className="text-cream/80 text-lg">
            Crea tu cuenta y descubre el mundo de los
            muebles artesanales de Sampués.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back to Home Link */}
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden block mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              M&D <span className="text-gold">Hijos del Rey</span>
            </h1>
          </Link>

          <h2 className="font-display text-3xl font-bold mb-2">
            Crear Cuenta
          </h2>
          <p className="text-muted-foreground mb-8">
            Completa tus datos para registrarte.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre Completo
              </label>
              <Input
                {...register('name')}
                placeholder="Tu nombre"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Correo Electrónico
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="tu@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={errors.password ? 'border-destructive' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirmar Contraseña
              </label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="••••••••"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="rounded border-border mt-1" required />
              <span className="text-sm text-muted-foreground">
                Acepto los{' '}
                <Link to="#" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="#" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-wood-light"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">O regístrate con</span>
            </div>
          </div>

          {/* Botón Google */}
          <Button
            id="btn-registro-google"
            type="button"
            variant="outline"
            disabled={isGoogleLoading}
            onClick={async () => {
              setIsGoogleLoading(true);
              const result = await loginWithGoogle();
              if (!result.success) {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
                setIsGoogleLoading(false);
              }
              // Si hay éxito, Supabase redirige automáticamente — no hay nada más que hacer
            }}
            className="w-full flex items-center justify-center gap-3 border-border hover:bg-muted/50 transition-colors"
          >
            {isGoogleLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isGoogleLoading ? 'Redirigiendo...' : 'Registrarse con Google'}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
