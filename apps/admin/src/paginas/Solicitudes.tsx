import { etapas, formatoFecha, type Etapa, type Solicitud } from '@plastinex/shared'
import { Columns3, List } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { EtapaBadge, Titulo } from '../componentes/ui'
import { useDatos } from '../datos'

const antiguedad = (iso: string) => {
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000
  return h < 1 ? 'hace minutos' : h < 24 ? `hace ${Math.floor(h)} h` : `hace ${Math.floor(h / 24)} d`
}

export default function Solicitudes() {
  const { datos } = useDatos()
  const [params, setParams] = useSearchParams()
  const vista = params.get('vista') ?? 'tablero'
  const q = (params.get('q') ?? '').toLowerCase()
  const inst = params.get('institucion') ?? ''
  const asignado = params.get('asignado') ?? ''
  const etapa = (params.get('etapa') ?? '') as Etapa | ''

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const proc = (s: Solicitud) => datos.procedimientos.find((p) => p.id === s.procedimiento_id)?.nombre ?? 'Orientación general'
  const instNombre = (s: Solicitud) => datos.instituciones.find((i) => i.id === s.institucion_id)?.nombre
  const responsable = (s: Solicitud) => datos.perfiles.find((p) => p.id === s.asignado_a)
  const staff = datos.perfiles.filter((p) => p.rol === 'admin' || p.rol === 'coordinador')

  const filtradas = datos.solicitudes.filter((s) => {
    if (inst && s.institucion_id !== inst) return false
    if (asignado === 'sin' ? s.asignado_a : asignado && s.asignado_a !== asignado) return false
    if (etapa && s.etapa !== etapa) return false
    if (q && ![s.codigo, s.nombre, s.email, s.telefono, proc(s), instNombre(s)].join(' ').toLowerCase().includes(q)) return false
    return true
  })

  return (
    <div>
      <Titulo
        accion={
          <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-sm">
            <button onClick={() => set('vista', '')} className={`flex items-center gap-1 rounded px-2.5 py-1 ${vista === 'tablero' ? 'bg-tinta text-white' : ''}`}>
              <Columns3 size={14} /> Tablero
            </button>
            <button onClick={() => set('vista', 'lista')} className={`flex items-center gap-1 rounded px-2.5 py-1 ${vista === 'lista' ? 'bg-tinta text-white' : ''}`}>
              <List size={14} /> Lista
            </button>
          </div>
        }
      >
        Solicitudes
      </Titulo>

      <div className="mb-4 flex flex-wrap gap-2">
        <input value={params.get('q') ?? ''} onChange={(e) => set('q', e.target.value)} placeholder="Buscar nombre, código, correo…" className="campo max-w-xs" />
        <select value={inst} onChange={(e) => set('institucion', e.target.value)} className="campo !w-auto">
          <option value="">Todas las instituciones</option>
          {datos.instituciones.map((i) => (
            <option key={i.id} value={i.id}>
              {i.nombre}
            </option>
          ))}
        </select>
        <select value={asignado} onChange={(e) => set('asignado', e.target.value)} className="campo !w-auto">
          <option value="">Cualquier responsable</option>
          <option value="sin">Sin asignar</option>
          {staff.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre || p.email}
            </option>
          ))}
        </select>
        {vista === 'lista' && (
          <select value={etapa} onChange={(e) => set('etapa', e.target.value)} className="campo !w-auto">
            <option value="">Todas las etapas</option>
            {etapas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {vista === 'tablero' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {etapas.map((e) => {
            const col = filtradas.filter((s) => s.etapa === e.id)
            return (
              <div key={e.id} className="w-64 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1 text-sm">
                  <span className="font-medium">{e.nombre}</span>
                  <span className="text-stone-400 tabular-nums">{col.length}</span>
                </div>
                <div className="min-h-24 space-y-2 rounded-lg bg-stone-200/50 p-2">
                  {col.map((s) => (
                    <Link key={s.id} to={`/solicitudes/${s.id}`} className="block rounded-md border border-stone-200 bg-white p-3 text-sm shadow-sm hover:border-oro">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{s.nombre}</span>
                        <span className="font-mono text-[10px] text-stone-400">{s.codigo}</span>
                      </div>
                      <div className="text-xs text-stone-600">{proc(s)}</div>
                      {instNombre(s) && <div className="truncate text-xs text-stone-400">{instNombre(s)}</div>}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                        <span className={e.id === 'nueva' && Date.now() - new Date(s.creado_en).getTime() > 86_400_000 ? 'font-medium text-rose-600' : ''}>
                          {antiguedad(s.creado_en)}
                        </span>
                        <span>{responsable(s)?.nombre || responsable(s)?.email?.split('@')[0] || 'Sin asignar'}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="tarjeta overflow-x-auto">
          <table className="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Paciente</th>
                <th>Procedimiento</th>
                <th>Institución</th>
                <th>Recibida</th>
                <th>Responsable</th>
                <th>Etapa</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="font-mono text-xs">
                    <Link to={`/solicitudes/${s.id}`} className="text-oro-osc hover:underline">
                      {s.codigo}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium">{s.nombre}</div>
                    <div className="text-xs text-stone-500">{s.pais}</div>
                  </td>
                  <td>{proc(s)}</td>
                  <td>{instNombre(s) ?? '—'}</td>
                  <td className="whitespace-nowrap">{formatoFecha(s.creado_en)}</td>
                  <td>{responsable(s)?.nombre || responsable(s)?.email || '—'}</td>
                  <td>
                    <EtapaBadge etapa={s.etapa} />
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-400">
                    No hay solicitudes con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
