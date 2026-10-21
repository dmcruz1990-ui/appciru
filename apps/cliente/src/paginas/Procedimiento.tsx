import { destinos, detallarOfertas, guiaPrecios } from '@plastinex/shared'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto, Revelar, Rotulo } from '../componentes/base'
import NoEncontrado from '../componentes/NoEncontrado'
import OfertaCard from '../componentes/OfertaCard'
import { NotaMoneda, useIdioma } from '../idioma'
import { rutaCirugia, SITIO, useSeo } from '../seo'

export default function ProcedimientoPagina() {
  const { id } = useParams()
  const { datos } = useCatalogo()
  const { tx, dinero, loc, categoria, pais, ciudad: nombreCiudad } = useIdioma()
  const proc = datos?.procedimientos.find((p) => p.id === id)
  const todas = datos && proc ? detallarOfertas(datos).filter((d) => d.procedimiento.id === proc.id) : []
  const precios = todas.map((d) => d.oferta.precio_min).filter((x): x is number => x != null)
  const paises = new Set(todas.map((d) => d.ciudad.pais)).size
  const ciudades = new Set(todas.map((d) => d.ciudad.id)).size
  useSeo({
    titulo: proc ? tx(`${proc.nombre}: precios, cirujanos y clínicas`, `${loc(proc, 'nombre')}: prices, surgeons and clinics`) : undefined,
    descripcion: proc
      ? tx(
          `Compara ${proc.nombre.toLowerCase()} en ${ciudades} ciudades de ${paises} países: cirujanos plásticos, clínicas y precios orientativos. Solicita tu valoración.`,
          `Compare ${loc(proc, 'nombre').toLowerCase()} in ${ciudades} cities across ${paises} countries: plastic surgeons, clinics and indicative prices. Request your consultation.`,
        )
      : undefined,
    jsonld: proc && {
      '@context': 'https://schema.org',
      '@type': 'MedicalProcedure',
      name: loc(proc, 'nombre'),
      description: loc(proc, 'descripcion'),
      procedureType: 'https://schema.org/SurgicalProcedure',
      url: SITIO + `/procedimiento/${proc.id}`,
      ...(precios.length && {
        offers: { '@type': 'AggregateOffer', priceCurrency: 'COP', lowPrice: Math.min(...precios), highPrice: Math.max(...precios), offerCount: todas.length },
      }),
    },
  })
  if (!datos || !proc) return <NoEncontrado texto={tx('Este procedimiento no está disponible.', 'This procedure is not available.')} />

  // Las mejores primero: verificadas y con precio; el resto, en la búsqueda.
  const opciones = [...todas]
    .sort((a, b) => Number(b.institucion.verificacion === 'verificado') - Number(a.institucion.verificacion === 'verificado') || Number(b.oferta.precio_min != null) - Number(a.oferta.precio_min != null))
    .slice(0, 12)
  // Dónde se ofrece, por país: enlaces indexables a /cirugia/<procedimiento>/<ciudad>.
  const donde = destinos(datos)
    .map((d) => ({
      pais: d.pais,
      ciudades: d.ciudades
        .map(({ ciudad }) => {
          const aqui = todas.filter((o) => o.ciudad.id === ciudad.id)
          const p = aqui.map((o) => o.oferta.precio_min).filter((x): x is number => x != null)
          return { ciudad, n: aqui.length, desde: p.length ? Math.min(...p) : null }
        })
        .filter((c) => c.n > 0),
    }))
    .filter((d) => d.ciudades.length > 0)
  const guia = guiaPrecios(datos, proc.id)
  const nombre = loc(proc, 'nombre')
  const datosClave = [
    [tx('Duración aproximada', 'Approximate duration'), loc(proc, 'duracion_aprox')],
    [tx('Anestesia habitual', 'Usual anesthesia'), loc(proc, 'anestesia')],
    [tx('Recuperación orientativa', 'Typical recovery'), loc(proc, 'recuperacion')],
    [
      tx('Estadía sugerida si viajas', 'Suggested stay if you travel'),
      proc.estadia_sugerida_dias
        ? tx(`${proc.estadia_sugerida_dias} días`, `${proc.estadia_sugerida_dias} ${proc.estadia_sugerida_dias === 1 ? 'day' : 'days'}`)
        : null,
    ],
  ].filter((x): x is [string, string] => !!x[1])

  return (
    <>
      <section className="contenedor grid gap-12 pt-48 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="flex flex-col">
          <Link to="/explorar" className="rotulo hover:text-espresso">
            ← {categoria(proc.categoria)}
          </Link>
          <h1 className="display mt-8 text-4xl md:text-5xl">{nombre}</h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-piedra">{loc(proc, 'descripcion')}</p>
          <dl className="mt-auto grid grid-cols-2 border-t border-linea pt-2">
            {datosClave.map(([t, v]) => (
              <div key={t} className="border-b border-linea py-5 pr-4">
                <dt className="etiqueta">{t}</dt>
                <dd className="mt-2 font-serif text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-niebla">
            {tx(
              'Información general y orientativa. Cada caso se evalúa de forma individual; no se garantizan resultados.',
              'General, indicative information. Every case is assessed individually; results are not guaranteed.',
            )}
          </p>
        </div>
        <Revelar>
          <Foto src={proc.imagen_url} alt={nombre} ancho={1200} prioridad className="aspect-[4/5]" respaldo={nombre} />
        </Revelar>
      </section>

      {guia && (
        <section className="bg-papel py-24">
          <div className="contenedor grid gap-14 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Rotulo>{tx('Guía de precios', 'Price guide')}</Rotulo>
              <h2 className="display mt-5 text-4xl">
                {tx(
                  <>
                    Precio de <em>{nombre.toLowerCase()}</em>
                  </>,
                  <>
                    Cost of <em>{nombre.toLowerCase()}</em>
                  </>,
                )}
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-piedra">
                {tx(
                  `Promedio calculado a partir de los rangos que publican ${guia.opciones} ${guia.opciones === 1 ? 'prestador' : 'prestadores'} de la red. El valor final depende de tu valoración, la técnica, la anestesia y la hospitalización.`,
                  `Average based on the ranges published by ${guia.opciones} ${guia.opciones === 1 ? 'provider' : 'providers'} in our network. The final price depends on your consultation, the technique, anesthesia and hospital stay.`,
                )}
              </p>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-espresso pt-6">
                <Cifra t={tx('Promedio', 'Average')} v={dinero(guia.promedio)} />
                <Cifra t={tx('Desde', 'From')} v={dinero(guia.minimo)} />
                <Cifra t={tx('Hasta', 'Up to')} v={dinero(guia.maximo)} />
              </div>
              <NotaMoneda className="mt-4" />
              <Link to={`/planear?procedimiento=${proc.id}`} className="btn mt-10">
                {tx('Planear con mi presupuesto', 'Plan with my budget')}
              </Link>
            </div>
            <div>
              <div className="etiqueta">{tx('Por ciudad', 'By city')}</div>
              <table className="mt-4 w-full text-sm">
                <tbody className="divide-y divide-linea border-y border-linea">
                  {guia.porCiudad.slice(0, 10).map((c) => (
                    <tr key={c.ciudad}>
                      <td className="py-4 font-serif text-2xl">{c.ciudad}</td>
                      <td className="py-4 text-piedra">
                        {dinero(c.minimo)} – {dinero(c.maximo)}
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs text-piedra">{tx('promedio', 'average')}</span>
                        <div>{dinero(c.promedio)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="contenedor border-t border-linea py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Rotulo>
              {tx(
                `${todas.length} ${todas.length === 1 ? 'opción' : 'opciones'} en la red`,
                `${todas.length} ${todas.length === 1 ? 'option' : 'options'} in our network`,
              )}
            </Rotulo>
            <h2 className="display mt-5 text-4xl">
              {tx(
                <>
                  ¿Con quién <em>valorarte?</em>
                </>,
                <>
                  Who should <em>assess you?</em>
                </>,
              )}
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to={rutaCirugia(proc.id)} className="btn">
              {tx(`Ver las ${todas.length} opciones en el mapa`, `See all ${todas.length} options on the map`)}
            </Link>
            <Link to={`/solicitar?procedimiento=${proc.id}`} className="btn-linea">
              {tx('Pedir orientación general', 'Ask for general guidance')}
            </Link>
          </div>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map((d, i) => (
            <Revelar key={d.oferta.id} retraso={(i % 3) * 0.06}>
              <OfertaCard d={d} />
            </Revelar>
          ))}
        </div>
      </section>

      {donde.length > 0 && (
        <section className="bg-papel py-24">
          <div className="contenedor">
            <Rotulo>{tx(`${ciudades} ciudades · ${paises} países`, `${ciudades} cities · ${paises} countries`)}</Rotulo>
            <h2 className="display mt-5 text-4xl">
              {tx(
                <>
                  Dónde hacerte <em>{nombre.toLowerCase()}</em>
                </>,
                <>
                  Where to get <em>{nombre.toLowerCase()}</em>
                </>,
              )}
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {donde.map((d) => (
                <div key={d.pais}>
                  <div className="border-b border-espresso pb-2 text-[11px] font-medium tracking-[0.2em] uppercase">{pais(d.pais)}</div>
                  <ul className="mt-2">
                    {d.ciudades.map(({ ciudad, desde }) => (
                      <li key={ciudad.id}>
                        <Link to={rutaCirugia(proc.id, ciudad.id)} className="flex items-baseline justify-between gap-3 py-1.5 text-sm hover:underline">
                          <span>{tx(`${nombre} en ${nombreCiudad(ciudad)}`, `${nombre} in ${nombreCiudad(ciudad)}`)}</span>
                          {desde != null && <span className="shrink-0 text-xs text-piedra">{dinero(desde)}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function Cifra({ t, v }: { t: string; v: string }) {
  return (
    <div>
      <div className="etiqueta">{t}</div>
      <div className="mt-2 font-serif text-lg md:text-2xl">{v}</div>
    </div>
  )
}
