import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models import Aporte, Procesamiento, Entidad, User, Memoria
from app.schemas import ValidacionAction, AporteOut
from app.routers.auth import get_current_user
from app.audit import log_audit

router = APIRouter(prefix="/api/validacion", tags=["Revisión y Validación (Gestor de Datos)"])

@router.get("/pendientes")
def get_pendientes_validacion(
    memoria_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        db.query(Aporte)
        .join(Procesamiento, Aporte.id == Procesamiento.aporte_id)
        .filter(Procesamiento.estado == "pendiente")
    )
    if memoria_id:
        query = query.filter(Aporte.memoria_id == memoria_id)

    pendientes = query.all()
    results = []
    for a in pendientes:
        memoria = db.query(Memoria).filter(Memoria.id == a.memoria_id).first()
        results.append({
            "aporte_id": a.id,
            "memoria_id": a.memoria_id,
            "memoria_titular": memoria.titular if memoria else "Desconocido",
            "titulo": a.titulo,
            "autor": a.autor,
            "tipo": a.tipo,
            "fecha_hecho_historico": a.fecha_hecho_historico,
            "archivo_nombre": a.archivo_nombre,
            "archivo_hash_sha256": a.archivo_hash_sha256,
            "contenido_original": a.contenido_original,
            "texto_extraido": a.procesamiento.texto_extraido if a.procesamiento else "",
            "entidades_detectadas": json.loads(a.procesamiento.entidades_extraidas or "[]") if a.procesamiento else [],
            "confianza_ia": a.procesamiento.confianza_ia if a.procesamiento else 0.95,
            "estado": a.procesamiento.estado if a.procesamiento else "pendiente",
            "created_at": a.created_at
        })
    return results

@router.post("/aprobar")
def aprobar_aporte(
    data: ValidacionAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo el Gestor de datos o Administrador puede validar
    if current_user.role not in ("Gestor de datos", "Administrador"):
        raise HTTPException(status_code=403, detail="Solo un Gestor de datos puede validar contenidos para la base de conocimiento.")

    aporte = db.query(Aporte).filter(Aporte.id == data.aporte_id).first()
    if not aporte:
        raise HTTPException(status_code=404, detail="Aporte no encontrado")

    proc = db.query(Procesamiento).filter(Procesamiento.aporte_id == aporte.id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procesamiento no encontrado")

    # Actualizar procesamiento
    proc.estado = "validado"
    proc.version_validada = data.version_validada
    proc.notas_validacion = data.notas_validacion
    proc.gestor_id = current_user.id
    aporte.estado = "validado"

    # Incorporar entidades a la base de conocimiento aislada de esta memoria
    if data.entidades_aprobadas:
        for ent_data in data.entidades_aprobadas:
            ent = Entidad(
                memoria_id=aporte.memoria_id,
                aporte_origen_id=aporte.id,
                nombre=ent_data.get("nombre", ""),
                tipo=ent_data.get("tipo", "General"),
                fragmento=ent_data.get("fragmento", ""),
                descripcion=ent_data.get("descripcion", "")
            )
            db.add(ent)

    db.commit()

    log_audit(
        db,
        accion="VALIDACION_GESTOR_APROBADO",
        entidad_tipo="Aporte",
        entidad_id=aporte.id,
        usuario_id=current_user.id,
        detalles={
            "memoria_id": aporte.memoria_id,
            "aporte_id": aporte.id,
            "version_validada_preview": data.version_validada[:100]
        }
    )

    return {
        "status": "success",
        "message": "Aporte validado exitosamente e incorporado a la base de conocimiento",
        "aporte_id": aporte.id
    }

@router.post("/rechazar")
def rechazar_aporte(
    data: ValidacionAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("Gestor de datos", "Administrador"):
        raise HTTPException(status_code=403, detail="Permisos insuficientes")

    aporte = db.query(Aporte).filter(Aporte.id == data.aporte_id).first()
    if not aporte:
        raise HTTPException(status_code=404, detail="Aporte no encontrado")

    proc = db.query(Procesamiento).filter(Procesamiento.aporte_id == aporte.id).first()
    if proc:
        proc.estado = "rechazado"
        proc.notas_validacion = data.notas_validacion
        proc.gestor_id = current_user.id
    aporte.estado = "rechazado"
    db.commit()

    log_audit(
        db,
        accion="VALIDACION_GESTOR_RECHAZADO",
        entidad_tipo="Aporte",
        entidad_id=aporte.id,
        usuario_id=current_user.id,
        detalles={"notas": data.notas_validacion}
    )

    return {"status": "success", "message": "Aporte marcado como rechazado"}
