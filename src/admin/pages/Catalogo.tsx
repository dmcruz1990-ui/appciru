import { useState, type FormEvent } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { formatoCOP, nombreCategoria, nombreTipoAlojamiento } from '../../shared/format'
import { nombreCiudad } from '../../shared/lookup'
import { alternarActivo, guardarItem, nuevoId, useDB } from '../../shared/store'
import { Tarjeta } from '../../shared/ui'

const tabs = [
  { id: 'ofertas', t: 'Ofertas (publicaciones)' },
  { id: 'medicos', t: 'Médicos' },
  { id: 'clinicas', t: 'Clínicas' },
  { id: 'procedimientos', t: 'Procedimientos' },
  { id: 'alojamientos', t: 'Alojamientos' },
] as const

export default function Catalogo() {
  const { tab = 'ofertas' } = useParams()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Catálogo</h1>
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <NavLink
            key={t.id}
            to={`/admin/catalogo/${t.id}`}
            className={() =>
              `-mb-px border-b-2 px-3 py-2 text-sm ${tab === t.id ? 'border-brand-600 font-semibold text-brand-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`
            }
          >
            {t.t}
          </NavLink>
        ))}
      </div>
      {tab === 'ofertas' && <TablaOfertas />}
      {tab === 'medicos' && <TablaMedicos />}
      {tab === 'clinicas' && <TablaClinicas />}
      {tab === 'procedimientos' && <TablaProcedimientos />}
      {tab === 'alojamientos' && <TablaAlojamientos />}
    </div>
  )
}

function Activo({ activo, onClick }: { activo: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
      title="Clic para cambiar"
    >
      {activo ? 'Publicado' : 'Oculto'}
    </button>
  )
}

function Tabla({ cabeceras, children }: { cabeceras: string[]; children: React.ReactNode }) {
  return (
    <Tarjeta className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
          <tr>
            {cabeceras.map((c) => (
              <th key={c} className="px-4 py-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </Tarjeta>
  )
}

function PrecioEditable({ valor, onGuardar }: { valor: number; onGuardar: (v: number) => void }) {
  const [editando, setEditando] = useState(false)
  const [v, setV] = useState(String(valor))
  if (!editando)
    return (
      <button onClick={() => (setV(String(valor)), setEditando(true))} className="hover:underline" title="Editar precio">
        {formatoCOP(valor)}
      </button>
    )
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const n = Number(v)
        if (n > 0) onGuardar(n)
        setEditando(false)
      }}
      className="flex gap-1"
    >
      <input autoFocus type="number" value={v} onChange={(e) => setV(e.target.value)} onBlur={() => setEditando(false)} className="input w-32" />
    </form>
  )
}

