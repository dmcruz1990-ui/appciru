import { supabase } from '@plastinex/shared'
import { useState, type FormEvent } from 'react'
import { useSesion } from '../sesion'

export default function Ingreso() {
  const [modo, setModo] = useState<'entrar' | 'registro'>('entrar')
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [nombre, setNombre] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [cargando, setCargando] = useState(false)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setCargando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: clave })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: clave, options: { data: { nombre } } })
        if (error) throw error
        if (!data.session) setMsg({ ok: true, t: 'Cuenta creada. Revisa tu correo para confirmarla y luego ingresa.' })
      }
    } catch (err) {
      setMsg({ ok: false, t: err instanceof Error ? err.message : String(err) })
    } finally {
      setCargando(false)
    }
  }

  return (
    <Pantalla>
      <h1 className="font-serif text-3xl">{modo === 'entrar' ? 'Ingresar al panel' : 'Crear cuenta'}</h1>
      <p className="mt-1 text-sm text-stone-500">Acceso solo para el equipo de PLASTINEX y las clínicas aliadas.</p>
      <form onSubmit={enviar} className="mt-6 space-y-3">
        {modo === 'registro' && (
          <label className="block">
            <span className="etiqueta">Nombre</span>
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo" />
          </label>
        )}
        <label className="block">
          <span className="etiqueta">Correo</span>
          <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="campo" />
        </label>
        <label className="block">
          <span className="etiqueta">Contraseña</span>
          <input
            required
            type="password"
            minLength={8}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="campo"
          />
        </label>
        {msg && <p className={`rounded-md p-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{msg.t}</p>}
        <button disabled={cargando} className="btn w-full !py-2">
          {cargando ? 'Un momento…' : modo === 'entrar' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>
      <button onClick={() => setModo(modo === 'entrar' ? 'registro' : 'entrar')} className="mt-4 text-sm text-stone-600 underline">
        {modo === 'entrar' ? '¿No tienes cuenta? Créala' : 'Ya tengo cuenta'}
      </button>
    </Pantalla>
  )
}

export function Pendiente() {
  const { perfil, recargarPerfil, salir } = useSesion()
  const [msg, setMsg] = useState<string | null>(null)

  const reclamar = async () => {
    const { data, error } = await supabase.rpc('px_reclamar_admin')
    if (error) return setMsg(error.message)
    if (data) await recargarPerfil()
    else setMsg('Ya existe un administrador. Pídele que te asigne un rol en “Usuarios”.')
  }

  return (
    <Pantalla>
      <h1 className="font-serif text-3xl">Cuenta pendiente de aprobación</h1>
      <p className="mt-2 text-sm text-stone-600">
        {perfil?.email} aún no tiene un rol asignado. Un administrador debe darte acceso desde la sección “Usuarios”.
      </p>
      <div className="mt-6 rounded-lg bg-stone-50 p-4 text-sm">
        <div className="font-medium">¿Es la primera configuración?</div>
        <p className="mt-1 text-stone-600">Si todavía no existe ningún administrador, puedes convertirte en el primero.</p>
        <button onClick={reclamar} className="btn-oro mt-3">
          Ser el primer administrador
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-stone-600">{msg}</p>}
      <div className="mt-6 flex gap-2">
        <button onClick={() => void recargarPerfil()} className="btn-sec">
          Volver a comprobar
        </button>
        <button onClick={() => void salir()} className="btn-sec">
          Salir
        </button>
      </div>
    </Pantalla>
  )
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-tinta p-4">
      <div className="w-full max-w-sm rounded-xl bg-[#fbf9f5] p-10 shadow-2xl">
        <div className="mb-8 flex items-baseline gap-2">
          <span className="font-serif text-4xl tracking-tight">Plastinex</span>
          <span className="text-[10px] tracking-[0.2em] text-stone-400 uppercase">Panel</span>
        </div>
        {children}
      </div>
    </div>
  )
}
