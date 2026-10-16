// Capa de datos provisional: persiste en localStorage y sincroniza entre pestañas
// (la del cliente y la del panel). Más adelante se reemplaza por un backend
// (p. ej. Supabase) manteniendo la misma interfaz de funciones.
import { useSyncExternalStore } from 'react'
import * as seed from './seed'
import type {
  Alojamiento,
  Clinica,
  Configuracion,
  EstadoPedido,
  Medico,
  Oferta,
  Paciente,
  Pedido,
  Procedimiento,
  ServicioExtra,
  Ciudad,
} from './types'

export interface DB {
  version: number
  ciudades: Ciudad[]
  clinicas: Clinica[]
  medicos: Medico[]
  procedimientos: Procedimiento[]
  ofertas: Oferta[]
  alojamientos: Alojamiento[]
  extras: ServicioExtra[]
  pedidos: Pedido[]
  configuracion: Configuracion
}

const KEY = 'appciru.db'
const VERSION = 1

function semilla(): DB {
  return {
    version: VERSION,
    ciudades: seed.ciudades,
    clinicas: seed.clinicas,
    medicos: seed.medicos,
    procedimientos: seed.procedimientos,
    ofertas: seed.ofertas,
    alojamientos: seed.alojamientos,
    extras: seed.extras,
    pedidos: seed.pedidosDemo,
    configuracion: seed.configuracion,
  }
}

function cargar(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const db = JSON.parse(raw) as DB
      if (db.version === VERSION) return db
    }
  } catch {
    // almacenamiento no disponible o corrupto: se usa la semilla
  }
  return semilla()
}

let db: DB = cargar()
const oyentes = new Set<() => void>()

function guardar(siguiente: DB) {
  db = siguiente
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // sin persistencia, el estado vive solo en memoria
  }
  oyentes.forEach((fn) => fn())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      db = cargar()
      oyentes.forEach((fn) => fn())
    }
  })
}

function suscribir(fn: () => void) {
  oyentes.add(fn)
  return () => oyentes.delete(fn)
}

export function useDB(): DB {
  return useSyncExternalStore(suscribir, () => db)
}

export function getDB(): DB {
  return db
}

export function reiniciarDemo() {
  guardar(semilla())
}

// ---------- Cálculo del plan ----------

export interface PlanInput {
  ofertaId: string
  alojamientoId?: string
  noches: number
  extraIds: string[]
}

export function calcularTotales(d: DB, plan: PlanInput): Pedido['totales'] {
  const oferta = d.ofertas.find((o) => o.id === plan.ofertaId)
  const aloj = plan.alojamientoId ? d.alojamientos.find((a) => a.id === plan.alojamientoId) : undefined
  const cirugia = oferta?.precio ?? 0
  const alojamiento = aloj ? aloj.precioNoche * plan.noches : 0
  const extras = plan.extraIds.reduce((sum, id) => {
    const ex = d.extras.find((e) => e.id === id)
    if (!ex) return sum
    return sum + (ex.porNoche ? ex.precio * Math.max(plan.noches, 1) : ex.precio)
  }, 0)
  return { cirugia, alojamiento, extras, total: cirugia + alojamiento + extras }
}

// ---------- Pedidos ----------

export function crearPedido(input: PlanInput & { paciente: Paciente; fechaDeseada: string; comentarios?: string }): Pedido {
  const ahora = new Date().toISOString()
  const siguienteNum =
    db.pedidos.reduce((max, p) => Math.max(max, Number(p.id.split('-')[1]) || 0), 1000) + 1
  const pedido: Pedido = {
    id: `CIR-${siguienteNum}`,
    creado: ahora,
    paciente: input.paciente,
    ofertaId: input.ofertaId,
    alojamientoId: input.alojamientoId,
    noches: input.alojamientoId ? input.noches : 0,
    extraIds: input.extraIds,
    fechaDeseada: input.fechaDeseada,
    comentarios: input.comentarios,
    estado: 'nuevo',
    historial: [{ fecha: ahora, estado: 'nuevo', autor: 'paciente' }],
    totales: calcularTotales(db, { ...input, noches: input.alojamientoId ? input.noches : 0 }),
  }
  guardar({ ...db, pedidos: [pedido, ...db.pedidos] })
  return pedido
}

export function cambiarEstadoPedido(id: string, estado: EstadoPedido, nota?: string) {
  guardar({
    ...db,
    pedidos: db.pedidos.map((p) =>
      p.id === id
        ? {
            ...p,
            estado,
            historial: [...p.historial, { fecha: new Date().toISOString(), estado, nota: nota || undefined, autor: 'admin' }],
          }
        : p,
    ),
  })
}

export function agregarNotaPedido(id: string, nota: string) {
  guardar({
    ...db,
    pedidos: db.pedidos.map((p) =>
      p.id === id
        ? { ...p, historial: [...p.historial, { fecha: new Date().toISOString(), estado: p.estado, nota, autor: 'admin' }] }
        : p,
    ),
  })
}

// ---------- Catálogo (genérico) ----------

type Coleccion = 'clinicas' | 'medicos' | 'procedimientos' | 'ofertas' | 'alojamientos'

export function alternarActivo(coleccion: Coleccion, id: string) {
  const lista = db[coleccion] as { id: string; activo: boolean }[]
  guardar({ ...db, [coleccion]: lista.map((x) => (x.id === id ? { ...x, activo: !x.activo } : x)) })
}

export function guardarItem<C extends Coleccion>(coleccion: C, item: DB[C][number]) {
  const lista = db[coleccion] as DB[C][number][]
  const existe = lista.some((x) => x.id === item.id)
  guardar({
    ...db,
    [coleccion]: existe ? lista.map((x) => (x.id === item.id ? item : x)) : [...lista, item],
  })
}

export function actualizarConfiguracion(c: Partial<Configuracion>) {
  guardar({ ...db, configuracion: { ...db.configuracion, ...c } })
}

export function nuevoId(prefijo: string) {
  return `${prefijo}-${Math.random().toString(36).slice(2, 8)}`
}
