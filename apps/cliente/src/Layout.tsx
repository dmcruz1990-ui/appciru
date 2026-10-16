import Lenis from 'lenis'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCatalogo } from './catalogo'
import { Cargando, ErrorCarga } from './componentes/base'
import { useSesion } from './sesion'

const enlaces = [
  { to: '/explorar', t: 'Procedimientos' },
  { to: '/#como', t: 'Cómo funciona' },
  { to: '/para-clinicas', t: 'Para clínicas' },
]

/** Páginas con foto a sangre bajo la cabecera: la cabecera arranca transparente. */
const conHeroOscuro = (path: string) => path === '/'

export function Marca({ claro = false, grande = false }: { claro?: boolean; grande?: boolean }) {
  return (
    <Link to="/" className={`font-serif tracking-tight ${grande ? 'text-[19vw] leading-none' : 'text-2xl'} ${claro ? 'text-marfil' : 'text-espresso'}`}>
      Plastinex
    </Link>
  )
}

export default function Layout() {
  const { cargando, error, recargar } = useCatalogo()
  const { sesion, paciente } = useSesion()
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
          transparente ? 'bg-transparent text-marfil' : 'border-b border-linea/70 bg-marfil/85 text-espresso backdrop-blur-md'
        } ${sinCabecera ? 'lg:bg-transparent lg:border-transparent lg:backdrop-blur-0' : ''}`}
      >
        <div className="contenedor flex h-[72px] items-center gap-10">
          <Marca claro={transparente} />
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {enlaces.map((e) => (
              <NavLink key={e.to} to={e.to} className="opacity-80 transition hover:opacity-100">
                {e.t}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-6 text-sm md:flex">
            {sesion ? (
              <Link to="/cuenta" className="opacity-80 hover:opacity-100">
                {paciente ? `Hola, ${paciente.nombre.split(' ')[0]}` : 'Mi cuenta'}
              </Link>
            ) : (
              <Link to="/ingresar" className="opacity-80 hover:opacity-100">
                Ingresar
              </Link>
            )}
            <Link to="/solicitar" className={transparente ? 'btn-claro !py-2.5' : 'btn !py-2.5'}>
              Solicitar valoración
            </Link>
          </div>
          <button className="ml-auto text-sm md:hidden" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
            {abierto ? 'Cerrar' : 'Menú'}
          </button>
        </div>
        {abierto && (
          <nav className="contenedor flex flex-col border-t border-linea pt-4 pb-8 md:hidden">
            {[...enlaces, sesion ? { to: '/cuenta', t: 'Mi cuenta' } : { to: '/ingresar', t: 'Ingresar' }].map((e) => (
              <Link key={e.to} to={e.to} className="border-b border-linea py-4 font-serif text-3xl">
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
              <p className="display max-w-sm text-3xl">Información clara para una decisión que es tuya.</p>
              <Link to="/solicitar" className="btn-claro mt-8">
                Solicitar valoración
              </Link>
            </div>
            <Columna titulo="Explorar" enlaces={[['/explorar', 'Procedimientos'], ['/explorar?verificadas=1', 'Instituciones verificadas'], ['/cuenta', 'Mi cuenta']]} />
            <Columna titulo="PLASTINEX" enlaces={[['/#como', 'Cómo funciona'], ['/para-clinicas', 'Para clínicas'], ['/terminos', 'Términos']]} />
            <Columna titulo="Legal" enlaces={[['/privacidad', 'Privacidad'], ['/terminos', 'Intermediación y responsabilidad']]} />
          </div>
          <div className="contenedor">
            <div className="border-t border-marfil/15 pt-6 pb-4 text-xs leading-relaxed text-marfil/50 md:flex md:justify-between md:gap-10">
              <p className="max-w-2xl">
                PLASTINEX es un intermediario entre pacientes y prestadores de salud habilitados. No diagnostica, no prescribe ni
                determina si una persona es candidata a cirugía. Precios orientativos sujetos a valoración. Perfiles de demostración.
              </p>
              <p className="mt-3 md:mt-0">© {new Date().getFullYear()} PLASTINEX · Eje Cafetero, Colombia</p>
            </div>
            <div className="pointer-events-none -mb-[3.5vw] select-none" aria-hidden>
              <span className="block font-serif text-[21vw] leading-[0.8] tracking-tight text-marfil/[0.06]">Plastinex</span>
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
      <ul className="mt-5 space-y-3 text-sm">
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
