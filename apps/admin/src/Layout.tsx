import { nombreRol } from '@plastinex/shared'
import { Briefcase, ClipboardList, ExternalLink, LayoutDashboard, LogOut, Package, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useEstadoDatos } from './datos'
import { useSesion } from './sesion'

const urlCliente = (import.meta.env.VITE_URL_CLIENTE as string | undefined) ?? '/'

export default function Layout() {
  const { perfil, salir, esStaff, esAdmin } = useSesion()
  const { datos, cargando, error, recargar } = useEstadoDatos()
  const nuevas = datos?.solicitudes.filter((s) => s.etapa === 'nueva').length ?? 0
  const pendientesVerif =
    (datos?.instituciones.filter((i) => i.verificacion !== 'verificado').length ?? 0) +
    (datos?.profesionales.filter((p) => p.verificacion !== 'verificado').length ?? 0)

  const enlaces = [
    { to: '/', icono: LayoutDashboard, t: 'Resumen', end: true, ver: true },
    { to: '/solicitudes', icono: ClipboardList, t: 'Solicitudes', ver: true, badge: nuevas },
    { to: '/catalogo/ofertas', icono: Package, t: 'Catálogo', ver: esStaff },
    { to: '/verificacion', icono: ShieldCheck, t: 'Verificación', ver: esStaff, badge: pendientesVerif },
    { to: '/clientes', icono: Briefcase, t: 'Clientes B2B', ver: esAdmin },
    { to: '/usuarios', icono: Users, t: 'Usuarios', ver: esAdmin },
  ].filter((e) => e.ver)

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-tinta text-stone-300 md:flex">
        <div className="flex items-baseline gap-2 px-5 py-6 text-white">
          <span className="font-serif text-3xl tracking-tight">Plastinex</span>
          <span className="text-[10px] tracking-[0.2em] text-stone-400 uppercase">Panel</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {enlaces.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}`
              }
            >
              <l.icono size={16} /> {l.t}
              {!!l.badge && <span className="ml-auto rounded-full bg-oro px-1.5 text-xs font-semibold text-tinta">{l.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3 text-sm">
          <a href={urlCliente} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/5">
            <ExternalLink size={14} /> Ver sitio público
          </a>
          <div className="px-3 pt-2 text-xs text-stone-400">
            {perfil?.nombre || perfil?.email}
            <div className="text-stone-500">{perfil && nombreRol[perfil.rol]}</div>
          </div>
          <button onClick={() => void salir()} className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-white/5">
            <LogOut size={14} /> Salir
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 overflow-x-auto bg-tinta px-4 py-3 text-sm whitespace-nowrap text-stone-300 md:hidden">
          {enlaces.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'text-white' : '')}>
              {l.t}
            </NavLink>
          ))}
          <button onClick={() => void salir()} className="ml-auto">
            <LogOut size={14} />
          </button>
        </header>
        <div className="flex items-center justify-end gap-2 px-4 pt-4 md:px-8">
          <button onClick={recargar} className="btn-sec !py-1 text-xs" title="Actualizar datos">
            <RefreshCw size={12} className={cargando ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
        <main className="flex-1 px-4 pb-10 md:px-8">
          {error ? (
            <div className="tarjeta p-6 text-sm text-rose-700">
              No se pudieron cargar los datos: {error}
              <button onClick={recargar} className="btn-sec ml-3">
                Reintentar
              </button>
            </div>
          ) : datos ? (
            <Outlet />
          ) : (
            <div className="p-6 text-sm text-stone-500">Cargando datos…</div>
          )}
        </main>
      </div>
    </div>
  )
}
