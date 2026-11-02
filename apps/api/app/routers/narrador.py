from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Memoria, User
from app.schemas import PreguntaRequest, NarradorResponse
from app.routers.auth import get_current_user
from app.privacy import get_validated_knowledge_for_memory, PrivacyError, ConsentRequiredError, PrivacyAccessDeniedError
from app.ai import get_llm_narrator_service, get_voice_service
from app.audit import log_audit

router = APIRouter(prefix="/api/narrador", tags=["Narrador Interactivo"])

@router.post("/preguntar", response_model=NarradorResponse)
def preguntar_narrador(
    data: PreguntaRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    try:
        knowledge = get_validated_knowledge_for_memory(db, data.memoria_id, current_user)
    except ConsentRequiredError as ce:
        raise HTTPException(status_code=403, detail=str(ce))
    except PrivacyAccessDeniedError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except PrivacyError as e:
        raise HTTPException(status_code=403, detail=str(e))

    if not knowledge or not knowledge.get("memoria"):
        raise HTTPException(status_code=404, detail="Memoria no encontrada o no accesible.")

    memoria: Memoria = knowledge["memoria"]
    aportes_validados = knowledge["aportes_validados"]

    # Preparar fragmentos validados para el servicio RAG/Narrador
    knowledge_fragments = []
    for a in aportes_validados:
        val_text = a.procesamiento.version_validada if a.procesamiento else a.contenido_original
        knowledge_fragments.append({
            "aporte_id": a.id,
            "titulo": a.titulo,
            "autor": a.autor,
            "fecha": a.fecha_hecho_historico or "Sin fecha",
            "tipo": a.tipo,
            "archivo_hash_sha256": a.archivo_hash_sha256,
            "contenido_original": a.contenido_original,
            "texto": val_text
        })

    llm_service = get_llm_narrator_service()
    result = llm_service.ask(data.pregunta, memoria.titular, knowledge_fragments)

    voice_service = get_voice_service()
    voice_cfg = voice_service.get_voice_config()

    user_id = current_user.id if current_user else None
    log_audit(
        db,
        accion="CONSULTA_NARRADOR",
        entidad_tipo="Memoria",
        entidad_id=memoria.id,
        usuario_id=user_id,
        detalles={"pregunta": data.pregunta, "encontrado": result.get("encontrado", False)}
    )

    return NarradorResponse(
        respuesta=result["respuesta"],
        fuentes=result.get("fuentes", []),
        encontrado=result.get("encontrado", False),
        es_ia=result.get("es_ia", True),
        voice_config=voice_cfg
    )

