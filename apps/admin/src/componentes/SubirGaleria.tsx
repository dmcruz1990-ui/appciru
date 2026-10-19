import { urlImagen } from '@plastinex/shared'
import { useState } from 'react'
import { subirArchivo } from './SubirImagen'

const MAX = 20

/** Varias fotos en orden: se suben de una vez, se reordenan y se quitan. La primera es la portada del carrusel. */
export default function SubirGaleria({ valor, carpeta, onChange }: { valor: string[]; carpeta: string; onChange: (urls: string[]) => void }) {
  const [subiendo, setSubiendo] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const subir = async (archivos: File[]) => {
    setError(null)
    const libres = MAX - valor.length
    if (archivos.length > libres) setError(`Máximo ${MAX} fotos; se suben las primeras ${libres}.`)
    const lote = archivos.slice(0, Math.max(0, libres))
    setSubiendo(lote.length)
    const nuevas: string[] = []
    for (const a of lote) {
      try {
        nuevas.push(await subirArchivo(a, carpeta))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
      setSubiendo((n) => n - 1)
    }
    onChange([...valor, ...nuevas])
  }
  const mover = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= valor.length) return
    const x = [...valor]
    ;[x[i], x[j]] = [x[j], x[i]]
    onChange(x)
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {valor.map((u, i) => (
          <div key={u + i} className="group relative aspect-square overflow-hidden rounded-md bg-stone-200">
            <img src={urlImagen(u, 300) ?? undefined} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda" className="px-1 disabled:opacity-30">
                ←
              </button>
              <button type="button" onClick={() => onChange(valor.filter((_, k) => k !== i))} aria-label="Quitar foto" className="px-1">
                Quitar
              </button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === valor.length - 1} aria-label="Mover a la derecha" className="px-1 disabled:opacity-30">
                →
              </button>
            </div>
          </div>
        ))}
        {valor.length < MAX && (
          <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-stone-300 text-center text-xs text-stone-500 hover:border-stone-500">
            {subiendo ? `Subiendo ${subiendo}…` : '+ Agregar fotos'}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={subiendo > 0}
              onChange={(e) => {
                const fs = [...(e.target.files ?? [])]
                if (fs.length) void subir(fs)
                e.target.value = ''
              }}
            />
          </label>
        )}
      </div>
      <p className="mt-1 text-[11px] text-stone-400">Instalaciones, habitaciones, quirófanos y fachada. Nunca fotos de pacientes sin consentimiento escrito.</p>
      {error && <p className="mt-1 text-xs text-rose-700">{error}</p>}
    </div>
  )
}
