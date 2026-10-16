import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDB } from '../../shared/store'
import ResumenPedido from '../components/ResumenPedido'

// Provisional: búsqueda por correo. En producción esto va detrás de inicio de sesión
// (enlace mágico / OTP) para no exponer datos de salud.
export default function MisSolicitudes() {
  const db = useDB()
  const [params, setParams] = useSearchParams()
  const email = params.get('email') ?? ''
  const [valor, setValor] = useState(email)

  const consultar = (e: FormEvent) => {
    e.preventDefault()
    setParams(valor ? { email: valor.trim().toLowerCase() } : {})
  }

  const pedidos = email ? db.pedidos.filter((p) => p.paciente.email === email) : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Mis solicitudes</h1>
      <form onSubmit={consultar} className="mt-4 flex gap-2">
        <input type="email" required value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Tu correo" className="input" />
        <button className="rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Consultar</button>
      </form>
      <div className="mt-6 space-y-4">
        {email && pedidos.length === 0 && <p className="text-slate-500">No hay solicitudes asociadas a {email}.</p>}
        {pedidos.map((p) => (
          <ResumenPedido key={p.id} pedido={p} />
        ))}
      </div>
    </div>
  )
}
