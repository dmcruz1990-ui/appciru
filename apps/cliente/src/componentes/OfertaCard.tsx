import { nombreCategoria, textoPrecio, type OfertaDetallada } from '@plastinex/shared'
import { Link } from 'react-router-dom'
import Carrusel from './Carrusel'
import { BotonFavorito } from './favoritos'
import { EstadoVerificacion, EtiquetaDemo } from './Insignias'

/** Fotos de una oferta: las de la institución primero y la del procedimiento al final, sin repetir. */
export const fotosOferta = (d: OfertaDetallada) =>
  [...new Set([d.institucion.imagen_url, ...(d.institucion.galeria ?? []), d.procedimiento.imagen_url].filter((x): x is string => !!x))]

/** Tarjeta tipo ficha de producto: fotos deslizables, favorito, nombre en mayúsculas y datos mínimos. */
export default function OfertaCard({
  d,
  indice,
  onResaltar,
  consulta = '',
}: {
  d: OfertaDetallada
  indice?: number
  /** Parámetros de la búsqueda (fechas, presupuesto) que viajan a la ficha. */
  consulta?: string
  /** Avisa al mapa qué tarjeta tiene el cursor encima. */
  onResaltar?: (id: string | null) => void
}) {
  const { oferta, procedimiento, institucion, profesional, ciudad } = d
  const ficha = `/institucion/${institucion.id}?oferta=${oferta.id}${consulta ? `&${consulta}` : ''}`
  return (
    <article className="group flex flex-col" onMouseEnter={() => onResaltar?.(institucion.id)} onMouseLeave={() => onResaltar?.(null)}>
      <Link to={ficha} className="block" aria-label={`${procedimiento.nombre} en ${institucion.nombre}`}>
        <Carrusel fotos={fotosOferta(d)} alt={procedimiento.nombre} semilla={procedimiento.nombre} respaldo={procedimiento.nombre} className="aspect-[4/5]">
          <BotonFavorito clave={`oferta:${oferta.id}`} className="absolute top-3 right-3" />
          {institucion.es_demo && (
            <span className="absolute top-4 left-4">
              <EtiquetaDemo claro />
            </span>
          )}
        </Carrusel>
      </Link>
      <div className="mt-4 min-w-0">
        <div className="rotulo !text-[10px]">
          {indice != null && <span className="mr-2 text-arcilla">{String(indice + 1).padStart(2, '0')}</span>}
          {nombreCategoria[procedimiento.categoria]} · {ciudad.nombre}
        </div>
        <h3 className="mt-2 text-[15px] leading-snug font-medium tracking-[0.12em] uppercase">
          <Link to={ficha} className="underline-offset-4 hover:underline">
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
      <div className="mt-4 border-t border-linea pt-4 text-[15px]">{textoPrecio(oferta.precio_min, oferta.precio_max)}</div>
      <div className="mt-1.5 flex items-end justify-between gap-4">
        <div>
          <EstadoVerificacion v={institucion.verificacion} />
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
