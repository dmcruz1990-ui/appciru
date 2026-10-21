import type { OfertaDetallada } from '@plastinex/shared'

/** Minúsculas y sin tildes, para que «medellin» encuentre «Medellín». */
export const sinTildes = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Cómo lo escriben los pacientes: «lipo», «nariz», «senos», «tummy tuck»…
 * Se suman a los textos del procedimiento para que la búsqueda libre lo encuentre.
 */
export const SINONIMOS: Record<string, string> = {
  'mamoplastia-aumento': 'aumento de senos aumento mamario implantes mamarios protesis senos busto pechos breast implants boob job',
  'mamoplastia-reduccion': 'reduccion de senos reduccion mamaria senos grandes breast reduction',
  mastopexia: 'levantamiento de senos lifting de senos elevacion mamaria senos caidos breast lift',
  lipoescultura: 'lipo liposuccion lipoescultura vaser lipo 360 marcacion liposuction lipo sculpture',
  lipoabdominoplastia: 'lipo abdomen lipo y abdominoplastia barriga abdomen plano tummy tuck lipo',
  abdominoplastia: 'abdomen barriga cirugia de abdomen piel abdomen tummy tuck abdominoplasty',
  gluteoplastia: 'gluteos cola nalgas aumento de gluteos bbl brazilian butt lift butt',
  rinoplastia: 'nariz cirugia de nariz rino perfilamiento nasal nose job rhinoplasty',
  blefaroplastia: 'parpados ojos bolsas ojos cirugia de parpados eyelid surgery eyelids',
  'lifting-facial': 'estiramiento facial cara rejuvenecimiento facial lifting cara facelift face lift',
}

/** Palabras que no filtran: «quiero una cirugía de nariz en Cali» busca «nariz» y «cali». */
const VACIAS = new Set(
  'de del la las el los en y o a al para con por un una mi me quiero hacer hacerme busco cirugia cirugias plastica estetica the in of for a an my i want surgery plastic cosmetic near'.split(' '),
)

/** Todas las palabras de la búsqueda aparecen en alguno de los textos. */
export function coincide(q: string, ...textos: (string | null | undefined)[]) {
  const palabras = sinTildes(q).split(/[\s,.;]+/).filter((p) => p && !VACIAS.has(p))
  if (!palabras.length) return true
  const todo = sinTildes(textos.filter(Boolean).join(' '))
  return palabras.every((p) => todo.includes(p))
}

/**
 * Textos por los que se puede encontrar una oferta: procedimiento (en ambos idiomas),
 * clínica, cirujano, especialidad, ciudad y país.
 */
export const textosOferta = (d: OfertaDetallada, pais: (codigo: string) => string) => [
  d.procedimiento.nombre,
  d.procedimiento.nombre_en,
  d.procedimiento.categoria,
  SINONIMOS[d.procedimiento.id],
  d.institucion.nombre,
  d.profesional?.nombre,
  d.profesional?.especialidad,
  d.profesional?.especialidad_en,
  d.ciudad.nombre,
  d.ciudad.nombre_en,
  d.ciudad.departamento,
  pais(d.ciudad.pais),
]
