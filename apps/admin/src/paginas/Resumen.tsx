import { etapas, formatoCOP, formatoFecha } from '@plastinex/shared'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Barras, EtapaBadge, Kpi, Titulo } from '../componentes/ui'
import { useDatos } from '../datos'
import { useSesion } from '../sesion'

const periodos = [
  { id: 7, t: '7 días' },
  { id: 30, t: '30 días' },
  { id: 90, t: '90 días' },
  { id: 0, t: 'Todo' },
]

const mediana = (xs: number[]) => {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const horas = (h: number | null) => (h == null ? '—' : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} días`)

export default function Resumen() {
  const { datos } = useDatos()
  const { esAdmin } = useSesion()
  const [dias, setDias] = useState(30)

  const desde = dias ? Date.now() - dias * 86_400_000 : 0
  const sol = datos.solicitudes.filter((s) => new Date(s.creado_en).getTime() >= desde)
  const sinAtender = datos.solicitudes.filter((s) => s.etapa === 'nueva')
  const tiemposResp = sol
    .filter((s) => s.primera_respuesta_en)
    .map((s) => (new Date(s.primera_respuesta_en!).getTime() - new Date(s.creado_en).getTime()) / 3_600_000)
  const agendadas = sol.filter((s) => s.cita_valoracion_en)
  const conAsistencia = agendadas.filter((s) => s.asistio != null)
  const asistieron = conAsistencia.filter((s) => s.asistio).length
  const programadas = sol.filter((s) => s.etapa === 'programada').length

  // Embudo acumulado: cuántas llegaron al menos a cada etapa (no_continua aparte).
  const orden = etapas.filter((e) => e.id !== 'no_continua').map((e) => e.id)
  const alcanzo = (i: number) =>
    sol.filter((s) => {
      if (s.etapa === 'no_continua') return i === 0
      return orden.indexOf(s.etapa) >= i
    }).length
  const embudo = orden.map((id, i) => {
    const n = alcanzo(i)
    const previo = i === 0 ? n : alcanzo(i - 1)
    return { etiqueta: etapas.find((e) => e.id === id)!.nombre, valor: n, detalle: i && previo ? `${Math.round((n / previo) * 100)}%` : undefined }
  })

  const contar = (clave: (s: (typeof sol)[number]) => string | null) => {
    const m = new Map<string, number>()
    for (const s of sol) {
      const k = clave(s)
      if (k) m.set(k, (m.get(k) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([etiqueta, valor]) => ({ etiqueta, valor }))
  }
  const porProc = contar((s) => datos.procedimientos.find((p) => p.id === s.procedimiento_id)?.nombre ?? 'Orientación general')
  const porInst = contar((s) => datos.instituciones.find((i) => i.id === s.institucion_id)?.nombre ?? 'Sin institución')
  const porCanal = contar((s) => s.utm?.utm_source ?? s.canal)

  const activas = datos.suscripciones.filter((s) => s.estado === 'activa')
  const mrr = activas.reduce((t, s) => t + s.cuota_mensual, 0)
  const canceladas = datos.suscripciones.filter((s) => s.estado === 'cancelada').length
  const churn = datos.suscripciones.length ? Math.round((canceladas / datos.suscripciones.length) * 100) : 0

  return (
    <div className="space-y-6">
      <Titulo
        accion={
          <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-sm">
            {periodos.map((p) => (
              <button key={p.id} onClick={() => setDias(p.id)} className={`rounded px-3 py-1 ${dias === p.id ? 'bg-tinta text-white' : 'text-stone-600'}`}>
                {p.t}
              </button>
            ))}
          </div>
        }
      >
        Resumen
      </Titulo>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi t="Solicitudes" v={String(sol.length)} s={dias ? `Últimos ${dias} días` : 'Histórico'} />
        <Kpi t="Sin atender" v={String(sinAtender.length)} s="En etapa “Nueva”" />
        <Kpi t="Primera respuesta (mediana)" v={horas(mediana(tiemposResp))} s={`${tiemposResp.length} con respuesta`} />
        <Kpi
          t="Valoraciones agendadas"
          v={String(agendadas.length)}
          s={conAsistencia.length ? `Asistencia ${Math.round((asistieron / conAsistencia.length) * 100)}%` : 'Sin asistencia registrada'}
        />
        <Kpi t="Programadas" v={String(programadas)} s={sol.length ? `${Math.round((programadas / sol.length) * 100)}% de las solicitudes` : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="tarjeta p-5">
          <div className="mb-1 font-medium">Embudo por etapa</div>
          <p className="mb-4 text-xs text-stone-500">Solicitudes que llegaron al menos a cada etapa · % frente a la etapa anterior</p>
          <Barras filas={embudo} />
        </div>
        <div className="tarjeta p-5">
          <div className="mb-4 font-medium">Por procedimiento</div>
          <Barras filas={porProc.slice(0, 8)} />
        </div>
        <div className="tarjeta p-5">
          <div className="mb-4 font-medium">Por institución</div>
          <Barras filas={porInst.slice(0, 8)} />
          <div className="mt-6 mb-4 font-medium">Por origen</div>
          <Barras filas={porCanal.slice(0, 5)} />
        </div>
      </div>

      {esAdmin && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi t="MRR (ingreso mensual recurrente)" v={formatoCOP(mrr)} s={`${activas.length} clientes activos`} />
          <Kpi t="ARR estimado" v={formatoCOP(mrr * 12)} s="MRR × 12" />
          <Kpi t="En prueba / piloto" v={String(datos.suscripciones.filter((s) => s.estado === 'prueba').length)} />
          <Kpi t="Churn histórico" v={`${churn}%`} s={`${canceladas} canceladas de ${datos.suscripciones.length}`} />
        </div>
      )}

      <div className="tarjeta">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="font-medium">Últimas solicitudes</div>
          <Link to="/solicitudes" className="text-sm text-oro-osc hover:underline">
            Ver todas →
          </Link>
        </div>
        <table className="tabla">
          <tbody>
            {datos.solicitudes.slice(0, 6).map((s) => (
              <tr key={s.id} className="hover:bg-stone-50">
                <td className="font-mono text-xs">
                  <Link to={`/solicitudes/${s.id}`} className="hover:underline">
                    {s.codigo}
                  </Link>
                </td>
                <td>{s.nombre}</td>
                <td className="hidden text-stone-500 sm:table-cell">{datos.procedimientos.find((p) => p.id === s.procedimiento_id)?.nombre ?? 'Orientación'}</td>
                <td className="hidden text-stone-500 md:table-cell">{formatoFecha(s.creado_en)}</td>
                <td>
                  <EtapaBadge etapa={s.etapa} />
                </td>
              </tr>
            ))}
            {datos.solicitudes.length === 0 && (
              <tr>
                <td className="py-8 text-center text-stone-400">Aún no hay solicitudes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
