from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Memoria, Consentimiento, Aporte, Procesamiento, Entidad, User

class PrivacyError(Exception):
    """Excepción base para violaciones a las reglas del dominio de privacidad."""
    pass

class ConsentRequiredError(PrivacyError):
    """Regla: Una memoria sin consentimiento registrado no se puede procesar, publicar ni usar en el narrador."""
    pass

class PrivacyAccessDeniedError(PrivacyError):
    """Regla: Control de visibilidad (privado, familiar, publico)."""
    pass

class CrossMemoryBoundaryViolation(PrivacyError):
    """Regla: Cada memoria tiene una sola base de conocimiento y los datos de memorias distintas nunca se mezclan."""
    pass


def has_valid_consent(memoria: Memoria) -> bool:
    """Verifica si la memoria cuenta con un consentimiento registrado y con hash de evidencia."""
    if not memoria or not memoria.consentimiento:
        return False
    consent = memoria.consentimiento
    return bool(consent.evidencia_hash and len(consent.evidencia_hash) >= 16 and consent.fecha_otorgamiento)


def can_view_memoria(user: Optional[User], memoria: Memoria) -> bool:
    """
    Evalúa si un usuario puede ver una memoria según la matriz de privacidad:
    - Administrador y Gestor de datos: Acceso de gobernanza y validación.
    - Digitalizador: Acceso a memorias que creó o públicas/familiares con consentimiento.
    - Usuario general / Anónimo:
        - 'publico': solo si tiene consentimiento válido registrado.
        - 'familiar': solo si es el creador o cuenta con acceso explícito.
        - 'privado': exclusivamente el creador o Administrador.
    """
    if not memoria:
        return False

    # Administrador tiene acceso de auditoría y gestión
    if user and user.role == "Administrador":
        return True

    # Gestor de datos necesita ver para validar aportes
    if user and user.role == "Gestor de datos":
        return True

    # Si es el autor/creador de la memoria
    if user and memoria.created_by_id == user.id:
        return True

    # Si no tiene consentimiento válido, nadie excepto Admin, Gestor y Creador puede verla
    if not has_valid_consent(memoria):
        return False

    # Reglas de visibilidad
    if memoria.visibilidad == "publico":
        return True
    elif memoria.visibilidad == "familiar":
        # En el MVP, usuarios con rol 'Usuario' o 'Digitalizador' creadores tienen acceso si son parte de la familia
        return user is not None and (user.role in ("Digitalizador", "Usuario") and user.id == memoria.created_by_id)
    else:  # privado
        return False


def enforce_can_view_memoria(user: Optional[User], memoria: Memoria):
    if not can_view_memoria(user, memoria):
        raise PrivacyAccessDeniedError("Acceso denegado: Esta memoria es privada o no cuenta con los permisos requeridos.")


def enforce_consent_for_processing(memoria: Memoria):
    """Regla: Una memoria sin consentimiento no se puede procesar."""
    if not has_valid_consent(memoria):
        raise ConsentRequiredError("Acción bloqueada: No se puede procesar contenido de una memoria sin consentimiento legal registrado.")


def enforce_consent_for_narrator(memoria: Memoria):
    """Regla: Una memoria sin consentimiento no se puede usar en el narrador."""
    if not has_valid_consent(memoria):
        raise ConsentRequiredError("Acción bloqueada: El narrador interactivo no puede activarse en memorias sin consentimiento.")


def filter_memorias_for_user(query, user: Optional[User]):
    """Filtro unificado para listar memorias según el rol y visibilidad."""
    if user and user.role in ("Administrador", "Gestor de datos"):
        return query
    
    if user and user.role == "Digitalizador":
        # El digitalizador ve lo que ha creado más lo público
        return [m for m in query if m.created_by_id == user.id or (m.visibilidad == "publico" and has_valid_consent(m))]

    # Usuario regular o no autenticado: solo memorias con consentimiento y visibilidad pública (o creadas por él)
    user_id = user.id if user else None
    return [
        m for m in query
        if has_valid_consent(m) and (
            m.visibilidad == "publico" or
            (user_id is not None and m.created_by_id == user_id)
        )
    ]


def get_validated_knowledge_for_memory(db: Session, memoria_id: int, user: Optional[User]):
    """
    Reglas inviolables:
    1. Aislamiento estricto: Filtra estrictamente por memoria_id. Los datos de memorias distintas nunca se mezclan.
    2. Consentimiento verificado: La memoria debe tener consentimiento válido.
    3. Validación estricta: SOLO el contenido validado por el Gestor de datos alimenta la base de conocimiento.
    """
    memoria = db.query(Memoria).filter(Memoria.id == memoria_id).first()
    if not memoria:
        return None

    enforce_can_view_memoria(user, memoria)
    enforce_consent_for_narrator(memoria)

    # Solo aportes con procesamiento en estado 'validado'
    aportes_validados = (
        db.query(Aporte)
        .join(Procesamiento, Aporte.id == Procesamiento.aporte_id)
        .filter(Aporte.memoria_id == memoria_id)
        .filter(Procesamiento.estado == "validado")
        .all()
    )

    # Entidades vinculadas a esta memoria
    entidades = (
        db.query(Entidad)
        .filter(Entidad.memoria_id == memoria_id)
        .all()
    )

    return {
        "memoria": memoria,
        "aportes_validados": aportes_validados,
        "entidades": entidades
    }
