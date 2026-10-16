import { detallarOfertas, nombreCategoria, type Categoria } from '@plastinex/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Revelar } from '../componentes/base'
import OfertaCard from '../componentes/OfertaCard'

export default function Explorar() {
  const { datos } = useCatalogo()
  const [params, setParams] = useSearchParams()
  if (!datos) return null

  const procedimiento = params.get('procedimiento') ?? ''
  const ciudad = params.get('ciudad') ?? ''
  const categoria = (params.get('categoria') ?? '') as Categoria | ''
  const precio = params.get('precio') ?? ''
  const verificadas = params.get('verificadas') === '1'
  const orden = params.get('orden') ?? 'relevancia'

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    if (k === 'categoria') p.delete('procedimiento')
    setParams(p, { replace: true })
  }

  let lista = detallarOfertas(datos).filter((d) => {
    const conPrecio = d.oferta.precio_min != null || d.oferta.precio_max != null
    if (procedimiento && d.procedimiento.id !== procedimiento) return false
    if (categoria && d.procedimiento.categoria !== categoria) return false
    if (ciudad && d.ciudad.id !== ciudad) return false
    if (precio === 'con' && !conPrecio) return false
    if (precio === 'sin' && conPrecio) return false
    if (verificadas && d.institucion.verificacion !== 'verificado') return false
    return true
  })
  lista = [...lista].sort((a, b) => {
    if (orden === 'nombre') return a.procedimiento.nombre.localeCompare(b.procedimiento.nombre, 'es')
    if (orden === 'precio') return (a.oferta.precio_min ?? Infinity) - (b.oferta.precio_min ?? Infinity)
    return Number(b.institucion.verificacion === 'verificado') - Number(a.institucion.verificacion === 'verificado')
  })

  const procs = datos.procedimientos.filter((p) => !categoria || p.categoria === categoria)
  const activos = [procedimiento, ciudad, categoria, precio, verificadas ? '1' : ''].filter(Boolean).length

  return (
    <div className="contenedor pt-36 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="display text-6xl md:text-8xl">
          Procedimientos <em>y opciones</em>
        </h1>
        <p className="max-w-xs text-sm text-piedra">Perfiles de demostración. Los precios son rangos informados por cada prestador.</p>
      </div>

      <div className="mt-14 flex gap-8 overflow-x-auto border-b border-linea text-sm whitespace-nowrap">
        {[['', 'Todas'], ...Object.entries(nombreCategoria)].map(([id, t]) => (
          <button
            key={id}
            onClick={() => set('categoria', id)}
            className={`-mb-px border-b pb-4 transition ${categoria === id ? 'border-espresso text-espresso' : 'border-transparent text-piedra hover:text-espresso'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
        <Filtro valor={procedimiento} onChange={(v) => set('procedimiento', v)} opciones={[['', 'Todo procedimiento'], ...procs.map((p) => [p.id, p.nombre] as [string, string])]} />
        <Filtro valor={ciudad} onChange={(v) => set('ciudad', v)} opciones={[['', 'Toda la región'], ...datos.ciudades.map((c) => [c.id, c.nombre] as [string, string])]} />
        <Filtro valor={precio} onChange={(v) => set('precio', v)} opciones={[['', 'Cualquier precio'], ['con', 'Con rango orientativo'], ['sin', 'Sin precio informado']]} />
        <label className="flex cursor-pointer items-center gap-2 text-piedra">
          <input type="checkbox" checked={verificadas} onChange={(e) => set('verificadas', e.target.checked ? '1' : '')} className="accent-espresso" />
          Solo verificadas
        </label>
        <div className="ml-auto flex items-center gap-6">
          {activos > 0 && (
            <button onClick={() => setParams({}, { replace: true })} className="enlace text-piedra">
              Limpiar filtros
            </button>
          )}
          <Filtro valor={orden} onChange={(v) => set('orden', v)} opciones={[['relevancia', 'Relevancia'], ['precio', 'Precio menor'], ['nombre', 'Nombre']]} />
        </div>
      </div>

      <div className="mt-6 text-sm text-piedra">{lista.length} opciones</div>

      {lista.length ? (
        <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((d, i) => (
            <Revelar key={d.oferta.id} retraso={(i % 3) * 0.06}>
              <OfertaCard d={d} />
            </Revelar>
          ))}
        </div>
      ) : (
        <div className="mt-16 border-y border-linea py-20 text-center">
          <p className="display text-4xl">No hay opciones con esos filtros.</p>
          <p className="mt-3 text-sm text-piedra">Prueba otra ciudad o pide orientación a un coordinador.</p>
          <Link to={`/solicitar${procedimiento ? `?procedimiento=${procedimiento}` : ''}`} className="btn mt-8">
            Solicitar orientación
          </Link>
        </div>
      )}
    </div>
  )
}

function Filtro({ valor, onChange, opciones }: { valor: string; onChange: (v: string) => void; opciones: [string, string][] }) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer appearance-none border-b bg-transparent py-1 pr-5 outline-none ${valor ? 'border-espresso text-espresso' : 'border-transparent text-piedra hover:text-espresso'}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M1 1l4 4 4-4' fill='none' stroke='%236e655c'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
    >
      {opciones.map(([v, t]) => (
        <option key={v} value={v}>
          {t}
        </option>
      ))}
    </select>
  )
}
