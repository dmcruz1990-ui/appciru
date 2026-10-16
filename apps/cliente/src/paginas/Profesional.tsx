import { detallarOfertas, iniciales, nombreCiudad } from '@plastinex/shared'
import { Languages, Video } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'
import NoEncontrado from '../componentes/NoEncontrado'
import OfertaCard from '../componentes/OfertaCard'

export default function ProfesionalPagina() {
  const { id } = useParams()
  const { datos } = useCatalogo()
  const prof = datos?.profesionales.find((p) => p.id === id)
  if (!datos || !prof) return <NoEncontrado texto="Este perfil no está disponible." />

  const opciones = detallarOfertas(datos).filter((d) => d.profesional?.id === prof.id)
  const instIds = datos.vinculos.filter((v) => v.profesional_id === prof.id).map((v) => v.institucion_id)
  const instituciones = datos.instituciones.filter((i) => instIds.includes(i.id))

  return (
    <>
      <section className="bg-tinta text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 md:flex-row md:items-center md:px-8">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center border border-oro font-serif text-4xl text-oro">{iniciales(prof.nombre)}</div>
          <div>
            <div className="flex items-center gap-3">
              <span className="kicker">— Perfil profesional</span>
              {prof.es_demo && <EtiquetaDemo />}
            </div>
            <h1 className="titulo mt-2 text-5xl">{prof.nombre}</h1>
            <div className="mt-1 text-white/70">{prof.especialidad}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <EstadoVerificacion v={prof.verificacion} />
              {prof.valoracion_virtual && (
                <span className="inline-flex items-center gap-1 border border-white/20 px-2 py-0.5 text-[11px]">
                  <Video size={12} /> Valoración virtual
                </span>
              )}
              <span className="inline-flex items-center gap-1 border border-white/20 px-2 py-0.5 text-[11px]">
                <Languages size={12} /> {prof.idiomas.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3 md:px-8">
        <div className="border border-arena bg-white p-6 md:col-span-2">
          <p>{prof.bio}</p>
          <dl className="mt-6 grid gap-4 border-t border-arena pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="etiqueta">Registro ReTHUS</dt>
              <dd>{prof.rethus ?? 'No informado'}</dd>
            </div>
            <div>
              <dt className="etiqueta">Sociedad científica</dt>
              <dd>{prof.sociedad ?? 'No informada'}</dd>
            </div>
            <div>
              <dt className="etiqueta">Experiencia</dt>
              <dd>{prof.anios_experiencia ? `${prof.anios_experiencia} años` : 'No informada'}</dd>
            </div>
          </dl>
        </div>
        <div className="border border-arena bg-white p-6">
          <div className="etiqueta">Atiende en</div>
          <ul className="mt-2 space-y-2">
            {instituciones.map((i) => (
              <li key={i.id}>
                <Link to={`/institucion/${i.id}`} className="titulo text-lg hover:text-oro-osc">
                  {i.nombre}
                </Link>
                <div className="text-xs text-piedra">{nombreCiudad(datos, i.ciudad_id)}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <h2 className="titulo text-3xl">
          Procedimientos que <em>ofrece</em>
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {opciones.map((d) => (
            <OfertaCard key={d.oferta.id} d={d} />
          ))}
        </div>
      </section>
    </>
  )
}
