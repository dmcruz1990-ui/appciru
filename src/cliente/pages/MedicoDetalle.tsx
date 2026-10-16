import { BadgeCheck, Building2, Languages, Video } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { nombreCiudad, ofertasPublicas } from '../../shared/lookup'
import { useDB } from '../../shared/store'
import { Avatar, Estrellas, Insignia, Tarjeta } from '../../shared/ui'
import OfertaCard from '../components/OfertaCard'
import NoEncontrado from '../components/NoEncontrado'

export default function MedicoDetalle() {
  const { id } = useParams()
  const db = useDB()
  const medico = db.medicos.find((m) => m.id === id && m.activo)
  if (!medico) return <NoEncontrado />

  const opciones = ofertasPublicas(db).filter((d) => d.medico.id === medico.id)
  const clinicas = db.clinicas.filter((c) => medico.clinicaIds.includes(c.id))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Tarjeta className="flex flex-col gap-5 p-6 md:flex-row">
        <Avatar nombre={medico.nombre} className="h-24 w-24 text-3xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{medico.nombre}</h1>
          <div className="text-slate-600">{medico.especialidad}</div>
          <div className="mt-1">
            <Estrellas valor={medico.calificacion} resenas={medico.resenas} />
          </div>
          <p className="mt-3 max-w-3xl text-sm text-slate-700">{medico.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Insignia className="bg-brand-50 text-brand-700">
              <BadgeCheck size={12} /> ReTHUS {medico.rethus}
            </Insignia>
            {medico.sociedad && <Insignia className="bg-brand-50 text-brand-700">Miembro {medico.sociedad}</Insignia>}
            {medico.valoracionVirtual && (
              <Insignia className="bg-sky-50 text-sky-700">
                <Video size={12} /> Valoración virtual
              </Insignia>
            )}
            <Insignia className="bg-slate-100 text-slate-700">
              <Languages size={12} /> {medico.idiomas.join(', ')}
            </Insignia>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center md:w-72 md:grid-cols-1 md:text-left">
          <Stat n={`${medico.aniosExperiencia}`} t="años de experiencia" />
          <Stat n={medico.cirugiasRealizadas.toLocaleString('es-CO')} t="cirugías realizadas" />
          <Stat n={nombreCiudad(db, medico.ciudadId)} t="ciudad" />
        </div>
      </Tarjeta>

      <div className="mt-6">
        <div className="mb-2 font-semibold">Opera en</div>
        <div className="flex flex-wrap gap-2">
          {clinicas.map((c) => (
            <Link key={c.id} to={`/clinica/${c.id}`} className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-sm hover:border-brand-500">
              <Building2 size={14} /> {c.nombre}
            </Link>
          ))}
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-bold">Procedimientos de {medico.nombre.split(' ').slice(0, 2).join(' ')}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {opciones.map((d) => (
          <OfertaCard key={d.oferta.id} d={d} />
        ))}
      </div>
    </div>
  )
}

function Stat({ n, t }: { n: string; t: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-brand-700">{n}</div>
      <div className="text-xs text-slate-500">{t}</div>
    </div>
  )
}
