// Tipos de las tablas px_* en Supabase (ver supabase/migrations).

export type Categoria = 'mamaria' | 'corporal' | 'facial'
export type Verificacion = 'pendiente' | 'en_revision' | 'verificado' | 'rechazado'
export type TipoInstitucion = 'clinica' | 'institucion' | 'consultorio'
export type TipoAlojamiento = 'casa_recobro' | 'hotel' | 'apartamento'
export type Rol = 'pendiente' | 'admin' | 'coordinador' | 'clinica'
export type Etapa =
  | 'nueva'
  | 'contactada'
  | 'valoracion_agendada'
  | 'valorada'
  | 'seguimiento'
  | 'programada'
  | 'no_continua'
export type TipoEvento = 'sistema' | 'etapa' | 'nota_interna' | 'mensaje_paciente'
export type Plan = 'piloto' | 'tecnologia' | 'administrado'
export type EstadoSuscripcion = 'prueba' | 'activa' | 'pausada' | 'cancelada'

export interface Ciudad {
  id: string
  nombre: string
  /** Estado, provincia o departamento, según el país. */
  departamento: string
  /** Código ISO 3166-1 alfa-2 (CO, US, MX…). */
  pais: string
  orden: number
  activa: boolean
}

export interface Procedimiento {
  id: string
  nombre: string
  categoria: Categoria
  descripcion: string
  duracion_aprox: string | null
  anestesia: string | null
  recuperacion: string | null
  estadia_sugerida_dias: number | null
  orden: number
  publicado: boolean
  imagen_url: string | null
  nombre_en?: string | null
  descripcion_en?: string | null
  duracion_aprox_en?: string | null
  anestesia_en?: string | null
  recuperacion_en?: string | null
}

export interface Institucion {
  id: string
  nombre: string
  tipo: TipoInstitucion
  ciudad_id: string
  direccion: string | null
  descripcion: string
  codigo_reps: string | null
  servicios: string[]
  imagen_url: string | null
  telefono_publico: string | null
  sitio_web: string | null
  verificacion: Verificacion
  verificacion_notas: string | null
  verificado_en: string | null
  verificado_por: string | null
  es_demo: boolean
  publicado: boolean
  creado_en: string
  financiacion: boolean
  /** Valor de la primera valoración en COP; 0 = gratis; null = no informado. */
  valoracion_precio: number | null
  lat: number | null
  lng: number | null
  /** Fotos adicionales (URLs del bucket px-imagenes), en orden. */
  galeria: string[]
  descripcion_en?: string | null
  servicios_en?: string[]
}

export interface Profesional {
  id: string
  nombre: string
  especialidad: string
  ciudad_id: string
  rethus: string | null
  sociedad: string | null
  anios_experiencia: number | null
  idiomas: string[]
  bio: string
  valoracion_virtual: boolean
  foto_url: string | null
  verificacion: Verificacion
  verificacion_notas: string | null
  verificado_en: string | null
  verificado_por: string | null
  es_demo: boolean
  publicado: boolean
  creado_en: string
  especialidad_en?: string | null
  bio_en?: string | null
}

export interface Vinculo {
  profesional_id: string
  institucion_id: string
}

export interface Oferta {
  id: string
  procedimiento_id: string
  institucion_id: string
  profesional_id: string | null
  precio_min: number | null
  precio_max: number | null
  incluye: string | null
  no_incluye: string | null
  incluye_en?: string | null
  no_incluye_en?: string | null
  precio_actualizado_en: string | null
  publicado: boolean
  creado_en: string
}

export interface Alojamiento {
  id: string
  nombre: string
  tipo: TipoAlojamiento
  ciudad_id: string
  descripcion: string
  precio_noche_desde: number | null
  incluye_enfermeria: boolean
  incluye_alimentacion: boolean
  es_demo: boolean
  publicado: boolean
  lat: number | null
  lng: number | null
  galeria: string[]
  /** Personas que pueden alojarse (paciente + acompañantes). */
  capacidad: number | null
  descripcion_en?: string | null
}

export interface Servicio {
  id: string
  nombre: string
  descripcion: string
  precio_desde: number | null
  unidad: 'servicio' | 'dia'
  orden: number
  publicado: boolean
  nombre_en?: string | null
  descripcion_en?: string | null
}

export interface Perfil {
  id: string
  email: string | null
  nombre: string | null
  rol: Rol
  institucion_id: string | null
  creado_en: string
}

export interface Solicitud {
  id: string
  codigo: string
  creado_en: string
  actualizado_en: string
  nombre: string
  email: string
  telefono: string
  pais: string
  procedimiento_id: string | null
  oferta_id: string | null
  institucion_id: string | null
  profesional_id: string | null
  ciudad_id: string | null
  fecha_tentativa: string | null
  alojamiento_id: string | null
  noches: number | null
  servicio_ids: string[]
  mensaje: string | null
  canal: string
  utm: Record<string, string> | null
  consentimiento_en: string
  consentimiento_version: string
  etapa: Etapa
  asignado_a: string | null
  primera_respuesta_en: string | null
  cita_valoracion_en: string | null
  asistio: boolean | null
  motivo_cierre: string | null
  paciente_id: string | null
  presupuesto: number | null
}

export interface EventoSolicitud {
  id: number
  solicitud_id: string
  creado_en: string
  autor_id: string | null
  tipo: TipoEvento
  etapa: Etapa | null
  texto: string | null
}

export interface Suscripcion {
  id: string
  institucion_id: string
  plan: Plan
  cuota_instalacion: number
  cuota_mensual: number
  estado: EstadoSuscripcion
  inicio: string
  fin: string | null
  notas: string | null
  creado_en: string
}

/** Lo que el paciente ve al consultar su solicitud (px_consultar_solicitud). */
export interface SolicitudPublica {
  codigo: string
  creado_en: string
  etapa: Etapa
  nombre: string
  procedimiento: string | null
  institucion: string | null
  profesional: string | null
  ciudad: string | null
  fecha_tentativa: string | null
  cita_valoracion_en: string | null
  alojamiento: string | null
  noches: number | null
  servicios: string[]
  eventos: { creado_en: string; tipo: TipoEvento; etapa: Etapa | null; texto: string | null }[]
}

export interface Paciente {
  id: string
  nombre: string
  telefono: string
  pais: string
  terminos_version: string
  terminos_aceptados_en: string
  intermediacion_aceptada_en: string
  confidencialidad_aceptada_en: string
  datos_sensibles_autorizado_en: string
  creado_en: string
  /** true si aceptó la versión vigente de los documentos. */
  terminos_vigentes?: boolean
}

export interface RegistroPaciente {
  nombre: string
  telefono: string
  pais: string
  acepta_terminos: boolean
  acepta_intermediacion: boolean
  acepta_confidencialidad: boolean
  autoriza_datos: boolean
}

/** Los datos de contacto salen de la ficha del paciente autenticado. */
export interface NuevaSolicitud {
  procedimiento_id?: string
  oferta_id?: string
  ciudad_id?: string
  fecha_tentativa?: string
  alojamiento_id?: string
  noches?: number
  servicio_ids: string[]
  mensaje?: string
  presupuesto?: number
  canal?: string
  utm?: Record<string, string>
}
