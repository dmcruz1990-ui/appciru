import { confirmarPago, estadosPostulacion, formatoFecha, nombrePais, nombreTipoInstitucion, revisarPostulacion, type EstadoPago, type EstadoPostulacion, type Postulacion } from '@plastinex/shared'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Modal, Titulo } from '../componentes/ui'
import { useDatos } from '../datos'
import { useSesion } from '../sesion'

const pagos: Record<EstadoPago, [string, string]> = {
  sin_plan: ['Sin plan', 'text-stone-400'],
  pendiente: ['Pago pendiente', 'bg-amber-100 text-amber-800'],
  pagado: ['Pagado', 'bg-emerald-100 text-emerald-800'],
}

const colores: Record<EstadoPostulacion, string> = {
  nueva: 'bg-amber-100 text-amber-800',
  en_revision: 'bg-sky-100 text-sky-800',
  aprobada: 'bg-emerald-100 text-emerald-800',
  rechazada: 'bg-stone-200 text-stone-700',
}

/** Registros de cirujanos enviados desde «Para clínicas → Registro» en el sitio público. */
export default function Registros() {
  const { datos, recargar } = useDatos()
  const { esStaff } = useSesion()
  const [filtro, setFiltro] = useState<'pendientes' | 'todos'>('pendientes')
  const [abierto, setAbierto] = useState<Postulacion | null>(null)
  if (!esStaff) return null

  // Pendiente = algo que hacer: revisar documentos o confirmar un pago.
  const lista = datos.postulaciones.filter((p) => filtro === 'todos' || p.estado === 'nueva' || p.estado === 'en_revision' || (p.estado === 'aprobada' && p.pago_estado === 'pendiente'))
  const ciudad = (p: Postulacion) => (p.ciudad_id ? (datos.ciudades.find((c) => c.id === p.ciudad_id)?.nombre ?? p.ciudad_id) : `${p.ciudad_otra} (nueva)`)

  return (
    <div>
      <Titulo
        accion={
          <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-sm">
            {(['pendientes', 'todos'] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`rounded px-3 py-1 capitalize ${filtro === f ? 'bg-tinta text-white' : ''}`}>
                {f}
              </button>
            ))}
          </div>
        }
      >
        Registros de médicos
      </Titulo>
      <p className="mb-4 max-w-3xl text-sm text-stone-600">
        Cirujanos que se registraron desde «Para clínicas». Al aprobar se crean su perfil, su clínica y sus procedimientos{' '}
        <b>sin publicar</b>, y su usuario recibe el rol «Clínica» para atender sus solicitudes en este panel. Después verifica los documentos en{' '}
        <Link to="/verificacion" className="text-oro-osc underline">
          Verificación
        </Link>
        , agrega precios y fotos en Catálogo y publica.
      </p>
      <div className="tarjeta overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              <th>Profesional</th>
              <th>Clínica</th>
              <th>Ciudad</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Pago</th>
              <th>Recibido</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td>
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-xs text-stone-500">{p.email}</div>
                </td>
                <td>{p.institucion_nombre}</td>
                <td>
                  {ciudad(p)}, {nombrePais(p.pais)}
                </td>
                <td className="font-mono text-xs">{p.registro_profesional}</td>
                <td>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${colores[p.estado]}`}>{estadosPostulacion[p.estado].es}</span>
                </td>
                <td>
                  {p.estado === 'aprobada' ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${pagos[p.pago_estado][1]}`}>
                      {pagos[p.pago_estado][0]}
                      {p.plan_id ? ` · ${datos.planes.find((x) => x.id === p.plan_id)?.nombre ?? p.plan_id}` : ''}
                    </span>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td>{formatoFecha(p.actualizado_en)}</td>
                <td className="text-right">
                  <button onClick={() => setAbierto(p)} className="text-sm text-oro-osc hover:underline">
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-stone-400">
                  {filtro === 'pendientes' ? 'No hay registros pendientes.' : 'Aún no hay registros.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {abierto && (
        <Revision
          p={abierto}
          onCerrar={() => setAbierto(null)}
          onGuardado={() => {
            setAbierto(null)
            recargar()
          }}
        />
      )}
    </div>
  )
}

