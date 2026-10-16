import {
  etapas,
  formatoCOP,
  formatoFecha,
  formatoFechaHora,
  infoEtapa,
  sinError,
  supabase,
  textoPrecio,
  useCarga,
  type Etapa,
  type EventoSolicitud,
  type Paciente,
  type Solicitud,
} from '@plastinex/shared'
import { ArrowLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EtapaBadge } from '../componentes/ui'
import { useDatos } from '../datos'
import { useSesion } from '../sesion'

const aLocal = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function SolicitudDetalle() {
  const { id } = useParams()
  const { datos, recargar } = useDatos()
  const { perfil } = useSesion()
  const s = datos.solicitudes.find((x) => x.id === id)
  const eventos = useCarga(
    async () =>
      sinError<EventoSolicitud[]>(await supabase.from('px_solicitud_eventos').select('*').eq('solicitud_id', id!).order('creado_en', { ascending: false })),
    [id, s?.actualizado_en],
  )
  const ficha = useCarga(
    async () =>
      s?.paciente_id
        ? sinError<Paciente | null>(await supabase.from('px_pacientes').select('*').eq('id', s.paciente_id).maybeSingle())
        : null,
    [s?.paciente_id],
  )
  const [texto, setTexto] = useState('')
  const [tipo, setTipo] = useState<'nota_interna' | 'mensaje_paciente'>('nota_interna')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!s) return <div className="text-sm text-stone-500">Solicitud no encontrada.</div>

  const proc = datos.procedimientos.find((p) => p.id === s.procedimiento_id)
  const oferta = datos.ofertas.find((o) => o.id === s.oferta_id)
  const inst = datos.instituciones.find((i) => i.id === s.institucion_id)
  const prof = datos.profesionales.find((p) => p.id === s.profesional_id)
  const aloj = datos.alojamientos.find((a) => a.id === s.alojamiento_id)
  const servicios = datos.servicios.filter((x) => s.servicio_ids.includes(x.id))
  const staff = datos.perfiles.filter((p) => p.rol === 'admin' || p.rol === 'coordinador')
  const wa = s.telefono.replace(/[^\d]/g, '')
  const autor = (id: string | null) => {
    const p = datos.perfiles.find((x) => x.id === id)
    return p ? p.nombre || p.email : 'Sistema'
  }

  const actualizar = async (cambios: Partial<Solicitud>) => {
    setGuardando(true)
    setError(null)
    const { error } = await supabase.from('px_solicitudes').update(cambios).eq('id', s.id)
    setGuardando(false)
    if (error) return setError(error.message)
    recargar()
  }

  const agregarEvento = async () => {
    if (!texto.trim() || !perfil) return
    setGuardando(true)
    const { error } = await supabase.from('px_solicitud_eventos').insert({ solicitud_id: s.id, autor_id: perfil.id, tipo, texto: texto.trim() })
    setGuardando(false)
    if (error) return setError(error.message)
    setTexto('')
    eventos.recargar()
  }

  return (
    <div className="space-y-4">
      <Link to="/solicitudes" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900">
        <ArrowLeft size={14} /> Solicitudes
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-2xl">{s.nombre}</h1>
        <span className="font-mono text-sm text-stone-500">{s.codigo}</span>
        <EtapaBadge etapa={s.etapa} />
        <span className="text-sm text-stone-400">Recibida {formatoFechaHora(s.creado_en)}</span>
      </div>
      {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="tarjeta p-5">
            <div className="mb-3 font-medium">Gestión</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="etiqueta">Etapa</span>
                <select disabled={guardando} value={s.etapa} onChange={(e) => void actualizar({ etapa: e.target.value as Etapa })} className="campo">
                  {etapas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="etiqueta">Responsable</span>
                <select disabled={guardando} value={s.asignado_a ?? ''} onChange={(e) => void actualizar({ asignado_a: e.target.value || null })} className="campo">
                  <option value="">Sin asignar</option>
                  {staff.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre || p.email}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="etiqueta">Cita de valoración</span>
                <input
                  type="datetime-local"
                  disabled={guardando}
                  defaultValue={aLocal(s.cita_valoracion_en)}
                  key={s.cita_valoracion_en ?? 'sin'}
                  onBlur={(e) => {
                    const v = e.target.value ? new Date(e.target.value).toISOString() : null
                    if (v !== s.cita_valoracion_en) void actualizar({ cita_valoracion_en: v })
                  }}
                  className="campo"
                />
              </label>
              <label>
                <span className="etiqueta">¿Asistió a la valoración?</span>
                <select
                  disabled={guardando}
                  value={s.asistio == null ? '' : s.asistio ? 'si' : 'no'}
                  onChange={(e) => void actualizar({ asistio: e.target.value === '' ? null : e.target.value === 'si' })}
                  className="campo"
                >
                  <option value="">Sin registrar</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>
              {s.etapa === 'no_continua' && (
                <label className="sm:col-span-2">
                  <span className="etiqueta">Motivo de cierre</span>
                  <input
                    defaultValue={s.motivo_cierre ?? ''}
                    onBlur={(e) => e.target.value !== (s.motivo_cierre ?? '') && void actualizar({ motivo_cierre: e.target.value || null })}
                    placeholder="Ej.: no es candidata según valoración, eligió otra institución, precio…"
                    className="campo"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="tarjeta p-5">
            <div className="mb-3 flex gap-1 text-sm">
              <button onClick={() => setTipo('nota_interna')} className={`rounded-md px-3 py-1 ${tipo === 'nota_interna' ? 'bg-tinta text-white' : 'bg-stone-100'}`}>
                Nota interna
              </button>
              <button onClick={() => setTipo('mensaje_paciente')} className={`rounded-md px-3 py-1 ${tipo === 'mensaje_paciente' ? 'bg-oro text-tinta' : 'bg-stone-100'}`}>
                Mensaje visible al paciente
              </button>
            </div>
            <textarea
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={
                tipo === 'nota_interna'
                  ? 'Solo la ve el equipo. No registres información clínica.'
                  : 'El paciente lo verá al consultar su solicitud con el código.'
              }
              className="campo"
            />
            <div className="mt-2 flex justify-end">
              <button disabled={!texto.trim() || guardando} onClick={() => void agregarEvento()} className="btn">
                Guardar
              </button>
            </div>
            <ol className="mt-4 space-y-3 border-l-2 border-stone-200 pl-4">
              {eventos.datos?.map((e) => (
                <li key={e.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {e.tipo === 'etapa' && e.etapa
                        ? `→ ${infoEtapa(e.etapa).nombre}`
                        : e.tipo === 'nota_interna'
                          ? 'Nota interna'
                          : e.tipo === 'mensaje_paciente'
                            ? 'Mensaje al paciente'
                            : 'Sistema'}
                    </span>
                    <span className="text-xs text-stone-400">
                      {formatoFechaHora(e.creado_en)} · {autor(e.autor_id)}
                    </span>
                  </div>
                  {e.texto && <p className={`mt-0.5 ${e.tipo === 'mensaje_paciente' ? 'rounded bg-oro/10 p-2' : 'text-stone-600'}`}>{e.texto}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="tarjeta p-5 text-sm">
            <div className="mb-2 font-medium">Contacto</div>
            <div className="text-stone-500">{s.pais}</div>
            <div className="mt-3 space-y-1.5">
              <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:underline">
                <Mail size={14} /> {s.email}
              </a>
              <a href={`tel:${s.telefono}`} className="flex items-center gap-2 hover:underline">
                <Phone size={14} /> {s.telefono}
              </a>
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-700 hover:underline">
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
            {s.mensaje && <p className="mt-3 rounded-md bg-stone-50 p-2">“{s.mensaje}”</p>}
            {ficha.datos ? (
              <div className="mt-4 space-y-1 border-t border-[#ece6db] pt-3 text-xs text-stone-500">
                <div className="font-medium text-stone-700">Documentos aceptados ({ficha.datos.terminos_version})</div>
                <div>Términos y responsabilidad · {formatoFechaHora(ficha.datos.terminos_aceptados_en)}</div>
                <div>Intermediación · {formatoFechaHora(ficha.datos.intermediacion_aceptada_en)}</div>
                <div>Confidencialidad · {formatoFechaHora(ficha.datos.confidencialidad_aceptada_en)}</div>
                <div>Tratamiento de datos · {formatoFechaHora(ficha.datos.datos_sensibles_autorizado_en)}</div>
              </div>
            ) : (
              <div className="mt-3 text-xs text-stone-400">
                Autorización de datos {s.consentimiento_version} · {formatoFechaHora(s.consentimiento_en)}
              </div>
            )}
          </div>

          <div className="tarjeta p-5 text-sm">
            <div className="mb-2 font-medium">Interés</div>
            <Dato t="Procedimiento" v={proc?.nombre ?? 'Orientación general'} />
            <Dato t="Institución" v={inst?.nombre ?? '—'} />
            <Dato t="Profesional" v={prof?.nombre ?? '—'} />
            <Dato t="Ciudad" v={datos.ciudades.find((c) => c.id === s.ciudad_id)?.nombre ?? '—'} />
            <Dato t="Fecha tentativa" v={s.fecha_tentativa ? formatoFecha(s.fecha_tentativa) : '—'} />
            {oferta && <Dato t="Rango publicado" v={textoPrecio(oferta.precio_min, oferta.precio_max)} />}
          </div>

          <div className="tarjeta p-5 text-sm">
            <div className="mb-2 font-medium">Plan complementario</div>
            <Dato
              t="Alojamiento"
              v={aloj ? `${aloj.nombre} · ${s.noches} noches${aloj.precio_noche_desde ? ` · desde ${formatoCOP(aloj.precio_noche_desde * (s.noches ?? 1))}` : ''}` : 'No solicitado'}
            />
            <Dato t="Servicios" v={servicios.length ? servicios.map((x) => x.nombre).join(', ') : 'Ninguno'} />
          </div>

          <div className="tarjeta p-5 text-sm">
            <div className="mb-2 font-medium">Origen</div>
            <Dato t="Canal" v={s.canal} />
            {s.utm && Object.entries(s.utm).map(([k, v]) => <Dato key={k} t={k} v={v} />)}
            {s.primera_respuesta_en && <Dato t="Primera respuesta" v={formatoFechaHora(s.primera_respuesta_en)} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Dato({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-stone-100 py-1.5 last:border-0">
      <span className="text-stone-500">{t}</span>
      <span className="text-right">{v}</span>
    </div>
  )
}
