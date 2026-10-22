import { supabase } from './supabase'
import type { Plan, TipoInstitucion } from './tipos'

export type EstadoPostulacion = 'nueva' | 'en_revision' | 'aprobada' | 'rechazada'
export type EstadoPago = 'sin_plan' | 'pendiente' | 'pagado'

/** Plan que el médico paga después de ser aprobado (mismos ids que px_suscripciones.plan). */
export interface PlanMedico {
  id: Plan
  nombre: string
  nombre_en: string | null
  descripcion: string
  descripcion_en: string | null
  beneficios: string[]
  beneficios_en: string[]
  precio_mensual_usd: number | null
  precio_anual_usd: number | null
  cuota_inicial_usd: number | null
  /** Precios de Stripe Billing (price_…); con ellos el plan se paga con tarjeta y se renueva solo. */
  stripe_price_mensual: string | null
  stripe_price_anual: string | null
  /** Enlace de pago (Stripe, Mercado Pago, Wompi…) configurado por PLASTINEX. */
  enlace_pago: string | null
  destacado: boolean
  activo: boolean
  orden: number
}

/** Registro de un cirujano y su clínica, enviado desde «Para clínicas» y revisado por PLASTINEX. */
export interface Postulacion {
  id: string
  usuario_id: string
  email: string
  nombre: string
  telefono: string
  especialidad: string
  registro_profesional: string
  autoridad_registro: string | null
  sociedad: string | null
  anios_experiencia: number | null
  idiomas: string[]
  procedimientos: string[]
  valoracion_virtual: boolean
  bio: string | null
  pais: string
  ciudad_id: string | null
  ciudad_otra: string | null
  institucion_nombre: string
  institucion_tipo: TipoInstitucion
  institucion_registro: string | null
  sitio_web: string | null
  declara_en: string
  terminos_version: string
  estado: EstadoPostulacion
  /** Motivo del rechazo o lo que falta corregir; lo ve el médico. */
  motivo: string | null
  profesional_id: string | null
  institucion_id: string | null
  revisado_por: string | null
  revisado_en: string | null
  plan_id: Plan | null
  pago_estado: EstadoPago
  plan_elegido_en: string | null
  pago_confirmado_en: string | null
  stripe_customer_id: string | null
  creado_en: string
  actualizado_en: string
}

/** Lo que envía el formulario de registro. */
export type NuevaPostulacion = Pick<
  Postulacion,
  | 'nombre'
  | 'telefono'
  | 'especialidad'
  | 'registro_profesional'
  | 'pais'
  | 'institucion_nombre'
  | 'institucion_tipo'
  | 'idiomas'
  | 'procedimientos'
  | 'valoracion_virtual'
> & {
  autoridad_registro?: string
  sociedad?: string
  anios_experiencia?: number
  bio?: string
  ciudad_id?: string
  ciudad_otra?: string
  institucion_registro?: string
  sitio_web?: string
  /** Declaración de veracidad y autorización para verificar los registros. */
  declara: boolean
}

export const estadosPostulacion: Record<EstadoPostulacion, { es: string; en: string }> = {
  nueva: { es: 'Recibido', en: 'Received' },
  en_revision: { es: 'En verificación', en: 'Under verification' },
  aprobada: { es: 'Aprobado', en: 'Approved' },
  rechazada: { es: 'Requiere cambios', en: 'Changes needed' },
}

/** La postulación de la persona con sesión, si ya envió una. */
export async function miPostulacion(): Promise<Postulacion | null> {
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) return null
  const { data, error } = await supabase.from('px_postulaciones').select('*').eq('usuario_id', u.user.id).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Postulacion | null) ?? null
}

export async function postular(p: NuevaPostulacion): Promise<Postulacion> {
  const { data, error } = await supabase.rpc('px_postular', { datos: p })
  if (error) throw new Error(error.message)
  return data as Postulacion
}

/** Solo el equipo de PLASTINEX. Al aprobar se crean el perfil, la clínica y sus procedimientos sin publicar. */
export async function revisarPostulacion(id: string, estado: Exclude<EstadoPostulacion, 'nueva'>, motivo?: string, ciudadId?: string): Promise<Postulacion> {
  const { data, error } = await supabase.rpc('px_revisar_postulacion', { p_id: id, p_estado: estado, p_motivo: motivo ?? null, p_ciudad_id: ciudadId ?? null })
  if (error) throw new Error(error.message)
  return data as Postulacion
}

export async function planesMedico(): Promise<PlanMedico[]> {
  const { data, error } = await supabase.from('px_planes').select('*').eq('activo', true).order('orden')
  if (error) throw new Error(error.message)
  return (data as PlanMedico[] | null) ?? []
}

/** El médico aprobado elige plan; devuelve el plan con su enlace de pago (si PLASTINEX ya lo configuró). */
export async function elegirPlan(id: Plan): Promise<PlanMedico> {
  const { data, error } = await supabase.rpc('px_elegir_plan', { p_plan: id })
  if (error) throw new Error(error.message)
  return data as PlanMedico
}

/** Solo el equipo de PLASTINEX: activa la suscripción de la clínica y permite publicarla. */
export async function confirmarPago(postulacionId: string): Promise<Postulacion> {
  const { data, error } = await supabase.rpc('px_confirmar_pago', { p_postulacion: postulacionId })
  if (error) throw new Error(error.message)
  return data as Postulacion
}

/** Página de pago de Stripe para suscribirse al plan (cobro mensual o anual automático). Devuelve su URL. */
export async function pagarConTarjeta(plan: Plan, intervalo: 'mes' | 'anio'): Promise<string> {
  const { data, error } = await supabase.functions.invoke('px-stripe', { body: { accion: 'checkout', plan, intervalo } })
  if (error) throw new Error(await mensajeFuncion(error))
  return (data as { url: string }).url
}

/** Portal de Stripe: cambiar de plan o de tarjeta, descargar facturas o cancelar. Devuelve su URL. */
export async function portalSuscripcion(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('px-stripe', { body: { accion: 'portal' } })
  if (error) throw new Error(await mensajeFuncion(error))
  return (data as { url: string }).url
}

/** El mensaje que devolvió la función (en lugar del genérico de supabase-js). */
async function mensajeFuncion(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response }).context
  try {
    const cuerpo = (await ctx?.json()) as { error?: string } | undefined
    if (cuerpo?.error) return cuerpo.error
  } catch {
    /* sin cuerpo JSON */
  }
  return error instanceof Error ? error.message : String(error)
}
