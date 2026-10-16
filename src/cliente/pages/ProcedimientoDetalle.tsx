import { BedDouble, Check, Clock, Syringe } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { formatoCOP, nombreCategoria } from '../../shared/format'
import { ofertasPublicas } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import { Tarjeta } from '../../shared/ui'
import OfertaCard from '../components/OfertaCard'
import NoEncontrado from '../components/NoEncontrado'

export default function ProcedimientoDetalle() {
  const { id } = useParams()
  const db = useDB()
  const proc = db.procedimientos.find((p) => p.id === id && p.activo)
  if (!proc) return <NoEncontrado />

  const opciones = ofertasPublicas(db)
    .filter((d) => d.procedimiento.id === proc.id)
    .sort((a, b) => a.oferta.precio - b.oferta.precio)
  const precios = opciones.map((o) => o.oferta.precio)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="text-sm text-brand-700">{nombreCategoria[proc.categoria]}</div>
      <h1 className="text-3xl font-bold">{proc.nombre}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">{proc.descripcion}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Dato icono={<Clock size={16} />} titulo="Duración" valor={`${proc.duracionHoras} h aprox.`} />
        <Dato icono={<Syringe size={16} />} titulo="Anestesia" valor={proc.anestesia} />
        <Dato icono={<BedDouble size={16} />} titulo="Hospitalización" valor={proc.hospitalizacionNoches ? `${proc.hospitalizacionNoches} noche(s)` : 'Ambulatoria'} />
        <Dato icono={<Clock size={16} />} titulo="Estadía recomendada" valor={`${proc.estadiaRecomendadaDias} días en la ciudad`} />
      </div>

      <Tarjeta className="mt-6 p-5">
        <div className="mb-2 font-semibold">Normalmente incluye</div>
        <ul className="grid gap-1 text-sm sm:grid-cols-2">
          {proc.incluye.map((i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={14} className="text-brand-600" /> {i}
            </li>
          ))}
        </ul>
      </Tarjeta>

      <div className="mt-10 mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-2xl font-bold">{opciones.length} cirujanos ofrecen este procedimiento</h2>
        {precios.length > 0 && (
          <div className="text-sm text-slate-600">
            Rango: {formatoCOP(Math.min(...precios))} – {formatoCOP(Math.max(...precios))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {opciones.map((d) => (
          <OfertaCard key={d.oferta.id} d={d} />
        ))}
      </div>
    </div>
  )
}

function Dato({ icono, titulo, valor }: { icono: React.ReactNode; titulo: string; valor: string }) {
  return (
    <Tarjeta className="p-4">
      <div className="flex items-center gap-1 text-xs text-slate-500">
        {icono} {titulo}
      </div>
      <div className="mt-1 font-semibold">{valor}</div>
    </Tarjeta>
  )
}
