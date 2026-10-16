import { Link } from 'react-router-dom'
import { estadosPedido, formatoCOP, formatoFecha } from '../../shared/format'
import { detallarOferta, nombreCiudad } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import { EstadoBadge, Tarjeta } from '../../shared/ui'

export default function Dashboard() {
  const db = useDB()
  const { pedidos, configuracion } = db
  const vigentes = pedidos.filter((p) => p.estado !== 'cancelado')
  const ganados = pedidos.filter((p) => ['confirmado', 'en_curso', 'completado'].includes(p.estado))
  const valorGanado = ganados.reduce((s, p) => s + p.totales.total, 0)
  const pipeline = vigentes.reduce((s, p) => s + p.totales.total, 0)
  const conversion = pedidos.length ? Math.round((ganados.length / pedidos.length) * 100) : 0

  const porEstado = estadosPedido.map((e) => ({ ...e, n: pedidos.filter((p) => p.estado === e.id).length }))
  const maxEstado = Math.max(1, ...porEstado.map((e) => e.n))

  const porCiudad = new Map<string, { n: number; valor: number }>()
  const porProc = new Map<string, number>()
  for (const p of vigentes) {
    const o = db.ofertas.find((x) => x.id === p.ofertaId)
    const d = o && detallarOferta(db, o)
    if (!d) continue
    const c = porCiudad.get(d.ciudad.id) ?? { n: 0, valor: 0 }
    porCiudad.set(d.ciudad.id, { n: c.n + 1, valor: c.valor + p.totales.total })
    porProc.set(d.procedimiento.nombre, (porProc.get(d.procedimiento.nombre) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resumen</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi t="Solicitudes totales" v={String(pedidos.length)} s={`${pedidos.filter((p) => p.estado === 'nuevo').length} sin atender`} />
        <Kpi t="Pipeline activo" v={formatoCOP(pipeline)} s={`${vigentes.length} planes no cancelados`} />
        <Kpi t="Ventas confirmadas" v={formatoCOP(valorGanado)} s={`Conversión ${conversion}%`} />
        <Kpi
          t={`Comisión estimada (${Math.round(configuracion.comision * 100)}%)`}
          v={formatoCOP(valorGanado * configuracion.comision)}
          s="Sobre ventas confirmadas"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta className="p-5">
          <div className="mb-3 font-semibold">Embudo por estado</div>
          <div className="space-y-2">
            {porEstado.map((e) => (
              <div key={e.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{e.nombre}</span>
                  <span className="font-semibold">{e.n}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(e.n / maxEstado) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Tarjeta>
        <Tarjeta className="p-5">
          <div className="mb-3 font-semibold">Por ciudad</div>
          <table className="w-full text-sm">
            <tbody>
              {[...porCiudad.entries()]
                .sort((a, b) => b[1].valor - a[1].valor)
                .map(([id, v]) => (
                  <tr key={id} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5">{nombreCiudad(db, id)}</td>
                    <td className="py-1.5 text-right text-slate-500">{v.n}</td>
                    <td className="py-1.5 text-right font-medium">{formatoCOP(v.valor)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Tarjeta>
        <Tarjeta className="p-5">
          <div className="mb-3 font-semibold">Procedimientos más pedidos</div>
          <ol className="space-y-1.5 text-sm">
            {[...porProc.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([nombre, n]) => (
                <li key={nombre} className="flex justify-between">
                  <span>{nombre}</span>
                  <span className="font-semibold">{n}</span>
                </li>
              ))}
          </ol>
        </Tarjeta>
      </div>

      <Tarjeta className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">Últimas solicitudes</div>
          <Link to="/admin/pedidos" className="text-sm text-brand-700 hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {pedidos.slice(0, 5).map((p) => (
            <Link key={p.id} to={`/admin/pedidos/${p.id}`} className="flex items-center gap-3 py-2 text-sm hover:bg-slate-50">
              <span className="w-20 font-mono">{p.id}</span>
              <span className="flex-1 truncate">{p.paciente.nombre}</span>
              <span className="hidden text-slate-500 sm:inline">{formatoFecha(p.creado)}</span>
              <EstadoBadge estado={p.estado} />
            </Link>
          ))}
        </div>
      </Tarjeta>
    </div>
  )
}

function Kpi({ t, v, s }: { t: string; v: string; s: string }) {
  return (
    <Tarjeta className="p-5">
      <div className="text-sm text-slate-500">{t}</div>
      <div className="mt-1 text-2xl font-bold">{v}</div>
      <div className="text-xs text-slate-500">{s}</div>
    </Tarjeta>
  )
}
