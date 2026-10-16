import type { Catalogo, OfertaDetallada } from './catalogo'
import { detallarOfertas } from './catalogo'
import type { Alojamiento, TipoAlojamiento } from './tipos'

export type Encaje = 'dentro' | 'posible' | 'encima' | 'sin_precio'

export interface PlanEstimado {
  d: OfertaDetallada
  alojamiento: Alojamiento | null
  noches: number
  desde: number | null
  hasta: number | null
  encaje: Encaje
}

export interface CriteriosPlan {
  procedimiento?: string
  ciudad?: string
  presupuesto?: number
  /** Noches de estadía; si no se indica, se usa la sugerida del procedimiento. */
  noches?: number
  conAlojamiento: boolean
  tipoAlojamiento?: TipoAlojamiento | ''
}

/**
 * Arma, para cada opción publicada, un plan orientativo: rango de la cirugía + el alojamiento más económico
 * de la ciudad (del tipo pedido) por las noches indicadas, y lo compara con el presupuesto del paciente.
 */
export function planesPorPresupuesto(c: Catalogo, k: CriteriosPlan): PlanEstimado[] {
  const planes = detallarOfertas(c)
    .filter((d) => (!k.procedimiento || d.procedimiento.id === k.procedimiento) && (!k.ciudad || d.ciudad.id === k.ciudad))
    .map((d): PlanEstimado => {
      const noches = k.conAlojamiento ? (k.noches ?? d.procedimiento.estadia_sugerida_dias ?? 7) : 0
      const alojamiento = k.conAlojamiento
        ? (c.alojamientos
            .filter((a) => a.publicado && a.ciudad_id === d.ciudad.id && a.precio_noche_desde && (!k.tipoAlojamiento || a.tipo === k.tipoAlojamiento))
            .sort((a, b) => a.precio_noche_desde! - b.precio_noche_desde!)[0] ?? null)
        : null
      const costoAloj = alojamiento ? alojamiento.precio_noche_desde! * noches : 0
      const min = d.oferta.precio_min ?? d.oferta.precio_max
      const max = d.oferta.precio_max ?? d.oferta.precio_min
      const desde = min != null ? min + costoAloj : null
      const hasta = max != null ? max + costoAloj : null
      let encaje: Encaje = 'sin_precio'
      if (desde != null && hasta != null) {
        if (!k.presupuesto || hasta <= k.presupuesto) encaje = 'dentro'
        else if (desde <= k.presupuesto) encaje = 'posible'
        else encaje = 'encima'
      }
      return { d, alojamiento, noches, desde, hasta, encaje }
    })
  const orden: Record<Encaje, number> = { dentro: 0, posible: 1, sin_precio: 2, encima: 3 }
  return planes.sort((a, b) => orden[a.encaje] - orden[b.encaje] || (a.desde ?? Infinity) - (b.desde ?? Infinity))
}

export interface GuiaPrecio {
  promedio: number
  minimo: number
  maximo: number
  opciones: number
  porCiudad: { ciudad: string; promedio: number; minimo: number; maximo: number; opciones: number }[]
}

/** Guía de precios de un procedimiento a partir de los rangos publicados (punto medio de cada oferta). */
export function guiaPrecios(c: Catalogo, procedimientoId: string): GuiaPrecio | null {
  const ofertas = detallarOfertas(c).filter((d) => d.procedimiento.id === procedimientoId && (d.oferta.precio_min != null || d.oferta.precio_max != null))
  if (!ofertas.length) return null
  const medio = (d: OfertaDetallada) => ((d.oferta.precio_min ?? d.oferta.precio_max!) + (d.oferta.precio_max ?? d.oferta.precio_min!)) / 2
  const resumen = (xs: OfertaDetallada[]) => ({
    promedio: Math.round(xs.reduce((s, d) => s + medio(d), 0) / xs.length / 10000) * 10000,
    minimo: Math.min(...xs.map((d) => d.oferta.precio_min ?? d.oferta.precio_max!)),
    maximo: Math.max(...xs.map((d) => d.oferta.precio_max ?? d.oferta.precio_min!)),
    opciones: xs.length,
  })
  const ciudades = [...new Set(ofertas.map((d) => d.ciudad.nombre))]
  return {
    ...resumen(ofertas),
    porCiudad: ciudades.map((ciudad) => ({ ciudad, ...resumen(ofertas.filter((d) => d.ciudad.nombre === ciudad)) })).sort((a, b) => a.promedio - b.promedio),
  }
}
