import { EMPRESA } from '@plastinex/shared'
import Lenis from 'lenis'
import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCatalogo } from './catalogo'
import { Cargando, ErrorCarga } from './componentes/base'
import { useFavoritos } from './componentes/favoritos'
import { useSesion } from './sesion'

const enlaces = [
  { to: '/explorar', t: 'Procedimientos' },
  { to: '/especialistas', t: 'Especialistas' },
  { to: '/alojamientos', t: 'Alojamiento' },
  { to: '/planear', t: 'Planear por presupuesto' },
  { to: '/para-clinicas', t: 'Para clínicas' },
]

/** Páginas con foto a sangre bajo la cabecera: la cabecera arranca transparente. */
const conHeroOscuro = (path: string) => path === '/'

export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <Link to="/" aria-label="PLASTINEX, inicio" className={`text-[19px] font-medium tracking-[0.42em] uppercase md:text-[24px] ${claro ? 'text-marfil' : 'text-espresso'}`}>
      Plastinex
    </Link>
  )
}

export default function Layout() {
  const { cargando, error, recargar } = useCatalogo()
  const { sesion, paciente } = useSesion()
  const { lista: favoritos } = useFavoritos()
  const { pathname, hash } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const [scroll, setScroll] = useState(false)

  // Desplazamiento suave (se desactiva si la persona prefiere menos movimiento).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let id = 0
    const raf = (t: number) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    const on = () => setScroll(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    setAbierto(false)
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 50)
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  const transparente = conHeroOscuro(pathname) && !scroll && !abierto
  const sinCabecera = pathname === '/ingresar'

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          transparente ? 'bg-transparent text-marfil' : 'border-b border-linea bg-marfil text-espresso'
        }`}
      >
        {/* Fila de marca: cuenta a la izquierda, logotipo centrado, solicitud a la derecha. */}
        <div className="contenedor relative flex h-16 items-center justify-between md:h-20">
          <div className="hidden text-[11px] font-medium tracking-[0.22em] uppercase md:block">
            {sesion ? (
              <Link to="/cuenta" className="opacity-80 hover:opacity-100">
                {paciente ? paciente.nombre.split(' ')[0] : 'Mi cuenta'}
              </Link>
            ) : (
              <Link to="/ingresar" className="opacity-80 hover:opacity-100">
                Ingresar
              </Link>
            )}
          </div>
          <button className="text-[11px] font-medium tracking-[0.22em] uppercase md:hidden" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
            {abierto ? 'Cerrar' : 'Menú'}
          </button>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Marca claro={transparente} />
          </div>
          <div className="flex items-center gap-5 text-[11px] font-medium tracking-[0.22em] uppercase">
            <Link to="/favoritos" className="hidden items-center gap-1.5 opacity-80 hover:opacity-100 md:flex" aria-label={`Favoritos (${favoritos.length})`}>
              <Heart size={16} strokeWidth={1.6} className={favoritos.length ? 'fill-current' : ''} />
              {favoritos.length > 0 && <span>{favoritos.length}</span>}
            </Link>
            <Link to="/solicitar" className="opacity-80 hover:opacity-100">
              <span className="hidden md:inline">Solicitar valoración</span>
              <span className="md:hidden">Solicitar</span>
            </Link>
          </div>
        </div>
        {/* Fila de categorías, como en las casas de moda; se oculta al desplazarse. */}
        <nav
          className={`hidden justify-center gap-7 overflow-hidden text-[10px] lg:gap-12 lg:text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-500 md:flex ${
            scroll ? 'h-0 opacity-0' : 'h-11 opacity-100'
          }`}
        >
          {enlaces.map((e) => (
            <NavLink key={e.to} to={e.to} className="pb-4 opacity-80 transition hover:opacity-100">
              {e.t}
            </NavLink>
          ))}
        </nav>
        {abierto && (
          <nav className="contenedor flex flex-col border-t border-linea bg-marfil pt-4 pb-8 text-espresso md:hidden">
            {[...enlaces, { to: '/favoritos', t: 'Favoritos' }, sesion ? { to: '/cuenta', t: 'Mi cuenta' } : { to: '/ingresar', t: 'Ingresar' }].map((e) => (
              <Link key={e.to} to={e.to} className="border-b border-linea py-5 text-[13px] font-medium tracking-[0.2em] uppercase">
                {e.t}
              </Link>
            ))}
            <Link to="/solicitar" className="btn mt-8">
              Solicitar valoración
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">{error ? <ErrorCarga mensaje={error} reintentar={recargar} /> : cargando ? <Cargando /> : <Outlet />}</main>

      {!sinCabecera && (
        <footer className="overflow-hidden bg-espresso text-marfil">
          <div className="contenedor grid gap-12 pt-20 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <p className="display normal-case max-w-sm text-2xl">Información clara para una decisión que es tuya.</p>
              <Link to="/solicitar" className="btn-claro mt-8">
                Solicitar valoración
              </Link>
            </div>
            <Columna titulo="Explorar" enlaces={[['/explorar', 'Procedimientos'], ['/especialistas', 'Especialistas'], ['/alojamientos', 'Alojamiento'], ['/favoritos', 'Favoritos']]} />
            <Columna titulo="PLASTINEX" enlaces={[['/#como', 'Cómo funciona'], ['/planear', 'Planear por presupuesto'], ['/para-clinicas', 'Para clínicas'], ['/cuenta', 'Mi cuenta']]} />
            <Columna titulo="Legal" enlaces={[['/privacidad', 'Privacidad'], ['/terminos', 'Intermediación y responsabilidad']]} />
          </div>
          <div className="contenedor">
            <div className="border-t border-marfil/15 pt-6 pb-4 text-xs leading-relaxed text-marfil/50 md:flex md:justify-between md:gap-10">
              <p className="max-w-2xl">
                PLASTINEX es un intermediario entre pacientes y prestadores de salud habilitados. No diagnostica, no prescribe ni
                determina si una persona es candidata a cirugía. El paciente contrata y paga directamente a la clínica que elige.
                Precios orientativos sujetos a valoración. Perfiles de demostración.
              </p>
              <p className="mt-3 shrink-0 md:mt-0 md:text-right">
                © {new Date().getFullYear()} {EMPRESA.razonSocial}
                <br />
                {EMPRESA.direccion.slice(0, 3).join(' · ')}
              </p>
            </div>
            <div className="pt-16 pb-10 text-center text-[13vw] leading-none font-medium tracking-[0.3em] text-marfil/[0.08] uppercase select-none md:text-[9vw]" aria-hidden>
              Plastinex
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

function Columna({ titulo, enlaces }: { titulo: string; enlaces: [string, string][] }) {
  return (
    <div>
      <div className="rotulo !text-marfil/50">{titulo}</div>
      <ul className="mt-6 space-y-3 text-[13px]">
        {enlaces.map(([to, t]) => (
          <li key={t}>
            <Link to={to} className="text-marfil/80 hover:text-marfil">
              {t}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
