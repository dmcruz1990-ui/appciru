import { urlImagen } from '@plastinex/shared'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/** Aparición suave al entrar en pantalla. */
export function Revelar({ children, retraso = 0, className = '' }: { children: ReactNode; retraso?: number; className?: string }) {
  const reducido = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reducido ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: retraso }}
    >
      {children}
    </motion.div>
  )
}

/** Fotografía con carga diferida, grano sutil y respaldo tipográfico si no hay imagen o falla. */
export function Foto({
  src,
  alt,
  ancho = 1200,
  className = '',
  respaldo,
  prioridad = false,
  zoom = false,
}: {
  src: string | null | undefined
  alt: string
  ancho?: number
  className?: string
  respaldo?: string
  prioridad?: boolean
  zoom?: boolean
}) {
  const [fallo, setFallo] = useState(false)
  const url = urlImagen(src, ancho)
  return (
    <div className={`relative overflow-hidden bg-arena ${className}`}>
      {url && !fallo ? (
        <img
          src={url}
          alt={alt}
          loading={prioridad ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFallo(true)}
          className={`absolute inset-0 h-full w-full object-cover transition duration-[1.2s] ease-(--ease-suave) ${zoom ? 'group-hover:scale-[1.04]' : ''}`}
        />
      ) : (
        <>
          <Lienzo semilla={respaldo ?? alt} />
          {respaldo && (
            <div className="absolute inset-0 flex items-end p-5">
              <span className="font-serif text-4xl text-espresso/35 italic">{respaldo}</span>
            </div>
          )}
        </>
      )}
      <div className="grano" />
    </div>
  )
}

/** Generador pseudoaleatorio estable a partir de un texto, para que cada lienzo sea siempre igual. */
function aleatorio(semilla: string) {
  let h = 2166136261
  for (const c of semilla) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

const TONOS = {
  claro: { fondo: ['#efe8dc', '#e2d8c8'], luz: ['#fbf7f0', '#d9c3a5'], linea: '#a8835c' },
  oscuro: { fondo: ['#2b2420', '#161210'], luz: ['#8a6a4a', '#3d322b'], linea: '#d9c3a5' },
} as const

/**
 * Composición abstracta propia (luz y líneas de seda) que reemplaza a la fotografía cuando no hay una real.
 * No representa cuerpos, pacientes ni procedimientos.
 */
export function Lienzo({ semilla = 'plastinex', tono = 'claro', className = '' }: { semilla?: string; tono?: keyof typeof TONOS; className?: string }) {
  const t = TONOS[tono]
  const r = aleatorio(semilla)
  const id = `l${Math.floor(r() * 1e9)}`
  const luces = [0, 1].map(() => ({ x: 15 + r() * 70, y: 15 + r() * 95, rad: 45 + r() * 35 }))
  const base = 20 + r() * 40
  const a = (r() - 0.5) * 70
  const b = (r() - 0.5) * 70
  const lineas = Array.from({ length: 22 }, (_, i) => {
    const y = base + i * 3.2
    return `M-10 ${y} C 30 ${y + a + i * 0.9}, 70 ${y + b - i * 0.6}, 110 ${y + (a + b) / 3}`
  })
  return (
    <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className={`absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.fondo[0]} />
          <stop offset="1" stopColor={t.fondo[1]} />
        </linearGradient>
        {luces.map((_, i) => (
          <radialGradient key={i} id={`${id}l${i}`}>
            <stop offset="0" stopColor={t.luz[i]} stopOpacity="0.85" />
            <stop offset="1" stopColor={t.luz[i]} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      <rect width="100" height="125" fill={`url(#${id}f)`} />
      {luces.map((l, i) => (
        <circle key={i} cx={l.x} cy={l.y} r={l.rad} fill={`url(#${id}l${i})`} />
      ))}
      <g fill="none" stroke={t.linea} strokeWidth="1" vectorEffect="non-scaling-stroke">
        {lineas.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" opacity={0.12 + 0.28 * Math.sin((i / lineas.length) * Math.PI)} />
        ))}
      </g>
    </svg>
  )
}

export function Rotulo({ n, children, className = '' }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {n && <span className="font-serif text-lg text-arcilla italic">{n}</span>}
      <span className="rotulo">{children}</span>
    </div>
  )
}

export function Flecha({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function EnlaceFlecha({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="border-b border-current/30 pb-0.5 transition group-hover:border-current">{children}</span>
      <Flecha className="transition duration-300 group-hover:translate-x-1" />
    </Link>
  )
}

export function Cargando() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="font-serif text-2xl text-piedra italic">Cargando…</span>
    </div>
  )
}

export function ErrorCarga({ mensaje, reintentar }: { mensaje: string; reintentar?: () => void }) {
  return (
    <div className="contenedor py-32 text-center">
      <h2 className="display text-4xl">No pudimos cargar la información</h2>
      <p className="mt-3 text-sm text-piedra">{mensaje}</p>
      {reintentar && (
        <button onClick={reintentar} className="btn mt-8">
          Reintentar
        </button>
      )}
    </div>
  )
}
