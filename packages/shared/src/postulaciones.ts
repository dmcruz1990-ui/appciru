import { supabase } from './supabase'
import type { TipoInstitucion } from './tipos'

export type EstadoPostulacion = 'nueva' | 'en_revision' | 'aprobada' | 'rechazada'

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
