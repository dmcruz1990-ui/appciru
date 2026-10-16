import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { estadosPedido, formatoCOP, formatoFecha, formatoFechaHora, infoEstado } from '../../shared/format'
import { detallarOferta } from '../../shared/lookup'
import { agregarNotaPedido, cambiarEstadoPedido, useDB } from '../../shared/store'
import type { EstadoPedido } from '../../shared/types'
import { EstadoBadge, Tarjeta } from '../../shared/ui'

export default function PedidoDetalle() {
  const { id } = useParams()
  const db = useDB()
  const [nota, setNota] = useState('')
  const pedido = db.pedidos.find((p) => p.id === id)
  if (!pedido) return <div className="text-slate-500">Pedido no encontrado.</div>

  const oferta = db.ofertas.find((o) => o.id === pedido.ofertaId)
  const d = oferta && detallarOferta(db, oferta)
  const aloj = db.alojamientos.find((a) => a.id === pedido.alojamientoId)
  const extras = db.extras.filter((e) => pedido.extraIds.includes(e.id))
  const comision = pedido.totales.total * db.configuracion.comision
  const whatsapp = pedido.paciente.telefono.replace(/[^\d]/g, '')

  const mover = (estado: EstadoPedido) => {
    cambiarEstadoPedido(pedido.id, estado, nota.trim())
    setNota('')
  }

  return (
    <div className="space-y-4">
      <Link to="/admin/pedidos" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={14} /> Pedidos
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold">{pedido.id}</h1>
        <EstadoBadge estado={pedido.estado} />
        <span className="text-sm text-slate-500">Creado {formatoFechaHora(pedido.creado)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Tarjeta className="p-5">
            <div className="mb-3 font-semibold">Plan solicitado</div>
            {d ? (
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <Info t="Procedimiento" v={d.procedimiento.nombre} />
                <Info t="Cirujano" v={`${d.medico.nombre} (ReTHUS ${d.medico.rethus})`} />
                <Info t="Clínica" v={`${d.clinica.nombre} · REPS ${d.clinica.codigoREPS}`} />
                <Info t="Ciudad" v={d.ciudad.nombre} />
                <Info t="Fecha deseada" v={formatoFecha(pedido.fechaDeseada)} />
                <Info t="Alojamiento" v={aloj ? `${aloj.nombre} · ${pedido.noches} noches` : 'No requiere'} />
                <Info t="Extras" v={extras.length ? extras.map((e) => e.nombre).join(', ') : 'Ninguno'} />
              </div>
            ) : (
              <div className="text-sm text-slate-500">La oferta asociada ya no existe.</div>
            )}
            {pedido.comentarios && (
              <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm">
                <div className="text-xs font-semibold text-amber-800">Comentario del paciente</div>
                {pedido.comentarios}
              </div>
            )}
          </Tarjeta>

          <Tarjeta className="p-5">
            <div className="mb-3 font-semibold">Gestión</div>
            <textarea
              rows={2}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Nota (visible para el paciente en su línea de tiempo)…"
              className="input"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {estadosPedido
                .filter((e) => e.id !== pedido.estado)
                .map((e) => (
                  <button
                    key={e.id}
                    onClick={() => mover(e.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${e.color} hover:brightness-95`}
                  >
                    → {e.nombre}
                  </button>
                ))}
              <button
                disabled={!nota.trim()}
                onClick={() => {
                  agregarNotaPedido(pedido.id, nota.trim())
                  setNota('')
                }}
                className="ml-auto rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                Solo agregar nota
              </button>
            </div>
          </Tarjeta>

          <Tarjeta className="p-5">
            <div className="mb-3 font-semibold">Historial</div>
            <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
              {[...pedido.historial].reverse().map((h, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{infoEstado(h.estado).nombre}</span>
                    <span className="text-xs text-slate-400">
                      {formatoFechaHora(h.fecha)} · {h.autor}
                    </span>
                  </div>
                  {h.nota && <div className="text-slate-600">{h.nota}</div>}
                </li>
              ))}
            </ol>
          </Tarjeta>
        </div>

        <div className="space-y-4">
          <Tarjeta className="p-5">
            <div className="mb-2 font-semibold">Paciente</div>
            <div className="text-lg">{pedido.paciente.nombre}</div>
            <div className="text-sm text-slate-500">
              {pedido.paciente.pais}
              {pedido.paciente.edad ? ` · ${pedido.paciente.edad} años` : ''}
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <a href={`mailto:${pedido.paciente.email}`} className="flex items-center gap-2 hover:underline">
                <Mail size={14} /> {pedido.paciente.email}
              </a>
              <a href={`tel:${pedido.paciente.telefono}`} className="flex items-center gap-2 hover:underline">
                <Phone size={14} /> {pedido.paciente.telefono}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-700 hover:underline">
                <MessageCircle size={14} /> Escribir por WhatsApp
              </a>
            </div>
          </Tarjeta>
          <Tarjeta className="p-5 text-sm">
            <div className="mb-2 font-semibold">Valores</div>
            <Fila t="Cirugía" v={pedido.totales.cirugia} />
            <Fila t="Alojamiento" v={pedido.totales.alojamiento} />
            <Fila t="Extras" v={pedido.totales.extras} />
            <div className="my-2 border-t border-slate-200" />
            <Fila t="Total" v={pedido.totales.total} fuerte />
            <Fila t={`Comisión plataforma (${Math.round(db.configuracion.comision * 100)}%)`} v={comision} />
          </Tarjeta>
        </div>
      </div>
    </div>
  )
}

function Info({ t, v }: { t: string; v: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{t}</div>
      <div>{v}</div>
    </div>
  )
}

function Fila({ t, v, fuerte }: { t: string; v: number; fuerte?: boolean }) {
  return (
    <div className={`flex justify-between py-0.5 ${fuerte ? 'font-bold' : ''}`}>
      <span className={fuerte ? '' : 'text-slate-600'}>{t}</span>
      <span>{formatoCOP(v)}</span>
    </div>
  )
}
