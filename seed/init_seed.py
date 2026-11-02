import sys
import os
sys.path.insert(0, os.path.abspath("apps/api"))
sys.path.insert(0, os.path.abspath("."))
import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import User, Memoria, Consentimiento, Aporte, Procesamiento, Entidad, BitacoraAuditoria

def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def run_seed(db: Session):
    # Verificar si ya existen usuarios
    if db.query(User).count() > 0:
        return

    print("Inicializando datos semilla para Memoria Viva (Fundación Legado Vivo, Palmares)...")

    # 1. Crear 4 Usuarios representativos de cada rol
    usuarios_seed = [
        {"email": "admin@legadovivo.cr", "full_name": "Lic. Carlos Monge (Administrador)", "role": "Administrador"},
        {"email": "gestor@legadovivo.cr", "full_name": "Licda. Marielos Salas (Gestora de Datos)", "role": "Gestor de datos"},
        {"email": "digitalizador@legadovivo.cr", "full_name": "Andrés Solís (Digitalizador de Campo)", "role": "Digitalizador"},
        {"email": "usuario@legadovivo.cr", "full_name": "Elena Quesada (Consultante / Familiar)", "role": "Usuario"},
    ]

    users_map = {}
    for u in usuarios_seed:
        user_obj = User(
            email=u["email"],
            full_name=u["full_name"],
            hashed_password="demo123",
            role=u["role"],
            is_active=True
        )
        db.add(user_obj)
        db.flush()
        users_map[u["role"]] = user_obj

    admin_user = users_map["Administrador"]
    gestor_user = users_map["Gestor de datos"]
    digi_user = users_map["Digitalizador"]

    # 2. Memoria Semilla 1: Don Chepe (José Ángel González Chaves)
    m1 = Memoria(
        titular="José Ángel González Chaves",
        alias="Don Chepe",
        descripcion="Agricultor de café y trapiche en Zaragoza de Palmares. Testigo de la construcción del templo parroquial de piedra y pionero de las fiestas cívicas locales.",
        lugar_origen="Zaragoza, Palmares, Costa Rica",
        fecha_nacimiento="18 de marzo de 1924",
        tipo="Individual",
        estado="Activa",
        visibilidad="publico",
        postuma=False,
        created_by_id=digi_user.id
    )
    db.add(m1)
    db.flush()

    # Consentimiento Don Chepe
    c1_evidence = "Acta notarial formal y testimonio audiovisual de consentimiento informado firmado en Zaragoza de Palmares."
    c1 = Consentimiento(
        memoria_id=m1.id,
        titular="José Ángel González Chaves",
        modalidad="Firma digital",
        evidencia_url="evidencias/consentimiento_don_chepe_2023.pdf",
        evidencia_hash=sha256_text(c1_evidence),
        fecha_otorgamiento="12 de marzo de 2023",
        vigencia="Indefinida",
        alcance="Preservación patrimonial comunitaria y narración asistida por IA con fines educativos.",
        notas="Otorgado voluntariamente ante el equipo de la Fundación Legado Vivo.",
        registrado_por_id=digi_user.id
    )
    db.add(c1)

    # Aporte 1 Texto Don Chepe
    t1_orig = (
        "En 1945, después de la guerra, todos los vecinos de Zaragoza y del centro de Palmares nos juntamos para jalar piedra del río "
        "con yuntas de bueyes. Íbamos los sábados al río Grande y cargábamos las carretas para levantar el Templo de Nuestra Señora de las Mercedes. "
        "Cada familia donaba una carreta de piedra por mes."
    )
    a1_t = Aporte(
        memoria_id=m1.id,
        autor="José Ángel González Chaves",
        titulo="La jalada de piedra para el Templo de Nuestra Señora de las Mercedes",
        tipo="texto",
        estado="validado",
        archivo_nombre="relato_templo_palmares.txt",
        archivo_hash_sha256=sha256_text(t1_orig),
        contenido_original=t1_orig,
        fecha_hecho_historico="Octubre de 1945",
        subido_por_id=digi_user.id
    )
    db.add(a1_t)
    db.flush()

    p1_t = Procesamiento(
        aporte_id=a1_t.id,
        texto_extraido=t1_orig,
        entidades_extraidas=json.dumps([
            {"nombre": "Templo de Nuestra Señora de las Mercedes", "tipo": "Lugar", "fragmento": "levantar el Templo de Nuestra Señora de las Mercedes"},
            {"nombre": "Yuntas de bueyes", "tipo": "Tradición", "fragmento": "jalar piedra con yuntas de bueyes"},
            {"nombre": "Río Grande", "tipo": "Lugar", "fragmento": "Íbamos los sábados al río Grande"}
        ], ensure_ascii=False),
        confianza_ia=0.98,
        estado="validado",
        version_validada=t1_orig,
        gestor_id=gestor_user.id,
        notas_validacion="Verificado con los archivos parroquiales de Palmares. Datos concordantes."
    )
    db.add(p1_t)

    # Aporte 2 Audio Don Chepe
    audio_orig_meta = "Grabación en casete magnetofónico digitalizado a 44.1kHz. Entrevista en la casa de Don Chepe en Zaragoza sobre los trapiches de dulce."
    a1_a = Aporte(
        memoria_id=m1.id,
        autor="José Ángel González Chaves",
        titulo="Los bueyes y el trapiche dulce en Zaragoza de Palmares",
        tipo="audio",
        estado="validado",
        archivo_nombre="audio_trapiche_chepe.mp3",
        archivo_hash_sha256=sha256_text(audio_orig_meta),
        contenido_original=audio_orig_meta,
        fecha_hecho_historico="1954",
        subido_por_id=digi_user.id
    )
    db.add(a1_a)
    db.flush()

    audio_transcrito = (
        "En los años cincuenta nos levantábamos a las cuatro de la mañana. En Zaragoza de Palmares mi abuelo tenía un trapiche movido por bueyes. "
        "Salíamos con las carretas cargadas de caña y el olor a dulce de tapa llenaba todo el camino hacia el centro de Palmares. "
        "La comunidad era muy unida y nos ayudábamos entre vecinos durante las cogidas de café."
    )
    p1_a = Procesamiento(
        aporte_id=a1_a.id,
        texto_extraido=audio_transcrito,
        entidades_extraidas=json.dumps([
            {"nombre": "Zaragoza de Palmares", "tipo": "Lugar", "fragmento": "En Zaragoza de Palmares"},
            {"nombre": "Trapiche de dulce", "tipo": "Tradición", "fragmento": "trapiche movido por bueyes"},
            {"nombre": "Dulce de tapa", "tipo": "Tradición", "fragmento": "dulce de tapa"}
        ], ensure_ascii=False),
        confianza_ia=0.96,
        estado="validado",
        version_validada=audio_transcrito,
        gestor_id=gestor_user.id,
        notas_validacion="Revisión de audio clara, tono sereno y léxico campesino preservado íntegramente."
    )
    db.add(p1_a)

    # Aporte 3 Foto Don Chepe
    foto_orig_meta = "Fotografía química en blanco y negro tomada durante el desfile de boyeros en el parque central de Palmares."
    a1_f = Aporte(
        memoria_id=m1.id,
        autor="Familia González Chaves",
        titulo="Campesinos palmareños y carretas frente al parque central",
        tipo="foto",
        estado="validado",
        archivo_nombre="foto_palmares_1948.jpg",
        archivo_hash_sha256=sha256_text(foto_orig_meta),
        contenido_original=foto_orig_meta,
        fecha_hecho_historico="Enero de 1948",
        subido_por_id=digi_user.id
    )
    db.add(a1_f)
    db.flush()

    foto_desc = (
        "Fotografía histórica de época (c. 1948) en el parque central de Palmares. Se observan carretas típicas de café pintadas, "
        "hombres con sombrero de ala y las primeras estructuras de piedra del templo parroquial al fondo."
    )
    p1_f = Procesamiento(
        aporte_id=a1_f.id,
        texto_extraido=foto_desc,
        entidades_extraidas=json.dumps([
            {"nombre": "Parque Central de Palmares", "tipo": "Lugar", "fragmento": "parque central de Palmares"},
            {"nombre": "Carretas de café", "tipo": "Tradición", "fragmento": "carretas típicas de café"}
        ], ensure_ascii=False),
        confianza_ia=0.94,
        estado="validado",
        version_validada=foto_desc,
        gestor_id=gestor_user.id,
        notas_validacion="Imagen restaurada digitalmente y catalogada."
    )
    db.add(p1_f)

    # Entidades de Don Chepe
    db.add(Entidad(memoria_id=m1.id, aporte_origen_id=a1_t.id, nombre="Templo Nuestra Señora de las Mercedes", tipo="Lugar", fragmento="Templo de piedra de Palmares", descripcion="Templo parroquial edificado con piedra del río Grande."))
    db.add(Entidad(memoria_id=m1.id, aporte_origen_id=a1_a.id, nombre="Zaragoza de Palmares", tipo="Lugar", fragmento="Distrito cafetalero y cañero", descripcion="Comunidad donde se ubicaban los principales trapiches de dulce."))
    db.add(Entidad(memoria_id=m1.id, aporte_origen_id=a1_a.id, nombre="Trapiche de bueyes", tipo="Tradición", fragmento="Trapiche tradicional", descripcion="Molienda comunitaria movida por tracción animal para producir dulce de tapa."))

    # 3. Memoria Semilla 2: Doña Carmen (Carmen María Rojas Vargas)
    m2 = Memoria(
        titular="Carmen María Rojas Vargas",
        alias="Doña Carmen",
        descripcion="Partera comunitaria, cocinera y educadora popular en Rincón de Zaragoza. Referente de la salud comunitaria y memoria viva de la solidaridad tras el terremoto de 1955.",
        lugar_origen="Rincón de Zaragoza, Palmares, Costa Rica",
        fecha_nacimiento="4 de noviembre de 1931",
        tipo="Individual",
        estado="Activa",
        visibilidad="publico",
        postuma=False,
        created_by_id=digi_user.id
    )
    db.add(m2)
    db.flush()

    c2_evidence = "Consentimiento informado firmado y refrendado por familiares directos en Rincón de Zaragoza de Palmares."
    c2 = Consentimiento(
        memoria_id=m2.id,
        titular="Carmen María Rojas Vargas",
        modalidad="Escrita",
        evidencia_url="evidencias/consentimiento_dona_carmen_2023.pdf",
        evidencia_hash=sha256_text(c2_evidence),
        fecha_otorgamiento="5 de agosto de 2023",
        vigencia="Indefinida",
        alcance="Preservación del legado de salud tradicional palmareña y consulta comunitaria.",
        notas="Autorizado íntegramente con fines de memoria y archivo histórico.",
        registrado_por_id=digi_user.id
    )
    db.add(c2)

    # Aporte 1 Texto Doña Carmen
    t2_orig = (
        "A mí me llamaban a cualquier hora de la noche, ya fuera con lluvia o con frío. Caminaba con mi candil de gas por los trillos de "
        "Rincón de Zaragoza para atender los partos. Usábamos agua hervida, manzanilla y paños limpios de manta. Traje al mundo a más de "
        "doscientos palmaremos y gracias a Dios nunca se me complicó una criatura."
    )
    a2_t = Aporte(
        memoria_id=m2.id,
        autor="Carmen María Rojas Vargas",
        titulo="Noches de parto con candil en Rincón de Zaragoza",
        tipo="texto",
        estado="validado",
        archivo_nombre="memorias_partera_carmen.txt",
        archivo_hash_sha256=sha256_text(t2_orig),
        contenido_original=t2_orig,
        fecha_hecho_historico="1952",
        subido_por_id=digi_user.id
    )
    db.add(a2_t)
    db.flush()

    p2_t = Procesamiento(
        aporte_id=a2_t.id,
        texto_extraido=t2_orig,
        entidades_extraidas=json.dumps([
            {"nombre": "Rincón de Zaragoza", "tipo": "Lugar", "fragmento": "Rincón de Zaragoza"},
            {"nombre": "Partería tradicional", "tipo": "Oficio", "fragmento": "atender los partos con candil de gas"},
            {"nombre": "Manzanilla y paños de manta", "tipo": "Tradición", "fragmento": "agua hervida y manzanilla"}
        ], ensure_ascii=False),
        confianza_ia=0.97,
        estado="validado",
        version_validada=t2_orig,
        gestor_id=gestor_user.id,
        notas_validacion="Aporte testimonial invaluable sobre salud rural."
    )
    db.add(p2_t)

    # Aporte 2 Audio Doña Carmen
    audio2_meta = "Cinta de audio grabada en la sala de Doña Carmen narrando la solidaridad del pueblo durante el terremoto de 1955."
    a2_a = Aporte(
        memoria_id=m2.id,
        autor="Carmen María Rojas Vargas",
        titulo="El terremoto de 1955 y la sopa comunitaria en el patio",
        tipo="audio",
        estado="validado",
        archivo_nombre="audio_terremoto_1955_carmen.mp3",
        archivo_hash_sha256=sha256_text(audio2_meta),
        contenido_original=audio2_meta,
        fecha_hecho_historico="Septiembre de 1955",
        subido_por_id=digi_user.id
    )
    db.add(a2_a)
    db.flush()

    audio2_trans = (
        "Cuando tembló tan fuerte en 1955, varias paredes de adobe cayeron en Zaragoza. Nadie se quedó solo: montamos un fogón de leña "
        "en el patio comunal y todas las mujeres llevamos yuca, chayote y maíz para hacer una olla de carne para más de ochenta personas. "
        "Palmares siempre ha salido adelante por la hermandad de su gente."
    )
    p2_a = Procesamiento(
        aporte_id=a2_a.id,
        texto_extraido=audio2_trans,
        entidades_extraidas=json.dumps([
            {"nombre": "Terremoto de 1955", "tipo": "Evento", "fragmento": "tembló tan fuerte en 1955"},
            {"nombre": "Olla de carne comunal", "tipo": "Tradición", "fragmento": "fogón de leña en el patio comunal"}
        ], ensure_ascii=False),
        confianza_ia=0.96,
        estado="validado",
        version_validada=audio2_trans,
        gestor_id=gestor_user.id,
        notas_validacion="Testimonio auditado y aprobado."
    )
    db.add(p2_a)

    # Aporte 3 Foto Doña Carmen
    foto2_meta = "Fotografía documental de Doña Carmen en su cocina de leña con hierbas medicinales."
    a2_f = Aporte(
        memoria_id=m2.id,
        autor="Familia Rojas Vargas",
        titulo="Doña Carmen en su cocina con su colección de plantas medicinales",
        tipo="foto",
        estado="validado",
        archivo_nombre="foto_partera_carmen_1955.jpg",
        archivo_hash_sha256=sha256_text(foto2_meta),
        contenido_original=foto2_meta,
        fecha_hecho_historico="1958",
        subido_por_id=digi_user.id
    )
    db.add(a2_f)
    db.flush()

    foto2_desc = (
        "Retrato documental en Rincón de Zaragoza mostrando la cocina tradicional de leña, manojos de manzanilla secándose en el techo "
        "y frascos de remedios caseros preparados por Doña Carmen."
    )
    p2_f = Procesamiento(
        aporte_id=a2_f.id,
        texto_extraido=foto2_desc,
        entidades_extraidas=json.dumps([
            {"nombre": "Cocina de leña tradicional", "tipo": "Tradición", "fragmento": "cocina tradicional de leña"},
            {"nombre": "Plantas medicinales", "tipo": "Tradición", "fragmento": "manzanilla y remedios caseros"}
        ], ensure_ascii=False),
        confianza_ia=0.95,
        estado="validado",
        version_validada=foto2_desc,
        gestor_id=gestor_user.id,
        notas_validacion="Foto validada para la colección de salud popular."
    )
    db.add(p2_f)

    db.add(Entidad(memoria_id=m2.id, aporte_origen_id=a2_t.id, nombre="Rincón de Zaragoza", tipo="Lugar", fragmento="Comunidad de Palmares", descripcion="Barrio donde Doña Carmen ejerció la partería comunitaria."))
    db.add(Entidad(memoria_id=m2.id, aporte_origen_id=a2_t.id, nombre="Partería tradicional", tipo="Oficio", fragmento="Atención de nacimientos rurales", descripcion="Práctica ancestral de acompañamiento del parto con hierbas y asepsia empírica."))
    db.add(Entidad(memoria_id=m2.id, aporte_origen_id=a2_a.id, nombre="Terremoto de 1955", tipo="Evento", fragmento="Evento sísmico de 1955", descripcion="Sismo histórico que activó redes solidarias de ollas comunes en Palmares."))

    # 4. Memoria Privada de Prueba (Sin consentimiento o privada) para validar reglas de privacidad
    m3_priv = Memoria(
        titular="Memoria Privada Familiar (Prueba de Confidencialidad)",
        alias="Familia Rodríguez (Confidencial)",
        descripcion="Expediente privado en custodia sin consentimiento público, reservado exclusivamente a la familia.",
        lugar_origen="La Granja, Palmares",
        fecha_nacimiento="1940",
        tipo="Familiar",
        estado="Borrador",
        visibilidad="privado",
        postuma=False,
        created_by_id=digi_user.id
    )
    db.add(m3_priv)

    # 5. Bitácora de Auditoría inicial
    db.add(BitacoraAuditoria(
        usuario_id=admin_user.id,
        accion="INICIALIZACION_SISTEMA",
        entidad_tipo="Sistema",
        entidad_id=1,
        detalles=json.dumps({"version": "1.0.0", "semillas": ["Don Chepe", "Doña Carmen", "Expediente Privado"]}),
        ip_origen="127.0.0.1"
    ))

    db.commit()
    print("Datos semilla insertados exitosamente en la base de datos.")

if __name__ == "__main__":
    from app.database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
