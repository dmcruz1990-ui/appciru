import type { Verificacion } from '@plastinex/shared'
import { useIdioma } from '../idioma'

/** La marca "verificada" solo aparece tras la revisión documental registrada en el panel. */
export function EstadoVerificacion({ v, claro = false }: { v: Verificacion; claro?: boolean }) {
  const { verificacion } = useIdioma()
  const punto = v === 'verificado' ? 'bg-salvia' : v === 'rechazado' ? 'bg-red-700' : 'bg-niebla'
  return (
    <span className={`inline-flex items-center gap-2 text-xs ${claro ? 'text-marfil/80' : 'text-piedra'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${punto}`} />
      {verificacion(v)}
    </span>
  )
}

export function EtiquetaDemo({ claro = false }: { claro?: boolean }) {
  const { tx } = useIdioma()
  return (
    <span
      className={`px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase backdrop-blur ${claro ? 'bg-black/25 text-white' : 'bg-espresso/5 text-piedra'}`}
    >
      {tx('Perfil demo', 'Demo profile')}
    </span>
  )
}
