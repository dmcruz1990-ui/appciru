import {
  CONSENTIMIENTO_VERSION,
  crearSolicitud,
  detallarOfertas,
  formatoCOP,
  nombreTipoAlojamiento,
  textoPrecio,
} from '@plastinex/shared'
import { HeartPulse, Utensils } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCatalogo } from '../catalogo'
import { EstadoVerificacion } from '../componentes/Insignias'
import { leerUTM } from '../utm'

const paises = ['Colombia', 'Estados Unidos', 'España', 'Canadá', 'México', 'Panamá', 'Chile', 'Otro']

export default function Solicitar() {
  const { datos } = useCatalogo()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const oferta = useMemo(
    () => (datos ? detallarOfertas(datos).find((d) => d.oferta.id === params.get('oferta')) : undefined),
    [datos, params],
  )

  const [procedimientoId, setProcedimientoId] = useState(params.get('procedimiento') ?? '')
  const [ciudadId, setCiudadId] = useState(params.get('ciudad') ?? '')
  const [fecha, setFecha] = useState('')
  const [quiereAlojamiento, setQuiereAlojamiento] = useState(false)
  const [alojamientoId, setAlojamientoId] = useState('')
  const [noches, setNoches] = useState<number | ''>('')
  const [servicioIds, setServicioIds] = useState<string[]>([])
  const [contacto, setContacto] = useState({ nombre: '', email: '', telefono: '', pais: 'Colombia' })
  const [mensaje, setMensaje] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!datos) return null

  const ciudadPlan = oferta?.ciudad.id ?? ciudadId
  const proc = oferta?.procedimiento ?? datos.procedimientos.find((p) => p.id === procedimientoId)
  const nochesEfectivas = noches === '' ? (proc?.estadia_sugerida_dias ?? 7) : noches
  const alojamientos = datos.alojamientos.filter((a) => !ciudadPlan || a.ciudad_id === ciudadPlan)
  const aloj = quiereAlojamiento ? datos.alojamientos.find((a) => a.id === alojamientoId) : undefined

  const estimadoComplementos =
    (aloj?.precio_noche_desde ?? 0) * (aloj ? nochesEfectivas : 0) +
    servicioIds.reduce((s, id) => {
      const sv = datos.servicios.find((x) => x.id === id)
      if (!sv?.precio_desde) return s
      return s + (sv.unidad === 'dia' ? sv.precio_desde * nochesEfectivas : sv.precio_desde)
    }, 0)

  const toggleServicio = (id: string) => setServicioIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  const minFecha = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const codigo = await crearSolicitud({
        ...contacto,
        oferta_id: oferta?.oferta.id,
        procedimiento_id: oferta ? undefined : procedimientoId || undefined,
        ciudad_id: oferta ? undefined : ciudadId || undefined,
        fecha_tentativa: fecha || undefined,
        alojamiento_id: aloj?.id,
        noches: aloj ? nochesEfectivas : undefined,
        servicio_ids: servicioIds,
        mensaje: mensaje.trim() || undefined,
        consentimiento: acepta,
        consentimiento_version: CONSENTIMIENTO_VERSION,
        canal: 'web',
        utm: leerUTM(),
      })
      navigate('/solicitud-enviada', { state: { codigo, email: contacto.email.trim().toLowerCase(), nombre: contacto.nombre } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="kicker">— Solicitud de contacto</div>
      <h1 className="titulo mt-2 text-4xl">
        Solicita una <em>valoración.</em>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-piedra">
        No incluyas información clínica ni documentos. Un coordinador te contactará para agendar la valoración con el
        profesional; una solicitud no es una reserva confirmada.
      </p>

      <form onSubmit={enviar} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Bloque n="1" titulo="¿Qué te interesa?">
            {oferta ? (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="titulo text-xl">{oferta.procedimiento.nombre}</div>
                  <div className="text-sm">
                    {oferta.institucion.nombre} · {oferta.ciudad.nombre}
                  </div>
                  {oferta.profesional && <div className="text-sm text-piedra">{oferta.profesional.nombre}</div>}
                  <div className="mt-2">
                    <EstadoVerificacion v={oferta.institucion.verificacion} />
                  </div>
                  {(oferta.oferta.incluye || oferta.oferta.no_incluye) && (
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                      {oferta.oferta.incluye && (
                        <p>
                          <b>Incluye:</b> {oferta.oferta.incluye}
                        </p>
                      )}
                      {oferta.oferta.no_incluye && (
                        <p>
                          <b>No incluye:</b> {oferta.oferta.no_incluye}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Link to="/explorar" className="text-xs underline">
                  Cambiar
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Procedimiento">
                  <select value={procedimientoId} onChange={(e) => setProcedimientoId(e.target.value)} className="campo">
                    <option value="">Orientación general</option>
                    {datos.procedimientos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label="Ciudad preferida">
                  <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} className="campo">
                    <option value="">Sin preferencia</option>
                    {datos.ciudades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
            )}
            <div className="mt-4 max-w-xs">
              <Campo label="Fecha tentativa (opcional)">
                <input type="date" min={minFecha} value={fecha} onChange={(e) => setFecha(e.target.value)} className="campo" />
              </Campo>
            </div>
          </Bloque>

          <Bloque n="2" titulo="Arma tu plan (opcional)">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={quiereAlojamiento} onChange={(e) => setQuiereAlojamiento(e.target.checked)} />
              Necesito alojamiento durante la recuperación
            </label>
            {quiereAlojamiento && (
              <div className="mt-4 space-y-4">
                {alojamientos.length === 0 ? (
                  <p className="text-sm text-piedra">Aún no tenemos alojamientos aliados en esta ciudad. El coordinador te orientará.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {alojamientos.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => setAlojamientoId(a.id === alojamientoId ? '' : a.id)}
                        className={`border p-4 text-left transition ${alojamientoId === a.id ? 'border-oro bg-oro/10' : 'border-arena bg-white hover:border-piedra'}`}
                      >
                        <div className="etiqueta">{nombreTipoAlojamiento[a.tipo]}</div>
                        <div className="font-medium">{a.nombre}</div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-piedra">
                          {a.incluye_enfermeria && (
                            <span className="flex items-center gap-1">
                              <HeartPulse size={12} /> Enfermería
                            </span>
                          )}
                          {a.incluye_alimentacion && (
                            <span className="flex items-center gap-1">
                              <Utensils size={12} /> Alimentación
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm">{a.precio_noche_desde ? `Desde ${formatoCOP(a.precio_noche_desde)} / noche` : 'Precio no informado'}</div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="max-w-[10rem]">
                  <Campo label="Noches">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={noches === '' ? nochesEfectivas : noches}
                      onChange={(e) => setNoches(e.target.value === '' ? '' : Math.min(60, Math.max(1, Number(e.target.value))))}
                      className="campo"
                    />
                  </Campo>
                </div>
              </div>
            )}
            <div className="mt-5 etiqueta">Servicios complementarios</div>
            <div className="grid gap-2">
              {datos.servicios.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-start gap-3 border border-arena bg-white p-3 text-sm hover:border-piedra">
                  <input type="checkbox" checked={servicioIds.includes(s.id)} onChange={() => toggleServicio(s.id)} className="mt-1" />
                  <span className="flex-1">
                    <span className="font-medium">{s.nombre}</span>
                    <span className="block text-xs text-piedra">{s.descripcion}</span>
                  </span>
                  <span className="text-xs whitespace-nowrap">
                    {s.precio_desde ? `Desde ${formatoCOP(s.precio_desde)}${s.unidad === 'dia' ? ' / día' : ''}` : 'Por cotizar'}
                  </span>
                </label>
              ))}
            </div>
          </Bloque>

          <Bloque n="3" titulo="Tus datos de contacto">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre">
                <input required maxLength={80} autoComplete="name" value={contacto.nombre} onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })} className="campo" />
              </Campo>
              <Campo label="Correo">
                <input required type="email" maxLength={120} autoComplete="email" value={contacto.email} onChange={(e) => setContacto({ ...contacto, email: e.target.value })} className="campo" />
              </Campo>
              <Campo label="Teléfono / WhatsApp">
                <input required minLength={7} maxLength={30} autoComplete="tel" value={contacto.telefono} onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })} className="campo" />
              </Campo>
              <Campo label="País de residencia">
                <select value={contacto.pais} onChange={(e) => setContacto({ ...contacto, pais: e.target.value })} className="campo">
                  {paises.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Campo>
              <div className="sm:col-span-2">
                <Campo label="Mensaje (opcional, sin información clínica)">
                  <textarea rows={3} maxLength={600} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="campo" placeholder="Ej.: prefiero que me contacten en la tarde." />
                </Campo>
              </div>
            </div>
            <label className="mt-4 flex items-start gap-2 text-xs text-piedra">
              <input type="checkbox" required checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5" />
              <span>
                Autorizo a PLASTINEX a tratar mis datos de contacto para gestionar esta solicitud y compartirlos con la institución
                seleccionada, conforme a la Ley 1581 de 2012 y al{' '}
                <Link to="/privacidad" target="_blank" className="underline">
                  aviso de privacidad
                </Link>
                .
              </span>
            </label>
          </Bloque>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-arena bg-white p-6">
            <div className="etiqueta">Resumen</div>
            <div className="titulo text-xl">{proc?.nombre ?? 'Orientación general'}</div>
            {oferta && <div className="text-sm text-piedra">{oferta.institucion.nombre}</div>}
            <dl className="mt-4 space-y-2 border-t border-arena pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-piedra">Procedimiento</dt>
                <dd className="text-right">{oferta ? textoPrecio(oferta.oferta.precio_min, oferta.oferta.precio_max) : 'Según valoración'}</dd>
              </div>
              {aloj && (
                <div className="flex justify-between gap-4">
                  <dt className="text-piedra">Alojamiento · {nochesEfectivas} noches</dt>
                  <dd>{aloj.precio_noche_desde ? formatoCOP(aloj.precio_noche_desde * nochesEfectivas) : 'Por cotizar'}</dd>
                </div>
              )}
              {servicioIds.length > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-piedra">Servicios ({servicioIds.length})</dt>
                  <dd>{formatoCOP(estimadoComplementos - (aloj?.precio_noche_desde ?? 0) * (aloj ? nochesEfectivas : 0))}</dd>
                </div>
              )}
            </dl>
            {estimadoComplementos > 0 && (
              <div className="mt-3 border-t border-arena pt-3 text-sm">
                Complementos desde <b>{formatoCOP(estimadoComplementos)}</b>
              </div>
            )}
            <p className="mt-3 text-[11px] text-piedra">
              Todos los valores son orientativos y se confirman en una cotización individual después de la valoración.
            </p>
            {error && <p className="mt-3 bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
            <button disabled={enviando} className="btn-oro mt-4 w-full">
              {enviando ? 'Enviando…' : 'Enviar solicitud →'}
            </button>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Bloque({ n, titulo, children }: { n: string; titulo: string; children: ReactNode }) {
  return (
    <section className="border border-arena bg-white p-6">
      <h2 className="mb-4 flex items-center gap-3 text-sm font-medium">
        <span className="titulo text-xl text-oro">0{n}</span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="etiqueta">{label}</span>
      {children}
    </label>
  )
}
