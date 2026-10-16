import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalogo } from '../catalogo'

export default function Buscador({ inicial = {} }: { inicial?: { procedimiento?: string; ciudad?: string; precio?: string } }) {
  const { datos } = useCatalogo()
  const navigate = useNavigate()
  const [procedimiento, setProcedimiento] = useState(inicial.procedimiento ?? '')
  const [ciudad, setCiudad] = useState(inicial.ciudad ?? '')
  const [precio, setPrecio] = useState(inicial.precio ?? '')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (procedimiento) p.set('procedimiento', procedimiento)
    if (ciudad) p.set('ciudad', ciudad)
    if (precio) p.set('precio', precio)
    navigate(`/explorar?${p}`)
  }

  return (
    <form onSubmit={enviar} className="grid bg-white text-tinta shadow-xl md:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="border-b border-arena px-5 py-3 md:border-r md:border-b-0">
        <span className="etiqueta">Procedimiento</span>
        <select value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
          <option value="">Todos los procedimientos</option>
          {datos?.procedimientos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="border-b border-arena px-5 py-3 md:border-r md:border-b-0">
        <span className="etiqueta">Ciudad</span>
        <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
          <option value="">Todo el Eje Cafetero</option>
          {datos?.ciudades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="border-b border-arena px-5 py-3 md:border-b-0">
        <span className="etiqueta">Precio</span>
        <select value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">
          <option value="">Cualquier estado</option>
          <option value="con">Con rango orientativo</option>
          <option value="sin">Sin precio informado</option>
        </select>
      </label>
      <button className="btn-oro m-2 md:px-8">Buscar opciones →</button>
    </form>
  )
}
