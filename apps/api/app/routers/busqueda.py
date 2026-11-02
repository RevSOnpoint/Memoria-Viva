from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models import Memoria, Aporte, Procesamiento, Entidad, User
from app.routers.auth import get_current_user
from app.privacy import filter_memorias_for_user, can_view_memoria, has_valid_consent

router = APIRouter(prefix="/api/busqueda", tags=["Buscador Patrimonial"])

@router.get("")
def search(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    tipo_aporte: Optional[str] = None,
    memoria_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    q_term = q.lower().strip()

    # Obtener todas las memorias autorizadas para este usuario
    todas_memorias = db.query(Memoria).all()
    memorias_autorizadas = filter_memorias_for_user(todas_memorias, current_user)
    memoria_ids_autorizadas = {m.id for m in memorias_autorizadas}

    if memoria_id:
        if memoria_id not in memoria_ids_autorizadas:
            return {"memorias": [], "aportes": [], "entidades": [], "total": 0}
        memoria_ids_autorizadas = {memoria_id}

    # 1. Buscar en memorias
    memorias_encontradas = [
        {
            "id": m.id,
            "titular": m.titular,
            "alias": m.alias,
            "descripcion": m.descripcion,
            "lugar_origen": m.lugar_origen,
            "visibilidad": m.visibilidad
        }
        for m in memorias_autorizadas
        if m.id in memoria_ids_autorizadas and (
            q_term in (m.titular or "").lower() or
            q_term in (m.alias or "").lower() or
            q_term in (m.descripcion or "").lower() or
            q_term in (m.lugar_origen or "").lower()
        )
    ]

    # 2. Buscar en aportes validados (Regla: solo aportes validados alimentan la base de conocimiento y búsqueda pública)
    aportes_query = (
        db.query(Aporte)
        .join(Procesamiento, Aporte.id == Procesamiento.aporte_id)
        .filter(Aporte.memoria_id.in_(memoria_ids_autorizadas))
        .filter(Procesamiento.estado == "validado")
    )
    if tipo_aporte:
        aportes_query = aportes_query.filter(Aporte.tipo == tipo_aporte)

    aportes_candidatos = aportes_query.all()
    aportes_encontrados = []
    for a in aportes_candidatos:
        val_text = a.procesamiento.version_validada or ""
        orig_text = a.contenido_original or ""
        titulo = a.titulo or ""
        autor = a.autor or ""

        if (
            q_term in val_text.lower() or
            q_term in orig_text.lower() or
            q_term in titulo.lower() or
            q_term in autor.lower()
        ):
            aportes_encontrados.append({
                "id": a.id,
                "memoria_id": a.memoria_id,
                "titulo": a.titulo,
                "autor": a.autor,
                "tipo": a.tipo,
                "fecha": a.fecha_hecho_historico,
                "fragmento_relevante": val_text[:200] + "..." if len(val_text) > 200 else val_text,
                "archivo_hash": a.archivo_hash_sha256
            })

    # 3. Buscar en entidades
    entidades_candidatas = (
        db.query(Entidad)
        .filter(Entidad.memoria_id.in_(memoria_ids_autorizadas))
        .all()
    )
    entidades_encontradas = [
        {
            "id": e.id,
            "memoria_id": e.memoria_id,
            "nombre": e.nombre,
            "tipo": e.tipo,
            "fragmento": e.fragmento,
            "descripcion": e.descripcion
        }
        for e in entidades_candidatas
        if q_term in (e.nombre or "").lower() or q_term in (e.descripcion or "").lower()
    ]

    return {
        "query": q,
        "total": len(memorias_encontradas) + len(aportes_encontrados) + len(entidades_encontradas),
        "memorias": memorias_encontradas,
        "aportes": aportes_encontrados,
        "entidades": entidades_encontradas
    }
