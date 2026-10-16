import { ClipboardList, ExternalLink, LayoutDashboard, Package, Settings, Stethoscope } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useDB } from '../shared/store'

const enlaces = [
  { to: '/admin', icono: LayoutDashboard, t: 'Resumen', end: true },
  { to: '/admin/pedidos', icono: ClipboardList, t: 'Pedidos' },
  { to: '/admin/catalogo', icono: Package, t: 'Catálogo' },
  { to: '/admin/configuracion', icono: Settings, t: 'Configuración' },
]

export default function AdminLayout() {
  const db = useDB()
  const nuevos = db.pedidos.filter((p) => p.estado === 'nuevo').length

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-2 px-5 py-5 text-lg font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
            <Stethoscope size={18} />
          </span>
          Ciru <span className="text-xs font-normal text-slate-400">admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {enlaces.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60'}`
              }
            >
              <l.icono size={16} /> {l.t}
              {l.t === 'Pedidos' && nuevos > 0 && (
                <span className="ml-auto rounded-full bg-accent-400 px-1.5 text-xs font-semibold text-slate-900">{nuevos}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <a href="/" target="_blank" className="m-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-800/60">
          <ExternalLink size={14} /> Ver sitio de clientes
        </a>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex gap-3 overflow-x-auto bg-slate-900 px-4 py-3 text-sm text-slate-300 md:hidden">
          {enlaces.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'text-white' : '')}>
              {l.t}
            </NavLink>
          ))}
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
