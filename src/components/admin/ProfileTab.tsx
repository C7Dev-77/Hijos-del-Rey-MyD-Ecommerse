import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, KeyRound, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────
// ProfileTab — Editar nombre y contraseña del admin
// ─────────────────────────────────────────────────────────
export function ProfileTab() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
      if (error) throw error;
      toast.success('Nombre actualizado correctamente ✓');
    } catch (err: unknown) {
      toast.error('Error al actualizar el nombre: ' + (err instanceof Error ? err.message : 'desconocido'));
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) { toast.error('Completa ambos campos.'); return; }
    if (newPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Las contraseñas no coinciden.'); return; }
    setSavingPassword(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Contraseña actualizada correctamente ✓');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      toast.error('Error al actualizar contraseña: ' + (err instanceof Error ? err.message : 'desconocido'));
    } finally {
      setSavingPassword(false);
    }
  };

  const isGoogleUser = user?.app_metadata?.provider === 'google';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6 pb-16">
      {/* Cabecera */}
      <div className="bg-white rounded-xl border border-border p-6 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          {user?.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            : <UserCircle className="w-9 h-9 text-primary" />}
        </div>
        <div>
          <p className="font-semibold text-lg">{user?.user_metadata?.name || 'Administrador'}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Administrador</span>
            {isGoogleUser && (
              <span className="ml-2 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">via Google</span>
            )}
          </div>
        </div>
      </div>

      {/* Cambiar nombre */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Cambiar Nombre</h3>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Correo electrónico (no editable)</Label>
          <Input value={user?.email || ''} disabled className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
          <p className="text-[10px] text-muted-foreground">El correo solo puede cambiarse desde el panel de Supabase.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-name">Nombre para mostrar</Label>
          <Input id="profile-name" value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre completo" className="bg-background" />
        </div>
        <Button onClick={handleSaveName} disabled={savingName || !name.trim()} className="w-full bg-primary text-primary-foreground gap-2">
          <Save className="h-4 w-4" />
          {savingName ? 'Guardando...' : 'Guardar Nombre'}
        </Button>
      </div>

      {/* Cambiar contraseña */}
      {isGoogleUser ? (
        <div className="bg-muted/40 rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-border mb-3">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-muted-foreground">Cambiar Contraseña</h3>
          </div>
          <p className="text-sm text-muted-foreground">Tu cuenta está vinculada con Google. La contraseña es gestionada por Google — no puede cambiarse desde aquí.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Cambiar Contraseña</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <div className="relative">
              <Input id="new-password" type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="bg-background pr-10" />
              <button type="button" onClick={() => setShowNewPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <div className="relative">
              <Input id="confirm-password" type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" className="bg-background pr-10" />
              <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-destructive font-medium">Las contraseñas no coinciden.</p>
            )}
          </div>
          <Button onClick={handleSavePassword} disabled={savingPassword || !newPassword || !confirmPassword} className="w-full bg-primary text-primary-foreground gap-2">
            <KeyRound className="h-4 w-4" />
            {savingPassword ? 'Guardando...' : 'Cambiar Contraseña'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
