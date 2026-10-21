import { Link } from 'react-router-dom'
import { Revelar, Rotulo } from '../componentes/base'
import Planes, { usePlanes } from '../componentes/Planes'
import { useIdioma } from '../idioma'
import { useSeo } from '../seo'

const contacto = (import.meta.env.VITE_CONTACTO_EMAIL as string | undefined) ?? ''

/** Cada texto va en español y en inglés: [es, en]. */
type Par = [string, string]

const problemas: [Par, Par][] = [
  [
    ['Contactos que se pierden', 'Lost leads'],
    [
      'Cada solicitud entra a un CRM con responsable, etapa y fecha. Nada queda olvidado en un chat.',
      'Every request enters a CRM with an owner, a stage and a date. Nothing gets lost in a chat.',
    ],
  ],
  [
    ['Respuesta tardía', 'Slow response'],
    [
      'Medimos el tiempo de primera respuesta y señalamos lo que lleva más tiempo sin atender.',
      'We measure first-response time and flag whatever has gone unanswered the longest.',
    ],
  ],
  [
    ['Agenda desorganizada', 'Disorganized scheduling'],
    ['Seguimos cada valoración: agendada, asistida o reprogramada.', 'We track every consultation: scheduled, attended or rescheduled.'],
  ],
  [
    ['Sin métricas', 'No metrics'],
    ['Informes de contactos, citas, asistencia y conversión por etapa.', 'Reports on leads, appointments, attendance and conversion by stage.'],
  ],
]

/** Reparto de papeles entre PLASTINEX, el paciente y la clínica. */
const roles: [Par, Par, Par][] = [
  [
    ['PLASTINEX LLC', 'PLASTINEX LLC'],
    ['Plataforma internacional', 'International platform'],
    [
      'Diseña y explota la tecnología, capta pacientes, facilita el contacto, gestiona las solicitudes y presta servicios de marketing e intermediación comercial.',
      'Designs and operates the technology, attracts patients, facilitates contact, manages requests and provides marketing and commercial intermediation services.',
    ],
  ],
  [
    ['Paciente y clínica', 'Patient and clinic'],
    ['Contrato directo', 'Direct contract'],
    [
      'El paciente contrata con la clínica que elige, recibe de ella el presupuesto y firma con ella los consentimientos y documentos asistenciales.',
      'The patient contracts with the clinic of their choice, receives the quote from it and signs the consent forms and care documents with it.',
    ],
  ],
  [
    ['La clínica', 'The clinic'],
    ['Prestación sanitaria y cobro', 'Healthcare and billing'],
    [
      'Determina la indicación médica, acepta o rechaza al paciente, fija el precio, cobra directamente y responde por la atención conforme a la ley.',
      'Determines the medical indication, accepts or declines the patient, sets the price, charges directly and is responsible for the care provided under the law.',
    ],
  ],
  [
    ['Clínica y PLASTINEX', 'Clinic and PLASTINEX'],
    ['Comisión comercial', 'Commercial fee'],
    [
      'PLASTINEX factura a la clínica su comisión o tarifa comercial, según un contrato de intermediación independiente con reglas de cálculo, facturación y pago.',
      'PLASTINEX invoices the clinic for its commission or commercial fee under a separate intermediation agreement that sets the rules for calculation, invoicing and payment.',
    ],
  ],
]

const ruta: Par[] = [
  ['Captación', 'Lead generation'],
  ['Registro', 'Registration'],
  ['Atención inicial', 'First contact'],
  ['Agenda', 'Scheduling'],
  ['Valoración', 'Consultation'],
  ['Seguimiento', 'Follow-up'],
  ['Analítica', 'Analytics'],
]

