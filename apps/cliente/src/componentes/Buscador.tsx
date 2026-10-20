import { destinos, formatoCOP, nombreCategoria, nombrePais, type Categoria } from '@plastinex/shared'
import { Gem, Globe, ScanFace, Search, Waves, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'

export const iconoCategoria: Record<Categoria, LucideIcon> = { mamaria: Gem, corporal: Waves, facial: ScanFace }

type Panel = 'proc' | 'ciudad' | 'fechas' | 'presu' | null

const DIA = 86_400_000
const iso = (d: Date) => d.toISOString().slice(0, 10)
export const nochesEntre = (a: string, b: string) => (a && b ? Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / DIA)) : 0)
const corta = (s: string) => (s ? new Date(s + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '')

/**
 * Buscador en píldora con paneles desplegables: procedimiento, ciudad, fechas del viaje y presupuesto.
 * Lleva a /explorar con los filtros en la URL, así la búsqueda se puede compartir.
 */
export default function Buscador({ className = '', destino = '/explorar', arriba = false }: { className?: string; destino?: string; /** Abre los paneles hacia arriba (portada). */ arriba?: boolean }) {
  const { datos } = useCatalogo()
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
  const textoLugar = c ? `${c.nombre}, ${nombrePais(c.pais)}` : pais ? nombrePais(pais) : 'Todo el mundo'
  const elegirLugar = (nuevoPais: string, nuevaCiudad: string) => {
    setPais(nuevoPais)
    setCiudad(nuevaCiudad)
    setFiltroLugar('')
    setPanel('fechas')
  }
  const sinTildes = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const q = sinTildes(filtroLugar.trim())
  const visibles = lugares
    .map((d) => ({ ...d, ciudades: q && !sinTildes(d.nombre).includes(q) ? d.ciudades.filter((x) => sinTildes(x.ciudad.nombre).includes(q)) : d.ciudades }))
    .filter((d) => d.ciudades.length > 0)
  const noches = nochesEntre(llegada, salida)
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
            <span className="block truncate text-[14px] font-medium">{p?.nombre ?? '¿Qué procedimiento buscas?'}</span>
            <span className="block truncate text-xs text-piedra">
              {[textoLugar, llegada ? `${corta(llegada)}${salida && noches ? ` – ${corta(salida)}` : ''}` : 'Fechas flexibles', presu ? formatoCOP(Number(presu)) : 'Sin presupuesto'].join(' · ')}
            </span>
          </span>
        </button>
      )}
      <div className={`${desplegado ? 'flex' : 'hidden md:flex'} flex-col border border-linea bg-marfil shadow-[0_10px_40px_rgba(0,0,0,0.12)] md:flex-row md:items-stretch`}>
        <Segmento t="Procedimiento" v={p?.nombre ?? 'Todos'} activo={panel === 'proc'} onClick={() => alternar('proc')} ancho />
        <Segmento t="Dónde" v={textoLugar} activo={panel === 'ciudad'} onClick={() => alternar('ciudad')} />
        <Segmento
          t="Fechas del viaje"
          v={llegada ? `${corta(llegada)}${salida && noches ? ` – ${corta(salida)}` : ''}` : 'Agregar fechas'}
          activo={panel === 'fechas'}
          onClick={() => alternar('fechas')}
          tenue={!llegada}
        />
        <Segmento t="Presupuesto" v={presu ? formatoCOP(Number(presu)) : 'Opcional'} activo={panel === 'presu'} onClick={() => alternar('presu')} tenue={!presu} />
        <button className="m-1.5 flex items-center justify-center gap-2 bg-espresso px-6 py-4 text-[11px] font-medium tracking-[0.22em] text-marfil uppercase transition hover:bg-tinta/85">
          <Search size={15} strokeWidth={1.8} /> Buscar
        </button>
      </div>

      {panel && (
        <div data-lenis-prevent className={`z-40 mt-2 max-h-[70vh] overflow-y-auto border border-linea bg-marfil p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] md:absolute md:inset-x-0 md:p-8 ${arriba ? 'md:bottom-full md:mb-3 md:max-h-[min(60vh,520px)]' : 'md:top-full md:mt-3'}`}>
          {panel === 'proc' && (
            <div className="grid gap-8 md:grid-cols-3">
              {(Object.keys(nombreCategoria) as Categoria[]).map((cat) => {
                const I = iconoCategoria[cat]
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-piedra uppercase">
                      <I size={15} strokeWidth={1.5} /> {nombreCategoria[cat]}
                    </div>
                    <ul className="mt-3">
                      {datos.procedimientos
                        .filter((x) => x.categoria === cat)
                        .map((x) => (
                          <li key={x.id}>
                            <Opcion activo={proc === x.id} onClick={() => (setProc(x.id), elegir('ciudad'))}>
                              {x.nombre}
                            </Opcion>
                          </li>
                        ))}
                    </ul>
                  </div>
                )
              })}
              <div className="md:col-span-3">
                <Opcion activo={!proc} onClick={() => (setProc(''), elegir('ciudad'))}>
                  Todos los procedimientos
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
                  placeholder="Buscar país o ciudad"
                  aria-label="Buscar país o ciudad"
                  className="w-full bg-transparent py-1 text-[16px] outline-none placeholder:text-niebla"
                />
              </label>
              {!q && (
                <Opcion activo={!pais && !ciudad} onClick={() => elegirLugar('', '')}>
                  <span className="flex items-center gap-2 !text-current">
                    <Globe size={16} strokeWidth={1.5} /> Todo el mundo
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
                      <span className="text-[11px] font-medium tracking-[0.2em] uppercase">{d.nombre}</span>
                      <span className="text-[11px] text-piedra">{d.opciones ? `${d.opciones} ${d.opciones === 1 ? 'opción' : 'opciones'}` : 'Próximamente'}</span>
                    </button>
                    <ul className="mt-1">
                      {d.ciudades.map(({ ciudad: x, opciones }) => (
                        <li key={x.id}>
                          <Opcion activo={ciudad === x.id} onClick={() => elegirLugar(d.pais, x.id)}>
                            <span className="flex items-baseline justify-between gap-3 !text-current">
                              <span>{x.nombre}</span>
                              <span className={`text-xs ${ciudad === x.id ? 'text-marfil/70' : opciones ? 'text-piedra' : 'text-niebla'}`}>
                                {opciones ? opciones : 'Próximamente'}
                              </span>
                            </span>
                          </Opcion>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {visibles.length === 0 && <p className="mt-6 text-sm text-piedra">Aún no tenemos ese destino. Escríbenos y te orientamos.</p>}
            </div>
          )}

          {panel === 'fechas' && (
            <div>
              <p className="text-sm text-piedra">
                Si viajas para tu procedimiento, indica cuándo llegas y cuándo te vas. Con eso calculamos las noches de recuperación.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label>
                  <span className="etiqueta">Llegada</span>
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
                  <span className="etiqueta">Salida</span>
                  <input type="date" min={llegada || minLlegada} value={salida} onChange={(e) => setSalida(e.target.value)} className="campo" />
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm">{noches ? `${noches} ${noches === 1 ? 'noche' : 'noches'}` : 'Sin fechas: mis fechas son flexibles'}</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => (setLlegada(''), setSalida(''))} className="enlace text-sm text-piedra">
                    Borrar
                  </button>
                  <button type="button" onClick={() => elegir('presu')} className="btn-linea">
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}

          {panel === 'presu' && (
            <div>
              <p className="text-sm text-piedra">Tu presupuesto total en pesos colombianos. Te mostramos primero lo que encaja.</p>
              <div className="mt-5 flex items-center gap-2 border-b border-espresso pb-2 text-2xl">
                <span className="text-piedra">$</span>
                <input
                  inputMode="numeric"
                  autoFocus
                  value={presu ? Number(presu).toLocaleString('es-CO') : ''}
                  onChange={(e) => setPresu(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="15.000.000"
                  aria-label="Presupuesto en pesos"
                  className="w-full bg-transparent font-light outline-none placeholder:text-niebla"
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {[8, 10, 12, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPresu(String(m * 1_000_000))}
                    className={`border px-3.5 py-1.5 text-xs transition ${presu === String(m * 1_000_000) ? 'border-espresso bg-espresso text-marfil' : 'border-linea text-piedra hover:border-espresso'}`}
                  >
                    {m} M
                  </button>
                ))}
                {presu && (
                  <button type="button" onClick={() => setPresu('')} className="enlace ml-2 text-xs text-piedra">
                    Sin presupuesto
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
