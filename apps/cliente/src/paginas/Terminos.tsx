import { EMPRESA, TERMINOS_VERSION } from '@plastinex/shared'
import type { ReactNode } from 'react'
import { useIdioma } from '../idioma'
import { useSeo } from '../seo'

export default function Terminos() {
  const { tx, idioma } = useIdioma()
  useSeo({ titulo: tx('Términos e intermediación', 'Terms and intermediation') })
  const direccion = tx(EMPRESA.direccion.join(', '), [...EMPRESA.direccion.slice(0, -1), 'United States'].join(', '))

  return (
    <article className="contenedor pt-48 pb-28">
      <div className="mx-auto max-w-3xl">
        <div className="rotulo">
          {tx('Documentos · versión', 'Documents · version')} {TERMINOS_VERSION}
        </div>
        <h1 className="display mt-6 text-4xl md:text-5xl">
          {tx(
            <>
              Términos, intermediación <em>y responsabilidad.</em>
            </>,
            <>
              Terms, intermediation <em>and liability.</em>
            </>,
          )}
        </h1>
        {idioma === 'en' && (
          <p className="mt-8 border-l-2 border-espresso pl-5 text-sm text-piedra">
            This English version is provided for convenience. In case of any discrepancy, the Spanish version prevails.
          </p>
        )}
        <p className="mt-8 border-l-2 border-arcilla pl-5 text-sm text-piedra">
          {tx(
            'Borrador. Debe revisarlo un abogado (derecho sanitario, protección al consumidor y datos personales, en Colombia y en Estados Unidos) antes de recibir pacientes reales.',
            'Draft. It must be reviewed by an attorney (healthcare law, consumer protection and personal data, in Colombia and the United States) before real patients are received.',
          )}
        </p>

        <div className="mt-16 space-y-14 text-[16px] leading-relaxed">
          <Seccion n="1" t={tx('Quién es PLASTINEX', 'Who PLASTINEX is')}>
            {tx(
              <>
                La plataforma PLASTINEX es de <b>{EMPRESA.razonSocial}</b>, con domicilio en {direccion}. PLASTINEX es una
                plataforma internacional que diseña y explota la tecnología, capta y orienta a personas interesadas, facilita el
                contacto con clínicas y cirujanos, gestiona las solicitudes y presta servicios de marketing e intermediación
                comercial a las clínicas. PLASTINEX <b>no presta servicios de salud</b>, no es una institución prestadora, no emplea
                a los profesionales listados y no actúa en su nombre.
              </>,
              <>
                The PLASTINEX platform is owned by <b>{EMPRESA.razonSocial}</b>, domiciled at {direccion}. PLASTINEX is an
                international platform that designs and operates the technology, attracts and guides interested individuals,
                facilitates contact with clinics and surgeons, manages requests and provides marketing and commercial intermediation
                services to clinics. PLASTINEX <b>does not provide healthcare services</b>, is not a healthcare provider institution,
                does not employ the listed professionals and does not act on their behalf.
              </>,
            )}
          </Seccion>
          <Seccion n="2" t={tx('Tu relación es con la clínica', 'Your relationship is with the clinic')}>
            {tx(
              <>
                El paciente <b>contrata directamente con la clínica que elige</b>. Es la clínica quien le entrega el presupuesto y
                con quien firma los consentimientos informados y los demás documentos asistenciales. PLASTINEX no es parte de ese
                contrato.
              </>,
              <>
                The patient <b>contracts directly with the clinic of their choice</b>. It is the clinic that provides the patient
                with the quote and with which the patient signs the informed consent forms and other care documents. PLASTINEX is
                not a party to that contract.
              </>,
            )}
          </Seccion>
          <Seccion n="3" t={tx('Lo que decide y cobra la clínica', 'What the clinic decides and charges')}>
            {tx(
              <>
                La clínica determina la indicación médica, acepta o rechaza al paciente, fija el precio de la cirugía, <b>cobra
                directamente</b> al paciente y responde por la atención sanitaria conforme a la ley aplicable. La valoración, los
                riesgos, las alternativas, el acto quirúrgico y el seguimiento postoperatorio son responsabilidad exclusiva del
                profesional y de la institución.
              </>,
              <>
                The clinic determines the medical indication, accepts or declines the patient, sets the price of the surgery,{' '}
                <b>charges the patient directly</b> and is responsible for the healthcare provided under applicable law. The
                consultation, risks, alternatives, surgical procedure and postoperative follow-up are the sole responsibility of the
                professional and the institution.
              </>,
            )}
          </Seccion>
          <Seccion n="4" t={tx('Cómo se remunera PLASTINEX', 'How PLASTINEX is compensated')}>
            {tx(
              <>
                PLASTINEX <b>no cobra al paciente</b> por usar la plataforma ni recibe pagos por la cirugía. Factura a la clínica
                una comisión o tarifa comercial pactada en un contrato de intermediación independiente, que fija sus reglas de
                cálculo, facturación y pago.
              </>,
              <>
                PLASTINEX <b>does not charge the patient</b> for using the platform and does not receive payments for the surgery.
                It invoices the clinic for a commission or commercial fee agreed in a separate intermediation agreement, which sets
                the rules for its calculation, invoicing and payment.
              </>,
            )}
          </Seccion>
          <Seccion n="5" t={tx('Lo que PLASTINEX no hace', 'What PLASTINEX does not do')}>
            {tx(
              'No diagnostica, no prescribe, no determina si una persona es candidata a un procedimiento y no garantiza resultados.',
              'It does not diagnose, does not prescribe, does not determine whether a person is a candidate for a procedure and does not guarantee results.',
            )}
          </Seccion>
          <Seccion n="6" t={tx('Precios', 'Prices')}>
            {tx(
              'Los precios publicados son rangos orientativos informados por cada clínica, con la fecha de su última actualización. No constituyen una oferta ni una cotización. El valor final lo fija la clínica después de la valoración individual. Los servicios complementarios (alojamiento, traslados, enfermería) son prestados por terceros aliados y se cotizan por separado.',
              'Published prices are indicative ranges reported by each clinic, together with the date of their last update. They do not constitute an offer or a quote. The final price is set by the clinic after the individual consultation. Additional services (lodging, transfers, nursing care) are provided by third-party partners and are quoted separately.',
            )}
          </Seccion>
          <Seccion n="7" t={tx('Solicitudes', 'Requests')}>
            {tx(
              'Enviar una solicitud no constituye una reserva, una cita confirmada ni un contrato de servicios de salud. Un coordinador se pondrá en contacto para orientar y agendar la valoración con la clínica.',
              'Submitting a request does not constitute a booking, a confirmed appointment or a contract for healthcare services. A coordinator will get in touch to provide guidance and schedule the consultation with the clinic.',
            )}
          </Seccion>
          <Seccion n="8" t={tx('Confidencialidad', 'Confidentiality')}>
            {tx(
              'PLASTINEX trata como confidencial la información que el paciente comparte y solo la entrega a la clínica o al aliado que el paciente elija, en lo necesario para atender su solicitud. El paciente se compromete a usar la plataforma de buena fe, a no suministrar información falsa ni de terceros y a no divulgar información confidencial de otros usuarios o prestadores.',
              'PLASTINEX treats the information the patient shares as confidential and provides it only to the clinic or partner the patient chooses, to the extent necessary to handle the request. The patient agrees to use the platform in good faith, not to provide false or third-party information, and not to disclose confidential information of other users or providers.',
            )}
          </Seccion>
          <Seccion n="9" t={tx('Limitación de responsabilidad', 'Limitation of liability')}>
            {tx(
              'En su calidad de intermediario, PLASTINEX responde por el funcionamiento de la plataforma y por la veracidad de la verificación documental que declara haber realizado, pero no por los actos médicos, resultados, complicaciones, incumplimientos o cobros de las clínicas, los profesionales o los aliados de servicios complementarios.',
              'In its capacity as an intermediary, PLASTINEX is responsible for the operation of the platform and for the accuracy of the document verification it states it has performed, but not for the medical acts, results, complications, breaches or charges of the clinics, the professionals or the additional service partners.',
            )}
          </Seccion>
          <Seccion n="10" t={tx('Verificación de prestadores', 'Provider verification')}>
            {tx(
              'PLASTINEX revisa la habilitación de las instituciones en el REPS y el registro de los profesionales en el ReTHUS y su sociedad científica. Mientras esa revisión no concluye, el perfil lo indica expresamente. Se recomienda al paciente verificar de forma independiente.',
              'PLASTINEX reviews the licensing of institutions in the REPS (Colombian registry of healthcare providers) and the registration of professionals in the ReTHUS (Colombian registry of healthcare personnel) and with their scientific society. Until that review is complete, the profile expressly says so. Patients are advised to verify independently.',
            )}
          </Seccion>
          <Seccion n="11" t={tx('Aceptación', 'Acceptance')}>
            {tx(
              'Al crear su cuenta, el paciente acepta de forma expresa estos términos, el acuerdo de confidencialidad, la condición de intermediario de PLASTINEX y la autorización de tratamiento de datos personales. La fecha y la versión aceptadas quedan registradas. Si estos documentos cambian, se pedirá aceptar la nueva versión antes de enviar otra solicitud.',
              'By creating an account, the patient expressly accepts these terms, the confidentiality agreement, PLASTINEX’s status as an intermediary and the authorization for the processing of personal data. The date and version accepted are recorded. If these documents change, the patient will be asked to accept the new version before submitting another request.',
            )}
          </Seccion>
          <Seccion n="12" t={tx('Contacto', 'Contact')}>
            {EMPRESA.razonSocial} · {direccion}.
          </Seccion>
        </div>
      </div>
    </article>
  )
}

function Seccion({ n, t, children }: { n: string; t: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-linea pt-8 md:grid-cols-[60px_1fr]">
      <span className="font-serif text-2xl text-arcilla">{n}</span>
      <div>
        <h2 className="font-serif text-3xl">{t}</h2>
        <p className="mt-4 text-piedra">{children}</p>
      </div>
    </section>
  )
}
