import { crearSolicitud, destinos, detallarOfertas } from '@plastinex/shared'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { Foto } from '../componentes/base'
import { EstadoVerificacion } from '../componentes/Insignias'
import { NotaMoneda, useIdioma } from '../idioma'
import { useSesion } from '../sesion'
import { leerUTM } from '../utm'

export default function Solicitar() {
  const { datos } = useCatalogo()
  const { sesion, paciente, listo, cargando } = useSesion()
  const { tx, dinero, precio, loc, tipoAlojamiento, aCop, desdeCop, locale, moneda, ciudad, pais } = useIdioma()
  const [params] = useSearchParams()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()

  const oferta = useMemo(() => (datos ? detallarOfertas(datos).find((d) => d.oferta.id === params.get('oferta')) : undefined), [datos, params])

  const [procedimientoId, setProcedimientoId] = useState(params.get('procedimiento') ?? '')
  const [ciudadId, setCiudadId] = useState(params.get('ciudad') ?? '')
  const [fecha, setFecha] = useState(params.get('fecha') ?? '')
  const [quiereAlojamiento, setQuiereAlojamiento] = useState(Boolean(params.get('alojamiento')))
  const [alojamientoId, setAlojamientoId] = useState(params.get('alojamiento') ?? '')
  const [noches, setNoches] = useState<number | ''>(Number(params.get('noches')) || '')
  // Siempre en pesos (lo que recibe el servidor); el campo se muestra en la moneda de la persona.
  const [presupuesto, setPresupuesto] = useState(params.get('presupuesto')?.replace(/\D/g, '') ?? '')
  const [servicioIds, setServicioIds] = useState<string[]>([])
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!datos || cargando) return null
  const volver = encodeURIComponent(pathname + search)
  if (!sesion) return <Navigate to={`/ingresar?volver=${volver}&modo=registro`} replace />
  if (!listo) return <Navigate to={`/cuenta/completar?volver=${volver}`} replace />

  const ciudadPlan = oferta?.ciudad.id ?? ciudadId
  const proc = oferta?.procedimiento ?? datos.procedimientos.find((p) => p.id === procedimientoId)
  const n = noches === '' ? (proc?.estadia_sugerida_dias ?? 7) : noches
  const alojamientos = datos.alojamientos.filter((a) => !ciudadPlan || a.ciudad_id === ciudadPlan)
  const aloj = quiereAlojamiento ? datos.alojamientos.find((a) => a.id === alojamientoId) : undefined
  const costoAloj = aloj?.precio_noche_desde ? aloj.precio_noche_desde * n : 0
  const costoServ = servicioIds.reduce((s, id) => {
    const sv = datos.servicios.find((x) => x.id === id)
    if (!sv?.precio_desde) return s
    return s + (sv.unidad === 'dia' ? sv.precio_desde * n : sv.precio_desde)
  }, 0)
  const toggle = (id: string) => setServicioIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  const minFecha = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const codigo = await crearSolicitud({
        oferta_id: oferta?.oferta.id,
        procedimiento_id: oferta ? undefined : procedimientoId || undefined,
        ciudad_id: oferta ? undefined : ciudadId || undefined,
        fecha_tentativa: fecha || undefined,
        alojamiento_id: aloj?.id,
        noches: aloj ? n : undefined,
        servicio_ids: servicioIds,
        mensaje: mensaje.trim() || undefined,
        presupuesto: presupuesto ? Number(presupuesto) : undefined,
        canal: 'web',
        utm: leerUTM(),
      })
      navigate('/solicitud-enviada', { state: { codigo } })
    } catch (err) {
      setError(err instanceof Error ? err.message : tx('No pudimos enviar la solicitud.', 'We could not send your request.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="contenedor pt-48 pb-28">
      <div className="rotulo">{tx('Solicitud de valoración', 'Consultation request')}</div>
      <h1 className="display mt-4 text-4xl md:text-5xl">
        {tx(
          <>
            Cuéntanos qué <em>buscas.</em>
          </>,
          <>
            Tell us what <em>you are looking for.</em>
          </>,
        )}
      </h1>
      <p className="mt-5 max-w-2xl text-piedra">
        {tx(
          'Un coordinador te contactará para agendar la valoración con el especialista. No incluyas información clínica: eso se habla en consulta. Una solicitud no es una reserva confirmada.',
          'A coordinator will contact you to schedule your consultation with the specialist. Please do not include medical information here; that is discussed during the consultation. A request is not a confirmed booking.',
        )}
      </p>

      <form onSubmit={enviar} className="mt-16 grid gap-16 lg:grid-cols-[1fr_380px]">
        <div className="space-y-20">
          <Paso n="01" titulo={tx('Tu interés', 'Your interest')}>
            {oferta ? (
              <div className="grid gap-6 sm:grid-cols-[160px_1fr]">
                <Foto src={oferta.institucion.imagen_url ?? oferta.procedimiento.imagen_url} alt="" ancho={400} className="aspect-[4/5]" />
                <div>
                  <div className="font-serif text-4xl">{loc(oferta.procedimiento, 'nombre')}</div>
                  <div className="mt-1 text-piedra">
                    {oferta.institucion.nombre} · {ciudad(oferta.ciudad)}
                    {oferta.profesional && ` · ${oferta.profesional.nombre}`}
                  </div>
                  <div className="mt-3">
                    <EstadoVerificacion v={oferta.institucion.verificacion} />
                  </div>
                  {(oferta.oferta.incluye || oferta.oferta.no_incluye) && (
                    <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                      {oferta.oferta.incluye && (
                        <div>
                          <dt className="etiqueta">{tx('Incluye', 'Includes')}</dt>
                          <dd className="mt-1 text-piedra">{loc(oferta.oferta, 'incluye')}</dd>
                        </div>
                      )}
                      {oferta.oferta.no_incluye && (
                        <div>
                          <dt className="etiqueta">{tx('No incluye', 'Not included')}</dt>
                          <dd className="mt-1 text-piedra">{loc(oferta.oferta, 'no_incluye')}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                  <Link to="/explorar" className="enlace mt-6 inline-block text-sm text-piedra">
                    {tx('Cambiar opción', 'Change option')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                <label>
                  <span className="etiqueta">{tx('Procedimiento', 'Procedure')}</span>
                  <select value={procedimientoId} onChange={(e) => setProcedimientoId(e.target.value)} className="campo">
                    <option value="">{tx('Orientación general', 'General guidance')}</option>
                    {datos.procedimientos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {loc(p, 'nombre')}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="etiqueta">{tx('Ciudad preferida', 'Preferred city')}</span>
                  <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} className="campo">
                    <option value="">{tx('Sin preferencia', 'No preference')}</option>
                    {destinos(datos).map((d) => (
                      <optgroup key={d.pais} label={pais(d.pais)}>
                        {d.ciudades.map(({ ciudad: c }) => (
                          <option key={c.id} value={c.id}>
                            {ciudad(c)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
              </div>
            )}
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="etiqueta">{tx('Fecha tentativa (opcional)', 'Tentative date (optional)')}</span>
                <input type="date" min={minFecha} value={fecha} onChange={(e) => setFecha(e.target.value)} className="campo" />
              </label>
              <label className="block">
                <span className="etiqueta">{tx('Tu presupuesto total (opcional)', 'Your total budget (optional)')}</span>
                <input
                  inputMode="numeric"
                  value={presupuesto ? desdeCop(Number(presupuesto)).toLocaleString(locale) : ''}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPresupuesto(valor ? String(aCop(Number(valor))) : '')
                  }}
                  placeholder={moneda === 'USD' ? 'US$ 0' : '$ 0'}
                  className="campo"
                />
                <span className="mt-1 block text-xs text-niebla">
                  {tx('Lo compartimos con la institución para que te proponga opciones a tu medida.', 'We share it with the clinic so it can suggest options that fit you.')}
                </span>
              </label>
            </div>
          </Paso>

          <Paso n="02" titulo={tx('Tu estadía (opcional)', 'Your stay (optional)')}>
            <Interruptor activo={quiereAlojamiento} onChange={setQuiereAlojamiento}>
              {tx('Necesito alojamiento durante la recuperación', 'I need a place to stay during recovery')}
            </Interruptor>
            {quiereAlojamiento && (
              <div className="mt-8 space-y-8">
                {alojamientos.length === 0 ? (
                  <p className="text-sm text-piedra">
                    {tx('Aún no tenemos alojamientos aliados en esta ciudad; tu coordinador te orientará.', 'We do not have partner stays in this city yet; your coordinator will guide you.')}
                  </p>
                ) : (
                  <div className="divide-y divide-linea border-y border-linea">
                    {alojamientos.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => setAlojamientoId(a.id === alojamientoId ? '' : a.id)}
                        className="grid w-full grid-cols-[24px_1fr_auto] items-baseline gap-4 py-5 text-left"
                      >
                        <span className={`h-3 w-3 rounded-full border ${alojamientoId === a.id ? 'border-espresso bg-espresso' : 'border-niebla'}`} />
                        <span>
                          <span className="block font-serif text-2xl">{a.nombre}</span>
                          <span className="text-sm text-piedra">
                            {tipoAlojamiento(a.tipo)}
                            {a.incluye_enfermeria && tx(' · enfermería', ' · nursing care')}
                            {a.incluye_alimentacion && tx(' · alimentación', ' · meals')}
                          </span>
                        </span>
                        <span className="text-sm text-piedra">
                          {a.precio_noche_desde
                            ? tx(`desde ${dinero(a.precio_noche_desde)} / noche`, `from ${dinero(a.precio_noche_desde)} / night`)
                            : tx('por cotizar', 'quote on request')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <label className="block max-w-[10rem]">
                  <span className="etiqueta">{tx('Noches', 'Nights')}</span>
                  <input type="number" min={1} max={60} value={n} onChange={(e) => setNoches(e.target.value === '' ? '' : Math.min(60, Math.max(1, Number(e.target.value))))} className="campo" />
                </label>
              </div>
            )}
            <div className="mt-12">
              <div className="etiqueta">{tx('Servicios complementarios', 'Additional services')}</div>
              <div className="mt-3 divide-y divide-linea border-y border-linea">
                {datos.servicios.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-baseline gap-4 py-5">
                    <input type="checkbox" checked={servicioIds.includes(s.id)} onChange={() => toggle(s.id)} className="accent-espresso" />
                    <span className="flex-1">
                      <span className="block">{loc(s, 'nombre')}</span>
                      <span className="text-sm text-piedra">{loc(s, 'descripcion')}</span>
                    </span>
                    <span className="text-sm whitespace-nowrap text-piedra">
                      {s.precio_desde
                        ? tx(`desde ${dinero(s.precio_desde)}${s.unidad === 'dia' ? ' / día' : ''}`, `from ${dinero(s.precio_desde)}${s.unidad === 'dia' ? ' / day' : ''}`)
                        : tx('por cotizar', 'quote on request')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </Paso>

          <Paso n="03" titulo={tx('Un mensaje para tu coordinador (opcional)', 'A message for your coordinator (optional)')}>
            <textarea rows={3} maxLength={600} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="campo resize-none" placeholder={tx('Ej.: prefiero que me contacten en la tarde.', 'E.g., I prefer to be contacted in the afternoon.')} />
          </Paso>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-papel p-8">
            <div className="rotulo">{tx('Resumen', 'Summary')}</div>
            <div className="mt-4 font-serif text-3xl">{proc ? loc(proc, 'nombre') : tx('Orientación general', 'General guidance')}</div>
            {oferta && <div className="text-sm text-piedra">{oferta.institucion.nombre}</div>}
            <dl className="mt-8 space-y-3 border-t border-linea pt-6 text-sm">
              <Linea
                t={tx('Procedimiento', 'Procedure')}
                v={oferta ? precio(oferta.oferta.precio_min, oferta.oferta.precio_max) : tx('Según valoración', 'Subject to consultation')}
              />
              {aloj && (
                <Linea
                  t={tx(`Alojamiento · ${n} ${n === 1 ? 'noche' : 'noches'}`, `Stay · ${n} ${n === 1 ? 'night' : 'nights'}`)}
                  v={costoAloj ? dinero(costoAloj) : tx('Por cotizar', 'Quote on request')}
                />
              )}
              {servicioIds.length > 0 && <Linea t={`${tx('Servicios', 'Services')} (${servicioIds.length})`} v={dinero(costoServ)} />}
              {presupuesto && <Linea t={tx('Tu presupuesto', 'Your budget')} v={dinero(Number(presupuesto))} />}
            </dl>
            {costoAloj + costoServ > 0 && (
              <div className="mt-6 flex items-baseline justify-between border-t border-linea pt-6">
                <span className="text-sm text-piedra">{tx('Complementos desde', 'Add-ons from')}</span>
                <span className="font-serif text-3xl">{dinero(costoAloj + costoServ)}</span>
              </div>
            )}
            <NotaMoneda className="mt-4" />
            <p className="mt-6 text-xs leading-relaxed text-niebla">
              {tx(
                'Valores orientativos. El presupuesto final te lo entrega la clínica después de la valoración, y contratas y pagas directamente con ella. PLASTINEX actúa como intermediario y no te cobra.',
                'Prices are indicative. The clinic gives you the final quote after your consultation, and you contract and pay the clinic directly. PLASTINEX acts as an intermediary and does not charge you.',
              )}
            </p>
            <div className="mt-6 border-t border-linea pt-6 text-sm">
              <div className="etiqueta">{tx('Te contactaremos como', 'We will contact you as')}</div>
              <div className="mt-2">{paciente?.nombre}</div>
              <div className="text-piedra">
                {sesion.user.email} · {paciente?.telefono}
              </div>
              <Link to={`/cuenta/completar?editar=1&volver=${volver}`} className="enlace mt-2 inline-block text-xs text-piedra">
                {tx('Cambiar mis datos', 'Edit my details')}
              </Link>
            </div>
            {error && <p className="mt-4 text-sm text-red-800">{error}</p>}
            <button disabled={enviando} className="btn mt-8 w-full !py-3.5">
              {enviando ? tx('Enviando…', 'Sending…') : tx('Enviar solicitud', 'Send request')}
            </button>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Paso({ n, titulo, children }: { n: string; titulo: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-8 flex items-baseline gap-4 border-b border-espresso pb-4">
        <span className="font-serif text-2xl text-arcilla">{n}</span>
        <h2 className="font-serif text-3xl">{titulo}</h2>
      </div>
      {children}
    </section>
  )
}

function Interruptor({ activo, onChange, children }: { activo: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => onChange(!activo)} className="flex items-center gap-4 text-left">
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${activo ? 'bg-espresso' : 'bg-linea'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-marfil transition-all duration-300 ${activo ? 'left-6' : 'left-1'}`} />
      </span>
      <span>{children}</span>
    </button>
  )
}

function Linea({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-piedra">{t}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  )
}
