import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Dominio público para enlaces canónicos (plastinex.com cuando se conecte). */
export const SITIO = ((import.meta.env.VITE_URL_PUBLICA as string | undefined) ?? (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')

const TITULO_BASE = 'PLASTINEX | Cirugía plástica en el mundo'
const DESCRIPCION_BASE =
  'Compara clínicas y cirujanos plásticos en Colombia, Estados Unidos, México y otros destinos del mundo, y solicita tu valoración médica.'

function meta(atributo: 'name' | 'property', clave: string, valor: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${clave}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(atributo, clave)
    document.head.appendChild(el)
  }
  el.content = valor
}

/**
 * Título, descripción, URL canónica, Open Graph y datos estructurados (JSON-LD) de cada página,
 * para que Google y las redes muestren bien cada procedimiento, ciudad, clínica y cirujano.
 */
export function useSeo({ titulo, descripcion, jsonld, indexar = true }: { titulo?: string; descripcion?: string; jsonld?: object | null; indexar?: boolean }) {
  const { pathname } = useLocation()
  const ld = jsonld ? JSON.stringify(jsonld) : ''
  useEffect(() => {
    const t = titulo ? `${titulo} | PLASTINEX` : TITULO_BASE
    const d = (descripcion ?? DESCRIPCION_BASE).slice(0, 300)
    const url = SITIO + pathname
    document.title = t
    meta('name', 'description', d)
    meta('name', 'robots', indexar ? 'index, follow' : 'noindex, follow')
    meta('property', 'og:title', t)
    meta('property', 'og:description', d)
    meta('property', 'og:url', url)
    meta('property', 'og:type', 'website')
    meta('property', 'og:site_name', 'PLASTINEX')
    let canonica = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonica) {
      canonica = document.createElement('link')
      canonica.rel = 'canonical'
      document.head.appendChild(canonica)
    }
    canonica.href = url
    let script = document.getElementById('px-jsonld')
    if (ld) {
      if (!script) {
        script = document.createElement('script')
        script.id = 'px-jsonld'
        script.setAttribute('type', 'application/ld+json')
        document.head.appendChild(script)
      }
      script.textContent = ld
    } else script?.remove()
  }, [titulo, descripcion, ld, indexar, pathname])
}

/** Ruta limpia e indexable de un procedimiento, opcionalmente en una ciudad: /cirugia/rinoplastia/medellin. */
export const rutaCirugia = (procedimiento: string, ciudad?: string) => `/cirugia/${procedimiento}${ciudad ? `/${ciudad}` : ''}`
