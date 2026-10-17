import { Link } from 'react-router-dom'
import { Revelar, Rotulo } from '../componentes/base'

const contacto = (import.meta.env.VITE_CONTACTO_EMAIL as string | undefined) ?? ''

const problemas = [
  ['Contactos que se pierden', 'Cada solicitud entra a un CRM con responsable, etapa y fecha. Nada queda olvidado en un chat.'],
  ['Respuesta tardía', 'Medimos el tiempo de primera respuesta y señalamos lo que lleva más tiempo sin atender.'],
  ['Agenda desorganizada', 'Seguimos cada valoración: agendada, asistida o reprogramada.'],
  ['Sin métricas', 'Informes de contactos, citas, asistencia y conversión por etapa.'],
]

/** Reparto de papeles entre PLASTINEX, el paciente y la clínica. */
const roles = [
  ['PLASTINEX LLC', 'Plataforma internacional', 'Diseña y explota la tecnología, capta pacientes, facilita el contacto, gestiona las solicitudes y presta servicios de marketing e intermediación comercial.'],
  ['Paciente y clínica', 'Contrato directo', 'El paciente contrata con la clínica que elige, recibe de ella el presupuesto y firma con ella los consentimientos y documentos asistenciales.'],
  ['La clínica', 'Prestación sanitaria y cobro', 'Determina la indicación médica, acepta o rechaza al paciente, fija el precio, cobra directamente y responde por la atención conforme a la ley.'],
  ['Clínica y PLASTINEX', 'Comisión comercial', 'PLASTINEX factura a la clínica su comisión o tarifa comercial, según un contrato de intermediación independiente con reglas de cálculo, facturación y pago.'],
]

const ruta = ['Captación', 'Registro', 'Atención inicial', 'Agenda', 'Valoración', 'Seguimiento', 'Analítica']

export default function ParaClinicas() {
  return (
    <>
      <section className="bg-espresso text-marfil">
        <div className="contenedor pt-52 pb-28">
          <div className="rotulo !text-marfil/50">Para clínicas y cirujanos</div>
          <h1 className="display mt-8 max-w-5xl text-4xl md:text-5xl">
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
                <span className="font-serif text-lg text-arcilla">{String(i + 1).padStart(2, '0')}</span>
                <div className="mt-2 font-serif text-2xl">{e}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="contenedor py-28">
        <Rotulo n="03">Cómo funciona el acuerdo</Rotulo>
        <h2 className="display mt-6 max-w-3xl text-4xl md:text-5xl">
          Cada parte, <em>en su lugar.</em>
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {roles.map(([t, s, d], i) => (
            <Revelar key={t} retraso={i * 0.06} className="border-t border-espresso pt-8">
              <span className="font-serif text-lg text-arcilla">{String(i + 1).padStart(2, '0')}</span>
              <div className="etiqueta mt-4">{t}</div>
              <h3 className="mt-2 font-serif text-3xl">{s}</h3>
              <p className="mt-5 text-sm leading-relaxed text-piedra">{d}</p>
            </Revelar>
          ))}
        </div>
        <p className="mt-14 max-w-2xl text-sm text-piedra">
          PLASTINEX no cobra al paciente ni recibe el pago de la cirugía. No prometemos «más cirugías garantizadas»: la promesa es
          mejor gestión, trazabilidad y seguimiento de oportunidades.
        </p>
      </section>
    </>
  )
}
