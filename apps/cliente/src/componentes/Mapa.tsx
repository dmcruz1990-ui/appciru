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
  /** Precio desde, para que un grupo muestre el más bajo. */
  desde?: number | null
}

export interface Limites {
  norte: number
  sur: number
  este: number
  oeste: number
}

/**
 * Mapa con marcadores de precio, al estilo de los marketplaces de alojamiento.
 * Teselas en escala de grises de CARTO sobre datos de OpenStreetMap. Los marcadores que se
 * tocan en pantalla se agrupan en uno con el número de opciones; al tocarlo, el mapa se acerca.
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
  const marcadores = useRef(new Map<string, { mk: L.Marker; grupo: PuntoMapa[] }>())
  const dibujar = useRef<() => void>(() => {})
  const ajustado = useRef('')
  const encuadre = useRef<L.LatLngBounds | null>(null)
  const tocado = useRef(false)
  const cb = useRef({ onSeleccion, onMover })
  cb.current = { onSeleccion, onMover }

  // Crear el mapa una sola vez.
  useEffect(() => {
    if (!caja.current || mapa.current) return
    const m = L.map(caja.current, { zoomControl: false, scrollWheelZoom: true, attributionControl: true }).setView([20, -30], 2)
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
    m.on('zoomend', () => dibujar.current())
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

  // Dibujar los marcadores (agrupados según el zoom) y encuadrarlos cuando cambia el conjunto de puntos.
  useEffect(() => {
    const m = mapa.current
    const g = capa.current
    if (!m || !g) return
    dibujar.current = () => {
      g.clearLayers()
      marcadores.current.clear()
      for (const grupo of agrupar(m, puntos)) {
        const p = grupo[0]
        const centro = grupo.length === 1 ? L.latLng(p.lat, p.lng) : L.latLngBounds(grupo.map((x) => [x.lat, x.lng])).getCenter()
        const texto = grupo.length === 1 ? p.etiqueta : `${p.etiqueta} · ${grupo.length}`
        const mk = L.marker(centro, { icon: icono(texto, false), riseOnHover: true, keyboard: true, title: texto })
        mk.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          if (grupo.length === 1) return cb.current.onSeleccion?.(p.id)
          tocado.current = true
          m.fitBounds(L.latLngBounds(grupo.map((x) => [x.lat, x.lng])), { padding: [80, 80], maxZoom: 14 })
        })
        mk.addTo(g)
        for (const x of grupo) marcadores.current.set(x.id, { mk, grupo })
      }
      resaltar.current()
    }
    const firma = puntos.map((p) => p.id).sort().join(',')
    if (puntos.length && firma !== ajustado.current) {
      ajustado.current = firma
      m.invalidateSize()
      tocado.current = false
      if (puntos.length === 1) {
        encuadre.current = null
        m.setView([puntos[0].lat, puntos[0].lng], zoomInicial ?? 14, { animate: false })
      } else {
        encuadre.current = L.latLngBounds(puntos.map((p) => [p.lat, p.lng]))
        m.fitBounds(encuadre.current, { padding: [60, 60], maxZoom: 14, animate: false })
      }
    }
    dibujar.current()
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

  // Resaltar el marcador activo (al pasar por una tarjeta) o seleccionado; en un grupo, el grupo entero.
  const resaltar = useRef<() => void>(() => {})
  resaltar.current = () => {
    const vistos = new Set<L.Marker>()
    for (const { mk, grupo } of marcadores.current.values()) {
      if (vistos.has(mk)) continue
      vistos.add(mk)
      const on = grupo.some((x) => x.id === activo || x.id === seleccionado)
      const texto = grupo.length === 1 ? grupo[0].etiqueta : `${grupo[0].etiqueta} · ${grupo.length}`
      mk.setIcon(icono(texto, on))
      mk.setZIndexOffset(on ? 1000 : 0)
    }
  }
  useEffect(() => resaltar.current(), [activo, seleccionado, puntos])

  return (
    <div className={`relative ${className}`} data-lenis-prevent>
      <div ref={caja} className="absolute inset-0 bg-arena" />
      {tarjeta && <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] flex justify-center">{tarjeta}</div>}
    </div>
  )
}

/** Agrupa los puntos cuyos marcadores se solaparían en pantalla; el primero de cada grupo es el más barato. */
function agrupar(m: L.Map, puntos: PuntoMapa[]): PuntoMapa[][] {
  const grupos: { x: number; y: number; puntos: PuntoMapa[] }[] = []
  const orden = [...puntos].sort((a, b) => (a.desde ?? Infinity) - (b.desde ?? Infinity))
  for (const p of orden) {
    const px = m.latLngToLayerPoint([p.lat, p.lng])
    const g = grupos.find((x) => Math.abs(x.x - px.x) < 70 && Math.abs(x.y - px.y) < 34)
    if (g) g.puntos.push(p)
    else grupos.push({ x: px.x, y: px.y, puntos: [p] })
  }
  return grupos.map((g) => g.puntos)
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
