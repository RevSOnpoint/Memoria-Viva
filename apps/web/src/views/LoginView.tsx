import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { ShieldCheck, UserCheck, Building2 } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

const getLoginError = (err: unknown): string => {
  const message = err instanceof Error ? err.message : '';
  if (message.toLowerCase().includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Verifique que la API esté en ejecución.';
  }
  return message || 'No se pudo iniciar sesión. Intente nuevamente.';
};

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { demoUsers, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Ingrese su correo institucional y su contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(getLoginError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (user: User) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(user.email, 'demo123');
      onSuccess();
    } catch (err) {
      setError(getLoginError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f3] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-6 sm:p-9 rounded border border-[#d5ddd6] shadow-sm space-y-6">
        {/* Encabezado Institucional */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-[#344a43] text-[#f2f5f0] mb-2 border border-[#1d2b28] shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] tracking-tight">
            Memoria Viva
          </h1>
          <p className="text-sm sm:text-base text-[#344a43] font-serif">Fundación Legado Vivo • Palmares, Costa Rica</p>
          <div className="text-xs text-[#4f6b62] font-medium pt-1">
            Plataforma de Preservación, Consentimiento y Transmisión Histórica
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-[#f9efed] border border-[#e7cbc5] text-[#a34a3d] text-sm rounded flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1d2b28] mb-1 font-serif">
              Correo Electrónico Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ejemplo@legadovivo.cr"
              autoComplete="username"
              required
              className="w-full min-h-[48px] px-3.5 text-sm sm:text-base border border-[#d5ddd6] rounded text-[#1d2b28] focus:border-[#2f5d50]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1d2b28] mb-1 font-serif">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full min-h-[48px] px-3.5 text-sm sm:text-base border border-[#d5ddd6] rounded text-[#1d2b28] focus:border-[#2f5d50]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-base font-bold"
          >
            {isSubmitting ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Selector de Cuentas Autorizadas */}
        <div className="pt-6 border-t border-[#dde3dc] space-y-3">
          <div className="text-xs font-bold text-[#5a6b64] uppercase tracking-wider text-center font-serif">
            Acceso Directo por Perfil Institucional
          </div>
          <p className="text-[11px] text-[#7a8b84] text-center">
            Cuentas de demostración · contraseña: <strong>demo123</strong>
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {demoUsers.map(user => {
              return (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  disabled={isSubmitting}
                  className="p-3 text-left border border-[#d5ddd6] rounded bg-[#fafaf7] hover:bg-[#eef1eb] hover:border-[#2f5d50] transition flex flex-col justify-between disabled:opacity-60"
                >
                  <span className="font-bold font-serif text-sm text-[#1d2b28] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#2f5d50]" />
                    {user.role}
                  </span>
                  <span className="text-xs text-[#5a6b64] truncate mt-1">
                    {user.full_name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
