import { destinos, formatoCOP, nombreTipoAlojamiento, type TipoAlojamiento } from '@plastinex/shared'
import { BedDouble, Hotel, House, LayoutGrid, List, Map as IconoMapa } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import Carrusel from '../componentes/Carrusel'
import { BotonFavorito } from '../componentes/favoritos'
import { EtiquetaDemo } from '../componentes/Insignias'
import Mapa, { precioCorto } from '../componentes/Mapa'

const iconoTipo: Record<TipoAlojamiento, ReactNode> = {
  casa_recobro: <House size={20} strokeWidth={1.4} />,
  hotel: <Hotel size={20} strokeWidth={1.4} />,
  apartamento: <BedDouble size={20} strokeWidth={1.4} />,
}

/** Alojamiento de recuperación cerca de las clínicas, con precio por noche en el mapa. */
export default function Alojamientos() {
  const { datos } = useCatalogo()
  const [params, setParams] = useSearchParams()
  const [resaltado, setResaltado] = useState<string | null>(null)
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const ciudad = params.get('ciudad') ?? ''
  const tipo = (params.get('tipo') ?? '') as TipoAlojamiento | ''
  const enfermeria = params.get('enfermeria') === '1'
  const vista = params.get('vista') === 'mapa' ? 'mapa' : 'lista'

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const lista = useMemo(
    () =>
      (datos?.alojamientos ?? []).filter(
        (a) => a.publicado && (!ciudad || a.ciudad_id === ciudad) && (!tipo || a.tipo === tipo) && (!enfermeria || a.incluye_enfermeria),
      ),
    [datos, ciudad, tipo, enfermeria],
  )
  const puntos = useMemo(
    () => lista.filter((a) => a.lat != null && a.lng != null).map((a) => ({ id: a.id, lat: a.lat!, lng: a.lng!, etiqueta: precioCorto(a.precio_noche_desde) })),
    [lista],
  )
  if (!datos) return null
  const sel = lista.find((a) => a.id === seleccionado)

  return (
    <div className="pt-16 md:pt-[124px]">
      <div className="border-b border-linea">
        <div className="contenedor pt-10 pb-4">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="rotulo">Recuperación</div>
              <h1 className="display mt-4 text-3xl md:text-5xl">
                Dónde <em>recuperarte</em>
              </h1>
            </div>
            <p className="max-w-sm text-sm text-piedra">
              Casas de recobro con enfermería, hoteles y apartamentos cerca de las clínicas. Precios desde, por noche; se confirman al cotizar.
            </p>
          </div>
          <div className="mt-8 flex gap-8 overflow-x-auto text-[11px] font-medium tracking-[0.18em] whitespace-nowrap uppercase">
            <Pestana activa={!tipo} onClick={() => set('tipo', '')} icono={<LayoutGrid size={20} strokeWidth={1.4} />} texto="Todo" />
            {(Object.keys(nombreTipoAlojamiento) as TipoAlojamiento[]).map((t) => (
              <Pestana key={t} activa={tipo === t} onClick={() => set('tipo', t)} icono={iconoTipo[t]} texto={nombreTipoAlojamiento[t]} />
            ))}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(400px,40%)]">
        <div className={`contenedor !max-w-none py-8 lg:!px-10 ${vista === 'mapa' ? 'hidden lg:block' : ''}`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <span className="font-medium">
              {lista.length} {lista.length === 1 ? 'alojamiento' : 'alojamientos'}
            </span>
            <select value={ciudad} onChange={(e) => set('ciudad', e.target.value)} className="cursor-pointer border-b border-linea bg-transparent py-1 outline-none" aria-label="Ciudad">
              <option value="">Todos los destinos</option>
              {destinos(datos).map((d) => {
                const conAloj = d.ciudades.filter(({ ciudad: c }) => datos.alojamientos.some((a) => a.publicado && a.ciudad_id === c.id))
                return conAloj.length ? (
                  <optgroup key={d.pais} label={d.nombre}>
                    {conAloj.map(({ ciudad: c }) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </optgroup>
                ) : null
              })}
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-piedra">
              <input type="checkbox" checked={enfermeria} onChange={(e) => set('enfermeria', e.target.checked ? '1' : '')} className="accent-espresso" />
              Con enfermería
            </label>
          </div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3">
            {lista.map((a) => (
              <Link key={a.id} to={`/alojamiento/${a.id}`} className="group block" onMouseEnter={() => setResaltado(a.id)} onMouseLeave={() => setResaltado(null)}>
                <Carrusel fotos={a.galeria ?? []} alt={a.nombre} semilla={a.nombre} respaldo={nombreTipoAlojamiento[a.tipo]} className="aspect-[4/5]">
                  <BotonFavorito clave={`alojamiento:${a.id}`} className="absolute top-3 right-3" />
                  {a.es_demo && (
                    <span className="absolute top-4 left-4">
                      <EtiquetaDemo claro />
                    </span>
                  )}
                </Carrusel>
                <div className="mt-4 rotulo !text-[10px]">
                  {nombreTipoAlojamiento[a.tipo]} · {datos.ciudades.find((c) => c.id === a.ciudad_id)?.nombre}
                </div>
                <div className="mt-2 text-[15px] font-medium tracking-[0.12em] uppercase">{a.nombre}</div>
                <div className="mt-1.5 text-[13px] text-piedra">
                  {[a.incluye_enfermeria && 'Enfermería', a.incluye_alimentacion && 'Alimentación', a.capacidad && `Hasta ${a.capacidad} personas`].filter(Boolean).join(' · ') || a.descripcion}
                </div>
                <div className="mt-3 border-t border-linea pt-3 text-[15px]">
                  {a.precio_noche_desde ? (
                    <>
                      <span className="font-medium">{formatoCOP(a.precio_noche_desde)}</span> <span className="text-piedra">noche</span>
                    </>
                  ) : (
                    'Precio por cotizar'
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={`${vista === 'mapa' ? 'block' : 'hidden'} lg:block`}>
          <div className="relative h-[calc(100svh-64px)] lg:sticky lg:top-20 lg:h-[calc(100svh-80px)]">
            <Mapa
              puntos={puntos}
              activo={resaltado}
              seleccionado={seleccionado}
              onSeleccion={setSeleccionado}
              className="h-full"
              tarjeta={
                sel && (
                  <Link
                    to={`/alojamiento/${sel.id}`}
                    className="pointer-events-auto flex w-full max-w-sm items-center gap-4 border border-linea bg-marfil p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="rotulo !text-[10px]">{nombreTipoAlojamiento[sel.tipo]}</div>
                      <div className="mt-1 truncate text-[14px] font-medium tracking-[0.1em] uppercase">{sel.nombre}</div>
                      <div className="mt-1 text-[13px] text-piedra">{sel.precio_noche_desde ? `${formatoCOP(sel.precio_noche_desde)} noche` : 'Precio por cotizar'}</div>
                    </div>
                    <span className="text-[11px] font-medium tracking-[0.2em] uppercase underline underline-offset-[6px]">Ver</span>
                  </Link>
                )
              }
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => set('vista', vista === 'mapa' ? '' : 'mapa')}
        className="fixed bottom-6 left-1/2 z-[600] flex -translate-x-1/2 items-center gap-2 bg-espresso px-6 py-3.5 text-[11px] font-medium tracking-[0.2em] text-marfil uppercase shadow-[0_10px_30px_rgba(0,0,0,0.3)] lg:hidden"
      >
        {vista === 'mapa' ? <List size={15} strokeWidth={1.6} /> : <IconoMapa size={15} strokeWidth={1.6} />}
        {vista === 'mapa' ? 'Mostrar lista' : 'Mostrar mapa'}
      </button>
    </div>
  )
}

export function Pestana({ activa, onClick, icono, texto }: { activa: boolean; onClick: () => void; icono: ReactNode; texto: string }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex shrink-0 flex-col items-center gap-2 border-b-2 pt-1 pb-3 transition ${activa ? 'border-espresso text-espresso' : 'border-transparent text-piedra hover:border-linea hover:text-espresso'}`}
    >
      {icono}
      {texto}
    </button>
  )
}
