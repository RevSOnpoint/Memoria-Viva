from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Memoria, User, Aporte, Procesamiento, Consentimiento
from app.schemas import MemoriaCreate, MemoriaUpdate, MemoriaOut
from app.routers.auth import get_current_user
from app.privacy import (
    filter_memorias_for_user,
    can_view_memoria,
    has_valid_consent,
    enforce_can_view_memoria,
    PrivacyAccessDeniedError
)
from app.audit import log_audit

router = APIRouter(prefix="/api/memorias", tags=["Memorias"])

@router.get("", response_model=List[MemoriaOut])
def get_memorias(
    visibilidad: Optional[str] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = db.query(Memoria).all()
    filtered = filter_memorias_for_user(query, current_user)

    if visibilidad:
        filtered = [m for m in filtered if m.visibilidad == visibilidad]
    if estado:
        filtered = [m for m in filtered if m.estado == estado]

    res = []
    for m in filtered:
        total = db.query(Aporte).filter(Aporte.memoria_id == m.id).count()
        validados = (
            db.query(Aporte)
            .join(Procesamiento, Aporte.id == Procesamiento.aporte_id)
            .filter(Aporte.memoria_id == m.id, Procesamiento.estado == "validado")
            .count()
        )
        out = MemoriaOut.model_validate(m)
        out.total_aportes = total
        out.aportes_validados = validados
        res.append(out)

    return res

@router.post("", response_model=MemoriaOut)
def create_memoria(
    data: MemoriaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo Digitalizador y Administrador pueden crear memorias
    if current_user.role not in ("Digitalizador", "Administrador"):
        raise HTTPException(status_code=403, detail="Solo el personal Digitalizador o Administrador puede crear expedientes de memoria.")

    # Regla: La visibilidad por defecto es privada
    visibilidad = data.visibilidad or "privado"

    memoria = Memoria(
        titular=data.titular,
        alias=data.alias,
        descripcion=data.descripcion,
        lugar_origen=data.lugar_origen or "Palmares, Costa Rica",
        fecha_nacimiento=data.fecha_nacimiento,
        tipo=data.tipo or "Individual",
        visibilidad=visibilidad,
        estado="Borrador",
        postuma=data.postuma or False,
        created_by_id=current_user.id
    )
    db.add(memoria)
    db.commit()
    db.refresh(memoria)

    log_audit(
        db,
        accion="CREACION_MEMORIA",
        entidad_tipo="Memoria",
        entidad_id=memoria.id,
        usuario_id=current_user.id,
        detalles={"titular": memoria.titular, "visibilidad": memoria.visibilidad}
    )

    out = MemoriaOut.model_validate(memoria)
    out.total_aportes = 0
    out.aportes_validados = 0
    return out

@router.get("/{memoria_id}", response_model=MemoriaOut)
def get_memoria(
    memoria_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    memoria = db.query(Memoria).filter(Memoria.id == memoria_id).first()
    if not memoria:
        raise HTTPException(status_code=404, detail="Memoria no encontrada")

    if not can_view_memoria(current_user, memoria):
        raise HTTPException(
            status_code=403,
            detail="Acceso restringido: Esta memoria es privada o no cuenta con los permisos necesarios."
        )

    total = db.query(Aporte).filter(Aporte.memoria_id == memoria.id).count()
    validados = (
        db.query(Aporte)
        .join(Procesamiento, Aporte.id == Procesamiento.aporte_id)
        .filter(Aporte.memoria_id == memoria.id, Procesamiento.estado == "validado")
        .count()
    )
    out = MemoriaOut.model_validate(memoria)
    out.total_aportes = total
    out.aportes_validados = validados
    return out

@router.patch("/{memoria_id}", response_model=MemoriaOut)
def update_memoria(
    memoria_id: int,
    data: MemoriaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    memoria = db.query(Memoria).filter(Memoria.id == memoria_id).first()
    if not memoria:
        raise HTTPException(status_code=404, detail="Memoria no encontrada")

    # Regla: Si se intenta publicar, debe tener consentimiento registrado
    if data.visibilidad == "publico" and not has_valid_consent(memoria):
        raise HTTPException(
            status_code=400,
            detail="Regla violada: Una memoria sin consentimiento registrado no se puede publicar."
        )

    for field, val in data.model_dump(exclude_unset=True).items():
        setattr(memoria, field, val)

    db.commit()
    db.refresh(memoria)

    log_audit(
        db,
        accion="ACTUALIZACION_MEMORIA",
        entidad_tipo="Memoria",
        entidad_id=memoria.id,
        usuario_id=current_user.id,
        detalles=data.model_dump(exclude_unset=True)
    )

    out = MemoriaOut.model_validate(memoria)
    return out
