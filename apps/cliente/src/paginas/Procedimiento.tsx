import { detallarOfertas, formatoCOP, guiaPrecios, nombreCategoria } from '@plastinex/shared'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto, Revelar, Rotulo } from '../componentes/base'
import NoEncontrado from '../componentes/NoEncontrado'
import OfertaCard from '../componentes/OfertaCard'

export default function ProcedimientoPagina() {
  const { id } = useParams()
  const { datos } = useCatalogo()
  const proc = datos?.procedimientos.find((p) => p.id === id)
  if (!datos || !proc) return <NoEncontrado texto="Este procedimiento no está disponible." />

  const opciones = detallarOfertas(datos).filter((d) => d.procedimiento.id === proc.id)
  const guia = guiaPrecios(datos, proc.id)
  const datosClave = [
    ['Duración aproximada', proc.duracion_aprox],
    ['Anestesia habitual', proc.anestesia],
    ['Recuperación orientativa', proc.recuperacion],
    ['Estadía sugerida si viajas', proc.estadia_sugerida_dias ? `${proc.estadia_sugerida_dias} días` : null],
  ].filter((x): x is [string, string] => !!x[1])

  return (
    <>
      <section className="contenedor grid gap-12 pt-48 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="flex flex-col">
          <Link to="/explorar" className="rotulo hover:text-espresso">
            ← {nombreCategoria[proc.categoria]}
          </Link>
          <h1 className="display mt-8 text-4xl md:text-5xl">{proc.nombre}</h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-piedra">{proc.descripcion}</p>
          <dl className="mt-auto grid grid-cols-2 border-t border-linea pt-2">
            {datosClave.map(([t, v]) => (
              <div key={t} className="border-b border-linea py-5 pr-4">
                <dt className="etiqueta">{t}</dt>
                <dd className="mt-2 font-serif text-2xl">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-niebla">
            Información general y orientativa. Cada caso se evalúa de forma individual; no se garantizan resultados.
          </p>
        </div>
        <Revelar>
          <Foto src={proc.imagen_url} alt={proc.nombre} ancho={1200} prioridad className="aspect-[4/5]" respaldo={proc.nombre} />
        </Revelar>
      </section>

      {guia && (
        <section className="bg-papel py-24">
          <div className="contenedor grid gap-14 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <Rotulo>Guía de precios</Rotulo>
              <h2 className="display mt-5 text-4xl">
                Precio de <em>{proc.nombre.toLowerCase()}</em>
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-piedra">
                Promedio calculado a partir de los rangos que publican {guia.opciones} {guia.opciones === 1 ? 'prestador' : 'prestadores'} de la red.
                El valor final depende de tu valoración, la técnica, la anestesia y la hospitalización.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-espresso pt-6">
                <Cifra t="Promedio" v={formatoCOP(guia.promedio)} />
                <Cifra t="Desde" v={formatoCOP(guia.minimo)} />
                <Cifra t="Hasta" v={formatoCOP(guia.maximo)} />
              </div>
              <Link to={`/planear?procedimiento=${proc.id}`} className="btn mt-10">
                Planear con mi presupuesto
              </Link>
            </div>
            <div>
              <div className="etiqueta">Por ciudad</div>
              <table className="mt-4 w-full text-sm">
                <tbody className="divide-y divide-linea border-y border-linea">
                  {guia.porCiudad.map((c) => (
                    <tr key={c.ciudad}>
                      <td className="py-4 font-serif text-2xl">{c.ciudad}</td>
                      <td className="py-4 text-piedra">
                        {formatoCOP(c.minimo)} – {formatoCOP(c.maximo)}
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs text-piedra">promedio</span>
                        <div>{formatoCOP(c.promedio)}</div>
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
              {opciones.length} {opciones.length === 1 ? 'opción' : 'opciones'} en la región
            </Rotulo>
            <h2 className="display mt-5 text-4xl">
              ¿Con quién <em>valorarte?</em>
            </h2>
          </div>
          <Link to={`/solicitar?procedimiento=${proc.id}`} className="btn-linea">
            Pedir orientación general
          </Link>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map((d, i) => (
            <Revelar key={d.oferta.id} retraso={(i % 3) * 0.06}>
              <OfertaCard d={d} />
            </Revelar>
          ))}
        </div>
      </section>
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
