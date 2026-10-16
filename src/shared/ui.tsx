import { Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { iniciales, infoEstado } from './format'
import type { EstadoPedido } from './types'

export function Estrellas({ valor, resenas, size = 14 }: { valor: number; resenas?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(valor) ? 'fill-accent-400 text-accent-400' : 'text-slate-300'}
          />
        ))}
      </span>
      <span className="font-medium text-slate-700">{valor.toFixed(1)}</span>
      {resenas !== undefined && <span className="text-slate-500">({resenas.toLocaleString('es-CO')})</span>}
    </span>
  )
}

export function Insignia({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  const e = infoEstado(estado)
  return <Insignia className={e.color}>{e.nombre}</Insignia>
}

export function Avatar({ nombre, className = 'h-12 w-12 text-base' }: { nombre: string; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white ${className}`}
    >
      {iniciales(nombre)}
    </div>
  )
}

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>
}
