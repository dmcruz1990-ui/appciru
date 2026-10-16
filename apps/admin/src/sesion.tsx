import { supabase, type Perfil } from '@plastinex/shared'
import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface SesionCtx {
  sesion: Session | null
  perfil: Perfil | null
  cargando: boolean
  error: string | null
  recargarPerfil: () => Promise<void>
  salir: () => Promise<void>
  esStaff: boolean
  esAdmin: boolean
}

const Ctx = createContext<SesionCtx | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarPerfil = useCallback(async (s: Session | null) => {
    if (!s) {
      setPerfil(null)
      return
    }
    const { data, error } = await supabase.rpc('px_mi_perfil')
    if (error) setError(error.message)
    else setPerfil(data as Perfil)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSesion(data.session)
      await cargarPerfil(data.session)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSesion(s)
      // Se difiere para no llamar a Supabase dentro del callback de auth.
      setTimeout(() => void cargarPerfil(s), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [cargarPerfil])

  const valor: SesionCtx = {
    sesion,
    perfil,
    cargando,
    error,
    recargarPerfil: () => cargarPerfil(sesion),
    salir: async () => {
      await supabase.auth.signOut()
    },
    esStaff: perfil?.rol === 'admin' || perfil?.rol === 'coordinador',
    esAdmin: perfil?.rol === 'admin',
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useSesion() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSesion fuera de SesionProvider')
  return v
}
