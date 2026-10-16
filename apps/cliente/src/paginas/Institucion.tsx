import { detallarOfertas, nombreCiudad, nombreTipoAlojamiento, nombreTipoInstitucion, textoPrecio } from '@plastinex/shared'
import { Check, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
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

  return (
    <>
      <section className="bg-tinta text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="flex items-center gap-3">
            <span className="kicker">— {nombreTipoInstitucion[inst.tipo]}</span>
            {inst.es_demo && <EtiquetaDemo />}
          </div>
          <h1 className="titulo mt-3 text-5xl">{inst.nombre}</h1>
          <div className="mt-3 flex items-center gap-1 text-sm text-white/70">
            <MapPin size={14} /> {inst.direccion ? `${inst.direccion}, ` : ''}
            {nombreCiudad(datos, inst.ciudad_id)}
          </div>
          <div className="mt-5">
            <EstadoVerificacion v={inst.verificacion} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3 md:px-8">
        <div className="border border-arena bg-white p-6 md:col-span-2">
          <p>{inst.descripcion}</p>
          {inst.servicios.length > 0 && (
            <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              {inst.servicios.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check size={14} className="text-oro" /> {s}
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-6 grid gap-4 border-t border-arena pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="etiqueta">Código de habilitación (REPS)</dt>
              <dd>{inst.codigo_reps ?? 'No informado'}</dd>
            </div>
            <div>
              <dt className="etiqueta">Estado de verificación</dt>
              <dd>
                <EstadoVerificacion v={inst.verificacion} />
              </dd>
            </div>
          </dl>
        </div>
        <div className="border border-arena bg-white p-6">
          <div className="etiqueta">Profesionales vinculados</div>
          <ul className="mt-2 space-y-2">
            {profesionales.map((p) => (
              <li key={p.id}>
                <Link to={`/profesional/${p.id}`} className="titulo text-lg hover:text-oro-osc">
                  {p.nombre}
                </Link>
                <div className="text-xs text-piedra">{p.especialidad}</div>
              </li>
            ))}
            {profesionales.length === 0 && <li className="text-sm text-piedra">Sin profesionales publicados.</li>}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <h2 className="titulo text-3xl">
          Procedimientos en <em>esta institución</em>
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {opciones.map((d) => (
            <OfertaCard key={d.oferta.id} d={d} />
          ))}
        </div>
      </section>

      {alojamientos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
          <h2 className="titulo text-3xl">
            Alojamiento <em>cercano</em>
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alojamientos.map((a) => (
              <div key={a.id} className="border border-arena bg-white p-5">
                <div className="etiqueta">{nombreTipoAlojamiento[a.tipo]}</div>
                <div className="titulo text-lg">{a.nombre}</div>
                <p className="mt-1 text-sm text-piedra">{a.descripcion}</p>
                <div className="mt-2 text-sm">{a.precio_noche_desde ? `${textoPrecio(a.precio_noche_desde, null)} / noche` : 'Precio no informado'}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
