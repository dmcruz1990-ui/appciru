import { urlImagen } from '@plastinex/shared'
import { Grid2x2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Lienzo } from './base'

/**
 * Mosaico de fotos (una grande y cuatro pequeñas) con visor a pantalla completa.
 * Sin fotos propias, el mosaico se compone con lienzos abstractos y no ofrece el visor.
 */
export default function Galeria({ fotos, titulo, semilla }: { fotos: string[]; titulo: string; semilla: string }) {
  const [abierta, setAbierta] = useState(false)
  const celdas = Array.from({ length: 5 }, (_, k) => fotos[k] ?? null)

  useEffect(() => {
    if (!abierta) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierta(false)
    document.addEventListener('keydown', esc)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.documentElement.style.overflow = ''
    }
  }, [abierta])

  return (
    <>
      <div className="relative grid h-[52vh] min-h-[320px] grid-cols-4 grid-rows-2 gap-2 md:h-[480px]">
        {celdas.map((f, k) => (
          <button
            key={k}
            type="button"
            disabled={!fotos.length}
            onClick={() => setAbierta(true)}
            aria-label={fotos.length ? `Ver fotos de ${titulo}` : undefined}
            className={`group relative overflow-hidden bg-arena ${k === 0 ? 'col-span-4 row-span-2 md:col-span-2' : 'hidden md:block'}`}
          >
            {f ? (
              <img src={urlImagen(f, k === 0 ? 1400 : 700) ?? undefined} alt={k === 0 ? titulo : ''} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] group-hover:brightness-95" />
            ) : (
              <Lienzo semilla={`${semilla}-${k}`} tono={k === 0 ? 'oscuro' : 'claro'} />
            )}
          </button>
        ))}
        {fotos.length > 0 && (
          <button onClick={() => setAbierta(true)} className="btn-linea absolute right-4 bottom-4 !bg-marfil hover:!bg-espresso">
            <Grid2x2 size={14} strokeWidth={1.6} /> Mostrar todas las fotos
          </button>
        )}
      </div>

      <AnimatePresence>
        {abierta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-marfil"
            role="dialog"
            aria-modal="true"
            aria-label={`Fotos de ${titulo}`}
            data-lenis-prevent
          >
            <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-linea bg-marfil px-5 md:px-10">
              <span className="text-[11px] font-medium tracking-[0.22em] uppercase">{titulo}</span>
              <button onClick={() => setAbierta(false)} aria-label="Cerrar" className="flex h-10 w-10 items-center justify-center hover:bg-arena">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="mx-auto grid max-w-4xl gap-2 px-5 py-10 md:grid-cols-2">
              {fotos.map((f, k) => (
                <img key={f + k} src={urlImagen(f, 1400) ?? undefined} alt="" loading="lazy" className={`w-full object-cover ${k % 3 === 0 ? 'md:col-span-2' : ''}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
