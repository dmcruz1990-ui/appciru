import { urlImagen } from '@plastinex/shared'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { Lienzo } from './base'

/**
 * Fotos deslizables dentro de una tarjeta: flechas al pasar el cursor, puntos de posición
 * y gesto de arrastre en pantallas táctiles. Sin fotos, muestra el lienzo abstracto.
 */
export default function Carrusel({
  fotos,
  alt,
  semilla,
  respaldo,
  className = '',
  ancho = 800,
  children,
}: {
  fotos: string[]
  alt: string
  semilla: string
  respaldo?: string
  className?: string
  ancho?: number
  /** Capas encima de la foto (favorito, etiquetas). */
  children?: ReactNode
}) {
  const [i, setI] = useState(0)
  const [inicioX, setInicioX] = useState<number | null>(null)
  const n = fotos.length
  const ir = (e: MouseEvent | null, d: number) => {
    e?.preventDefault()
    e?.stopPropagation()
    setI((x) => (x + d + n) % n)
  }

  return (
    <div
      className={`group/c relative overflow-hidden bg-arena ${className}`}
      onTouchStart={(e) => setInicioX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (inicioX == null || n < 2) return
        const dx = e.changedTouches[0].clientX - inicioX
        if (Math.abs(dx) > 40) ir(null, dx < 0 ? 1 : -1)
        setInicioX(null)
      }}
    >
      {n ? (
        <div className="absolute inset-0 flex transition-transform duration-500 ease-(--ease-suave)" style={{ transform: `translateX(-${i * 100}%)` }}>
          {fotos.map((f, k) => (
            <img
              key={f + k}
              src={urlImagen(f, ancho) ?? undefined}
              alt={k === 0 ? alt : ''}
              loading="lazy"
              decoding="async"
              className="h-full w-full shrink-0 object-cover transition duration-[1.2s] group-hover/c:scale-[1.03]"
            />
          ))}
        </div>
      ) : (
        <>
          <Lienzo semilla={semilla} />
          {respaldo && (
            <div className="absolute inset-0 flex items-end p-5">
              <span className="text-[11px] font-medium tracking-[0.24em] text-espresso/45 uppercase">{respaldo}</span>
            </div>
          )}
        </>
      )}
      <div className="grano" />

      {n > 1 && (
        <>
          <Flecha lado="izq" onClick={(e) => ir(e, -1)} />
          <Flecha lado="der" onClick={(e) => ir(e, 1)} />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {fotos.slice(0, 6).map((f, k) => (
              <span key={f + k} className={`h-1.5 w-1.5 rounded-full transition ${k === Math.min(i, 5) ? 'bg-marfil' : 'bg-marfil/50'}`} />
            ))}
          </div>
        </>
      )}
      {children}
    </div>
  )
}

function Flecha({ lado, onClick }: { lado: 'izq' | 'der'; onClick: (e: MouseEvent) => void }) {
  const I = lado === 'izq' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      aria-label={lado === 'izq' ? 'Foto anterior' : 'Foto siguiente'}
      className={`absolute top-1/2 ${lado === 'izq' ? 'left-3' : 'right-3'} flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-marfil/90 text-espresso opacity-0 shadow transition group-hover/c:opacity-100 hover:bg-marfil`}
    >
      <I size={16} strokeWidth={1.6} />
    </button>
  )
}
