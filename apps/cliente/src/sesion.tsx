import { miPaciente, supabase, type Paciente } from '@plastinex/shared'
import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

interface SesionPaciente {
  sesion: Session | null
  paciente: Paciente | null
  cargando: boolean
  /** Hay sesión y ficha con los términos vigentes aceptados. */
  listo: boolean
  /** Llegó desde el enlace de "olvidé mi contraseña". */
  recuperando: boolean
  terminarRecuperacion: () => void
  recargar: () => Promise<void>
  salir: () => Promise<void>
}

const Ctx = createContext<SesionPaciente | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [recuperando, setRecuperando] = useState(false)

  const cargarPaciente = useCallback(async (s: Session | null) => {
    if (!s) return setPaciente(null)
    try {
      setPaciente(await miPaciente())
    } catch {
      setPaciente(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSesion(data.session)
      await cargarPaciente(data.session)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      setSesion(s)
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
      setTimeout(() => void cargarPaciente(s), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [cargarPaciente])

  const valor: SesionPaciente = {
    sesion,
    paciente,
    cargando,
    listo: Boolean(sesion && paciente?.terminos_vigentes),
    recuperando,
    terminarRecuperacion: () => setRecuperando(false),
    recargar: () => cargarPaciente(sesion),
    salir: async () => {
      await supabase.auth.signOut()
      setPaciente(null)
    },
  }
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useSesion() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useSesion fuera de SesionProvider')
  return v
}