function TablaOfertas() {
  const db = useDB()
  const [form, setForm] = useState({ medicoId: '', procedimientoId: '', clinicaId: '', precio: '' })
  const medico = db.medicos.find((m) => m.id === form.medicoId)

  const crear = (e: FormEvent) => {
    e.preventDefault()
    guardarItem('ofertas', {
      id: nuevoId('of'),
      medicoId: form.medicoId,
      procedimientoId: form.procedimientoId,
      clinicaId: form.clinicaId,
      precio: Number(form.precio),
      activo: true,
    })
    setForm({ medicoId: '', procedimientoId: '', clinicaId: '', precio: '' })
  }

  return (
    <div className="space-y-4">
      <Tarjeta className="p-4">
        <div className="mb-2 text-sm font-semibold">Nueva publicación</div>
        <form onSubmit={crear} className="grid gap-2 sm:grid-cols-5">
          <select required value={form.medicoId} onChange={(e) => setForm({ ...form, medicoId: e.target.value, clinicaId: '' })} className="input">
            <option value="">Médico…</option>
            {db.medicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <select required value={form.procedimientoId} onChange={(e) => setForm({ ...form, procedimientoId: e.target.value })} className="input">
            <option value="">Procedimiento…</option>
            {db.procedimientos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select required value={form.clinicaId} onChange={(e) => setForm({ ...form, clinicaId: e.target.value })} className="input">
            <option value="">Clínica…</option>
            {db.clinicas
              .filter((c) => !medico || medico.clinicaIds.includes(c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
          </select>
          <input required type="number" min={1} placeholder="Precio COP" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="input" />
          <button className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700">Publicar</button>
        </form>
      </Tarjeta>
      <Tabla cabeceras={['Procedimiento', 'Médico', 'Clínica', 'Precio', 'Estado']}>
        {db.ofertas.map((o) => (
          <tr key={o.id}>
            <td className="px-4 py-2">{db.procedimientos.find((p) => p.id === o.procedimientoId)?.nombre}</td>
            <td className="px-4 py-2">{db.medicos.find((m) => m.id === o.medicoId)?.nombre}</td>
            <td className="px-4 py-2">{db.clinicas.find((c) => c.id === o.clinicaId)?.nombre}</td>
            <td className="px-4 py-2">
              <PrecioEditable valor={o.precio} onGuardar={(precio) => guardarItem('ofertas', { ...o, precio })} />
            </td>
            <td className="px-4 py-2">
              <Activo activo={o.activo} onClick={() => alternarActivo('ofertas', o.id)} />
            </td>
          </tr>
        ))}
      </Tabla>
    </div>
  )
}

function TablaMedicos() {
  const db = useDB()
  return (
    <Tabla cabeceras={['Nombre', 'Especialidad', 'ReTHUS', 'Ciudad', 'Calificación', 'Estado']}>
      {db.medicos.map((m) => (
        <tr key={m.id}>
          <td className="px-4 py-2 font-medium">{m.nombre}</td>
          <td className="px-4 py-2">{m.especialidad}</td>
          <td className="px-4 py-2 font-mono text-xs">{m.rethus}</td>
          <td className="px-4 py-2">{nombreCiudad(db, m.ciudadId)}</td>
          <td className="px-4 py-2">
            {m.calificacion} ({m.resenas})
          </td>
          <td className="px-4 py-2">
            <Activo activo={m.activo} onClick={() => alternarActivo('medicos', m.id)} />
          </td>
        </tr>
      ))}
    </Tabla>
  )
}

function TablaClinicas() {
  const db = useDB()
  return (
    <Tabla cabeceras={['Nombre', 'Ciudad', 'REPS', 'Quirófanos', 'Acreditada', 'Estado']}>
      {db.clinicas.map((c) => (
        <tr key={c.id}>
          <td className="px-4 py-2 font-medium">{c.nombre}</td>
          <td className="px-4 py-2">{nombreCiudad(db, c.ciudadId)}</td>
          <td className="px-4 py-2 font-mono text-xs">{c.codigoREPS}</td>
          <td className="px-4 py-2">{c.quirofanos}</td>
          <td className="px-4 py-2">{c.acreditadaICONTEC ? 'Sí' : 'No'}</td>
          <td className="px-4 py-2">
            <Activo activo={c.activo} onClick={() => alternarActivo('clinicas', c.id)} />
          </td>
        </tr>
      ))}
    </Tabla>
  )
}

function TablaProcedimientos() {
  const db = useDB()
  return (
    <Tabla cabeceras={['Nombre', 'Categoría', 'Duración', 'Hospitalización', 'Estadía recomendada', 'Estado']}>
      {db.procedimientos.map((p) => (
        <tr key={p.id}>
          <td className="px-4 py-2 font-medium">{p.nombre}</td>
          <td className="px-4 py-2">{nombreCategoria[p.categoria]}</td>
          <td className="px-4 py-2">{p.duracionHoras} h</td>
          <td className="px-4 py-2">{p.hospitalizacionNoches} noches</td>
          <td className="px-4 py-2">{p.estadiaRecomendadaDias} días</td>
          <td className="px-4 py-2">
            <Activo activo={p.activo} onClick={() => alternarActivo('procedimientos', p.id)} />
          </td>
        </tr>
      ))}
    </Tabla>
  )
}

function TablaAlojamientos() {
  const db = useDB()
  return (
    <Tabla cabeceras={['Nombre', 'Tipo', 'Ciudad', 'Precio / noche', 'Enfermería', 'Estado']}>
      {db.alojamientos.map((a) => (
        <tr key={a.id}>
          <td className="px-4 py-2 font-medium">{a.nombre}</td>
          <td className="px-4 py-2">{nombreTipoAlojamiento[a.tipo]}</td>
          <td className="px-4 py-2">{nombreCiudad(db, a.ciudadId)}</td>
          <td className="px-4 py-2">
            <PrecioEditable valor={a.precioNoche} onGuardar={(precioNoche) => guardarItem('alojamientos', { ...a, precioNoche })} />
          </td>
          <td className="px-4 py-2">{a.incluyeEnfermeria ? 'Sí' : 'No'}</td>
          <td className="px-4 py-2">
            <Activo activo={a.activo} onClick={() => alternarActivo('alojamientos', a.id)} />
          </td>
        </tr>
      ))}
    </Tabla>
  )
}
