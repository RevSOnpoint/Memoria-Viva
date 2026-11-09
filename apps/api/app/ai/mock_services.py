import re
from typing import Dict, Any, List, Optional
from app.ai.base import TranscriptionInterface, ImageAnalysisInterface, LLMNarratorInterface, VoiceInterface

class MockTranscriptionService(TranscriptionInterface):
    def transcribe(self, file_path: str, filename: str, mime_type: str = "audio/mpeg") -> Dict[str, Any]:
        lower_name = filename.lower()
        if "trapiche" in lower_name or "chepe" in lower_name or "cafe" in lower_name:
            texto = (
                "Recuerdo muy bien que en los años cincuenta nos levantábamos a las cuatro de la mañana. "
                "En Zaragoza de Palmares, mi abuelo tenía un trapiche movido por bueyes. Salíamos con las carretas "
                "cargadas de caña y el olor a dulce de tapa llenaba todo el camino hacia el centro de Palmares. "
                "La comunidad era muy unida y nos ayudábamos entre vecinos durante las cogidas de café."
            )
            entidades = [
                {"nombre": "Zaragoza de Palmares", "tipo": "Lugar", "fragmento": "En Zaragoza de Palmares..."},
                {"nombre": "Trapiche de bueyes", "tipo": "Tradición", "fragmento": "trapiche movido por bueyes"},
                {"nombre": "Dulce de tapa", "tipo": "Tradición", "fragmento": "olor a dulce de tapa"},
                {"nombre": "Años 1950", "tipo": "Fecha", "fragmento": "en los años cincuenta"}
            ]
        elif "carmen" in lower_name or "parto" in lower_name or "salud" in lower_name:
            texto = (
                "A mí me llamaban a cualquier hora de la noche, ya fuera con lluvia o con frío. "
                "Caminaba con mi candil de gas por los trillos de Rincón de Zaragoza para atender los partos. "
                "Usábamos agua hervida, manzanilla y paños limpios de manta. Traje al mundo a más de doscientos "
                "palmaremos y gracias a Dios nunca se me complicó una criatura."
            )
            entidades = [
                {"nombre": "Rincón de Zaragoza", "tipo": "Lugar", "fragmento": "los trillos de Rincón de Zaragoza"},
                {"nombre": "Partería tradicional", "tipo": "Oficio", "fragmento": "atender los partos con candil de gas"},
                {"nombre": "Manzanilla y paños de manta", "tipo": "Tradición", "fragmento": "agua hervida, manzanilla y paños limpios"}
            ]
        else:
            texto = (
                f"Transcripción procesada del registro sonoro '{filename}'. "
                "Relato oral testimonial sobre las costumbres campesinas, el trabajo comunitario y las vivencias familiares en el cantón de Palmares."
            )
            entidades = [
                {"nombre": "Palmares", "tipo": "Lugar", "fragmento": "cantón de Palmares"},
                {"nombre": "Trabajo comunitario", "tipo": "Tradición", "fragmento": "trabajo comunitario"}
            ]

        return {
            "texto_extraido": texto,
            "entidades_detectadas": entidades,
            "confianza": 0.96,
            "motor": "Simulador IA Transcripción v1.0 (mock)"
        }

class MockImageAnalysisService(ImageAnalysisInterface):
    def analyze(self, file_path: str, filename: str) -> Dict[str, Any]:
        lower_name = filename.lower()
        if "iglesia" in lower_name or "templo" in lower_name or "parque" in lower_name:
            descripcion = (
                "Fotografía histórica de época (c. 1945) mostrando la fachada de piedra del templo parroquial "
                "de Nuestra Señora de las Mercedes en Palmares. Se observan pobladores locales reunidos en el atrio, "
                "hombres vistiendo sombrero de ala y mujeres con mantillas tradicionales de domingo."
            )
            entidades = [
                {"nombre": "Templo Nuestra Señora de las Mercedes", "tipo": "Lugar", "fragmento": "fachada de piedra del templo parroquial"},
                {"nombre": "Parque Central de Palmares", "tipo": "Lugar", "fragmento": "parque central"},
                {"nombre": "Vestimenta campesina tradicional", "tipo": "Tradición", "fragmento": "sombrero de ala y mantillas"}
            ]
        elif "familia" in lower_name or "chepe" in lower_name or "carmen" in lower_name:
            descripcion = (
                "Retrato familiar de mediados del siglo XX en el corredor de una casa de madera con piso de mosaico. "
                "La familia posa reunida en torno a la mesa campesina con tazas esmaltadas de café chorreado."
            )
            entidades = [
                {"nombre": "Corredor palmareño", "tipo": "Lugar", "fragmento": "corredor de una casa de madera"},
                {"nombre": "Café chorreado", "tipo": "Tradición", "fragmento": "tazas esmaltadas de café chorreado"}
            ]
        else:
            descripcion = (
                f"Registro fotográfico documental '{filename}'. "
                "Composición histórica preservada de Palmares, con evidencia de técnicas arquitectónicas locales y vida comunitaria."
            )
            entidades = [
                {"nombre": "Palmares", "tipo": "Lugar", "fragmento": "cantón de Palmares"}
            ]

        return {
            "descripcion": descripcion,
            "entidades_detectadas": entidades,
            "confianza": 0.94,
            "motor": "Simulador IA Visión v1.0 (mock)"
        }

