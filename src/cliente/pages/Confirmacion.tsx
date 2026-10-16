import { CircleCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useDB } from '../../shared/store'
import NoEncontrado from '../components/NoEncontrado'
import ResumenPedido from '../components/ResumenPedido'

export default function Confirmacion() {
  const { pedidoId } = useParams()
  const db = useDB()
  const pedido = db.pedidos.find((p) => p.id === pedidoId)
  if (!pedido) return <NoEncontrado texto="No encontramos esta solicitud." />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 text-center">
        <CircleCheck size={48} className="mx-auto text-brand-600" />
        <h1 className="mt-2 text-2xl font-bold">¡Recibimos tu solicitud, {pedido.paciente.nombre.split(' ')[0]}!</h1>
        <p className="mt-1 text-slate-600">
          Un coordinador te escribirá a <b>{pedido.paciente.email}</b> o por WhatsApp para agendar tu valoración.
        </p>
      </div>
      <ResumenPedido pedido={pedido} />
      <div className="mt-6 flex justify-center gap-4 text-sm">
        <Link to={`/mis-solicitudes?email=${encodeURIComponent(pedido.paciente.email)}`} className="text-brand-700 hover:underline">
          Ver mis solicitudes
        </Link>
        <Link to="/buscar" className="text-brand-700 hover:underline">
          Seguir explorando
        </Link>
      </div>
    </div>
  )
}
