import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, AuditoriaItem } from '../types';
import { api } from '../services/api';
import {
  Users,
  History,
  UserPlus,
  Filter,
  CheckCircle2,
  Building2
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
      return 'bg-[#eef6f0] text-[#2c6e4f] border-[#c4ded0]';
    }
    if (accion.includes('CARGA') || accion.includes('CREACION')) {
      return 'bg-[#f2f5f0] text-[#2f5d50] border-[#e4e9e2]';
    }
    return 'bg-[#fafaf7] text-[#344a43] border-[#d5ddd6]';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Encabezado Institucional Cálido */}
      <div className="bg-white p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2f5d50] uppercase tracking-wider font-serif">
            <Building2 className="w-4 h-4" />
            <span>Panel de Control & Trazabilidad Institucional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1d2b28] mt-1.5">
            Gobernanza & Bitácora de Auditoría
          </h1>
          <p className="text-sm sm:text-base text-[#344a43] mt-1 leading-relaxed">
            Registro cronológico de accesos, consentimientos, aportes y validaciones en la Fundación Legado Vivo.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'usuarios' && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary text-xs sm:text-sm"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>Registrar Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex items-center space-x-2 border-b border-[#dde3dc] pb-2 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`min-h-[44px] px-4 rounded flex items-center gap-2 transition ${
            activeTab === 'auditoria' ? 'bg-[#2f5d50] text-white shadow-xs font-bold' : 'text-[#344a43] hover:bg-[#eef1eb]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Bitácora de Auditoría ({auditorias.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`min-h-[44px] px-4 rounded flex items-center gap-2 transition ${
            activeTab === 'usuarios' ? 'bg-[#2f5d50] text-white shadow-xs font-bold' : 'text-[#344a43] hover:bg-[#eef1eb]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personal y Cuentas ({usuarios.length})</span>
        </button>
      </div>

      {/* Vista de Bitácora de Auditoría */}
      {activeTab === 'auditoria' && (
        <div className="bg-white rounded border border-[#d5ddd6] shadow-2xs overflow-hidden">
          {/* Barra de filtros de auditoría */}
          <div className="p-4 bg-[#fafaf7] border-b border-[#dde3dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#4f6b62]" />
              <span className="font-bold text-[#1d2b28] font-serif">Filtrar por evento:</span>
              <select
                value={filterAccion}
                onChange={e => setFilterAccion(e.target.value)}
                className="min-h-[38px] px-3 border border-[#d5ddd6] rounded bg-white text-[#1d2b28] font-medium"
              >
                <option value="todas">Todos los eventos</option>
                <option value="INICIO_SESION">Inicios de Sesión</option>
                <option value="CREACION_MEMORIA">Creación de Memorias</option>
                <option value="REGISTRO_CONSENTIMIENTO">Registro de Consentimiento</option>
                <option value="CARGA_APORTE">Carga de Aportes</option>
                <option value="VALIDACION_GESTOR_APROBADO">Validación Aprobada</option>
                <option value="CONSULTA_NARRADOR">Consultas al Narrador</option>
              </select>
            </div>

            <span className="text-xs text-[#5a6b64]">
              Mostrando {filteredLogs.length} eventos auditados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fbfbf8] text-[#344a43] uppercase font-bold border-b border-[#d5ddd6] font-serif">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Acción Auditada</th>
                  <th className="py-3 px-4">Entidad Afectada</th>
                  <th className="py-3 px-4">Detalles</th>
                  <th className="py-3 px-4">IP Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1eb]">
                {filteredLogs.map(log => {
                  let parsedDetalles = log.detalles;
                  try {
                    if (log.detalles) {
                      const obj = JSON.parse(log.detalles);
                      parsedDetalles = JSON.stringify(obj, null, 1).replace(/[\{\}"]/g, '');
                    }
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-[#fbfbf8]">
                      <td className="py-3 px-4 text-[#5a6b64] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#1d2b28]">
                        {log.usuario_email || 'Sistema'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold border ${getBadgeForAction(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#344a43]">
                        {log.entidad_tipo} {log.entidad_id && `#${log.entidad_id}`}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-[#5a6b64] max-w-xs truncate" title={log.detalles || ''}>
                        {parsedDetalles || '-'}
                      </td>
                      <td className="py-3 px-4 text-[#5a6b64] font-mono">
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
        <div className="bg-white rounded border border-[#d5ddd6] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-sm text-[#1d2b28]">
            <thead className="bg-[#fafaf7] text-xs font-bold text-[#344a43] uppercase tracking-wider border-b border-[#d5ddd6] font-serif">
              <tr>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">Correo Institucional</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef1eb]">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-[#fbfbf8]">
                  <td className="py-3.5 px-4 font-bold font-serif text-base text-[#1d2b28]">{u.full_name}</td>
                  <td className="py-3.5 px-4 text-xs text-[#5a6b64]">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#f2f5f0] text-[#2f5d50] border border-[#e4e9e2]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2c6e4f]">
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
        <div className="fixed inset-0 z-50 bg-[#1f352f]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded border border-[#d5ddd6] shadow-xl space-y-4">
            <h3 className="text-xl font-bold font-serif text-[#1d2b28]">
              Registrar Nuevo Personal
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-[#1d2b28] mb-1 font-serif">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-[#d5ddd6] rounded text-[#1d2b28]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1d2b28] mb-1 font-serif">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full min-h-[44px] px-3 border border-[#d5ddd6] rounded text-[#1d2b28]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1d2b28] mb-1 font-serif">Rol Asignado *</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full min-h-[44px] px-3 border border-[#d5ddd6] rounded bg-white text-[#1d2b28]"
                >
                  <option value="Usuario">Usuario (Ciudadano / Familiar)</option>
                  <option value="Digitalizador">Digitalizador (Carga y Entrevista)</option>
                  <option value="Gestor de datos">Gestor de datos (Curaduría)</option>
                  <option value="Administrador">Administrador (Control Total)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#eef1eb] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary min-h-[40px] px-4 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary min-h-[40px] px-4 text-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
