import { SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { nombreCategoria } from '../../shared/format'
import { ofertasPublicas } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import type { Categoria } from '../../shared/types'
import OfertaCard from '../components/OfertaCard'

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Buscar() {
  const db = useDB()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const ciudad = params.get('ciudad') ?? ''
  const categoria = (params.get('categoria') ?? '') as Categoria | ''
  const procedimiento = params.get('procedimiento') ?? ''
  const precioMax = Number(params.get('precioMax') ?? 0)
  const soloVirtual = params.get('virtual') === '1'
  const soloAcreditadas = params.get('acreditada') === '1'
  const orden = params.get('orden') ?? 'relevancia'

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p)
  }

  const terminos = normalizar(q).split(/\s+/).filter(Boolean)
  let resultados = ofertasPublicas(db).filter((d) => {
    if (ciudad && d.ciudad.id !== ciudad) return false
    if (categoria && d.procedimiento.categoria !== categoria) return false
    if (procedimiento && d.procedimiento.id !== procedimiento) return false
    if (precioMax && d.oferta.precio > precioMax) return false
    if (soloVirtual && !d.medico.valoracionVirtual) return false
    if (soloAcreditadas && !d.clinica.acreditadaICONTEC) return false
    if (terminos.length) {
      const texto = normalizar(
        [d.procedimiento.nombre, d.procedimiento.descripcion, d.medico.nombre, d.medico.especialidad, d.clinica.nombre, d.ciudad.nombre].join(' '),
      )
      if (!terminos.every((t) => texto.includes(t))) return false
    }
    return true
  })

  resultados = [...resultados].sort((a, b) => {
    if (orden === 'precio_asc') return a.oferta.precio - b.oferta.precio
    if (orden === 'precio_desc') return b.oferta.precio - a.oferta.precio
    if (orden === 'calificacion') return b.medico.calificacion - a.medico.calificacion
    return b.medico.resenas - a.medico.resenas
  })

  const procsVisibles = db.procedimientos.filter((p) => p.activo && (!categoria || p.categoria === categoria))

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
      <aside className="space-y-5 text-sm">
        <div className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal size={16} /> Filtros
        </div>
        <Filtro titulo="Categoría">
          <Opcion activo={!categoria} onClick={() => set('categoria', '')}>
            Todas
          </Opcion>
          {(Object.keys(nombreCategoria) as Categoria[]).map((c) => (
            <Opcion key={c} activo={categoria === c} onClick={() => set('categoria', c)}>
              {nombreCategoria[c]}
            </Opcion>
          ))}
        </Filtro>
        <Filtro titulo="Procedimiento">
          <select value={procedimiento} onChange={(e) => set('procedimiento', e.target.value)} className="w-full rounded border border-slate-300 bg-white p-1.5">
            <option value="">Todos</option>
            {procsVisibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Filtro>
        <Filtro titulo="Ciudad">
          <select value={ciudad} onChange={(e) => set('ciudad', e.target.value)} className="w-full rounded border border-slate-300 bg-white p-1.5">
            <option value="">Toda Colombia</option>
            {db.ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Filtro>
        <Filtro titulo="Precio máximo">
          {[8_000_000, 12_000_000, 16_000_000, 25_000_000].map((v) => (
            <Opcion key={v} activo={precioMax === v} onClick={() => set('precioMax', precioMax === v ? '' : String(v))}>
              Hasta ${(v / 1_000_000).toFixed(0)} M
            </Opcion>
          ))}
        </Filtro>
        <Filtro titulo="Más opciones">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={soloVirtual} onChange={(e) => set('virtual', e.target.checked ? '1' : '')} />
            Valoración virtual
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={soloAcreditadas} onChange={(e) => set('acreditada', e.target.checked ? '1' : '')} />
            Clínica acreditada
          </label>
        </Filtro>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{resultados.length}</span> resultados
            {q && (
              <>
                {' '}
                para <span className="font-semibold text-slate-900">“{q}”</span>
              </>
            )}
          </div>
          <select value={orden} onChange={(e) => set('orden', e.target.value)} className="rounded border border-slate-300 bg-white p-1.5 text-sm">
            <option value="relevancia">Más populares</option>
            <option value="calificacion">Mejor calificados</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
          </select>
        </div>
        {resultados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No encontramos planes con esos filtros. Prueba quitando alguno.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resultados.map((d) => (
              <OfertaCard key={d.oferta.id} d={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Filtro({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-semibold text-slate-700">{titulo}</div>
      <div className="flex flex-col items-start gap-1">{children}</div>
    </div>
  )
}

function Opcion({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`text-left hover:text-brand-700 ${activo ? 'font-semibold text-brand-700' : 'text-slate-600'}`}>
      {children}
    </button>
  )
}
