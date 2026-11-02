import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { ShieldCheck, UserCheck, Building2 } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { demoUsers, loginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = demoUsers.find(u => u.email === email);
    if (match) {
      loginAs(match);
      onSuccess();
    } else {
      setError('Credenciales inválidas. Seleccione una de las cuentas autorizadas.');
    }
  };

  const handleQuickLogin = (user: User) => {
    loginAs(user);
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-6 sm:p-9 rounded border border-[#d8ccba] shadow-sm space-y-6">
        {/* Encabezado Institucional */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-[#442a17] text-[#fef6ee] mb-2 border border-[#2a1a0f] shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#261b12] tracking-tight">
            Memoria Viva
          </h1>
          <p className="text-sm sm:text-base text-[#442a17] font-serif">Fundación Legado Vivo • Palmares, Costa Rica</p>
          <div className="text-xs text-[#8c6239] font-medium pt-1">
            Plataforma de Preservación, Consentimiento y Transmisión Histórica
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-[#fdf2f2] border border-[#f0c2c2] text-[#a81c1c] text-sm rounded flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#261b12] mb-1 font-serif">
              Correo Electrónico Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ejemplo@legadovivo.cr"
              className="w-full min-h-[48px] px-3.5 text-sm sm:text-base border border-[#d8ccba] rounded text-[#261b12] focus:border-[#c05600]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#261b12] mb-1 font-serif">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[48px] px-3.5 text-sm sm:text-base border border-[#d8ccba] rounded text-[#261b12] focus:border-[#c05600]"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full text-base font-bold"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Selector de Cuentas Autorizadas */}
        <div className="pt-6 border-t border-[#e3d9cb] space-y-3">
          <div className="text-xs font-bold text-[#665546] uppercase tracking-wider text-center font-serif">
            Acceso Directo por Perfil Institucional
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {demoUsers.map(user => {
              return (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="p-3 text-left border border-[#d8ccba] rounded bg-[#fcf8f3] hover:bg-[#f4ede2] hover:border-[#c05600] transition flex flex-col justify-between"
                >
                  <span className="font-bold font-serif text-sm text-[#261b12] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#c05600]" />
                    {user.role}
                  </span>
                  <span className="text-xs text-[#665546] truncate mt-1">
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
