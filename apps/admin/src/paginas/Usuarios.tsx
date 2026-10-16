import { formatoFecha, nombreRol, supabase, type Perfil, type Rol } from '@plastinex/shared'
import { useState } from 'react'
import { Titulo } from '../componentes/ui'
import { useDatos } from '../datos'
import { useSesion } from '../sesion'

export default function Usuarios() {
  const { datos, recargar } = useDatos()
  const { perfil: yo } = useSesion()
  const [error, setError] = useState<string | null>(null)

  const cambiar = async (p: Perfil, cambios: Partial<Perfil>) => {
    setError(null)
    const { error } = await supabase.from('px_perfiles').update(cambios).eq('id', p.id)
    if (error) setError(error.message)
    recargar()
  }

  return (
    <div>
      <Titulo>Usuarios</Titulo>
      <p className="mb-4 max-w-3xl text-sm text-stone-600">
        Las personas crean su cuenta desde la pantalla de ingreso del panel y quedan como «pendiente». Asígnales un rol aquí. El rol
        «Clínica» solo ve las solicitudes de su institución.
      </p>
      {error && <p className="mb-3 rounded-md bg-rose-50 p-2 text-sm text-rose-800">{error}</p>}
      <div className="tarjeta overflow-x-auto">
        <table className="tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Institución (rol clínica)</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {datos.perfiles.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="font-medium">{p.nombre || '—'}</div>
                  <div className="text-xs text-stone-500">{p.email}</div>
                </td>
                <td>
                  <select
                    disabled={p.id === yo?.id}
                    value={p.rol}
                    onChange={(e) => void cambiar(p, { rol: e.target.value as Rol, institucion_id: e.target.value === 'clinica' ? p.institucion_id : null })}
                    className="campo !w-auto"
                  >
                    {Object.entries(nombreRol).map(([v, t]) => (
                      <option key={v} value={v}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {p.rol === 'clinica' ? (
                    <select value={p.institucion_id ?? ''} onChange={(e) => void cambiar(p, { institucion_id: e.target.value || null })} className="campo !w-auto">
                      <option value="">—</option>
                      {datos.instituciones.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </td>
                <td>{formatoFecha(p.creado_en)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
