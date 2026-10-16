import {
  formatoCOP,
  nombreTipoAlojamiento,
  planesPorPresupuesto,
  tiemposRespuesta,
  useCarga,
  type Encaje,
  type PlanEstimado,
  type TipoAlojamiento,
} from '@plastinex/shared'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto, Revelar } from '../componentes/base'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'

const encajes: Record<Encaje, { t: string; c: string }> = {
  dentro: { t: 'Dentro de tu presupuesto', c: 'bg-salvia/12 text-salvia' },
  posible: { t: 'Puede ajustarse a tu presupuesto', c: 'bg-arcilla/12 text-arcilla' },
  encima: { t: 'Supera tu presupuesto', c: 'bg-espresso/6 text-piedra' },
  sin_precio: { t: 'Precio por valorar', c: 'bg-espresso/6 text-piedra' },
}

const pasosPresupuesto = [8_000_000, 10_000_000, 12_000_000, 15_000_000, 18_000_000, 22_000_000, 30_000_000]

export const horasTexto = (h: number) => (h < 1 ? 'menos de 1 h' : h < 24 ? `${Math.round(h)} h` : `${Math.round(h / 24)} días`)

/** Buscador tipo Booking: la persona dice cuánto quiere invertir y ve los planes completos que le alcanzan. */
export default function Planear() {
  const { datos } = useCatalogo()
  const tiempos = useCarga(tiemposRespuesta)
  const [params, setParams] = useSearchParams()

  const procedimiento = params.get('procedimiento') ?? ''
  const ciudad = params.get('ciudad') ?? ''
  const presupuesto = Number(params.get('presupuesto') ?? 0) || undefined
  const conAlojamiento = params.get('alojamiento') !== '0'
  const nochesParam = Number(params.get('noches') ?? 0) || undefined
  const tipo = (params.get('tipo') ?? '') as TipoAlojamiento | ''

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const planes = useMemo(
    () => (datos ? planesPorPresupuesto(datos, { procedimiento, ciudad, presupuesto, noches: nochesParam, conAlojamiento, tipoAlojamiento: tipo }) : []),
    [datos, procedimiento, ciudad, presupuesto, nochesParam, conAlojamiento, tipo],
  )
  if (!datos) return null

  const proc = datos.procedimientos.find((p) => p.id === procedimiento)
  const noches = nochesParam ?? proc?.estadia_sugerida_dias ?? 7
  const dentro = planes.filter((p) => p.encaje === 'dentro').length
  const tiempo = (id: string) => tiempos.datos?.find((t) => t.institucion_id === id)

  return (
    <div className="pt-[72px]">
      {/* Barra de búsqueda */}
      <section className="border-b border-linea bg-papel">
        <div className="contenedor py-12">
          <div className="rotulo">Planea por presupuesto</div>
          <h1 className="display mt-4 text-5xl md:text-7xl">
            ¿Cuánto quieres <em>invertir?</em>
          </h1>
          <p className="mt-4 max-w-2xl text-piedra">
            Dinos tu presupuesto y te mostramos los planes que encajan: cirugía y estadía de recuperación. Son valores orientativos,
            y el precio final lo confirma el prestador después de la valoración.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-linea bg-linea md:grid-cols-[1.2fr_1fr_1.3fr_auto]">
            <Celda etiqueta="Procedimiento">
              <select value={procedimiento} onChange={(e) => set('procedimiento', e.target.value)} className="w-full bg-transparent text-[15px] outline-none">
                <option value="">Todos</option>
                {datos.procedimientos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Celda>
            <Celda etiqueta="Ciudad">
              <select value={ciudad} onChange={(e) => set('ciudad', e.target.value)} className="w-full bg-transparent text-[15px] outline-none">
                <option value="">Toda la región</option>
                {datos.ciudades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Celda>
            <Celda etiqueta="Tu presupuesto total (COP)">
              <div className="flex items-center gap-2">
                <span className="text-piedra">$</span>
                <input
                  inputMode="numeric"
                  value={presupuesto ? presupuesto.toLocaleString('es-CO') : ''}
                  onChange={(e) => set('presupuesto', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Ej.: 15.000.000"
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-niebla"
                />
              </div>
            </Celda>
            <div className="flex items-center bg-marfil px-4 py-3">
              <Interruptor activo={conAlojamiento} onChange={(v) => set('alojamiento', v ? '' : '0')}>
                Con estadía
              </Interruptor>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {pasosPresupuesto.map((v) => (
              <button
                key={v}
                onClick={() => set('presupuesto', String(v))}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition ${presupuesto === v ? 'border-espresso bg-espresso text-marfil' : 'border-linea text-piedra hover:border-espresso'}`}
              >
                {v / 1_000_000} M
              </button>
            ))}
            {conAlojamiento && (
              <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-piedra">
                <label className="flex items-center gap-2">
                  Noches
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={noches}
                    onChange={(e) => set('noches', String(Math.min(60, Math.max(1, Number(e.target.value) || 1))))}
                    className="w-16 border-b border-linea bg-transparent py-1 text-center text-espresso outline-none focus:border-espresso"
                  />
                </label>
                <select value={tipo} onChange={(e) => set('tipo', e.target.value)} className="border-b border-linea bg-transparent py-1 outline-none">
                  <option value="">Cualquier alojamiento</option>
                  {Object.entries(nombreTipoAlojamiento).map(([v, t]) => (
                    <option key={v} value={v}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="contenedor py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="font-serif text-3xl">
            {presupuesto ? (
              <>
                {dentro} {dentro === 1 ? 'plan' : 'planes'} dentro de <em>{formatoCOP(presupuesto)}</em>
              </>
            ) : (
              <>{planes.length} planes disponibles</>
            )}
          </p>
          <span className="text-sm text-piedra">Ordenados por encaje con tu presupuesto y precio</span>
        </div>

        <div className="mt-10 space-y-6">
          {planes.map((p, i) => (
            <Revelar key={p.d.oferta.id} retraso={Math.min(i, 5) * 0.04}>
              <FilaPlan plan={p} presupuesto={presupuesto} tiempo={tiempo(p.d.institucion.id)?.mediana_horas} />
            </Revelar>
          ))}
        </div>

        {(planes.length === 0 || (presupuesto && dentro === 0)) && (
          <div className="mt-12 grid gap-8 bg-espresso p-10 text-marfil md:grid-cols-[1fr_auto] md:items-center md:p-14">
            <div>
              <div className="rotulo !text-marfil/50">Propón tu presupuesto</div>
              <p className="display mt-4 text-4xl md:text-5xl">
                ¿No encuentras un plan a tu medida? <em>Cuéntanos cuánto puedes invertir.</em>
              </p>
              <p className="mt-4 max-w-xl text-sm text-marfil/70">
                Enviamos tu presupuesto a las instituciones de la red. Si alguna puede ofrecerte una alternativa segura dentro de ese
                valor, un coordinador te contacta.
              </p>
            </div>
            <Link
              to={`/solicitar?${new URLSearchParams({ ...(procedimiento && { procedimiento }), ...(ciudad && { ciudad }), ...(presupuesto && { presupuesto: String(presupuesto) }) })}`}
              className="btn-claro"
            >
              Proponer mi presupuesto
            </Link>
          </div>
        )}

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-niebla">
          Plan estimado = rango publicado por el prestador + el alojamiento aliado más económico de la ciudad por las noches
          indicadas. No incluye exámenes, medicamentos ni otros servicios salvo que se indique. La seguridad no se negocia: no
          recomendamos elegir solo por precio.
        </p>
      </section>
    </div>
  )
}

function FilaPlan({ plan, presupuesto, tiempo }: { plan: PlanEstimado; presupuesto?: number; tiempo?: number }) {
  const { d, alojamiento, noches, desde, hasta, encaje } = plan
  const e = encajes[encaje]
  const q = new URLSearchParams({ oferta: d.oferta.id })
  if (presupuesto) q.set('presupuesto', String(presupuesto))
  if (alojamiento) {
    q.set('alojamiento', alojamiento.id)
    q.set('noches', String(noches))
  }
  return (
    <article className="group grid overflow-hidden border border-linea bg-papel md:grid-cols-[260px_1fr_300px]">
      <Link to={`/procedimiento/${d.procedimiento.id}`} className="block">
        <Foto src={d.institucion.imagen_url ?? d.procedimiento.imagen_url} alt={d.procedimiento.nombre} ancho={600} zoom className="aspect-[4/3] h-full md:aspect-auto" respaldo={d.procedimiento.nombre} />
      </Link>
      <div className="p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rotulo !text-[10px]">{d.ciudad.nombre}</span>
          {d.institucion.es_demo && <EtiquetaDemo />}
        </div>
        <h3 className="mt-3 font-serif text-3xl leading-tight">{d.procedimiento.nombre}</h3>
        <div className="mt-1 text-sm text-piedra">
          <Link to={`/institucion/${d.institucion.id}`} className="hover:text-espresso">
            {d.institucion.nombre}
          </Link>
          {d.profesional && ` · ${d.profesional.nombre}`}
        </div>
        <div className="mt-4">
          <EstadoVerificacion v={d.institucion.verificacion} />
        </div>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-piedra">
          {d.institucion.valoracion_precio === 0 && <li>✓ Primera valoración sin costo</li>}
          {d.institucion.valoracion_precio != null && d.institucion.valoracion_precio > 0 && <li>Valoración {formatoCOP(d.institucion.valoracion_precio)}</li>}
          {d.institucion.financiacion && <li>✓ Opciones de financiación</li>}
          {d.profesional?.valoracion_virtual && <li>✓ Valoración virtual</li>}
          {tiempo != null && <li>Responde en {horasTexto(tiempo)}</li>}
        </ul>
        {d.oferta.incluye && <p className="mt-5 text-xs leading-relaxed text-niebla">Incluye: {d.oferta.incluye}</p>}
      </div>
      <div className="flex flex-col justify-between gap-6 border-t border-linea p-7 md:border-t-0 md:border-l">
        <div>
          <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-medium ${e.c}`}>{e.t}</span>
          <div className="mt-5 text-xs text-piedra">Plan estimado</div>
          <div className="font-serif text-3xl leading-tight">{desde != null ? (desde === hasta ? formatoCOP(desde) : `${formatoCOP(desde)} – ${formatoCOP(hasta!)}`) : 'Por valorar'}</div>
          <dl className="mt-4 space-y-1.5 text-xs text-piedra">
            <div className="flex justify-between gap-3">
              <dt>Cirugía</dt>
              <dd>{d.oferta.precio_min != null || d.oferta.precio_max != null ? `desde ${formatoCOP((d.oferta.precio_min ?? d.oferta.precio_max)!)}` : 'por valorar'}</dd>
            </div>
            {!alojamiento && noches > 0 && (
              <div className="flex justify-between gap-3">
                <dt>Alojamiento · {noches} noches</dt>
                <dd>por cotizar</dd>
              </div>
            )}
            {alojamiento && (
              <div className="flex justify-between gap-3">
                <dt>
                  {nombreTipoAlojamiento[alojamiento.tipo]} · {noches} noches
                </dt>
                <dd>{formatoCOP(alojamiento.precio_noche_desde! * noches)}</dd>
              </div>
            )}
          </dl>
        </div>
        <Link to={`/solicitar?${q}`} className="btn w-full">
          Solicitar con este plan
        </Link>
      </div>
    </article>
  )
}

function Celda({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block bg-marfil px-5 py-3.5">
      <span className="etiqueta !text-[10px]">{etiqueta}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Interruptor({ activo, onChange, children }: { activo: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => onChange(!activo)} className="flex items-center gap-3 text-sm whitespace-nowrap">
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${activo ? 'bg-espresso' : 'bg-linea'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-marfil transition-all duration-300 ${activo ? 'left-6' : 'left-1'}`} />
      </span>
      {children}
    </button>
  )
}
