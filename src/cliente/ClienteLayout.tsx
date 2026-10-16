import { ClipboardList, MapPin, Search, ShieldCheck, Stethoscope } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { nombreCategoria } from '../shared/format'
import { useDB } from '../shared/store'
import type { Categoria } from '../shared/types'

export default function ClienteLayout() {
  const db = useDB()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [ciudad, setCiudad] = useState(params.get('ciudad') ?? '')

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (q.trim()) p.set('q', q.trim())
    if (ciudad) p.set('ciudad', ciudad)
    navigate(`/buscar?${p}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-brand-900 text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Stethoscope size={18} />
            </span>
            <span>
              Ciru<span className="text-accent-400">.co</span>
            </span>
          </Link>

          <form onSubmit={buscar} className="order-3 flex w-full flex-1 overflow-hidden rounded-lg bg-white text-slate-900 md:order-none md:w-auto">
            <label className="hidden items-center gap-1 border-r border-slate-200 bg-slate-100 px-2 text-sm sm:flex">
              <MapPin size={14} className="text-slate-500" />
              <select
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="bg-transparent py-2 outline-none"
                aria-label="Ciudad"
              >
                <option value="">Toda Colombia</option>
                {db.ciudades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca procedimiento, cirujano o clínica…"
              className="min-w-0 flex-1 px-3 py-2 outline-none"
            />
            <button className="bg-accent-400 px-4 text-slate-900 hover:bg-accent-500" aria-label="Buscar">
              <Search size={18} />
            </button>
          </form>

          <nav className="ml-auto flex items-center gap-4 text-sm">
            <Link to="/mis-solicitudes" className="flex items-center gap-1 hover:text-accent-400">
              <ClipboardList size={16} /> Mis solicitudes
            </Link>
            <Link to="/admin" className="rounded border border-white/30 px-2 py-1 text-xs hover:bg-white/10">
              Panel admin
            </Link>
          </nav>
        </div>
        <div className="bg-brand-700">
          <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 py-2 text-sm whitespace-nowrap">
            {(Object.keys(nombreCategoria) as Categoria[]).map((c) => (
              <Link key={c} to={`/buscar?categoria=${c}`} className="hover:text-accent-400">
                {nombreCategoria[c]}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
          <div>
            <div className="mb-2 text-lg font-semibold text-white">Ciru.co</div>
            <p>El marketplace de cirugías en Colombia: cirujano, clínica, alojamiento y acompañamiento en un solo plan.</p>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1 font-semibold text-white">
              <ShieldCheck size={16} /> Verificación
            </div>
            <p>
              Cada clínica se valida en el REPS del Ministerio de Salud y cada especialista en el ReTHUS y su sociedad
              científica antes de publicarse.
            </p>
          </div>
          <div>
            <div className="mb-2 font-semibold text-white">Aviso</div>
            <p>
              Los precios son de referencia y se confirman tras la valoración médica. Ciru no presta servicios de salud;
              conecta pacientes con prestadores habilitados. Datos de demostración.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
