import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, AuditoriaItem } from '../types';
import { api } from '../services/api';
import {
  ShieldAlert,
  Users,
  History,
  UserPlus,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  Terminal
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'auditoria'>('auditoria');
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Nuevo usuario modal
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('demo123');
  const [newRole, setNewRole] = useState<'Usuario' | 'Digitalizador' | 'Gestor de datos' | 'Administrador'>('Usuario');
  const [filterAccion, setFilterAccion] = useState<string>('todas');

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.getUsuarios().catch(() => []),
      api.getAuditoria(100).catch(() => [])
    ])
      .then(([users, logs]) => {
        setUsuarios(users);
        setAuditorias(logs);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUsuario({
        email: newEmail,
        full_name: newName,
        password: newPassword,
        role: newRole
      });
      setShowModal(false);
      setNewEmail('');
      setNewName('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creando usuario');
    }
  };

  const filteredLogs = auditorias.filter(log => {
    if (filterAccion === 'todas') return true;
    return log.accion === filterAccion;
  });

  const getBadgeForAction = (accion: string) => {
    if (accion.includes('CONSENTIMIENTO') || accion.includes('VALIDACION')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    if (accion.includes('CARGA') || accion.includes('CREACION')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (accion.includes('CONSULTA')) {
      return 'bg-teal-100 text-teal-800 border-teal-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado Fiori */}
      <div className="bg-white p-6 rounded-lg border border-sap-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-700 uppercase tracking-wider">
            <span>Panel de Control y Trazabilidad</span>
            <span>•</span>
            <span>Gobernanza Institucional</span>
          </div>
          <h1 className="text-2xl font-bold text-sap-text mt-1">P08 Administración & Bitácora de Auditoría</h1>
          <p className="text-sm text-sap-textMuted mt-0.5">
            Registro inmutable de accesos, consentimientos, aportes y validaciones en la Fundación Legado Vivo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'usuarios' && (
            <button
              onClick={() => setShowModal(true)}
              className="sap-btn sap-btn-primary text-xs flex items-center gap-1.5 shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Fiori */}
      <div className="flex items-center space-x-2 border-b border-sap-border pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${
            activeTab === 'auditoria' ? 'bg-sap-blue text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bitácora de Auditoría Inmutable ({auditorias.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${
            activeTab === 'usuarios' ? 'bg-sap-blue text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios y Roles ({usuarios.length})</span>
        </button>
      </div>

      {/* Vista de Bitácora de Auditoría */}
      {activeTab === 'auditoria' && (
        <div className="sap-card overflow-hidden">
          {/* Barra de filtros de auditoría */}
          <div className="p-4 bg-slate-50 border-b border-sap-border flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-700">Filtrar por evento:</span>
              <select
                value={filterAccion}
                onChange={e => setFilterAccion(e.target.value)}
                className="h-9 px-2 border border-sap-border rounded bg-white font-medium"
              >
                <option value="todas">Todos los eventos</option>
                <option value="INICIO_SESION">Inicios de Sesión</option>
                <option value="CREACION_MEMORIA">Creación de Memorias</option>
                <option value="REGISTRO_CONSENTIMIENTO">Registro de Consentimiento</option>
                <option value="CARGA_APORTE">Carga de Aportes</option>
                <option value="VALIDACION_GESTOR_APROBADO">Validación Aprobada</option>
                <option value="CONSULTA_NARRADOR">Consultas al Narrador IA</option>
              </select>
            </div>

            <span className="text-slate-500">
              Mostrando {filteredLogs.length} eventos auditados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-sap-border">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Acción Auditada</th>
                  <th className="py-3 px-4">Entidad Afectada</th>
                  <th className="py-3 px-4">Detalles</th>
                  <th className="py-3 px-4">IP Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sap-border font-mono">
                {filteredLogs.map(log => {
                  let parsedDetalles = log.detalles;
                  try {
                    if (log.detalles) {
                      const obj = JSON.parse(log.detalles);
                      parsedDetalles = JSON.stringify(obj, null, 1).replace(/[\{\}"]/g, '');
                    }
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                        {log.usuario_email || 'Sistema'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeForAction(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {log.entidad_tipo} {log.entidad_id && `#${log.entidad_id}`}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate" title={log.detalles || ''}>
                        {parsedDetalles || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {log.ip_origen}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Usuarios y Roles */}
      {activeTab === 'usuarios' && (
        <div className="sap-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-sap-border">
              <tr>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">Correo Institucional</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sap-border">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-sap-text">{u.full_name}</td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-sap-blue border border-blue-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Registrar Usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="sap-card max-w-md w-full p-6 shadow-2xl border-t-4 border-t-purple-600 animate-in fade-in zoom-in duration-150">
            <h2 className="text-xl font-bold text-sap-text mb-1">Registrar Nuevo Usuario</h2>
            <p className="text-xs text-slate-500 mb-4">
              Asigne el perfil correspondiente según las funciones en la Fundación Legado Vivo.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej: Licda. María Elena Brenes"
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="brenes@legadovivo.cr"
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol Operativo *</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full h-11 px-3 border border-sap-border rounded bg-white font-medium"
                >
                  <option value="Usuario">Usuario (Consultas y Narrador)</option>
                  <option value="Digitalizador">Digitalizador (Creación y Carga)</option>
                  <option value="Gestor de datos">Gestor de datos (Curaduría y Validación)</option>
                  <option value="Administrador">Administrador (Control Total y Auditoría)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full h-11 px-3 border border-sap-border rounded focus:border-sap-blue focus:ring-1 focus:ring-sap-blue"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="sap-btn sap-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="sap-btn sap-btn-primary"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

