import { infoEtapa, infoVerificacion, type Etapa, type Verificacion } from '@plastinex/shared'
import { useEffect, type ReactNode } from 'react'

const coloresEtapa: Record<Etapa, string> = {
  nueva: 'bg-sky-100 text-sky-900',
  contactada: 'bg-indigo-100 text-indigo-900',
  valoracion_agendada: 'bg-amber-100 text-amber-900',
  valorada: 'bg-orange-100 text-orange-900',
  seguimiento: 'bg-violet-100 text-violet-900',
  programada: 'bg-emerald-100 text-emerald-900',
  no_continua: 'bg-stone-200 text-stone-700',
}

export function EtapaBadge({ etapa }: { etapa: Etapa }) {
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${coloresEtapa[etapa]}`}>{infoEtapa(etapa).nombre}</span>
}

export function VerifBadge({ v }: { v: Verificacion }) {
  const c =
    v === 'verificado' ? 'bg-emerald-100 text-emerald-900' : v === 'rechazado' ? 'bg-rose-100 text-rose-900' : v === 'en_revision' ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-700'
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${c}`}>{infoVerificacion(v).nombre}</span>
}

export function Titulo({ children, accion }: { children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-serif text-4xl tracking-tight">{children}</h1>
      {accion}
    </div>
  )
}

export function Kpi({ t, v, s }: { t: string; v: string; s?: string }) {
  return (
    <div className="tarjeta p-4">
      <div className="text-xs text-stone-500">{t}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{v}</div>
      {s && <div className="text-xs text-stone-500">{s}</div>}
    </div>
  )
}

/** Barras horizontales de una sola serie (magnitud): un solo tono, valor en texto, tooltip nativo. */
export function Barras({ filas }: { filas: { etiqueta: string; valor: number; detalle?: string }[] }) {
  const max = Math.max(1, ...filas.map((f) => f.valor))
  return (
    <ul className="space-y-2">
      {filas.map((f) => (
        <li key={f.etiqueta} className="text-sm" title={`${f.etiqueta}: ${f.valor}${f.detalle ? ` · ${f.detalle}` : ''}`}>
          <div className="flex justify-between gap-2">
            <span className="truncate">{f.etiqueta}</span>
            <span className="tabular-nums text-stone-600">
              {f.valor}
              {f.detalle && <span className="ml-1 text-xs text-stone-400">{f.detalle}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-stone-100">
            <div className="h-2 rounded-r-[4px] rounded-l-full bg-oro-osc" style={{ width: `${(f.valor / max) * 100}%` }} />
          </div>
        </li>
      ))}
      {filas.length === 0 && <li className="text-sm text-stone-400">Sin datos aún.</li>}
    </ul>
  )
}

export function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={onCerrar}>
      <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3">
          <h2 className="font-medium">{titulo}</h2>
          <button onClick={onCerrar} className="text-xl leading-none text-stone-400 hover:text-stone-700" aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
