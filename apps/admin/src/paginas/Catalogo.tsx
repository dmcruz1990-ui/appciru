import {
  nombreCategoria,
  nombreTipoAlojamiento,
  nombreTipoInstitucion,
  supabase,
  textoPrecio, nombrePais, PAISES } from '@plastinex/shared'
import { Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import SubirImagen from '../componentes/SubirImagen'
import SubirGaleria from '../componentes/SubirGaleria'
import { Modal, Titulo, VerifBadge } from '../componentes/ui'
import { useDatos, type DatosPanel } from '../datos'

type Fila = Record<string, unknown> & { id: string }

interface CampoDef {
  k: string
  t: string
  tipo: 'texto' | 'area' | 'numero' | 'select' | 'bool' | 'lista' | 'fecha' | 'imagen' | 'galeria' | 'coordenada'
  opciones?: (d: DatosPanel) => { v: string; t: string }[]
  requerido?: boolean
  ayuda?: string
  ancho?: boolean
}

interface Coleccion {
  id: string
  t: string
  tabla: string
  idTexto?: boolean
  filas: (d: DatosPanel) => Fila[]
  columnas: { t: string; v: (f: Fila, d: DatosPanel) => ReactNode }[]
  campos: CampoDef[]
  nuevo: Record<string, unknown>
}

const ciudades = (d: DatosPanel) => d.ciudades.map((c) => ({ v: c.id, t: `${c.nombre} · ${nombrePais(c.pais)}` }))
const deRecord = (r: Record<string, string>) => () => Object.entries(r).map(([v, t]) => ({ v, t }))
const nombre = <T extends { id: string; nombre: string }>(xs: T[], id: unknown) => xs.find((x) => x.id === id)?.nombre ?? '—'

const colecciones: Coleccion[] = [
  {
    id: 'ofertas',
    t: 'Ofertas',
    tabla: 'px_ofertas',
    filas: (d) => d.ofertas as unknown as Fila[],
    columnas: [
      { t: 'Procedimiento', v: (f, d) => nombre(d.procedimientos, f.procedimiento_id) },
      { t: 'Institución', v: (f, d) => nombre(d.instituciones, f.institucion_id) },
      { t: 'Profesional', v: (f, d) => nombre(d.profesionales, f.profesional_id) },
      { t: 'Rango', v: (f) => textoPrecio(f.precio_min as number | null, f.precio_max as number | null) },
      { t: 'Actualizado', v: (f) => (f.precio_actualizado_en as string) ?? '—' },
    ],
    campos: [
      { k: 'procedimiento_id', t: 'Procedimiento', tipo: 'select', requerido: true, opciones: (d) => d.procedimientos.map((p) => ({ v: p.id, t: p.nombre })) },
      { k: 'institucion_id', t: 'Institución', tipo: 'select', requerido: true, opciones: (d) => d.instituciones.map((i) => ({ v: i.id, t: i.nombre })) },
      { k: 'profesional_id', t: 'Profesional (opcional)', tipo: 'select', opciones: (d) => d.profesionales.map((p) => ({ v: p.id, t: p.nombre })) },
      { k: 'precio_min', t: 'Precio mínimo COP', tipo: 'numero', ayuda: 'Vacío = no informado' },
      { k: 'precio_max', t: 'Precio máximo COP', tipo: 'numero' },
      { k: 'precio_actualizado_en', t: 'Fecha de actualización del precio', tipo: 'fecha' },
      { k: 'incluye', t: 'Qué incluye', tipo: 'area', ancho: true },
      { k: 'no_incluye', t: 'Qué no incluye', tipo: 'area', ancho: true },
      { k: 'publicado', t: 'Publicado en el sitio', tipo: 'bool' },
    ],
    nuevo: { publicado: false },
  },
  {
    id: 'instituciones',
    t: 'Instituciones',
    tabla: 'px_instituciones',
    filas: (d) => d.instituciones as unknown as Fila[],
    columnas: [
      { t: 'Nombre', v: (f) => <span className="font-medium">{f.nombre as string}</span> },
      { t: 'Tipo', v: (f) => nombreTipoInstitucion[f.tipo as keyof typeof nombreTipoInstitucion] },
      { t: 'Ciudad', v: (f, d) => nombre(d.ciudades, f.ciudad_id) },
      { t: 'REPS', v: (f) => <span className="font-mono text-xs">{(f.codigo_reps as string) ?? '—'}</span> },
      { t: 'Verificación', v: (f) => <VerifBadge v={f.verificacion as never} /> },
    ],
    campos: [
      { k: 'nombre', t: 'Nombre público', tipo: 'texto', requerido: true },
      { k: 'tipo', t: 'Tipo', tipo: 'select', requerido: true, opciones: deRecord(nombreTipoInstitucion) },
      { k: 'ciudad_id', t: 'Ciudad', tipo: 'select', requerido: true, opciones: ciudades },
      { k: 'direccion', t: 'Dirección', tipo: 'texto' },
      { k: 'codigo_reps', t: 'Código REPS', tipo: 'texto' },
      { k: 'valoracion_precio', t: 'Valor primera valoración (0 = gratis)', tipo: 'numero', ayuda: 'Vacío = no informado' },
      { k: 'financiacion', t: 'Ofrece financiación', tipo: 'bool' },
      { k: 'telefono_publico', t: 'Teléfono público', tipo: 'texto' },
      { k: 'sitio_web', t: 'Sitio web', tipo: 'texto' },
      { k: 'imagen_url', t: 'Foto principal', tipo: 'imagen', ancho: true },
      { k: 'galeria', t: 'Galería (se ven en el carrusel y en la ficha)', tipo: 'galeria', ancho: true },
      { k: 'lat', t: 'Latitud', tipo: 'coordenada', ayuda: 'Para el mapa. Ej.: 4.8087 (Google Maps → clic derecho)' },
      { k: 'lng', t: 'Longitud', tipo: 'coordenada', ayuda: 'Ej.: -75.6890' },
      { k: 'descripcion', t: 'Descripción', tipo: 'area', ancho: true },
      { k: 'servicios', t: 'Servicios (separados por comas)', tipo: 'lista', ancho: true },
      { k: 'es_demo', t: 'Perfil de demostración', tipo: 'bool' },
      { k: 'publicado', t: 'Publicado en el sitio', tipo: 'bool' },
    ],
    nuevo: { tipo: 'clinica', servicios: [], galeria: [], publicado: false, es_demo: false },
  },
  {
    id: 'profesionales',
    t: 'Profesionales',
    tabla: 'px_profesionales',
    filas: (d) => d.profesionales as unknown as Fila[],
    columnas: [
      { t: 'Nombre', v: (f) => <span className="font-medium">{f.nombre as string}</span> },
      { t: 'Ciudad', v: (f, d) => nombre(d.ciudades, f.ciudad_id) },
      { t: 'ReTHUS', v: (f) => <span className="font-mono text-xs">{(f.rethus as string) ?? '—'}</span> },
      { t: 'Instituciones', v: (f, d) => d.vinculos.filter((v) => v.profesional_id === f.id).map((v) => nombre(d.instituciones, v.institucion_id)).join(', ') || '—' },
      { t: 'Verificación', v: (f) => <VerifBadge v={f.verificacion as never} /> },
    ],
    campos: [
      { k: 'nombre', t: 'Nombre', tipo: 'texto', requerido: true },
      { k: 'especialidad', t: 'Especialidad', tipo: 'texto', requerido: true },
      { k: 'ciudad_id', t: 'Ciudad', tipo: 'select', requerido: true, opciones: ciudades },
      { k: 'rethus', t: 'Registro ReTHUS', tipo: 'texto' },
      { k: 'sociedad', t: 'Sociedad científica', tipo: 'texto', ayuda: 'Ej.: SCCP' },
      { k: 'anios_experiencia', t: 'Años de experiencia', tipo: 'numero' },
      { k: 'idiomas', t: 'Idiomas (separados por comas)', tipo: 'lista' },
      { k: 'foto_url', t: 'Retrato', tipo: 'imagen', ancho: true },
      { k: 'bio', t: 'Presentación', tipo: 'area', ancho: true },
      { k: '_instituciones', t: 'Instituciones donde atiende', tipo: 'lista', ancho: true, ayuda: 'Selecciona abajo' },
      { k: 'valoracion_virtual', t: 'Ofrece valoración virtual', tipo: 'bool' },
      { k: 'es_demo', t: 'Perfil de demostración', tipo: 'bool' },
      { k: 'publicado', t: 'Publicado en el sitio', tipo: 'bool' },
    ],
    nuevo: { especialidad: 'Cirugía plástica, estética y reconstructiva', idiomas: ['Español'], publicado: false, es_demo: false, valoracion_virtual: false },
  },
  {
    id: 'procedimientos',
    t: 'Procedimientos',
    tabla: 'px_procedimientos',
    idTexto: true,
    filas: (d) => d.procedimientos as unknown as Fila[],
    columnas: [
      { t: 'Nombre', v: (f) => <span className="font-medium">{f.nombre as string}</span> },
      { t: 'Categoría', v: (f) => nombreCategoria[f.categoria as keyof typeof nombreCategoria] },
      { t: 'Duración', v: (f) => (f.duracion_aprox as string) ?? '—' },
      { t: 'Estadía sugerida', v: (f) => (f.estadia_sugerida_dias ? `${f.estadia_sugerida_dias} días` : '—') },
    ],
    campos: [
      { k: 'id', t: 'Identificador (url)', tipo: 'texto', requerido: true, ayuda: 'minúsculas-con-guiones; no se puede cambiar' },
      { k: 'nombre', t: 'Nombre', tipo: 'texto', requerido: true },
      { k: 'categoria', t: 'Categoría', tipo: 'select', requerido: true, opciones: deRecord(nombreCategoria) },
      { k: 'orden', t: 'Orden', tipo: 'numero' },
      { k: 'duracion_aprox', t: 'Duración aproximada', tipo: 'texto' },
      { k: 'anestesia', t: 'Anestesia habitual', tipo: 'texto' },
      { k: 'recuperacion', t: 'Recuperación orientativa', tipo: 'texto' },
      { k: 'estadia_sugerida_dias', t: 'Estadía sugerida (días)', tipo: 'numero' },
      { k: 'imagen_url', t: 'Foto del procedimiento (ambiente, nunca resultados)', tipo: 'imagen', ancho: true },
      { k: 'descripcion', t: 'Descripción', tipo: 'area', ancho: true },
      { k: 'publicado', t: 'Publicado en el sitio', tipo: 'bool' },
    ],
    nuevo: { categoria: 'corporal', publicado: true, orden: 99 },
  },
  {
    id: 'alojamientos',
    t: 'Alojamientos',
    tabla: 'px_alojamientos',
    filas: (d) => d.alojamientos as unknown as Fila[],
    columnas: [
      { t: 'Nombre', v: (f) => <span className="font-medium">{f.nombre as string}</span> },
      { t: 'Tipo', v: (f) => nombreTipoAlojamiento[f.tipo as keyof typeof nombreTipoAlojamiento] },
      { t: 'Ciudad', v: (f, d) => nombre(d.ciudades, f.ciudad_id) },
      { t: 'Desde / noche', v: (f) => textoPrecio(f.precio_noche_desde as number | null, null) },
    ],
    campos: [
      { k: 'nombre', t: 'Nombre', tipo: 'texto', requerido: true },
      { k: 'tipo', t: 'Tipo', tipo: 'select', requerido: true, opciones: deRecord(nombreTipoAlojamiento) },
      { k: 'ciudad_id', t: 'Ciudad', tipo: 'select', requerido: true, opciones: ciudades },
      { k: 'precio_noche_desde', t: 'Precio por noche desde (COP)', tipo: 'numero' },
      { k: 'capacidad', t: 'Capacidad (personas)', tipo: 'numero' },
      { k: 'galeria', t: 'Fotos del alojamiento', tipo: 'galeria', ancho: true },
      { k: 'lat', t: 'Latitud', tipo: 'coordenada', ayuda: 'Para el mapa. Ej.: 4.8060' },
      { k: 'lng', t: 'Longitud', tipo: 'coordenada', ayuda: 'Ej.: -75.6850' },
      { k: 'descripcion', t: 'Descripción', tipo: 'area', ancho: true },
      { k: 'incluye_enfermeria', t: 'Incluye enfermería', tipo: 'bool' },
      { k: 'incluye_alimentacion', t: 'Incluye alimentación', tipo: 'bool' },
      { k: 'es_demo', t: 'De demostración', tipo: 'bool' },
      { k: 'publicado', t: 'Publicado en el sitio', tipo: 'bool' },
    ],
    nuevo: { tipo: 'casa_recobro', galeria: [], publicado: false, es_demo: false, incluye_enfermeria: false, incluye_alimentacion: false },
  },
  {
    id: 'servicios',
    t: 'Servicios',
    tabla: 'px_servicios',
    idTexto: true,
    filas: (d) => d.servicios as unknown as Fila[],
    columnas: [
      { t: 'Nombre', v: (f) => <span className="font-medium">{f.nombre as string}</span> },
      { t: 'Desde', v: (f) => `${textoPrecio(f.precio_desde as number | null, null)}${f.unidad === 'dia' ? ' / día' : ''}` },
    ],
    campos: [
      { k: 'id', t: 'Identificador', tipo: 'texto', requerido: true },
      { k: 'nombre', t: 'Nombre', tipo: 'texto', requerido: true },
      { k: 'precio_desde', t: 'Precio desde (COP)', tipo: 'numero' },
      { k: 'unidad', t: 'Unidad', tipo: 'select', requerido: true, opciones: () => [{ v: 'servicio', t: 'Por servicio' }, { v: 'dia', t: 'Por día' }] },
      { k: 'orden', t: 'Orden', tipo: 'numero' },
      { k: 'descripcion', t: 'Descripción', tipo: 'area', ancho: true },
      { k: 'publicado', t: 'Publicado en el sitio', tipo: 'bool' },
    ],
    nuevo: { unidad: 'servicio', publicado: true, orden: 99 },
  },
  {
    id: 'ciudades',
    t: 'Ciudades',
    tabla: 'px_ciudades',
    idTexto: true,
    filas: (d) => d.ciudades as unknown as Fila[],
    columnas: [
      { t: 'Nombre', v: (f) => <span className="font-medium">{f.nombre as string}</span> },
      { t: 'País', v: (f) => nombrePais(f.pais as string) },
      { t: 'Estado / departamento', v: (f) => f.departamento as string },
    ],
    campos: [
      { k: 'id', t: 'Identificador', tipo: 'texto', requerido: true },
      { k: 'nombre', t: 'Nombre', tipo: 'texto', requerido: true },
      { k: 'pais', t: 'País', tipo: 'select', requerido: true, opciones: () => Object.entries(PAISES).map(([v, t]) => ({ v, t })) },
      { k: 'departamento', t: 'Estado / departamento', tipo: 'texto', requerido: true },
      { k: 'orden', t: 'Orden', tipo: 'numero' },
      { k: 'activa', t: 'Activa', tipo: 'bool' },
    ],
    nuevo: { activa: true, orden: 99 },
  },
]

export default function Catalogo() {
  const { tab = 'ofertas' } = useParams()
  const { datos, recargar } = useDatos()
  const col = colecciones.find((c) => c.id === tab) ?? colecciones[0]
  const [editando, setEditando] = useState<{ fila: Record<string, unknown>; nueva: boolean } | null>(null)
  const filas = col.filas(datos)
  const campoPublicado = col.id === 'ciudades' ? 'activa' : 'publicado'

  const alternar = async (f: Fila) => {
    await supabase.from(col.tabla).update({ [campoPublicado]: !f[campoPublicado] }).eq('id', f.id)
    recargar()
  }

  return (
    <div>
      <Titulo
        accion={
          <button onClick={() => setEditando({ fila: { ...col.nuevo }, nueva: true })} className="btn">
            <Plus size={14} /> Nuevo
          </button>
        }
      >
        Catálogo
      </Titulo>
      <div className="mb-4 flex flex-wrap gap-1 border-b border-stone-200">
        {colecciones.map((c) => (
          <NavLink
            key={c.id}
            to={`/catalogo/${c.id}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${c.id === col.id ? 'border-oro font-medium' : 'border-transparent text-stone-500 hover:text-stone-900'}`}
          >
            {c.t} <span className="text-stone-400">{c.filas(datos).length}</span>
          </NavLink>
        ))}
      </div>
      <div className="tarjeta overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              {col.columnas.map((c) => (
                <th key={c.t}>{c.t}</th>
              ))}
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className="hover:bg-stone-50">
                {col.columnas.map((c) => (
                  <td key={c.t}>{c.v(f, datos)}</td>
                ))}
                <td>
                  <button
                    onClick={() => void alternar(f)}
                    title="Clic para cambiar"
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${f[campoPublicado] ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600'}`}
                  >
                    {f[campoPublicado] ? 'Publicado' : 'Oculto'}
                  </button>
                </td>
                <td className="text-right">
                  <button
                    onClick={() =>
                      setEditando({
                        fila: col.id === 'profesionales' ? { ...f, _instituciones: datos.vinculos.filter((v) => v.profesional_id === f.id).map((v) => v.institucion_id) } : { ...f },
                        nueva: false,
                      })
                    }
                    className="text-sm text-oro-osc hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editando && (
        <Editor
          col={col}
          inicial={editando.fila}
          nueva={editando.nueva}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null)
            recargar()
          }}
        />
      )}
    </div>
  )
}

