import { detallarOfertas, type Procedimiento } from '@plastinex/shared'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { EnlaceFlecha, Flecha, Foto, Lienzo, Revelar, Rotulo } from '../componentes/base'
import Buscador from '../componentes/Buscador'
import OfertaCard from '../componentes/OfertaCard'
import { useIdioma } from '../idioma'

/** Pasos del proceso: [título, descripción], cada uno como [español, inglés]. */
type Texto = [es: string, en: string]
const pasos: [Texto, Texto][] = [
  [
    ['Explora', 'Explore'],
    [
      'Compara procedimientos, instituciones y profesionales con información clara y rangos orientativos.',
      'Compare procedures, facilities and surgeons with clear information and guide price ranges.',
    ],
  ],
  [
    ['Crea tu cuenta', 'Create your account'],
    ['Aceptas los términos de intermediación y tus datos quedan protegidos.', 'You accept the intermediation terms, and your data stays protected.'],
  ],
  [
    ['Solicita tu valoración', 'Request your consultation'],
    [
      'Un coordinador te contacta y agenda con el especialista que elegiste. La clínica te da el presupuesto y contratas directamente con ella.',
      'A coordinator contacts you and schedules you with the surgeon you chose. The clinic gives you a quote, and you contract directly with them.',
    ],
  ],
  [
    ['Arma tu estadía', 'Plan your stay'],
    ['Si viajas, suma alojamiento de recobro, traslados y enfermería.', 'If you’re traveling, add a recovery stay, transfers and nursing care.'],
  ],
]

/** Lo que verificamos: [título, descripción], cada uno como [español, inglés]. */
const verificaciones: [Texto, Texto][] = [
  [
    ['Habilitación', 'Licensing'],
    [
      'La institución está habilitada por la autoridad sanitaria de su país para cirugía plástica y anestesia. En Colombia, el REPS.',
      'The facility is licensed by its country’s health authority for plastic surgery and anesthesia. In Colombia, through REPS.',
    ],
  ],
  [
    ['Registro', 'Registration'],
    [
      'El especialista tiene su título y su registro profesional vigentes. En Colombia, el ReTHUS; en Estados Unidos, la licencia estatal.',
      'The surgeon holds a current degree and professional registration. In Colombia, ReTHUS; in the United States, a state medical license.',
    ],
  ],
  [
    ['Sociedad', 'Society'],
    [
      'Membresía en la sociedad científica de cirugía plástica de su país cuando aplica, como la SCCP en Colombia o la ASPS en Estados Unidos.',
      'Membership in their country’s plastic surgery society where applicable, such as SCCP in Colombia or ASPS in the United States.',
    ],
  ],
]

