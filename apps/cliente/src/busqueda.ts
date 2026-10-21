import type { OfertaDetallada } from '@plastinex/shared'

/** Minúsculas y sin tildes, para que «medellin» encuentre «Medellín». */
export const sinTildes = (x: string) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Todas las palabras de la búsqueda aparecen en alguno de los textos. */
export function coincide(q: string, ...textos: (string | null | undefined)[]) {
  const palabras = sinTildes(q).split(/\s+/).filter(Boolean)
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
  d.institucion.nombre,
  d.profesional?.nombre,
  d.profesional?.especialidad,
  d.profesional?.especialidad_en,
  d.ciudad.nombre,
  d.ciudad.nombre_en,
  d.ciudad.departamento,
  pais(d.ciudad.pais),
]
