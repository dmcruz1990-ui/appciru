import { etapas, formatoFecha, formatoFechaHora, infoEtapa, misSolicitudes, useCarga } from '@plastinex/shared'
import { Link, Navigate } from 'react-router-dom'
import { EnlaceFlecha, Revelar } from '../componentes/base'
import { useSesion } from '../sesion'

export default function Cuenta() {
  const { sesion, paciente, listo, cargando, salir } = useSesion()
  const sol = useCarga(misSolicitudes, [sesion?.user.id])

  if (cargando) return null
  if (!sesion) return <Navigate to="/ingresar?volver=/cuenta" replace />
  if (!listo) return <Navigate to="/cuenta/completar?volver=/cuenta" replace />

  const flujo = etapas.filter((e) => e.id !== 'no_continua')

  return (
    <div className="contenedor pt-48 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-linea pb-10">
        <div>
          <div className="rotulo">Mi cuenta</div>
          <h1 className="display mt-4 text-4xl md:text-5xl">
            Hola, <em>{paciente?.nombre.split(' ')[0]}.</em>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link to="/cuenta/completar?editar=1&volver=/cuenta" className="btn-linea">
            Mis datos
          </Link>
          <button onClick={() => void salir()} className="btn-linea">
            Salir
          </button>
        </div>
      </div>

      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="display text-4xl">Mis solicitudes</h2>
          <EnlaceFlecha to="/solicitar">Nueva solicitud</EnlaceFlecha>
        </div>

        {sol.cargando && !sol.datos && <p className="mt-10 text-piedra">Cargando…</p>}
        {sol.error && <p className="mt-10 text-sm text-red-800">{sol.error}</p>}
        {sol.datos?.length === 0 && (
          <div className="mt-10 border border-dashed border-linea p-12 text-center">
            <p className="font-serif text-3xl">Aún no tienes solicitudes.</p>
            <Link to="/explorar" className="btn mt-6">
              Explorar opciones
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {sol.datos?.map((s, i) => {
            const idx = flujo.findIndex((e) => e.id === s.etapa)
            return (
              <Revelar key={s.codigo} retraso={i * 0.05}>
                <article className="grid gap-8 border border-linea bg-papel p-8 md:grid-cols-[1.2fr_1fr]">
                  <div>
                    <div className="rotulo">
                      {s.codigo} · {formatoFecha(s.creado_en)}
                    </div>
                    <h3 className="mt-3 font-serif text-4xl">{s.procedimiento ?? 'Orientación general'}</h3>
                    <p className="mt-1 text-piedra">{[s.institucion, s.profesional, s.ciudad].filter(Boolean).join(' · ')}</p>
                    <dl className="mt-6 grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <dt className="etiqueta">Estado</dt>
                        <dd className="mt-1">{infoEtapa(s.etapa).paciente}</dd>
                      </div>
                      <div>
                        <dt className="etiqueta">Valoración</dt>
                        <dd className="mt-1">{s.cita_valoracion_en ? formatoFechaHora(s.cita_valoracion_en) : 'Por agendar'}</dd>
                      </div>
                      {(s.alojamiento || s.servicios.length > 0) && (
                        <div className="col-span-2">
                          <dt className="etiqueta">Tu plan</dt>
                          <dd className="mt-1">
                            {[s.alojamiento && `${s.alojamiento} · ${s.noches} noches`, ...s.servicios].filter(Boolean).join(' · ')}
                          </dd>
                        </div>
                      )}
                    </dl>
                    {s.etapa !== 'no_continua' && (
                      <ol className="mt-8 grid grid-cols-6 gap-1.5">
                        {flujo.map((e, j) => (
                          <li key={e.id} title={e.paciente} className={`h-[3px] ${j <= idx ? 'bg-espresso' : 'bg-linea'}`} />
                        ))}
                      </ol>
                    )}
                  </div>
                  <ol className="space-y-5 border-l border-linea pl-6">
                    {s.eventos.map((ev, k) => (
                      <li key={k} className="text-sm">
                        <div className="font-medium">
                          {ev.tipo === 'mensaje_paciente' ? 'Mensaje de tu coordinador' : ev.etapa ? infoEtapa(ev.etapa).paciente : 'Actualización'}
                        </div>
                        <div className="text-xs text-niebla">{formatoFechaHora(ev.creado_en)}</div>
                        {ev.texto && ev.tipo === 'mensaje_paciente' && <p className="mt-1 text-piedra">{ev.texto}</p>}
                      </li>
                    ))}
                  </ol>
                </article>
              </Revelar>
            )
          })}
        </div>
      </section>
    </div>
  )
}
