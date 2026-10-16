import { formatoFecha, nombreCiudad, supabase, verificaciones, type Verificacion as V } from '@plastinex/shared'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Modal, Titulo, VerifBadge } from '../componentes/ui'
import { useDatos } from '../datos'
import { useSesion } from '../sesion'

interface Item {
  id: string
  tabla: 'px_instituciones' | 'px_profesionales'
  tipo: 'Institución' | 'Profesional'
  nombre: string
  ciudad: string
  registro: string | null
  sociedad?: string | null
  verificacion: V
  notas: string | null
  verificado_en: string | null
}

const chequeosInstitucion = [
  'Habilitación consultada en el REPS (servicio de cirugía plástica)',
  'Servicio de anestesia / quirófano habilitado',
  'Representante legal y contrato recibidos',
  'Precios publicados confirmados por la institución',
]
const chequeosProfesional = [
  'Especialidad registrada en el ReTHUS',
  'Membresía en sociedad científica confirmada (p. ej. SCCP)',
  'Vinculación con la institución confirmada',
  'Autorización de uso de nombre e imagen',
]

export default function Verificacion() {
  const { datos, recargar } = useDatos()
  const [filtro, setFiltro] = useState<'pendientes' | 'todas'>('pendientes')
  const [abierto, setAbierto] = useState<Item | null>(null)

  const items: Item[] = [
    ...datos.instituciones.map((i) => ({
      id: i.id,
      tabla: 'px_instituciones' as const,
      tipo: 'Institución' as const,
      nombre: i.nombre,
      ciudad: nombreCiudad(datos, i.ciudad_id),
      registro: i.codigo_reps,
      verificacion: i.verificacion,
      notas: i.verificacion_notas,
      verificado_en: i.verificado_en,
    })),
    ...datos.profesionales.map((p) => ({
      id: p.id,
      tabla: 'px_profesionales' as const,
      tipo: 'Profesional' as const,
      nombre: p.nombre,
      ciudad: nombreCiudad(datos, p.ciudad_id),
      registro: p.rethus,
      sociedad: p.sociedad,
      verificacion: p.verificacion,
      notas: p.verificacion_notas,
      verificado_en: p.verificado_en,
    })),
  ].filter((x) => filtro === 'todas' || x.verificacion !== 'verificado')

  return (
    <div>
      <Titulo
        accion={
          <div className="flex rounded-md border border-stone-300 bg-white p-0.5 text-sm">
            {(['pendientes', 'todas'] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`rounded px-3 py-1 capitalize ${filtro === f ? 'bg-tinta text-white' : ''}`}>
                {f}
              </button>
            ))}
          </div>
        }
      >
        Verificación documental
      </Titulo>
      <p className="mb-4 max-w-3xl text-sm text-stone-600">
        La insignia «Documentación verificada» solo se muestra en el sitio cuando aquí se marca como verificado. Consulta las fuentes
        oficiales y deja constancia en las notas.
      </p>
      <div className="tarjeta overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>REPS / ReTHUS</th>
              <th>Estado</th>
              <th>Verificado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id} className="hover:bg-stone-50">
                <td className="text-stone-500">{x.tipo}</td>
                <td className="font-medium">{x.nombre}</td>
                <td>{x.ciudad}</td>
                <td className="font-mono text-xs">{x.registro ?? '—'}</td>
                <td>
                  <VerifBadge v={x.verificacion} />
                </td>
                <td>{x.verificado_en ? formatoFecha(x.verificado_en) : '—'}</td>
                <td className="text-right">
                  <button onClick={() => setAbierto(x)} className="text-sm text-oro-osc hover:underline">
                    Revisar
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-stone-400">
                  Todo está verificado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {abierto && (
        <Revision
          item={abierto}
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

function Revision({ item, onCerrar, onGuardado }: { item: Item; onCerrar: () => void; onGuardado: () => void }) {
  const { perfil } = useSesion()
  const lista = item.tipo === 'Institución' ? chequeosInstitucion : chequeosProfesional
  const [hechos, setHechos] = useState<string[]>([])
  const [estado, setEstado] = useState<V>(item.verificacion)
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string | null>(null)
  const completos = hechos.length === lista.length

  const guardar = async () => {
    if (estado === 'verificado' && !completos) return setError('Para verificar, completa todos los chequeos.')
    const fecha = new Date().toISOString().slice(0, 10)
    const linea = `[${fecha} · ${perfil?.email}] ${verificaciones.find((v) => v.id === estado)!.nombre}${hechos.length ? ` · ${hechos.join('; ')}` : ''}${nota.trim() ? ` · ${nota.trim()}` : ''}`
    const { error } = await supabase
      .from(item.tabla)
      .update({
        verificacion: estado,
        verificacion_notas: [linea, item.notas].filter(Boolean).join('\n'),
        verificado_en: estado === 'verificado' ? new Date().toISOString() : null,
        verificado_por: estado === 'verificado' ? perfil?.id : null,
      })
      .eq('id', item.id)
    if (error) return setError(error.message)
    onGuardado()
  }

  return (
    <Modal titulo={`Revisión · ${item.nombre}`} onCerrar={onCerrar}>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-3">
          {item.tipo === 'Institución' ? (
            <a href="https://prestadores.minsalud.gov.co/habilitacion/" target="_blank" rel="noreferrer" className="btn-sec">
              <ExternalLink size={14} /> Consultar REPS
            </a>
          ) : (
            <a href="https://web.sispro.gov.co/THS/Cliente/ConsultasPublicas/ConsultaPublicaDeTHxIdentificacion.aspx" target="_blank" rel="noreferrer" className="btn-sec">
              <ExternalLink size={14} /> Consultar ReTHUS
            </a>
          )}
          <span className="self-center text-stone-500">
            Registro informado: <span className="font-mono">{item.registro ?? '—'}</span>
            {item.sociedad ? ` · ${item.sociedad}` : ''}
          </span>
        </div>
        <div>
          <span className="etiqueta">Chequeos</span>
          <div className="space-y-1.5">
            {lista.map((c) => (
              <label key={c} className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5" checked={hechos.includes(c)} onChange={(e) => setHechos(e.target.checked ? [...hechos, c] : hechos.filter((x) => x !== c))} />
                {c}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="etiqueta">Nuevo estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value as V)} className="campo">
              {verificaciones.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="etiqueta">Nota</span>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej.: REPS vigente hasta 2027" className="campo" />
          </label>
        </div>
        {item.notas && (
          <div>
            <span className="etiqueta">Historial de verificación</span>
            <pre className="max-h-40 overflow-auto rounded-md bg-stone-50 p-2 font-sans text-xs whitespace-pre-wrap text-stone-600">{item.notas}</pre>
          </div>
        )}
        {error && <p className="rounded-md bg-rose-50 p-2 text-rose-800">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onCerrar} className="btn-sec">
            Cancelar
          </button>
          <button onClick={() => void guardar()} className="btn">
            Guardar revisión
          </button>
        </div>
      </div>
    </Modal>
  )
}
