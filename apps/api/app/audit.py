import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models import BitacoraAuditoria

def log_audit(
    db: Session,
    accion: str,
    entidad_tipo: str,
    entidad_id: Optional[int] = None,
    usuario_id: Optional[int] = None,
    detalles: Optional[Any] = None,
    ip_origen: str = "127.0.0.1"
):
    try:
        detalles_str = json.dumps(detalles, ensure_ascii=False) if detalles is not None else None
        log_entry = BitacoraAuditoria(
            usuario_id=usuario_id,
            accion=accion,
            entidad_tipo=entidad_tipo,
            entidad_id=entidad_id,
            detalles=detalles_str,
            ip_origen=ip_origen
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error registrando auditoría: {e}")
