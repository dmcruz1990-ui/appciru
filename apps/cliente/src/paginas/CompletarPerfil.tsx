import { EMPRESA, registrarPaciente, TERMINOS_VERSION } from '@plastinex/shared'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useSesion } from '../sesion'
import { destinoSeguro } from './Ingresar'

const paises = ['Colombia', 'Estados Unidos', 'España', 'Canadá', 'México', 'Panamá', 'Chile', 'Otro']

/** Paso obligatorio tras crear la cuenta: datos de contacto y aceptación de los documentos legales. */
export default function CompletarPerfil() {
  const { sesion, paciente, listo, cargando, recargar } = useSesion()
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
    <div className="contenedor pt-36 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="rotulo">Paso final · {sesion.user.email}</div>
        <h1 className="display mt-4 text-6xl">
          Antes de <em>continuar.</em>
        </h1>
        <p className="mt-5 text-piedra">
          Para proteger a pacientes y prestadores, necesitamos tus datos de contacto y tu aceptación expresa de los documentos que
          regulan el servicio.
        </p>
        {paciente && !paciente.terminos_vigentes && (
          <p className="mt-6 border-l-2 border-arcilla pl-5 text-sm text-piedra">
            Actualizamos los documentos (versión {TERMINOS_VERSION}): ahora indican quién es el titular de la plataforma y cómo se
            relacionan el paciente, la clínica y PLASTINEX. Revísalos y acéptalos de nuevo para seguir.
          </p>
        )}

        <form onSubmit={enviar} className="mt-14 space-y-12">
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="etiqueta">Nombre completo</span>
              <input required minLength={2} maxLength={80} autoComplete="name" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className="campo" />
            </label>
            <label>
              <span className="etiqueta">Teléfono / WhatsApp</span>
              <input required minLength={7} maxLength={30} autoComplete="tel" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} className="campo" />
            </label>
            <label>
              <span className="etiqueta">País de residencia</span>
              <select value={f.pais} onChange={(e) => setF({ ...f, pais: e.target.value })} className="campo">
                {paises.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-linea">
            <Casilla v={acepta.intermediacion} on={(v) => setAcepta({ ...acepta, intermediacion: v })} titulo="Entiendo que PLASTINEX es un intermediario">
              PLASTINEX ({EMPRESA.razonSocial}) conecta pacientes con cirujanos e instituciones habilitadas. No presta servicios de
              salud, no realiza diagnósticos ni determina si soy candidato a una cirugía. Contrato directamente con la clínica que
              elija: ella me da el presupuesto, fija el precio, me cobra y firma conmigo los consentimientos. PLASTINEX no me cobra;
              recibe de la clínica una comisión o tarifa comercial pactada con ella.
            </Casilla>
            <Casilla v={acepta.terminos} on={(v) => setAcepta({ ...acepta, terminos: v })} titulo="Acepto los términos y la limitación de responsabilidad">
              He leído los{' '}
              <Link to="/terminos" target="_blank" className="enlace">
                términos y condiciones
              </Link>
              . Los precios publicados son orientativos y se confirman en una cotización individual; una solicitud no es una reserva
              ni garantiza resultados.
            </Casilla>
            <Casilla v={acepta.confidencialidad} on={(v) => setAcepta({ ...acepta, confidencialidad: v })} titulo="Acepto el acuerdo de confidencialidad">
              La información que intercambie con PLASTINEX y con los prestadores es confidencial. Me comprometo a usar la plataforma
              de buena fe y a no compartir información de terceros.
            </Casilla>
            <Casilla v={acepta.datos} on={(v) => setAcepta({ ...acepta, datos: v })} titulo="Autorizo el tratamiento de mis datos personales">
              Conforme a la Ley 1581 de 2012 y al{' '}
              <Link to="/privacidad" target="_blank" className="enlace">
                aviso de privacidad
              </Link>
              , autorizo el uso de mis datos para gestionar mis solicitudes y compartirlos con la institución que elija.
            </Casilla>
          </div>

          {error && <p className="text-sm text-red-800">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-niebla">Documentos versión {TERMINOS_VERSION}</span>
            <button disabled={!todo || enviando} className="btn">
              {enviando ? 'Guardando…' : 'Aceptar y continuar'}
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
        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition peer-focus-visible:ring-2 peer-focus-visible:ring-espresso/30 ${v ? 'border-espresso bg-espresso text-marfil' : 'border-niebla'}`}
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
