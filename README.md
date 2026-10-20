# PLASTINEX

Plataforma de cirugía plástica para el Eje Cafetero. Tiene dos partes:

- **El sitio público (cliente).** Estilo marketplace: la persona explora procedimientos, instituciones y profesionales,
  ve rangos de precio orientativos y solicita una valoración. Si lo necesita, agrega a su solicitud el plan
  complementario: alojamiento de recobro, traslados y enfermería.
- **El panel (admin).** Es el CRM de solicitudes, con la ruta comercial del modelo de negocio. Desde ahí se maneja
  el catálogo, la verificación documental, los clientes B2B (suscripciones) y las métricas.

El plan por fases y las decisiones tomadas están en **[`docs/PLAN_DE_TRABAJO.md`](docs/PLAN_DE_TRABAJO.md)**.

> PLASTINEX es un nombre de trabajo. Todos los perfiles cargados son **ficticios** (marcados `DEMO`). PLASTINEX no
> diagnostica ni determina si alguien es candidato a cirugía: eso le corresponde al profesional de salud.

## Estructura

```
apps/
  cliente/     Sitio público (Vite + React + Tailwind) → http://localhost:5173
  admin/       Panel interno con inicio de sesión       → http://localhost:5174
packages/
  shared/      Tipos, cliente de Supabase, consultas y formatos compartidos
supabase/
  migrations/  Esquema px_*, RLS, funciones y datos de demostración
docs/
  PLAN_DE_TRABAJO.md
```

## Cómo correrlo

```bash
cp .env.example .env      # URL y clave publicable de Supabase (proyecto itc-colombia)
npm install
npm run dev:cliente       # sitio público
npm run dev:admin         # panel
npm run build             # compila las dos apps (dist/ en cada una)
```

