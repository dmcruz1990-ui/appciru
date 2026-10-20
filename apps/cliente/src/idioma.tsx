import type { Categoria, Etapa, TipoAlojamiento, TipoInstitucion, Verificacion } from '@plastinex/shared'
import { etapas, infoVerificacion, nombreCategoria, nombrePais, nombreTipoAlojamiento, nombreTipoInstitucion } from '@plastinex/shared'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useCatalogo } from './catalogo'

export type Idioma = 'es' | 'en'
export type Moneda = 'COP' | 'USD'

const leer = (k: string) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const guardar = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    // Sin almacenamiento: la preferencia dura lo que dure la pestaña.
  }
}

const idiomaInicial = (): Idioma => {
  const v = leer('px-idioma')
  if (v === 'es' || v === 'en') return v
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en'
}
const monedaInicial = (): Moneda => {
  const v = leer('px-moneda')
  if (v === 'COP' || v === 'USD') return v
  // Quien navega desde Colombia ve pesos; el resto del mundo, dólares.
  return Intl.DateTimeFormat().resolvedOptions().timeZone === 'America/Bogota' ? 'COP' : 'USD'
}

const EN = {
  categoria: { mamaria: 'Breast surgery', corporal: 'Body contouring', facial: 'Facial surgery' } as Record<Categoria, string>,
  institucion: { clinica: 'Clinic', institucion: 'Medical center', consultorio: 'Practice' } as Record<TipoInstitucion, string>,
  alojamiento: { casa_recobro: 'Recovery house', hotel: 'Hotel', apartamento: 'Apartment' } as Record<TipoAlojamiento, string>,
  verificacion: {
    pendiente: 'Document check pending',
    en_revision: 'Document check in progress',
    verificado: 'Documents verified',
    rechazado: 'Not verified',
  } as Record<Verificacion, string>,
  etapa: {
    nueva: 'Request received',
    contactada: 'We contacted you',
    valoracion_agendada: 'Consultation scheduled',
    valorada: 'Consultation done',
    seguimiento: 'Follow-up',
    programada: 'Procedure scheduled',
    no_continua: 'Process closed',
  } as Record<Etapa, string>,
  pais: {
    CO: 'Colombia',
    US: 'United States',
    MX: 'Mexico',
    DO: 'Dominican Republic',
    CR: 'Costa Rica',
    PA: 'Panama',
    PE: 'Peru',
    BR: 'Brazil',
    AR: 'Argentina',
    ES: 'Spain',
    TR: 'Turkey',
    AE: 'United Arab Emirates',
    KR: 'South Korea',
    TH: 'Thailand',
  } as Record<string, string>,
}

/** Presupuestos sugeridos (en pesos) para cada moneda. */
const CHIPS: Record<Moneda, number[]> = {
  COP: [8, 10, 12, 15, 20, 30].map((m) => m * 1_000_000),
  USD: [2000, 3000, 4000, 5000, 7500, 10000],
}

function crear(idioma: Idioma, moneda: Moneda, tasa: number) {
  const locale = idioma === 'es' ? 'es-CO' : 'en-US'
  const enUsd = moneda === 'USD' && tasa > 0
  const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: enUsd ? 'USD' : 'COP', maximumFractionDigits: 0 })
  const fmtCorto = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: enUsd ? 'USD' : 'COP',
    notation: 'compact',
    maximumFractionDigits: 1,
  })
  // Los dólares se redondean a decenas: son equivalentes aproximados, no precios exactos.
  const convertir = (cop: number) => (enUsd ? Math.round(cop / tasa / 10) * 10 : cop)
  const tx = <T,>(es: T, en: T): T => (idioma === 'en' ? en : es)

  const dinero = (cop: number) => fmt.format(convertir(cop))
  const precio = (min: number | null, max: number | null) => {
    if (min == null && max == null) return tx('Precio no informado', 'Price not provided')
    if (min != null && max != null) return min === max ? dinero(min) : `${dinero(min)} – ${dinero(max)}`
    if (min != null) return `${tx('Desde', 'From')} ${dinero(min)}`
    return `${tx('Hasta', 'Up to')} ${dinero(max!)}`
  }
  const aFecha = (iso: string) => new Date(iso.length === 10 ? iso + 'T12:00:00' : iso)

  return {
    idioma,
    moneda: (enUsd ? 'USD' : 'COP') as Moneda,
    tasa,
    locale,
    tx,
    dinero,
    precio,
    /** Precio corto para marcadores del mapa: «$ 9,5 M» o «$2.4K». */
    corto: (cop: number | null | undefined) => (cop == null ? tx('Valorar', 'Ask') : fmtCorto.format(convertir(cop))),
    /** Valor de un campo en el idioma actual; si no hay traducción, el original en español. */
    loc: <O extends object>(obj: O, campo: keyof O & string): string => {
      const o = obj as Record<string, unknown>
      const en = o[`${campo}_en`]
      return (idioma === 'en' && typeof en === 'string' && en.trim() ? en : (o[campo] as string | null)) ?? ''
    },
    locLista: <O extends object>(obj: O, campo: keyof O & string): string[] => {
      const o = obj as Record<string, unknown>
      const en = o[`${campo}_en`]
      return idioma === 'en' && Array.isArray(en) && en.length ? (en as string[]) : ((o[campo] as string[] | null) ?? [])
    },
    fecha: (iso: string, opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) => aFecha(iso).toLocaleDateString(locale, opciones),
    fechaHora: (iso: string) => aFecha(iso).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    numero: (n: number) => n.toLocaleString(locale),
    categoria: (c: Categoria) => tx(nombreCategoria[c], EN.categoria[c]),
    tipoInstitucion: (t: TipoInstitucion) => tx(nombreTipoInstitucion[t], EN.institucion[t]),
    tipoAlojamiento: (t: TipoAlojamiento) => tx(nombreTipoAlojamiento[t], EN.alojamiento[t]),
    verificacion: (v: Verificacion) => tx(infoVerificacion(v).publico, EN.verificacion[v]),
    etapa: (e: Etapa) => tx(etapas.find((x) => x.id === e)?.paciente ?? e, EN.etapa[e]),
    pais: (codigo: string | null | undefined) => (idioma === 'en' && codigo && EN.pais[codigo] ? EN.pais[codigo] : nombrePais(codigo)),
    /** Presupuesto: de la moneda que ve la persona a pesos (para filtrar) y al revés (para mostrar el campo). */
    aCop: (valor: number) => (enUsd ? Math.round(valor * tasa) : valor),
    desdeCop: (cop: number) => (enUsd ? Math.round(cop / tasa) : cop),
    chipsPresupuesto: CHIPS[enUsd ? 'USD' : 'COP'].map((v) => ({
      cop: enUsd ? Math.round(v * tasa) : v,
      texto: enUsd ? `${(v / 1000).toLocaleString(locale)}K` : `${v / 1_000_000} M`,
    })),
  }
}

