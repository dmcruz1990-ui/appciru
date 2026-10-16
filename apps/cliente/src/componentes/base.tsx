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
        <div className="absolute inset-0 flex items-end bg-gradient-to-br from-arena to-linea p-5">
          <span className="font-serif text-4xl text-espresso/30 italic">{respaldo ?? 'PLASTINEX'}</span>
        </div>
      )}
      <div className="grano" />
    </div>
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
