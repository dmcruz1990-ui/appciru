import { nombreCategoria, textoPrecio, type OfertaDetallada } from '@plastinex/shared'
import { Link } from 'react-router-dom'
import { Foto } from './base'
import { EstadoVerificacion, EtiquetaDemo } from './Insignias'

/** Tarjeta editorial: foto vertical, procedimiento en serif, datos mínimos. */
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
          <h3 className="mt-2 font-serif text-[28px] leading-tight">
            <Link to={`/procedimiento/${procedimiento.id}`} className="hover:italic">
              {procedimiento.nombre}
            </Link>
          </h3>
          <div className="mt-1 text-sm text-piedra">
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
        </div>
        <Link to={`/solicitar?oferta=${oferta.id}`} className="text-sm whitespace-nowrap text-espresso underline decoration-espresso/30 underline-offset-4 hover:decoration-espresso">
          Solicitar valoración
        </Link>
      </div>
    </article>
  )
}
