import { detallarOfertas, nombreCategoria, type Categoria } from '@plastinex/shared'
import { BedDouble, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import Buscador from '../componentes/Buscador'
import OfertaCard from '../componentes/OfertaCard'

const pasos = [
  { n: '01', t: 'Explora', d: 'Por procedimiento y ciudad' },
  { n: '02', t: 'Compara', d: 'Información disponible y rangos orientativos' },
  { n: '03', t: 'Solicita', d: 'Una valoración médica, con tu plan si lo necesitas' },
]

export default function Inicio() {
  const { datos } = useCatalogo()
  if (!datos) return null
  const ofertas = detallarOfertas(datos)
  const destacadas = [...ofertas]
    .sort((a, b) => Number(b.institucion.verificacion === 'verificado') - Number(a.institucion.verificacion === 'verificado') || (a.oferta.precio_min ?? Infinity) - (b.oferta.precio_min ?? Infinity))
    .slice(0, 8)

  return (
    <>
      <section className="relative overflow-hidden bg-tinta text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(194,164,104,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 md:px-8 md:pt-28">
          <div className="kicker">— Plataforma de cirugía plástica · Colombia</div>
          <h1 className="titulo mt-5 text-5xl leading-[1.05] md:text-7xl">
            Encuentra información.
            <br />
            <em>Decide con criterio.</em>
          </h1>
          <p className="mt-6 max-w-xl text-white/75">
            Explora procedimientos, compara instituciones y profesionales y solicita una valoración médica en Pereira y el Eje
            Cafetero. Si vienes de otra ciudad, suma alojamiento de recobro y acompañamiento a tu solicitud.
          </p>
          <div className="mt-10 max-w-5xl">
            <Buscador />
          </div>
          <p className="mt-3 text-xs text-white/50">
            Los precios publicados son orientativos. La indicación quirúrgica corresponde al profesional tratante.
          </p>
        </div>
      </section>

      <section className="border-b border-arena bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-3 md:px-8">
          {pasos.map((p) => (
            <div key={p.n} className="flex items-center gap-4">
              <span className="titulo text-2xl text-oro">{p.n}</span>
              <span>
                <strong className="block text-sm">{p.t}</strong>
                <small className="text-piedra">{p.d}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="kicker">— Explora procedimientos</div>
            <h2 className="titulo mt-3 text-4xl">
              ¿Qué quieres <em>consultar?</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-piedra">La elegibilidad, los riesgos y las alternativas se evalúan individualmente en consulta.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {(Object.keys(nombreCategoria) as Categoria[]).map((cat) => {
            const procs = datos.procedimientos.filter((p) => p.categoria === cat)
            return (
              <div key={cat} className="flex flex-col bg-tinta p-6 text-white">
                <div className="titulo text-2xl">{nombreCategoria[cat]}</div>
                <ul className="mt-4 space-y-2 text-sm">
                  {procs.map((p) => (
                    <li key={p.id}>
                      <Link to={`/procedimiento/${p.id}`} className="flex justify-between border-b border-white/10 pb-2 text-white/80 hover:text-oro">
                        {p.nombre}
                        <span>↗</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="kicker">— Opciones en la región</div>
              <h2 className="titulo mt-3 text-4xl">
                Explora el <em>Eje Cafetero</em>
              </h2>
            </div>
            <Link to="/explorar" className="btn-borde">
              Ver todas las opciones ({ofertas.length})
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destacadas.map((d) => (
              <OfertaCard key={d.oferta.id} d={d} />
            ))}
          </div>
          <p className="mt-6 text-xs text-piedra">
            Perfiles de demostración: son ficticios y no tienen reseñas ni disponibilidad real.
          </p>
        </div>
      </section>

      <section id="como" className="grid md:grid-cols-2">
        <div className="flex min-h-80 flex-col justify-end bg-gradient-to-b from-piedra/40 to-tinta p-10 text-white">
          <span className="kicker">PLASTINEX guide</span>
          <h3 className="titulo mt-3 text-3xl">
            La información clara
            <br />
            es el primer paso.
          </h3>
        </div>
        <div className="bg-arena p-10 md:p-16">
          <div className="kicker">— Cómo funciona</div>
          <h2 className="titulo mt-3 text-4xl">
            De la búsqueda
            <br />a la <em>valoración.</em>
          </h2>
          <ol className="mt-8 space-y-5 text-sm">
            <li>
              <b>1. Filtra tus opciones.</b>
              <p className="text-piedra">Elige procedimiento, ciudad y rango orientativo cuando exista.</p>
            </li>
            <li>
              <b>2. Revisa el perfil.</b>
              <p className="text-piedra">
                La insignia de documentación verificada solo aparece después de revisar REPS, ReTHUS y la sociedad científica.
              </p>
            </li>
            <li>
              <b>3. Solicita una valoración.</b>
              <p className="text-piedra">
                Un coordinador te contacta y la institución confirma la disponibilidad. Una solicitud no es una reserva.
              </p>
            </li>
          </ol>
          <Link to="/solicitar" className="btn-tinta mt-8">
            Solicitar valoración →
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-20 md:grid-cols-2 md:px-8">
        <div className="border border-arena bg-white p-8">
          <BedDouble className="text-oro" />
          <h3 className="titulo mt-4 text-2xl">
            ¿Vienes de otra ciudad? <em>Arma tu plan.</em>
          </h3>
          <p className="mt-2 text-sm text-piedra">
            Al solicitar tu valoración puedes agregar alojamiento de recobro, traslados, enfermería y acompañamiento. Te los
            cotizamos junto con tu valoración.
          </p>
        </div>
        <div className="border border-arena bg-white p-8">
          <ShieldCheck className="text-oro" />
          <h3 className="titulo mt-4 text-2xl">
            Privacidad <em>desde el diseño.</em>
          </h3>
          <p className="mt-2 text-sm text-piedra">
            Pedimos solo los datos necesarios para contactarte. No incluyas información clínica en el formulario: eso se habla
            en la valoración con el profesional.
          </p>
          <Link to="/privacidad" className="mt-3 inline-block text-sm underline">
            Leer aviso de privacidad
          </Link>
        </div>
      </section>

      <section className="bg-tinta text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-16 md:px-8">
          <div>
            <div className="kicker">— Para clínicas y profesionales</div>
            <h2 className="titulo mt-3 text-4xl">
              Gestiona tus solicitudes con
              <br />
              <em>información transparente.</em>
            </h2>
          </div>
          <Link to="/para-clinicas" className="btn-oro">
            Conocer PLASTINEX para clínicas →
          </Link>
        </div>
      </section>
    </>
  )
}
