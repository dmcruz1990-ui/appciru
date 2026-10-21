import { detallarOfertas, iniciales } from '@plastinex/shared'
import { CalendarDays, Check, Share2, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Revelar, Rotulo } from '../componentes/base'
import { nochesEntre } from '../componentes/Buscador'
import Carrusel from '../componentes/Carrusel'
import { BotonFavorito, useFavoritos } from '../componentes/favoritos'
import Galeria from '../componentes/Galeria'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'
import Mapa from '../componentes/Mapa'
import NoEncontrado from '../componentes/NoEncontrado'
import { NotaMoneda, useIdioma } from '../idioma'
import { SITIO, useSeo } from '../seo'

export default function InstitucionPagina() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { datos } = useCatalogo()
  const inst = datos?.instituciones.find((i) => i.id === id)
  const opciones = useMemo(() => (datos && inst ? detallarOfertas(datos).filter((d) => d.institucion.id === inst.id) : []), [datos, inst])
  const [ofertaId, setOfertaId] = useState(params.get('oferta') ?? '')
  const [llegada, setLlegada] = useState(params.get('llegada') ?? '')
  const [salida, setSalida] = useState(params.get('salida') ?? '')
  const [alojamientoId, setAlojamientoId] = useState('')
  const [copiado, setCopiado] = useState(false)
  const { es, alternar } = useFavoritos()
  const { tx, dinero, precio, loc, locLista, tipoInstitucion, tipoAlojamiento, ciudadDe } = useIdioma()
  const ciudadInst = datos?.ciudades.find((c) => c.id === inst?.ciudad_id)
  const procsInst = [...new Set(opciones.map((d) => loc(d.procedimiento, 'nombre')))]
  useSeo({
    titulo: inst ? `${inst.nombre} · ${ciudadDe(inst.ciudad_id)}` : undefined,
    descripcion: inst
      ? tx(
          `${inst.nombre}, ${tipoInstitucion(inst.tipo).toLowerCase()} de cirugía plástica en ${ciudadDe(inst.ciudad_id)}. ${procsInst.slice(0, 5).join(', ')}. Precios orientativos y solicitud de valoración.`,
          `${inst.nombre}, plastic surgery ${tipoInstitucion(inst.tipo).toLowerCase()} in ${ciudadDe(inst.ciudad_id)}. ${procsInst.slice(0, 5).join(', ')}. Indicative prices and consultation requests.`,
        )
      : undefined,
    // Los perfiles de demostración no se indexan en buscadores.
    indexar: !inst?.es_demo,
    jsonld: inst && {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      name: inst.nombre,
      url: `${SITIO}/institucion/${inst.id}`,
      medicalSpecialty: 'PlasticSurgery',
      ...(inst.imagen_url && { image: inst.imagen_url }),
      ...(inst.telefono_publico && { telephone: inst.telefono_publico }),
      address: { '@type': 'PostalAddress', addressLocality: ciudadInst?.nombre, addressRegion: ciudadInst?.departamento, addressCountry: ciudadInst?.pais, ...(inst.direccion && { streetAddress: inst.direccion }) },
      ...(inst.lat != null && inst.lng != null && { geo: { '@type': 'GeoCoordinates', latitude: inst.lat, longitude: inst.lng } }),
      availableService: procsInst.map((n) => ({ '@type': 'MedicalProcedure', name: n })),
    },
  })

  if (!datos || !inst) return <NoEncontrado texto={tx('Esta institución no está disponible.', 'This clinic is not available.')} />

  const profIds = datos.vinculos.filter((v) => v.institucion_id === inst.id).map((v) => v.profesional_id)
  const profesionales = datos.profesionales.filter((p) => profIds.includes(p.id) && p.publicado)
  const alojamientos = datos.alojamientos.filter((a) => a.ciudad_id === inst.ciudad_id && a.publicado)
  const fotos = [inst.imagen_url, ...(inst.galeria ?? [])].filter((x): x is string => !!x)
  const ciudad = ciudadDe(inst.ciudad_id)
  const servicios = locLista(inst, 'servicios')

  const elegida = opciones.find((d) => d.oferta.id === ofertaId) ?? opciones[0]
  const aloj = alojamientos.find((a) => a.id === alojamientoId)
  const nochesFechas = nochesEntre(llegada, salida)
  const noches = nochesFechas || elegida?.procedimiento.estadia_sugerida_dias || 0
  const costoAloj = aloj?.precio_noche_desde && noches ? aloj.precio_noche_desde * noches : 0
  const valoracion = inst.valoracion_precio ?? 0
  const min = (elegida?.oferta.precio_min ?? 0) + costoAloj + valoracion
  const max = (elegida?.oferta.precio_max ?? elegida?.oferta.precio_min ?? 0) + costoAloj + valoracion
  const minLlegada = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const solicitar = new URLSearchParams()
  if (elegida) solicitar.set('oferta', elegida.oferta.id)
  if (aloj) {
    solicitar.set('alojamiento', aloj.id)
    solicitar.set('noches', String(noches))
  }
  if (llegada) solicitar.set('fecha', llegada)
  if (params.get('presupuesto')) solicitar.set('presupuesto', params.get('presupuesto')!)

  const compartir = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: inst.nombre, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      }
    } catch {
      // La persona canceló el diálogo de compartir.
    }
  }

  return (
    <div className="pt-16 md:pt-[124px]">
      <div className="contenedor pt-10">
        {/* Encabezado */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rotulo">
                {tipoInstitucion(inst.tipo)} · {ciudad}
              </span>
              {inst.es_demo && <EtiquetaDemo />}
            </div>
            <h1 className="display mt-4 text-3xl md:text-5xl">{inst.nombre}</h1>
            <div className="mt-3">
              <EstadoVerificacion v={inst.verificacion} />
            </div>
          </div>
          <div className="flex gap-2 text-[11px] font-medium tracking-[0.2em] uppercase">
            <button onClick={compartir} className="flex items-center gap-2 px-3 py-2 underline-offset-[6px] hover:underline">
              <Share2 size={15} strokeWidth={1.6} /> {copiado ? tx('Enlace copiado', 'Link copied') : tx('Compartir', 'Share')}
            </button>
            <button onClick={() => alternar(`institucion:${inst.id}`)} className="flex items-center gap-2 px-3 py-2 underline-offset-[6px] hover:underline" aria-pressed={es(`institucion:${inst.id}`)}>
              <span className={`inline-block h-2 w-2 ${es(`institucion:${inst.id}`) ? 'bg-espresso' : 'border border-espresso'}`} />
              {es(`institucion:${inst.id}`) ? tx('Guardada', 'Saved') : tx('Guardar', 'Save')}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <Galeria fotos={fotos} titulo={inst.nombre} semilla={inst.nombre} />
        </div>

        <div className="grid gap-16 py-14 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Columna de contenido */}
          <div className="min-w-0">
            <p className="display normal-case text-2xl leading-snug md:text-3xl">{loc(inst, 'descripcion')}</p>

            <div className="mt-10 grid gap-6 border-y border-linea py-8 sm:grid-cols-3">
              <Dato icono={<ShieldCheck size={22} strokeWidth={1.3} />} t={tx('Habilitación sanitaria', 'Health license')} v={inst.codigo_reps ?? tx('No informado', 'Not provided')} />
              <Dato
                icono={<CalendarDays size={22} strokeWidth={1.3} />}
                t={tx('Primera valoración', 'First consultation')}
                v={inst.valoracion_precio == null ? tx('Consultar', 'Ask the clinic') : inst.valoracion_precio === 0 ? tx('Sin costo', 'Free') : dinero(inst.valoracion_precio)}
              />
              <Dato icono={<Check size={22} strokeWidth={1.3} />} t={tx('Financiación', 'Financing')} v={inst.financiacion ? tx('Disponible', 'Available') : tx('No informada', 'Not provided')} />
            </div>

            {servicios.length > 0 && (
              <section className="mt-14">
                <Rotulo>{tx('Lo que ofrece', 'What this place offers')}</Rotulo>
                <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {servicios.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-[15px]">
                      <Check size={16} strokeWidth={1.6} className="shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-14">
              <Rotulo>{tx('Procedimientos y precios', 'Procedures and prices')}</Rotulo>
              <ul className="mt-6 divide-y divide-linea border-y border-linea">
                {opciones.map((d) => (
                  <li key={d.oferta.id}>
                    <button
                      onClick={() => setOfertaId(d.oferta.id)}
                      className={`flex w-full items-center justify-between gap-4 px-3 py-5 text-left transition ${elegida?.oferta.id === d.oferta.id ? 'bg-arena' : 'hover:bg-papel'}`}
                    >
                      <span>
                        <span className="block text-[14px] font-medium tracking-[0.1em] uppercase">{loc(d.procedimiento, 'nombre')}</span>
                        <span className="mt-1 block text-[13px] text-piedra">{d.profesional?.nombre ?? tx('Especialista por asignar', 'Surgeon to be assigned')}</span>
                      </span>
                      <span className="shrink-0 text-right text-[14px]">{precio(d.oferta.precio_min, d.oferta.precio_max)}</span>
                    </button>
                  </li>
                ))}
                {opciones.length === 0 && <li className="py-5 text-sm text-piedra">{tx('Sin procedimientos publicados.', 'No published procedures.')}</li>}
              </ul>
            </section>

            <section className="mt-14">
              <Rotulo>{tx('Especialistas', 'Surgeons')}</Rotulo>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {profesionales.map((p) => (
                  <Link key={p.id} to={`/profesional/${p.id}`} className="flex items-center gap-4 border border-linea p-4 transition hover:border-espresso">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-espresso text-[13px] font-medium tracking-[0.15em] text-marfil">
                      {p.foto_url ? <img src={p.foto_url} alt="" className="h-full w-full object-cover" /> : iniciales(p.nombre)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium tracking-[0.08em] uppercase">{p.nombre}</span>
                      <span className="mt-1 block text-[13px] text-piedra">
                        {[p.sociedad, p.anios_experiencia && tx(`${p.anios_experiencia} años`, `${p.anios_experiencia} years`)].filter(Boolean).join(' · ') || loc(p, 'especialidad')}
                      </span>
                    </span>
                  </Link>
                ))}
                {profesionales.length === 0 && <p className="text-sm text-piedra">{tx('Sin especialistas publicados.', 'No published surgeons.')}</p>}
              </div>
            </section>

            {inst.lat != null && inst.lng != null && (
              <section className="mt-14">
                <Rotulo>{tx('Ubicación', 'Location')}</Rotulo>
                <p className="mt-4 text-[15px]">
                  {inst.direccion ?? ciudad} · {ciudad}
                </p>
                <Mapa puntos={[{ id: inst.id, lat: inst.lat, lng: inst.lng, etiqueta: inst.nombre }]} className="mt-6 h-[360px] border border-linea" zoomInicial={14} />
                {inst.es_demo && <p className="mt-3 text-xs text-piedra">{tx('Ubicación aproximada de un perfil de demostración.', 'Approximate location of a demo profile.')}</p>}
              </section>
            )}

            {alojamientos.length > 0 && (
              <section className="mt-14">
                <Rotulo>{tx(`Dónde recuperarte en ${ciudad}`, `Where to recover in ${ciudad}`)}</Rotulo>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {alojamientos.map((a) => (
                    <Link key={a.id} to={`/alojamiento/${a.id}`} className="group block">
                      <Carrusel fotos={a.galeria ?? []} alt={a.nombre} semilla={a.nombre} className="aspect-[4/3]">
                        <BotonFavorito clave={`alojamiento:${a.id}`} className="absolute top-3 right-3" />
                      </Carrusel>
                      <div className="mt-3 text-[13px] font-medium tracking-[0.1em] uppercase">{a.nombre}</div>
                      <div className="mt-1 text-[13px] text-piedra">
                        {tipoAlojamiento(a.tipo)} · {a.precio_noche_desde ? tx(`${dinero(a.precio_noche_desde)} noche`, `${dinero(a.precio_noche_desde)} night`) : tx('Precio por cotizar', 'Price on request')}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Tarjeta de reserva */}
          <aside>
            <Revelar className="lg:sticky lg:top-28">
              <div className="border border-linea p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="text-[22px] font-light">{elegida ? precio(elegida.oferta.precio_min, elegida.oferta.precio_max) : tx('Por valorar', 'Quoted after consultation')}</div>
                <div className="mt-1 text-xs text-piedra">{tx('Rango orientativo del procedimiento', 'Indicative range for the procedure')}</div>

                <div className="mt-6 border border-linea">
                  <label className="block border-b border-linea px-4 py-3">
                    <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{tx('Procedimiento', 'Procedure')}</span>
                    <select value={elegida?.oferta.id ?? ''} onChange={(e) => setOfertaId(e.target.value)} className="mt-1 w-full cursor-pointer bg-transparent text-[14px] outline-none">
                      {opciones.map((d) => (
                        <option key={d.oferta.id} value={d.oferta.id}>
                          {loc(d.procedimiento, 'nombre')}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2">
                    <label className="block border-r border-linea px-4 py-3">
                      <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{tx('Llegada', 'Check-in')}</span>
                      <input type="date" min={minLlegada} value={llegada} onChange={(e) => setLlegada(e.target.value)} className="mt-1 w-full bg-transparent text-[13px] outline-none" />
                    </label>
                    <label className="block px-4 py-3">
                      <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{tx('Salida', 'Check-out')}</span>
                      <input type="date" min={llegada || minLlegada} value={salida} onChange={(e) => setSalida(e.target.value)} className="mt-1 w-full bg-transparent text-[13px] outline-none" />
                    </label>
                  </div>
                  {alojamientos.length > 0 && (
                    <label className="block border-t border-linea px-4 py-3">
                      <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{tx('Alojamiento de recuperación', 'Recovery stay')}</span>
                      <select value={alojamientoId} onChange={(e) => setAlojamientoId(e.target.value)} className="mt-1 w-full cursor-pointer bg-transparent text-[14px] outline-none">
                        <option value="">{tx('Sin alojamiento', 'No stay')}</option>
                        {alojamientos.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nombre}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <Link to={`/solicitar?${solicitar}`} className="btn mt-5 w-full">
                  {tx('Solicitar valoración', 'Request consultation')}
                </Link>
                <p className="mt-3 text-center text-xs text-piedra">
                  {tx('No pagas nada ahora. La clínica confirma el valor después de valorarte.', "You won't be charged now. The clinic confirms the price after your consultation.")}
                </p>

                {elegida && (
                  <dl className="mt-6 space-y-3 text-[14px]">
                    <Linea t={loc(elegida.procedimiento, 'nombre')} v={precio(elegida.oferta.precio_min, elegida.oferta.precio_max)} />
                    {inst.valoracion_precio != null && <Linea t={tx('Primera valoración', 'First consultation')} v={inst.valoracion_precio === 0 ? tx('Sin costo', 'Free') : dinero(inst.valoracion_precio)} />}
                    {aloj && (
                      <Linea
                        t={tx(
                          `${aloj.nombre} · ${noches} ${noches === 1 ? 'noche' : 'noches'}${nochesFechas ? '' : ' sugeridas'}`,
                          `${aloj.nombre} · ${noches} ${noches === 1 ? 'night' : 'nights'}${nochesFechas ? '' : ' suggested'}`,
                        )}
                        v={costoAloj ? dinero(costoAloj) : tx('Por cotizar', 'On request')}
                      />
                    )}
                    {elegida.oferta.precio_min != null && (
                      <div className="flex items-baseline justify-between gap-4 border-t border-linea pt-4 font-medium">
                        <dt>{tx('Total estimado', 'Estimated total')}</dt>
                        <dd className="text-right">{min === max ? dinero(min) : `${dinero(min)} – ${dinero(max)}`}</dd>
                      </div>
                    )}
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

function Dato({ icono, t, v }: { icono: React.ReactNode; t: string; v: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5 shrink-0">{icono}</span>
      <div>
        <div className="etiqueta">{t}</div>
        <div className="mt-1 text-[15px]">{v}</div>
      </div>
    </div>
  )
}

function Linea({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-piedra">{t}</dt>
      <dd className="shrink-0 text-right">{v}</dd>
    </div>
  )
}