function Revision({ p, onCerrar, onGuardado }: { p: Postulacion; onCerrar: () => void; onGuardado: () => void }) {
  const { datos } = useDatos()
  const [motivo, setMotivo] = useState(p.motivo ?? '')
  const [ciudadId, setCiudadId] = useState(p.ciudad_id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const procs = datos.procedimientos.filter((x) => p.procedimientos.includes(x.id)).map((x) => x.nombre)
  const ciudades = datos.ciudades.filter((c) => c.pais === p.pais)
  const cerrado = p.estado === 'aprobada'

  const decidir = async (estado: Exclude<EstadoPostulacion, 'nueva'>) => {
    setError(null)
    setGuardando(true)
    try {
      await revisarPostulacion(p.id, estado, motivo, ciudadId || undefined)
      onGuardado()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setGuardando(false)
    }
  }

  const filas: [string, string][] = [
    ['Correo', p.email],
    ['Teléfono', p.telefono],
    ['Especialidad', p.especialidad],
    ['Registro profesional', [p.registro_profesional, p.autoridad_registro].filter(Boolean).join(' · ')],
    ['Sociedad', p.sociedad ?? '—'],
    ['Experiencia', p.anios_experiencia != null ? `${p.anios_experiencia} años` : '—'],
    ['Idiomas', p.idiomas.join(', ') || '—'],
    ['Clínica', `${p.institucion_nombre} (${nombreTipoInstitucion[p.institucion_tipo]})`],
    ['Habilitación', p.institucion_registro ?? '—'],
    ['Sitio web', p.sitio_web ?? '—'],
    ['Ubicación', `${p.ciudad_id ? (datos.ciudades.find((c) => c.id === p.ciudad_id)?.nombre ?? p.ciudad_id) : p.ciudad_otra}, ${nombrePais(p.pais)}`],
    ['Procedimientos', procs.join(', ') || '—'],
    ['Valoración virtual', p.valoracion_virtual ? 'Sí' : 'No'],
    ['Declaración aceptada', `${formatoFecha(p.declara_en)} · términos ${p.terminos_version}`],
  ]

  return (
    <Modal titulo={`Registro · ${p.nombre}`} onCerrar={onCerrar}>
      <div className="space-y-5 text-sm">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[170px_1fr]">
          {filas.map(([t, v]) => (
            <div key={t} className="contents">
              <dt className="text-stone-500">{t}</dt>
              <dd className="break-words">{v}</dd>
            </div>
          ))}
        </dl>
        {p.bio && <p className="rounded-md bg-stone-50 p-3 text-stone-700">{p.bio}</p>}

        {cerrado && <Pago p={p} onGuardado={onGuardado} />}
        {cerrado ? (
          <p className="rounded-md bg-emerald-50 p-3 text-emerald-800">
            Aprobado el {p.revisado_en ? formatoFecha(p.revisado_en) : '—'}. Perfil y clínica creados sin publicar: complétalos en{' '}
            <Link to="/verificacion" className="underline">
              Verificación
            </Link>{' '}
            y{' '}
            <Link to="/catalogo/instituciones" className="underline">
              Catálogo
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="etiqueta">Ciudad para el perfil</span>
                <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} className="campo">
                  <option value="">{p.ciudad_otra ? `Falta crear «${p.ciudad_otra}» en Catálogo → Ciudades` : 'Elige una ciudad'}</option>
                  {ciudades.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="etiqueta">Mensaje al médico (obligatorio para pedir cambios)</span>
                <input value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={600} className="campo" placeholder="Ej.: adjunta la habilitación REPS vigente" />
              </label>
            </div>
            {error && <p className="text-red-700">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              {p.estado === 'nueva' && (
                <button disabled={guardando} onClick={() => void decidir('en_revision')} className="btn-sec">
                  Marcar en verificación
                </button>
              )}
              <button disabled={guardando} onClick={() => void decidir('rechazada')} className="btn-sec">
                Pedir cambios
              </button>
              <button disabled={guardando || !ciudadId} onClick={() => void decidir('aprobada')} className="btn">
                Aprobar y crear perfil
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

/** Tras la aprobación: el médico elige plan y paga; aquí se confirma el pago y se activa la suscripción. */
function Pago({ p, onGuardado }: { p: Postulacion; onGuardado: () => void }) {
  const { datos } = useDatos()
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const plan = datos.planes.find((x) => x.id === p.plan_id)
  const confirmar = async () => {
    if (!window.confirm(`¿Confirmas que recibiste el pago de ${p.nombre} por el plan ${plan?.nombre}?`)) return
    setGuardando(true)
    setError(null)
    try {
      await confirmarPago(p.id)
      onGuardado()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setGuardando(false)
    }
  }
  return (
    <div className="rounded-md border border-stone-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="etiqueta">Pago</span>
          {p.pago_estado === 'pagado' ? (
            <span className="text-emerald-700">
              {plan?.nombre} · pagado el {p.pago_confirmado_en ? formatoFecha(p.pago_confirmado_en) : '—'}. Ya puedes publicar su clínica y su perfil.
            </span>
          ) : p.pago_estado === 'pendiente' ? (
            <span>
              Eligió <b>{plan?.nombre}</b> el {p.plan_elegido_en ? formatoFecha(p.plan_elegido_en) : '—'}. Confirma cuando el dinero esté en la cuenta.
            </span>
          ) : (
            <span className="text-stone-500">Aún no ha elegido plan (lo hace en su página de registro).</span>
          )}
        </div>
        {p.pago_estado === 'pendiente' && (
          <button disabled={guardando} onClick={() => void confirmar()} className="btn">
            Confirmar pago
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-red-700">{error}</p>}
    </div>
  )
}
