import { infoVerificacion, type Verificacion } from '@plastinex/shared'
import { BadgeCheck, Clock3, ShieldAlert } from 'lucide-react'

/** La insignia "verificada" solo aparece tras la revisión documental registrada en el panel. */
export function EstadoVerificacion({ v, compacto = false }: { v: Verificacion; compacto?: boolean }) {
  const info = infoVerificacion(v)
  const estilo =
    v === 'verificado'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : v === 'rechazado'
        ? 'bg-rose-50 text-rose-800 border-rose-200'
        : 'bg-arena/60 text-piedra border-arena'
  const Icono = v === 'verificado' ? BadgeCheck : v === 'rechazado' ? ShieldAlert : Clock3
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] ${estilo}`}>
      <Icono size={12} /> {compacto && v !== 'verificado' ? info.nombre : info.publico}
    </span>
  )
}

export function EtiquetaDemo() {
  return <span className="bg-oro/15 px-1.5 py-0.5 text-[10px] font-medium tracking-[0.15em] text-oro-osc">DEMO</span>
}
