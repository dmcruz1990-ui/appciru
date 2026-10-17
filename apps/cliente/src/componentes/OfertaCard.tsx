import { nombreCategoria, textoPrecio, type OfertaDetallada } from '@plastinex/shared'
import { Link } from 'react-router-dom'
import { Foto } from './base'
import { EstadoVerificacion, EtiquetaDemo } from './Insignias'

/** Tarjeta tipo ficha de producto: foto vertical, nombre en mayúsculas, datos mínimos. */
export default function OfertaCard({ d, indice }: { d: OfertaDetallada; indice?: number }) {
  const { oferta, procedimiento, institucion, profesional, ciudad } = d
  const imagen = institucion.imagen_url ?? procedimiento.imagen_url
  return (
    <article className="group flex flex-col">
      <Link to={`/solicitar?oferta=${oferta.id}`} className="block" aria-label={`${procedimiento.nombre} en ${institucion.nombre}`}>
        <Foto src={imagen} alt={procedimiento.nombre} ancho={800} className="aspect-[4/5]" zoom respaldo={procedimiento.nombre} />
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="rotulo !text-[10px]">
            {indice != null && <span className="mr-2 text-arcilla">{String(indice + 1).padStart(2, '0')}</span>}
            {nombreCategoria[procedimiento.categoria]} · {ciudad.nombre}
          </div>
          <h3 className="mt-3 text-[15px] leading-snug font-medium tracking-[0.12em] uppercase">
            <Link to={`/procedimiento/${procedimiento.id}`} className="underline-offset-4 hover:underline">
              {procedimiento.nombre}
            </Link>
          </h3>
          <div className="mt-1.5 text-[13px] text-piedra">
            <Link to={`/institucion/${institucion.id}`} className="hover:text-espresso">
              {institucion.nombre}
            </Link>
            {profesional && (
              <>
                {' · '}
                <Link to={`/profesional/${profesional.id}`} className="hover:text-espresso">
                  {profesional.nombre}
                </Link>
              </>
            )}
          </div>
        </div>
        {institucion.es_demo && (
          <span className="shrink-0 pt-1">
            <EtiquetaDemo />
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end justify-between gap-4 border-t border-linea pt-4">
        <div>
          <div className="text-[15px]">{textoPrecio(oferta.precio_min, oferta.precio_max)}</div>
          <div className="mt-1">
            <EstadoVerificacion v={institucion.verificacion} />
          </div>
          {(institucion.valoracion_precio === 0 || institucion.financiacion) && (
            <div className="mt-1 text-xs text-piedra">
              {[institucion.valoracion_precio === 0 && 'Valoración sin costo', institucion.financiacion && 'Financiación'].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
        <Link to={`/solicitar?oferta=${oferta.id}`} className="text-[11px] font-medium tracking-[0.2em] whitespace-nowrap text-espresso uppercase underline decoration-espresso/30 underline-offset-[6px] hover:decoration-espresso">
          Solicitar valoración
        </Link>
      </div>
    </article>
  )
}
