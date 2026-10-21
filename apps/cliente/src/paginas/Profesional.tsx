import { detallarOfertas, iniciales } from '@plastinex/shared'
import { Link, useParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto, Revelar, Rotulo } from '../componentes/base'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'
import NoEncontrado from '../componentes/NoEncontrado'
import OfertaCard from '../componentes/OfertaCard'
import { useIdioma } from '../idioma'
import { SITIO, useSeo } from '../seo'

export default function ProfesionalPagina() {
  const { id } = useParams()
  const { datos } = useCatalogo()
  const { tx, loc, lengua, ciudadDe } = useIdioma()
  const prof = datos?.profesionales.find((p) => p.id === id)
  useSeo({
    titulo: prof ? `${prof.nombre} · ${tx('Cirujano plástico', 'Plastic surgeon')} · ${ciudadDe(prof.ciudad_id)}` : undefined,
    descripcion: prof
      ? tx(
          `${prof.nombre}, ${loc(prof, 'especialidad').toLowerCase()} en ${ciudadDe(prof.ciudad_id)}. Procedimientos, clínicas, idiomas y solicitud de valoración en PLASTINEX.`,
          `${prof.nombre}, ${loc(prof, 'especialidad').toLowerCase()} in ${ciudadDe(prof.ciudad_id)}. Procedures, clinics, languages and consultation requests on PLASTINEX.`,
        )
      : undefined,
    // Los perfiles de demostración no se indexan en buscadores.
    indexar: !prof?.es_demo,
    jsonld: prof && {
      '@context': 'https://schema.org',
      '@type': 'Physician',
      name: prof.nombre,
      url: `${SITIO}/profesional/${prof.id}`,
      medicalSpecialty: 'PlasticSurgery',
      knowsLanguage: prof.idiomas,
      ...(prof.foto_url && { image: prof.foto_url }),
      address: { '@type': 'PostalAddress', addressLocality: ciudadDe(prof.ciudad_id) },
    },
  })
  if (!datos || !prof) return <NoEncontrado texto={tx('Este perfil no está disponible.', 'This profile is not available.')} />

  const opciones = detallarOfertas(datos).filter((d) => d.profesional?.id === prof.id)
  const instIds = datos.vinculos.filter((v) => v.profesional_id === prof.id).map((v) => v.institucion_id)
  const instituciones = datos.instituciones.filter((i) => instIds.includes(i.id))
  const idiomas = prof.idiomas.map(lengua)

  return (
    <>
      <section className="contenedor grid gap-12 pt-48 pb-20 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <Revelar>
          {prof.foto_url ? (
            <Foto src={prof.foto_url} alt={prof.nombre} ancho={1000} prioridad className="aspect-[4/5]" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-arena">
              <span className="font-serif text-[9rem] text-espresso/25">{iniciales(prof.nombre)}</span>
            </div>
          )}
        </Revelar>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="rotulo">
              {tx('Perfil profesional', 'Professional profile')} · {ciudadDe(prof.ciudad_id)}
            </span>
            {prof.es_demo && <EtiquetaDemo />}
          </div>
          <h1 className="display mt-8 text-4xl md:text-5xl">{prof.nombre}</h1>
          <p className="mt-4 text-lg text-piedra">{loc(prof, 'especialidad')}</p>
          <div className="mt-6">
            <EstadoVerificacion v={prof.verificacion} />
          </div>
          <p className="mt-10 max-w-xl text-[17px] leading-relaxed">{loc(prof, 'bio')}</p>
          <dl className="mt-auto grid grid-cols-2 border-t border-linea pt-2 md:grid-cols-4">
            {[
              [tx('Registro profesional', 'Professional registration'), prof.rethus ?? '—'],
              [tx('Sociedad', 'Society'), prof.sociedad ?? '—'],
              [tx('Experiencia', 'Experience'), prof.anios_experiencia ? tx(`${prof.anios_experiencia} años`, `${prof.anios_experiencia} years`) : '—'],
              [tx('Idiomas', 'Languages'), idiomas.join(', ')],
            ].map(([t, v]) => (
              <div key={t} className="border-b border-linea py-5 pr-4">
                <dt className="etiqueta">{t}</dt>
                <dd className="mt-2 font-serif text-xl">{v}</dd>
              </div>
            ))}
          </dl>
          {prof.valoracion_virtual && <p className="mt-6 text-sm text-piedra">{tx('Ofrece valoración virtual previa al viaje.', 'Offers a virtual consultation before you travel.')}</p>}
          {instituciones.length > 0 && (
            <p className="mt-4 text-sm text-piedra">
              {tx('Atiende en', 'Practices at')}{' '}
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
        <Rotulo>{tx('Procedimientos', 'Procedures')}</Rotulo>
        <h2 className="display mt-5 text-4xl">
          {tx(
            <>
              Lo que <em>ofrece</em>
            </>,
            <>
              What they <em>offer</em>
            </>,
          )}
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