class MockLLMNarratorService(LLMNarratorInterface):
    def ask(self, question: str, memoria_titular: str, knowledge_fragments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Regla de oro:
        - Se identifica SIEMPRE como inteligencia artificial.
        - Cita la fuente obligatoriamente (aporte, autor y fecha).
        - Si no tiene información en los fragmentos validados: responde EXACTAMENTE 'no cuento con esa información'
          sin llamar al modelo ni inventar.
        """
        identidad = (
            "Soy el asistente de inteligencia artificial que acompaña y da voz a la memoria de "
            f"{memoria_titular}. "
        )
        respuesta_sin_datos = (
            f"{identidad}Con mucho gusto le atiendo, aunque debo serle sincera: "
            "no cuento con esa información en los relatos validados de esta memoria. "
            "Si gusta, pregúnteme por su niñez, su familia, su oficio o las tradiciones de su comunidad; "
            "con gusto reviso lo que sí quedó registrado."
        )

        if not knowledge_fragments:
            return {
                "respuesta": respuesta_sin_datos,
                "fuentes": [],
                "encontrado": False,
                "es_ia": True
            }

        # Extraer palabras clave de la pregunta (mínimo 3 letras, excluyendo stopwords en español)
        stopwords = {
            "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al", "en", "para", "por",
            "con", "sin", "sobre", "entre", "que", "como", "cuando", "donde", "quien", "cual", "cuales",
            "como", "era", "fue", "tenia", "hacia", "sobre", "este", "esta", "estos", "estas", "su", "sus",
            "contame", "dime", "cuentame", "sabes", "acerca"
        }
        words = [w.lower() for w in re.findall(r'\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,}\b', question) if w.lower() not in stopwords]

        # Buscar fragmentos relevantes
        matched_fragments = []
        for frag in knowledge_fragments:
            content = (frag.get("texto") or "").lower()
            titulo = (frag.get("titulo") or "").lower()
            matches = sum(1 for w in words if w in content or w in titulo)
            if matches > 0 or not words:
                matched_fragments.append((matches, frag))

        matched_fragments.sort(key=lambda x: x[0], reverse=True)

        if not matched_fragments or (words and matched_fragments[0][0] == 0):
            return {
                "respuesta": respuesta_sin_datos,
                "fuentes": [],
                "encontrado": False,
                "es_ia": True
            }

        # Construir respuesta con citas basadas exclusivamente en el material validado
        top_frag = matched_fragments[0][1]
        aporte_id = top_frag.get("aporte_id")
        autor = top_frag.get("autor", memoria_titular)
        fecha = top_frag.get("fecha", "Registro histórico")
        texto = top_frag.get("texto", "")

        fuente_cita = f"[Aporte #{aporte_id} - {autor}, {fecha}]"

        respuesta = (
            f"Qué gusto que me pregunte por eso. {identidad}"
            "Le cuento con cariño lo que quedó registrado en su memoria:\n\n"
            f"“{texto}”\n\n"
            f"Así lo relató {autor}, y puede consultarlo en {fuente_cita}. "
            "Si desea, puedo buscar otro pasaje relacionado o contarle más sobre este recuerdo."
        )

        return {
            "respuesta": respuesta,
            "fuentes": [{
                "aporte_id": aporte_id,
                "titulo": top_frag.get("titulo"),
                "autor": autor,
                "fecha": fecha,
                "tipo": top_frag.get("tipo"),
                "archivo_hash_sha256": top_frag.get("archivo_hash_sha256"),
                "contenido_original": top_frag.get("contenido_original"),
                "texto_validado": texto,
                "cita": fuente_cita
            }],
            "encontrado": True,
            "es_ia": True
        }

class MockVoiceService(VoiceInterface):
    PERFILES = [
        {
            "id": "serena",
            "label": "Serena y pausada",
            "rate": 0.84,
            "pitch": 0.96,
            "style": "Tono reposado, claro y muy cercano."
        },
        {
            "id": "calida",
            "label": "Cálida y cercana",
            "rate": 0.88,
            "pitch": 1.02,
            "style": "Tono amable, conversacional y respetuoso."
        },
        {
            "id": "luminosa",
            "label": "Luminosa y expresiva",
            "rate": 0.9,
            "pitch": 1.06,
            "style": "Tono alegre, natural y con calidez costarricense."
        }
    ]

    def get_voice_config(
        self,
        memoria_id: Optional[int] = None,
        titular: str = ""
    ) -> Dict[str, Any]:
        perfil = self.PERFILES[(memoria_id or 0) % len(self.PERFILES)]
        return {
            "lang": "es-CR",
            "fallback_langs": ["es-419", "es-US", "es-MX", "es-ES"],
            "rate": perfil["rate"],
            "pitch": perfil["pitch"],
            "volume": 0.95,
            "engine": "browser_web_speech_api",
            "profile": perfil["id"],
            "profile_label": perfil["label"],
            "style": perfil["style"],
            "preferred_voice_names": [
                "Sabina",
                "Helena",
                "Laura",
                "Mónica",
                "Monica",
                "Paulina",
                "Google español",
                "Microsoft"
            ],
            "persona": titular
        }

