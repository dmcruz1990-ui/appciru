import { BedDouble, Building2, Check, HeartPulse, Utensils } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatoCOP, formatoUSD, nombreTipoAlojamiento } from '../../shared/format'
import { detallarOferta } from '../../shared/lookup'
import { calcularTotales, crearPedido, useDB } from '../../shared/store'
import { Avatar, Estrellas, Tarjeta } from '../../shared/ui'
import NoEncontrado from '../components/NoEncontrado'

const paises = ['Colombia', 'Estados Unidos', 'Canadá', 'España', 'México', 'Panamá', 'Chile', 'Puerto Rico', 'Otro']

export default function ArmarPlan() {
  const { ofertaId } = useParams()
  const db = useDB()
  const navigate = useNavigate()
  const oferta = db.ofertas.find((o) => o.id === ofertaId && o.activo)
  const d = oferta && detallarOferta(db, oferta)

  const [alojamientoId, setAlojamientoId] = useState<string | undefined>(undefined)
  const [noches, setNoches] = useState(d?.procedimiento.estadiaRecomendadaDias ?? 7)
  const [extraIds, setExtraIds] = useState<string[]>([])
  const [fecha, setFecha] = useState('')
  const [paciente, setPaciente] = useState({ nombre: '', email: '', telefono: '', pais: 'Colombia', edad: '' })
  const [comentarios, setComentarios] = useState('')
  const [acepta, setAcepta] = useState(false)

  if (!d) return <NoEncontrado texto="Este plan ya no está disponible." />

  const alojamientos = db.alojamientos.filter((a) => a.activo && a.ciudadId === d.ciudad.id)
  const plan = { ofertaId: d.oferta.id, alojamientoId, noches: alojamientoId ? noches : 0, extraIds }
  const totales = calcularTotales(db, plan)
  const tasa = db.configuracion.tasaUSD

  const toggleExtra = (id: string) => setExtraIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const pedido = crearPedido({
      ...plan,
      fechaDeseada: fecha,
      comentarios: comentarios.trim() || undefined,
      paciente: {
        nombre: paciente.nombre.trim(),
        email: paciente.email.trim().toLowerCase(),
        telefono: paciente.telefono.trim(),
        pais: paciente.pais,
        edad: paciente.edad ? Number(paciente.edad) : undefined,
      },
    })
    navigate(`/confirmacion/${pedido.id}`)
  }

  const minFecha = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)

  return (
    <form onSubmit={enviar} className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Arma tu plan</h1>

        <Paso n={1} titulo="Tu cirugía">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={`flex h-20 w-full items-end rounded-lg bg-gradient-to-br ${d.clinica.color} p-3 font-semibold text-white sm:w-56`}>
              {d.procedimiento.nombre}
            </div>
            <div className="flex-1 space-y-1 text-sm">
              <Link to={`/medico/${d.medico.id}`} className="flex items-center gap-2 font-semibold hover:underline">
                <Avatar nombre={d.medico.nombre} className="h-7 w-7 text-[10px]" /> {d.medico.nombre}
              </Link>
              <div className="flex items-center gap-1 text-slate-600">
                <Building2 size={14} /> {d.clinica.nombre}, {d.ciudad.nombre}
              </div>
              <div className="text-slate-500">
                Estadía recomendada: {d.procedimiento.estadiaRecomendadaDias} días
              </div>
            </div>
            <div className="text-right font-bold">{formatoCOP(d.oferta.precio)}</div>
          </div>
          <ul className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
            {d.procedimiento.incluye.map((i) => (
              <li key={i} className="flex items-center gap-1">
                <Check size={12} className="text-brand-600" /> {i}
              </li>
            ))}
          </ul>
        </Paso>

        <Paso n={2} titulo={`Alojamiento en ${d.ciudad.nombre}`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <OpcionAloj activo={!alojamientoId} onClick={() => setAlojamientoId(undefined)}>
              <div className="font-semibold">Ya tengo dónde quedarme</div>
              <div className="text-xs text-slate-500">No agregar alojamiento</div>
            </OpcionAloj>
            {alojamientos.map((a) => (
              <OpcionAloj key={a.id} activo={alojamientoId === a.id} onClick={() => setAlojamientoId(a.id)}>
                <div className="text-xs text-slate-500">{nombreTipoAlojamiento[a.tipo]}</div>
                <div className="font-semibold">{a.nombre}</div>
                <Estrellas valor={a.calificacion} size={11} />
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                  {a.incluyeEnfermeria && (
                    <span className="flex items-center gap-1">
                      <HeartPulse size={12} /> Enfermería
                    </span>
                  )}
                  {a.incluyeAlimentacion && (
                    <span className="flex items-center gap-1">
                      <Utensils size={12} /> Alimentación
                    </span>
                  )}
                  <span>{a.distanciaClinicaKm} km de la clínica</span>
                </div>
                <div className="mt-1 text-sm font-semibold">{formatoCOP(a.precioNoche)} / noche</div>
              </OpcionAloj>
            ))}
          </div>
          {alojamientoId && (
            <label className="mt-4 flex items-center gap-3 text-sm">
              <BedDouble size={16} /> Noches:
              <input
                type="number"
                min={1}
                max={60}
                value={noches}
                onChange={(e) => setNoches(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 rounded border border-slate-300 p-1.5"
              />
            </label>
          )}
        </Paso>

        <Paso n={3} titulo="Servicios adicionales">
          <div className="grid gap-2">
            {db.extras.map((ex) => (
              <label key={ex.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <input type="checkbox" checked={extraIds.includes(ex.id)} onChange={() => toggleExtra(ex.id)} className="mt-1" />
                <div className="flex-1">
                  <div className="font-medium">{ex.nombre}</div>
                  <div className="text-xs text-slate-500">{ex.descripcion}</div>
                </div>
                <div className="text-sm font-semibold whitespace-nowrap">
                  {formatoCOP(ex.precio)}
                  {ex.porNoche && <span className="font-normal text-slate-500"> / día</span>}
                </div>
              </label>
            ))}
          </div>
        </Paso>

        <Paso n={4} titulo="Tus datos">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Nombre completo">
              <input required value={paciente.nombre} onChange={(e) => setPaciente({ ...paciente, nombre: e.target.value })} className="input" />
            </Campo>
            <Campo label="Correo electrónico">
              <input required type="email" value={paciente.email} onChange={(e) => setPaciente({ ...paciente, email: e.target.value })} className="input" />
            </Campo>
            <Campo label="Teléfono / WhatsApp">
              <input required value={paciente.telefono} onChange={(e) => setPaciente({ ...paciente, telefono: e.target.value })} className="input" />
            </Campo>
            <Campo label="País de residencia">
              <select value={paciente.pais} onChange={(e) => setPaciente({ ...paciente, pais: e.target.value })} className="input">
                {paises.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Edad">
              <input type="number" min={18} max={90} value={paciente.edad} onChange={(e) => setPaciente({ ...paciente, edad: e.target.value })} className="input" />
            </Campo>
            <Campo label="Fecha deseada de cirugía">
              <input required type="date" min={minFecha} value={fecha} onChange={(e) => setFecha(e.target.value)} className="input" />
            </Campo>
            <Campo label="Comentarios para el equipo médico (opcional)" className="sm:col-span-2">
              <textarea rows={3} value={comentarios} onChange={(e) => setComentarios(e.target.value)} className="input" />
            </Campo>
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs text-slate-600">
            <input type="checkbox" required checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-0.5" />
            Autorizo el tratamiento de mis datos personales y de salud conforme a la Ley 1581 de 2012 para gestionar mi
            valoración, y entiendo que el precio final se confirma después de la valoración médica.
          </label>
        </Paso>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <Tarjeta className="p-5 shadow-sm">
          <div className="mb-3 text-lg font-semibold">Resumen del plan</div>
          <Linea t={d.procedimiento.nombre} v={totales.cirugia} />
          {alojamientoId && <Linea t={`Alojamiento · ${noches} noches`} v={totales.alojamiento} />}
          {extraIds.length > 0 && <Linea t={`Servicios adicionales (${extraIds.length})`} v={totales.extras} />}
          <div className="my-3 border-t border-slate-200" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Total estimado</span>
            <span className="text-2xl font-bold">{formatoCOP(totales.total)}</span>
          </div>
          <div className="text-right text-xs text-slate-500">≈ {formatoUSD(totales.total, tasa)} USD</div>
          <button className="mt-4 w-full rounded-full bg-accent-400 py-3 font-semibold text-slate-900 hover:bg-accent-500">
            Solicitar valoración
          </button>
          <p className="mt-2 text-center text-xs text-slate-500">No se cobra nada ahora. Un coordinador te contactará en menos de 24 h.</p>
        </Tarjeta>
      </aside>
    </form>
  )
}

function Paso({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <Tarjeta className="p-5">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">{n}</span>
        {titulo}
      </div>
      {children}
    </Tarjeta>
  )
}

function OpcionAloj({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${activo ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/30' : 'border-slate-200 hover:border-slate-400'}`}
    >
      {children}
    </button>
  )
}

function Campo({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block text-slate-600">{label}</span>
      {children}
    </label>
  )
}

function Linea({ t, v }: { t: string; v: number }) {
  return (
    <div className="flex justify-between gap-2 py-1 text-sm">
      <span className="text-slate-600">{t}</span>
      <span className="font-medium">{formatoCOP(v)}</span>
    </div>
  )
}
