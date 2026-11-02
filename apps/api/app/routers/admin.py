from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User, BitacoraAuditoria
from app.schemas import UserOut, UserCreate, AuditoriaOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Administración y Auditoría"])

@router.get("/usuarios", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Acceso restringido a Administradores")
    return db.query(User).all()

@router.post("/usuarios", response_model=UserOut)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Acceso restringido a Administradores")
    
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado.")
    
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=data.password,
        role=data.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/auditoria")
def get_audit_logs(
    limit: int = Query(50, le=200),
    accion: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "Administrador":
        raise HTTPException(status_code=403, detail="Acceso restringido a Administradores")

    query = db.query(BitacoraAuditoria).order_by(BitacoraAuditoria.created_at.desc())
    if accion:
        query = query.filter(BitacoraAuditoria.accion == accion)

    logs = query.limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "usuario_email": l.usuario.email if l.usuario else "Sistema/Anónimo",
            "usuario_nombre": l.usuario.full_name if l.usuario else "Sistema",
            "accion": l.accion,
            "entidad_tipo": l.entidad_tipo,
            "entidad_id": l.entidad_id,
            "detalles": l.detalles,
            "ip_origen": l.ip_origen,
            "created_at": l.created_at
        })
    return results