type Valor = ReturnType<typeof crear> & { setIdioma: (i: Idioma) => void; setMoneda: (m: Moneda) => void }
const Ctx = createContext<Valor | null>(null)

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const { datos } = useCatalogo()
  const [idioma, setIdiomaEstado] = useState<Idioma>(idiomaInicial)
  const [moneda, setMonedaEstado] = useState<Moneda>(monedaInicial)
  const tasa = datos?.ajustes?.tasa_usd_cop ?? 0

  useEffect(() => {
    document.documentElement.lang = idioma
  }, [idioma])

  const setIdioma = useCallback((i: Idioma) => (setIdiomaEstado(i), guardar('px-idioma', i)), [])
  const setMoneda = useCallback((m: Moneda) => (setMonedaEstado(m), guardar('px-moneda', m)), [])
  const valor = useMemo(() => ({ ...crear(idioma, moneda, tasa), setIdioma, setMoneda }), [idioma, moneda, tasa, setIdioma, setMoneda])
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useIdioma() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useIdioma fuera de IdiomaProvider')
  return v
}

/** Conmutadores ES | EN y COP | USD, en mayúsculas espaciadas como el resto de la cabecera. */
export function SelectorIdioma({ className = '' }: { className?: string }) {
  const { idioma, setIdioma, moneda, setMoneda, tasa, tx } = useIdioma()
  const boton = (activo: boolean) => `px-1 transition ${activo ? 'opacity-100 underline underline-offset-[6px]' : 'opacity-50 hover:opacity-100'}`
  return (
    <div className={`flex items-center gap-4 text-[11px] font-medium tracking-[0.2em] uppercase ${className}`}>
      <span className="flex items-center gap-1" role="group" aria-label={tx('Idioma', 'Language')}>
        <button onClick={() => setIdioma('es')} aria-pressed={idioma === 'es'} className={boton(idioma === 'es')} lang="es">
          ES
        </button>
        <span className="opacity-30">|</span>
        <button onClick={() => setIdioma('en')} aria-pressed={idioma === 'en'} className={boton(idioma === 'en')} lang="en">
          EN
        </button>
      </span>
      {tasa > 0 && (
        <span className="flex items-center gap-1" role="group" aria-label={tx('Moneda', 'Currency')}>
          <button onClick={() => setMoneda('COP')} aria-pressed={moneda === 'COP'} className={boton(moneda === 'COP')}>
            COP
          </button>
          <span className="opacity-30">|</span>
          <button onClick={() => setMoneda('USD')} aria-pressed={moneda === 'USD'} className={boton(moneda === 'USD')}>
            USD
          </button>
        </span>
      )}
    </div>
  )
}

/** Aviso corto que acompaña los valores en dólares. */
export function NotaMoneda({ className = '' }: { className?: string }) {
  const { moneda, tasa, tx, numero } = useIdioma()
  if (moneda !== 'USD') return null
  return (
    <p className={`text-xs text-piedra ${className}`}>
      {tx(
        `Valores en USD aproximados (1 USD ≈ ${numero(tasa)} COP). La clínica cotiza y cobra en su moneda.`,
        `USD amounts are approximate (1 USD ≈ ${numero(tasa)} COP). The clinic quotes and charges in its own currency.`,
      )}
    </p>
  )
}
