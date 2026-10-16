import { nombreCategoria, nombreTipoInstitucion, textoPrecio, type OfertaDetallada } from '@plastinex/shared'
import { MapPin, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EstadoVerificacion, EtiquetaDemo } from './Insignias'

export default function OfertaCard({ d }: { d: OfertaDetallada }) {
  const { oferta, procedimiento, institucion, profesional, ciudad } = d
  const tienePrecio = oferta.precio_min != null || oferta.precio_max != null
  return (
    <article className="flex flex-col border border-arena bg-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(17,18,16,0.25)]">
      <Link to={`/procedimiento/${procedimiento.id}`} className="relative flex h-32 flex-col justify-end bg-gradient-to-br from-tinta to-tinta-2 p-4 text-white">
        <span className="kicker !text-[10px]">{nombreCategoria[procedimiento.categoria]}</span>
        <span className="titulo text-xl leading-tight">{procedimiento.nombre}</span>
        {institucion.es_demo && (
          <span className="absolute top-3 right-3">
            <EtiquetaDemo />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="text-[11px] tracking-[0.12em] text-piedra uppercase">{nombreTipoInstitucion[institucion.tipo]}</div>
          <Link to={`/institucion/${institucion.id}`} className="titulo text-lg leading-snug hover:text-oro-osc">
            {institucion.nombre}
          </Link>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-piedra">
            <MapPin size={12} /> {ciudad.nombre}
          </div>
        </div>
        {profesional && (
          <Link to={`/profesional/${profesional.id}`} className="text-sm hover:underline">
            {profesional.nombre}
            {profesional.valoracion_virtual && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-piedra">
                <Video size={12} /> virtual
              </span>
            )}
          </Link>
        )}
        <EstadoVerificacion v={institucion.verificacion} />
        <div className="mt-auto border-t border-arena pt-3">
          <div className={`font-medium ${tienePrecio ? '' : 'text-piedra'}`}>{textoPrecio(oferta.precio_min, oferta.precio_max)}</div>
          <div className="text-[11px] text-piedra">
            {tienePrecio ? 'Rango orientativo, no es una cotización.' : 'No inventamos precios: consulta al prestador.'}
          </div>
        </div>
        <Link to={`/solicitar?oferta=${oferta.id}`} className="btn-borde w-full">
          Solicitar valoración
        </Link>
      </div>
    </article>
  )
}
