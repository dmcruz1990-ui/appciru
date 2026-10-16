import { supabase, urlImagen } from '@plastinex/shared'
import { useState } from 'react'

const BUCKET = 'px-imagenes'

/** Sube una foto al bucket público de Storage y devuelve su URL; también acepta pegar una URL. */
export default function SubirImagen({ valor, carpeta, onChange }: { valor: string | null; carpeta: string; onChange: (url: string | null) => void }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const vista = urlImagen(valor, 400)

  const subir = async (archivo: File) => {
    setError(null)
    if (archivo.size > 5 * 1024 * 1024) return setError('Máximo 5 MB.')
    setSubiendo(true)
    const ext = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ruta = `${carpeta}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { cacheControl: '31536000', contentType: archivo.type })
    setSubiendo(false)
    if (error) return setError(error.message)
    onChange(supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl)
  }

  return (
    <div className="flex gap-3">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-md bg-stone-200">
        {vista && <img src={vista} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <label className="btn-sec cursor-pointer">
          {subiendo ? 'Subiendo…' : 'Subir foto'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={subiendo}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void subir(f)
              e.target.value = ''
            }}
          />
        </label>
        <input value={valor ?? ''} onChange={(e) => onChange(e.target.value || null)} placeholder="…o pega una URL" className="campo text-xs" />
        <p className="text-[11px] text-stone-400">Usa fotos propias o con licencia. Nunca fotos de pacientes sin consentimiento escrito.</p>
        {error && <p className="text-xs text-rose-700">{error}</p>}
      </div>
    </div>
  )
}
