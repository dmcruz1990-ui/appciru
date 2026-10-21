import {
  destinos,
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
import { NotaMoneda, useIdioma } from '../idioma'

type Tx = ReturnType<typeof useIdioma>['tx']

const encajes: Record<Encaje, { t: [string, string]; c: string }> = {
  dentro: { t: ['Dentro de tu presupuesto', 'Within your budget'], c: 'bg-salvia/12 text-salvia' },
  posible: { t: ['Puede ajustarse a tu presupuesto', 'May fit your budget'], c: 'bg-arcilla/12 text-arcilla' },
  encima: { t: ['Supera tu presupuesto', 'Above your budget'], c: 'bg-espresso/6 text-piedra' },
  sin_precio: { t: ['Precio por valorar', 'Price after consultation'], c: 'bg-espresso/6 text-piedra' },
}

export const horasTexto = (h: number, tx: Tx) => {
  if (h < 1) return tx('menos de 1 h', 'under 1 h')
  if (h < 24) return `${Math.round(h)} h`
  const dias = Math.round(h / 24)
  return tx(`${dias} días`, `${dias} ${dias === 1 ? 'day' : 'days'}`)
}

/** Buscador tipo Booking: la persona dice cuánto quiere invertir y ve los planes completos que le alcanzan. */
export default function Planear() {
  const { datos } = useCatalogo()
  const { tx, dinero, loc, numero, pais, tipoAlojamiento, aCop, desdeCop, chipsPresupuesto, moneda, ciudad: nombreCiudad } = useIdioma()
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
    <div className="pt-16 md:pt-[124px]">
      {/* Barra de búsqueda */}
      <section className="border-b border-linea bg-papel">
        <div className="contenedor py-12">
          <div className="rotulo">{tx('Planea por presupuesto', 'Plan by budget')}</div>
          <h1 className="display mt-4 text-4xl md:text-5xl">
            {tx(
              <>
                ¿Cuánto quieres <em>invertir?</em>
              </>,
              <>
                How much would you like to <em>invest?</em>
              </>,
            )}
          </h1>
          <p className="mt-4 max-w-2xl text-piedra">
            {tx(
              'Dinos tu presupuesto y te mostramos los planes que encajan: cirugía y estadía de recuperación. Son valores orientativos, y el precio final lo confirma el prestador después de la valoración.',
              'Tell us your budget and we will show you the plans that fit: surgery plus a recovery stay. Amounts are indicative; the provider confirms the final price after your consultation.',
            )}
          </p>

          <div className="mt-10 grid gap-px overflow-hidden border border-linea bg-linea md:grid-cols-[1.2fr_1fr_1.3fr_auto]">
            <Celda etiqueta={tx('Procedimiento', 'Procedure')}>
              <select value={procedimiento} onChange={(e) => set('procedimiento', e.target.value)} className="w-full bg-transparent text-[15px] outline-none">
                <option value="">{tx('Todos', 'All')}</option>
                {datos.procedimientos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {loc(p, 'nombre')}
                  </option>
                ))}
              </select>
            </Celda>
            <Celda etiqueta={tx('Ciudad', 'City')}>
              <select value={ciudad} onChange={(e) => set('ciudad', e.target.value)} className="w-full bg-transparent text-[15px] outline-none">
                <option value="">{tx('Todos los destinos', 'All destinations')}</option>
                {destinos(datos)
                  .filter((d) => d.opciones > 0)
                  .map((d) => (
                    <optgroup key={d.pais} label={pais(d.pais)}>
                      {d.ciudades
                        .filter((x) => x.opciones > 0)
                        .map(({ ciudad: c }) => (
                          <option key={c.id} value={c.id}>
                            {nombreCiudad(c)}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
            </Celda>
            <Celda etiqueta={tx(`Tu presupuesto total (${moneda})`, `Your total budget (${moneda})`)}>
              <div className="flex items-center gap-2">
                <span className="text-piedra">$</span>
                <input
                  inputMode="numeric"
                  value={presupuesto ? numero(desdeCop(presupuesto)) : ''}
                  onChange={(e) => {
                    const valor = Number(e.target.value.replace(/\D/g, '').slice(0, moneda === 'USD' ? 7 : 10))
                    set('presupuesto', valor ? String(aCop(valor)) : '')
                  }}
                  placeholder={moneda === 'USD' ? tx('Ej.: 4.000', 'e.g. 4,000') : tx('Ej.: 15.000.000', 'e.g. 15,000,000')}
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-niebla"
                />
              </div>
            </Celda>
            <div className="flex items-center bg-marfil px-4 py-3">
              <Interruptor activo={conAlojamiento} onChange={(v) => set('alojamiento', v ? '' : '0')}>
                {tx('Con estadía', 'Include stay')}
              </Interruptor>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chipsPresupuesto.map((c) => (
              <button
                key={c.cop}
                onClick={() => set('presupuesto', String(c.cop))}
                className={`border px-3.5 py-1.5 text-xs transition ${presupuesto === c.cop ? 'border-espresso bg-espresso text-marfil' : 'border-linea text-piedra hover:border-espresso'}`}
              >
                {c.texto}
              </button>
            ))}
            {conAlojamiento && (
              <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-piedra">
                <label className="flex items-center gap-2">
                  {tx('Noches', 'Nights')}
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
                  <option value="">{tx('Cualquier alojamiento', 'Any stay')}</option>
                  {(Object.keys(nombreTipoAlojamiento) as TipoAlojamiento[]).map((v) => (
                    <option key={v} value={v}>
                      {tipoAlojamiento(v)}
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
              tx(
                <>
                  {dentro} {dentro === 1 ? 'plan' : 'planes'} dentro de <em>{dinero(presupuesto)}</em>
                </>,
                <>
                  {dentro} {dentro === 1 ? 'plan' : 'plans'} within <em>{dinero(presupuesto)}</em>
                </>,
              )
            ) : (
              tx(`${planes.length} planes disponibles`, `${planes.length} ${planes.length === 1 ? 'plan' : 'plans'} available`)
            )}
          </p>
          <span className="text-sm text-piedra">{tx('Ordenados por encaje con tu presupuesto y precio', 'Sorted by budget fit and price')}</span>
        </div>
        <NotaMoneda className="mt-3" />

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
              <div className="rotulo !text-marfil/50">{tx('Propón tu presupuesto', 'Suggest your budget')}</div>
              <p className="display mt-4 text-4xl md:text-5xl">
                {tx(
                  <>
                    ¿No encuentras un plan a tu medida? <em>Cuéntanos cuánto puedes invertir.</em>
                  </>,
                  <>
                    Can't find a plan that fits? <em>Tell us how much you can invest.</em>
                  </>,
                )}
              </p>
              <p className="mt-4 max-w-xl text-sm text-marfil/70">
                {tx(
                  'Enviamos tu presupuesto a las instituciones de la red. Si alguna puede ofrecerte una alternativa segura dentro de ese valor, un coordinador te contacta.',
                  'We share your budget with the clinics in our network. If one can offer you a safe alternative within that amount, a coordinator will contact you.',
                )}
              </p>
            </div>
            <Link
              to={`/solicitar?${new URLSearchParams({ ...(procedimiento && { procedimiento }), ...(ciudad && { ciudad }), ...(presupuesto && { presupuesto: String(presupuesto) }) })}`}
              className="btn-claro"
            >
              {tx('Proponer mi presupuesto', 'Suggest my budget')}
            </Link>
          </div>
        )}

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-niebla">
          {tx(
            'Plan estimado = rango publicado por el prestador + el alojamiento aliado más económico de la ciudad por las noches indicadas. No incluye exámenes, medicamentos ni otros servicios salvo que se indique. La seguridad no se negocia: no recomendamos elegir solo por precio.',
            "Estimated plan = the provider's published range + the city's most affordable partner stay for the nights selected. Tests, medication and other services are not included unless stated. Safety is non-negotiable: we don't recommend choosing on price alone.",
          )}
        </p>
      </section>
    </div>
  )
}

function FilaPlan({ plan, presupuesto, tiempo }: { plan: PlanEstimado; presupuesto?: number; tiempo?: number }) {
  const { d, alojamiento, noches, desde, hasta, encaje } = plan
  const { tx, dinero, loc, tipoAlojamiento, ciudad } = useIdioma()
  const nombre = loc(d.procedimiento, 'nombre')
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
        <Foto src={d.institucion.imagen_url ?? d.procedimiento.imagen_url} alt={nombre} ancho={600} zoom className="aspect-[4/3] h-full md:aspect-auto" respaldo={nombre} />
      </Link>
      <div className="p-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rotulo !text-[10px]">{ciudad(d.ciudad)}</span>
          {d.institucion.es_demo && <EtiquetaDemo />}
        </div>
        <h3 className="mt-3 font-serif text-3xl leading-tight">{nombre}</h3>
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
          {d.institucion.valoracion_precio === 0 && <li>✓ {tx('Primera valoración sin costo', 'Free first consultation')}</li>}
          {d.institucion.valoracion_precio != null && d.institucion.valoracion_precio > 0 && <li>{tx(`Valoración ${dinero(d.institucion.valoracion_precio)}`, `Consultation ${dinero(d.institucion.valoracion_precio)}`)}</li>}
          {d.institucion.financiacion && <li>✓ {tx('Opciones de financiación', 'Financing options')}</li>}
          {d.profesional?.valoracion_virtual && <li>✓ {tx('Valoración virtual', 'Virtual consultation')}</li>}
          {tiempo != null && <li>{tx(`Responde en ${horasTexto(tiempo, tx)}`, `Replies within ${horasTexto(tiempo, tx)}`)}</li>}
        </ul>
        {d.oferta.incluye && <p className="mt-5 text-xs leading-relaxed text-niebla">{tx('Incluye', 'Includes')}: {loc(d.oferta, 'incluye')}</p>}
      </div>
      <div className="flex flex-col justify-between gap-6 border-t border-linea p-7 md:border-t-0 md:border-l">
        <div>
          <span className={`inline-block px-3 py-1 text-[10px] tracking-[0.16em] uppercase font-medium ${e.c}`}>{tx(e.t[0], e.t[1])}</span>
          <div className="mt-5 text-xs text-piedra">{tx('Plan estimado', 'Estimated plan')}</div>
          <div className="font-serif text-3xl leading-tight">{desde != null ? (desde === hasta ? dinero(desde) : `${dinero(desde)} – ${dinero(hasta!)}`) : tx('Por valorar', 'After consultation')}</div>
          <dl className="mt-4 space-y-1.5 text-xs text-piedra">
            <div className="flex justify-between gap-3">
              <dt>{tx('Cirugía', 'Surgery')}</dt>
              <dd>{d.oferta.precio_min != null || d.oferta.precio_max != null
                  ? tx(`desde ${dinero((d.oferta.precio_min ?? d.oferta.precio_max)!)}`, `from ${dinero((d.oferta.precio_min ?? d.oferta.precio_max)!)}`)
                  : tx('por valorar', 'after consultation')}</dd>
            </div>
            {!alojamiento && noches > 0 && (
              <div className="flex justify-between gap-3">
                <dt>{tx(`Alojamiento · ${noches} noches`, `Stay · ${noches} ${noches === 1 ? 'night' : 'nights'}`)}</dt>
                <dd>{tx('por cotizar', 'on request')}</dd>
              </div>
            )}
            {alojamiento && (
              <div className="flex justify-between gap-3">
                <dt>
                  {tipoAlojamiento(alojamiento.tipo)} · {tx(`${noches} noches`, `${noches} ${noches === 1 ? 'night' : 'nights'}`)}
                </dt>
                <dd>{dinero(alojamiento.precio_noche_desde! * noches)}</dd>
              </div>
            )}
          </dl>
        </div>
        <Link to={`/solicitar?${q}`} className="btn w-full !px-4">
          {tx('Solicitar con este plan', 'Request with this plan')}
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
