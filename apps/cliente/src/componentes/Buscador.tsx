import { destinos, type Categoria } from '@plastinex/shared'
import { Gem, Globe, ScanFace, Search, Waves, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { useIdioma } from '../idioma'

export const iconoCategoria: Record<Categoria, LucideIcon> = { mamaria: Gem, corporal: Waves, facial: ScanFace }

type Panel = 'proc' | 'ciudad' | 'fechas' | 'presu' | null

const DIA = 86_400_000
const iso = (d: Date) => d.toISOString().slice(0, 10)
export const nochesEntre = (a: string, b: string) => (a && b ? Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / DIA)) : 0)

/**
 * Buscador en píldora con paneles desplegables: procedimiento, ciudad, fechas del viaje y presupuesto.
 * Lleva a /explorar con los filtros en la URL, así la búsqueda se puede compartir.
 */
export default function Buscador({ className = '', destino = '/explorar', arriba = false }: { className?: string; destino?: string; /** Abre los paneles hacia arriba (portada). */ arriba?: boolean }) {
  const { datos } = useCatalogo()
  const { tx, dinero, loc, categoria, fecha, numero, pais: nombrePais, desdeCop, aCop, chipsPresupuesto, moneda } = useIdioma()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const raiz = useRef<HTMLFormElement>(null)
  const [panel, setPanel] = useState<Panel>(null)
  // En celular el buscador empieza plegado en una píldora, como en las apps de reservas.
  const [desplegado, setDesplegado] = useState(false)
  const [proc, setProc] = useState(params.get('procedimiento') ?? '')
  const [ciudad, setCiudad] = useState(params.get('ciudad') ?? '')
  const [pais, setPais] = useState(params.get('pais') ?? '')
  const [filtroLugar, setFiltroLugar] = useState('')
  const [llegada, setLlegada] = useState(params.get('llegada') ?? '')
  const [salida, setSalida] = useState(params.get('salida') ?? '')
  const [presu, setPresu] = useState(params.get('presupuesto') ?? '')

  useEffect(() => {
    if (!panel) return
    const fuera = (e: MouseEvent) => raiz.current && !raiz.current.contains(e.target as Node) && setPanel(null)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [panel])

  const lugares = useMemo(() => (datos ? destinos(datos) : []), [datos])
  if (!datos) return null
  const p = datos.procedimientos.find((x) => x.id === proc)
  const c = datos.ciudades.find((x) => x.id === ciudad)
  const noches = nochesEntre(llegada, salida)
  const corta = (s: string) => (s ? fecha(s, { day: 'numeric', month: 'short' }) : '')
  const textoProc = p ? loc(p, 'nombre') : null
  const textoLugar = c ? `${c.nombre}, ${nombrePais(c.pais)}` : pais ? nombrePais(pais) : tx('Todo el mundo', 'Anywhere')
  const textoFechas = llegada ? `${corta(llegada)}${salida && noches ? ` – ${corta(salida)}` : ''}` : null
  const elegirLugar = (nuevoPais: string, nuevaCiudad: string) => {
    setPais(nuevoPais)
    setCiudad(nuevaCiudad)
    setFiltroLugar('')
    setPanel('fechas')
  }
  const sinTildes = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const q = sinTildes(filtroLugar.trim())
  const visibles = lugares
    .map((d) => ({ ...d, ciudades: q && !sinTildes(`${d.nombre} ${nombrePais(d.pais)}`).includes(q) ? d.ciudades.filter((x) => sinTildes(x.ciudad.nombre).includes(q)) : d.ciudades }))
    .filter((d) => d.ciudades.length > 0)
  const minLlegada = iso(new Date(Date.now() + 7 * DIA))

  const enviar = (e?: FormEvent) => {
    e?.preventDefault()
    const q = new URLSearchParams()
    if (proc) q.set('procedimiento', proc)
    if (ciudad) q.set('ciudad', ciudad)
    else if (pais) q.set('pais', pais)
    if (llegada) q.set('llegada', llegada)
    if (salida && noches > 0) q.set('salida', salida)
    if (presu) q.set('presupuesto', presu)
    setPanel(null)
    navigate(`${destino}?${q}`)
  }
  const elegir = (sig: Panel) => setPanel(sig)
  const alternar = (x: Panel) => setPanel((v) => (v === x ? null : x))

  return (
    <form ref={raiz} onSubmit={enviar} className={`relative w-full text-left text-espresso ${className}`}>
      {!desplegado && (
        <button
          type="button"
          onClick={() => setDesplegado(true)}
          className="flex w-full items-center gap-4 border border-linea bg-marfil px-5 py-3.5 text-left shadow-[0_10px_40px_rgba(0,0,0,0.12)] md:hidden"
        >
          <Search size={18} strokeWidth={1.6} className="shrink-0" />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium">{textoProc ?? tx('¿Qué procedimiento buscas?', 'Which procedure are you looking for?')}</span>
            <span className="block truncate text-xs text-piedra">
              {[textoLugar, textoFechas ?? tx('Fechas flexibles', 'Flexible dates'), presu ? dinero(Number(presu)) : tx('Sin presupuesto', 'Any budget')].join(' · ')}
            </span>
          </span>
        </button>
      )}
      <div className={`${desplegado ? 'flex' : 'hidden md:flex'} flex-col border border-linea bg-marfil shadow-[0_10px_40px_rgba(0,0,0,0.12)] md:flex-row md:items-stretch`}>
        <Segmento t={tx('Procedimiento', 'Procedure')} v={textoProc ?? tx('Todos', 'All')} activo={panel === 'proc'} onClick={() => alternar('proc')} ancho />
        <Segmento t={tx('Dónde', 'Where')} v={textoLugar} activo={panel === 'ciudad'} onClick={() => alternar('ciudad')} />
        <Segmento
          t={tx('Fechas del viaje', 'Travel dates')}
          v={textoFechas ?? tx('Agregar fechas', 'Add dates')}
          activo={panel === 'fechas'}
          onClick={() => alternar('fechas')}
          tenue={!llegada}
        />
        <Segmento t={tx('Presupuesto', 'Budget')} v={presu ? dinero(Number(presu)) : tx('Opcional', 'Optional')} activo={panel === 'presu'} onClick={() => alternar('presu')} tenue={!presu} />
        <button className="m-1.5 flex items-center justify-center gap-2 bg-espresso px-6 py-4 text-[11px] font-medium tracking-[0.22em] text-marfil uppercase transition hover:bg-tinta/85">
          <Search size={15} strokeWidth={1.8} /> {tx('Buscar', 'Search')}
        </button>
      </div>

      {panel && (
        <div data-lenis-prevent className={`z-40 mt-2 max-h-[70vh] overflow-y-auto border border-linea bg-marfil p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:absolute md:inset-x-0 md:p-8 ${arriba ? 'md:bottom-full md:mb-3 md:max-h-[min(60vh,520px)]' : 'md:top-full md:mt-3'}`}>
          {panel === 'proc' && (
            <div className="grid gap-8 md:grid-cols-3">
              {(Object.keys(iconoCategoria) as Categoria[]).map((cat) => {
                const I = iconoCategoria[cat]
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-piedra uppercase">
                      <I size={15} strokeWidth={1.5} /> {categoria(cat)}
                    </div>
                    <ul className="mt-3">
                      {datos.procedimientos
                        .filter((x) => x.categoria === cat)
                        .map((x) => (
                          <li key={x.id}>
                            <Opcion activo={proc === x.id} onClick={() => (setProc(x.id), elegir('ciudad'))}>
                              {loc(x, 'nombre')}
                            </Opcion>
                          </li>
                        ))}
                    </ul>
                  </div>
                )
              })}
              <div className="md:col-span-3">
                <Opcion activo={!proc} onClick={() => (setProc(''), elegir('ciudad'))}>
                  {tx('Todos los procedimientos', 'All procedures')}
                </Opcion>
              </div>
            </div>
          )}

          {panel === 'ciudad' && (
            <div>
              <label className="flex items-center gap-3 border-b border-espresso pb-2">
                <Search size={16} strokeWidth={1.6} className="text-piedra" />
                <input
                  autoFocus
                  value={filtroLugar}
                  onChange={(e) => setFiltroLugar(e.target.value)}
                  placeholder={tx('Buscar país o ciudad', 'Search country or city')}
                  aria-label={tx('Buscar país o ciudad', 'Search country or city')}
                  className="w-full bg-transparent py-1 text-[16px] outline-none placeholder:text-niebla"
                />
              </label>
              {!q && (
                <Opcion activo={!pais && !ciudad} onClick={() => elegirLugar('', '')}>
                  <span className="flex items-center gap-2 !text-current">
                    <Globe size={16} strokeWidth={1.5} /> {tx('Todo el mundo', 'Anywhere')}
                  </span>
                </Opcion>
              )}
              <div className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibles.map((d) => (
                  <div key={d.pais}>
                    <button
                      type="button"
                      onClick={() => elegirLugar(d.pais, '')}
                      className={`flex w-full items-baseline justify-between gap-3 border-b px-3 pb-2 text-left transition ${pais === d.pais && !ciudad ? 'border-espresso' : 'border-linea hover:border-espresso'}`}
                    >
                      <span className="text-[11px] font-medium tracking-[0.2em] uppercase">{nombrePais(d.pais)}</span>
                      <span className="text-[11px] text-piedra">{d.opciones
                          ? tx(`${d.opciones} ${d.opciones === 1 ? 'opción' : 'opciones'}`, `${d.opciones} ${d.opciones === 1 ? 'option' : 'options'}`)
                          : tx('Próximamente', 'Coming soon')}</span>
                    </button>
                    <ul className="mt-1">
                      {d.ciudades.map(({ ciudad: x, opciones }) => (
                        <li key={x.id}>
                          <Opcion activo={ciudad === x.id} onClick={() => elegirLugar(d.pais, x.id)}>
                            <span className="flex items-baseline justify-between gap-3 !text-current">
                              <span>{x.nombre}</span>
                              <span className={`text-xs ${ciudad === x.id ? 'text-marfil/70' : opciones ? 'text-piedra' : 'text-niebla'}`}>
                                {opciones ? opciones : tx('Próximamente', 'Coming soon')}
                              </span>
                            </span>
                          </Opcion>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {visibles.length === 0 && <p className="mt-6 text-sm text-piedra">{tx('Aún no tenemos ese destino. Escríbenos y te orientamos.', 'We don’t cover that destination yet. Write to us and we’ll point you in the right direction.')}</p>}
            </div>
          )}

          {panel === 'fechas' && (
            <div>
              <p className="text-sm text-piedra">
                {tx(
                  'Si viajas para tu procedimiento, indica cuándo llegas y cuándo te vas. Con eso calculamos las noches de recuperación.',
                  'If you’re traveling for your procedure, tell us when you arrive and when you leave. We’ll use that to calculate your recovery nights.',
                )}
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label>
                  <span className="etiqueta">{tx('Llegada', 'Check-in')}</span>
                  <input
                    type="date"
                    min={minLlegada}
                    value={llegada}
                    onChange={(e) => {
                      setLlegada(e.target.value)
                      if (salida && e.target.value >= salida) setSalida('')
                    }}
                    className="campo"
                  />
                </label>
                <label>
                  <span className="etiqueta">{tx('Salida', 'Check-out')}</span>
                  <input type="date" min={llegada || minLlegada} value={salida} onChange={(e) => setSalida(e.target.value)} className="campo" />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm">{noches
                    ? tx(`${noches} ${noches === 1 ? 'noche' : 'noches'}`, `${noches} ${noches === 1 ? 'night' : 'nights'}`)
                    : tx('Sin fechas: mis fechas son flexibles', 'No dates: my dates are flexible')}</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => (setLlegada(''), setSalida(''))} className="enlace text-sm text-piedra">
                    {tx('Borrar', 'Clear')}
                  </button>
                  <button type="button" onClick={() => elegir('presu')} className="btn-linea">
                    {tx('Siguiente', 'Next')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {panel === 'presu' && (
            <div>
              <p className="text-sm text-piedra">
                {moneda === 'USD'
                  ? tx('Tu presupuesto total en dólares, aproximado. Te mostramos primero lo que encaja.', 'Your approximate total budget in US dollars. We’ll show you what fits first.')
                  : tx('Tu presupuesto total en pesos colombianos. Te mostramos primero lo que encaja.', 'Your total budget in Colombian pesos. We’ll show you what fits first.')}
              </p>
              <div className="mt-5 flex items-center gap-2 border-b border-espresso pb-2 text-2xl">
                {/* El campo muestra la moneda de la persona; la URL y los filtros siguen en pesos. */}
                <span className="text-piedra">$</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  value={presu ? numero(desdeCop(Number(presu))) : ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPresu(v ? String(aCop(Number(v))) : '')
                  }}
                  placeholder={numero(moneda === 'USD' ? 4000 : 15_000_000)}
                  aria-label={moneda === 'USD' ? tx('Presupuesto en dólares', 'Budget in US dollars') : tx('Presupuesto en pesos', 'Budget in Colombian pesos')}
                  className="w-full bg-transparent font-light outline-none placeholder:text-niebla"
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {chipsPresupuesto.map(({ cop, texto }) => (
                  <button
                    key={cop}
                    type="button"
                    onClick={() => setPresu(String(cop))}
                    className={`border px-3.5 py-1.5 text-xs transition ${presu === String(cop) ? 'border-espresso bg-espresso text-marfil' : 'border-linea text-piedra hover:border-espresso'}`}
                  >
                    {texto}
                  </button>
                ))}
                {presu && (
                  <button type="button" onClick={() => setPresu('')} className="enlace ml-2 text-xs text-piedra">
                    {tx('Sin presupuesto', 'No budget')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

function Segmento({ t, v, activo, onClick, ancho = false, tenue = false }: { t: string; v: string; activo: boolean; onClick: () => void; ancho?: boolean; tenue?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={activo}
      className={`min-w-0 border-b border-linea px-5 py-3 text-left transition last:border-0 md:border-r md:border-b-0 md:py-3.5 ${ancho ? 'md:flex-[1.4]' : 'md:flex-1'} ${activo ? 'bg-arena' : 'hover:bg-papel'}`}
    >
      <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{t}</span>
      <span className={`mt-0.5 block truncate text-[14px] ${tenue ? 'text-niebla' : ''}`}>{v}</span>
    </button>
  )
}

function Opcion({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`w-full px-3 py-2.5 text-left text-[15px] transition ${activo ? 'bg-espresso text-marfil [&_span]:text-marfil/70' : 'hover:bg-arena'}`}>
      {children}
    </button>
  )
}
