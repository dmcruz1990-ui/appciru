import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCatalogo } from './catalogo'
import { Cargando, ErrorCarga } from './componentes/Estados'

const enlaces = [
  { to: '/explorar', t: 'Explorar' },
  { to: '/#como', t: 'Cómo funciona' },
  { to: '/seguimiento', t: 'Mi solicitud' },
  { to: '/para-clinicas', t: 'Para clínicas' },
]

export function Marca({ clara = true }: { clara?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 text-sm font-bold tracking-[0.2em] ${clara ? 'text-white' : 'text-tinta'}`}>
      <span className="flex h-7 w-7 items-center justify-center border border-oro font-serif text-base text-oro">P</span>
      PLASTINEX
    </Link>
  )
}

export default function Layout() {
  const { cargando, error, recargar } = useCatalogo()
  const [abierto, setAbierto] = useState(false)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    setAbierto(false)
    if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-tinta text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 md:px-8">
          <Marca />
          <nav className="ml-auto hidden items-center gap-7 text-sm text-white/80 md:flex">
            {enlaces.map((e) => (
              <NavLink key={e.to} to={e.to} className="hover:text-oro">
                {e.t}
              </NavLink>
            ))}
          </nav>
          <Link to="/solicitar" className="hidden border border-oro px-4 py-2 text-xs text-oro hover:bg-oro hover:text-tinta md:inline-flex">
            Solicitar valoración
          </Link>
          <button className="ml-auto md:hidden" onClick={() => setAbierto(!abierto)} aria-label="Menú">
            {abierto ? <X /> : <Menu />}
          </button>
        </div>
        {abierto && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 text-sm md:hidden">
            {enlaces.map((e) => (
              <Link key={e.to} to={e.to} className="py-2">
                {e.t}
              </Link>
            ))}
            <Link to="/solicitar" className="btn-oro mt-2">
              Solicitar valoración
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{error ? <ErrorCarga mensaje={error} reintentar={recargar} /> : cargando ? <Cargando /> : <Outlet />}</main>

      <footer className="bg-tinta text-white/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
          <div className="space-y-3">
            <Marca />
            <p className="max-w-sm">
              PLASTINEX no diagnostica, prescribe ni determina si una persona es candidata a cirugía. La indicación, los
              riesgos, las alternativas y el tratamiento corresponden al profesional de salud competente.
            </p>
          </div>
          <div className="space-y-2">
            <div className="kicker">Explorar</div>
            <Link to="/explorar" className="block hover:text-oro">Procedimientos</Link>
            <Link to="/seguimiento" className="block hover:text-oro">Consultar mi solicitud</Link>
            <Link to="/para-clinicas" className="block hover:text-oro">Para clínicas y profesionales</Link>
          </div>
          <div className="space-y-2">
            <div className="kicker">Información</div>
            <Link to="/privacidad" className="block hover:text-oro">Privacidad y tratamiento de datos</Link>
            <p>Los precios publicados son orientativos y los confirma cada prestador en una cotización individual.</p>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs md:px-8">
          © {new Date().getFullYear()} PLASTINEX · Nombre provisional · Colombia · Perfiles de demostración
        </div>
      </footer>
    </div>
  )
}
