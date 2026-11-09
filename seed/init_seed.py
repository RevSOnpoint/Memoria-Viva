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

REGION_DEMO_PERSONAS = [
    {
        "titular": "María Elida Quesada Mora",
        "alias": "Doña Elida",
        "descripcion": "Maestra jubilada y memoria viva de la Feria del Café de San Ramón. Custodia los relatos de las escuelas rurales, las tardes de retreta y el aroma de los beneficios de café.",
        "lugar_origen": "San Ramón Centro, San Ramón, Alajuela",
        "fecha_nacimiento": "22 de junio de 1930",
        "consentimiento": {
            "modalidad": "Escrita",
            "evidencia": "Acta de consentimiento informado firmada ante la Junta de Educación de San Ramón.",
            "fecha": "14 de julio de 2023",
            "alcance": "Preservación de la memoria educativa y comunitaria de San Ramón para fines culturales y educativos.",
        },
        "aportes": [
            {
                "titulo": "La escuela de madera y la primera Feria del Café",
                "tipo": "texto",
                "archivo_nombre": "escuela_feria_cafe_san_ramon.txt",
                "fecha_hecho": "1948",
                "contenido": "En 1948 la escuela de San Ramón era de madera y olía a tiza y a café recién tostado. Las familias llevaban a los niños caminando desde San Juan y Santiago. Cuando llegó la primera Feria del Café, las maestras organizamos un puesto de tortillas y rosquillas para reunir fondos para los libros.",
                "entidades": [
                    {"nombre": "Feria del Café de San Ramón", "tipo": "Evento", "fragmento": "la primera Feria del Café", "descripcion": "Feria comunitaria que reunía a productores y familias del cantón."},
                    {"nombre": "Escuela de San Ramón", "tipo": "Lugar", "fragmento": "la escuela de San Ramón era de madera", "descripcion": "Centro educativo de madera en el casco central del cantón."},
                    {"nombre": "Beneficio de café", "tipo": "Oficio", "fragmento": "aroma de los beneficios de café", "descripcion": "Lugar de procesamiento del café de la región."},
                ],
            },
            {
                "titulo": "Retrato de Doña Elida con sus alumnas de la escuela rural",
                "tipo": "foto",
                "archivo_nombre": "foto_elida_alumnas_1956.jpg",
                "fecha_hecho": "1956",
                "contenido": "Fotografía en blanco y negro de 1956 tomada en el patio de la escuela rural de San Ramón. Doña Elida aparece junto a un grupo de alumnas con delantales blancos y pizarras de mano.",
                "entidades": [
                    {"nombre": "Escuela rural de San Ramón", "tipo": "Lugar", "fragmento": "patio de la escuela rural", "descripcion": "Sede educativa de las comunidades rurales ramonenses."},
                ],
            },
        ],
    },
    {
        "titular": "Tomás Alfaro Jiménez",
        "alias": "Don Tomás",
        "descripcion": "Boyero y carretero de San Juan de San Ramón. Recuerda las rutas de bueyes hacia los beneficios de café, el mantenimiento de las carretas y las ferias del cantón.",
        "lugar_origen": "San Juan, San Ramón, Alajuela",
        "fecha_nacimiento": "9 de noviembre de 1928",
        "consentimiento": {
            "modalidad": "Grabada",
            "evidencia": "Grabación de voz y acta notarial otorgada en San Juan de San Ramón.",
            "fecha": "3 de mayo de 2023",
            "alcance": "Preservación de los oficios tradicionales de boyeros y carreteros de San Ramón.",
        },
        "aportes": [
            {
                "titulo": "Las rutas de bueyes hacia el beneficio de café",
                "tipo": "audio",
                "archivo_nombre": "audio_rutas_bueyes_san_ramon.mp3",
                "fecha_hecho": "1952",
                "contenido": "Salíamos antes de que aclarara con la yunta de bueyes. La carreta iba cargada de café y bajábamos por el camino de tierra hasta el beneficio. En las cuestas los bueyes resoplaban y había que ayudarlos con el freno de mano. Al volver, la comunidad nos esperaba con café caliente.",
                "entidades": [
                    {"nombre": "Yunta de bueyes", "tipo": "Tradición", "fragmento": "la yunta de bueyes", "descripcion": "Tracción animal usada para transportar café y caña."},
                    {"nombre": "Beneficio de café de San Ramón", "tipo": "Lugar", "fragmento": "hasta el beneficio", "descripcion": "Punto de recepción y procesamiento del grano."},
                ],
            },
            {
                "titulo": "La carreta pintada y el oficio de carretero",
                "tipo": "texto",
                "archivo_nombre": "carreta_pintada_san_ramon.txt",
                "fecha_hecho": "1949",
                "contenido": "Mi papá me enseñó a cuidar la madera de la carreta y a pintar los rayos de colores. Cada familia tenía su carreta con el nombre en la tablilla. Las reparábamos en el patio antes de la cosecha, porque en tiempo de café no había descanso para el carretero.",
                "entidades": [
                    {"nombre": "Carreta típica", "tipo": "Tradición", "fragmento": "pintar los rayos de colores", "descripcion": "Carreta de madera pintada usada para el transporte agrícola."},
                ],
            },
        ],
    },
    {
        "titular": "Gertrudis Vega Solano",
        "alias": "Doña Tita",
        "descripcion": "Alfarera de Grecia Centro y cultivadora de flores. Conserva la tradición del barro, los hornos de leña y las fiestas de la Ciudad de las Flores.",
        "lugar_origen": "Grecia Centro, Grecia, Alajuela",
        "fecha_nacimiento": "15 de mayo de 1934",
        "consentimiento": {
            "modalidad": "Escrita",
            "evidencia": "Acta de consentimiento firmada en el taller familiar de alfarería en Grecia Centro.",
            "fecha": "21 de setiembre de 2023",
            "alcance": "Preservación de la alfarería tradicional y las fiestas comunales de Grecia.",
        },
        "aportes": [
            {
                "titulo": "El barro de Grecia y los hornos de leña",
                "tipo": "texto",
                "archivo_nombre": "barro_hornos_grecia.txt",
                "fecha_hecho": "1950",
                "contenido": "El barro lo traíamos de la quebrada y lo amasábamos con agua y paciencia. Mi mamá me enseñó a hacer ollas y comales para el fuego. El horno de leña se encendía al amanecer y el humo se mezclaba con el olor de las flores del patio.",
                "entidades": [
                    {"nombre": "Alfarería de Grecia", "tipo": "Oficio", "fragmento": "hacer ollas y comales", "descripcion": "Oficio tradicional de cerámica utilitaria del cantón."},
                    {"nombre": "Horno de leña", "tipo": "Tradición", "fragmento": "El horno de leña se encendía al amanecer", "descripcion": "Horno artesanal usado para cocer piezas de barro."},
                ],
            },
            {
                "titulo": "Taller de alfarería con hornos de leña",
                "tipo": "foto",
                "archivo_nombre": "foto_taller_alfareria_grecia_1957.jpg",
                "fecha_hecho": "1957",
                "contenido": "Fotografía en blanco y negro del taller de alfarería de la familia Vega en Grecia. Se observan vasijas de barro secándose al sol, un horno de leña y manojos de flores colgados en el corredor.",
                "entidades": [
                    {"nombre": "Taller de alfarería Vega", "tipo": "Lugar", "fragmento": "taller de alfarería de la familia Vega", "descripcion": "Taller familiar de cerámica tradicional en Grecia."},
                ],
            },
        ],
    },
    {
        "titular": "Rafael Ángel Castro Mena",
        "alias": "Don Rafael",
        "descripcion": "Músico de la banda de Grecia y memoria de las retretas del parque. Conserva partituras, anécdotas del kiosco y la historia de la iglesia de hierro.",
        "lugar_origen": "Tacares, Grecia, Alajuela",
        "fecha_nacimiento": "2 de febrero de 1932",
        "consentimiento": {
            "modalidad": "Firma digital",
            "evidencia": "Consentimiento digital certificado por la Asociación de la Banda de Grecia.",
            "fecha": "6 de octubre de 2023",
            "alcance": "Preservación de la música de banda y la memoria cívica de Grecia.",
        },
        "aportes": [
            {
                "titulo": "Las retretas de la banda en el parque de Grecia",
                "tipo": "audio",
                "archivo_nombre": "audio_retretas_grecia.mp3",
                "fecha_hecho": "1953",
                "contenido": "Los domingos la banda se ponía el uniforme y tocaba en el kiosco del parque. La gente llegaba con sus sillas y los niños corrían alrededor. Recuerdo el solo de clarinete y el olor de los rosquillas que vendían cerca. La música era el corazón de la comunidad.",
                "entidades": [
                    {"nombre": "Banda de Grecia", "tipo": "Tradición", "fragmento": "la banda se ponía el uniforme", "descripcion": "Banda musical municipal que animaba las retretas dominicales."},
                    {"nombre": "Kiosco del parque de Grecia", "tipo": "Lugar", "fragmento": "el kiosco del parque", "descripcion": "Espacio central de las retretas y actividades cívicas."},
                ],
            },
            {
                "titulo": "La iglesia de hierro y la comunidad",
                "tipo": "texto",
                "archivo_nombre": "iglesia_hierro_grecia.txt",
                "fecha_hecho": "1955",
                "contenido": "La iglesia de hierro se armó pieza por pieza y todo el pueblo ayudó. Mi papá cargó láminas y mi mamá cocinó para los trabajadores. Cuando terminaron, la banda tocó una retreta especial y las flores adornaron todo el atrio.",
                "entidades": [
                    {"nombre": "Iglesia de hierro de Grecia", "tipo": "Lugar", "fragmento": "La iglesia de hierro", "descripcion": "Templo prefabricado de metal, símbolo del cantón."},
                ],
            },
        ],
    },
    {
        "titular": "Joaquín Rodríguez Barrantes",
        "alias": "Don Joaquín",
        "descripcion": "Cafetalero y exmayordomo de un beneficio de Naranjo. Conoce las casonas de patio, las cogidas de café y los trapiches de caña.",
        "lugar_origen": "Naranjo Centro, Naranjo, Alajuela",
        "fecha_nacimiento": "12 de octubre de 1935",
        "consentimiento": {
            "modalidad": "Escrita",
            "evidencia": "Acta de consentimiento firmada en la casa patronal de la familia Rodríguez en Naranjo.",
            "fecha": "18 de agosto de 2023",
            "alcance": "Preservación del patrimonio cafetalero y arquitectónico de Naranjo.",
        },
        "aportes": [
            {
                "titulo": "La cogida de café y las casonas de Naranjo",
                "tipo": "texto",
                "archivo_nombre": "cogida_cafe_naranjo.txt",
                "fecha_hecho": "1954",
                "contenido": "En la cogida de café llegaban familias enteras con canastos y sacos. Las casonas de patio tenían corredores largos donde se secaba el grano y se reunían los peones. El olor del café y la música de la radio acompañaban las tardes de cosecha.",
                "entidades": [
                    {"nombre": "Cogida de café", "tipo": "Tradición", "fragmento": "la cogida de café", "descripcion": "Cosecha manual del grano con participación familiar."},
                    {"nombre": "Casonas de patio de Naranjo", "tipo": "Lugar", "fragmento": "Las casonas de patio", "descripcion": "Viviendas tradicionales con corredores y patios de secado."},
                ],
            },
            {
                "titulo": "Beneficio de café y patio de secado",
                "tipo": "foto",
                "archivo_nombre": "foto_beneficio_naranjo_1958.jpg",
                "fecha_hecho": "1958",
                "contenido": "Fotografía de 1958 del beneficio de café de Naranjo. Se aprecian las piletas, el patio de secado y los trabajadores con sombrero y canastos, junto a la casona de corredores de madera.",
                "entidades": [
                    {"nombre": "Beneficio de café de Naranjo", "tipo": "Lugar", "fragmento": "beneficio de café de Naranjo", "descripcion": "Instalación de procesamiento y secado del café."},
                ],
            },
        ],
    },
    {
        "titular": "Elena Chacón Villalobos",
        "alias": "Doña Elena",
        "descripcion": "Productora de cuajada y fundadora de la feria del agricultor de Atenas. Su memoria reúne recetas, caminos de tierra y el clima del Valle Central.",
        "lugar_origen": "Atenas Centro, Atenas, Alajuela",
        "fecha_nacimiento": "7 de abril de 1940",
        "consentimiento": {
            "modalidad": "Firma digital",
            "evidencia": "Consentimiento digital firmado en la feria del agricultor de Atenas.",
            "fecha": "2 de junio de 2023",
            "alcance": "Preservación de la tradición lechera y las ferias del agricultor de Atenas.",
        },
        "aportes": [
            {
                "titulo": "La cuajada de Atenas y la feria del agricultor",
                "tipo": "texto",
                "archivo_nombre": "cuajada_feria_atenas.txt",
                "fecha_hecho": "1965",
                "contenido": "La cuajada se hacía con leche recién ordeñada y cuajo natural. Los sábados llevábamos los quesos y la cuajada a la feria del agricultor, en canastas cubiertas con hojas de plátano. Allí se encontraban las familias y se contaban las noticias del campo.",
                "entidades": [
                    {"nombre": "Cuajada de Atenas", "tipo": "Tradición", "fragmento": "La cuajada se hacía con leche recién ordeñada", "descripcion": "Producto lácteo tradicional del cantón."},
                    {"nombre": "Feria del agricultor de Atenas", "tipo": "Evento", "fragmento": "la feria del agricultor", "descripcion": "Espacio semanal de venta y encuentro comunitario."},
                ],
            },
            {
                "titulo": "Puesto de cuajada en la feria de Atenas",
                "tipo": "foto",
                "archivo_nombre": "foto_puesto_cuajada_atenas_1972.jpg",
                "fecha_hecho": "1972",
                "contenido": "Fotografía de 1972 del puesto de cuajada de Doña Elena en la feria del agricultor de Atenas. Se ven canastas de mimbre, tablas de madera y clientes con sombrero, bajo un toldo de lona.",
                "entidades": [
                    {"nombre": "Feria del agricultor de Atenas", "tipo": "Evento", "fragmento": "la feria del agricultor de Atenas", "descripcion": "Feria semanal de productos locales."},
                ],
            },
        ],
    },
    {
        "titular": "Adelino Brenes Porras",
        "alias": "Don Adelino",
        "descripcion": "Jardinero de los topiarios de Zarcero y guardián de las historias de la iglesia. Recuerda las manos que dieron forma a los cipreses.",
        "lugar_origen": "Zarcero Centro, Zarcero, Alajuela",
        "fecha_nacimiento": "28 de agosto de 1937",
        "consentimiento": {
            "modalidad": "Escrita",
            "evidencia": "Acta de consentimiento firmada ante la Municipalidad de Zarcero.",
            "fecha": "11 de mayo de 2023",
            "alcance": "Preservación de los jardines topiarios y la memoria comunitaria de Zarcero.",
        },
        "aportes": [
            {
                "titulo": "Los topiarios de Zarcero y el arte del ciprés",
                "tipo": "texto",
                "archivo_nombre": "topiarios_zarcero.txt",
                "fecha_hecho": "1962",
                "contenido": "Empecé a podar los cipreses con tijeras de mano y mucha paciencia. Cada figura tiene su forma y hay que respetar el crecimiento del árbol. El jardín frente a la iglesia se volvió un orgullo para Zarcero y los visitantes venían a fotografiar los arcos y los animales.",
                "entidades": [
                    {"nombre": "Topiarios de Zarcero", "tipo": "Tradición", "fragmento": "podar los cipreses", "descripcion": "Jardines de cipreses esculpidos frente a la iglesia del cantón."},
                    {"nombre": "Iglesia de Zarcero", "tipo": "Lugar", "fragmento": "frente a la iglesia", "descripcion": "Templo central de Zarcero, junto a los jardines topiarios."},
                ],
            },
            {
                "titulo": "Jardines topiarios frente a la iglesia de Zarcero",
                "tipo": "foto",
                "archivo_nombre": "foto_topiarios_zarcero_1970.jpg",
                "fecha_hecho": "1970",
                "contenido": "Fotografía de 1970 de los jardines topiarios de Zarcero. Se observan los cipreses podados en formas de arcos y animales, la iglesia al fondo y visitantes con abrigo por el clima fresco.",
                "entidades": [
                    {"nombre": "Topiarios de Zarcero", "tipo": "Tradición", "fragmento": "cipreses podados en formas de arcos", "descripcion": "Conjunto de jardines esculpidos del cantón."},
                ],
            },
        ],
    },
]