export default function Inicio() {
  const { datos } = useCatalogo()
  const { tx, dinero, loc } = useIdioma()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const escala = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const opacidad = useTransform(scrollYProgress, [0, 0.8], [1, 0.3])

  const ofertas = useMemo(() => (datos ? detallarOfertas(datos) : []), [datos])
  if (!datos) return null

  const destacadas = [...ofertas]
    .sort(
      (a, b) =>
        Number(b.institucion.verificacion === 'verificado') - Number(a.institucion.verificacion === 'verificado') ||
        Number(b.oferta.precio_min != null) - Number(a.oferta.precio_min != null),
    )


  const porCiudad = datos.ciudades
    .map((ciudad) => ({ ciudad, lista: destacadas.filter((d) => d.ciudad.id === ciudad.id) }))
    .filter((x) => x.lista.length > 0)

  const desde = (p: Procedimiento) => {
    const precios = ofertas.filter((o) => o.procedimiento.id === p.id && o.oferta.precio_min != null).map((o) => o.oferta.precio_min!)
    return precios.length ? Math.min(...precios) : null
  }

  return (
    <>
      {/* Hero a sangre */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-tinta text-marfil">
        <motion.div style={{ scale: escala, opacity: opacidad }} className="absolute inset-0">
          <Lienzo semilla="inicio" tono="oscuro" />
          <div className="grano" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-tinta/40 via-transparent to-tinta/70" />
        <div className="contenedor relative flex h-full flex-col items-center justify-end pb-16 text-center md:pb-24">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="rotulo !text-marfil/70">
            {tx('Cirugía plástica · Destinos en todo el mundo', 'Plastic surgery · Destinations worldwide')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="display mt-8 text-[11vw] font-light tracking-[0.08em] sm:text-[8vw] lg:text-[6.5rem]"
          >
            {tx('Decide con criterio', 'Choose with clarity')}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex w-full flex-col items-center gap-10"
          >
            <p className="max-w-lg text-[15px] leading-relaxed text-marfil/75">
              {tx(
                'Cirujanos e instituciones habilitadas, con información verificable, para que elijas con calma quién te valora.',
                'Licensed surgeons and facilities, with verifiable information, so you can take your time choosing who sees you for a consultation.',
              )}
            </p>
            <Buscador arriba className="max-w-[920px]" />
          </motion.div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="contenedor grid gap-10 py-28 md:grid-cols-[220px_1fr] md:py-40">
        <Rotulo n="01">{tx('Nuestra postura', 'Our stance')}</Rotulo>
        <Revelar>
          <p className="display normal-case text-[34px] leading-[1.15] md:text-[52px]">
            {tx(
              <>
                No vendemos cirugías. Te damos la información para elegir a quién confiarle la tuya: instituciones habilitadas,
                especialistas registrados y precios orientativos <em>sin letra pequeña.</em>
              </>,
              <>
                We don’t sell surgery. We give you the information to choose who to trust with yours: licensed facilities,
                registered surgeons and guide prices, <em>with no fine print.</em>
              </>,
            )}
          </p>
          <div className="mt-12 grid max-w-3xl gap-8 text-sm text-piedra sm:grid-cols-3">
            <p>
              <span className="block font-serif text-4xl text-espresso">{datos.instituciones.length}</span>
              {tx('instituciones en la red', 'facilities in our network')}
            </p>
            <p>
              <span className="block font-serif text-4xl text-espresso">{datos.profesionales.length}</span>
              {tx('especialistas con perfil', 'surgeons with a profile')}
            </p>
            <p>
              <span className="block font-serif text-4xl text-espresso">{new Set(datos.ciudades.map((c) => c.pais)).size}</span>
              {tx('países en el buscador', 'countries to search')}
            </p>
          </div>
        </Revelar>
      </section>

      {/* Índice editorial de procedimientos */}
      <IndiceProcedimientos procedimientos={datos.procedimientos} desde={desde} />

      {/* Filas por ciudad, como las colecciones de un marketplace */}
      <section className="py-28 md:py-36">
        <div className="contenedor flex flex-wrap items-end justify-between gap-6">
          <div>
            <Rotulo n="03">{tx('Opciones destacadas', 'Featured options')}</Rotulo>
            <h2 className="display mt-6 text-4xl md:text-5xl">
              {tx(
                <>
                  Elige con <em>calma.</em>
                </>,
                <>
                  Take your <em>time.</em>
                </>,
              )}
            </h2>
          </div>
          <EnlaceFlecha to="/explorar">
            {tx(`Ver las ${ofertas.length} opciones en el mapa`, ofertas.length === 1 ? 'See 1 option on the map' : `See all ${ofertas.length} options on the map`)}
          </EnlaceFlecha>
        </div>
        {porCiudad.map(({ ciudad, lista }) => (
          <FilaCiudad key={ciudad.id} titulo={tx(`En ${ciudad.nombre}`, `In ${ciudad.nombre}`)} to={`/explorar?ciudad=${ciudad.id}`}>
            {lista.map((d) => (
              <div key={d.oferta.id} className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[300px]">
                <OfertaCard d={d} />
              </div>
            ))}
          </FilaCiudad>
        ))}
      </section>

      {/* Proceso */}
      <section id="como" className="bg-papel py-28 md:py-36">
        <div className="contenedor">
          <Rotulo n="04">{tx('Cómo funciona', 'How it works')}</Rotulo>
          <h2 className="display mt-6 max-w-3xl text-4xl md:text-5xl">
            {tx(
              <>
                De la búsqueda a la <em>valoración.</em>
              </>,
              <>
                From search to <em>consultation.</em>
              </>,
            )}
          </h2>
          <div className="mt-20 grid border-t border-linea md:grid-cols-4">
            {pasos.map(([t, d], i) => (
              <Revelar key={t[0]} retraso={i * 0.08} className="border-b border-linea py-10 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0">
                <span className="font-serif text-5xl text-arcilla">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-serif text-3xl">{tx(...t)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-piedra">{tx(...d)}</p>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* Recuperación */}
      <section className="grid md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[720px]">
          <Lienzo semilla="recuperacion" />
          <div className="grano" />
        </div>
        <div className="flex flex-col justify-center px-6 py-24 md:px-20">
          <Rotulo n="05">{tx('Si vienes de otra ciudad', 'If you’re coming from out of town')}</Rotulo>
          <h2 className="display mt-6 text-4xl md:text-5xl">
            {tx(
              <>
                Tu recuperación, <em>resuelta.</em>
              </>,
              <>
                Your recovery, <em>arranged.</em>
              </>,
            )}
          </h2>
          <p className="mt-6 max-w-md text-piedra">
            {tx(
              'Al solicitar tu valoración puedes sumar alojamiento de recobro con enfermería, traslados desde el aeropuerto y acompañamiento. Lo cotizamos junto con tu valoración, sin compromiso.',
              'When you request your consultation, you can add a recovery stay with nursing care, airport transfers and a companion. We quote it together with your consultation, with no commitment.',
            )}
          </p>
          <ul className="mt-10 max-w-md divide-y divide-linea border-y border-linea text-sm">
            {datos.servicios.slice(0, 4).map((s) => (
              <li key={s.id} className="flex justify-between gap-4 py-4">
                <span>{loc(s, 'nombre')}</span>
                <span className="text-piedra">{s.precio_desde ? tx(`desde ${dinero(s.precio_desde)}`, `from ${dinero(s.precio_desde)}`) : tx('por cotizar', 'quote on request')}</span>
              </li>
            ))}
          </ul>
          <Link to="/solicitar" className="btn mt-10 self-start">
            {tx('Armar mi plan', 'Build my plan')}
          </Link>
        </div>
      </section>

      {/* Confianza */}
      <section className="contenedor py-28 md:py-36">
        <Rotulo n="06">{tx('Lo que verificamos', 'What we verify')}</Rotulo>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {verificaciones.map(([t, d], i) => (
            <Revelar key={t[0]} retraso={i * 0.08} className="border-t border-espresso pt-8">
              <h3 className="display text-4xl">{tx(...t)}</h3>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-piedra">{tx(...d)}</p>
            </Revelar>
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-sm text-piedra">
          {tx(
            'Mientras la revisión no termina, el perfil lo dice: «Pendiente de validación documental». Nunca mostramos una marca de verificación que no hayamos comprobado.',
            'Until the review is complete, the profile says so: “Document check pending.” We never show a verification mark we haven’t confirmed.',
          )}
        </p>
      </section>

      {/* Para clínicas */}
      <section className="bg-espresso text-marfil">
        <div className="contenedor grid gap-10 py-24 md:grid-cols-[1fr_auto] md:items-end md:py-32">
          <div>
            <div className="rotulo !text-marfil/50">{tx('Para clínicas y cirujanos', 'For clinics and surgeons')}</div>
            <h2 className="display mt-6 max-w-3xl text-4xl md:text-5xl">
              {tx(
                <>
                  Cada paciente interesado, <em>bien atendido.</em>
                </>,
                <>
                  Every interested patient, <em>well looked after.</em>
                </>,
              )}
            </h2>
          </div>
          <Link to="/para-clinicas" className="btn-claro">
            {tx('Conocer la plataforma', 'Discover the platform')} <Flecha />
          </Link>
        </div>
      </section>
    </>
  )
}

/** Lista tipográfica; al pasar el cursor aparece la fotografía del procedimiento. */
function IndiceProcedimientos({ procedimientos, desde }: { procedimientos: Procedimiento[]; desde: (p: Procedimiento) => number | null }) {
  const { tx, dinero, loc, categoria } = useIdioma()
  const [activo, setActivo] = useState<Procedimiento | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section className="contenedor pb-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Rotulo n="02">{tx('Procedimientos', 'Procedures')}</Rotulo>
          <h2 className="display mt-6 text-4xl md:text-5xl">
            {tx(
              <>
                ¿Qué quieres <em>consultar?</em>
              </>,
              <>
                What would you like to <em>ask about?</em>
              </>,
            )}
          </h2>
        </div>
        <p className="max-w-xs text-sm text-piedra">
          {tx('La elegibilidad, los riesgos y las alternativas siempre se evalúan en consulta.', 'Eligibility, risks and alternatives are always assessed in a consultation.')}
        </p>
      </div>
      <div
        ref={ref}
        className="relative mt-16 border-t border-espresso"
        onMouseMove={(e) => {
          const r = ref.current?.getBoundingClientRect()
          if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
        }}
        onMouseLeave={() => setActivo(null)}
      >
        {procedimientos.map((p, i) => {
          const d = desde(p)
          return (
            <Link
              key={p.id}
              to={`/procedimiento/${p.id}`}
              onMouseEnter={() => setActivo(p)}
              className="group grid grid-cols-[28px_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-b border-linea py-6 transition-colors hover:border-espresso md:grid-cols-[80px_1fr_220px_160px] md:py-8"
            >
              <span className="font-serif text-lg text-arcilla">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-serif text-[30px] leading-none break-words transition duration-500 ease-(--ease-suave) group-hover:translate-x-3 md:text-[56px]">
                {loc(p, 'nombre')}
              </span>
              <span className="hidden text-sm text-piedra md:block">{categoria(p.categoria)}</span>
              <span className="col-start-2 text-sm text-piedra md:col-start-auto md:text-right">{d ? tx(`desde ${dinero(d)}`, `from ${dinero(d)}`) : tx('por valorar', 'price on consultation')}</span>
            </Link>
          )
        })}
        <AnimatePresence>
          {activo?.imagen_url && (
            <motion.div
              key={activo.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1, x: pos.x - 150, y: pos.y - 190 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.6 }}
              className="pointer-events-none absolute top-0 left-0 z-10 hidden h-[380px] w-[300px] lg:block"
            >
              <Foto src={activo.imagen_url} alt="" ancho={600} className="h-full w-full shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/** Fila deslizable horizontal con flechas, al estilo de las colecciones de un marketplace. */
function FilaCiudad({ titulo, to, children }: { titulo: string; to: string; children: ReactNode }) {
  const { tx } = useIdioma()
  const ref = useRef<HTMLDivElement>(null)
  const mover = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div className="mt-16">
      <div className="contenedor flex items-center justify-between gap-4">
        <h3 className="text-[13px] font-medium tracking-[0.2em] uppercase">{titulo}</h3>
        <div className="flex items-center gap-2">
          <Link to={to} className="mr-3 text-[11px] font-medium tracking-[0.2em] uppercase underline underline-offset-[6px]">
            {tx('Ver todo', 'View all')}
          </Link>
          <button onClick={() => mover(-1)} aria-label={tx('Anterior', 'Previous')} className="flex h-9 w-9 items-center justify-center border border-linea transition hover:border-espresso">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button onClick={() => mover(1)} aria-label={tx('Siguiente', 'Next')} className="flex h-9 w-9 items-center justify-center border border-linea transition hover:border-espresso">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div ref={ref} className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:px-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))]">
        {children}
      </div>
    </div>
  )
}
