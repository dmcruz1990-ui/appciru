import { detallarOfertas, iniciales, nombreCiudad } from '@plastinex/shared'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto, Revelar, Rotulo } from '../componentes/base'
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
      <section className="contenedor grid gap-12 pt-36 pb-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <Revelar>
          {prof.foto_url ? (
            <Foto src={prof.foto_url} alt={prof.nombre} ancho={1000} prioridad className="aspect-[4/5]" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-arena">
              <span className="font-serif text-[9rem] text-espresso/25 italic">{iniciales(prof.nombre)}</span>
            </div>
          )}
        </Revelar>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="rotulo">Perfil profesional · {nombreCiudad(datos, prof.ciudad_id)}</span>
            {prof.es_demo && <EtiquetaDemo />}
          </div>
          <h1 className="display mt-8 text-6xl md:text-8xl">{prof.nombre}</h1>
          <p className="mt-4 text-lg text-piedra">{prof.especialidad}</p>
          <div className="mt-6">
            <EstadoVerificacion v={prof.verificacion} />
          </div>
          <p className="mt-10 max-w-xl text-[17px] leading-relaxed">{prof.bio}</p>
          <dl className="mt-auto grid grid-cols-2 border-t border-linea pt-2 md:grid-cols-4">
            {[
              ['ReTHUS', prof.rethus ?? '—'],
              ['Sociedad', prof.sociedad ?? '—'],
              ['Experiencia', prof.anios_experiencia ? `${prof.anios_experiencia} años` : '—'],
              ['Idiomas', prof.idiomas.join(', ')],
            ].map(([t, v]) => (
              <div key={t} className="border-b border-linea py-5 pr-4">
                <dt className="etiqueta">{t}</dt>
                <dd className="mt-2 font-serif text-xl">{v}</dd>
              </div>
            ))}
          </dl>
          {prof.valoracion_virtual && <p className="mt-6 text-sm text-piedra">Ofrece valoración virtual previa al viaje.</p>}
          {instituciones.length > 0 && (
            <p className="mt-4 text-sm text-piedra">
              Atiende en{' '}
              {instituciones.map((i, k) => (
                <span key={i.id}>
                  {k > 0 && ', '}
                  <Link to={`/institucion/${i.id}`} className="enlace text-espresso">
                    {i.nombre}
                  </Link>
                </span>
              ))}
              .
            </p>
          )}
        </div>
      </section>

      <section className="contenedor border-t border-linea py-24">
        <Rotulo>Procedimientos</Rotulo>
        <h2 className="display mt-5 text-5xl">
          Lo que <em>ofrece</em>
        </h2>
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
