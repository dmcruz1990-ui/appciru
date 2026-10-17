import { EMPRESA, TERMINOS_VERSION } from '@plastinex/shared'
import type { ReactNode } from 'react'

export default function Terminos() {
  return (
    <article className="contenedor pt-48 pb-28">
      <div className="mx-auto max-w-3xl">
        <div className="rotulo">Documentos · versión {TERMINOS_VERSION}</div>
        <h1 className="display mt-6 text-4xl md:text-5xl">
          Términos, intermediación <em>y responsabilidad.</em>
        </h1>
        <p className="mt-8 border-l-2 border-arcilla pl-5 text-sm text-piedra">
          Borrador. Debe revisarlo un abogado (derecho sanitario, protección al consumidor y datos personales, en Colombia y en
          Estados Unidos) antes de recibir pacientes reales.
        </p>

        <div className="mt-16 space-y-14 text-[16px] leading-relaxed">
          <Seccion n="1" t="Quién es PLASTINEX">
            La plataforma PLASTINEX es de <b>{EMPRESA.razonSocial}</b>, con domicilio en {EMPRESA.direccion.join(', ')}. PLASTINEX
            es una plataforma internacional que diseña y explota la tecnología, capta y orienta a personas interesadas, facilita el
            contacto con clínicas y cirujanos, gestiona las solicitudes y presta servicios de marketing e intermediación comercial a
            las clínicas. PLASTINEX <b>no presta servicios de salud</b>, no es una institución prestadora, no emplea a los
            profesionales listados y no actúa en su nombre.
          </Seccion>
          <Seccion n="2" t="Tu relación es con la clínica">
            El paciente <b>contrata directamente con la clínica que elige</b>. Es la clínica quien le entrega el presupuesto y con
            quien firma los consentimientos informados y los demás documentos asistenciales. PLASTINEX no es parte de ese contrato.
          </Seccion>
          <Seccion n="3" t="Lo que decide y cobra la clínica">
            La clínica determina la indicación médica, acepta o rechaza al paciente, fija el precio de la cirugía, <b>cobra
            directamente</b> al paciente y responde por la atención sanitaria conforme a la ley aplicable. La valoración, los
            riesgos, las alternativas, el acto quirúrgico y el seguimiento postoperatorio son responsabilidad exclusiva del
            profesional y de la institución.
          </Seccion>
          <Seccion n="4" t="Cómo se remunera PLASTINEX">
            PLASTINEX <b>no cobra al paciente</b> por usar la plataforma ni recibe pagos por la cirugía. Factura a la clínica una
            comisión o tarifa comercial pactada en un contrato de intermediación independiente, que fija sus reglas de cálculo,
            facturación y pago.
          </Seccion>
          <Seccion n="5" t="Lo que PLASTINEX no hace">
            No diagnostica, no prescribe, no determina si una persona es candidata a un procedimiento y no garantiza resultados.
          </Seccion>
          <Seccion n="6" t="Precios">
            Los precios publicados son rangos orientativos informados por cada clínica, con la fecha de su última actualización. No
            constituyen una oferta ni una cotización. El valor final lo fija la clínica después de la valoración individual. Los
            servicios complementarios (alojamiento, traslados, enfermería) son prestados por terceros aliados y se cotizan por
            separado.
          </Seccion>
          <Seccion n="7" t="Solicitudes">
            Enviar una solicitud no constituye una reserva, una cita confirmada ni un contrato de servicios de salud. Un coordinador
            se pondrá en contacto para orientar y agendar la valoración con la clínica.
          </Seccion>
          <Seccion n="8" t="Confidencialidad">
            PLASTINEX trata como confidencial la información que el paciente comparte y solo la entrega a la clínica o al aliado que
            el paciente elija, en lo necesario para atender su solicitud. El paciente se compromete a usar la plataforma de buena fe,
            a no suministrar información falsa ni de terceros y a no divulgar información confidencial de otros usuarios o
            prestadores.
          </Seccion>
          <Seccion n="9" t="Limitación de responsabilidad">
            En su calidad de intermediario, PLASTINEX responde por el funcionamiento de la plataforma y por la veracidad de la
            verificación documental que declara haber realizado, pero no por los actos médicos, resultados, complicaciones,
            incumplimientos o cobros de las clínicas, los profesionales o los aliados de servicios complementarios.
          </Seccion>
          <Seccion n="10" t="Verificación de prestadores">
            PLASTINEX revisa la habilitación de las instituciones en el REPS y el registro de los profesionales en el ReTHUS y su
            sociedad científica. Mientras esa revisión no concluye, el perfil lo indica expresamente. Se recomienda al paciente
            verificar de forma independiente.
          </Seccion>
          <Seccion n="11" t="Aceptación">
            Al crear su cuenta, el paciente acepta de forma expresa estos términos, el acuerdo de confidencialidad, la condición de
            intermediario de PLASTINEX y la autorización de tratamiento de datos personales. La fecha y la versión aceptadas quedan
            registradas. Si estos documentos cambian, se pedirá aceptar la nueva versión antes de enviar otra solicitud.
          </Seccion>
          <Seccion n="12" t="Contacto">
            {EMPRESA.razonSocial} · {EMPRESA.direccion.join(', ')}.
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
