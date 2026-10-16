import { detallarOfertas, nombreCategoria, type Categoria } from '@plastinex/shared'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
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
  const virtual = params.get('virtual') === '1'
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
    if (virtual && !d.profesional?.valoracion_virtual) return false
    return true
  })
  lista = [...lista].sort((a, b) => {
    if (orden === 'nombre') return a.institucion.nombre.localeCompare(b.institucion.nombre, 'es')
    if (orden === 'precio') return (a.oferta.precio_min ?? Infinity) - (b.oferta.precio_min ?? Infinity)
    return Number(b.institucion.verificacion === 'verificado') - Number(a.institucion.verificacion === 'verificado')
  })

  const procs = datos.procedimientos.filter((p) => !categoria || p.categoria === categoria)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="kicker">— Explorar</div>
      <h1 className="titulo mt-2 text-4xl">
        Opciones en el <em>Eje Cafetero</em>
      </h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6 text-sm">
          <Grupo titulo="Categoría">
            <Opcion activa={!categoria} onClick={() => set('categoria', '')}>
              Todas
            </Opcion>
            {(Object.keys(nombreCategoria) as Categoria[]).map((c) => (
              <Opcion key={c} activa={categoria === c} onClick={() => set('categoria', c)}>
                {nombreCategoria[c]}
              </Opcion>
            ))}
          </Grupo>
          <Grupo titulo="Procedimiento">
            <select value={procedimiento} onChange={(e) => set('procedimiento', e.target.value)} className="campo">
              <option value="">Todos</option>
              {procs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </Grupo>
          <Grupo titulo="Ciudad">
            <select value={ciudad} onChange={(e) => set('ciudad', e.target.value)} className="campo">
              <option value="">Todo el Eje Cafetero</option>
              {datos.ciudades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </Grupo>
          <Grupo titulo="Precio">
            <select value={precio} onChange={(e) => set('precio', e.target.value)} className="campo">
              <option value="">Cualquier estado</option>
              <option value="con">Con rango orientativo</option>
              <option value="sin">Sin precio informado</option>
            </select>
          </Grupo>
          <Grupo titulo="Más filtros">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={verificadas} onChange={(e) => set('verificadas', e.target.checked ? '1' : '')} />
              Solo documentación verificada
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={virtual} onChange={(e) => set('virtual', e.target.checked ? '1' : '')} />
              Valoración virtual
            </label>
          </Grupo>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-arena pb-4 text-sm">
            <span className="text-piedra">{lista.length} opciones</span>
            <label className="flex items-center gap-2">
              Ordenar
              <select value={orden} onChange={(e) => set('orden', e.target.value)} className="campo !w-auto !py-1.5">
                <option value="relevancia">Relevancia</option>
                <option value="nombre">Nombre</option>
                <option value="precio">Precio menor</option>
              </select>
            </label>
          </div>
          {lista.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {lista.map((d) => (
                <OfertaCard key={d.oferta.id} d={d} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-arena bg-white p-12 text-center">
              <h3 className="titulo text-2xl">No hay opciones con esos filtros</h3>
              <p className="mt-2 text-sm text-piedra">Prueba otra ciudad o pide orientación a un coordinador.</p>
              <Link to={`/solicitar${procedimiento ? `?procedimiento=${procedimiento}` : ''}`} className="btn-oro mt-6">
                Solicitar orientación
              </Link>
            </div>
          )}
          <p className="mt-8 text-xs text-piedra">
            Todos los perfiles son de demostración. Los precios son rangos orientativos informados por el prestador y se confirman
            en una cotización individual.
          </p>
        </section>
      </div>
    </div>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="etiqueta">{titulo}</div>
      <div className="flex flex-col items-start gap-1.5">{children}</div>
    </div>
  )
}

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`text-left ${activa ? 'font-semibold text-tinta' : 'text-piedra hover:text-tinta'}`}>
      {activa && <span className="mr-1 text-oro">—</span>}
      {children}
    </button>
  )
}
