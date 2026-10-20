import { detallarOfertas } from '@plastinex/shared'
import { Link } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import Carrusel from '../componentes/Carrusel'
import { BotonFavorito, useFavoritos } from '../componentes/favoritos'
import OfertaCard from '../componentes/OfertaCard'
import { useIdioma } from '../idioma'

/** Lo que el visitante guardó con el corazón (vive en su navegador). */
export default function Favoritos() {
  const { datos } = useCatalogo()
  const { lista } = useFavoritos()
  const { tx, dinero, tipoAlojamiento } = useIdioma()
  if (!datos) return null
  const ids = (tipo: string) => lista.filter((x) => x.startsWith(tipo + ':')).map((x) => x.slice(tipo.length + 1))
  const ofertas = detallarOfertas(datos).filter((d) => ids('oferta').includes(d.oferta.id))
  const alojamientos = datos.alojamientos.filter((a) => ids('alojamiento').includes(a.id))
  const instituciones = datos.instituciones.filter((i) => ids('institucion').includes(i.id))
  const vacio = !ofertas.length && !alojamientos.length && !instituciones.length

  return (
    <div className="contenedor pt-48 pb-28">
      <div className="rotulo">{tx('Tu selección', 'Your selection')}</div>
      <h1 className="display mt-4 text-4xl md:text-5xl">{tx('Favoritos', 'Saved')}</h1>
      <p className="mt-4 max-w-lg text-sm text-piedra">
        {tx(
          'Se guardan solo en este navegador. Úsalos para comparar con calma antes de solicitar tu valoración.',
          'Saved only in this browser. Use them to compare at your own pace before requesting a consultation.',
        )}
      </p>

      {vacio && (
        <div className="mt-16 border-y border-linea py-20 text-center">
          <p className="display normal-case text-3xl">{tx('Aún no has guardado nada.', "You haven't saved anything yet.")}</p>
          <p className="mt-3 text-sm text-piedra">{tx('Toca el corazón en cualquier opción o alojamiento para guardarlo aquí.', 'Tap the heart on any option or stay to save it here.')}</p>
          <Link to="/explorar" className="btn mt-8">
            {tx('Explorar opciones', 'Explore options')}
          </Link>
        </div>
      )}

      {instituciones.length > 0 && (
        <section className="mt-16">
          <div className="rotulo">{tx('Clínicas', 'Clinics')}</div>
          <ul className="mt-6 divide-y divide-linea border-y border-linea">
            {instituciones.map((i) => (
              <li key={i.id}>
                <Link to={`/institucion/${i.id}`} className="flex items-center justify-between gap-4 py-5 text-[15px] font-medium tracking-[0.1em] uppercase hover:underline">
                  {i.nombre} <span className="text-[11px] tracking-[0.2em] text-piedra">{tx('Ver', 'View')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ofertas.length > 0 && (
        <section className="mt-16">
          <div className="rotulo">{tx('Procedimientos', 'Procedures')}</div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {ofertas.map((d) => (
              <OfertaCard key={d.oferta.id} d={d} />
            ))}
          </div>
        </section>
      )}

      {alojamientos.length > 0 && (
        <section className="mt-16">
          <div className="rotulo">{tx('Alojamiento', 'Stays')}</div>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {alojamientos.map((a) => (
              <Link key={a.id} to={`/alojamiento/${a.id}`} className="group block">
                <Carrusel fotos={a.galeria ?? []} alt={a.nombre} semilla={a.nombre} respaldo={tipoAlojamiento(a.tipo)} className="aspect-[4/5]">
                  <BotonFavorito clave={`alojamiento:${a.id}`} className="absolute top-3 right-3" />
                </Carrusel>
                <div className="mt-4 text-[15px] font-medium tracking-[0.12em] uppercase">{a.nombre}</div>
                <div className="mt-1 text-[13px] text-piedra">{a.precio_noche_desde ? tx(`${dinero(a.precio_noche_desde)} noche`, `${dinero(a.precio_noche_desde)} night`) : tx('Precio por cotizar', 'Price on request')}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
