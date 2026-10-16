import { detallarOfertas, nombreCiudad, nombreTipoAlojamiento, nombreTipoInstitucion, textoPrecio } from '@plastinex/shared'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto, Revelar, Rotulo } from '../componentes/base'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'
import NoEncontrado from '../componentes/NoEncontrado'
import OfertaCard from '../componentes/OfertaCard'

export default function InstitucionPagina() {
  const { id } = useParams()
  const { datos } = useCatalogo()
  const inst = datos?.instituciones.find((i) => i.id === id)
  if (!datos || !inst) return <NoEncontrado texto="Esta institución no está disponible." />

  const opciones = detallarOfertas(datos).filter((d) => d.institucion.id === inst.id)
  const profIds = datos.vinculos.filter((v) => v.institucion_id === inst.id).map((v) => v.profesional_id)
  const profesionales = datos.profesionales.filter((p) => profIds.includes(p.id))
  const alojamientos = datos.alojamientos.filter((a) => a.ciudad_id === inst.ciudad_id)
  const imagen = inst.imagen_url ?? opciones[0]?.procedimiento.imagen_url

  return (
    <>
      <section className="relative h-[78svh] min-h-[560px] overflow-hidden text-marfil">
        <Foto src={imagen} alt={inst.nombre} ancho={2000} prioridad className="absolute inset-0" respaldo={inst.nombre} />
        <div className="absolute inset-0 bg-gradient-to-t from-tinta/85 via-tinta/30 to-tinta/40" />
        <div className="contenedor relative flex h-full flex-col justify-end pb-14">
          <div className="flex items-center gap-3">
            <span className="rotulo !text-marfil/70">
              {nombreTipoInstitucion[inst.tipo]} · {nombreCiudad(datos, inst.ciudad_id)}
            </span>
            {inst.es_demo && <EtiquetaDemo claro />}
          </div>
          <h1 className="display mt-6 max-w-4xl text-6xl md:text-8xl">{inst.nombre}</h1>
          <div className="mt-6">
            <EstadoVerificacion v={inst.verificacion} claro />
          </div>
        </div>
      </section>

      <section className="contenedor grid gap-16 py-24 md:grid-cols-[1.4fr_1fr]">
        <Revelar>
          <p className="display text-3xl leading-snug md:text-4xl">{inst.descripcion}</p>
          {inst.servicios.length > 0 && (
            <ul className="mt-10 grid gap-x-8 border-t border-linea text-sm sm:grid-cols-2">
              {inst.servicios.map((s) => (
                <li key={s} className="border-b border-linea py-4">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Revelar>
        <div className="space-y-10">
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="etiqueta">Código de habilitación (REPS)</dt>
              <dd className="mt-1 font-serif text-2xl">{inst.codigo_reps ?? 'No informado'}</dd>
            </div>
            {inst.direccion && (
              <div>
                <dt className="etiqueta">Dirección</dt>
                <dd className="mt-1">{inst.direccion}</dd>
              </div>
            )}
          </dl>
          <div>
            <div className="etiqueta">Especialistas</div>
            <ul className="mt-3 divide-y divide-linea border-y border-linea">
              {profesionales.map((p) => (
                <li key={p.id}>
                  <Link to={`/profesional/${p.id}`} className="flex items-baseline justify-between gap-4 py-4 hover:italic">
                    <span className="font-serif text-2xl">{p.nombre}</span>
                    <span className="text-xs text-piedra not-italic">{p.sociedad ?? ''}</span>
                  </Link>
                </li>
              ))}
              {profesionales.length === 0 && <li className="py-4 text-sm text-piedra">Sin especialistas publicados.</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="contenedor border-t border-linea py-24">
        <Rotulo>Procedimientos</Rotulo>
        <h2 className="display mt-5 text-5xl">
          Lo que puedes <em>valorar aquí</em>
        </h2>
        <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map((d, i) => (
            <Revelar key={d.oferta.id} retraso={(i % 3) * 0.06}>
              <OfertaCard d={d} />
            </Revelar>
          ))}
        </div>
      </section>

      {alojamientos.length > 0 && (
        <section className="bg-papel py-24">
          <div className="contenedor">
            <Rotulo>Alojamiento cercano</Rotulo>
            <div className="mt-10 divide-y divide-linea border-y border-linea">
              {alojamientos.map((a) => (
                <div key={a.id} className="grid gap-2 py-6 md:grid-cols-[1fr_200px_200px] md:items-baseline">
                  <div>
                    <div className="font-serif text-3xl">{a.nombre}</div>
                    <div className="text-sm text-piedra">{a.descripcion}</div>
                  </div>
                  <div className="text-sm text-piedra">{nombreTipoAlojamiento[a.tipo]}</div>
                  <div className="text-sm md:text-right">{a.precio_noche_desde ? `${textoPrecio(a.precio_noche_desde, null)} / noche` : 'Precio no informado'}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
