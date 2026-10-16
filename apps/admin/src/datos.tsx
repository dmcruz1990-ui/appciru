import { cargarCatalogo, sinError, supabase, useCarga, type Catalogo, type Perfil, type Solicitud, type Suscripcion } from '@plastinex/shared'
import { createContext, useContext, type ReactNode } from 'react'

export interface DatosPanel extends Catalogo {
  solicitudes: Solicitud[]
  perfiles: Perfil[]
  suscripciones: Suscripcion[]
}

async function cargarTodo(): Promise<DatosPanel> {
  const [catalogo, solicitudes, perfiles, suscripciones] = await Promise.all([
    cargarCatalogo(),
    supabase.from('px_solicitudes').select('*').order('creado_en', { ascending: false }),
    supabase.from('px_perfiles').select('*').order('creado_en'),
    supabase.from('px_suscripciones').select('*').order('inicio', { ascending: false }),
  ])
  return {
    ...catalogo,
    solicitudes: sinError(solicitudes),
    perfiles: sinError(perfiles),
    suscripciones: sinError(suscripciones),
  }
}

const Ctx = createContext<ReturnType<typeof useCarga<DatosPanel>> | null>(null)

export function DatosProvider({ children }: { children: ReactNode }) {
  const estado = useCarga(cargarTodo)
  return <Ctx.Provider value={estado}>{children}</Ctx.Provider>
}

export function useDatos() {
  const v = useContext(Ctx)
  if (!v?.datos) throw new Error('useDatos sin datos cargados')
  return { ...v, datos: v.datos }
}

export function useEstadoDatos() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useEstadoDatos fuera de DatosProvider')
  return v
}
