import { motion } from 'motion/react'
import { Link, Navigate, useLocation } from 'react-router-dom'

export default function Confirmacion() {
  const estado = useLocation().state as { codigo?: string } | null
  if (!estado?.codigo) return <Navigate to="/cuenta" replace />

  return (
    <div className="contenedor flex min-h-[85vh] flex-col items-center justify-center pt-28 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
        <div className="rotulo">Solicitud recibida</div>
        <h1 className="display mt-6 text-4xl md:text-5xl">
          Gracias. <em>Te escribimos pronto.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-piedra">
          Un coordinador te contactará por correo o WhatsApp para agendar tu valoración. Puedes seguir el proceso desde tu cuenta.
        </p>
        <div className="mt-10 font-serif text-3xl tracking-[0.2em]">{estado.codigo}</div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link to="/cuenta" className="btn">
            Ver mis solicitudes
          </Link>
          <Link to="/explorar" className="btn-linea">
            Seguir explorando
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
