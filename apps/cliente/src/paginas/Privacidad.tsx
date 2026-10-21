import { EMPRESA } from '@plastinex/shared'
import { useIdioma } from '../idioma'
import { useSeo } from '../seo'

const direccion = EMPRESA.direccion.join(', ')
const direccionEn = [...EMPRESA.direccion.slice(0, -1), 'United States'].join(', ')

/** Cada sección: [título, texto] en español y en inglés. */
const secciones: { es: [string, string]; en: [string, string] }[] = [
  {
    es: ['Responsable del tratamiento', `${EMPRESA.razonSocial}, con domicilio en ${direccion}.`],
    en: ['Data controller', `${EMPRESA.razonSocial}, domiciled at ${direccionEn}.`],
  },
  {
    es: [
      'Qué datos pedimos',
      'Correo y contraseña para tu cuenta; nombre, teléfono y país; el procedimiento o la institución que te interesa, una fecha tentativa y, si los eliges, los servicios complementarios. No pedimos información clínica: la historia médica la maneja el profesional en la valoración.',
    ],
    en: [
      'What data we request',
      'Email and password for your account; name, phone number and country; the procedure or institution you are interested in, a tentative date and, if you choose them, additional services. We do not request medical information: your medical history is handled by the professional during the consultation.',
    ],
  },
  {
    es: [
      'Para qué los usamos',
      'Para contactarte, coordinar la valoración con la institución que elegiste, cotizar los servicios complementarios y hacer seguimiento administrativo de tu solicitud. No vendemos tus datos.',
    ],
    en: [
      'How we use it',
      'To contact you, coordinate the consultation with the institution you chose, obtain quotes for additional services and provide administrative follow-up on your request. We do not sell your data.',
    ],
  },
  {
    es: [
      'Con quién los compartimos',
      'Con la institución o el profesional seleccionado y, si lo pediste, con el aliado de alojamiento o servicios, solo en lo necesario para atender tu solicitud.',
    ],
    en: [
      'Who we share it with',
      'With the selected institution or professional and, if you requested it, with the lodging or service partner, only to the extent necessary to handle your request.',
    ],
  },
  {
    es: [
      'Transferencia internacional',
      'PLASTINEX es una sociedad con domicilio en Estados Unidos y tus datos se guardan en servidores de proveedores de nube que pueden estar fuera de Colombia. Al aceptar este aviso autorizas esa transferencia, con las mismas medidas de seguridad y los mismos derechos.',
    ],
    en: [
      'International transfer',
      'PLASTINEX is a company domiciled in the United States, and your data is stored on servers of cloud providers that may be located outside Colombia. By accepting this notice, you authorize that transfer, with the same security measures and the same rights.',
    ],
  },
  {
    es: [
      'Tus derechos',
      `Conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar la autorización. Para ejercerlos escribe a ${EMPRESA.razonSocial}, ${direccion}.`,
    ],
    en: [
      'Your rights',
      `In accordance with Colombian Law 1581 of 2012 and its implementing decrees, you may access, update, correct and delete your data, and revoke your authorization. To exercise these rights, write to ${EMPRESA.razonSocial}, ${direccionEn}.`,
    ],
  },
  {
    es: [
      'Seguridad',
      'Tus solicitudes se guardan en una base de datos con acceso restringido por roles. Solo el equipo de coordinación y la institución correspondiente pueden verlas. Tú las consultas desde tu cuenta.',
    ],
    en: [
      'Security',
      'Your requests are stored in a database with role-based access restrictions. Only the coordination team and the relevant institution can see them. You can view them from your account.',
    ],
  },
]

export default function Privacidad() {
  const { tx, idioma } = useIdioma()
  useSeo({ titulo: tx('Aviso de privacidad', 'Privacy notice') })
  return (
    <article className="contenedor pt-48 pb-28">
      <div className="mx-auto max-w-3xl">
        <div className="rotulo">{tx('Privacidad', 'Privacy')}</div>
        <h1 className="display mt-6 text-4xl md:text-5xl">
          {tx(
            <>
              Aviso de privacidad <em>(borrador)</em>
            </>,
            <>
              Privacy notice <em>(draft)</em>
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
            'Texto para el prototipo. Debe revisarlo un abogado en protección de datos antes de recibir solicitudes reales.',
            'Prototype text. It must be reviewed by a data protection attorney before real requests are received.',
          )}
        </p>
        <div className="mt-16 space-y-12">
          {secciones.map((s, i) => {
            const [t, d] = tx(s.es, s.en)
            return (
              <section key={s.es[0]} className="grid gap-4 border-t border-linea pt-8 md:grid-cols-[60px_1fr]">
                <span className="font-serif text-2xl text-arcilla">{i + 1}</span>
                <div>
                  <h2 className="font-serif text-3xl">{t}</h2>
                  <p className="mt-4 leading-relaxed text-piedra">{d}</p>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </article>
  )
}
