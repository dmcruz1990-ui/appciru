import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const configurado = Boolean(url && key)

if (!configurado) {
  console.error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. Copia .env.example a .env en la raíz del repo.')
}

export const supabase = createClient(url ?? 'http://localhost', key ?? 'sin-clave', {
  auth: { persistSession: true, autoRefreshToken: true },
})

/** Lanza el error de Supabase (si lo hay) y devuelve los datos tipados. */
export function sinError<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message)
  return r.data as T
}
