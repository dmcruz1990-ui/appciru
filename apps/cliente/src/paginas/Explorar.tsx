import { detallarOfertas, type Categoria } from '@plastinex/shared'
import { LayoutGrid, List, Map as IconoMapa, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import Buscador, { iconoCategoria } from '../componentes/Buscador'
import Mapa, { type Limites } from '../componentes/Mapa'
import OfertaCard from '../componentes/OfertaCard'
import { coincide, textosOferta } from '../busqueda'
import { useIdioma } from '../idioma'
import { SITIO, useSeo } from '../seo'

/** Tarjetas por tanda: con cientos de opciones en el mundo, la lista crece al pedir más. */
const TANDA = 24

export default function Explorar() {
  const { datos } = useCatalogo()
  const { tx, dinero, corto, loc, locale, categoria: nombreCategoria, ciudadDe, pais: nombrePais } = useIdioma()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  // Rutas limpias para buscadores: /cirugia/<procedimiento>/<ciudad>.
  const ruta = useParams<{ proc?: string; ciudad?: string }>()
  const [resaltada, setResaltada] = useState<string | null>(null)
  const [seleccionada, setSeleccionada] = useState<string | null>(null)
  const [alMover, setAlMover] = useState(false)
  const [limites, setLimites] = useState<Limites | null>(null)

  const procedimiento = params.get('procedimiento') ?? ruta.proc ?? ''
  const texto = params.get('q') ?? ''
  const ciudad = params.get('ciudad') ?? ruta.ciudad ?? ''
  const pais = params.get('pais') ?? ''
  const categoria = (params.get('categoria') ?? '') as Categoria | ''
  const presupuesto = Number(params.get('presupuesto')) || 0
  const verificadas = params.get('verificadas') === '1'
  const orden = params.get('orden') ?? 'relevancia'
  const vista = params.get('vista') === 'mapa' ? 'mapa' : 'lista'

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    // Desde una ruta limpia, los filtros de la ruta pasan a la URL de búsqueda.
    if (ruta.proc && !p.has('procedimiento')) p.set('procedimiento', ruta.proc)
    if (ruta.ciudad && !p.has('ciudad')) p.set('ciudad', ruta.ciudad)
    if (v) p.set(k, v)
    else p.delete(k)
    if (k === 'categoria') p.delete('procedimiento')
    if (ruta.proc) navigate(`/explorar?${p}`, { replace: true })
    else setParams(p, { replace: true })
  }

  // Lo que viaja de la búsqueda a las fichas (fechas y presupuesto).
  const consulta = useMemo(() => {
    const q = new URLSearchParams()
    for (const k of ['llegada', 'salida', 'presupuesto']) if (params.get(k)) q.set(k, params.get(k)!)
    return q.toString()
  }, [params])

  const filtradas = useMemo(() => {
    if (!datos) return []
    const l = detallarOfertas(datos).filter((d) => {
      if (procedimiento && d.procedimiento.id !== procedimiento) return false
      if (texto && !coincide(texto, ...textosOferta(d, nombrePais))) return false
      if (categoria && d.procedimiento.categoria !== categoria) return false
      if (ciudad && d.ciudad.id !== ciudad) return false
      if (pais && d.ciudad.pais !== pais) return false
      if (presupuesto && (d.oferta.precio_min == null || d.oferta.precio_min > presupuesto)) return false
      if (verificadas && d.institucion.verificacion !== 'verificado') return false
      return true
    })
    return l.sort((a, b) => {
      if (orden === 'precio') return (a.oferta.precio_min ?? Infinity) - (b.oferta.precio_min ?? Infinity)
      if (orden === 'nombre') return loc(a.procedimiento, 'nombre').localeCompare(loc(b.procedimiento, 'nombre'), locale)
      return Number(b.institucion.verificacion === 'verificado') - Number(a.institucion.verificacion === 'verificado')
    })
  }, [datos, procedimiento, texto, categoria, ciudad, pais, presupuesto, verificadas, orden, loc, locale, nombrePais])

  // Un marcador por institución con el precio desde más bajo de sus opciones.
  const puntos = useMemo(() => {
    const porInst = new Map<string, { id: string; lat: number; lng: number; desde: number | null; n: number }>()
    for (const d of filtradas) {
      const i = d.institucion
      if (i.lat == null || i.lng == null) continue
      const x = porInst.get(i.id) ?? { id: i.id, lat: i.lat, lng: i.lng, desde: null, n: 0 }
      x.n++
      if (d.oferta.precio_min != null) x.desde = x.desde == null ? d.oferta.precio_min : Math.min(x.desde, d.oferta.precio_min)
      porInst.set(i.id, x)
    }
    return [...porInst.values()].map((x) => ({ ...x, etiqueta: corto(x.desde) }))
  }, [filtradas, corto])

  // Comparador al estilo de los buscadores de viaje: el mismo procedimiento, el precio desde en cada país.
  const comparador = useMemo(() => {
    if (!datos || !procedimiento || pais || ciudad) return []
    const porPais = new Map<string, { pais: string; desde: number; n: number }>()
    for (const d of detallarOfertas(datos)) {
      if (d.procedimiento.id !== procedimiento || d.oferta.precio_min == null) continue
      const x = porPais.get(d.ciudad.pais) ?? { pais: d.ciudad.pais, desde: Infinity, n: 0 }
      x.desde = Math.min(x.desde, d.oferta.precio_min)
      x.n++
      porPais.set(d.ciudad.pais, x)
    }
    return [...porPais.values()].sort((a, b) => a.desde - b.desde)
  }, [datos, procedimiento, pais, ciudad])

  const [cuantas, setCuantas] = useState(TANDA)
  useEffect(() => setCuantas(TANDA), [params])

  // Título y SEO de la búsqueda: «Rinoplastia en Medellín, Colombia».
  const procSel = datos?.procedimientos.find((p) => p.id === procedimiento)
  const ciudadSel = datos?.ciudades.find((c) => c.id === ciudad)
  const lugar = ciudadSel ? `${loc(ciudadSel, 'nombre')}, ${nombrePais(ciudadSel.pais)}` : pais ? nombrePais(pais) : ''
  const que = procSel ? loc(procSel, 'nombre') : categoria ? nombreCategoria(categoria) : tx('Cirugía plástica', 'Plastic surgery')
  const titulo = lugar ? tx(`${que} en ${lugar}`, `${que} in ${lugar}`) : tx(`${que} en el mundo`, `${que} worldwide`)
  const instituciones = [...new Map(filtradas.map((d) => [d.institucion.id, d.institucion])).values()]
  useSeo({
    titulo,
    descripcion: tx(
      `${filtradas.length} opciones de ${que.toLowerCase()}${lugar ? ` en ${lugar}` : ' en 35 países'}: compara cirujanos plásticos, clínicas y precios orientativos, y solicita tu valoración.`,
      `${filtradas.length} ${que.toLowerCase()} options${lugar ? ` in ${lugar}` : ' in 35 countries'}: compare plastic surgeons, clinics and indicative prices, and request your consultation.`,
    ),
    // Se indexan las rutas limpias con al menos una clínica real (no solo perfiles de demostración);
    // las búsquedas con filtros en la URL (?presupuesto=…) no.
    indexar: !params.toString() && instituciones.some((i) => !i.es_demo),
    jsonld: instituciones.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: titulo,
          itemListElement: instituciones.slice(0, 20).map((i, k) => ({ '@type': 'ListItem', position: k + 1, url: `${SITIO}/institucion/${i.id}`, name: i.nombre })),
        }
      : null,
  })

  if (!datos) return null

  const dentroDelMapa = (instId: string) => {
    if (!alMover || !limites) return true
    const i = datos.instituciones.find((x) => x.id === instId)
    if (i?.lat == null || i.lng == null) return false
    return i.lat <= limites.norte && i.lat >= limites.sur && i.lng <= limites.este && i.lng >= limites.oeste
  }
  const lista = filtradas.filter((d) => dentroDelMapa(d.institucion.id))
  const sel = seleccionada ? puntos.find((p) => p.id === seleccionada) : null
  const selInst = sel ? datos.instituciones.find((i) => i.id === sel.id) : null
  const activos = [procedimiento, texto, ciudad, pais, categoria, presupuesto ? '1' : '', verificadas ? '1' : ''].filter(Boolean).length

  return (
    <div className="pt-16 md:pt-[124px]">
      <div className="border-b border-linea">
        <div className="contenedor pt-8 pb-4">
          <Buscador />
          {/* Categorías con ícono, como la barra de un marketplace. */}
          <div className="mt-6 flex gap-8 overflow-x-auto text-[11px] font-medium tracking-[0.18em] whitespace-nowrap uppercase">
            <Categoria activa={!categoria} onClick={() => set('categoria', '')} icono={<LayoutGrid size={20} strokeWidth={1.4} />} texto={tx('Todo', 'All')} />
            {(Object.keys(iconoCategoria) as Categoria[]).map((c) => {
              const I = iconoCategoria[c]
              return <Categoria key={c} activa={categoria === c} onClick={() => set('categoria', c)} icono={<I size={20} strokeWidth={1.4} />} texto={nombreCategoria(c)} />
            })}
            <span className="mx-2 w-px shrink-0 bg-linea" />
            {datos.procedimientos
              .filter((p) => !categoria || p.categoria === categoria)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => set('procedimiento', procedimiento === p.id ? '' : p.id)}
                  className={`-mb-px shrink-0 border-b-2 pt-6 pb-3 transition ${procedimiento === p.id ? 'border-espresso text-espresso' : 'border-transparent text-piedra hover:text-espresso'}`}
                >
                  {loc(p, 'nombre')}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(400px,40%)]">
        {/* Lista */}
        <div className={`contenedor !max-w-none py-8 lg:!px-10 ${vista === 'mapa' ? 'hidden lg:block' : ''}`}>
          <h1 className="display mb-6 text-2xl md:text-3xl">{titulo}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="font-medium">
              {tx(
                `${lista.length} ${lista.length === 1 ? 'opción' : 'opciones'}${presupuesto ? ` hasta ${dinero(presupuesto)}` : ''}`,
                `${lista.length} ${lista.length === 1 ? 'option' : 'options'}${presupuesto ? ` up to ${dinero(presupuesto)}` : ''}`,
              )}
            </span>
            <label className="flex cursor-pointer items-center gap-2 text-piedra">
              <input type="checkbox" checked={verificadas} onChange={(e) => set('verificadas', e.target.checked ? '1' : '')} className="accent-espresso" />
              {tx('Solo verificadas', 'Verified only')}
            </label>
            {activos > 0 && (
              <button onClick={() => navigate('/explorar', { replace: true })} className="enlace text-piedra">
                {tx('Limpiar filtros', 'Clear filters')}
              </button>
            )}
            <select value={orden} onChange={(e) => set('orden', e.target.value)} className="ml-auto cursor-pointer border-b border-linea bg-transparent py-1 outline-none" aria-label={tx('Ordenar', 'Sort')}>
              <option value="relevancia">{tx('Relevancia', 'Relevance')}</option>
              <option value="precio">{tx('Precio menor', 'Lowest price')}</option>
              <option value="nombre">{tx('Nombre', 'Name')}</option>
            </select>
          </div>

          {texto && (
            <button onClick={() => set('q', '')} className="mt-5 inline-flex items-center gap-2 border border-espresso px-3.5 py-1.5 text-xs">
              {tx(`Búsqueda: «${texto}»`, `Search: “${texto}”`)} <X size={13} strokeWidth={1.8} aria-label={tx('Quitar', 'Remove')} />
            </button>
          )}

          {comparador.length > 1 && (
            <section className="mt-8 border-y border-linea py-6">
              <div className="rotulo !text-[10px]">
                {tx(`Compara ${loc(datos.procedimientos.find((x) => x.id === procedimiento)!, 'nombre')} por país`, `Compare ${loc(datos.procedimientos.find((x) => x.id === procedimiento)!, 'nombre')} by country`)}
              </div>
              <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {comparador.map((x, k) => (
                  <li key={x.pais} className="shrink-0">
                    <button onClick={() => set('pais', x.pais)} className="block min-w-[150px] border border-linea px-4 py-3 text-left transition hover:border-espresso">
                      <span className="block text-[11px] font-medium tracking-[0.16em] uppercase">{nombrePais(x.pais)}</span>
                      <span className="mt-1 block text-[15px]">{tx('desde', 'from')} {dinero(x.desde)}</span>
                      <span className="mt-0.5 block text-xs text-piedra">
                        {k === 0 ? tx('El más bajo', 'Lowest') : tx(`${x.n} ${x.n === 1 ? 'opción' : 'opciones'}`, `${x.n} ${x.n === 1 ? 'option' : 'options'}`)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-niebla">{tx('Rangos orientativos informados por cada clínica; el valor final se fija tras la valoración.', 'Indicative ranges reported by each clinic; the final price is set after the consultation.')}</p>
            </section>
          )}

          {lista.length ? (
            <>
              <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3">
                {lista.slice(0, cuantas).map((d) => (
                  <OfertaCard key={d.oferta.id} d={d} consulta={consulta} onResaltar={setResaltada} />
                ))}
              </div>
              {lista.length > cuantas && (
                <div className="mt-14 text-center">
                  <p className="text-xs text-piedra">{tx(`Viendo ${cuantas} de ${lista.length}`, `Showing ${cuantas} of ${lista.length}`)}</p>
                  <button onClick={() => setCuantas((n) => n + TANDA)} className="btn-linea mt-4">
                    {tx('Mostrar más', 'Show more')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-12 border-y border-linea py-20 text-center">
              <p className="display normal-case text-3xl">{tx('No hay opciones con esos filtros.', 'No options match these filters.')}</p>
              <p className="mt-3 text-sm text-piedra">
                {alMover
                  ? tx('Mueve el mapa o desactiva «Buscar al mover el mapa».', 'Move the map or turn off “Search as I move the map.”')
                  : tx(
                      'Aún no hay clínicas publicadas aquí. Prueba otro destino o pide orientación: un coordinador te ayuda a encontrar opciones.',
                      'No clinics are listed here yet. Try another destination or ask for guidance: a coordinator will help you find options.',
                    )}
              </p>
              <Link to={`/solicitar${procedimiento ? `?procedimiento=${procedimiento}` : ''}`} className="btn mt-8">
                {tx('Solicitar orientación', 'Request guidance')}
              </Link>
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className={`${vista === 'mapa' ? 'block' : 'hidden'} lg:block`}>
          <div className="relative h-[calc(100svh-64px)] lg:sticky lg:top-20 lg:h-[calc(100svh-80px)]">
            <Mapa
              puntos={puntos}
              activo={resaltada}
              seleccionado={seleccionada}
              onSeleccion={setSeleccionada}
              onMover={setLimites}
              className="h-full"
              tarjeta={
                sel &&
                selInst && (
                  <Link
                    to={`/institucion/${selInst.id}${consulta ? `?${consulta}` : ''}`}
                    className="pointer-events-auto flex w-full max-w-sm items-center gap-4 border border-linea bg-marfil p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="rotulo !text-[10px]">{ciudadDe(selInst.ciudad_id)}</div>
                      <div className="mt-1 truncate text-[14px] font-medium tracking-[0.1em] uppercase">{selInst.nombre}</div>
                      <div className="mt-1 text-[13px] text-piedra">
                        {tx(
                          `${sel.n} ${sel.n === 1 ? 'opción' : 'opciones'} · ${sel.desde ? `desde ${dinero(sel.desde)}` : 'precio por valorar'}`,
                          `${sel.n} ${sel.n === 1 ? 'option' : 'options'} · ${sel.desde ? `from ${dinero(sel.desde)}` : 'price after consultation'}`,
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium tracking-[0.2em] uppercase underline underline-offset-[6px]">{tx('Ver', 'View')}</span>
                  </Link>
                )
              }
            />
            <label className="absolute top-4 left-4 z-[500] flex cursor-pointer items-center gap-2 border border-linea bg-marfil px-4 py-2.5 text-[13px] shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
              <input type="checkbox" checked={alMover} onChange={(e) => setAlMover(e.target.checked)} className="accent-espresso" />
              {tx('Buscar al mover el mapa', 'Search as I move the map')}
            </label>
          </div>
        </div>
      </div>

      {/* Alternar lista / mapa en celular y tableta. */}
      <button
        onClick={() => set('vista', vista === 'mapa' ? '' : 'mapa')}
        className="fixed bottom-6 left-1/2 z-[600] flex -translate-x-1/2 items-center gap-2 bg-espresso px-6 py-3.5 text-[11px] font-medium tracking-[0.2em] text-marfil uppercase shadow-[0_10px_30px_rgba(0,0,0,0.3)] lg:hidden"
      >
        {vista === 'mapa' ? (
          <>
            <List size={15} strokeWidth={1.6} /> {tx('Mostrar lista', 'Show list')}
          </>
        ) : (
          <>
            <IconoMapa size={15} strokeWidth={1.6} /> {tx('Mostrar mapa', 'Show map')}
          </>
        )}
      </button>
    </div>
  )
}

function Categoria({ activa, onClick, icono, texto }: { activa: boolean; onClick: () => void; icono: React.ReactNode; texto: string }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex shrink-0 flex-col items-center gap-2 border-b-2 pt-1 pb-3 transition ${activa ? 'border-espresso text-espresso' : 'border-transparent text-piedra hover:border-linea hover:text-espresso'}`}
    >
      {icono}
      {texto}
    </button>
  )
}
