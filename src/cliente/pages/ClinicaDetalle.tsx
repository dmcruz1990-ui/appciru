import { BadgeCheck, Check, DoorOpen, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatoCOP, nombreTipoAlojamiento } from '../../shared/format'
import { nombreCiudad, ofertasPublicas } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import { Avatar, Estrellas, Insignia, Tarjeta } from '../../shared/ui'
import OfertaCard from '../components/OfertaCard'
import NoEncontrado from '../components/NoEncontrado'

export default function ClinicaDetalle() {
  const { id } = useParams()
  const db = useDB()
  const clinica = db.clinicas.find((c) => c.id === id && c.activo)
  if (!clinica) return <NoEncontrado />

  const opciones = ofertasPublicas(db).filter((d) => d.clinica.id === clinica.id)
  const medicos = db.medicos.filter((m) => m.activo && m.clinicaIds.includes(clinica.id))
  const alojamientos = db.alojamientos.filter((a) => a.activo && a.ciudadId === clinica.ciudadId)

  return (
    <div>
      <div className={`bg-gradient-to-br ${clinica.color} text-white`}>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold drop-shadow">{clinica.nombre}</h1>
          <div className="mt-1 flex items-center gap-1 text-white/90">
            <MapPin size={14} /> {clinica.direccion}, {nombreCiudad(db, clinica.ciudadId)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Insignia className="bg-white/90 text-slate-800">
              <BadgeCheck size={12} /> REPS {clinica.codigoREPS}
            </Insignia>
            {clinica.acreditadaICONTEC && <Insignia className="bg-white/90 text-slate-800">Acreditada</Insignia>}
            <Insignia className="bg-white/90 text-slate-800">
              <DoorOpen size={12} /> {clinica.quirofanos} quirófanos
            </Insignia>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Tarjeta className="p-5 md:col-span-2">
            <Estrellas valor={clinica.calificacion} resenas={clinica.resenas} />
            <p className="mt-2 text-slate-700">{clinica.descripcion}</p>
            <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              {clinica.servicios.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <Check size={14} className="text-brand-600" /> {s}
                </li>
              ))}
            </ul>
          </Tarjeta>
          <Tarjeta className="p-5">
            <div className="mb-2 font-semibold">Especialistas</div>
            <div className="space-y-2">
              {medicos.map((m) => (
                <Link key={m.id} to={`/medico/${m.id}`} className="flex items-center gap-2 hover:underline">
                  <Avatar nombre={m.nombre} className="h-8 w-8 text-xs" />
                  <span className="text-sm">{m.nombre}</span>
                </Link>
              ))}
            </div>
          </Tarjeta>
        </div>

        <h2 className="mt-10 mb-4 text-2xl font-bold">Procedimientos en esta clínica</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {opciones.map((d) => (
            <OfertaCard key={d.oferta.id} d={d} />
          ))}
        </div>

        {alojamientos.length > 0 && (
          <>
            <h2 className="mt-10 mb-4 text-2xl font-bold">Alojamiento cercano</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alojamientos.map((a) => (
                <Tarjeta key={a.id} className="p-4">
                  <div className="text-xs text-slate-500">{nombreTipoAlojamiento[a.tipo]}</div>
                  <div className="font-semibold">{a.nombre}</div>
                  <Estrellas valor={a.calificacion} size={12} />
                  <div className="mt-1 text-sm text-slate-600">
                    {formatoCOP(a.precioNoche)} / noche · {a.distanciaClinicaKm} km
                  </div>
                </Tarjeta>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
