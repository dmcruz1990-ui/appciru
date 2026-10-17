import { supabase } from '@plastinex/shared'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSesion } from '../sesion'

export default function NuevaClave() {
  const { sesion, terminarRecuperacion } = useSesion()
  const navigate = useNavigate()
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password: clave })
    if (error) return setError(error.message)
    terminarRecuperacion()
    navigate('/cuenta', { replace: true })
  }

  return (
    <div className="contenedor flex min-h-[80vh] items-center pt-28">
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-4xl">
          Nueva <em>contraseña.</em>
        </h1>
        {sesion ? (
          <form onSubmit={guardar} className="mt-10 space-y-7">
            <label className="block">
              <span className="etiqueta">Contraseña nueva</span>
              <input required type="password" minLength={8} autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} className="campo" />
            </label>
            {error && <p className="text-sm text-red-800">{error}</p>}
            <button className="btn w-full">Guardar</button>
          </form>
        ) : (
          <p className="mt-6 text-piedra">
            El enlace venció o ya se usó.{' '}
            <Link to="/ingresar" className="enlace">
              Solicita uno nuevo
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
