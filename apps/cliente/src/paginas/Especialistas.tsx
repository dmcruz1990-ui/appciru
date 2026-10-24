import { destinos, detallarOfertas, iniciales, type Categoria } from '@plastinex/shared'
import { Languages, Search, Video } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Revelar } from '../componentes/base'
import { EstadoVerificacion, EtiquetaDemo } from '../componentes/Insignias'
import { coincide } from '../busqueda'
import Desplegable from '../componentes/Desplegable'
import { useIdioma } from '../idioma'
import { useSeo } from '../seo'

const TANDA = 20

/** Directorio de cirujanos plásticos: se filtra por país, ciudad, especialidad, procedimiento, idioma y valoración virtual. */
export default function Especialistas() {
  const { datos } = useCatalogo()
  const { tx, dinero, loc, ciudadDe, ciudad: nombreCiudad, pais: nombrePais, categoria: nombreCategoria } = useIdioma()
  useSeo({ titulo: tx('Cirujanos plásticos en el mundo', 'Plastic surgeons worldwide'), descripcion: tx('Directorio de cirujanos plásticos por país, ciudad y especialidad: registro profesional, idiomas, clínicas y valoración virtual.', 'Directory of plastic surgeons by country, city and specialty: professional license, languages, clinics and virtual consultations.') })
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const ciudad = params.get('ciudad') ?? ''
  const pais = params.get('pais') ?? ''
  const especialidad = (params.get('categoria') ?? '') as Categoria | ''
  const proc = params.get('procedimiento') ?? ''
  const virtual = params.get('virtual') === '1'
  const ingles = params.get('ingles') === '1'

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    if (k === 'pais') p.delete('ciudad')
    // Al cambiar de especialidad se quita el procedimiento si no pertenece a ella.
    if (k === 'categoria' && v && datos?.procedimientos.find((x) => x.id === p.get('procedimiento'))?.categoria !== v) p.delete('procedimiento')
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

  const [cuantas, setCuantas] = useState(TANDA)
  useEffect(() => setCuantas(TANDA), [params])
  const lugares = useMemo(() => (datos ? destinos(datos) : []), [datos])

  if (!datos) return null
  const paisDe = (ciudadId: string) => datos.ciudades.find((c) => c.id === ciudadId)?.pais
  const lista = fichas.filter(({ p, procedimientos, instituciones }) => {
    if (pais && paisDe(p.ciudad_id) !== pais && !instituciones.some((i) => paisDe(i.ciudad_id) === pais)) return false
    if (ciudad && p.ciudad_id !== ciudad && !instituciones.some((i) => i.ciudad_id === ciudad)) return false
    if (especialidad && !procedimientos.some((x) => x.categoria === especialidad)) return false
    if (proc && !procedimientos.some((x) => x.id === proc)) return false
    if (virtual && !p.valoracion_virtual) return false
    if (ingles && !p.idiomas.some((i) => /ingl|engl/i.test(i))) return false
    if (q.trim() && !coincide(q, p.nombre, p.especialidad, p.especialidad_en, p.sociedad, ciudadDe(p.ciudad_id), nombrePais(paisDe(p.ciudad_id)), ...instituciones.map((i) => i.nombre), ...procedimientos.flatMap((x) => [x.nombre, x.nombre_en])))
      return false
    return true
  })

  return (
    <div className="contenedor pt-48 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="rotulo">{tx('Directorio', 'Directory')}</div>
          <h1 className="display mt-4 text-4xl md:text-5xl">
            {tx(
              <>
                Cirujanos <em>plásticos</em>
              </>,
              <>
                Plastic <em>surgeons</em>
              </>,
            )}
          </h1>
        </div>
        <p className="max-w-sm text-sm text-piedra">
          {tx(
            'Especialistas con perfil en la red. La marca «verificado» solo aparece cuando revisamos su registro profesional y su sociedad científica.',
            'Surgeons with a profile in our network. The “verified” badge only appears once we have reviewed their professional registration and scientific society membership.',
          )}
        </p>
      </div>

      <div className="mt-12 grid gap-x-6 gap-y-3 border-y border-linea py-6 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:items-end">
        <label className="flex items-center gap-3 md:col-span-2 lg:col-span-1">
          <Search size={16} strokeWidth={1.5} className="text-piedra" />
          <input value={q} onChange={(e) => set('q', e.target.value)} placeholder={tx('Nombre, clínica, ciudad o procedimiento', 'Name, clinic, city or procedure')} className="w-full bg-transparent py-2 text-[15px] outline-none placeholder:text-niebla" aria-label={tx('Buscar especialista', 'Search surgeons')} />
        </label>
        {/* Selectores propios: en el celular la lista se abre debajo, sin la ventana del sistema. */}
        <Desplegable
          etiqueta={tx('País', 'Country')}
          todas={tx('Todos los países', 'All countries')}
          valor={pais}
          onCambio={(v) => set('pais', v)}
          buscar
          opciones={[...lugares].sort((a, b) => nombrePais(a.pais).localeCompare(nombrePais(b.pais))).map((d) => ({ v: d.pais, t: nombrePais(d.pais) }))}
        />
        <Desplegable
          etiqueta={tx('Ciudad', 'City')}
          todas={tx('Todas las ciudades', 'All cities')}
          valor={ciudad}
          onCambio={(v) => set('ciudad', v)}
          buscar
          opciones={lugares
            .filter((d) => !pais || d.pais === pais)
            .flatMap((d) => d.ciudades.map(({ ciudad: c }) => ({ v: c.id, t: nombreCiudad(c), grupo: nombrePais(d.pais) })))}
        />
        <Desplegable
          etiqueta={tx('Procedimiento', 'Procedure')}
          todas={tx('Todos los procedimientos', 'All procedures')}
          valor={proc}
          onCambio={(v) => set('procedimiento', v)}
          opciones={datos.procedimientos.filter((p) => !especialidad || p.categoria === especialidad).map((p) => ({ v: p.id, t: loc(p, 'nombre') }))}
        />
      </div>
      {/* Especialidades a la vista, sin abrir ningún menú. */}
      <div className="mt-6 flex flex-wrap gap-2 text-[13px]" role="group" aria-label={tx('Especialidad', 'Specialty')}>
        {(['', 'mamaria', 'corporal', 'facial'] as (Categoria | '')[]).map((c) => (
          <button
            key={c || 'todas'}
            onClick={() => set('categoria', c)}
            aria-pressed={especialidad === c}
            className={`shrink-0 border px-4 py-2 transition ${especialidad === c ? 'border-espresso bg-espresso text-marfil' : 'border-linea hover:border-espresso'}`}
          >
            {c ? nombreCategoria(c) : tx('Todas las especialidades', 'All specialties')}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
        <Chip activo={virtual} onClick={() => set('virtual', virtual ? '' : '1')}>
          <Video size={14} strokeWidth={1.5} /> {tx('Valoración virtual', 'Virtual consultation')}
        </Chip>
        <Chip activo={ingles} onClick={() => set('ingles', ingles ? '' : '1')}>
          <Languages size={14} strokeWidth={1.5} /> {tx('Habla inglés', 'Speaks English')}
        </Chip>
        <span className="ml-auto text-piedra">
          {tx(`${lista.length} ${lista.length === 1 ? 'especialista' : 'especialistas'}`, `${lista.length} ${lista.length === 1 ? 'surgeon' : 'surgeons'}`)}
        </span>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {lista.slice(0, cuantas).map(({ p, procedimientos, instituciones, desde }, k) => (
          <Revelar key={p.id} retraso={(k % 2) * 0.06}>
            <Link to={`/profesional/${p.id}`} className="group grid grid-cols-[120px_1fr] gap-6 border border-linea p-5 transition hover:border-espresso sm:grid-cols-[160px_1fr]">
              <span className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-espresso text-2xl font-light tracking-[0.15em] text-marfil">
                {p.foto_url ? <img src={p.foto_url} alt={p.nombre} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" /> : iniciales(p.nombre)}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="rotulo !text-[10px]">
                    {ciudadDe(p.ciudad_id)} · {nombrePais(paisDe(p.ciudad_id))}
                  </span>
                  {p.es_demo && <EtiquetaDemo />}
                </span>
                <span className="mt-2 text-[16px] font-medium tracking-[0.1em] uppercase">{p.nombre}</span>
                <span className="mt-1 text-[13px] text-piedra">{loc(p, 'especialidad')}</span>
                <span className="mt-2">
                  <EstadoVerificacion v={p.verificacion} />
                </span>
                <span className="mt-3 flex flex-wrap gap-1.5">
                  {procedimientos.slice(0, 4).map((x) => (
                    <span key={x.id} className="bg-arena px-2 py-1 text-[11px]">
                      {loc(x, 'nombre')}
                    </span>
                  ))}
                  {procedimientos.length > 4 && <span className="px-2 py-1 text-[11px] text-piedra">+{procedimientos.length - 4}</span>}
                </span>
                <span className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4 text-[13px]">
                  <span className="text-piedra">
                    {[p.sociedad, p.anios_experiencia && tx(`${p.anios_experiencia} años`, `${p.anios_experiencia} years`), instituciones[0]?.nombre].filter(Boolean).join(' · ')}
                  </span>
                  {desde && <span className="font-medium">{tx(`desde ${dinero(desde)}`, `from ${dinero(desde)}`)}</span>}
                </span>
              </span>
            </Link>
          </Revelar>
        ))}
      </div>
      {lista.length > cuantas && (
        <div className="mt-14 text-center">
          <p className="text-xs text-piedra">{tx(`Viendo ${cuantas} de ${lista.length}`, `Showing ${cuantas} of ${lista.length}`)}</p>
          <button onClick={() => setCuantas((n) => n + TANDA)} className="btn-linea mt-4">
            {tx('Mostrar más', 'Show more')}
          </button>
        </div>
      )}
      {lista.length === 0 && (
        <div className="mt-12 border-y border-linea py-20 text-center">
          <p className="display normal-case text-3xl">{tx('No hay especialistas con esos filtros.', 'No surgeons match those filters.')}</p>
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
