const secciones: [string, string][] = [
  [
    'Qué datos pedimos',
    'Correo y contraseña para tu cuenta; nombre, teléfono y país; el procedimiento o la institución que te interesa, una fecha tentativa y, si los eliges, los servicios complementarios. No pedimos información clínica: la historia médica la maneja el profesional en la valoración.',
  ],
  [
    'Para qué los usamos',
    'Para contactarte, coordinar la valoración con la institución que elegiste, cotizar los servicios complementarios y hacer seguimiento administrativo de tu solicitud. No vendemos tus datos.',
  ],
  [
    'Con quién los compartimos',
    'Con la institución o el profesional seleccionado y, si lo pediste, con el aliado de alojamiento o servicios, solo en lo necesario para atender tu solicitud.',
  ],
  [
    'Tus derechos',
    'Conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, puedes conocer, actualizar, rectificar y suprimir tus datos, y revocar la autorización. Para ejercerlos escribe al canal de contacto que publique PLASTINEX.',
  ],
  [
    'Seguridad',
    'Tus solicitudes se guardan en una base de datos con acceso restringido por roles. Solo el equipo de coordinación y la institución correspondiente pueden verlas. Tú las consultas desde tu cuenta.',
  ],
]

export default function Privacidad() {
  return (
    <article className="contenedor pt-36 pb-28">
      <div className="mx-auto max-w-3xl">
        <div className="rotulo">Privacidad</div>
        <h1 className="display mt-6 text-6xl md:text-7xl">
          Aviso de privacidad <em>(borrador)</em>
        </h1>
        <p className="mt-8 border-l-2 border-arcilla pl-5 text-sm text-piedra">
          Texto para el prototipo. Debe revisarlo un abogado en protección de datos antes de recibir solicitudes reales.
        </p>
        <div className="mt-16 space-y-12">
          {secciones.map(([t, d], i) => (
            <section key={t} className="grid gap-4 border-t border-linea pt-8 md:grid-cols-[60px_1fr]">
              <span className="font-serif text-2xl text-arcilla italic">{i + 1}</span>
              <div>
                <h2 className="font-serif text-3xl">{t}</h2>
                <p className="mt-4 leading-relaxed text-piedra">{d}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
