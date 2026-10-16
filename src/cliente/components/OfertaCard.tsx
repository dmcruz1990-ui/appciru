import { BadgeCheck, Building2, MapPin, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatoCOP, formatoUSD } from '../../shared/format'
import type { OfertaDetallada } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import { Avatar, Estrellas, Insignia } from '../../shared/ui'

export default function OfertaCard({ d }: { d: OfertaDetallada }) {
  const { configuracion } = useDB()
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg">
      <Link
        to={`/procedimiento/${d.procedimiento.id}`}
        className={`relative flex h-28 items-end bg-gradient-to-br ${d.clinica.color} p-3 text-white`}
      >
        <span className="text-lg leading-tight font-semibold drop-shadow">{d.procedimiento.nombre}</span>
        {d.clinica.acreditadaICONTEC && (
          <Insignia className="absolute top-2 right-2 bg-white/90 text-slate-800">Acreditada</Insignia>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link to={`/medico/${d.medico.id}`} className="flex items-center gap-2 hover:underline">
          <Avatar nombre={d.medico.nombre} className="h-9 w-9 text-xs" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{d.medico.nombre}</div>
            <Estrellas valor={d.medico.calificacion} resenas={d.medico.resenas} size={12} />
          </div>
        </Link>
        <div className="space-y-0.5 text-xs text-slate-600">
          <Link to={`/clinica/${d.clinica.id}`} className="flex items-center gap-1 hover:underline">
            <Building2 size={12} /> {d.clinica.nombre}
          </Link>
          <div className="flex items-center gap-1">
            <MapPin size={12} /> {d.ciudad.nombre}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <Insignia className="bg-brand-50 text-brand-700">
            <BadgeCheck size={12} /> Verificado
          </Insignia>
          {d.medico.valoracionVirtual && (
            <Insignia className="bg-sky-50 text-sky-700">
              <Video size={12} /> Valoración virtual
            </Insignia>
          )}
        </div>
        <div className="mt-auto pt-2">
          <div className="text-xs text-slate-500">Desde</div>
          <div className="text-xl font-bold">{formatoCOP(d.oferta.precio)}</div>
          <div className="text-xs text-slate-500">≈ {formatoUSD(d.oferta.precio, configuracion.tasaUSD)} USD</div>
        </div>
        <Link
          to={`/plan/${d.oferta.id}`}
          className="mt-1 rounded-full bg-accent-400 py-2 text-center text-sm font-semibold text-slate-900 hover:bg-accent-500"
        >
          Armar mi plan
        </Link>
      </div>
    </div>
  )
}
