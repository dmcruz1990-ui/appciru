import { Heart } from 'lucide-react'
import { useSyncExternalStore, type MouseEvent } from 'react'

/** Favoritos del visitante, guardados solo en su navegador (no se envían a ningún servidor). */
const CLAVE = 'px-favoritos'
const oyentes = new Set<() => void>()

function leer(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

let actual = leer()

function guardar(lista: string[]) {
  actual = lista
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch {
    // Sin almacenamiento (modo privado): los favoritos duran lo que dure la pestaña.
  }
  oyentes.forEach((f) => f())
}

export function useFavoritos() {
  const lista = useSyncExternalStore(
    (f) => {
      oyentes.add(f)
      return () => oyentes.delete(f)
    },
    () => actual,
  )
  const es = (clave: string) => lista.includes(clave)
  const alternar = (clave: string) => guardar(es(clave) ? lista.filter((x) => x !== clave) : [clave, ...lista])
  return { lista, es, alternar }
}

/** Corazón para guardar una oferta (`oferta:<id>`) o un alojamiento (`alojamiento:<id>`). */
export function BotonFavorito({ clave, className = '' }: { clave: string; className?: string }) {
  const { es, alternar } = useFavoritos()
  const activo = es(clave)
  const clic = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    alternar(clave)
  }
  return (
    <button
      onClick={clic}
      aria-pressed={activo}
      aria-label={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`flex h-9 w-9 items-center justify-center transition hover:scale-110 ${className}`}
    >
      <Heart size={20} strokeWidth={1.6} className={`drop-shadow ${activo ? 'fill-espresso text-marfil' : 'fill-black/25 text-marfil'}`} />
    </button>
  )
}
