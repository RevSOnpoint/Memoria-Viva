import sys
import os
import pytest

sys.path.insert(0, os.path.abspath("apps/api"))
sys.path.insert(0, os.path.abspath("."))

from app.database import SessionLocal, Base, engine
from app.models import User, Memoria, Consentimiento, Aporte, Procesamiento
from app.privacy import (
    can_view_memoria,
    enforce_consent_for_processing,
    enforce_consent_for_narrator,
    get_validated_knowledge_for_memory
)
from app.ai.mock_services import MockLLMNarratorService

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_full_acceptance_criterion_flow(db_session):
    """
    Criterio de aceptación de Specs.md:
    1. Digitalizador crea una memoria con consentimiento.
    2. Carga un relato.
    3. El Gestor lo revisa y lo valida.
    4. Un Usuario le pregunta al narrador, recibe una respuesta con fuente y abre el original.
    5. Una pregunta sin información recibe 'no cuento con esa información'.
    6. Una memoria privada no aparece para otro usuario.
    """
    digi = db_session.query(User).filter(User.role == "Digitalizador").first()
    gestor = db_session.query(User).filter(User.role == "Gestor de datos").first()
    usuario = db_session.query(User).filter(User.role == "Usuario").first()

    # Paso 1: Digitalizador crea memoria con consentimiento
    mem = Memoria(
        titular="Doña Rosalía Salazar Méndez",
        alias="Doña Rosalía",
        descripcion="Bordadora y panadera de pan casero en Palmares.",
        lugar_origen="Zaragoza, Palmares, Costa Rica",
        fecha_nacimiento="1935",
        tipo="Individual",
        estado="Activa",
        visibilidad="publico",
        created_by_id=digi.id
    )
    db_session.add(mem)
    db_session.flush()

    consent = Consentimiento(
        memoria_id=mem.id,
        titular=mem.titular,
        modalidad="Firma digital",
        evidencia_url="evidencias/rosalia_consent.pdf",
        evidencia_hash="d41d8cd98f00b204e9800998ecf8427e0123456789abcdef",
        fecha_otorgamiento="2024-01-15",
        vigencia="Indefinida",
        alcance="Preservación oral y narración IA",
        registrado_por_id=digi.id
    )
    db_session.add(consent)
    db_session.flush()

    # Comprobar que no hay bloqueo de consentimiento
    enforce_consent_for_processing(mem)

    # Paso 2: Carga un relato (Texto/Audio)
    relato_original = "Horneábamos el pan casero en horno de leña los viernes antes de las cuatro de la madrugada para llevarlo a la feria en Palmares."
    aporte = Aporte(
        memoria_id=mem.id,
        autor=mem.titular,
        titulo="El horno de leña y el pan casero palmareño",
        tipo="texto",
        estado="cargado",
        archivo_nombre="pan_rosalia.txt",
        archivo_hash_sha256="aabbccddeeff00112233445566778899aabbccddeeff0011",
        contenido_original=relato_original,
        fecha_hecho_historico="1958",
        subido_por_id=digi.id
    )
    db_session.add(aporte)
    db_session.flush()

    proc = Procesamiento(
        aporte_id=aporte.id,
        texto_extraido=relato_original,
        estado="pendiente",
        version_validada=relato_original
    )
    db_session.add(proc)
    db_session.flush()

    # Antes de que el Gestor valide, el relato NO está en la base de conocimiento
    know_before = get_validated_knowledge_for_memory(db_session, mem.id, usuario)
    assert len(know_before["aportes_validados"]) == 0

    # Paso 3: El Gestor lo revisa y lo valida
    proc.estado = "validado"
    proc.version_validada = relato_original + " (Validado y cotejado)."
    proc.gestor_id = gestor.id
    aporte.estado = "validado"
    db_session.commit()

    # Ahora sí forma parte de la base de conocimiento validada
    know_after = get_validated_knowledge_for_memory(db_session, mem.id, usuario)
    assert len(know_after["aportes_validados"]) == 1

    # Paso 4: Usuario le pregunta al narrador
    llm = MockLLMNarratorService()
    frags = [
        {
            "aporte_id": aporte.id,
            "autor": aporte.autor,
            "fecha": aporte.fecha_hecho_historico,
            "titulo": aporte.titulo,
            "archivo_hash_sha256": aporte.archivo_hash_sha256,
            "contenido_original": aporte.contenido_original,
            "texto": proc.version_validada
        }
    ]

    res_q1 = llm.ask(
        question="¿A qué hora horneaban el pan casero en Palmares?",
        memoria_titular=mem.titular,
        knowledge_fragments=frags
    )

    assert res_q1["encontrado"] is True
    assert res_q1["es_ia"] is True
    assert len(res_q1["fuentes"]) == 1
    assert res_q1["fuentes"][0]["archivo_hash_sha256"] == aporte.archivo_hash_sha256
    # Abre y verifica el contenido original
    assert res_q1["fuentes"][0]["contenido_original"] == relato_original

    # Paso 5: Pregunta sin información recibe 'no cuento con esa información'
    res_q2 = llm.ask(
        question="¿Cuál era el modelo de avión supersónico que pilotaba?",
        memoria_titular=mem.titular,
        knowledge_fragments=frags
    )
    assert res_q2["encontrado"] is False
    assert "no cuento con esa información" in res_q2["respuesta"].lower()

    # Paso 6: Memoria privada no aparece para otro usuario
    mem_priv = Memoria(
        titular="Familia Pérez Secreta",
        visibilidad="privado",
        created_by_id=digi.id
    )
    assert can_view_memoria(usuario, mem_priv) is False
