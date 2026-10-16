import type { Categoria, EstadoPedido, TipoAlojamiento } from './types'

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const formatoCOP = (n: number) => cop.format(n)
export const formatoUSD = (n: number, tasa: number) => usd.format(n / tasa)

export const formatoFecha = (iso: string) =>
  new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

export const formatoFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const nombreCategoria: Record<Categoria, string> = {
  corporal: 'Cirugía corporal',
  mamaria: 'Cirugía mamaria',
  facial: 'Cirugía facial',
  bariatrica: 'Bariátrica',
  ortopedia: 'Ortopedia',
  odontologia: 'Odontología',
  oftalmologia: 'Oftalmología',
}

export const nombreTipoAlojamiento: Record<TipoAlojamiento, string> = {
  hotel: 'Hotel',
  casa_recobro: 'Casa de recobro',
  apartamento: 'Apartamento',
}

export const estadosPedido: { id: EstadoPedido; nombre: string; color: string }[] = [
  { id: 'nuevo', nombre: 'Nueva solicitud', color: 'bg-blue-100 text-blue-800' },
  { id: 'valoracion', nombre: 'En valoración', color: 'bg-amber-100 text-amber-800' },
  { id: 'confirmado', nombre: 'Confirmado', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'en_curso', nombre: 'En curso', color: 'bg-violet-100 text-violet-800' },
  { id: 'completado', nombre: 'Completado', color: 'bg-slate-200 text-slate-700' },
  { id: 'cancelado', nombre: 'Cancelado', color: 'bg-rose-100 text-rose-800' },
]

export const infoEstado = (e: EstadoPedido) => estadosPedido.find((x) => x.id === e)!

export const iniciales = (nombre: string) =>
  nombre
    .replace(/^(Dra?\.)\s*/, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
