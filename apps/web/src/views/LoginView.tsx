import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { ShieldCheck, UserCheck, KeyRound, Building2 } from 'lucide-react';

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
      setError('Credenciales inválidas. Seleccione uno de los roles demo provistos abajo.');
    }
  };

  const handleQuickLogin = (user: User) => {
    loginAs(user);
    onSuccess();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="sap-card max-w-md w-full p-8 shadow-xl border-t-4 border-t-sap-blue">
        {/* Encabezado Fiori */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-sap-blue mb-3 border border-blue-200">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-sap-text tracking-tight">Fundación Legado Vivo</h1>
          <p className="text-sm text-sap-textMuted mt-1">Plataforma Patrimonial "Memoria Viva" (Palmares, CR)</p>
          <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-700">
            Control de Acceso y Gobernanza Institucional
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario tradicional */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-sap-text mb-1">
              Correo Electrónico Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ejemplo@legadovivo.cr"
              className="w-full h-11 px-3 text-sm border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sap-text mb-1">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3 text-sm border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
            />
          </div>

          <button
            type="submit"
            className="w-full sap-btn sap-btn-primary mt-2"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Selector Rápido de Demo (Para evaluación fluida) */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
            Acceso Rápido por Perfil (Demostración de 10 min)
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map(user => {
              const roleColors: Record<UserRole, string> = {
                'Digitalizador': 'hover:border-cyan-500 hover:bg-cyan-50 text-cyan-800',
                'Gestor de datos': 'hover:border-amber-500 hover:bg-amber-50 text-amber-800',
                'Usuario': 'hover:border-blue-500 hover:bg-blue-50 text-blue-800',
                'Administrador': 'hover:border-purple-500 hover:bg-purple-50 text-purple-800'
              };

              return (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className={`p-2.5 text-left border border-slate-200 rounded text-xs transition flex flex-col justify-between ${roleColors[user.role]}`}
                >
                  <span className="font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate mt-1">
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
