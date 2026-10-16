import { Link, useSearchParams } from 'react-router-dom'
import { estadosPedido, formatoCOP, formatoFecha } from '../../shared/format'
import { detallarOferta } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import type { EstadoPedido } from '../../shared/types'
import { EstadoBadge, Tarjeta } from '../../shared/ui'

export default function Pedidos() {
  const db = useDB()
  const [params, setParams] = useSearchParams()
  const estado = (params.get('estado') ?? '') as EstadoPedido | ''
  const q = (params.get('q') ?? '').toLowerCase()

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p)
  }

  const filas = db.pedidos
    .filter((p) => !estado || p.estado === estado)
    .map((p) => {
      const o = db.ofertas.find((x) => x.id === p.ofertaId)
      return { p, d: o && detallarOferta(db, o) }
    })
    .filter(({ p, d }) => {
      if (!q) return true
      return [p.id, p.paciente.nombre, p.paciente.email, p.paciente.pais, d?.procedimiento.nombre, d?.medico.nombre]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <div className="flex flex-wrap gap-2">
        <Chip activo={!estado} onClick={() => set('estado', '')}>
          Todos ({db.pedidos.length})
        </Chip>
        {estadosPedido.map((e) => (
          <Chip key={e.id} activo={estado === e.id} onClick={() => set('estado', e.id)}>
            {e.nombre} ({db.pedidos.filter((p) => p.estado === e.id).length})
          </Chip>
        ))}
        <input
          value={params.get('q') ?? ''}
          onChange={(e) => set('q', e.target.value)}
          placeholder="Buscar paciente, médico, ID…"
          className="input ml-auto max-w-xs"
        />
      </div>
      <Tarjeta className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Procedimiento</th>
              <th className="px-4 py-3">Cirujano / Clínica</th>
              <th className="px-4 py-3">Fecha deseada</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map(({ p, d }) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono">
                  <Link to={`/admin/pedidos/${p.id}`} className="text-brand-700 hover:underline">
                    {p.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.paciente.nombre}</div>
                  <div className="text-xs text-slate-500">{p.paciente.pais}</div>
                </td>
                <td className="px-4 py-3">{d?.procedimiento.nombre ?? '—'}</td>
                <td className="px-4 py-3">
                  <div>{d?.medico.nombre ?? '—'}</div>
                  <div className="text-xs text-slate-500">
                    {d?.clinica.nombre} · {d?.ciudad.nombre}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatoFecha(p.fechaDeseada)}</td>
                <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{formatoCOP(p.totales.total)}</td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={p.estado} />
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No hay pedidos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm ${activo ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'}`}
    >
      {children}
    </button>
  )
}