### Titular y modelo
La plataforma es de **PLASTINEX LLC** (1501 South Greeley Hwy, Ste C #1776, Cheyenne, WY 82007, EE. UU.). Esos datos están en `EMPRESA` (`packages/shared/src/formato.ts`). El paciente contrata y paga directamente a la
clínica que elige; la clínica fija el precio y responde por la atención; PLASTINEX factura a la clínica una comisión o tarifa
comercial según un contrato independiente. Si cambian los términos, sube `TERMINOS_VERSION` y `px_privado.px_version_terminos()`
a la vez: los pacientes tendrán que aceptarlos de nuevo.

### Cuentas de paciente
Para solicitar una valoración el paciente debe **crear su cuenta** (correo y contraseña). Luego pasa por un paso obligatorio
en el que da sus datos de contacto y acepta de forma expresa cuatro cosas: la condición de intermediario de PLASTINEX, los
términos y la limitación de responsabilidad, la confidencialidad y el tratamiento de datos (Ley 1581). La fecha y la versión de
cada aceptación quedan guardadas en `px_pacientes` y se ven en el panel, en el detalle de cada solicitud. El catálogo se
puede explorar sin cuenta.

En Supabase → Authentication → URL Configuration → **Redirect URLs** deben estar las dos apps:
`https://plastinex-cliente.vercel.app/**` y `https://plastinex-admin.vercel.app/**`. Sin eso no funcionan los enlaces de
confirmación de correo ni los de recuperación de contraseña.

### Experiencia tipo marketplace
- **Buscador en píldora** (procedimiento · dónde · fechas del viaje · presupuesto) con paneles desplegables; en celular
  empieza plegado. La búsqueda queda en la URL, así se puede compartir.
- **Explorar** con lista y **mapa con precios** (Leaflet + teselas de CARTO/OpenStreetMap). Al pasar por una tarjeta se
  resalta su marcador; «Buscar al mover el mapa» filtra por la zona visible. En celular, botón «Mostrar mapa».
- **Tarjetas con carrusel de fotos** y **favoritos** (corazón). Los favoritos viven solo en el navegador del visitante.
- **Ficha de clínica** con galería y visor de fotos, servicios, especialistas, ubicación, alojamiento cercano y una
  **tarjeta de reserva** fija: procedimiento, fechas de llegada y salida, alojamiento y total estimado.
- **Alojamiento** (`/alojamientos`, `/alojamiento/:id`) con mapa de precios por noche y cálculo por fechas.
- **Directorio de especialistas** (`/especialistas`) con filtros por ciudad, procedimiento, idioma y valoración virtual.
- En el panel, cada institución y alojamiento tiene **galería** (hasta 20 fotos) y **coordenadas** para el mapa.

### Idiomas y moneda
- El sitio público está en **español e inglés** (selector ES | EN en la cabecera, el menú y el pie). El idioma inicial sale
  del navegador y la elección se recuerda. Los textos de la interfaz viven en cada componente con `tx('español', 'English')`
  (`apps/cliente/src/idioma.tsx`).
- Los textos del catálogo tienen columnas `*_en` (nombre, descripción, servicios, presentación…). Se editan en el panel
  («… (inglés)»); si están vacías, el sitio muestra el español.
- Los precios se guardan en **pesos (COP)**. Quien elige **USD** ve el equivalente aproximado con la tasa
  `px_ajustes.tasa_usd_cop`, que el admin cambia en Catálogo → Moneda. Los dólares se redondean a decenas y el sitio
  aclara que la clínica cotiza y cobra en su moneda. Por defecto ven pesos quienes navegan desde Colombia y dólares el resto.
- Los términos y el aviso de privacidad en inglés son una traducción de cortesía; prevalece la versión en español.

### Diseño
Estilo de casa de lujo internacional: blanco y negro puros, una sola tipografía geométrica (Jost), títulos en mayúsculas
espaciadas, logotipo centrado con la fila de categorías debajo, botones rectos, animaciones con `motion` y desplazamiento
suave con `lenis`. Los colores se definen en `apps/cliente/src/index.css`. El sitio no usa fotos de banco: mientras no haya
fotos propias se muestra una composición abstracta en blanco y negro generada en el navegador (`Lienzo`, en
`componentes/base.tsx`), sin cuerpos ni pacientes. Las fotos reales se suben desde el panel (Catálogo → Editar → Subir foto)
y quedan en el bucket `px-imagenes`. Usar solo fotos propias o con licencia y consentimiento, revisadas por el médico antes
de publicarlas.

### Primer acceso al panel
1. Abre el panel → **Crear cuenta** → confirma el correo si Supabase lo pide.
2. Al entrar, la cuenta aparece como *pendiente*. El primer usuario puede pulsar **«Ser el primer
   administrador»**. Esto solo funciona mientras no exista ningún admin.
3. Desde **Usuarios**, el admin asigna roles a los demás: `coordinador` o `clinica` (este último ve solo las
   solicitudes de su institución).

## Backend (Supabase)

- Las tablas llevan el prefijo `px_`, porque el proyecto `itc-colombia` también aloja otra aplicación (`perfiles`,
  `cursos`, `inscripciones`), que no se toca.
- **RLS en todas las tablas.**
  - El público solo lee el catálogo publicado.
  - Las solicitudes **no** se pueden leer sin sesión. Se crean con `px_crear_solicitud`, que valida los datos,
    exige la autorización de datos y limita los envíos por correo, y se consultan con
    `px_consultar_solicitud(código, correo)`, que nunca devuelve las notas internas.
  - Staff (admin y coordinador) ve y gestiona todo. El rol `clinica` solo ve lo de su institución.
  - Las suscripciones solo las ve el staff y solo las edita el admin.
- Un trigger registra cada cambio de etapa en el historial y marca la hora de la primera respuesta.
- Las funciones auxiliares de RLS viven en el esquema `px_privado`, que no se expone por la API.

## Principios que sigue la interfaz (del documento del doctor)
- La insignia **«Documentación verificada»** solo aparece después de la revisión en el panel (REPS, ReTHUS y
  sociedad científica, con su checklist). Mientras tanto se muestra «Pendiente de validación documental».
- Los precios son **rangos orientativos**, con qué incluyen y qué no, y la fecha de actualización. Si no hay
  precio, se muestra «Precio no informado» y nunca uno inventado.
- El formulario pide los datos mínimos, **sin información clínica**, con autorización según la Ley 1581 de 2012.
  Una solicitud no es una reserva.
- No se prometen resultados ni «más cirugías garantizadas».
