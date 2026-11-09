export interface NavLinkItem {
  view: string;
  label: string;
}

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  id: string;
  title: string;
  shortTitle: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export const FOUNDATION_NAV_LINKS: NavLinkItem[] = [
  { view: 'sobre_nosotros', label: 'Sobre nosotros' },
  { view: 'preguntas', label: 'Preguntas frecuentes' },
  { view: 'contacto', label: 'Contacto' }
];

export const LEGAL_NAV_LINKS: NavLinkItem[] = [
  { view: 'terminos', label: 'Acuerdo de uso' },
  { view: 'privacidad', label: 'Política de privacidad' },
  { view: 'cookies', label: 'Política de cookies' },
  { view: 'accesibilidad', label: 'Accesibilidad' },
  { view: 'aviso_legal', label: 'Aviso legal' },
  { view: 'etica', label: 'Código de ética' }
];

export const FOUNDATION_VALUES = [
  {
    title: 'Dignidad',
    text: 'Cada persona y cada familia merecen un trato respetuoso, sin exposición innecesaria ni juicios sobre su historia.'
  },
  {
    title: 'Consentimiento',
    text: 'La palabra de la persona protagonista es el punto de partida. Sin autorización clara no se publica ni se procesa un relato.'
  },
  {
    title: 'Veracidad',
    text: 'Distinguimos siempre entre el testimonio, el documento y la interpretación. No completamos vacíos con invenciones.'
  },
  {
    title: 'Cercanía',
    text: 'Escuchamos con paciencia, en lenguaje sencillo y con acompañamiento humano durante todo el proceso.'
  },
  {
    title: 'Transparencia',
    text: 'Explicamos cómo se resguarda cada expediente, quién puede consultarlo y qué límites tiene la tecnología.'
  },
  {
    title: 'Sostenibilidad',
    text: 'Construimos un archivo que pueda cuidarse en el tiempo por la propia comunidad y sus instituciones locales.'
  }
];

export const FOUNDATION_TIMELINE = [
  {
    year: '2019',
    title: 'Primeras conversaciones comunitarias',
    text: 'Un grupo de vecinos y docentes de Palmares comenzó a grabar relatos de personas mayores en visitas domiciliarias.'
  },
  {
    year: '2021',
    title: 'Nace la Fundación Legado Vivo',
    text: 'La iniciativa se organiza como fundación sin fines de lucro para dar continuidad, orden y respaldo ético al archivo oral.'
  },
  {
    year: '2023',
    title: 'Archivo comunitario y curaduría',
    text: 'Se consolida un equipo de curaduría y un protocolo de consentimiento informado para cada expediente.'
  },
  {
    year: '2026',
    title: 'Memoria Viva en línea',
    text: 'La plataforma abre la consulta pública de los relatos autorizados y fortalece la participación de las regiones de Alajuela.'
  }
];

