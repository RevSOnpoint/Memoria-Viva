import sys
import os
import pytest

sys.path.insert(0, os.path.abspath("apps/api"))
sys.path.insert(0, os.path.abspath("."))

from app.database import SessionLocal, Base, engine
from app.models import User, Memoria, Consentimiento, Aporte, Procesamiento, Entidad
from app.privacy import (
    has_valid_consent,
    can_view_memoria,
    enforce_consent_for_processing,
    enforce_consent_for_narrator,
    filter_memorias_for_user,
    get_validated_knowledge_for_memory,
    ConsentRequiredError,
    PrivacyAccessDeniedError
)
from app.ai.mock_services import MockLLMNarratorService

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_consent_verification(db_session):
    """Regla: Comprobación estricta de consentimiento legal con hash de evidencia."""
    # Don Chepe tiene consentimiento válido
    chepe = db_session.query(Memoria).filter(Memoria.alias == "Don Chepe").first()
    assert chepe is not None
    assert has_valid_consent(chepe) is True

    # Memoria sin consentimiento
    mem_sin_consent = Memoria(
        titular="Persona Sin Consentimiento",
        visibilidad="privado",
        created_by_id=1
    )
    assert has_valid_consent(mem_sin_consent) is False

def test_cannot_process_without_consent():
    """Regla: Una memoria sin consentimiento registrado no se puede procesar."""
    mem_sin_consent = Memoria(titular="Test Sin Consentimiento", visibilidad="privado", created_by_id=1)
    with pytest.raises(ConsentRequiredError) as exc_info:
        enforce_consent_for_processing(mem_sin_consent)
    assert "No se puede procesar contenido" in str(exc_info.value)

def test_cannot_narrate_without_consent():
    """Regla: Una memoria sin consentimiento no se puede usar en el narrador."""
    mem_sin_consent = Memoria(titular="Test Sin Consentimiento", visibilidad="privado", created_by_id=1)
    with pytest.raises(ConsentRequiredError) as exc_info:
        enforce_consent_for_narrator(mem_sin_consent)
    assert "El narrador interactivo no puede activarse" in str(exc_info.value)

def test_privacy_matrix_roles_and_visibility(db_session):
    """Regla: Visibilidad privada, familiar y pública según el rol."""
    usuario = db_session.query(User).filter(User.role == "Usuario").first()
    admin = db_session.query(User).filter(User.role == "Administrador").first()
    gestor = db_session.query(User).filter(User.role == "Gestor de datos").first()

    chepe = db_session.query(Memoria).filter(Memoria.alias == "Don Chepe").first()
    privada = db_session.query(Memoria).filter(Memoria.visibilidad == "privado").first()

    # Usuario regular puede ver a Don Chepe (público con consentimiento)
    assert can_view_memoria(usuario, chepe) is True

    # Usuario regular NO puede ver expediente privado
    if privada:
        assert can_view_memoria(usuario, privada) is False
        # Administrador y Gestor sí pueden ver para fines de auditoría y gobernanza
        assert can_view_memoria(admin, privada) is True
        assert can_view_memoria(gestor, privada) is True

def test_memory_isolation_and_validated_knowledge_only(db_session):
    """Regla: Los datos de memorias distintas NUNCA se mezclan y SOLO contenido validado alimenta el conocimiento."""
    chepe = db_session.query(Memoria).filter(Memoria.alias == "Don Chepe").first()
    carmen = db_session.query(Memoria).filter(Memoria.alias == "Doña Carmen").first()
    usuario = db_session.query(User).filter(User.role == "Usuario").first()

    chepe_knowledge = get_validated_knowledge_for_memory(db_session, chepe.id, usuario)
    carmen_knowledge = get_validated_knowledge_for_memory(db_session, carmen.id, usuario)

    chepe_aportes = chepe_knowledge["aportes_validados"]
    carmen_aportes = carmen_knowledge["aportes_validados"]

    # Todos los aportes de Don Chepe pertenecen estrictamente a su memoria_id
    for ap in chepe_aportes:
        assert ap.memoria_id == chepe.id
        assert ap.procesamiento.estado == "validado"

    # Todos los aportes de Doña Carmen pertenecen estrictamente a su memoria_id
    for ap in carmen_aportes:
        assert ap.memoria_id == carmen.id
        assert ap.procesamiento.estado == "validado"

    # No hay intersección de aportes entre Don Chepe y Doña Carmen
    chepe_ids = {a.id for a in chepe_aportes}
    carmen_ids = {a.id for a in carmen_aportes}
    assert chepe_ids.isdisjoint(carmen_ids)

def test_narrator_strict_fallback_no_hallucination():
    """Regla: Si no tiene información, responde 'no cuento con esa información' sin inventar."""
    service = MockLLMNarratorService()
    fragments = [
        {
            "aporte_id": 1,
            "autor": "José Ángel González",
            "fecha": "1945",
            "titulo": "Trapiche",
            "texto": "Recuerdo el trapiche de bueyes en Zaragoza y la molienda de dulce de tapa."
        }
    ]

    # Pregunta sobre algo no existente en la base de conocimiento
    result = service.ask(
        question="¿A qué año viajó a París a estudiar astrofísica moderna?",
        memoria_titular="José Ángel González Chaves",
        knowledge_fragments=fragments
    )

    assert result["encontrado"] is False
    assert result["es_ia"] is True
    assert "no cuento con esa información" in result["respuesta"].lower()
    assert len(result["fuentes"]) == 0

def test_narrator_accurate_citation_and_identification():
    """Regla: El narrador se identifica siempre como IA y cita la fuente (aporte, autor y fecha)."""
    service = MockLLMNarratorService()
    fragments = [
        {
            "aporte_id": 10,
            "autor": "Don Chepe",
            "fecha": "1954",
            "titulo": "Trapiche de bueyes",
            "archivo_hash_sha256": "abc1234567890",
            "contenido_original": "Trapiche dulce en Zaragoza",
            "texto": "En Zaragoza de Palmares mi abuelo tenía un trapiche movido por bueyes."
        }
    ]

    result = service.ask(
        question="¿Dónde estaba el trapiche de bueyes?",
        memoria_titular="José Ángel González Chaves",
        knowledge_fragments=fragments
    )

    assert result["encontrado"] is True
    assert result["es_ia"] is True
    assert "asistente de inteligencia artificial" in result["respuesta"].lower()
    assert "[Aporte #10 - Don Chepe, 1954]" in result["respuesta"]
    assert len(result["fuentes"]) == 1
    assert result["fuentes"][0]["aporte_id"] == 10
    assert result["fuentes"][0]["archivo_hash_sha256"] == "abc1234567890"
