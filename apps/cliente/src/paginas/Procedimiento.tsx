import { detallarOfertas, nombreCategoria } from '@plastinex/shared'
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
  const datosClave = [
    ['Duración aproximada', proc.duracion_aprox],
    ['Anestesia habitual', proc.anestesia],
    ['Recuperación orientativa', proc.recuperacion],
    ['Estadía sugerida si viajas', proc.estadia_sugerida_dias ? `${proc.estadia_sugerida_dias} días` : null],
  ].filter((x): x is [string, string] => !!x[1])

  return (
    <>
      <section className="contenedor grid gap-12 pt-36 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="flex flex-col">
          <Link to="/explorar" className="rotulo hover:text-espresso">
            ← {nombreCategoria[proc.categoria]}
          </Link>
          <h1 className="display mt-8 text-6xl md:text-8xl">{proc.nombre}</h1>
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

      <section className="contenedor border-t border-linea py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Rotulo>
              {opciones.length} {opciones.length === 1 ? 'opción' : 'opciones'} en la región
            </Rotulo>
            <h2 className="display mt-5 text-5xl">
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
