// Modelo de dominio compartido entre la vista de cliente y el panel de administración.

export type Categoria =
  | 'corporal'
  | 'mamaria'
  | 'facial'
  | 'bariatrica'
  | 'ortopedia'
  | 'odontologia'
  | 'oftalmologia'

export interface Ciudad {
  id: string
  nombre: string
  departamento: string
}

export interface Clinica {
  id: string
  nombre: string
  ciudadId: string
  direccion: string
  /** Código de habilitación en el REPS (Ministerio de Salud). */
  codigoREPS: string
  acreditadaICONTEC: boolean
  quirofanos: number
  calificacion: number
  resenas: number
  servicios: string[]
  descripcion: string
  activo: boolean
  color: string
}

export interface Medico {
  id: string
  nombre: string
  especialidad: string
  /** Número de registro en el ReTHUS. */
  rethus: string
  /** Miembro de la sociedad científica de su especialidad (p. ej. SCCP). */
  sociedad?: string
  ciudadId: string
  clinicaIds: string[]
  aniosExperiencia: number
  cirugiasRealizadas: number
  calificacion: number
  resenas: number
  idiomas: string[]
  bio: string
  valoracionVirtual: boolean
  activo: boolean
}

export interface Procedimiento {
  id: string
  nombre: string
  categoria: Categoria
  descripcion: string
  duracionHoras: number
  anestesia: string
  hospitalizacionNoches: number
  /** Días recomendados en la ciudad antes de viajar de regreso. */
  estadiaRecomendadaDias: number
  incluye: string[]
  activo: boolean
}

/** Una "publicación" del marketplace: un médico ofrece un procedimiento en una clínica a un precio. */
export interface Oferta {
  id: string
  medicoId: string
  procedimientoId: string
  clinicaId: string
  precio: number
  activo: boolean
}

export type TipoAlojamiento = 'hotel' | 'casa_recobro' | 'apartamento'

export interface Alojamiento {
  id: string
  nombre: string
  tipo: TipoAlojamiento
  ciudadId: string
  precioNoche: number
  calificacion: number
  incluyeEnfermeria: boolean
  incluyeAlimentacion: boolean
  distanciaClinicaKm: number
  activo: boolean
}

export interface ServicioExtra {
  id: string
  nombre: string
  descripcion: string
  precio: number
  porNoche: boolean
}

export type EstadoPedido =
  | 'nuevo'
  | 'valoracion'
  | 'confirmado'
  | 'en_curso'
  | 'completado'
  | 'cancelado'

export interface EventoPedido {
  fecha: string
  estado: EstadoPedido
  nota?: string
  autor: 'paciente' | 'admin'
}

export interface Paciente {
  nombre: string
  email: string
  telefono: string
  pais: string
  edad?: number
}

export interface Pedido {
  id: string
  creado: string
  paciente: Paciente
  ofertaId: string
  alojamientoId?: string
  noches: number
  extraIds: string[]
  fechaDeseada: string
  comentarios?: string
  estado: EstadoPedido
  historial: EventoPedido[]
  totales: {
    cirugia: number
    alojamiento: number
    extras: number
    total: number
  }
}

export interface Configuracion {
  /** Comisión de la plataforma sobre el total del plan (0–1). */
  comision: number
  /** Tasa COP por USD para mostrar precios de referencia. */
  tasaUSD: number
}
