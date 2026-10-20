import { EMPRESA, registrarPaciente, TERMINOS_VERSION } from '@plastinex/shared'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useIdioma } from '../idioma'
import { useSesion } from '../sesion'
import { destinoSeguro } from './Ingresar'

/** El valor que se guarda es el nombre en español; en inglés solo cambia la etiqueta. */
const paises: [string, string][] = [
  ['Colombia', 'Colombia'],
  ['Estados Unidos', 'United States'],
  ['España', 'Spain'],
  ['Canadá', 'Canada'],
  ['México', 'Mexico'],
  ['Panamá', 'Panama'],
  ['Chile', 'Chile'],
  ['Otro', 'Other'],
]

/** Paso obligatorio tras crear la cuenta: datos de contacto y aceptación de los documentos legales. */
export default function CompletarPerfil() {
  const { sesion, paciente, listo, cargando, recargar } = useSesion()
  const { tx } = useIdioma()
  const [params] = useSearchParams()
  const volver = destinoSeguro(params.get('volver'))
  const navigate = useNavigate()
  const [f, setF] = useState({ nombre: '', telefono: '', pais: 'Colombia' })
  const [acepta, setAcepta] = useState({ terminos: false, intermediacion: false, confidencialidad: false, datos: false })
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (paciente) setF({ nombre: paciente.nombre, telefono: paciente.telefono, pais: paciente.pais })
  }, [paciente])

  if (cargando) return null
  if (!sesion) return <Navigate to={`/ingresar?volver=${encodeURIComponent(volver)}`} replace />
  if (listo && !params.has('editar')) return <Navigate to={volver} replace />

  const todo = acepta.terminos && acepta.intermediacion && acepta.confidencialidad && acepta.datos

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await registrarPaciente({
        ...f,
        acepta_terminos: acepta.terminos,
        acepta_intermediacion: acepta.intermediacion,
        acepta_confidencialidad: acepta.confidencialidad,
        autoriza_datos: acepta.datos,
      })
      await recargar()
      navigate(volver, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="contenedor pt-48 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="rotulo">
          {tx('Paso final', 'Final step')} · {sesion.user.email}
        </div>
        <h1 className="display mt-4 text-4xl">
          {tx(
            <>
              Antes de <em>continuar.</em>
            </>,
            <>
              Before you <em>continue.</em>
            </>,
          )}
        </h1>
        <p className="mt-5 text-piedra">
          {tx(
            'Para proteger a pacientes y prestadores, necesitamos tus datos de contacto y tu aceptación expresa de los documentos que regulan el servicio.',
            'To protect patients and providers, we need your contact details and your express acceptance of the documents that govern the service.',
          )}
        </p>
        {paciente && !paciente.terminos_vigentes && (
          <p className="mt-6 border-l-2 border-arcilla pl-5 text-sm text-piedra">
            {tx(
              `Actualizamos los documentos (versión ${TERMINOS_VERSION}): ahora indican quién es el titular de la plataforma y cómo se relacionan el paciente, la clínica y PLASTINEX. Revísalos y acéptalos de nuevo para seguir.`,
              `We have updated our documents (version ${TERMINOS_VERSION}): they now state who owns the platform and how the patient, the clinic and PLASTINEX relate to one another. Please review and accept them again to continue.`,
            )}
          </p>
        )}

        <form onSubmit={enviar} className="mt-14 space-y-12">
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="etiqueta">{tx('Nombre completo', 'Full name')}</span>
              <input required minLength={2} maxLength={80} autoComplete="name" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className="campo" />
            </label>
            <label>
              <span className="etiqueta">{tx('Teléfono / WhatsApp', 'Phone / WhatsApp')}</span>
              <input required minLength={7} maxLength={30} autoComplete="tel" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className="campo" />
            </label>
            <label>
              <span className="etiqueta">{tx('País de residencia', 'Country of residence')}</span>
              <select value={f.pais} onChange={(e) => setF({ ...f, pais: e.target.value })} className="campo">
                {paises.map(([es, en]) => (
                  <option key={es} value={es}>
                    {tx(es, en)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-linea">
            <Casilla
              v={acepta.intermediacion}
              on={(v) => setAcepta({ ...acepta, intermediacion: v })}
              titulo={tx('Entiendo que PLASTINEX es un intermediario', 'I understand that PLASTINEX is an intermediary')}
            >
              {tx(
                `PLASTINEX (${EMPRESA.razonSocial}) conecta pacientes con cirujanos e instituciones habilitadas. No presta servicios de salud, no realiza diagnósticos ni determina si soy candidato a una cirugía. Contrato directamente con la clínica que elija: ella me da el presupuesto, fija el precio, me cobra y firma conmigo los consentimientos. PLASTINEX no me cobra; recibe de la clínica una comisión o tarifa comercial pactada con ella.`,
                `PLASTINEX (${EMPRESA.razonSocial}) connects patients with licensed surgeons and institutions. It does not provide healthcare services, make diagnoses or determine whether I am a candidate for surgery. I contract directly with the clinic I choose: the clinic gives me the quote, sets the price, charges me and signs the consent forms with me. PLASTINEX does not charge me; it receives from the clinic a commission or commercial fee agreed with that clinic.`,
              )}
            </Casilla>
            <Casilla
              v={acepta.terminos}
              on={(v) => setAcepta({ ...acepta, terminos: v })}
              titulo={tx('Acepto los términos y la limitación de responsabilidad', 'I accept the terms and the limitation of liability')}
            >
              {tx(
                <>
                  He leído los{' '}
                  <Link to="/terminos" target="_blank" className="enlace">
                    términos y condiciones
                  </Link>
                  . Los precios publicados son orientativos y se confirman en una cotización individual; una solicitud no es una
                  reserva ni garantiza resultados.
                </>,
                <>
                  I have read the{' '}
                  <Link to="/terminos" target="_blank" className="enlace">
                    terms and conditions
                  </Link>
                  . Published prices are indicative and are confirmed in an individual quote; a request is not a booking and does not
                  guarantee results.
                </>,
              )}
            </Casilla>
            <Casilla
              v={acepta.confidencialidad}
              on={(v) => setAcepta({ ...acepta, confidencialidad: v })}
              titulo={tx('Acepto el acuerdo de confidencialidad', 'I accept the confidentiality agreement')}
            >
              {tx(
                'La información que intercambie con PLASTINEX y con los prestadores es confidencial. Me comprometo a usar la plataforma de buena fe y a no compartir información de terceros.',
                'The information I exchange with PLASTINEX and with providers is confidential. I agree to use the platform in good faith and not to share third-party information.',
              )}
            </Casilla>
            <Casilla
              v={acepta.datos}
              on={(v) => setAcepta({ ...acepta, datos: v })}
              titulo={tx('Autorizo el tratamiento de mis datos personales', 'I authorize the processing of my personal data')}
            >
              {tx(
                <>
                  Conforme a la Ley 1581 de 2012 y al{' '}
                  <Link to="/privacidad" target="_blank" className="enlace">
                    aviso de privacidad
                  </Link>
                  , autorizo el uso de mis datos para gestionar mis solicitudes y compartirlos con la institución que elija.
                </>,
                <>
                  In accordance with Colombian Law 1581 of 2012 and the{' '}
                  <Link to="/privacidad" target="_blank" className="enlace">
                    privacy notice
                  </Link>
                  , I authorize the use of my data to manage my requests and to share it with the institution I choose.
                </>,
              )}
            </Casilla>
          </div>

          {error && <p className="text-sm text-red-800">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-niebla">
              {tx('Documentos versión', 'Documents version')} {TERMINOS_VERSION}
            </span>
            <button disabled={!todo || enviando} className="btn">
              {enviando ? tx('Guardando…', 'Saving…') : tx('Aceptar y continuar', 'Accept and continue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Casilla({ v, on, titulo, children }: { v: boolean; on: (v: boolean) => void; titulo: string; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer gap-5 border-b border-linea py-6">
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-none border transition peer-focus-visible:ring-2 peer-focus-visible:ring-espresso/30 ${v ? 'border-espresso bg-espresso text-marfil' : 'border-niebla'}`}
      >
        {v && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2.5 6.2l2.2 2.2 4.8-5" />
          </svg>
        )}
      </span>
      <span>
        <span className="block font-medium">{titulo}</span>
        <span className="mt-1 block text-sm leading-relaxed text-piedra">{children}</span>
      </span>
    </label>
  )
}
