import { BedDouble, CalendarCheck, HeartHandshake, Plane, Search, ShieldCheck, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatoCOP, nombreCategoria } from '../../shared/format'
import { nombreCiudad, ofertasPublicas } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import type { Categoria } from '../../shared/types'
import { Avatar, Estrellas } from '../../shared/ui'
import OfertaCard from '../components/OfertaCard'

const pasos = [
  { icono: Search, titulo: 'Compara', texto: 'Cirujanos, clínicas y precios verificados en toda Colombia.' },
  { icono: Stethoscope, titulo: 'Valórate', texto: 'Valoración virtual con el especialista antes de viajar.' },
  { icono: BedDouble, titulo: 'Arma tu plan', texto: 'Suma alojamiento de recobro, traslados, enfermería y más.' },
  { icono: Plane, titulo: 'Viaja tranquilo', texto: 'Un coordinador te acompaña de principio a fin.' },
]

export default function Inicio() {
  const db = useDB()
  const publicas = ofertasPublicas(db)
  const destacadas = [...publicas].sort((a, b) => b.medico.calificacion - a.medico.calificacion).slice(0, 8)
  const medicosTop = db.medicos.filter((m) => m.activo).sort((a, b) => b.resenas - a.resenas).slice(0, 6)

  const desdePorCategoria = (Object.keys(nombreCategoria) as Categoria[]).map((cat) => {
    const precios = publicas.filter((d) => d.procedimiento.categoria === cat).map((d) => d.oferta.precio)
    return { cat, desde: precios.length ? Math.min(...precios) : undefined, n: precios.length }
  })

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <h1 className="text-4xl leading-tight font-bold md:text-5xl">
              Tu cirugía en Colombia, <span className="text-accent-400">con todo el plan incluido.</span>
            </h1>
            <p className="mt-4 text-lg text-white/85">
              Como Uber sin carros o Airbnb sin hoteles: reunimos a los mejores cirujanos, clínicas y quirófanos del país
              en un solo lugar, junto con tu alojamiento y acompañamiento.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/buscar" className="rounded-full bg-accent-400 px-6 py-3 font-semibold text-slate-900 hover:bg-accent-500">
                Explorar procedimientos
              </Link>
              <Link to="/buscar?orden=calificacion" className="rounded-full border border-white/40 px-6 py-3 hover:bg-white/10">
                Ver cirujanos mejor calificados
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-slate-900">
            {[
              { n: db.clinicas.filter((c) => c.activo).length, t: 'clínicas habilitadas' },
              { n: db.medicos.filter((m) => m.activo).length, t: 'especialistas verificados' },
              { n: db.ciudades.length, t: 'ciudades' },
              { n: db.clinicas.reduce((s, c) => s + c.quirofanos, 0), t: 'quirófanos en la red' },
            ].map((s) => (
              <div key={s.t} className="rounded-xl bg-white/95 p-5 shadow">
                <div className="text-3xl font-bold text-brand-700">{s.n}</div>
                <div className="text-sm text-slate-600">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-6 max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {desdePorCategoria.map(({ cat, desde, n }) => (
            <Link
              key={cat}
              to={`/buscar?categoria=${cat}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="font-semibold">{nombreCategoria[cat]}</div>
              <div className="mt-1 text-xs text-slate-500">{n} {n === 1 ? 'opción' : 'opciones'}</div>
              {desde && <div className="mt-2 text-sm text-brand-700">desde {formatoCOP(desde)}</div>}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Planes destacados</h2>
          <Link to="/buscar" className="text-sm text-brand-700 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destacadas.map((d) => (
            <OfertaCard key={d.oferta.id} d={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <h2 className="mb-4 text-2xl font-bold">¿Cómo funciona?</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {pasos.map((p, i) => (
            <div key={p.titulo} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <p.icono size={18} />
                </span>
                <span className="text-xs text-slate-400">Paso {i + 1}</span>
              </div>
              <div className="font-semibold">{p.titulo}</div>
              <p className="text-sm text-slate-600">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <h2 className="mb-4 text-2xl font-bold">Cirujanos más elegidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicosTop.map((m) => (
            <Link
              key={m.id}
              to={`/medico/${m.id}`}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md"
            >
              <Avatar nombre={m.nombre} />
              <div className="min-w-0">
                <div className="font-semibold">{m.nombre}</div>
                <div className="truncate text-xs text-slate-500">{m.especialidad}</div>
                <Estrellas valor={m.calificacion} resenas={m.resenas} size={12} />
                <div className="text-xs text-slate-500">
                  {nombreCiudad(db, m.ciudadId)} · {m.aniosExperiencia} años · {m.cirugiasRealizadas.toLocaleString('es-CO')} cirugías
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="grid gap-4 rounded-2xl bg-brand-50 p-6 md:grid-cols-3">
          {[
            { i: ShieldCheck, t: 'Todo verificado', d: 'Clínicas habilitadas en REPS y especialistas registrados en ReTHUS.' },
            { i: CalendarCheck, t: 'Precio claro', d: 'Ves lo que incluye cada plan antes de pagar cualquier anticipo.' },
            { i: HeartHandshake, t: 'Acompañamiento', d: 'Coordinador personal antes, durante y después de tu cirugía.' },
          ].map((x) => (
            <div key={x.t} className="flex gap-3">
              <x.i className="shrink-0 text-brand-700" />
              <div>
                <div className="font-semibold">{x.t}</div>
                <p className="text-sm text-slate-600">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
