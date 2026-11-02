import {
  User,
  Memoria,
  Consentimiento,
  Aporte,
  AportePendiente,
  NarradorResponse,
  AuditoriaItem
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let currentUserEmail: string = 'usuario@legadovivo.cr';

export function setActiveUserEmail(email: string) {
  currentUserEmail = email;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'X-User-Email': currentUserEmail,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'Error en la solicitud al servidor';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Ignora si no es JSON
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string): Promise<User> =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: (): Promise<User> => request('/api/auth/me'),

  getDemoUsers: (): Promise<User[]> => request('/api/auth/demo-users'),

  // Memorias
  getMemorias: (visibilidad?: string, estado?: string): Promise<Memoria[]> => {
    const params = new URLSearchParams();
    if (visibilidad) params.append('visibilidad', visibilidad);
    if (estado) params.append('estado', estado);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/memorias${qs}`);
  },

  getMemoria: (id: number): Promise<Memoria> => request(`/api/memorias/${id}`),

  createMemoria: (data: Partial<Memoria>): Promise<Memoria> =>
    request('/api/memorias', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateMemoria: (id: number, data: Partial<Memoria>): Promise<Memoria> =>
    request(`/api/memorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Consentimientos
  registerConsent: (data: {
    memoria_id: number;
    titular: string;
    modalidad: string;
    evidencia_url?: string;
    evidencia_hash: string;
    fecha_otorgamiento: string;
    vigencia?: string;
    alcance?: string;
    notas?: string;
  }): Promise<Consentimiento> =>
    request('/api/consentimientos', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getConsentForMemoria: (memoriaId: number): Promise<Consentimiento> =>
    request(`/api/consentimientos/memoria/${memoriaId}`),

  // Aportes
  createAporte: (data: {
    memoria_id: number;
    autor: string;
    titulo: string;
    tipo: 'texto' | 'audio' | 'foto';
    contenido_original?: string;
    archivo_nombre?: string;
    archivo_hash_sha256?: string;
    fecha_hecho_historico?: string;
  }): Promise<Aporte> =>
    request('/api/aportes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAportesByMemoria: (memoriaId: number): Promise<Aporte[]> =>
    request(`/api/aportes/memoria/${memoriaId}`),

  // Validación (Gestor de datos)
  getPendientesValidacion: (memoriaId?: number): Promise<AportePendiente[]> => {
    const qs = memoriaId ? `?memoria_id=${memoriaId}` : '';
    return request(`/api/validacion/pendientes${qs}`);
  },

  aprobarAporte: (data: {
    aporte_id: number;
    estado: 'validado';
    version_validada: string;
    notas_validacion?: string;
    entidades_aprobadas?: Array<{ nombre: string; tipo: string; fragmento: string; descripcion?: string }>;
  }) =>
    request('/api/validacion/aprobar', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  rechazarAporte: (data: {
    aporte_id: number;
    estado: 'rechazado';
    version_validada: string;
    notas_validacion?: string;
  }) =>
    request('/api/validacion/rechazar', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Búsqueda
  search: (q: string, tipo?: string, memoriaId?: number) => {
    const params = new URLSearchParams({ q });
    if (tipo) params.append('tipo_aporte', tipo);
    if (memoriaId) params.append('memoria_id', memoriaId.toString());
    return request<{
      query: string;
      total: number;
      memorias: any[];
      aportes: any[];
      entidades: any[];
    }>(`/api/busqueda?${params.toString()}`);
  },

  // Narrador
  preguntarNarrador: (memoria_id: number, pregunta: string): Promise<NarradorResponse> =>
    request('/api/narrador/preguntar', {
      method: 'POST',
      body: JSON.stringify({ memoria_id, pregunta })
    }),

  // Admin
  getUsuarios: (): Promise<User[]> => request('/api/admin/usuarios'),

  createUsuario: (data: { email: string; full_name: string; password: string; role: string }): Promise<User> =>
    request('/api/admin/usuarios', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAuditoria: (limit: number = 50, accion?: string): Promise<AuditoriaItem[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (accion) params.append('accion', accion);
    return request(`/api/admin/auditoria?${params.toString()}`);
  }
};

