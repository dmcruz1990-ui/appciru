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

### Cuentas de paciente
Para solicitar una valoración el paciente debe **crear su cuenta** (correo y contraseña). Luego pasa por un paso obligatorio
en el que da sus datos de contacto y acepta de forma expresa cuatro cosas: la condición de intermediario de PLASTINEX, los
términos y la limitación de responsabilidad, la confidencialidad y el tratamiento de datos (Ley 1581). La fecha y la versión de
cada aceptación quedan guardadas en `px_pacientes` y se ven en el panel, en el detalle de cada solicitud. El catálogo se
puede explorar sin cuenta.

En Supabase → Authentication → URL Configuration → **Redirect URLs** deben estar las dos apps:
`https://plastinex-cliente.vercel.app/**` y `https://plastinex-admin.vercel.app/**`. Sin eso no funcionan los enlaces de
confirmación de correo ni los de recuperación de contraseña.

### Diseño
El sitio usa un estilo editorial clínico: paleta marfil y espresso, tipografías Instrument Serif y Geist, fotos a sangre,
animaciones con `motion` y desplazamiento suave con `lenis`. El sitio no usa fotos de banco: mientras no haya fotos propias se
muestra una composición abstracta generada en el navegador (`Lienzo`, en `componentes/base.tsx`), sin cuerpos ni pacientes.
Las fotos reales se suben desde el panel (Catálogo → Editar → Subir foto) y quedan en el bucket `px-imagenes`. Usar solo
fotos propias o con licencia y consentimiento, revisadas por el médico antes de publicarlas.

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
