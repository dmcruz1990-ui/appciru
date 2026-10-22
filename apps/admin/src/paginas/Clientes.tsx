import { formatoCOP, formatoFecha, nombreEstadoSuscripcion, nombrePlan, supabase, type EstadoSuscripcion, type Plan, type Suscripcion } from '@plastinex/shared'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Kpi, Modal, Titulo } from '../componentes/ui'
import { useDatos } from '../datos'

export default function Clientes() {
  const { datos, recargar } = useDatos()
  const [editando, setEditando] = useState<Partial<Suscripcion> | null>(null)
  const activas = datos.suscripciones.filter((s) => s.estado === 'activa')
  const mrr = activas.reduce((t, s) => t + s.cuota_mensual, 0)
  const instalaciones = datos.suscripciones.reduce((t, s) => t + s.cuota_instalacion, 0)
  const solicitudesDe = (institucion_id: string) => datos.solicitudes.filter((s) => s.institucion_id === institucion_id)

  return (
    <div className="space-y-5">
      <Titulo
        accion={
          <button onClick={() => setEditando({ plan: 'piloto', estado: 'prueba', cuota_instalacion: 0, cuota_mensual: 0 })} className="btn">
            <Plus size={14} /> Nuevo cliente
          </button>
        }
      >
        Clientes B2B
      </Titulo>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi t="MRR" v={formatoCOP(mrr)} s={`${activas.length} activas`} />
        <Kpi t="Cuota mensual promedio" v={activas.length ? formatoCOP(Math.round(mrr / activas.length)) : '—'} />
        <Kpi t="Instalaciones facturadas" v={formatoCOP(instalaciones)} />
        <Kpi t="En prueba" v={String(datos.suscripciones.filter((s) => s.estado === 'prueba').length)} />
      </div>
      <div className="tarjeta overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              <th>Institución</th>
              <th>Plan</th>
              <th className="text-right">Instalación</th>
              <th className="text-right">Mensual</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th className="text-right">Solicitudes</th>
              <th className="text-right">Programadas</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {datos.suscripciones.map((s) => {
              const sol = solicitudesDe(s.institucion_id)
              return (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="font-medium">{datos.instituciones.find((i) => i.id === s.institucion_id)?.nombre}</td>
                  <td>{nombrePlan[s.plan]}</td>
                  <td className="text-right tabular-nums">{formatoCOP(s.cuota_instalacion)}</td>
                  <td className="text-right tabular-nums">{formatoCOP(s.cuota_mensual)}</td>
                  <td>
                    {nombreEstadoSuscripcion[s.estado]}
                    {s.proveedor === 'stripe' && (
                      <div className="text-xs text-stone-500">
                        Stripe{s.stripe_estado === 'past_due' ? ' · cobro fallido, reintentando' : ''}
                        {s.periodo_fin ? ` · renueva ${formatoFecha(s.periodo_fin)}` : ''}
                      </div>
                    )}
                  </td>
                  <td>{formatoFecha(s.inicio)}</td>
                  <td className="text-right tabular-nums">{sol.length}</td>
                  <td className="text-right tabular-nums">{sol.filter((x) => x.etapa === 'programada').length}</td>
                  <td className="text-right">
                    {s.proveedor === 'stripe' ? (
                      <span className="text-xs text-stone-400" title="Se gestiona en Stripe: cambios de plan, reintentos y cancelaciones llegan solos">
                        Automática
                      </span>
                    ) : (
                      <button onClick={() => setEditando(s)} className="text-sm text-oro-osc hover:underline">
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-stone-500">
        Los ingresos de las cirugías los factura cada clínica y no son ingresos de PLASTINEX. Aquí solo se registran las cuotas B2B.
      </p>
      {editando && (
        <EditorSuscripcion
          inicial={editando}
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

function EditorSuscripcion({ inicial, onCerrar, onGuardado }: { inicial: Partial<Suscripcion>; onCerrar: () => void; onGuardado: () => void }) {
  const { datos } = useDatos()
  const [f, setF] = useState(inicial)
  const [error, setError] = useState<string | null>(null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const fila = {
      institucion_id: f.institucion_id,
      plan: f.plan,
      cuota_instalacion: f.cuota_instalacion ?? 0,
      cuota_mensual: f.cuota_mensual ?? 0,
      estado: f.estado,
      inicio: f.inicio || undefined,
      fin: f.fin || null,
      notas: f.notas || null,
    }
    const r = f.id ? await supabase.from('px_suscripciones').update(fila).eq('id', f.id) : await supabase.from('px_suscripciones').insert(fila)
    if (r.error) return setError(r.error.message)
    onGuardado()
  }

  return (
    <Modal titulo={f.id ? 'Editar cliente' : 'Nuevo cliente'} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="etiqueta">Institución *</span>
          <select required value={f.institucion_id ?? ''} onChange={(e) => setF({ ...f, institucion_id: e.target.value })} className="campo">
            <option value="">—</option>
            {datos.instituciones.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="etiqueta">Plan</span>
          <select value={f.plan} onChange={(e) => setF({ ...f, plan: e.target.value as Plan })} className="campo">
            {Object.entries(nombrePlan).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="etiqueta">Estado</span>
          <select value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value as EstadoSuscripcion })} className="campo">
            {Object.entries(nombreEstadoSuscripcion).map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="etiqueta">Cuota de instalación (COP)</span>
          <input type="number" min={0} value={f.cuota_instalacion ?? 0} onChange={(e) => setF({ ...f, cuota_instalacion: Number(e.target.value) })} className="campo" />
        </label>
        <label>
          <span className="etiqueta">Cuota mensual (COP)</span>
          <input type="number" min={0} value={f.cuota_mensual ?? 0} onChange={(e) => setF({ ...f, cuota_mensual: Number(e.target.value) })} className="campo" />
        </label>
        <label>
          <span className="etiqueta">Inicio</span>
          <input type="date" value={f.inicio ?? ''} onChange={(e) => setF({ ...f, inicio: e.target.value })} className="campo" />
        </label>
        <label>
          <span className="etiqueta">Fin</span>
          <input type="date" value={f.fin ?? ''} onChange={(e) => setF({ ...f, fin: e.target.value })} className="campo" />
        </label>
        <label className="sm:col-span-2">
          <span className="etiqueta">Notas</span>
          <textarea rows={2} value={f.notas ?? ''} onChange={(e) => setF({ ...f, notas: e.target.value })} className="campo" />
        </label>
        {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-800 sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" onClick={onCerrar} className="btn-sec">
            Cancelar
          </button>
          <button className="btn">Guardar</button>
        </div>
      </form>
    </Modal>
  )
}
