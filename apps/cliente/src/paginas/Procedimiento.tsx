import { detallarOfertas, nombreCategoria } from '@plastinex/shared'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
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
      <section className="bg-tinta text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="kicker">— {nombreCategoria[proc.categoria]}</div>
          <h1 className="titulo mt-3 text-5xl">{proc.nombre}</h1>
          <p className="mt-4 max-w-2xl text-white/75">{proc.descripcion}</p>
          <div className="mt-8 grid max-w-4xl gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {datosClave.map(([t, v]) => (
              <div key={t} className="bg-tinta p-4">
                <div className="etiqueta !text-white/50">{t}</div>
                <div className="text-sm">{v}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/50">
            Información general y orientativa. Cada caso se evalúa de forma individual; no se garantizan resultados.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="titulo text-3xl">
            {opciones.length} {opciones.length === 1 ? 'opción' : 'opciones'} para <em>{proc.nombre.toLowerCase()}</em>
          </h2>
          <Link to={`/solicitar?procedimiento=${proc.id}`} className="btn-borde">
            Pedir orientación general
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {opciones.map((d) => (
            <OfertaCard key={d.oferta.id} d={d} />
          ))}
        </div>
      </section>
    </>
  )
}
