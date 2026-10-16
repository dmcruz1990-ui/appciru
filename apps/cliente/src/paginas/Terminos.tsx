import { TERMINOS_VERSION } from '@plastinex/shared'
import type { ReactNode } from 'react'

export default function Terminos() {
  return (
    <article className="contenedor pt-36 pb-28">
      <div className="mx-auto max-w-3xl">
        <div className="rotulo">Documentos · versión {TERMINOS_VERSION}</div>
        <h1 className="display mt-6 text-6xl md:text-7xl">
          Términos, intermediación <em>y responsabilidad.</em>
        </h1>
        <p className="mt-8 border-l-2 border-arcilla pl-5 text-sm text-piedra">
          Borrador para el prototipo. Debe revisarlo un abogado (derecho sanitario, protección al consumidor y datos personales) antes
          de recibir pacientes reales.
        </p>

        <div className="mt-16 space-y-14 text-[16px] leading-relaxed">
          <Seccion n="1" t="Qué es PLASTINEX">
            PLASTINEX es una plataforma tecnológica que <b>intermedia</b> entre personas interesadas en procedimientos de cirugía
            plástica y prestadores de servicios de salud (instituciones y profesionales) habilitados en Colombia. PLASTINEX{' '}
            <b>no presta servicios de salud</b>, no es una institución prestadora, no emplea a los profesionales listados y no actúa
            en su nombre.
          </Seccion>
          <Seccion n="2" t="Lo que PLASTINEX no hace">
            No diagnostica, no prescribe, no determina si una persona es candidata a un procedimiento y no garantiza resultados. La
            valoración, la indicación, el consentimiento informado, los riesgos, las alternativas, el acto quirúrgico y el
            seguimiento postoperatorio son <b>responsabilidad exclusiva</b> del profesional y de la institución que el paciente elija.
          </Seccion>
          <Seccion n="3" t="Precios">
            Los precios publicados son rangos orientativos informados por cada prestador, con la fecha de su última actualización. No
            constituyen una oferta ni una cotización. El valor final lo define el prestador después de la valoración individual. Los
            servicios complementarios (alojamiento, traslados, enfermería) son prestados por terceros aliados y se cotizan por
            separado.
          </Seccion>
          <Seccion n="4" t="Solicitudes">
            Enviar una solicitud no constituye una reserva, una cita confirmada ni un contrato de servicios de salud. Un coordinador
            se pondrá en contacto para orientar y agendar la valoración con el prestador.
          </Seccion>
          <Seccion n="5" t="Confidencialidad">
            PLASTINEX trata como confidencial la información que el paciente comparte y solo la entrega a la institución o al aliado
            que el paciente elija, en lo necesario para atender su solicitud. El paciente se compromete a usar la plataforma de buena
            fe, a no suministrar información falsa ni de terceros y a no divulgar información confidencial de otros usuarios o
            prestadores.
          </Seccion>
          <Seccion n="6" t="Limitación de responsabilidad">
            En su calidad de intermediario, PLASTINEX responde por el funcionamiento de la plataforma y por la veracidad de la
            verificación documental que declara haber realizado, pero no por los actos médicos, resultados, complicaciones,
            incumplimientos o cobros de los prestadores o de los aliados de servicios complementarios.
          </Seccion>
          <Seccion n="7" t="Verificación de prestadores">
            PLASTINEX revisa la habilitación de las instituciones en el REPS y el registro de los profesionales en el ReTHUS y su
            sociedad científica. Mientras esa revisión no concluye, el perfil lo indica expresamente. Se recomienda al paciente
            verificar de forma independiente.
          </Seccion>
          <Seccion n="8" t="Aceptación">
            Al crear su cuenta, el paciente acepta de forma expresa estos términos, el acuerdo de confidencialidad, la condición de
            intermediario de PLASTINEX y la autorización de tratamiento de datos personales. La fecha y la versión aceptadas quedan
            registradas.
          </Seccion>
        </div>
      </div>
    </article>
  )
}

function Seccion({ n, t, children }: { n: string; t: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-linea pt-8 md:grid-cols-[60px_1fr]">
      <span className="font-serif text-2xl text-arcilla italic">{n}</span>
      <div>
        <h2 className="font-serif text-3xl">{t}</h2>
        <p className="mt-4 text-piedra">{children}</p>
      </div>
    </section>
  )
}
