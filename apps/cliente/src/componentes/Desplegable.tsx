import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sinTildes } from '../busqueda'
import { useIdioma } from '../idioma'

export interface OpcionDesplegable {
  v: string
  t: string
  /** Encabezado del grupo (p. ej. el país de una ciudad). */
  grupo?: string
}

/**
 * Selector propio en lugar del <select> nativo: en el celular la lista se abre debajo, dentro de la página
 * (sin la ventana del sistema encima); en pantallas grandes, como un panel flotante bajo el campo.
 */
export default function Desplegable({
  etiqueta,
  valor,
  opciones,
  todas,
  onCambio,
  buscar = false,
}: {
  etiqueta: string
  valor: string
  opciones: OpcionDesplegable[]
  /** Texto de la opción vacía («Todos los países»). */
  todas: string
  onCambio: (v: string) => void
  /** Campo para filtrar listas largas (países, ciudades). */
  buscar?: boolean
}) {
  const { tx } = useIdioma()
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const raiz = useRef<HTMLDivElement>(null)
  const actual = opciones.find((o) => o.v === valor)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => raiz.current && !raiz.current.contains(e.target as Node) && setAbierto(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  const elegir = (v: string) => {
    onCambio(v)
    setAbierto(false)
    setFiltro('')
  }
  const q = sinTildes(filtro.trim())
  const visibles = q ? opciones.filter((o) => sinTildes(`${o.t} ${o.grupo ?? ''}`).includes(q)) : opciones

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((x) => !x)}
        aria-expanded={abierto}
        className="flex w-full items-center justify-between gap-3 border-b border-linea py-2.5 text-left text-[15px]"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{etiqueta}</span>
          <span className="block truncate">{actual?.t ?? todas}</span>
        </span>
        <ChevronDown size={16} strokeWidth={1.6} className={`shrink-0 transition ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div
          data-lenis-prevent
          className="z-30 mt-2 border border-linea bg-marfil lg:absolute lg:inset-x-0 lg:top-full lg:min-w-[260px] lg:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
        >
          {buscar && (
            <label className="flex items-center gap-2 border-b border-linea px-3 py-2">
              <Search size={14} strokeWidth={1.6} className="text-piedra" />
              <input
                autoFocus
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder={tx('Buscar', 'Search')}
                aria-label={tx(`Buscar ${etiqueta.toLowerCase()}`, `Search ${etiqueta.toLowerCase()}`)}
                className="w-full bg-transparent py-1 text-[16px] outline-none placeholder:text-niebla"
              />
            </label>
          )}
          <ul className="max-h-72 overflow-y-auto py-1" role="listbox" aria-label={etiqueta}>
            {!q && <Opcion activa={!valor} onClick={() => elegir('')} texto={todas} />}
            {visibles.map((o, k) => (
              <li key={o.v} role="presentation">
                {o.grupo && o.grupo !== visibles[k - 1]?.grupo && (
                  <div className="px-4 pt-3 pb-1 text-[10px] font-medium tracking-[0.2em] text-piedra uppercase">{o.grupo}</div>
                )}
                <Opcion activa={o.v === valor} onClick={() => elegir(o.v)} texto={o.t} />
              </li>
            ))}
            {visibles.length === 0 && <li className="px-4 py-3 text-sm text-niebla">{tx('Sin coincidencias', 'No matches')}</li>}
          </ul>
        </div>
      )}
    </div>
  )
}

function Opcion({ activa, onClick, texto }: { activa: boolean; onClick: () => void; texto: string }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={activa}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[15px] transition ${activa ? 'bg-espresso text-marfil' : 'hover:bg-arena'}`}
    >
      {texto}
      {activa && <Check size={15} strokeWidth={1.8} className="shrink-0" />}
    </button>
  )
}
