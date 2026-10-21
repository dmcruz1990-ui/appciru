import { supabase } from '@plastinex/shared'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Lienzo } from '../componentes/base'
import { useIdioma } from '../idioma'
import { useSeo } from '../seo'
import { useSesion } from '../sesion'

type Modo = 'entrar' | 'registro' | 'olvido'

/** Destino seguro tras ingresar: solo rutas internas. */
export const destinoSeguro = (v: string | null) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/cuenta')

export default function Ingresar() {
  const [params] = useSearchParams()
  const volver = destinoSeguro(params.get('volver'))
  const { sesion, listo, cargando } = useSesion()
  const { tx } = useIdioma()
  useSeo({ titulo: tx('Ingresar', 'Sign in'), indexar: false })
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>(params.get('modo') === 'registro' ? 'registro' : 'entrar')
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => setMsg(null), [modo])

  if (!cargando && sesion) return <Navigate to={listo ? volver : `/cuenta/completar?volver=${encodeURIComponent(volver)}`} replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setEnviando(true)
    try {
      const origen = window.location.origin
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: clave })
        if (error) throw new Error(error.message === 'Invalid login credentials' ? tx('Correo o contraseña incorrectos.', 'Incorrect email or password.') : error.message)
        navigate(`/cuenta/completar?volver=${encodeURIComponent(volver)}`, { replace: true })
      } else if (modo === 'registro') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: clave,
          options: { emailRedirectTo: `${origen}/cuenta/completar?volver=${encodeURIComponent(volver)}` },
        })
        if (error) throw error
        if (!data.session) setMsg({
            ok: true,
            t: tx(
              'Te enviamos un correo para confirmar tu cuenta. Ábrelo y continúa desde ese enlace.',
              'We sent you an email to confirm your account. Open it and continue from that link.',
            ),
          })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origen}/cuenta/nueva-clave` })
        if (error) throw error
        setMsg({
          ok: true,
          t: tx(
            'Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.',
            'If this email is registered, you will receive a link to create a new password.',
          ),
        })
      }
    } catch (err) {
      setMsg({ ok: false, t: err instanceof Error ? err.message : String(err) })
    } finally {
      setEnviando(false)
    }
  }

  const titulos: Record<Modo, [string, string]> = {
    entrar: tx(['Hola', 'de nuevo.'], ['Welcome', 'back.']),
    registro: tx(['Crea tu', 'cuenta.'], ['Create your', 'account.']),
    olvido: tx(['Recupera tu', 'acceso.'], ['Recover your', 'access.']),
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Lienzo semilla="ingresar" tono="oscuro" />
        <div className="grano" />
        <div className="absolute inset-0 bg-gradient-to-t from-tinta/70 via-tinta/10 to-transparent" />
        <div className="absolute right-12 bottom-12 left-12 text-marfil">
          <p className="display normal-case max-w-md text-4xl">
            {tx('“La mejor decisión es la que tomas bien informada.”', '“The best decision is a well-informed one.”')}
          </p>
          <p className="mt-4 text-sm text-marfil/70">
            {tx(
              'Tu información se trata con confidencialidad y solo se comparte con la institución que elijas.',
              'Your information is kept confidential and shared only with the clinic you choose.',
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 pt-28 pb-16 md:px-16 lg:pt-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="display text-4xl">
            {titulos[modo][0]} <em>{titulos[modo][1]}</em>
          </h1>
          <p className="mt-4 text-piedra">
            {modo === 'registro'
              ? tx(
                  'Necesitas una cuenta para solicitar valoraciones y seguir tu proceso. Al crearla aceptarás los términos de intermediación.',
                  'You need an account to request consultations and follow your process. When you create it, you will accept the intermediation terms.',
                )
              : modo === 'olvido'
                ? tx('Escribe tu correo y te enviaremos un enlace.', 'Enter your email and we will send you a link.')
                : tx('Ingresa para solicitar tu valoración y ver el estado de tus solicitudes.', 'Sign in to request your consultation and check the status of your requests.')}
          </p>

          <form onSubmit={enviar} className="mt-10 space-y-7">
            <label className="block">
              <span className="etiqueta">{tx('Correo', 'Email')}</span>
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="campo" />
            </label>
            {modo !== 'olvido' && (
              <label className="block">
                <span className="etiqueta">{tx('Contraseña', 'Password')}</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  className="campo"
                />
                {modo === 'registro' && <span className="mt-1 block text-xs text-niebla">{tx('Mínimo 8 caracteres.', 'At least 8 characters.')}</span>}
              </label>
            )}
            {msg && <p className={`text-sm ${msg.ok ? 'text-salvia' : 'text-red-800'}`}>{msg.t}</p>}
            <button disabled={enviando} className="btn w-full !py-3.5">
              {enviando
                ? tx('Un momento…', 'One moment…')
                : modo === 'entrar'
                  ? tx('Ingresar', 'Sign in')
                  : modo === 'registro'
                    ? tx('Crear cuenta', 'Create account')
                    : tx('Enviar enlace', 'Send link')}
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-between gap-3 text-sm text-piedra">
            {modo === 'entrar' ? (
              <>
                <button onClick={() => setModo('registro')} className="enlace">
                  {tx('Crear una cuenta', 'Create an account')}
                </button>
                <button onClick={() => setModo('olvido')} className="enlace">
                  {tx('Olvidé mi contraseña', 'Forgot password')}
                </button>
              </>
            ) : (
              <button onClick={() => setModo('entrar')} className="enlace">
                {tx('Ya tengo cuenta', 'I already have an account')}
              </button>
            )}
          </div>
          <p className="mt-12 text-xs leading-relaxed text-niebla">
            {tx(
              <>
                Al continuar aceptas que PLASTINEX actúa como intermediario entre pacientes y prestadores de salud. Lee los{' '}
                <Link to="/terminos" className="enlace">
                  términos
                </Link>{' '}
                y el{' '}
                <Link to="/privacidad" className="enlace">
                  aviso de privacidad
                </Link>
                .
              </>,
              <>
                By continuing, you accept that PLASTINEX acts as an intermediary between patients and healthcare providers. Read the{' '}
                <Link to="/terminos" className="enlace">
                  terms
                </Link>{' '}
                and the{' '}
                <Link to="/privacidad" className="enlace">
                  privacy notice
                </Link>
                .
              </>,
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
