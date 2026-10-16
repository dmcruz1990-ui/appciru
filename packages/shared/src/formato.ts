import type {
  Categoria,
  Etapa,
  EstadoSuscripcion,
  Plan,
  Rol,
  TipoAlojamiento,
  TipoInstitucion,
  Verificacion,
} from './tipos'

const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
export const formatoCOP = (n: number) => cop.format(n)

/** Texto del rango orientativo. Nunca inventa un precio. */
export function textoPrecio(min: number | null, max: number | null): string {
  if (min == null && max == null) return 'Precio no informado'
  if (min != null && max != null) return min === max ? formatoCOP(min) : `${formatoCOP(min)} – ${formatoCOP(max)}`
  if (min != null) return `Desde ${formatoCOP(min)}`
  return `Hasta ${formatoCOP(max!)}`
}

const aFecha = (iso: string) => new Date(iso.length === 10 ? iso + 'T12:00:00' : iso)

export const formatoFecha = (iso: string) =>
  aFecha(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatoFechaHora = (iso: string) =>
  aFecha(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export const nombreCategoria: Record<Categoria, string> = {
  mamaria: 'Cirugía mamaria',
  corporal: 'Contorno corporal',
  facial: 'Cirugía facial',
}

export const nombreTipoInstitucion: Record<TipoInstitucion, string> = {
  clinica: 'Clínica',
  institucion: 'Institución',
  consultorio: 'Consultorio',
}

export const nombreTipoAlojamiento: Record<TipoAlojamiento, string> = {
  casa_recobro: 'Casa de recobro',
  hotel: 'Hotel',
  apartamento: 'Apartamento',
}

export const verificaciones: { id: Verificacion; nombre: string; publico: string }[] = [
  { id: 'pendiente', nombre: 'Pendiente', publico: 'Pendiente de validación documental' },
  { id: 'en_revision', nombre: 'En revisión', publico: 'Validación documental en curso' },
  { id: 'verificado', nombre: 'Verificado', publico: 'Documentación verificada' },
  { id: 'rechazado', nombre: 'Rechazado', publico: 'No verificado' },
]
export const infoVerificacion = (v: Verificacion) => verificaciones.find((x) => x.id === v)!

/** Ruta comercial del documento del doctor. */
export const etapas: { id: Etapa; nombre: string; paciente: string; abierta: boolean }[] = [
  { id: 'nueva', nombre: 'Nueva', paciente: 'Solicitud recibida', abierta: true },
  { id: 'contactada', nombre: 'Contactada', paciente: 'Te contactamos', abierta: true },
  { id: 'valoracion_agendada', nombre: 'Valoración agendada', paciente: 'Valoración agendada', abierta: true },
  { id: 'valorada', nombre: 'Valorada', paciente: 'Valoración realizada', abierta: true },
  { id: 'seguimiento', nombre: 'En seguimiento', paciente: 'En seguimiento', abierta: true },
  { id: 'programada', nombre: 'Programada', paciente: 'Procedimiento programado', abierta: false },
  { id: 'no_continua', nombre: 'No continúa', paciente: 'Proceso cerrado', abierta: false },
]
export const infoEtapa = (e: Etapa) => etapas.find((x) => x.id === e)!

export const nombreRol: Record<Rol, string> = {
  pendiente: 'Sin acceso (pendiente)',
  admin: 'Administrador',
  coordinador: 'Coordinador',
  clinica: 'Clínica',
}

export const nombrePlan: Record<Plan, string> = {
  piloto: 'Piloto',
  tecnologia: 'Suscripción tecnológica',
  administrado: 'Servicio administrado',
}

export const nombreEstadoSuscripcion: Record<EstadoSuscripcion, string> = {
  prueba: 'En prueba',
  activa: 'Activa',
  pausada: 'Pausada',
  cancelada: 'Cancelada',
}

export const iniciales = (nombre: string) =>
  nombre
    .replace(/^(Dra?\.)\s*/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

export const CONSENTIMIENTO_VERSION = 'v1-2026-10'
