import { useCallback, useEffect, useState } from 'react'
import { sinError, supabase } from './supabase'
import type {
  Alojamiento,
  Ciudad,
  Institucion,
  NuevaSolicitud,
  Oferta,
  Paciente,
  RegistroPaciente,
  Procedimiento,
  Profesional,
  Servicio,
  SolicitudPublica,
  Vinculo,
} from './tipos'

export interface Catalogo {
  ciudades: Ciudad[]
  procedimientos: Procedimiento[]
  instituciones: Institucion[]
  profesionales: Profesional[]
  vinculos: Vinculo[]
  ofertas: Oferta[]
  alojamientos: Alojamiento[]
  servicios: Servicio[]
}

/**
 * Carga el catálogo completo. RLS decide qué se ve: el público solo recibe lo publicado,
 * el staff recibe todo (incluido lo oculto).
 */
export async function cargarCatalogo(): Promise<Catalogo> {
  const [ciudades, procedimientos, instituciones, profesionales, vinculos, ofertas, alojamientos, servicios] =
    await Promise.all([
      supabase.from('px_ciudades').select('*').order('orden'),
      supabase.from('px_procedimientos').select('*').order('orden'),
      supabase.from('px_instituciones').select('*').order('nombre'),
      supabase.from('px_profesionales').select('*').order('nombre'),
      supabase.from('px_profesional_institucion').select('*'),
      supabase.from('px_ofertas').select('*').order('creado_en'),
      supabase.from('px_alojamientos').select('*').order('nombre'),
      supabase.from('px_servicios').select('*').order('orden'),
    ])
  return {
    ciudades: sinError(ciudades),
    procedimientos: sinError(procedimientos),
    instituciones: sinError(instituciones),
    profesionales: sinError(profesionales),
    vinculos: sinError(vinculos),
    ofertas: sinError(ofertas),
    alojamientos: sinError(alojamientos),
    servicios: sinError(servicios),
  }
}

export interface Estado<T> {
  datos: T | null
  error: string | null
  cargando: boolean
  recargar: () => void
}

/** Hook genérico para cargar datos asíncronos. */
export function useCarga<T>(fn: () => Promise<T>, deps: unknown[] = []): Estado<T> {
  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [n, setN] = useState(0)
  const recargar = useCallback(() => setN((x) => x + 1), [])

  useEffect(() => {
    let vivo = true
    setCargando(true)
    fn()
      .then((d) => vivo && (setDatos(d), setError(null)))
      .catch((e: unknown) => vivo && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => vivo && setCargando(false))
    return () => {
      vivo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ...deps])

  return { datos, error, cargando, recargar }
}

// ---------- Vista enriquecida de una oferta ----------

export interface OfertaDetallada {
  oferta: Oferta
  procedimiento: Procedimiento
  institucion: Institucion
  profesional: Profesional | null
  ciudad: Ciudad
}

export function detallarOfertas(c: Catalogo, soloPublicas = true): OfertaDetallada[] {
  const out: OfertaDetallada[] = []
  for (const oferta of c.ofertas) {
    const procedimiento = c.procedimientos.find((p) => p.id === oferta.procedimiento_id)
    const institucion = c.instituciones.find((i) => i.id === oferta.institucion_id)
    const profesional = oferta.profesional_id ? (c.profesionales.find((p) => p.id === oferta.profesional_id) ?? null) : null
    const ciudad = institucion && c.ciudades.find((x) => x.id === institucion.ciudad_id)
    if (!procedimiento || !institucion || !ciudad) continue
    if (soloPublicas && !(oferta.publicado && procedimiento.publicado && institucion.publicado)) continue
    out.push({ oferta, procedimiento, institucion, profesional: profesional && (!soloPublicas || profesional.publicado) ? profesional : null, ciudad })
  }
  return out
}

export const nombreCiudad = (c: Catalogo, id: string | null) => c.ciudades.find((x) => x.id === id)?.nombre ?? '—'

// ---------- Paciente (requiere sesión) ----------

export async function miPaciente(): Promise<Paciente | null> {
  const { data, error } = await supabase.rpc('px_mi_paciente')
  if (error) throw new Error(error.message)
  return (data as Paciente | null) ?? null
}

export async function registrarPaciente(r: RegistroPaciente): Promise<Paciente> {
  const { data, error } = await supabase.rpc('px_registrar_paciente', { datos: r })
  if (error) throw new Error(error.message)
  return data as Paciente
}

export async function crearSolicitud(s: NuevaSolicitud): Promise<string> {
  const { data, error } = await supabase.rpc('px_crear_solicitud', { datos: s })
  if (error) throw new Error(error.message)
  return data as string
}

export async function misSolicitudes(): Promise<SolicitudPublica[]> {
  const { data, error } = await supabase.rpc('px_mis_solicitudes')
  if (error) throw new Error(error.message)
  return (data as SolicitudPublica[] | null) ?? []
}

// ---------- Imágenes ----------

/** URL optimizada: a las imágenes de Unsplash les pide el ancho justo; las de Storage se devuelven tal cual. */
export function urlImagen(url: string | null | undefined, ancho = 1200): string | null {
  if (!url) return null
  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0]
    return `${base}?auto=format&fit=crop&w=${ancho}&q=80`
  }
  return url
}
