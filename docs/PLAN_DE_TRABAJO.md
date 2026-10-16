# PLASTINEX — Plan de trabajo

Documento vivo. Lo hicimos combinando tres fuentes:

1. **El modelo de negocio del doctor** (`Modelo_de_Negocio_PLASTINEX.pdf`): servicio B2B de tecnología y gestión
   comercial para clínicas de cirugía plástica. Empieza en Pereira y el Eje Cafetero.
2. **El prototipo web v2 del doctor**: buscador de procedimiento y ciudad, perfiles con precio orientativo,
   solicitud de valoración, panel para clínicas y estado de "pendiente de validación documental".
3. **La visión de marketplace**: estilo Amazon/eBay, con clínicas, cirujanos y procedimientos, más el **plan
   completo** (alojamiento de recobro, traslados, enfermería) como complemento.

PLASTINEX es un nombre de trabajo. Su disponibilidad como marca no se ha verificado.

---

## 1. Decisiones tomadas

| Tema | Decisión | Por qué |
|---|---|---|
| Quién paga | **Las clínicas, con suscripción B2B** (instalación + mensualidad o servicio administrado). No cobramos comisión por cirugía. | Así lo recomienda el doctor. Los pagos ligados a remisiones o cirugías requieren revisión jurídica. |
| Qué recibe el paciente | Información, comparación y **solicitud de valoración**. No es una compra ni una reserva. | La indicación, los riesgos y las alternativas los decide el profesional. |
| Plan completo | Se mantiene **como complemento opcional** en la solicitud: alojamiento y servicios. | Es el diferencial frente a Bookimed y otros. Se cotiza aparte. |
| Cobertura inicial | **Eje Cafetero**: Pereira, Dosquebradas, Armenia, Manizales y Cartago. | Así lo dice la estrategia de entrada. El sistema admite más ciudades. |
| Aplicaciones | **Dos web apps separadas**: `apps/cliente` (público) y `apps/admin` (operación). Comparten un paquete `packages/shared`. | Así se pidió. Cada una se despliega en su propio dominio. |
| Backend | **Supabase**, proyecto `itc-colombia`, con tablas de prefijo `px_`. | Base de datos, inicio de sesión y permisos por fila (RLS) sin servidor propio. |
| Verificación | La insignia "Verificado" **solo** aparece cuando un admin completó la revisión de REPS, ReTHUS y la sociedad científica. Si no, se muestra "Pendiente de validación documental". | Así lo exige el prototipo del doctor. Es un tema de confianza y de publicidad sanitaria. |
| Precios | Rango orientativo (mín. y máx.) **con fecha de actualización, qué incluye y qué no incluye**. Si no hay precio, se dice "Precio no informado". | Nunca inventamos un precio. Siempre se confirma en una cotización individual. |
| Datos personales | Formularios mínimos, **sin información clínica**, con autorización expresa (Ley 1581/2012). El paciente consulta su solicitud con un código y su correo. | Los datos de salud son sensibles. |

## 2. Las dos aplicaciones

### App cliente (público)
- Portada con buscador de procedimiento, ciudad y precio, y categorías de procedimientos.
- Resultados en cuadrícula, estilo marketplace, con filtros y orden por relevancia, nombre o precio.
- Fichas de **procedimiento**, **institución/clínica** y **profesional**, con su estado de verificación.
- **Solicitar valoración**: datos de contacto, fecha tentativa y complementos opcionales (alojamiento y servicios),
  con un estimado orientativo.
- **Seguimiento**: código + correo, que muestran la etapa y los mensajes del coordinador.
- Páginas para clínicas (captar clientes B2B) y aviso de privacidad.

### App admin (operación PLASTINEX)
- **Inicio de sesión** con roles: `admin`, `coordinador` y `clinica`. El rol `clinica` llega en la fase 3.
- **Resumen**: embudo por etapa, conversión, tiempo de primera respuesta, citas agendadas y asistencia, y
  solicitudes por clínica, procedimiento y ciudad.
- **Solicitudes (CRM)**: tablero por etapas con la ruta del doctor: *nueva → contactada → valoración agendada →
  valorada → en seguimiento → programada / no continúa*. Incluye notas internas, mensajes al paciente, asignación
  de coordinador y WhatsApp.
- **Catálogo**: instituciones, profesionales, procedimientos, ofertas (quién hace qué, dónde y a qué rango),
  alojamientos y servicios complementarios. Desde aquí se publican u ocultan.
- **Verificación documental**: lista de pendientes y chequeo de REPS, ReTHUS y sociedad, con fecha y
  responsable.
- **Clientes B2B**: suscripción de cada clínica (plan, instalación, cuota, estado) y cálculo de MRR, clientes
  activos y churn.
- **Usuarios**: quién tiene acceso y con qué rol.

## 3. Fases

| Fase | Contenido | Estado |
|---|---|---|
| **0. Exploración** | v0.1 de una sola app con datos locales. Investigación de mercado. | ✅ Hecho |
| **1. MVP conectado** | Monorepo con dos apps y Supabase (esquema, RLS, funciones). Cliente con búsqueda, fichas, solicitud y seguimiento. Admin con login, CRM, catálogo, verificación, clientes B2B y métricas. Datos ficticios del Eje Cafetero. | 🚧 En curso |
| **2. Piloto con 2–3 clínicas** | Datos reales de las clínicas piloto. Dominio y despliegue. Política de privacidad redactada con abogado. Notificaciones por correo/WhatsApp al crear una solicitud. Línea base de indicadores. | Pendiente |
| **3. Portal de clínicas** | Cada clínica entra con su usuario, ve sus solicitudes, actualiza etapas y propone cambios a su perfil y precios (que pasan por revisión). Multisede. Facturación de suscripciones. | Pendiente |
| **4. Escala** | Versión en inglés para pacientes internacionales, reseñas verificadas, integración con campañas (píxeles, UTM), automatizaciones y más ciudades. | Pendiente |

## 4. Pendientes para el doctor / el equipo
- [ ] Lista de 20–30 clínicas y profesionales del Eje Cafetero, y quiénes serían los 2–3 pilotos.
- [ ] Procedimientos y rangos de precio reales de los pilotos (con qué incluye y qué no incluye).
- [ ] Planes y precios B2B definitivos (instalación, suscripción, servicio administrado).
- [ ] Revisión jurídica: alcance de la actividad, publicidad sanitaria, tratamiento de datos y contratos.
- [ ] Nombre y marca: búsqueda en la SIC, dominio y redes.
- [ ] Aliados de alojamiento de recobro y servicios (traslados, enfermería) en Pereira.

## 5. Indicadores que vamos a medir (del documento del doctor)
CAC por clínica, MRR, margen de contribución, churn, recuperación del CAC, costo por cita y asistencia, y
conversión por etapa. En la app admin ya se calculan los que salen del sistema: MRR, churn, conversión por etapa,
citas agendadas, asistencia y tiempo de respuesta. CAC y margen necesitan datos de costos que se cargan aparte.
