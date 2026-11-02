import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Memoria, Consentimiento, User
from app.schemas import ConsentimientoCreate, ConsentimientoOut
from app.routers.auth import get_current_user
from app.audit import log_audit

router = APIRouter(prefix="/api/consentimientos", tags=["Consentimientos"])

@router.post("", response_model=ConsentimientoOut)
def register_consent(
    data: ConsentimientoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ("Digitalizador", "Administrador", "Gestor de datos"):
        raise HTTPException(status_code=403, detail="No tiene permisos para registrar consentimientos legales.")

    memoria = db.query(Memoria).filter(Memoria.id == data.memoria_id).first()
    if not memoria:
        raise HTTPException(status_code=404, detail="Expediente de memoria no encontrado")

    # Si la evidencia_hash no viene calculada, generamos un hash seguro de la evidencia
    evidencia_hash = data.evidencia_hash
    if not evidencia_hash:
        raw_seed = f"{data.titular}-{data.fecha_otorgamiento}-{data.modalidad}"
        evidencia_hash = hashlib.sha256(raw_seed.encode("utf-8")).hexdigest()

    existing = db.query(Consentimiento).filter(Consentimiento.memoria_id == data.memoria_id).first()
    if existing:
        existing.titular = data.titular
        existing.modalidad = data.modalidad
        existing.evidencia_url = data.evidencia_url
        existing.evidencia_hash = evidencia_hash
        existing.fecha_otorgamiento = data.fecha_otorgamiento
        existing.vigencia = data.vigencia or "Indefinida"
        existing.alcance = data.alcance
        existing.notas = data.notas
        existing.registrado_por_id = current_user.id
        consent = existing
    else:
        consent = Consentimiento(
            memoria_id=data.memoria_id,
            titular=data.titular,
            modalidad=data.modalidad,
            evidencia_url=data.evidencia_url,
            evidencia_hash=evidencia_hash,
            fecha_otorgamiento=data.fecha_otorgamiento,
            vigencia=data.vigencia or "Indefinida",
            alcance=data.alcance or "Preservación patrimonial y narración asistida por IA",
            notas=data.notas,
            registrado_por_id=current_user.id
        )
        db.add(consent)

    # Actualizamos el estado de la memoria a 'Activa' al registrar consentimiento
    if memoria.estado == "Borrador":
        memoria.estado = "Activa"

    db.commit()
    db.refresh(consent)

    log_audit(
        db,
        accion="REGISTRO_CONSENTIMIENTO",
        entidad_tipo="Consentimiento",
        entidad_id=consent.id,
        usuario_id=current_user.id,
        detalles={"memoria_id": memoria.id, "hash": evidencia_hash, "modalidad": consent.modalidad}
    )

    return consent

@router.get("/memoria/{memoria_id}", response_model=ConsentimientoOut)
def get_consent_for_memoria(
    memoria_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    consent = db.query(Consentimiento).filter(Consentimiento.memoria_id == memoria_id).first()
    if not consent:
        raise HTTPException(status_code=404, detail="No se ha registrado consentimiento para esta memoria")
    return consent
