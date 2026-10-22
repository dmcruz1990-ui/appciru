import { planesMedico, type Plan, type PlanMedico } from '@plastinex/shared'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useIdioma } from '../idioma'

/** Los planes se cobran en dólares, para médicos de cualquier país. */
const usd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function usePlanes() {
  const [planes, setPlanes] = useState<PlanMedico[] | null>(null)
  useEffect(() => {
    planesMedico()
      .then(setPlanes)
      .catch(() => setPlanes([]))
  }, [])
  return planes
}

/**
 * Tarjetas de planes para médicos. Con `onElegir`, cada tarjeta tiene su botón (registro aprobado);
 * sin él, es la lista pública de precios de «Para clínicas».
 */
export default function Planes({
  planes,
  elegido,
  ocupado,
  onElegir,
  oscuro = false,
}: {
  planes: PlanMedico[]
  elegido?: Plan | null
  ocupado?: boolean
  onElegir?: (p: PlanMedico, intervalo: 'mes' | 'anio') => void
  oscuro?: boolean
}) {
  const { tx, loc, locLista } = useIdioma()
  const [intervalo, setIntervalo] = useState<'mes' | 'anio'>('mes')
  const hayAnual = planes.some((p) => p.precio_anual_usd != null)
  const borde = oscuro ? 'border-marfil/20' : 'border-linea'
  return (
    <div>
      {hayAnual && (
        <div className="mb-8 inline-flex border border-linea p-1 text-[11px] font-medium tracking-[0.18em] uppercase" role="group" aria-label={tx('Forma de pago', 'Billing')}>
          {(['mes', 'anio'] as const).map((i) => (
            <button key={i} type="button" aria-pressed={intervalo === i} onClick={() => setIntervalo(i)} className={`px-4 py-2 transition ${intervalo === i ? 'bg-espresso text-marfil' : ''}`}>
              {i === 'mes' ? tx('Mensual', 'Monthly') : tx('Anual', 'Yearly')}
            </button>
          ))}
        </div>
      )}
    <div className="grid gap-6 lg:grid-cols-3">
      {planes.map((p) => {
        const marcado = elegido === p.id
        const anual = intervalo === 'anio' && p.precio_anual_usd != null
        const precio = anual ? p.precio_anual_usd : p.precio_mensual_usd
        const conTarjeta = !!(anual ? p.stripe_price_anual : p.stripe_price_mensual)
        return (
          <article key={p.id} className={`relative flex flex-col border p-8 ${p.destacado || marcado ? (oscuro ? 'border-marfil' : 'border-espresso') : borde}`}>
            {p.destacado && (
              <span className={`absolute -top-3 left-8 px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase ${oscuro ? 'bg-marfil text-espresso' : 'bg-espresso text-marfil'}`}>
                {tx('Recomendado', 'Recommended')}
              </span>
            )}
            <h3 className="text-[15px] font-medium tracking-[0.14em] uppercase">{loc(p, 'nombre')}</h3>
            <p className={`mt-3 text-sm leading-relaxed ${oscuro ? 'text-marfil/70' : 'text-piedra'}`}>{loc(p, 'descripcion')}</p>
            <div className="mt-6">
              {precio != null ? (
                <>
                  <span className="display text-4xl">{usd(precio)}</span>
                  <span className={`ml-2 text-sm ${oscuro ? 'text-marfil/60' : 'text-piedra'}`}>{anual ? tx('al año', 'per year') : tx('al mes', 'per month')}</span>
                  {p.cuota_inicial_usd ? (
                    <div className={`mt-1 text-xs ${oscuro ? 'text-marfil/60' : 'text-piedra'}`}>
                      {tx(`+ ${usd(p.cuota_inicial_usd)} de activación`, `+ ${usd(p.cuota_inicial_usd)} setup`)}
                    </div>
                  ) : null}
                </>
              ) : (
                <span className="text-[15px]">{tx('Precio según tu ciudad: te enviamos la propuesta', 'Price depends on your city: we will send you a quote')}</span>
              )}
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {locLista(p, 'beneficios').map((b) => (
                <li key={b} className="flex gap-2.5">
                  <Check size={15} strokeWidth={1.8} className="mt-0.5 shrink-0" /> {b}
                </li>
              ))}
            </ul>
            {onElegir && (
              <button disabled={ocupado} onClick={() => onElegir(p, anual ? 'anio' : 'mes')} className={`mt-8 ${marcado || conTarjeta ? 'btn' : 'btn-linea'}`}>
                {conTarjeta ? tx('Suscribirme', 'Subscribe') : marcado ? tx('Plan elegido · pagar', 'Chosen plan · pay') : tx('Elegir este plan', 'Choose this plan')}
              </button>
            )}
          </article>
        )
      })}
    </div>
      <p className={`mt-6 text-xs ${oscuro ? 'text-marfil/50' : 'text-niebla'}`}>
        {tx(
          'Precios en dólares estadounidenses, sin impuestos. Renovación automática; puedes cambiar de plan o cancelar cuando quieras desde tu cuenta.',
          'Prices in US dollars, taxes not included. Renews automatically; you can change plans or cancel anytime from your account.',
        )}
      </p>
    </div>
  )
}
