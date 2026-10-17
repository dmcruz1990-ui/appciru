import { detallarOfertas, formatoCOP, nombreCategoria, type Procedimiento } from '@plastinex/shared'
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { EnlaceFlecha, Flecha, Foto, Lienzo, Revelar, Rotulo } from '../componentes/base'
import OfertaCard from '../componentes/OfertaCard'

const pasos = [
  ['Explora', 'Compara procedimientos, instituciones y profesionales con información clara y rangos orientativos.'],
  ['Crea tu cuenta', 'Aceptas los términos de intermediación y tus datos quedan protegidos.'],
  ['Solicita tu valoración', 'Un coordinador te contacta y agenda con el especialista que elegiste. La clínica te da el presupuesto y contratas directamente con ella.'],
  ['Arma tu estadía', 'Si viajas, suma alojamiento de recobro, traslados y enfermería.'],
]

export default function Inicio() {
  const { datos } = useCatalogo()
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
    .slice(0, 6)

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
        <div className="absolute inset-0 bg-gradient-to-b from-tinta/50 via-tinta/20 to-tinta/80" />
        <div className="contenedor relative flex h-full flex-col justify-end pb-14 md:pb-20">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="rotulo !text-marfil/70">
            Cirugía plástica · Eje Cafetero, Colombia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="display mt-6 max-w-5xl text-[15vw] sm:text-[11vw] lg:text-[8.6rem]"
          >
            Decide con <em>criterio.</em>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end"
          >
            <p className="max-w-md text-[17px] leading-relaxed text-marfil/80">
              Reunimos a cirujanos e instituciones habilitadas del Eje Cafetero con información verificable, para que elijas con calma
              quién te valora.
            </p>
            <BuscadorHero />
          </motion.div>
        </div>
      </section>

      {/* Manifiesto */}
      <section className="contenedor grid gap-10 py-28 md:grid-cols-[220px_1fr] md:py-40">
        <Rotulo n="01">Nuestra postura</Rotulo>
        <Revelar>
          <p className="display text-[34px] leading-[1.15] md:text-[52px]">
            No vendemos cirugías. Te damos la información para elegir a quién confiarle la tuya: instituciones habilitadas,
            especialistas registrados y precios orientativos <em>sin letra pequeña.</em>
          </p>
          <div className="mt-12 grid max-w-3xl gap-8 text-sm text-piedra sm:grid-cols-3">
            <p>
              <span className="block font-serif text-4xl text-espresso">{datos.instituciones.length}</span>
              instituciones en la red
            </p>
            <p>
              <span className="block font-serif text-4xl text-espresso">{datos.profesionales.length}</span>
              especialistas con perfil
            </p>
            <p>
              <span className="block font-serif text-4xl text-espresso">{datos.ciudades.length}</span>
              ciudades del Eje Cafetero
            </p>
          </div>
        </Revelar>
      </section>

      {/* Índice editorial de procedimientos */}
      <IndiceProcedimientos procedimientos={datos.procedimientos} desde={desde} />

      {/* Destacados */}
      <section className="contenedor py-28 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Rotulo n="03">Opciones en la región</Rotulo>
            <h2 className="display mt-6 text-5xl md:text-7xl">
              Elige con <em>calma.</em>
            </h2>
          </div>
          <EnlaceFlecha to="/explorar">Ver las {ofertas.length} opciones</EnlaceFlecha>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {destacadas.map((d, i) => (
            <Revelar key={d.oferta.id} retraso={(i % 3) * 0.08}>
              <OfertaCard d={d} indice={i} />
            </Revelar>
          ))}
        </div>
      </section>

      {/* Proceso */}
      <section id="como" className="bg-papel py-28 md:py-36">
        <div className="contenedor">
          <Rotulo n="04">Cómo funciona</Rotulo>
          <h2 className="display mt-6 max-w-3xl text-5xl md:text-7xl">
            De la búsqueda a la <em>valoración.</em>
          </h2>
          <div className="mt-20 grid border-t border-linea md:grid-cols-4">
            {pasos.map(([t, d], i) => (
              <Revelar key={t} retraso={i * 0.08} className="border-b border-linea py-10 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0">
                <span className="font-serif text-5xl text-arcilla italic">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 font-serif text-3xl">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-piedra">{d}</p>
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
          <Rotulo n="05">Si vienes de otra ciudad</Rotulo>
          <h2 className="display mt-6 text-5xl md:text-6xl">
            Tu recuperación, <em>resuelta.</em>
          </h2>
          <p className="mt-6 max-w-md text-piedra">
            Al solicitar tu valoración puedes sumar alojamiento de recobro con enfermería, traslados desde el aeropuerto y
            acompañamiento. Lo cotizamos junto con tu valoración, sin compromiso.
          </p>
          <ul className="mt-10 max-w-md divide-y divide-linea border-y border-linea text-sm">
            {datos.servicios.slice(0, 4).map((s) => (
              <li key={s.id} className="flex justify-between gap-4 py-4">
                <span>{s.nombre}</span>
                <span className="text-piedra">{s.precio_desde ? `desde ${formatoCOP(s.precio_desde)}` : 'por cotizar'}</span>
              </li>
            ))}
          </ul>
          <Link to="/solicitar" className="btn mt-10 self-start">
            Armar mi plan
          </Link>
        </div>
      </section>

      {/* Confianza */}
      <section className="contenedor py-28 md:py-36">
        <Rotulo n="06">Lo que verificamos</Rotulo>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {[
            ['REPS', 'Habilitación de la institución ante el Ministerio de Salud para cirugía plástica y anestesia.'],
            ['ReTHUS', 'Registro del especialista y su título en el Registro Único Nacional del Talento Humano en Salud.'],
            ['SCCP', 'Membresía en la Sociedad Colombiana de Cirugía Plástica, Estética y Reconstructiva cuando aplica.'],
          ].map(([t, d], i) => (
            <Revelar key={t} retraso={i * 0.08} className="border-t border-espresso pt-8">
              <h3 className="display text-6xl">{t}</h3>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-piedra">{d}</p>
            </Revelar>
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-sm text-piedra">
          Mientras la revisión no termina, el perfil lo dice: «Pendiente de validación documental». Nunca mostramos una marca de
          verificación que no hayamos comprobado.
        </p>
      </section>

      {/* Para clínicas */}
      <section className="bg-espresso text-marfil">
        <div className="contenedor grid gap-10 py-24 md:grid-cols-[1fr_auto] md:items-end md:py-32">
          <div>
            <div className="rotulo !text-marfil/50">Para clínicas y cirujanos</div>
            <h2 className="display mt-6 max-w-3xl text-5xl md:text-7xl">
              Cada paciente interesado, <em>bien atendido.</em>
            </h2>
          </div>
          <Link to="/para-clinicas" className="btn-claro">
            Conocer la plataforma <Flecha />
          </Link>
        </div>
      </section>
    </>
  )
}

function BuscadorHero() {
  const { datos } = useCatalogo()
  const navigate = useNavigate()
  const [p, setP] = useState('')
  const [c, setC] = useState('')
  const [b, setB] = useState('')
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (p) q.set('procedimiento', p)
    if (c) q.set('ciudad', c)
    if (b) q.set('presupuesto', b)
    navigate(`/planear?${q}`)
  }
  return (
    <form onSubmit={enviar} className="flex w-full flex-col gap-2 rounded-[28px] bg-marfil/95 p-2 text-espresso backdrop-blur sm:flex-row sm:items-center sm:rounded-full md:w-[680px]">
      <select value={p} onChange={(e) => setP(e.target.value)} aria-label="Procedimiento" className="flex-1 cursor-pointer bg-transparent px-5 py-3 text-sm outline-none">
        <option value="">Todos los procedimientos</option>
        {datos?.procedimientos.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nombre}
          </option>
        ))}
      </select>
      <span className="hidden h-6 w-px bg-linea sm:block" />
      <select value={c} onChange={(e) => setC(e.target.value)} aria-label="Ciudad" className="cursor-pointer bg-transparent px-5 py-3 text-sm outline-none">
        <option value="">Toda la región</option>
        {datos?.ciudades.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nombre}
          </option>
        ))}
      </select>
      <span className="hidden h-6 w-px bg-linea sm:block" />
      <input
        inputMode="numeric"
        aria-label="Presupuesto"
        value={b ? Number(b).toLocaleString('es-CO') : ''}
        onChange={(e) => setB(e.target.value.replace(/\D/g, '').slice(0, 10))}
        placeholder="Tu presupuesto"
        className="w-full bg-transparent px-5 py-3 text-sm outline-none placeholder:text-piedra sm:w-36"
      />
      <button className="btn !px-7">Buscar</button>
    </form>
  )
}

/** Lista tipográfica; al pasar el cursor aparece la fotografía del procedimiento. */
function IndiceProcedimientos({ procedimientos, desde }: { procedimientos: Procedimiento[]; desde: (p: Procedimiento) => number | null }) {
  const [activo, setActivo] = useState<Procedimiento | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  return (
    <section className="contenedor pb-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Rotulo n="02">Procedimientos</Rotulo>
          <h2 className="display mt-6 text-5xl md:text-7xl">
            ¿Qué quieres <em>consultar?</em>
          </h2>
        </div>
        <p className="max-w-xs text-sm text-piedra">La elegibilidad, los riesgos y las alternativas siempre se evalúan en consulta.</p>
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
              <span className="font-serif text-lg text-arcilla italic">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-serif text-[30px] leading-none break-words transition duration-500 ease-(--ease-suave) group-hover:translate-x-3 group-hover:italic md:text-[56px]">
                {p.nombre}
              </span>
              <span className="hidden text-sm text-piedra md:block">{nombreCategoria[p.categoria]}</span>
              <span className="col-start-2 text-sm text-piedra md:col-start-auto md:text-right">{d ? `desde ${formatoCOP(d)}` : 'por valorar'}</span>
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
