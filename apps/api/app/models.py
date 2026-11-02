from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

memoria_coleccion = Table(
    "memoria_coleccion",
    Base.metadata,
    Column("memoria_id", Integer, ForeignKey("memorias.id", ondelete="CASCADE"), primary_key=True),
    Column("coleccion_id", Integer, ForeignKey("colecciones.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # Usuario, Digitalizador, Gestor de datos, Administrador
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    memorias_creadas = relationship("Memoria", back_populates="creador")
    aportes_subidos = relationship("Aporte", back_populates="subido_por")
    auditorias = relationship("BitacoraAuditoria", back_populates="usuario")

class Memoria(Base):
    __tablename__ = "memorias"

    id = Column(Integer, primary_key=True, index=True)
    titular = Column(String(255), nullable=False)
    alias = Column(String(255), nullable=True)
    descripcion = Column(Text, nullable=True)
    lugar_origen = Column(String(255), default="Palmares, Costa Rica")
    fecha_nacimiento = Column(String(50), nullable=True)
    tipo = Column(String(50), default="Individual")  # Individual, Familiar, Comunitaria
    estado = Column(String(50), default="Borrador")  # Borrador, Activa, Archivada
    visibilidad = Column(String(50), default="privado")  # privado, familiar, publico
    postuma = Column(Boolean, default=False)
    created_by_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creador = relationship("User", back_populates="memorias_creadas")
    consentimiento = relationship("Consentimiento", back_populates="memoria", uselist=False, cascade="all, delete-orphan")
    aportes = relationship("Aporte", back_populates="memoria", cascade="all, delete-orphan")
    entidades = relationship("Entidad", back_populates="memoria", cascade="all, delete-orphan")
    relaciones = relationship("Relacion", back_populates="memoria", cascade="all, delete-orphan")
    colecciones = relationship("Coleccion", secondary=memoria_coleccion, back_populates="memorias")

class Consentimiento(Base):
    __tablename__ = "consentimientos"

    id = Column(Integer, primary_key=True, index=True)
    memoria_id = Column(Integer, ForeignKey("memorias.id", ondelete="CASCADE"), unique=True, nullable=False)
    titular = Column(String(255), nullable=False)
    modalidad = Column(String(50), nullable=False)  # Escrita, Grabada, Firma digital, Representante legal
    evidencia_url = Column(String(500), nullable=True)
    evidencia_hash = Column(String(64), nullable=False)  # SHA-256
    fecha_otorgamiento = Column(String(50), nullable=False)
    vigencia = Column(String(100), default="Indefinida")
    alcance = Column(Text, default="Preservación patrimonial y narración asistida por IA")
    notas = Column(Text, nullable=True)
    registrado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    memoria = relationship("Memoria", back_populates="consentimiento")
    registrado_por = relationship("User")

class Aporte(Base):
    __tablename__ = "aportes"

    id = Column(Integer, primary_key=True, index=True)
    memoria_id = Column(Integer, ForeignKey("memorias.id", ondelete="CASCADE"), nullable=False)
    autor = Column(String(255), nullable=False)
    titulo = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # texto, audio, foto
    estado = Column(String(50), default="cargado")  # cargado, en_proceso, validado, rechazado
    archivo_url = Column(String(500), nullable=True)
    archivo_nombre = Column(String(255), nullable=True)
    archivo_hash_sha256 = Column(String(64), nullable=False)  # SHA-256 inmutable
    contenido_original = Column(Text, nullable=True)
    fecha_hecho_historico = Column(String(50), nullable=True)
    subido_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    memoria = relationship("Memoria", back_populates="aportes")
    subido_por = relationship("User", back_populates="aportes_subidos")
    procesamiento = relationship("Procesamiento", back_populates="aporte", uselist=False, cascade="all, delete-orphan")
    entidades_asociadas = relationship("Entidad", back_populates="aporte_origen")

class Procesamiento(Base):
    __tablename__ = "procesamientos"

    id = Column(Integer, primary_key=True, index=True)
    aporte_id = Column(Integer, ForeignKey("aportes.id", ondelete="CASCADE"), unique=True, nullable=False)
    texto_extraido = Column(Text, nullable=True)
    entidades_extraidas = Column(Text, nullable=True)  # JSON con lista de entidades extraídas
    confianza_ia = Column(Float, default=0.95)
    estado = Column(String(50), default="pendiente")  # pendiente, validado, rechazado
    version_validada = Column(Text, nullable=True)  # Curación del Gestor de datos
    gestor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    notas_validacion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    aporte = relationship("Aporte", back_populates="procesamiento")
    gestor = relationship("User")

class Entidad(Base):
    __tablename__ = "entidades"

    id = Column(Integer, primary_key=True, index=True)
    memoria_id = Column(Integer, ForeignKey("memorias.id", ondelete="CASCADE"), nullable=False)
    aporte_origen_id = Column(Integer, ForeignKey("aportes.id", ondelete="SET NULL"), nullable=True)
    nombre = Column(String(255), nullable=False)
    tipo = Column(String(50), nullable=False)  # Persona, Lugar, Evento, Oficio, Tradición
    fragmento = Column(Text, nullable=True)
    descripcion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    memoria = relationship("Memoria", back_populates="entidades")
    aporte_origen = relationship("Aporte", back_populates="entidades_asociadas")

class Relacion(Base):
    __tablename__ = "relaciones"

    id = Column(Integer, primary_key=True, index=True)
    memoria_id = Column(Integer, ForeignKey("memorias.id", ondelete="CASCADE"), nullable=False)
    entidad_origen_id = Column(Integer, ForeignKey("entidades.id", ondelete="CASCADE"), nullable=False)
    entidad_destino_id = Column(Integer, ForeignKey("entidades.id", ondelete="CASCADE"), nullable=False)
    tipo_relacion = Column(String(100), nullable=False)
    aporte_origen_id = Column(Integer, ForeignKey("aportes.id", ondelete="SET NULL"), nullable=True)

    memoria = relationship("Memoria", back_populates="relaciones")
    entidad_origen = relationship("Entidad", foreign_keys=[entidad_origen_id])
    entidad_destino = relationship("Entidad", foreign_keys=[entidad_destino_id])

class Coleccion(Base):
    __tablename__ = "colecciones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    memorias = relationship("Memoria", secondary=memoria_coleccion, back_populates="colecciones")

class BitacoraAuditoria(Base):
    __tablename__ = "bitacora_auditoria"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    accion = Column(String(100), nullable=False)
    entidad_tipo = Column(String(50), nullable=False)
    entidad_id = Column(Integer, nullable=True)
    detalles = Column(Text, nullable=True)  # JSON
    ip_origen = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("User", back_populates="auditorias")
