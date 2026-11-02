export type UserRole = 'Usuario' | 'Digitalizador' | 'Gestor de datos' | 'Administrador';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface Consentimiento {
  id: number;
  memoria_id: number;
  titular: string;
  modalidad: 'Escrita' | 'Grabada' | 'Firma digital' | 'Representante legal';
  evidencia_url?: string;
  evidencia_hash: string;
  fecha_otorgamiento: string;
  vigencia: string;
  alcance: string;
  notas?: string;
  created_at: string;
}

export interface Memoria {
  id: number;
  titular: string;
  alias?: string;
  descripcion?: string;
  lugar_origen: string;
  fecha_nacimiento?: string;
  tipo: 'Individual' | 'Familiar' | 'Comunitaria';
  estado: 'Borrador' | 'Activa' | 'Archivada';
  visibilidad: 'privado' | 'familiar' | 'publico';
  postuma: boolean;
  created_by_id: number;
  created_at: string;
  consentimiento?: Consentimiento;
  total_aportes?: number;
  aportes_validados?: number;
}

export interface ProcesamientoData {
  texto_extraido?: string;
  entidades_extraidas?: Array<{ nombre: string; tipo: string; fragmento: string; descripcion?: string }>;
  estado: 'pendiente' | 'validado' | 'rechazado';
  version_validada?: string;
}

export interface Aporte {
  id: number;
  memoria_id: number;
  autor: string;
  titulo: string;
  tipo: 'texto' | 'audio' | 'foto';
  estado: 'cargado' | 'en_proceso' | 'validado' | 'rechazado';
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_hash_sha256: string;
  contenido_original?: string;
  fecha_hecho_historico?: string;
  created_at: string;
  procesamiento?: ProcesamientoData;
}

export interface AportePendiente {
  aporte_id: number;
  memoria_id: number;
  memoria_titular: string;
  titulo: string;
  autor: string;
  tipo: 'texto' | 'audio' | 'foto';
  fecha_hecho_historico?: string;
  archivo_nombre?: string;
  archivo_hash_sha256: string;
  contenido_original?: string;
  texto_extraido?: string;
  entidades_detectadas: Array<{ nombre: string; tipo: string; fragmento: string }>;
  confianza_ia: number;
  estado: string;
  created_at: string;
}

export interface Entidad {
  id: number;
  memoria_id: number;
  nombre: string;
  tipo: string;
  fragmento?: string;
  descripcion?: string;
}

export interface FuenteCita {
  aporte_id: number;
  titulo?: string;
  autor: string;
  fecha: string;
  tipo?: string;
  archivo_hash_sha256?: string;
  contenido_original?: string;
  texto_validado?: string;
  cita: string;
}

export interface NarradorResponse {
  respuesta: string;
  fuentes: FuenteCita[];
  encontrado: boolean;
  es_ia: boolean;
  voice_config?: {
    lang: string;
    rate: number;
    pitch: number;
  };
}

export interface AuditoriaItem {
  id: number;
  usuario_email?: string;
  usuario_nombre?: string;
  accion: string;
  entidad_tipo: string;
  entidad_id?: number;
  detalles?: string;
  ip_origen: string;
  created_at: string;
}

