// Guarda los parámetros de campaña (utm_*) de la primera visita para atribuir la solicitud.
const CLAVE = 'plastinex.utm'

export function capturarUTM() {
  try {
    const p = new URLSearchParams(window.location.search)
    const utm: Record<string, string> = {}
    p.forEach((v, k) => {
      if (k.startsWith('utm_') || k === 'gclid' || k === 'fbclid') utm[k] = v.slice(0, 120)
    })
    if (Object.keys(utm).length) sessionStorage.setItem(CLAVE, JSON.stringify(utm))
  } catch {
    // sin almacenamiento disponible: no se atribuye la campaña
  }
}

export function leerUTM(): Record<string, string> | undefined {
  try {
    const raw = sessionStorage.getItem(CLAVE)
    return raw ? (JSON.parse(raw) as Record<string, string>) : undefined
  } catch {
    return undefined
  }
}
