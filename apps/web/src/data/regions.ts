export interface RegionDistrict {
  id: string;
  nombre: string;
  lugar: string;
  keywords: string[];
}

export interface RegionTheme {
  id: string;
  label: string;
  keywords: string[];
}

export interface RegionData {
  id: string;
  nombre: string;
  provincia: string;
  canton: string;
  imagen: string;
  descripcion: string;
  fundacion: string;
  altitud: string;
  keywords: string[];
  distritos: RegionDistrict[];
  temas: RegionTheme[];
}

export function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const REGIONS: RegionData[] = [
  {
    id: 'palmares',
    nombre: 'Palmares',
    provincia: 'Alajuela',
    canton: 'Cantón de Palmares',
    imagen: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Tierra de cafetales, mangos y trapiches. Su memoria reúne la construcción del templo de piedra, las fiestas cívicas y la solidaridad de sus comunidades.',
    fundacion: '1888',
    altitud: '1.028 m.s.n.m.',
    keywords: ['palmares'],
    distritos: [
      { id: 'todos', nombre: 'Todo el cantón', lugar: 'Palmares, Costa Rica', keywords: [] },
      { id: 'zaragoza', nombre: 'Zaragoza', lugar: 'Zaragoza, Palmares, Costa Rica', keywords: ['zaragoza'] },
      { id: 'rincon', nombre: 'Rincón de Zaragoza', lugar: 'Rincón de Zaragoza, Palmares, Costa Rica', keywords: ['rincon de zaragoza'] },
      { id: 'centro', nombre: 'Palmares Centro', lugar: 'Palmares Centro, Alajuela, Costa Rica', keywords: ['palmares centro'] },
      { id: 'granja', nombre: 'La Granja', lugar: 'La Granja, Palmares, Costa Rica', keywords: ['la granja'] },
      { id: 'buenos-aires', nombre: 'Buenos Aires', lugar: 'Buenos Aires, Palmares, Costa Rica', keywords: ['buenos aires'] },
    ],
    temas: [
      { id: 'todos', label: 'Todas las tradiciones', keywords: [] },
      { id: 'trapiche', label: 'Trapiches y café', keywords: ['trapiche', 'cafe', 'cafetal', 'dulce', 'cana'] },
      { id: 'parteria', label: 'Salud y partería', keywords: ['partera', 'parto', 'salud', 'manzanilla'] },
      { id: 'templo', label: 'Templo de piedra', keywords: ['templo', 'piedra', 'mercedes'] },
      { id: 'solidaridad', label: 'Solidaridad y terremoto', keywords: ['terremoto', 'solidaridad', 'olla', 'comunidad'] },
    ],
  },
  {
    id: 'san-ramon',
    nombre: 'San Ramón',
    provincia: 'Alajuela',
    canton: 'Cantón de San Ramón',
    imagen: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Cuna de poetas, educadores y beneficios de café. Sus calles guardan la memoria de las ferias, las retretas y las rutas de bueyes que bajaban del valle.',
    fundacion: '1854',
    altitud: '1.057 m.s.n.m.',
    keywords: ['san ramon'],
    distritos: [
      { id: 'todos', nombre: 'Todo el cantón', lugar: 'San Ramón, Alajuela, Costa Rica', keywords: [] },
      { id: 'centro', nombre: 'San Ramón Centro', lugar: 'San Ramón Centro, San Ramón, Alajuela', keywords: ['san ramon centro'] },
      { id: 'san-juan', nombre: 'San Juan', lugar: 'San Juan, San Ramón, Alajuela', keywords: ['san juan'] },
      { id: 'santiago', nombre: 'Santiago', lugar: 'Santiago, San Ramón, Alajuela', keywords: ['santiago'] },
      { id: 'volio', nombre: 'Volio', lugar: 'Volio, San Ramón, Alajuela', keywords: ['volio'] },
      { id: 'alfaro', nombre: 'Alfaro', lugar: 'Alfaro, San Ramón, Alajuela', keywords: ['alfaro'] },
    ],
    temas: [
      { id: 'todos', label: 'Todas las tradiciones', keywords: [] },
      { id: 'cafe', label: 'Café y ferias', keywords: ['cafe', 'cafetal', 'feria', 'beneficio'] },
      { id: 'boyeros', label: 'Boyeros y carretas', keywords: ['buey', 'boyero', 'carreta', 'yunta'] },
      { id: 'educacion', label: 'Educación y poesía', keywords: ['escuela', 'maestra', 'poeta', 'educacion'] },
      { id: 'musica', label: 'Música y retretas', keywords: ['musica', 'banda', 'retreta', 'partitura'] },
    ],
  },
  {
    id: 'grecia',
    nombre: 'Grecia',
    provincia: 'Alajuela',
    canton: 'Cantón de Grecia',
    imagen: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Ciudad de flores y alfareros. La memoria de sus hornos de barro, sus bandas musicales y la iglesia de hierro se conserva en las voces de sus mayores.',
    fundacion: '1834',
    altitud: '999 m.s.n.m.',
    keywords: ['grecia'],
    distritos: [
      { id: 'todos', nombre: 'Todo el cantón', lugar: 'Grecia, Alajuela, Costa Rica', keywords: [] },
      { id: 'centro', nombre: 'Grecia Centro', lugar: 'Grecia Centro, Grecia, Alajuela', keywords: ['grecia centro'] },
      { id: 'san-roque', nombre: 'San Roque', lugar: 'San Roque, Grecia, Alajuela', keywords: ['san roque'] },
      { id: 'tacares', nombre: 'Tacares', lugar: 'Tacares, Grecia, Alajuela', keywords: ['tacares'] },
      { id: 'puente-piedra', nombre: 'Puente de Piedra', lugar: 'Puente de Piedra, Grecia, Alajuela', keywords: ['puente de piedra'] },
      { id: 'san-isidro', nombre: 'San Isidro', lugar: 'San Isidro, Grecia, Alajuela', keywords: ['san isidro'] },
    ],
    temas: [
      { id: 'todos', label: 'Todas las tradiciones', keywords: [] },
      { id: 'alfareria', label: 'Alfarería y barro', keywords: ['alfareria', 'alfarera', 'barro', 'ceramica', 'horno'] },
      { id: 'flores', label: 'Flores y jardines', keywords: ['flor', 'flores', 'jardin', 'cultivo'] },
      { id: 'musica', label: 'Música y retretas', keywords: ['musica', 'banda', 'retreta', 'partitura'] },
      { id: 'templo', label: 'Iglesia de hierro', keywords: ['iglesia', 'templo', 'hierro'] },
    ],
  },
  {
    id: 'naranjo',
    nombre: 'Naranjo',
    provincia: 'Alajuela',
    canton: 'Cantón de Naranjo',
    imagen: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Tierra de café de altura, casonas de patio y trapiches de caña. Sus beneficios marcaron el ritmo de las cosechas y la vida de las familias del cantón.',
    fundacion: '1886',
    altitud: '1.092 m.s.n.m.',
    keywords: ['naranjo'],
    distritos: [
      { id: 'todos', nombre: 'Todo el cantón', lugar: 'Naranjo, Alajuela, Costa Rica', keywords: [] },
      { id: 'centro', nombre: 'Naranjo Centro', lugar: 'Naranjo Centro, Naranjo, Alajuela', keywords: ['naranjo centro'] },
      { id: 'san-miguel', nombre: 'San Miguel', lugar: 'San Miguel, Naranjo, Alajuela', keywords: ['san miguel'] },
      { id: 'cirri', nombre: 'Cirrí', lugar: 'Cirrí, Naranjo, Alajuela', keywords: ['cirri'] },
      { id: 'palmitos', nombre: 'Palmitos', lugar: 'Palmitos, Naranjo, Alajuela', keywords: ['palmitos'] },
      { id: 'san-jeronimo', nombre: 'San Jerónimo', lugar: 'San Jerónimo, Naranjo, Alajuela', keywords: ['san jeronimo'] },
    ],
    temas: [
      { id: 'todos', label: 'Todas las tradiciones', keywords: [] },
      { id: 'cafe', label: 'Café y beneficios', keywords: ['cafe', 'cafetal', 'beneficio', 'cosecha'] },
      { id: 'trapiche', label: 'Trapiches de caña', keywords: ['trapiche', 'cana', 'dulce'] },
      { id: 'casonas', label: 'Casonas y arquitectura', keywords: ['casona', 'patio', 'arquitectura'] },
      { id: 'ferias', label: 'Ferias y mercados', keywords: ['feria', 'mercado', 'agricultor'] },
    ],
  },
  {
    id: 'atenas',
    nombre: 'Atenas',
    provincia: 'Alajuela',
    canton: 'Cantón de Atenas',
    imagen: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Famoso por su clima privilegiado, sus miradores y la cuajada de sus ferias. La vida de sus productores conserva sabores y caminos de tierra.',
    fundacion: '1868',
    altitud: '698 m.s.n.m.',
    keywords: ['atenas'],
    distritos: [
      { id: 'todos', nombre: 'Todo el cantón', lugar: 'Atenas, Alajuela, Costa Rica', keywords: [] },
      { id: 'centro', nombre: 'Atenas Centro', lugar: 'Atenas Centro, Atenas, Alajuela', keywords: ['atenas centro'] },
      { id: 'concepcion', nombre: 'Concepción', lugar: 'Concepción, Atenas, Alajuela', keywords: ['concepcion'] },
      { id: 'santa-eulalia', nombre: 'Santa Eulalia', lugar: 'Santa Eulalia, Atenas, Alajuela', keywords: ['santa eulalia'] },
      { id: 'morazan', nombre: 'Morazán', lugar: 'Morazán, Atenas, Alajuela', keywords: ['morazan'] },
      { id: 'san-isidro', nombre: 'San Isidro', lugar: 'San Isidro, Atenas, Alajuela', keywords: ['san isidro'] },
    ],
    temas: [
      { id: 'todos', label: 'Todas las tradiciones', keywords: [] },
      { id: 'cuajada', label: 'Cuajada y lácteos', keywords: ['cuajada', 'leche', 'queso', 'lacteo'] },
      { id: 'ferias', label: 'Ferias del agricultor', keywords: ['feria', 'agricultor', 'mercado'] },
      { id: 'cafe', label: 'Café y campo', keywords: ['cafe', 'cafetal', 'campo'] },
      { id: 'miradores', label: 'Miradores y clima', keywords: ['mirador', 'montana', 'clima', 'paisaje'] },
    ],
  },
  {
    id: 'zarcero',
    nombre: 'Zarcero',
    provincia: 'Alajuela',
    canton: 'Cantón de Zarcero',
    imagen: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    descripcion:
      'Jardines topiarios, clima fresco y tradición lechera. Sus cipreses esculpidos y la iglesia del centro son parte de la memoria viva del cantón.',
    fundacion: '1915',
    altitud: '1.724 m.s.n.m.',
    keywords: ['zarcero'],
    distritos: [
      { id: 'todos', nombre: 'Todo el cantón', lugar: 'Zarcero, Alajuela, Costa Rica', keywords: [] },
      { id: 'centro', nombre: 'Zarcero Centro', lugar: 'Zarcero Centro, Zarcero, Alajuela', keywords: ['zarcero centro'] },
      { id: 'laguna', nombre: 'Laguna', lugar: 'Laguna, Zarcero, Alajuela', keywords: ['laguna'] },
      { id: 'tapezco', nombre: 'Tapezco', lugar: 'Tapezco, Zarcero, Alajuela', keywords: ['tapezco'] },
      { id: 'palmira', nombre: 'Palmira', lugar: 'Palmira, Zarcero, Alajuela', keywords: ['palmira'] },
      { id: 'guadalupe', nombre: 'Guadalupe', lugar: 'Guadalupe, Zarcero, Alajuela', keywords: ['guadalupe'] },
    ],
    temas: [
      { id: 'todos', label: 'Todas las tradiciones', keywords: [] },
      { id: 'topiarios', label: 'Topiarios y jardines', keywords: ['topiario', 'jardin', 'cipres', 'poda'] },
      { id: 'iglesia', label: 'Iglesia y comunidad', keywords: ['iglesia', 'templo', 'piedra', 'parroquia'] },
      { id: 'lecheria', label: 'Leche y quesos', keywords: ['leche', 'lecheria', 'queso', 'ganado'] },
      { id: 'musica', label: 'Música y retretas', keywords: ['musica', 'banda', 'retreta'] },
    ],
  },
];

export function getRegionForPlace(place: string): RegionData | undefined {
  const normalized = normalizeText(place);
  return REGIONS.find(region =>
    region.keywords.some(keyword => normalized.includes(normalizeText(keyword)))
  );
}

export function matchesKeywords(text: string, keywords: string[]): boolean {
  if (!keywords.length) return true;
  const normalized = normalizeText(text);
  return keywords.some(keyword => normalized.includes(normalizeText(keyword)));
}
