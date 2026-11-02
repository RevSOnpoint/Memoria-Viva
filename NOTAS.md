# Memoria Viva - Fundación Legado Vivo (Palmares, Costa Rica)
## Registro de Decisiones de Arquitectura y Diseño (NOTAS.md)

### 1. Sistema de Diseño e Interfaz "Tipo SAP" (SAP Fiori / Horizon Enterprise)
- **ShellBar & Navegación**: Se implementa una barra superior institucional SAP ShellBar con identidad de la Fundación Legado Vivo, selector rápido de rol de demostración (Usuario, Digitalizador, Gestor de datos, Administrador) y control de accesibilidad visual (escalado de fuente 18px base con multiplicadores hasta 200%).
- **Estructura Fiori Master-Detail / Object Page**: Las pantallas siguen la distribución empresarial de SAP con barras de herramientas de acción explícitas, tablas con badges de estado semánticos (Verde/Success para "Validado"/"Consentimiento Válido", Ámbar/Warning para "Pendiente de Revisión"/"Familiar", Azul/Informative para "En Proceso"/"Público", Rojo/Error para "Sin Consentimiento"/"Rechazado", Neutral para "Privado"/"Borrador").
- **Pantalla de Validación P05 (Split Screen)**: Se diseñó con panel dividido donde el material original inmutable se mantiene intacto a la izquierda con su hash SHA-256 verificado, y a la derecha el editor de curación para el Gestor de datos con botón de incorporación a la base de conocimiento.
- **Narrador P07**: Diseño tipo Asistente Digital Enterprise con badge que aclara obligatoriamente "Inteligencia Artificial", citas colapsables estructuradas `[Aporte #ID - Autor, Fecha]` y botón de acción directa "Ver fuente primaria".

### 2. Capa de IA y Modo Simulado (AI_MODE=mock)
- Se implementaron 4 interfaces desacopladas en `apps/api/app/ai/`:
  1. `TranscriptionInterface`: Devuelve transcripciones estructuradas de relatos orales de Palmares con timestamps y entidades extraídas.
  2. `ImageAnalysisInterface`: Devuelve análisis iconográfico de fotografías históricas de Palmares (arquitectura de piedra, vestimenta tradicional campesina, carretas).
  3. `LLMNarratorInterface`: Motor de respuesta basado en fragmentos validados. Aplica la regla estricta: si no hay evidencia responde exactamente `"no cuento con esa información"` sin inventar ni alucinar.
  4. `VoiceInterface`: Configuración para Web Speech API del navegador en español con cadencia pausada (rate: 0.9) óptima para personas adultas mayores.
- La arquitectura permite sustituir los mocks por Whisper y Gemini sin modificar controladores ni modelos.

### 3. Almacenamiento y Base de Datos Híbrida
- **Desarrollo y Demo Local**: SQLite con modo de aislamiento y creación automática de tablas y semillas para ejecución inmediata sin dependencias complejas de servidor.
- **Producción / Docker Compose**: PostgreSQL 16 con credenciales seguras vía `.env`.

### 4. Reglas del Dominio y Privacidad Verificadas por Pruebas Automáticas
- Memoria sin consentimiento queda bloqueada para procesamiento, publicación y narración.
- Visibilidad privada no se expone a usuarios generales.
- Aislamiento estricto por `memoria_id` (las bases de conocimiento nunca se cruzan).
- Todas las reglas validadas al 100% mediante suite en `apps/api/tests/test_privacy.py`.
