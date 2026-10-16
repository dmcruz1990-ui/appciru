import type { DB } from './store'
import type { Oferta } from './types'

export interface OfertaDetallada {
  oferta: Oferta
  medico: DB['medicos'][number]
  procedimiento: DB['procedimientos'][number]
  clinica: DB['clinicas'][number]
  ciudad: DB['ciudades'][number]
}

export function detallarOferta(db: DB, oferta: Oferta): OfertaDetallada | undefined {
  const medico = db.medicos.find((m) => m.id === oferta.medicoId)
  const procedimiento = db.procedimientos.find((p) => p.id === oferta.procedimientoId)
  const clinica = db.clinicas.find((c) => c.id === oferta.clinicaId)
  const ciudad = clinica && db.ciudades.find((c) => c.id === clinica.ciudadId)
  if (!medico || !procedimiento || !clinica || !ciudad) return undefined
  return { oferta, medico, procedimiento, clinica, ciudad }
}

/** Ofertas visibles para el cliente: la oferta y todo lo que referencia deben estar activos. */
export function ofertasPublicas(db: DB): OfertaDetallada[] {
  return db.ofertas
    .filter((o) => o.activo)
    .map((o) => detallarOferta(db, o))
    .filter((d): d is OfertaDetallada => !!d && d.medico.activo && d.procedimiento.activo && d.clinica.activo)
}

export const nombreCiudad = (db: DB, id: string) => db.ciudades.find((c) => c.id === id)?.nombre ?? id
