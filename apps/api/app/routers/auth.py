from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import User
from app.schemas import UserLogin, UserOut, UserCreate
from app.audit import log_audit

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

def get_current_user(
    x_user_email: Optional[str] = Header(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Obtiene el usuario actual vía cabecera X-User-Email o token para demo flexible."""
    email = None
    if x_user_email:
        email = x_user_email
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if "@" in token:
            email = token

    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            return user
    
    # Usuario por defecto para demo pública si no se envía cabecera
    return db.query(User).filter(User.role == "Usuario").first()

@router.post("/login", response_model=UserOut)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or user.hashed_password != creds.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    log_audit(db, accion="INICIO_SESION", entidad_tipo="Usuario", entidad_id=user.id, usuario_id=user.id, detalles={"role": user.role})
    return user

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="No autenticado")
    return current_user

@router.get("/demo-users", response_model=List[UserOut])
def list_demo_users(db: Session = Depends(get_db)):
    """Lista los 4 usuarios del sistema para cambio rápido de rol en la demostración."""
    return db.query(User).filter(User.is_active == True).all()
