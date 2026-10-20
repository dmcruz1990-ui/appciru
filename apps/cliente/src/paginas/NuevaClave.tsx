import { supabase } from '@plastinex/shared'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useIdioma } from '../idioma'
import { useSesion } from '../sesion'

export default function NuevaClave() {
  const { sesion, terminarRecuperacion } = useSesion()
  const { tx } = useIdioma()
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
          {tx(
            <>
              Nueva <em>contraseña.</em>
            </>,
            <>
              New <em>password.</em>
            </>,
          )}
        </h1>
        {sesion ? (
          <form onSubmit={guardar} className="mt-10 space-y-7">
            <label className="block">
              <span className="etiqueta">{tx('Contraseña nueva', 'New password')}</span>
              <input required type="password" minLength={8} autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} className="campo" />
            </label>
            {error && <p className="text-sm text-red-800">{error}</p>}
            <button className="btn w-full">{tx('Guardar', 'Save')}</button>
          </form>
        ) : (
          <p className="mt-6 text-piedra">
            {tx('El enlace venció o ya se usó.', 'This link has expired or has already been used.')}{' '}
            <Link to="/ingresar" className="enlace">
              {tx('Solicita uno nuevo', 'Request a new one')}
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
