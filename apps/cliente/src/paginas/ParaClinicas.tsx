import { Link } from 'react-router-dom'
import { Revelar, Rotulo } from '../componentes/base'

const contacto = (import.meta.env.VITE_CONTACTO_EMAIL as string | undefined) ?? ''

const problemas = [
  ['Contactos que se pierden', 'Cada solicitud entra a un CRM con responsable, etapa y fecha. Nada queda olvidado en un chat.'],
  ['Respuesta tardía', 'Medimos el tiempo de primera respuesta y señalamos lo que lleva más tiempo sin atender.'],
  ['Agenda desorganizada', 'Seguimos cada valoración: agendada, asistida o reprogramada.'],
  ['Sin métricas', 'Informes de contactos, citas, asistencia y conversión por etapa.'],
]

// Valores ilustrativos del documento de modelo de negocio; no son tarifas definitivas.
const planes = [
  ['Instalación', '$1,5 – 3 M', 'pago único', 'Configuración inicial, CRM, canales y protocolos.'],
  ['Suscripción tecnológica', '$1 – 2 M', 'COP al mes', 'CRM, automatización, seguimiento e informes.'],
  ['Servicio administrado', '$2 – 4 M', 'COP al mes', 'Operación comercial y gestión de campañas. La pauta se paga aparte.'],
]

const ruta = ['Captación', 'Registro', 'Atención inicial', 'Agenda', 'Valoración', 'Seguimiento', 'Analítica']

export default function ParaClinicas() {
  return (
    <>
      <section className="bg-espresso text-marfil">
        <div className="contenedor pt-44 pb-28">
          <div className="rotulo !text-marfil/50">Para clínicas y cirujanos</div>
          <h1 className="display mt-8 max-w-5xl text-6xl md:text-8xl">
            Organiza y mide tu gestión comercial, <em>sin tocar el criterio médico.</em>
          </h1>
          <p className="mt-10 max-w-xl text-[17px] leading-relaxed text-marfil/70">
            PLASTINEX ayuda a clínicas de cirugía plástica, cirujanos e instituciones habilitadas a captar oportunidades, gestionar
            contactos, organizar valoraciones y medir el proceso. La indicación, los riesgos y el tratamiento siguen en manos del
            profesional.
          </p>
          {contacto ? (
            <a href={`mailto:${contacto}?subject=Quiero conocer PLASTINEX`} className="btn-claro mt-12">
              Agendar una conversación
            </a>
          ) : (
            <Link to="/explorar" className="btn-claro mt-12">
              Ver cómo se ve un perfil
            </Link>
          )}
        </div>
      </section>

      <section className="contenedor py-28">
        <Rotulo n="01">El problema que resolvemos</Rotulo>
        <div className="mt-14 grid border-t border-linea md:grid-cols-4">
          {problemas.map(([t, d], i) => (
            <Revelar key={t} retraso={i * 0.06} className="border-b border-linea py-10 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0">
              <h3 className="font-serif text-3xl">{t}</h3>
              <p className="mt-4 text-sm leading-relaxed text-piedra">{d}</p>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="bg-papel py-28">
        <div className="contenedor">
          <Rotulo n="02">Ruta comercial</Rotulo>
          <ol className="mt-14 grid grid-cols-2 gap-y-10 sm:grid-cols-4 lg:grid-cols-7">
            {ruta.map((e, i) => (
              <li key={e} className="border-t border-espresso pt-5 pr-4">
                <span className="font-serif text-lg text-arcilla italic">{String(i + 1).padStart(2, '0')}</span>
                <div className="mt-2 font-serif text-2xl">{e}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="contenedor py-28">
        <Rotulo n="03">Planes · valores de referencia</Rotulo>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {planes.map(([t, p, u, d], i) => (
            <Revelar key={t} retraso={i * 0.06} className="border-t border-espresso pt-8">
              <div className="etiqueta">{t}</div>
              <div className="display mt-4 text-6xl">{p}</div>
              <div className="mt-1 text-sm text-piedra">{u}</div>
              <p className="mt-6 text-sm leading-relaxed text-piedra">{d}</p>
            </Revelar>
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-sm text-piedra">
          Valores ilustrativos en validación con clínicas piloto. No prometemos «más cirugías garantizadas»: la promesa es mejor
          gestión, trazabilidad y seguimiento de oportunidades.
        </p>
      </section>
    </>
  )
}