function Editor({
  col,
  inicial,
  nueva,
  onCerrar,
  onGuardado,
}: {
  col: Coleccion
  inicial: Record<string, unknown>
  nueva: boolean
  onCerrar: () => void
  onGuardado: () => void
}) {
  const { datos } = useDatos()
  const [f, setF] = useState<Record<string, unknown>>(inicial)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const set = (k: string, v: unknown) => setF((x) => ({ ...x, [k]: v }))

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const min = f.precio_min as number | null | undefined
    const max = f.precio_max as number | null | undefined
    if (min != null && max != null && min > max) return setError('El precio mínimo no puede superar al máximo.')
    setGuardando(true)
    const { _instituciones, ...fila } = f
    // La verificación solo se cambia desde la sección Verificación.
    delete fila.verificacion
    delete fila.verificado_en
    delete fila.verificado_por
    const r = nueva
      ? await supabase.from(col.tabla).insert(fila).select('id').single()
      : await supabase.from(col.tabla).update(fila).eq('id', inicial.id as string).select('id').single()
    if (r.error) {
      setGuardando(false)
      return setError(r.error.message)
    }
    if (col.id === 'profesionales') {
      const pid = r.data.id as string
      await supabase.from('px_profesional_institucion').delete().eq('profesional_id', pid)
      const ids = (_instituciones as string[] | undefined) ?? []
      if (ids.length) {
        const v = await supabase.from('px_profesional_institucion').insert(ids.map((institucion_id) => ({ profesional_id: pid, institucion_id })))
        if (v.error) {
          setGuardando(false)
          return setError(v.error.message)
        }
      }
    }
    setGuardando(false)
    onGuardado()
  }

  const borrar = async () => {
    if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return
    const { error } = await supabase.from(col.tabla).delete().eq('id', inicial.id as string)
    if (error) return setError(error.message)
    onGuardado()
  }

  return (
    <Modal titulo={`${nueva ? 'Nuevo' : 'Editar'} · ${col.t}`} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="grid gap-3 sm:grid-cols-2">
        {col.campos.map((c) => {
          if (c.k === '_instituciones') {
            const sel = (f._instituciones as string[] | undefined) ?? []
            return (
              <div key={c.k} className="sm:col-span-2">
                <span className="etiqueta">{c.t}</span>
                <div className="flex flex-wrap gap-2">
                  {datos.instituciones.map((i) => (
                    <label key={i.id} className="flex items-center gap-1.5 rounded-md border border-stone-200 px-2 py-1 text-sm">
                      <input type="checkbox" checked={sel.includes(i.id)} onChange={(e) => set('_instituciones', e.target.checked ? [...sel, i.id] : sel.filter((x) => x !== i.id))} />
                      {i.nombre}
                    </label>
                  ))}
                </div>
              </div>
            )
          }
          const valor = f[c.k]
          const clase = c.ancho ? 'sm:col-span-2' : ''
          if (c.tipo === 'imagen')
            return (
              <div key={c.k} className={clase}>
                <span className="etiqueta">{c.t}</span>
                <SubirImagen valor={(valor as string | null) ?? null} carpeta={col.id} onChange={(u) => set(c.k, u)} />
              </div>
            )
          if (c.tipo === 'galeria')
            return (
              <div key={c.k} className={clase}>
                <span className="etiqueta">{c.t}</span>
                <SubirGaleria valor={(valor as string[] | undefined) ?? []} carpeta={col.id} onChange={(u) => set(c.k, u)} />
              </div>
            )
          if (c.tipo === 'bool')
            return (
              <label key={c.k} className={`flex items-center gap-2 text-sm ${clase}`}>
                <input type="checkbox" checked={Boolean(valor)} onChange={(e) => set(c.k, e.target.checked)} /> {c.t}
              </label>
            )
          return (
            <label key={c.k} className={`block ${clase}`}>
              <span className="etiqueta">
                {c.t}
                {c.requerido && ' *'}
              </span>
              {c.tipo === 'area' ? (
                <textarea rows={3} value={(valor as string) ?? ''} onChange={(e) => set(c.k, e.target.value || null)} className="campo" />
              ) : c.tipo === 'select' ? (
                <select required={c.requerido} value={(valor as string) ?? ''} onChange={(e) => set(c.k, e.target.value || null)} className="campo">
                  <option value="">—</option>
                  {c.opciones?.(datos).map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.t}
                    </option>
                  ))}
                </select>
              ) : c.tipo === 'numero' ? (
                <input type="number" min={0} value={(valor as number | null) ?? ''} onChange={(e) => set(c.k, e.target.value === '' ? null : Number(e.target.value))} className="campo" />
              ) : c.tipo === 'coordenada' ? (
                <input
                  type="number"
                  step="any"
                  min={c.k === 'lat' ? -90 : -180}
                  max={c.k === 'lat' ? 90 : 180}
                  value={(valor as number | null) ?? ''}
                  onChange={(e) => set(c.k, e.target.value === '' ? null : Number(e.target.value))}
                  className="campo"
                />
              ) : c.tipo === 'lista' ? (
                <input
                  value={((valor as string[] | undefined) ?? []).join(', ')}
                  onChange={(e) => set(c.k, e.target.value.split(',').map((x) => x.trim()).filter(Boolean))}
                  className="campo"
                />
              ) : c.tipo === 'fecha' ? (
                <input type="date" value={(valor as string) ?? ''} onChange={(e) => set(c.k, e.target.value || null)} className="campo" />
              ) : (
                <input
                  required={c.requerido}
                  disabled={c.k === 'id' && !nueva}
                  pattern={c.k === 'id' ? '[a-z0-9-]+' : undefined}
                  value={(valor as string) ?? ''}
                  onChange={(e) => set(c.k, e.target.value || null)}
                  className="campo"
                />
              )}
              {c.ayuda && c.k !== '_instituciones' && <span className="mt-0.5 block text-xs text-stone-400">{c.ayuda}</span>}
            </label>
          )
        })}
        {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-800 sm:col-span-2">{error}</p>}
        <div className="flex items-center gap-2 pt-2 sm:col-span-2">
          {!nueva && (
            <button type="button" onClick={() => void borrar()} className="text-sm text-rose-700 hover:underline">
              Eliminar
            </button>
          )}
          <button type="button" onClick={onCerrar} className="btn-sec ml-auto">
            Cancelar
          </button>
          <button disabled={guardando} className="btn">
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