export default function ParaClinicas() {
  const { tx } = useIdioma()
  useSeo({ titulo: tx('Para clínicas y cirujanos plásticos', 'For plastic surgery clinics and surgeons'), descripcion: tx('Regístrate en PLASTINEX y llega más lejos con tus leads: perfil verificado, pacientes de todo el mundo y CRM para gestionar tus valoraciones.', 'Join PLASTINEX and take your leads further: verified profile, patients from around the world and a CRM to manage your consultations.') })
  const planes = usePlanes()
  const t = ([es, en]: Par) => tx(es, en)

  return (
    <>
      <section className="bg-espresso text-marfil">
        <div className="contenedor pt-52 pb-28">
          <div className="rotulo !text-marfil/50">{tx('Para clínicas y cirujanos', 'For clinics and surgeons')}</div>
          <h1 className="display mt-8 max-w-5xl text-4xl md:text-5xl">
            {tx(
              <>
                Organiza y mide tu gestión comercial, <em>sin tocar el criterio médico.</em>
              </>,
              <>
                Organize and measure your patient pipeline, <em>without touching medical judgment.</em>
              </>,
            )}
          </h1>
          <p className="mt-10 max-w-xl text-[17px] leading-relaxed text-marfil/70">
            {tx(
              'PLASTINEX ayuda a clínicas de cirugía plástica, cirujanos e instituciones habilitadas a captar oportunidades, gestionar contactos, organizar valoraciones y medir el proceso. La indicación, los riesgos y el tratamiento siguen en manos del profesional.',
              'PLASTINEX helps plastic surgery clinics, surgeons and licensed institutions attract opportunities, manage leads, organize consultations and measure the process. The indication, the risks and the treatment remain in the hands of the professional.',
            )}
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link to="/para-clinicas/registro" className="btn-claro">
              {tx('Regístrate', 'Sign up')}
            </Link>
            {contacto ? (
              <a href={`mailto:${contacto}?subject=${tx('Quiero conocer PLASTINEX', 'I would like to learn about PLASTINEX')}`} className="enlace text-sm text-marfil/80">
                {tx('Agendar una conversación', 'Schedule a conversation')}
              </a>
            ) : (
              <Link to="/explorar" className="enlace text-sm text-marfil/80">
                {tx('Ver cómo se ve un perfil', 'See what a profile looks like')}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="contenedor py-28">
        <Rotulo n="01">{tx('El problema que resolvemos', 'The problem we solve')}</Rotulo>
        <div className="mt-14 grid border-t border-linea md:grid-cols-4">
          {problemas.map(([titulo, d], i) => (
            <Revelar key={titulo[0]} retraso={i * 0.06} className="border-b border-linea py-10 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0">
              <h3 className="font-serif text-3xl">{t(titulo)}</h3>
              <p className="mt-4 text-sm leading-relaxed text-piedra">{t(d)}</p>
            </Revelar>
          ))}
        </div>
      </section>

      <section className="bg-papel py-28">
        <div className="contenedor">
          <Rotulo n="02">{tx('Ruta comercial', 'Patient pipeline')}</Rotulo>
          <ol className="mt-14 grid grid-cols-2 gap-y-10 sm:grid-cols-4 lg:grid-cols-7">
            {ruta.map((e, i) => (
              <li key={e[0]} className="border-t border-espresso pt-5 pr-4">
                <span className="font-serif text-lg text-arcilla">{String(i + 1).padStart(2, '0')}</span>
                <div className="mt-2 font-serif text-2xl">{t(e)}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="contenedor py-28">
        <Rotulo n="03">{tx('Cómo funciona el acuerdo', 'How the arrangement works')}</Rotulo>
        <h2 className="display mt-6 max-w-3xl text-4xl md:text-5xl">
          {tx(
            <>
              Cada parte, <em>en su lugar.</em>
            </>,
            <>
              Every party, <em>in its place.</em>
            </>,
          )}
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {roles.map(([parte, s, d], i) => (
            <Revelar key={parte[0]} retraso={i * 0.06} className="border-t border-espresso pt-8">
              <span className="font-serif text-lg text-arcilla">{String(i + 1).padStart(2, '0')}</span>
              <div className="etiqueta mt-4">{t(parte)}</div>
              <h3 className="mt-2 font-serif text-3xl">{t(s)}</h3>
              <p className="mt-5 text-sm leading-relaxed text-piedra">{t(d)}</p>
            </Revelar>
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-sm text-piedra">
          {tx(
            'PLASTINEX no cobra al paciente ni recibe el pago de la cirugía. No prometemos «más cirugías garantizadas»: la promesa es mejor gestión, trazabilidad y seguimiento de oportunidades.',
            'PLASTINEX does not charge the patient or receive payment for the surgery. We do not promise “guaranteed additional surgeries”: our promise is better management, traceability and follow-up of opportunities.',
          )}
        </p>
      </section>

      {planes && planes.length > 0 && (
        <section className="bg-papel py-28">
          <div className="contenedor">
            <Rotulo n="04">{tx('Planes', 'Plans')}</Rotulo>
            <h2 className="display mt-6 max-w-3xl text-4xl md:text-5xl">
              {tx(
                <>
                  Pagas cuando <em>te aprobamos.</em>
                </>,
                <>
                  You pay once <em>we approve you.</em>
                </>,
              )}
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-piedra">
              {tx(
                'Primero verificamos tu registro profesional y la habilitación de tu clínica. Con la aprobación eliges tu plan, pagas en línea y publicamos tu perfil para que los pacientes te encuentren.',
                'First we verify your professional license and your clinic’s accreditation. Once approved, you choose your plan, pay online and we publish your profile so patients can find you.',
              )}
            </p>
            <div className="mt-14">
              <Planes planes={planes} />
            </div>
          </div>
        </section>
      )}

      <section className="bg-espresso text-marfil">
        <div className="contenedor flex flex-wrap items-end justify-between gap-10 py-24">
          <div>
            <div className="rotulo !text-marfil/50">05 · {tx('Registro', 'Registration')}</div>
            <h2 className="display mt-6 max-w-2xl text-4xl md:text-5xl">
              {tx(
                <>
                  Regístrate y llega más lejos <em>con tus leads.</em>
                </>,
                <>
                  Sign up and take your leads <em>further.</em>
                </>,
              )}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-marfil/70">
              {tx(
                'Cuenta, registro profesional, clínica y procedimientos en un solo formulario. Lo verificamos antes de publicarlo y después atiendes tus solicitudes desde tu panel.',
                'Account, professional license, clinic and procedures in one form. We verify it before publishing, and then you handle your requests from your dashboard.',
              )}
            </p>
          </div>
          <Link to="/para-clinicas/registro" className="btn-claro">
            {tx('Regístrate', 'Sign up')}
          </Link>
        </div>
      </section>
    </>
  )
}
