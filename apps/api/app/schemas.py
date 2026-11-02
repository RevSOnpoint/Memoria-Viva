from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- User & Auth ---
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# --- Consentimiento ---
class ConsentimientoCreate(BaseModel):
    memoria_id: int
    titular: str
    modalidad: str  # Escrita, Grabada, Firma digital, Representante legal
    evidencia_url: Optional[str] = None
    evidencia_hash: str
    fecha_otorgamiento: str
    vigencia: Optional[str] = "Indefinida"
    alcance: Optional[str] = "Preservación patrimonial y narración asistida por IA"
    notas: Optional[str] = None

class ConsentimientoOut(BaseModel):
    id: int
    memoria_id: int
    titular: str
    modalidad: str
    evidencia_url: Optional[str] = None
    evidencia_hash: str
    fecha_otorgamiento: str
    vigencia: str
    alcance: str
    notas: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Memoria ---
class MemoriaCreate(BaseModel):
    titular: str
    alias: Optional[str] = None
    descripcion: Optional[str] = None
    lugar_origen: Optional[str] = "Palmares, Costa Rica"
    fecha_nacimiento: Optional[str] = None
    tipo: Optional[str] = "Individual"
    visibilidad: Optional[str] = "privado"
    postuma: Optional[bool] = False

class MemoriaUpdate(BaseModel):
    titular: Optional[str] = None
    alias: Optional[str] = None
    descripcion: Optional[str] = None
    lugar_origen: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    tipo: Optional[str] = None
    visibilidad: Optional[str] = None
    estado: Optional[str] = None
    postuma: Optional[bool] = None

class EntidadOut(BaseModel):
    id: int
    nombre: str
    tipo: str
    fragmento: Optional[str] = None
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True

class AporteOut(BaseModel):
    id: int
    memoria_id: int
    autor: str
    titulo: str
    tipo: str
    estado: str
    archivo_url: Optional[str] = None
    archivo_nombre: Optional[str] = None
    archivo_hash_sha256: str
    contenido_original: Optional[str] = None
    fecha_hecho_historico: Optional[str] = None
    created_at: datetime
    procesamiento: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class MemoriaOut(BaseModel):
    id: int
    titular: str
    alias: Optional[str] = None
    descripcion: Optional[str] = None
    lugar_origen: str
    fecha_nacimiento: Optional[str] = None
    tipo: str
    estado: str
    visibilidad: str
    postuma: bool
    created_by_id: int
    created_at: datetime
    consentimiento: Optional[ConsentimientoOut] = None
    total_aportes: Optional[int] = 0
    aportes_validados: Optional[int] = 0

    class Config:
        from_attributes = True

# --- Aporte y Procesamiento ---
class AporteCreate(BaseModel):
    memoria_id: int
    autor: str
    titulo: str
    tipo: str  # texto, audio, foto
    contenido_original: Optional[str] = None
    archivo_nombre: Optional[str] = None
    archivo_hash_sha256: Optional[str] = None
    fecha_hecho_historico: Optional[str] = None

class ValidacionAction(BaseModel):
    aporte_id: int
    estado: str  # validado, rechazado
    version_validada: str
    notas_validacion: Optional[str] = None
    entidades_aprobadas: Optional[List[Dict[str, str]]] = None

# --- Narrador ---
class PreguntaRequest(BaseModel):
    memoria_id: int
    pregunta: str

class NarradorResponse(BaseModel):
    respuesta: str
    fuentes: List[Dict[str, Any]]
    encontrado: bool
    es_ia: bool
    voice_config: Optional[Dict[str, Any]] = None

# --- Auditoria ---
class AuditoriaOut(BaseModel):
    id: int
    usuario_email: Optional[str] = None
    accion: str
    entidad_tipo: str
    entidad_id: Optional[int] = None
    detalles: Optional[str] = None
    ip_origen: str
    created_at: datetime

    class Config:
        from_attributes = True

