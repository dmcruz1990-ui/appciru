import { BarChart3, CalendarCheck, Inbox, MessagesSquare } from 'lucide-react'

const contacto = (import.meta.env.VITE_CONTACTO_EMAIL as string | undefined) ?? ''

const problemas = [
  { i: Inbox, t: 'Contactos que se pierden', d: 'Cada solicitud entra a un CRM con responsable, etapa y fecha. Nada queda en un chat olvidado.' },
  { i: MessagesSquare, t: 'Respuesta tardía', d: 'Medimos el tiempo de primera respuesta y alertamos lo que lleva más tiempo sin atender.' },
  { i: CalendarCheck, t: 'Agenda desorganizada', d: 'Seguimos cada valoración: agendada, asistida o reprogramada.' },
  { i: BarChart3, t: 'Sin métricas', d: 'Informes de contactos, citas, asistencia y conversión por etapa.' },
]

// Valores ilustrativos del documento de modelo de negocio; no son tarifas definitivas.
const planes = [
  { t: 'Instalación', p: '$1,5 – 3 M', u: 'pago único', d: 'Configuración inicial, CRM, canales y protocolos.' },
  { t: 'Suscripción tecnológica', p: '$1 – 2 M', u: 'COP / mes', d: 'CRM, automatización, seguimiento e informes.' },
  { t: 'Servicio administrado', p: '$2 – 4 M', u: 'COP / mes', d: 'Operación comercial y/o gestión de campañas. La pauta se paga aparte.' },
]

export default function ParaClinicas() {
  return (
    <>
      <section className="bg-tinta text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="kicker">— Para clínicas y profesionales</div>
          <h1 className="titulo mt-4 max-w-3xl text-5xl leading-tight">
            Organiza y mide tu gestión comercial, <em>sin tocar el criterio médico.</em>
          </h1>
          <p className="mt-5 max-w-2xl text-white/70">
            PLASTINEX ayuda a clínicas de cirugía plástica, cirujanos e instituciones habilitadas a captar oportunidades,
            gestionar contactos, organizar valoraciones y medir el proceso. La indicación, los riesgos y el tratamiento siguen
            en manos del profesional.
          </p>
          {contacto && (
            <a href={`mailto:${contacto}?subject=Quiero conocer PLASTINEX`} className="btn-oro mt-8">
              Agendar una conversación →
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="titulo text-3xl">
          El problema que <em>resolvemos</em>
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          {problemas.map((p) => (
            <div key={p.t} className="border border-arena bg-white p-6">
              <p.i className="text-oro" />
              <div className="mt-3 font-medium">{p.t}</div>
              <p className="mt-1 text-sm text-piedra">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-arena">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="titulo text-3xl">
            Ruta <em>comercial</em>
          </h2>
          <ol className="mt-8 grid gap-px bg-tinta/10 text-sm md:grid-cols-7">
            {['Captación', 'Registro', 'Atención inicial', 'Agenda', 'Valoración médica', 'Seguimiento', 'Analítica'].map((e, i) => (
              <li key={e} className="bg-arena p-4">
                <span className="titulo text-xl text-oro-osc">{i + 1}</span>
                <div className="font-medium">{e}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="titulo text-3xl">
          Planes <em>(valores de referencia)</em>
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {planes.map((p) => (
            <div key={p.t} className="border border-arena bg-white p-6">
              <div className="etiqueta">{p.t}</div>
              <div className="titulo text-3xl">{p.p}</div>
              <div className="text-xs text-piedra">{p.u}</div>
              <p className="mt-3 text-sm">{p.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-piedra">
          Valores ilustrativos, en validación con clínicas piloto. No prometemos «más cirugías garantizadas»: la promesa es
          mejor gestión, trazabilidad y seguimiento de oportunidades.
        </p>
      </section>
    </>
  )
}
