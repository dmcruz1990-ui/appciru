import { CircleCheck } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'

export default function Confirmacion() {
  const estado = useLocation().state as { codigo?: string; email?: string; nombre?: string } | null
  if (!estado?.codigo) return <Navigate to="/seguimiento" replace />

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <CircleCheck size={44} className="mx-auto text-oro" strokeWidth={1.5} />
      <h1 className="titulo mt-4 text-4xl">
        Recibimos tu <em>solicitud.</em>
      </h1>
      <p className="mt-3 text-piedra">
        {estado.nombre?.split(' ')[0]}, un coordinador te contactará por correo o WhatsApp para agendar la valoración. Guarda tu
        código para consultar el estado.
      </p>
      <div className="mx-auto mt-8 inline-block border border-oro bg-white px-8 py-5">
        <div className="etiqueta">Código de seguimiento</div>
        <div className="font-mono text-3xl tracking-widest">{estado.codigo}</div>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link to={`/seguimiento?codigo=${estado.codigo}`} state={{ email: estado.email }} className="btn-tinta">
          Ver estado
        </Link>
        <Link to="/explorar" className="btn-borde">
          Seguir explorando
        </Link>
      </div>
    </div>
  )
}
