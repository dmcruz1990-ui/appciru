import { detallarOfertas, formatoCOP, iniciales, nombreCiudad } from '@plastinex/shared'
import { Languages, Search, Video } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Revelar } from '../componentes/base'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'

/** Directorio de cirujanos plásticos: se filtra por ciudad, procedimiento, idioma y valoración virtual. */
export default function Especialistas() {
  const { datos } = useCatalogo()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const ciudad = params.get('ciudad') ?? ''
  const proc = params.get('procedimiento') ?? ''
  const virtual = params.get('virtual') === '1'
  const ingles = params.get('ingles') === '1'

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const fichas = useMemo(() => {
    if (!datos) return []
    const ofertas = detallarOfertas(datos)
    return datos.profesionales
      .filter((p) => p.publicado)
      .map((p) => {
        const suyas = ofertas.filter((d) => d.profesional?.id === p.id)
        const precios = suyas.map((d) => d.oferta.precio_min).filter((x): x is number => x != null)
        const instIds = datos.vinculos.filter((v) => v.profesional_id === p.id).map((v) => v.institucion_id)
        return {
          p,
          procedimientos: [...new Map(suyas.map((d) => [d.procedimiento.id, d.procedimiento])).values()],
          instituciones: datos.instituciones.filter((i) => instIds.includes(i.id) && i.publicado),
          desde: precios.length ? Math.min(...precios) : null,
        }
      })
  }, [datos])

  if (!datos) return null
  const texto = q.trim().toLowerCase()
  const lista = fichas.filter(({ p, procedimientos, instituciones }) => {
    if (ciudad && p.ciudad_id !== ciudad && !instituciones.some((i) => i.ciudad_id === ciudad)) return false
    if (proc && !procedimientos.some((x) => x.id === proc)) return false
    if (virtual && !p.valoracion_virtual) return false
    if (ingles && !p.idiomas.some((i) => /ingl|engl/i.test(i))) return false
    if (texto && ![p.nombre, p.especialidad, p.sociedad ?? '', ...instituciones.map((i) => i.nombre)].join(' ').toLowerCase().includes(texto)) return false
    return true
  })

  return (
    <div className="contenedor pt-48 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="rotulo">Directorio</div>
          <h1 className="display mt-4 text-4xl md:text-5xl">
            Cirujanos <em>plásticos</em>
          </h1>
        </div>
        <p className="max-w-sm text-sm text-piedra">
          Especialistas con perfil en la red. La marca «verificado» solo aparece cuando revisamos su registro profesional y su sociedad científica.
        </p>
      </div>

      <div className="mt-12 grid gap-4 border-y border-linea py-6 md:grid-cols-[1.4fr_1fr_1fr] md:items-center">
        <label className="flex items-center gap-3">
          <Search size={16} strokeWidth={1.5} className="text-piedra" />
          <input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Buscar por nombre, clínica o sociedad" className="w-full bg-transparent py-2 text-[15px] outline-none placeholder:text-niebla" aria-label="Buscar especialista" />
        </label>
        <select value={ciudad} onChange={(e) => set('ciudad', e.target.value)} className="cursor-pointer border-b border-linea bg-transparent py-2 outline-none" aria-label="Ciudad">
          <option value="">Todas las ciudades</option>
          {datos.ciudades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <select value={proc} onChange={(e) => set('procedimiento', e.target.value)} className="cursor-pointer border-b border-linea bg-transparent py-2 outline-none" aria-label="Procedimiento">
          <option value="">Todos los procedimientos</option>
          {datos.procedimientos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
        <Chip activo={virtual} onClick={() => set('virtual', virtual ? '' : '1')}>
          <Video size={14} strokeWidth={1.5} /> Valoración virtual
        </Chip>
        <Chip activo={ingles} onClick={() => set('ingles', ingles ? '' : '1')}>
          <Languages size={14} strokeWidth={1.5} /> Habla inglés
        </Chip>
        <span className="ml-auto text-piedra">
          {lista.length} {lista.length === 1 ? 'especialista' : 'especialistas'}
        </span>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {lista.map(({ p, procedimientos, instituciones, desde }, k) => (
          <Revelar key={p.id} retraso={(k % 2) * 0.06}>
            <Link to={`/profesional/${p.id}`} className="group grid grid-cols-[120px_1fr] gap-6 border border-linea p-5 transition hover:border-espresso sm:grid-cols-[160px_1fr]">
              <span className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-espresso text-2xl font-light tracking-[0.15em] text-marfil">
                {p.foto_url ? <img src={p.foto_url} alt={p.nombre} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /> : iniciales(p.nombre)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="rotulo !text-[10px]">{nombreCiudad(datos, p.ciudad_id)}</span>
                  {p.es_demo && <EtiquetaDemo />}
                </span>
                <span className="mt-2 text-[16px] font-medium tracking-[0.1em] uppercase">{p.nombre}</span>
                <span className="mt-1 text-[13px] text-piedra">{p.especialidad}</span>
                <span className="mt-2">
                  <EstadoVerificacion v={p.verificacion} />
                </span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {procedimientos.slice(0, 4).map((x) => (
                    <span key={x.id} className="bg-arena px-2 py-1 text-[11px]">
                      {x.nombre}
                    </span>
                  ))}
                  {procedimientos.length > 4 && <span className="px-2 py-1 text-[11px] text-piedra">+{procedimientos.length - 4}</span>}
                </span>
                <span className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4 text-[13px]">
                  <span className="text-piedra">
                    {[p.sociedad, p.anios_experiencia && `${p.anios_experiencia} años`, instituciones[0]?.nombre].filter(Boolean).join(' · ')}
                  </span>
                  {desde && <span className="font-medium">desde {formatoCOP(desde)}</span>}
                </span>
              </span>
            </Link>
          </Revelar>
        ))}
      </div>
      {lista.length === 0 && (
        <div className="mt-12 border-y border-linea py-20 text-center">
          <p className="display normal-case text-3xl">No hay especialistas con esos filtros.</p>
        </div>
      )}
    </div>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={activo} className={`flex items-center gap-2 border px-3.5 py-2 transition ${activo ? 'border-espresso bg-espresso text-marfil' : 'border-linea hover:border-espresso'}`}>
      {children}
    </button>
  )
}
