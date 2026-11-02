import hashlib
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Memoria, Aporte, Procesamiento, User
from app.schemas import AporteOut, AporteCreate
from app.routers.auth import get_current_user
from app.privacy import has_valid_consent, enforce_consent_for_processing
from app.ai import get_transcription_service, get_image_analysis_service
from app.audit import log_audit

router = APIRouter(prefix="/api/aportes", tags=["Aportes y Carga"])

@router.post("", response_model=AporteOut)
def create_aporte_json(
    data: AporteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memoria = db.query(Memoria).filter(Memoria.id == data.memoria_id).first()
    if not memoria:
        raise HTTPException(status_code=404, detail="Memoria no encontrada")

    # Regla del dominio: Una memoria sin consentimiento no se puede procesar
    enforce_consent_for_processing(memoria)

    # Calcular SHA-256 inmutable del contenido original
    content_bytes = (data.contenido_original or f"{data.titulo}-{data.autor}-{data.tipo}").encode("utf-8")
    sha256_hash = data.archivo_hash_sha256 or hashlib.sha256(content_bytes).hexdigest()

    aporte = Aporte(
        memoria_id=data.memoria_id,
        autor=data.autor,
        titulo=data.titulo,
        tipo=data.tipo,
        estado="cargado",
        archivo_nombre=data.archivo_nombre or f"aporte_{data.tipo}.txt",
        archivo_hash_sha256=sha256_hash,
        contenido_original=data.contenido_original,
        fecha_hecho_historico=data.fecha_hecho_historico,
        subido_por_id=current_user.id
    )
    db.add(aporte)
    db.flush()

    # Procesamiento por IA (simulada mock)
    texto_extraido = ""
    entidades = []
    confianza = 0.95

    if data.tipo == "audio":
        svc = get_transcription_service()
        res = svc.transcribe("", aporte.archivo_nombre)
        texto_extraido = res.get("texto_extraido", "")
        entidades = res.get("entidades_detectadas", [])
        confianza = res.get("confianza", 0.95)
    elif data.tipo == "foto":
        svc = get_image_analysis_service()
        res = svc.analyze("", aporte.archivo_nombre)
        texto_extraido = res.get("descripcion", "")
        entidades = res.get("entidades_detectadas", [])
        confianza = res.get("confianza", 0.94)
    else:  # texto
        texto_extraido = data.contenido_original or ""
        entidades = [
            {"nombre": "Palmares", "tipo": "Lugar", "fragmento": "Palmares"},
            {"nombre": data.autor, "tipo": "Persona", "fragmento": data.autor}
        ]

    proc = Procesamiento(
        aporte_id=aporte.id,
        texto_extraido=texto_extraido,
        entidades_extraidas=json.dumps(entidades, ensure_ascii=False),
        confianza_ia=confianza,
        estado="pendiente",
        version_validada=texto_extraido
    )
    db.add(proc)
    db.commit()
    db.refresh(aporte)

    log_audit(
        db,
        accion="CARGA_APORTE",
        entidad_tipo="Aporte",
        entidad_id=aporte.id,
        usuario_id=current_user.id,
        detalles={"tipo": aporte.tipo, "hash": sha256_hash, "memoria_id": memoria.id}
    )

    out = AporteOut.model_validate(aporte)
    out.procesamiento = {
        "texto_extraido": proc.texto_extraido,
        "entidades_extraidas": json.loads(proc.entidades_extraidas or "[]"),
        "estado": proc.estado,
        "version_validada": proc.version_validada
    }
    return out

@router.get("/memoria/{memoria_id}", response_model=List[AporteOut])
def get_aportes_by_memoria(
    memoria_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memoria = db.query(Memoria).filter(Memoria.id == memoria_id).first()
    if not memoria:
        raise HTTPException(status_code=404, detail="Memoria no encontrada")

    aportes = db.query(Aporte).filter(Aporte.memoria_id == memoria_id).all()
    results = []
    for a in aportes:
        out = AporteOut.model_validate(a)
        if a.procesamiento:
            out.procesamiento = {
                "texto_extraido": a.procesamiento.texto_extraido,
                "entidades_extraidas": json.loads(a.procesamiento.entidades_extraidas or "[]"),
                "estado": a.procesamiento.estado,
                "version_validada": a.procesamiento.version_validada
            }
        results.append(out)
    return results

@router.get("/{aporte_id}", response_model=AporteOut)
def get_single_aporte(
    aporte_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    aporte = db.query(Aporte).filter(Aporte.id == aporte_id).first()
    if not aporte:
        raise HTTPException(status_code=404, detail="Aporte no encontrado")

    out = AporteOut.model_validate(aporte)
    if aporte.procesamiento:
        out.procesamiento = {
            "texto_extraido": aporte.procesamiento.texto_extraido,
            "entidades_extraidas": json.loads(aporte.procesamiento.entidades_extraidas or "[]"),
            "estado": aporte.procesamiento.estado,
            "version_validada": aporte.procesamiento.version_validada
        }
    return out

