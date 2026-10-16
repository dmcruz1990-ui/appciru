export default function Privacidad() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <div className="kicker">— Privacidad</div>
      <h1 className="titulo mt-2 text-4xl">
        Aviso de privacidad <em>(borrador)</em>
      </h1>
      <p className="mt-3 bg-oro/10 p-3 text-sm">
        Este texto es un borrador para el prototipo. Debe revisarlo un abogado en protección de datos antes de recibir solicitudes
        reales.
      </p>
      <div className="mt-8 space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="titulo text-2xl">Qué datos pedimos</h2>
          <p>
            Nombre, correo, teléfono, país, el procedimiento o la institución que te interesa, una fecha tentativa y, si los eliges,
            los servicios complementarios (alojamiento, traslados, enfermería). <b>No pedimos información clínica</b>: la historia
            médica la maneja el profesional de salud en la valoración.
          </p>
        </section>
        <section>
          <h2 className="titulo text-2xl">Para qué los usamos</h2>
          <p>
            Para contactarte, coordinar la valoración con la institución que elegiste, cotizar los servicios complementarios y hacer
            seguimiento administrativo de tu solicitud. No vendemos tus datos.
          </p>
        </section>
        <section>
          <h2 className="titulo text-2xl">Con quién los compartimos</h2>
          <p>
            Con la institución o el profesional seleccionado y, si lo pediste, con el aliado de alojamiento o servicios, solo en lo
            necesario para atender tu solicitud.
          </p>
        </section>
        <section>
          <h2 className="titulo text-2xl">Tus derechos</h2>
          <p>
            Conforme a la Ley 1581 de 2012 y sus decretos reglamentarios, puedes conocer, actualizar, rectificar y suprimir tus
            datos, y revocar la autorización. Para ejercerlos escribe al canal de contacto que publique PLASTINEX.
          </p>
        </section>
        <section>
          <h2 className="titulo text-2xl">Seguridad</h2>
          <p>
            Las solicitudes se guardan en una base de datos con acceso restringido por roles. Solo el equipo de coordinación y la
            institución correspondiente pueden verlas.
          </p>
        </section>
      </div>
    </article>
  )
}
