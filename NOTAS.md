# Memoria Viva - Fundación Legado Vivo (Palmares, Costa Rica)
## Registro de Decisiones de Arquitectura y Diseño (NOTAS.md)

### 1. Sistema de Diseño e Interfaz Institucional (Rediseño Formal y No-IA)
- **Navegación Lateral Institucional (Sidebar)**: Se sustituyó la barra horizontal de pestañas por una barra lateral corporativa con separación formal por módulos:
  1. *Patrimonio Cultural*: Exploración de Regiones y Territorios, Archivo de Personas y Buscador Histórico.
  2. *Participación y Transmisión*: "Guarda tus Memorias / Escribe tu Historia", Registro de Personas & Contrato Legal, y Carga de Aportes.
  3. *Curaduría y Verificación*: Mesa de Curaduría para el Gestor de Datos.
  4. *Administración Institucional*: Gestión de Usuarios y Bitácora de Auditoría.
- **Zona de Regiones y Territorios (Palmares)**:
  - Vista inicial orientada al territorio cultural: imagen representativa del cantón de Palmares (Alajuela), sinopsis histórica y filtros por distritos (*Zaragoza, Rincón de Zaragoza, Palmares Centro, La Granja*).
  - Filtros temáticos por tradiciones vivas (*Trapiches de dulce y café, Partería y salud comunitaria, Construcción del Templo de Piedra, Terremoto de 1955*).
  - Muestra a los **Guardianes de la Memoria** de esa región con acceso directo a su expediente.
- **Expediente de Memoria y Narrador Contextualizado**:
  - El narrador ya no es un chatbot genérico desconectado; se encuentra **integrado dentro del expediente biográfico de cada persona** (*PersonaDetalleView*).
  - El usuario explora primero las vivencias y aportes originales inmutables (textos, audios, fotos) y, si desea interactuar, abre la pestaña *"Consultar al Narrador de la Memoria"*, el cual responde en base a los testimonios validados de ese individuo.
- **Flujo Unificado: Registro de Persona + Contrato de Consentimiento**:
  - El consentimiento no es un formulario suelto; es un **Contrato Legal Formal de Custodia y Cesión Ética** que se celebra de manera indisoluble al momento de abrir el expediente de una persona.
  - Genera y certifica la huella criptográfica SHA-256 en tiempo real.
- **Módulo Educativo "Escribe tu Historia"**:
  - Landing informativa que explica en 4 fases cómo se recopilan, custodian y curan las memorias familiares en la Fundación Legado Vivo, orientada a las familias y personas adultas mayores.

### 2. Capa de IA y Modo Simulado (AI_MODE=mock)
- 4 interfaces desacopladas en `apps/api/app/ai/`:
  1. `TranscriptionInterface`: Transcripciones estructuradas de relatos orales de Palmares.
  2. `ImageAnalysisInterface`: Análisis iconográfico de fotos históricas.
  3. `LLMNarratorInterface`: Motor de respuesta basado en fragmentos validados. Regla estricta: si no hay evidencia responde exactamente `"no cuento con esa información"` sin inventar ni alucinar.
  4. `VoiceInterface`: Configuración para Web Speech API del navegador en español con cadencia pausada (rate: 0.9) para personas adultas mayores.

### 3. Almacenamiento y Base de Datos Híbrida
- **Desarrollo y Demo Local**: SQLite con modo de aislamiento y creación automática de tablas y semillas para ejecución inmediata.
- **Producción / Docker Compose**: PostgreSQL 16 con credenciales seguras vía `.env`.

### 4. Reglas del Dominio y Privacidad Verificadas por Pruebas Automáticas
- Memoria sin consentimiento queda bloqueada para procesamiento, publicación y narración.
- Visibilidad privada no se expone a usuarios generales.
- Aislamiento estricto por `memoria_id` (las bases de conocimiento nunca se cruzan).
- 8 pruebas automatizadas aprobadas al 100% en `apps/api/tests/`.

### 5. Identidad Visual Cálida y Accesibilidad para Personas Adultas Mayores
- **Paleta Terrestre, Madera y Sol Palmareño**:
  - Lienzo pergamino/arena: `#faf7f2`
  - Madera noble y café tostado: `#26170d`, `#442a17`
  - Ámbar soleado / terracota cálido: `#c05600`, `#9f4600`, `#fef6ee`
  - Verde bosque de integridad ética: `#1b6e39`, `#f0f8f2`
  - Bordes firmes y contrastados: `#d8ccba`, `#e3d9cb`
- **Eliminación Total de Estética 'Genérica de IA'**:
  - Cero degradados artificiales morados o neón (`bg-gradient-to-r` eliminado de paneles informativos).
  - Cero paneles ultra-redondeados de burbuja (`rounded-3xl` / `rounded-2xl`).
  - Cero badges y etiquetas de jerga técnica sin sentido ("P02", "P03", "P04", "Simulador IA v1.1").
  - Sustitución por terminología institucional respetuosa: *"Archivo General"*, *"Contrato de Custodia"*, *"Expediente Histórico"*, *"Fe Legal"*.
- **Diseño Ergonómico para Adultos Mayores**:
  - Tipografía base escalada a 19px con alto contraste (`#261b12` sobre fondos nítidos `#ffffff` y `#faf7f2`).
  - Titulares en fuente Serif editorial cálida (`font-serif`, Georgia / Cambria) para máxima legibilidad y solemnidad.
  - Botones y campos interactivos con objetivo táctil garantizado de al menos 48px de altura (`min-h-[48px]`).
  - Anillos de foco visibles de 3px en tono ámbar (`#c05600`) para navegación asistida o por teclado.
- **Fotografía Real del Patrimonio Palmareño**:
  - Paisajes reales de las colinas de cafetales de Palmares.
  - Retratos fidedignos para los guardianes de la memoria (*Don Chepe González*, *Doña Carmen Rojas*).
  - Vistas de objetos de labranza tradicional, trapiches y documentos familiares.
