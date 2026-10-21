import { Check, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Revelar, Rotulo } from '../componentes/base'
import { nochesEntre } from '../componentes/Buscador'
import { useFavoritos } from '../componentes/favoritos'
import Galeria from '../componentes/Galeria'
import { EtiquetaDemo } from '../componentes/Insignias'
import Mapa from '../componentes/Mapa'
import NoEncontrado from '../componentes/NoEncontrado'
import { NotaMoneda, useIdioma } from '../idioma'

/** Ficha de un alojamiento de recuperación con reserva por fechas (se cotiza junto con la valoración). */
export default function AlojamientoPagina() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { datos } = useCatalogo()
  const [llegada, setLlegada] = useState(params.get('llegada') ?? '')
  const [salida, setSalida] = useState(params.get('salida') ?? '')
  const { es, alternar } = useFavoritos()
  const { tx, dinero, loc, tipoAlojamiento, ciudadDe } = useIdioma()
  const a = datos?.alojamientos.find((x) => x.id === id)
  if (!datos || !a) return <NoEncontrado texto={tx('Este alojamiento no está disponible.', 'This stay is not available.')} />

  const ciudad = ciudadDe(a.ciudad_id)
  const noches = nochesEntre(llegada, salida)
  const total = a.precio_noche_desde && noches ? a.precio_noche_desde * noches : 0
  const clinicas = datos.instituciones.filter((i) => i.ciudad_id === a.ciudad_id && i.publicado)
  const minLlegada = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
  const q = new URLSearchParams({ alojamiento: a.id, ciudad: a.ciudad_id })
  if (noches) q.set('noches', String(noches))
  if (llegada) q.set('fecha', llegada)
  const clave = `alojamiento:${a.id}`
  const incluye = [
    a.incluye_enfermeria && tx('Enfermería', 'Nursing care'),
    a.incluye_alimentacion && tx('Alimentación', 'Meals'),
    tx('Acompañamiento en la recuperación', 'Support during your recovery'),
    tx('Cerca de las clínicas de la ciudad', "Close to the city's clinics"),
  ].filter((x): x is string => !!x)

  return (
    <div className="pt-16 md:pt-[124px]">
      <div className="contenedor pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rotulo">
                {tipoAlojamiento(a.tipo)} · {ciudad}
              </span>
              {a.es_demo && <EtiquetaDemo />}
            </div>
            <h1 className="display mt-4 text-3xl md:text-5xl">{a.nombre}</h1>
          </div>
          <button onClick={() => alternar(clave)} aria-pressed={es(clave)} className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium tracking-[0.2em] uppercase underline-offset-[6px] hover:underline">
            <span className={`inline-block h-2 w-2 ${es(clave) ? 'bg-espresso' : 'border border-espresso'}`} />
            {es(clave) ? tx('Guardado', 'Saved') : tx('Guardar', 'Save')}
          </button>
        </div>

        <div className="mt-8">
          <Galeria fotos={a.galeria ?? []} titulo={a.nombre} semilla={a.nombre} />
        </div>

        <div className="grid gap-16 py-14 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <p className="display normal-case text-2xl leading-snug md:text-3xl">{loc(a, 'descripcion')}</p>
            {a.capacidad && (
              <p className="mt-6 flex items-center gap-3 text-[15px]">
                <Users size={18} strokeWidth={1.4} />{' '}
                {tx(`Hasta ${a.capacidad} ${a.capacidad === 1 ? 'persona' : 'personas'}`, `Up to ${a.capacidad} ${a.capacidad === 1 ? 'guest' : 'guests'}`)}
              </p>
            )}
            <section className="mt-14">
              <Rotulo>{tx('Lo que incluye', "What's included")}</Rotulo>
              <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {incluye.map((s) => (
                  <li key={s} className="flex items-center gap-3 text-[15px]">
                    <Check size={16} strokeWidth={1.6} /> {s}
                  </li>
                ))}
              </ul>
            </section>
            {a.lat != null && a.lng != null && (
              <section className="mt-14">
                <Rotulo>{tx('Ubicación', 'Location')}</Rotulo>
                <Mapa puntos={[{ id: a.id, lat: a.lat, lng: a.lng, etiqueta: a.nombre }]} className="mt-6 h-[340px] border border-linea" zoomInicial={13} />
                {a.es_demo && <p className="mt-3 text-xs text-piedra">{tx('Ubicación aproximada de un perfil de demostración.', 'Approximate location of a demo profile.')}</p>}
              </section>
            )}
            {clinicas.length > 0 && (
              <section className="mt-14">
                <Rotulo>{tx(`Clínicas en ${ciudad}`, `Clinics in ${ciudad}`)}</Rotulo>
                <ul className="mt-6 divide-y divide-linea border-y border-linea">
                  {clinicas.map((i) => (
                    <li key={i.id}>
                      <Link to={`/institucion/${i.id}`} className="flex items-center justify-between gap-4 py-4 text-[14px] font-medium tracking-[0.08em] uppercase hover:underline">
                        {i.nombre} <span className="text-[11px] tracking-[0.2em] text-piedra">{tx('Ver', 'View')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside>
            <Revelar className="lg:sticky lg:top-28">
              <div className="border border-linea p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="text-[22px] font-light">
                  {a.precio_noche_desde ? (
                    <>
                      {dinero(a.precio_noche_desde)} <span className="text-sm text-piedra">{tx('noche', 'night')}</span>
                    </>
                  ) : (
                    tx('Precio por cotizar', 'Price on request')
                  )}
                </div>
                <div className="mt-6 grid grid-cols-2 border border-linea">
                  <label className="block border-r border-linea px-4 py-3">
                    <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{tx('Llegada', 'Check-in')}</span>
                    <input type="date" min={minLlegada} value={llegada} onChange={(e) => setLlegada(e.target.value)} className="mt-1 w-full bg-transparent text-[13px] outline-none" />
                  </label>
                  <label className="block px-4 py-3">
                    <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{tx('Salida', 'Check-out')}</span>
                    <input type="date" min={llegada || minLlegada} value={salida} onChange={(e) => setSalida(e.target.value)} className="mt-1 w-full bg-transparent text-[13px] outline-none" />
                  </label>
                </div>
                <Link to={`/solicitar?${q}`} className="btn mt-5 w-full">
                  {tx('Cotizar con mi valoración', 'Add to my consultation quote')}
                </Link>
                <p className="mt-3 text-center text-xs text-piedra">
                  {tx('No pagas nada ahora. Lo cotizamos junto con tu valoración.', "You won't be charged now. We'll quote it together with your consultation.")}
                </p>
                {total > 0 && (
                  <dl className="mt-6 space-y-3 text-[14px]">
                    <div className="flex justify-between gap-4">
                      <dt className="text-piedra">
                        {dinero(a.precio_noche_desde!)} × {tx(`${noches} ${noches === 1 ? 'noche' : 'noches'}`, `${noches} ${noches === 1 ? 'night' : 'nights'}`)}
                      </dt>
                      <dd>{dinero(total)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-linea pt-4 font-medium">
                      <dt>{tx('Total desde', 'Total from')}</dt>
                      <dd>{dinero(total)}</dd>
                    </div>
                  </dl>
                )}
                <NotaMoneda className="mt-4" />
              </div>
            </Revelar>
          </aside>
        </div>
      </div>
    </div>
  )
}
