import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, type ReactNode } from 'react'
import { useIdioma } from '../idioma'

export interface PuntoMapa {
  id: string
  lat: number
  lng: number
  /** Texto del marcador, por ejemplo «$ 9,5 M». */
  etiqueta: string
}

export interface Limites {
  norte: number
  sur: number
  este: number
  oeste: number
}

/**
 * Mapa con marcadores de precio, al estilo de los marketplaces de alojamiento.
 * Teselas en escala de grises de CARTO sobre datos de OpenStreetMap.
 */
export default function Mapa({
  puntos,
  activo,
  seleccionado,
  onSeleccion,
  onMover,
  tarjeta,
  className = '',
  zoomInicial,
}: {
  puntos: PuntoMapa[]
  activo?: string | null
  seleccionado?: string | null
  onSeleccion?: (id: string | null) => void
  onMover?: (l: Limites) => void
  /** Contenido flotante para el punto seleccionado (tarjeta resumida). */
  tarjeta?: ReactNode
  className?: string
  zoomInicial?: number
}) {
  const { tx } = useIdioma()
  const caja = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const capa = useRef<L.LayerGroup | null>(null)
  const marcadores = useRef(new Map<string, L.Marker>())
  const ajustado = useRef('')
  const encuadre = useRef<L.LatLngBounds | null>(null)
  const tocado = useRef(false)
  const cb = useRef({ onSeleccion, onMover })
  cb.current = { onSeleccion, onMover }

  // Crear el mapa una sola vez.
  useEffect(() => {
    if (!caja.current || mapa.current) return
    const m = L.map(caja.current, { zoomControl: false, scrollWheelZoom: true, attributionControl: true }).setView([4.81, -75.69], 11)
    L.control.zoom({ position: 'topright' }).addTo(m)
    m.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')
    // Si la persona mueve o acerca el mapa, ya no lo reencuadramos por ella.
    m.on('dragstart', () => (tocado.current = true))
    caja.current.addEventListener('wheel', () => (tocado.current = true), { passive: true })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(m)
    capa.current = L.layerGroup().addTo(m)
    m.on('click', () => cb.current.onSeleccion?.(null))
    m.on('moveend', () => {
      const b = m.getBounds()
      cb.current.onMover?.({ norte: b.getNorth(), sur: b.getSouth(), este: b.getEast(), oeste: b.getWest() })
    })
    mapa.current = m
    // El contenedor puede cambiar de tamaño (columna fija, alternar lista/mapa en celular).
    const ro = new ResizeObserver(() => {
      m.invalidateSize()
      if (encuadre.current && !tocado.current) m.fitBounds(encuadre.current, { padding: [60, 60], maxZoom: 14, animate: false })
    })
    ro.observe(caja.current)
    return () => {
      ro.disconnect()
      m.remove()
      mapa.current = null
      marcadores.current.clear()
    }
  }, [])

  // Dibujar los marcadores y encuadrarlos cuando cambia el conjunto de puntos.
  useEffect(() => {
    const m = mapa.current
    const g = capa.current
    if (!m || !g) return
    g.clearLayers()
    marcadores.current.clear()
    for (const p of puntos) {
      const mk = L.marker([p.lat, p.lng], { icon: icono(p.etiqueta, false), riseOnHover: true, keyboard: true, title: p.etiqueta })
      mk.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        cb.current.onSeleccion?.(p.id)
      })
      mk.addTo(g)
      marcadores.current.set(p.id, mk)
    }
    const firma = puntos.map((p) => p.id).sort().join(',')
    if (puntos.length && firma !== ajustado.current) {
      ajustado.current = firma
      m.invalidateSize()
      tocado.current = false
      if (puntos.length === 1) {
        encuadre.current = null
        m.setView([puntos[0].lat, puntos[0].lng], zoomInicial ?? 14)
      } else {
        encuadre.current = L.latLngBounds(puntos.map((p) => [p.lat, p.lng]))
        m.fitBounds(encuadre.current, { padding: [60, 60], maxZoom: 14 })
      }
    }
  }, [puntos, zoomInicial])

  // Botones de zoom en el idioma de la persona (Leaflet los crea en inglés).
  useEffect(() => {
    const c = caja.current
    if (!c) return
    for (const [clase, texto] of [
      ['.leaflet-control-zoom-in', tx('Acercar', 'Zoom in')],
      ['.leaflet-control-zoom-out', tx('Alejar', 'Zoom out')],
    ]) {
      const b = c.querySelector(clase)
      b?.setAttribute('title', texto)
      b?.setAttribute('aria-label', texto)
    }
  }, [tx])

  // Resaltar el marcador activo (al pasar por una tarjeta) o seleccionado.
  useEffect(() => {
    for (const [id, mk] of marcadores.current) {
      const p = puntos.find((x) => x.id === id)
      if (!p) continue
      const on = id === activo || id === seleccionado
      mk.setIcon(icono(p.etiqueta, on))
      mk.setZIndexOffset(on ? 1000 : 0)
    }
  }, [activo, seleccionado, puntos])

  return (
    <div className={`relative ${className}`} data-lenis-prevent>
      <div ref={caja} className="absolute inset-0 bg-arena" />
      {tarjeta && <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] flex justify-center">{tarjeta}</div>}
    </div>
  )
}

function icono(texto: string, activo: boolean) {
  return L.divIcon({
    className: '',
    html: `<span class="px-pin${activo ? ' px-pin-activo' : ''}">${escapar(texto)}</span>`,
    iconSize: undefined,
    iconAnchor: [0, 0],
  })
}

const escapar = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/** «$ 9.500.000» → «$ 9,5 M»; «$ 230.000» → «$ 230 mil». */
export function precioCorto(v: number | null | undefined): string {
  if (v == null) return 'Valorar'
  if (v >= 1_000_000) return `$ ${(v / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`
  return `$ ${Math.round(v / 1000)} mil`
}
