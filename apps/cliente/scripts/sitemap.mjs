// Genera dist/sitemap.xml y dist/robots.txt después de `vite build`.
// Lee el catálogo publicado de Supabase con la clave publicable (la misma del sitio) e incluye:
// páginas fijas, procedimientos y, solo con prestadores reales (no de demostración), clínicas,
// cirujanos y rutas /cirugia/<procedimiento>/<ciudad>. Si la consulta falla, publica solo las páginas fijas.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const sitio = (process.env.VITE_URL_PUBLICA || 'https://plastinex-cliente.vercel.app').replace(/\/$/, '')
const url = process.env.VITE_SUPABASE_URL
const clave = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

async function leer(tabla, campos) {
  const r = await fetch(`${url}/rest/v1/${tabla}?select=${campos}`, {
    headers: { apikey: clave, Authorization: `Bearer ${clave}` },
    signal: AbortSignal.timeout(15000),
  })
  if (!r.ok) throw new Error(`${tabla}: ${r.status}`)
  return r.json()
}

const rutas = ['/', '/explorar', '/especialistas', '/alojamientos', '/planear', '/para-clinicas', '/para-clinicas/registro', '/terminos', '/privacidad']

try {
  if (!url || !clave) throw new Error('sin variables de Supabase')
  const [procs, insts, profs, ofertas] = await Promise.all([
    leer('px_procedimientos', 'id'),
    leer('px_instituciones', 'id,ciudad_id,es_demo'),
    leer('px_profesionales', 'id,es_demo'),
    leer('px_ofertas', 'procedimiento_id,institucion_id'),
  ])
  const reales = new Map(insts.filter((i) => !i.es_demo).map((i) => [i.id, i]))
  for (const p of procs) rutas.push(`/procedimiento/${p.id}`)
  for (const i of reales.values()) rutas.push(`/institucion/${i.id}`)
  for (const p of profs.filter((x) => !x.es_demo)) rutas.push(`/profesional/${p.id}`)
  const combos = new Set()
  for (const o of ofertas) {
    const i = reales.get(o.institucion_id)
    if (!i) continue
    combos.add(`/cirugia/${o.procedimiento_id}`)
    combos.add(`/cirugia/${o.procedimiento_id}/${i.ciudad_id}`)
  }
  rutas.push(...combos)
  console.log(`sitemap: ${rutas.length} rutas (${reales.size} clínicas reales)`)
} catch (e) {
  console.warn(`sitemap: solo páginas fijas (${e instanceof Error ? e.message : e})`)
}

const hoy = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(rutas)].map((r) => `  <url><loc>${sitio}${r}</loc><lastmod>${hoy}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(dist + 'sitemap.xml', xml)
writeFileSync(
  dist + 'robots.txt',
  `User-agent: *
Allow: /
Disallow: /cuenta
Disallow: /ingresar
Disallow: /solicitar
Disallow: /solicitud-enviada
Disallow: /favoritos

Sitemap: ${sitio}/sitemap.xml
`,
)
