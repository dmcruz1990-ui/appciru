import { formatoCOP, formatoFecha, formatoFechaHora, infoEstado } from '../../shared/format'
import { detallarOferta } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import type { Pedido } from '../../shared/types'
import { EstadoBadge, Tarjeta } from '../../shared/ui'

/** Vista del pedido para el paciente: plan elegido, total y línea de tiempo. */
export default function ResumenPedido({ pedido }: { pedido: Pedido }) {
  const db = useDB()
  const oferta = db.ofertas.find((o) => o.id === pedido.ofertaId)
  const d = oferta && detallarOferta(db, oferta)
  const aloj = db.alojamientos.find((a) => a.id === pedido.alojamientoId)
  const extras = db.extras.filter((e) => pedido.extraIds.includes(e.id))

  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">Solicitud</div>
          <div className="font-mono font-semibold">{pedido.id}</div>
        </div>
        <EstadoBadge estado={pedido.estado} />
      </div>
      {d && (
        <div className="mt-3 text-sm">
          <div className="font-semibold">{d.procedimiento.nombre}</div>
          <div className="text-slate-600">
            {d.medico.nombre} · {d.clinica.nombre}, {d.ciudad.nombre}
          </div>
        </div>
      )}
      <div className="mt-2 text-sm text-slate-600">Fecha deseada: {formatoFecha(pedido.fechaDeseada)}</div>
      {aloj && (
        <div className="text-sm text-slate-600">
          Alojamiento: {aloj.nombre} · {pedido.noches} noches
        </div>
      )}
      {extras.length > 0 && <div className="text-sm text-slate-600">Extras: {extras.map((e) => e.nombre).join(', ')}</div>}
      <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
        <span className="font-semibold">Total estimado</span>
        <span className="font-bold">{formatoCOP(pedido.totales.total)}</span>
      </div>
      <ol className="mt-4 space-y-2 border-l-2 border-slate-200 pl-4">
        {pedido.historial.map((h, i) => (
          <li key={i} className="text-sm">
            <div className="font-medium">{infoEstado(h.estado).nombre}</div>
            <div className="text-xs text-slate-500">{formatoFechaHora(h.fecha)}</div>
            {h.nota && <div className="text-slate-600">{h.nota}</div>}
          </li>
        ))}
      </ol>
    </Tarjeta>
  )
}
