import { useState } from 'react'
import { actualizarConfiguracion, reiniciarDemo, useDB } from '../../shared/store'
import { Tarjeta } from '../../shared/ui'

export default function Configuracion() {
  const { configuracion } = useDB()
  const [comision, setComision] = useState(String(Math.round(configuracion.comision * 100)))
  const [tasa, setTasa] = useState(String(configuracion.tasaUSD))
  const [guardado, setGuardado] = useState(false)

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Tarjeta className="space-y-3 p-5">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Comisión de la plataforma (%)</span>
          <input type="number" min={0} max={50} value={comision} onChange={(e) => setComision(e.target.value)} className="input" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-slate-600">Tasa de referencia COP por USD</span>
          <input type="number" min={1} value={tasa} onChange={(e) => setTasa(e.target.value)} className="input" />
        </label>
        <button
          onClick={() => {
            actualizarConfiguracion({ comision: Number(comision) / 100, tasaUSD: Number(tasa) })
            setGuardado(true)
            setTimeout(() => setGuardado(false), 2000)
          }}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Guardar
        </button>
        {guardado && <span className="ml-3 text-sm text-emerald-700">Guardado</span>}
      </Tarjeta>
      <Tarjeta className="p-5">
        <div className="font-semibold">Datos de demostración</div>
        <p className="mt-1 text-sm text-slate-600">Restaura el catálogo y los pedidos de ejemplo. Se borran los cambios hechos.</p>
        <button
          onClick={() => confirm('¿Restaurar todos los datos de demostración?') && reiniciarDemo()}
          className="mt-3 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Restaurar demo
        </button>
      </Tarjeta>
    </div>
  )
}