export const GOVERNANCE_BODIES = [
  {
    title: 'Asamblea General',
    text: 'Órgano máximo de decisión. Aprueba el plan anual, el presupuesto y los lineamientos éticos de la Fundación.'
  },
  {
    title: 'Consejo Directivo',
    text: 'Da seguimiento a la estrategia institucional, las alianzas y la sostenibilidad del archivo comunitario.'
  },
  {
    title: 'Dirección Ejecutiva',
    text: 'Coordina la operación diaria, el equipo de trabajo y la relación con familias, comunidades e instituciones.'
  },
  {
    title: 'Comité de Ética',
    text: 'Revisa casos sensibles, conflictos de consentimiento y el uso responsable de la tecnología en la memoria.'
  },
  {
    title: 'Equipo de Curaduría',
    text: 'Verifica fuentes, resguarda documentos y prepara los relatos para su consulta pública autorizada.'
  }
];

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Sobre el archivo',
    items: [
      {
        question: '¿Quién puede consultar los relatos de Memoria Viva?',
        answer:
          'Los relatos marcados como públicos pueden consultarse desde la plataforma. Los expedientes de acceso restringido requieren autorización de la persona protagonista, su familia o el equipo de curaduría.'
      },
      {
        question: '¿Cómo se decide qué historias se publican?',
        answer:
          'Cada persona o familia define la visibilidad de su relato en el consentimiento informado. El equipo de curaduría verifica la documentación y respeta esa decisión antes de publicar.'
      },
      {
        question: '¿Puedo corregir o retirar una historia?',
        answer:
          'Sí. La persona protagonista o su representación legal puede solicitar correcciones, ampliaciones o el retiro del contenido escribiendo a contacto@legadovivo.cr.'
      }
    ]
  },
  {
    title: 'Sobre el narrador de inteligencia artificial',
    items: [
      {
        question: '¿La voz que responde es una persona real?',
        answer:
          'No. Es una lectura sintética acompañada por un sistema de inteligencia artificial. Siempre se identifica como IA y no pretende sustituir la voz original de la persona.'
      },
      {
        question: '¿De dónde obtiene la información el narrador?',
        answer:
          'Únicamente de los aportes que fueron validados por el equipo de curaduría para ese expediente. Cuando no encuentra información, lo dice con claridad y no inventa respuestas.'
      },
      {
        question: '¿Puedo cambiar la voz o el ritmo de lectura?',
        answer:
          'Sí. En la pestaña del narrador puede abrir “Ajustes de voz”, elegir una voz disponible en su dispositivo y modificar el ritmo de lectura.'
      }
    ]
  },
  {
    title: 'Participación y contacto',
    items: [
      {
        question: '¿Cómo puedo compartir la historia de un familiar?',
        answer:
          'Puede iniciar el proceso desde “Escribe tu Historia”. El equipo le acompañará en la entrevista, la firma del consentimiento y la revisión del material.'
      },
      {
        question: '¿Reciben fotografías, cartas y documentos?',
        answer:
          'Sí. Los documentos se digitalizan con autorización y se incorporan al expediente cuando aportan contexto verificable al relato oral.'
      }
    ]
  }
];

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terminos: {
    id: 'terminos',
    title: 'Acuerdo de uso de la plataforma Memoria Viva',
    shortTitle: 'Acuerdo de uso',
    updated: '8 de noviembre de 2026',
    intro:
      'Este acuerdo regula el acceso y uso de la plataforma Memoria Viva, operada por la Fundación Legado Vivo. Al utilizar el sitio, usted acepta las condiciones descritas en este documento.',
    sections: [
      {
        title: '1. Objeto y aceptación',
        paragraphs: [
          'Memoria Viva es una plataforma de custodia, consulta y difusión de historia oral. Su finalidad es educativa, cultural y comunitaria.',
          'El acceso a la plataforma implica la aceptación de este acuerdo y de la Política de privacidad. Si no está de acuerdo, debe abstenerse de utilizar el servicio.'
        ]
      },
      {
        title: '2. Acceso y cuentas de usuario',
        paragraphs: [
          'Algunas secciones requieren una cuenta institucional. La persona usuaria es responsable de mantener la confidencialidad de sus credenciales y de informar cualquier uso no autorizado.',
          'La Fundación puede suspender o limitar el acceso cuando exista un uso indebido, un riesgo de seguridad o un incumplimiento de estos términos.'
        ]
      },
      {
        title: '3. Uso permitido del archivo',
        paragraphs: [
          'La consulta de los relatos debe realizarse con fines de investigación, educación, divulgación cultural o memoria comunitaria.',
          'No está permitido utilizar el contenido para acoso, discriminación, explotación comercial no autorizada, suplantación de identidad o cualquier actividad contraria a la dignidad de las personas protagonistas.'
        ]
      },
      {
        title: '4. Relatos, documentos y contenido de terceros',
        paragraphs: [
          'Los relatos pertenecen a las personas que los comparten y a sus familias. La Fundación actúa como custodia, no como propietaria de las memorias.',
          'Las fotografías, cartas y documentos incorporados se utilizan únicamente con la autorización registrada en el expediente correspondiente.'
        ]
      },
      {
        title: '5. Propiedad intelectual',
        paragraphs: [
          'El diseño, los textos institucionales, la estructura de la plataforma y los materiales producidos por la Fundación están protegidos por la legislación aplicable.',
          'Las citas de relatos deben identificar a la persona protagonista, el aporte y la fuente, conforme a la información disponible en cada expediente.'
        ]
      },
      {
        title: '6. Narrador de inteligencia artificial',
        paragraphs: [
          'El narrador interactivo es una herramienta de apoyo que responde exclusivamente con base en aportes validados. No es una persona, no representa la voluntad de la persona protagonista y no sustituye la consulta del testimonio original.',
          'Sus respuestas pueden contener limitaciones propias de un sistema automatizado. La fuente primaria citada prevalece siempre sobre la respuesta generada.'
        ]
      },
      {
        title: '7. Disponibilidad y enlaces',
        paragraphs: [
          'La Fundación procura mantener la plataforma disponible, pero no garantiza un funcionamiento ininterrumpido. Pueden realizarse mantenimientos, actualizaciones o ajustes de seguridad sin previo aviso.',
          'Los enlaces a sitios de terceros se ofrecen como referencia. La Fundación no controla ni respalda necesariamente su contenido.'
        ]
      },
      {
        title: '8. Modificaciones y legislación aplicable',
        paragraphs: [
          'Este acuerdo puede actualizarse para reflejar cambios normativos u operativos. La versión vigente se publicará siempre en esta página con su fecha de actualización.',
          'El uso de la plataforma se rige por la legislación de la República de Costa Rica, en particular por las normas de protección de datos personales y de derechos culturales.'
        ]
      },
      {
        title: '9. Contacto',
        paragraphs: [
          'Para consultas sobre este acuerdo, escriba a contacto@legadovivo.cr o a la dirección indicada en la sección de Contacto.'
        ]
      }
    ]
  },
  privacidad: {
    id: 'privacidad',
    title: 'Política de privacidad y tratamiento de datos personales',
    shortTitle: 'Privacidad',
    updated: '8 de noviembre de 2026',
    intro:
      'La Fundación Legado Vivo protege los datos personales de las personas que comparten su historia, consultan el archivo o se relacionan con la institución.',
    sections: [
      {
        title: '1. Responsable del tratamiento',
        paragraphs: [
          'La Fundación Legado Vivo, con sede en Palmares, Alajuela, Costa Rica, es la responsable del tratamiento de los datos personales incorporados en la plataforma.',
          'Las consultas sobre privacidad pueden dirigirse a privacidad@legadovivo.cr.'
        ]
      },
      {
        title: '2. Datos que recopilamos',
        bullets: [
          'Datos de identificación y contacto de las personas participantes, como nombre, correo electrónico y teléfono.',
          'Relatos orales, transcripciones, fotografías y documentos aportados voluntariamente.',
          'Datos de uso de la plataforma necesarios para la seguridad, la auditoría y el funcionamiento del servicio.',
          'Preferencias de accesibilidad, como el tamaño del texto y las opciones de voz del narrador.'
        ]
      },
      {
        title: '3. Finalidades y base de legitimación',
        paragraphs: [
          'Los datos se utilizan para registrar, custodiar, validar y difundir los relatos autorizados; atender solicitudes de las personas usuarias; mantener la seguridad del archivo y cumplir obligaciones legales.',
          'El tratamiento se fundamenta en el consentimiento informado de las personas protagonistas, en la ejecución de la relación institucional y en el interés legítimo de preservar el patrimonio oral.'
        ]
      },
      {
        title: '4. Datos sensibles y consentimiento',
        paragraphs: [
          'Los relatos pueden contener información sensible sobre salud, familia, creencias o experiencias personales. Por esa razón, cada expediente requiere un consentimiento específico que define la visibilidad y el uso autorizado.',
          'La persona protagonista puede solicitar la corrección o el retiro de su relato en cualquier momento, salvo las obligaciones de conservación que resulten aplicables.'
        ]
      },
      {
        title: '5. Conservación',
        paragraphs: [
          'Los datos se conservan mientras el expediente permanezca activo y sea necesario para las finalidades autorizadas. Cuando corresponde, se aplican procesos de resguardo, anonimización o eliminación segura.'
        ]
      },
      {
        title: '6. Comunicación a terceros',
        paragraphs: [
          'La Fundación no vende datos personales. Solo comparte información con proveedores tecnológicos que apoyan el funcionamiento de la plataforma, bajo deberes de confidencialidad y seguridad, o cuando exista una obligación legal.',
          'Los relatos públicos pueden ser consultados por terceros conforme a la visibilidad autorizada en cada expediente.'
        ]
      },
      {
        title: '7. Derechos de las personas',
        bullets: [
          'Conocer qué datos personales se conservan y con qué finalidad.',
          'Solicitar acceso, corrección, actualización o eliminación de la información.',
          'Revocar el consentimiento para usos no esenciales.',
          'Oponerse a tratamientos que no cuenten con una base legítima.',
          'Presentar una consulta o reclamo ante la autoridad competente en materia de protección de datos.'
        ]
      },
      {
        title: '8. Seguridad',
        paragraphs: [
          'La Fundación aplica medidas técnicas y organizativas razonables para proteger la información, incluyendo controles de acceso, registro de auditoría y resguardo de documentos. Ningún sistema es completamente infalible, por lo que se revisan periódicamente los controles.'
        ]
      },
      {
        title: '9. Contacto y actualizaciones',
        paragraphs: [
          'Esta política puede actualizarse para reflejar cambios en el tratamiento de datos o en la normativa aplicable. La fecha de la versión vigente aparece al inicio del documento.',
          'Para ejercer sus derechos o realizar una consulta, escriba a privacidad@legadovivo.cr.'
        ]
      }
    ]
  },
  cookies: {
    id: 'cookies',
    title: 'Política de cookies y tecnologías similares',
    shortTitle: 'Cookies',
    updated: '8 de noviembre de 2026',
    intro:
      'Esta política explica cómo Memoria Viva utiliza cookies y almacenamiento local para recordar preferencias y mantener la seguridad de la plataforma.',
    sections: [
      {
        title: '1. ¿Qué son las cookies?',
        paragraphs: [
          'Las cookies son pequeños archivos que un sitio web guarda en el navegador. También puede utilizarse almacenamiento local para conservar preferencias de accesibilidad y de lectura.'
        ]
      },
      {
        title: '2. Cookies necesarias',
        paragraphs: [
          'Son indispensables para el inicio de sesión, la seguridad de las cuentas y el funcionamiento básico de la plataforma. Sin ellas, algunos servicios no pueden operar correctamente.'
        ]
      },
      {
        title: '3. Preferencias de accesibilidad',
        paragraphs: [
          'Memoria Viva guarda en el navegador el tamaño del texto y las preferencias de voz del narrador. Esta información permanece en el dispositivo y no se utiliza para publicidad.'
        ]
      },
      {
        title: '4. Cookies de terceros',
        paragraphs: [
          'La plataforma puede apoyarse en servicios de infraestructura o de imágenes que aplican sus propias políticas. La Fundación no utiliza cookies publicitarias para perfilado comercial.'
        ]
      },
      {
        title: '5. Cómo gestionar las cookies',
        paragraphs: [
          'Puede configurar su navegador para bloquear, eliminar o recibir avisos sobre cookies. Algunas funciones de la plataforma podrían dejar de funcionar si se deshabilitan las cookies necesarias.',
          'La eliminación del almacenamiento local restablece las preferencias de accesibilidad y voz.'
        ]
      },
      {
        title: '6. Actualizaciones',
        paragraphs: [
          'Esta política puede modificarse cuando cambien las tecnologías utilizadas o la normativa aplicable. La versión vigente se publica en esta página.'
        ]
      }
    ]
  },
  accesibilidad: {
    id: 'accesibilidad',
    title: 'Declaración de accesibilidad',
    shortTitle: 'Accesibilidad',
    updated: '8 de noviembre de 2026',
    intro:
      'La Fundación Legado Vivo busca que Memoria Viva sea un espacio utilizable por personas de todas las edades y capacidades, en especial por las personas mayores protagonistas del archivo.',
    sections: [
      {
        title: '1. Nuestro compromiso',
        paragraphs: [
          'Nos proponemos cumplir las pautas de accesibilidad para el contenido web WCAG 2.1 en nivel AA, incorporando mejoras continuas en el diseño, los contenidos y la tecnología.'
        ]
      },
      {
        title: '2. Medidas implementadas',
        bullets: [
          'Navegación completa mediante teclado y enlace para saltar al contenido principal.',
          'Estructura semántica con encabezados, listas y formularios etiquetados.',
          'Texto ampliable desde la barra superior y desde el menú móvil.',
          'Contraste de color cuidado y objetivos táctiles de tamaño adecuado.',
          'Lenguaje claro, párrafos breves y mensajes de error comprensibles.',
          'Lectura por voz del narrador con selección de voz y ritmo.',
          'Respeto de las preferencias de reducción de movimiento del sistema.'
        ]
      },
      {
        title: '3. Limitaciones conocidas',
        paragraphs: [
          'Algunas voces sintéticas dependen del navegador y del sistema operativo de cada dispositivo. Los documentos históricos digitalizados pueden presentar calidades de imagen variables por su antigüedad.'
        ]
      },
      {
        title: '4. Canal de contacto',
        paragraphs: [
          'Si encuentra una barrera de accesibilidad, escriba a accesibilidad@legadovivo.cr indicando la página, el dispositivo y la dificultad encontrada. Procuraremos responder en un plazo razonable y ofrecer una alternativa de acceso.'
        ]
      },
      {
        title: '5. Mejora continua',
        paragraphs: [
          'La accesibilidad se revisa en cada actualización relevante de la plataforma. Las observaciones de las personas usuarias son parte fundamental de ese proceso.'
        ]
      }
    ]
  },
  aviso_legal: {
    id: 'aviso_legal',
    title: 'Aviso legal e identidad institucional',
    shortTitle: 'Aviso legal',
    updated: '8 de noviembre de 2026',
    intro:
      'Este aviso identifica a la entidad responsable de Memoria Viva y establece las condiciones generales de responsabilidad sobre el sitio.',
    sections: [
      {
        title: '1. Titular del sitio',
        paragraphs: [
          'Memoria Viva es operada por la Fundación Legado Vivo, organización sin fines de lucro dedicada a la custodia del patrimonio oral en Palmares y los cantones de Alajuela, Costa Rica.',
          'Domicilio institucional: Palmares, Alajuela, Costa Rica. Correo electrónico: contacto@legadovivo.cr.'
        ]
      },
      {
        title: '2. Naturaleza de la información',
        paragraphs: [
          'Los contenidos del sitio tienen finalidad cultural, educativa y de divulgación. No constituyen asesoría legal, médica ni financiera.',
          'Las respuestas del narrador de inteligencia artificial se basan en relatos validados y no representan la opinión de la Fundación sobre hechos no documentados.'
        ]
      },
      {
        title: '3. Propiedad intelectual',
        paragraphs: [
          'Las marcas, textos institucionales, diseño y materiales propios de la Fundación están protegidos por la legislación aplicable. Los relatos y documentos de terceros se utilizan con la autorización registrada en cada expediente.'
        ]
      },
      {
        title: '4. Responsabilidad',
        paragraphs: [
          'La Fundación procura que la información publicada sea veraz y esté actualizada, pero no garantiza la ausencia de errores involuntarios. Las personas usuarias deben contrastar la información con las fuentes primarias cuando sea necesario.',
          'La Fundación no se responsabiliza por interrupciones técnicas ajenas a su control ni por el uso indebido que terceros hagan de la plataforma.'
        ]
      },
      {
        title: '5. Enlaces externos',
        paragraphs: [
          'Los enlaces a sitios de terceros se ofrecen como referencia. La Fundación no controla sus contenidos ni sus políticas de privacidad.'
        ]
      },
      {
        title: '6. Legislación aplicable',
        paragraphs: [
          'Este aviso se rige por la legislación de la República de Costa Rica. Cualquier controversia se someterá a los tribunales competentes de ese país.'
        ]
      }
    ]
  },
  etica: {
    id: 'etica',
    title: 'Código de ética y buen gobierno',
    shortTitle: 'Código de ética',
    updated: '8 de noviembre de 2026',
    intro:
      'Este código orienta la conducta del equipo, las personas voluntarias y los órganos de gobierno de la Fundación Legado Vivo en su trabajo con la memoria de las comunidades.',
    sections: [
      {
        title: '1. Principios rectores',
        paragraphs: [
          'La dignidad de las personas, el consentimiento informado, la veracidad, la confidencialidad y la cercanía comunitaria son la base de todas las decisiones institucionales.'
        ]
      },
      {
        title: '2. Consentimiento y autonomía',
        paragraphs: [
          'Ningún relato se registra, procesa o publica sin una autorización comprensible y documentada. La persona protagonista puede limitar el uso de su testimonio, solicitar correcciones o retirarlo.'
        ]
      },
      {
        title: '3. Trato digno y confidencialidad',
        paragraphs: [
          'El equipo evita la exposición innecesaria de información sensible y no utiliza los relatos para fines ajenos a la misión institucional. Las conversaciones y documentos se tratan con reserva.'
        ]
      },
      {
        title: '4. Veracidad y manejo de fuentes',
        paragraphs: [
          'Se distingue con claridad entre testimonio, documento, interpretación y contenido generado por tecnología. Las fuentes se citan y no se completan vacíos con suposiciones.'
        ]
      },
      {
        title: '5. Uso responsable de la inteligencia artificial',
        bullets: [
          'La IA se presenta siempre como tal y no se hace pasar por una persona.',
          'El narrador responde solo con aportes validados y cita su fuente.',
          'Cuando no existe información, se indica expresamente sin inventar.',
          'La tecnología no reemplaza el consentimiento, la curaduría ni el criterio humano.',
          'Se revisan los sesgos y limitaciones de las herramientas utilizadas.'
        ]
      },
      {
        title: '6. Conflictos de interés',
        paragraphs: [
          'Las personas vinculadas a la Fundación deben declarar cualquier interés personal, comercial o familiar que pueda influir en la selección, curaduría o difusión de un relato.'
        ]
      },
      {
        title: '7. Canal de denuncia',
        paragraphs: [
          'Las conductas contrarias a este código pueden comunicarse de forma confidencial a etica@legadovivo.cr. El Comité de Ética evaluará cada caso y adoptará las medidas que correspondan.'
        ]
      },
      {
        title: '8. Revisión',
        paragraphs: [
          'Este código se revisa periódicamente y se actualiza con la participación de los órganos de gobierno y la comunidad.'
        ]
      }
    ]
  }
};
