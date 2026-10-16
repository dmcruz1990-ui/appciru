import { consultarSolicitud, etapas, formatoFecha, formatoFechaHora, infoEtapa, type SolicitudPublica } from '@plastinex/shared'
import { useState, type FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

export default function Seguimiento() {
  const [params] = useSearchParams()
  const estadoNav = useLocation().state as { email?: string } | null
  const [codigo, setCodigo] = useState(params.get('codigo') ?? '')
  const [email, setEmail] = useState(estadoNav?.email ?? '')
  const [res, setRes] = useState<SolicitudPublica | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const consultar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      setRes(await consultarSolicitud(codigo, email))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setCargando(false)
    }
  }

  const flujo = etapas.filter((e) => e.id !== 'no_continua')
  const idxActual = res ? flujo.findIndex((e) => e.id === res.etapa) : -1

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <div className="kicker">— Seguimiento</div>
      <h1 className="titulo mt-2 text-4xl">
        Consulta tu <em>solicitud.</em>
      </h1>
      <form onSubmit={consultar} className="mt-8 grid gap-3 border border-arena bg-white p-5 sm:grid-cols-[1fr_1fr_auto]">
        <label>
          <span className="etiqueta">Código</span>
          <input required value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="PX-XXXXXX" className="campo font-mono" />
        </label>
        <label>
          <span className="etiqueta">Correo usado</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="campo" />
        </label>
        <button disabled={cargando} className="btn-tinta self-end">
          {cargando ? 'Consultando…' : 'Consultar'}
        </button>
      </form>

      {error && <p className="mt-4 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {res === null && <p className="mt-6 text-sm text-piedra">No encontramos una solicitud con ese código y correo.</p>}

      {res && (
        <div className="mt-8 space-y-6">
          <div className="border border-arena bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="titulo text-2xl">{res.procedimiento ?? 'Orientación general'}</div>
              <span className="font-mono text-sm">{res.codigo}</span>
            </div>
            <div className="text-sm text-piedra">
              {[res.institucion, res.profesional, res.ciudad].filter(Boolean).join(' · ')}
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="etiqueta">Estado</dt>
                <dd className="font-medium">{infoEtapa(res.etapa).paciente}</dd>
              </div>
              <div>
                <dt className="etiqueta">Fecha tentativa</dt>
                <dd>{res.fecha_tentativa ? formatoFecha(res.fecha_tentativa) : 'No indicada'}</dd>
              </div>
              <div>
                <dt className="etiqueta">Cita de valoración</dt>
                <dd>{res.cita_valoracion_en ? formatoFechaHora(res.cita_valoracion_en) : 'Por agendar'}</dd>
              </div>
            </dl>
            {(res.alojamiento || res.servicios.length > 0) && (
              <div className="mt-4 border-t border-arena pt-4 text-sm">
                <span className="etiqueta">Tu plan</span>
                {res.alojamiento && (
                  <div>
                    {res.alojamiento} · {res.noches} noches
                  </div>
                )}
                {res.servicios.length > 0 && <div>{res.servicios.join(', ')}</div>}
              </div>
            )}
            {res.etapa !== 'no_continua' && (
              <ol className="mt-6 grid grid-cols-6 gap-1">
                {flujo.map((e, i) => (
                  <li key={e.id} title={e.paciente} className={`h-1.5 ${i <= idxActual ? 'bg-oro' : 'bg-arena'}`} />
                ))}
              </ol>
            )}
          </div>

          <div className="border border-arena bg-white p-6">
            <div className="etiqueta">Historial</div>
            <ol className="mt-3 space-y-4 border-l border-oro pl-5">
              {res.eventos.map((ev, i) => (
                <li key={i} className="text-sm">
                  <div className="font-medium">{ev.tipo === 'mensaje_paciente' ? 'Mensaje del coordinador' : ev.etapa ? infoEtapa(ev.etapa).paciente : 'Actualización'}</div>
                  <div className="text-xs text-piedra">{formatoFechaHora(ev.creado_en)}</div>
                  {ev.texto && ev.tipo === 'mensaje_paciente' && <p className="mt-1">{ev.texto}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