def run_region_seed(db: Session):
    """Agrega expedientes demostrativos de otros cantones de Alajuela sin duplicar datos."""
    digi_user = db.query(User).filter(User.role == "Digitalizador").first()
    gestor_user = db.query(User).filter(User.role == "Gestor de datos").first()
    if not digi_user or not gestor_user:
        return

    created = 0
    for persona in REGION_DEMO_PERSONAS:
        exists = db.query(Memoria).filter(Memoria.titular == persona["titular"]).first()
        if exists:
            continue

        memoria = Memoria(
            titular=persona["titular"],
            alias=persona["alias"],
            descripcion=persona["descripcion"],
            lugar_origen=persona["lugar_origen"],
            fecha_nacimiento=persona["fecha_nacimiento"],
            tipo="Individual",
            estado="Activa",
            visibilidad="publico",
            postuma=False,
            created_by_id=digi_user.id,
        )
        db.add(memoria)
        db.flush()

        consent_data = persona["consentimiento"]
        db.add(Consentimiento(
            memoria_id=memoria.id,
            titular=persona["titular"],
            modalidad=consent_data["modalidad"],
            evidencia_url=f"evidencias/consentimiento_{memoria.id}_region.pdf",
            evidencia_hash=sha256_text(consent_data["evidencia"]),
            fecha_otorgamiento=consent_data["fecha"],
            vigencia="Indefinida",
            alcance=consent_data["alcance"],
            notas=consent_data["evidencia"],
            registrado_por_id=digi_user.id,
        ))

        for aporte_data in persona["aportes"]:
            contenido = aporte_data["contenido"]
            aporte = Aporte(
                memoria_id=memoria.id,
                autor=aporte_data.get("autor", persona["titular"]),
                titulo=aporte_data["titulo"],
                tipo=aporte_data["tipo"],
                estado="validado",
                archivo_nombre=aporte_data["archivo_nombre"],
                archivo_hash_sha256=sha256_text(contenido),
                contenido_original=contenido,
                fecha_hecho_historico=aporte_data["fecha_hecho"],
                subido_por_id=digi_user.id,
            )
            db.add(aporte)
            db.flush()

            entidades = aporte_data.get("entidades", [])
            db.add(Procesamiento(
                aporte_id=aporte.id,
                texto_extraido=contenido,
                entidades_extraidas=json.dumps(entidades, ensure_ascii=False),
                confianza_ia=0.96,
                estado="validado",
                version_validada=contenido,
                gestor_id=gestor_user.id,
                notas_validacion="Contenido revisado y aprobado por la Mesa de Curaduría regional.",
            ))

            for entidad in entidades:
                db.add(Entidad(
                    memoria_id=memoria.id,
                    aporte_origen_id=aporte.id,
                    nombre=entidad["nombre"],
                    tipo=entidad["tipo"],
                    fragmento=entidad.get("fragmento"),
                    descripcion=entidad.get("descripcion"),
                ))

        created += 1

    if created:
        db.commit()
        print(f"Semilla regional agregada: {created} expedientes de otros cantones de Alajuela.")


if __name__ == "__main__":
    from app.database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
        run_region_seed(db)
    finally:
        db.close()
