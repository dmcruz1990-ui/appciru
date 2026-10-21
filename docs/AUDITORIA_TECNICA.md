# Auditoría técnica — PLASTINEX (21 oct 2026)

Revisión hecha sobre el código real (este repositorio), la base de datos de Supabase y los despliegues de Vercel.
Responde al «Plan técnico de mejoras por prioridad» y a la lista de 12 pruebas de aceptación.

## Qué hay detrás de la URL

| Pieza | Tecnología | Dónde |
|---|---|---|
| Sitio del paciente | Vite 7 + React 19 + TypeScript + Tailwind 4 (aplicación estática) | `apps/cliente` → Vercel `plastinex-cliente` |
| Panel administrativo y de clínicas | Mismo stack, sin indexar en buscadores | `apps/admin` → Vercel `plastinex-admin` |
| Código compartido (tipos, catálogo, formato) | TypeScript | `packages/shared` |
| API, autenticación y datos | Supabase: PostgreSQL con RLS, Auth, Storage y funciones RPC | `supabase/migrations` |

No hay servidor propio: la «capa de autorización» del diagrama objetivo es PostgreSQL. Cada tabla tiene
Row Level Security y las operaciones sensibles pasan por funciones `security definer` que validan sesión, rol y datos.
El diagrama objetivo ya se cumple sin cambiar de tecnología: portal del paciente, panel de clínicas y panel
administrativo hablan con la misma API (PostgREST), y los permisos se deciden en la base de datos, no en el navegador.

Variables de entorno en Vercel: solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` (ambas públicas por diseño).
No hay secretos en el código ni en el navegador.

## P0 — Estabilidad y acceso

| Punto | Estado |
|---|---|
| El dominio sirve la aplicación | ⚠️ `plastinex-cliente.vercel.app` funciona. **plastinex.com aún no está conectado** (pendiente de autorización). |
| Logs, variables, API y base de datos | ✅ Sin funciones de servidor que fallen (sitio estático). Variables correctas. Base de datos accesible. |
| Compilación, rutas y carga | ✅ Ambas apps compilan sin errores de tipos. Reescritura SPA configurada: las rutas directas (`/explorar`, `/institucion/…`) cargan. |
| El despliegue corresponde a la versión esperada | ✅ Producción = último commit de la rama `claude/dazzling-feynman-xfv8fd`. |

## P1 — Seguridad y privacidad

Corregido en esta auditoría (migración `20261022120000_px_endurecer_solicitudes.sql`):

1. **Permisos de edición demasiado amplios.** Una clínica podía cambiar cualquier columna de sus solicitudes
   (correo, teléfono, paciente, consentimiento). Ahora solo puede tocar los campos de seguimiento:
   etapa, cita de valoración, asistencia y motivo de cierre. Asignar responsable queda reservado al equipo de PLASTINEX.
2. **Reintentos que duplicaban solicitudes.** Si la red fallaba después de enviar, reenviar creaba otra solicitud.
   Ahora cada envío lleva una clave única y el reintento devuelve el mismo código.
3. **Validación de entradas.** Se rechazan fechas pasadas, noches fuera de rango, alojamientos y servicios inexistentes.
   Ya existían: límite de 5 solicitudes por hora por paciente, mensaje de máximo 600 caracteres y rango de presupuesto.
4. **Inserción directa en la tabla de solicitudes** bloqueada: solo se crean por la función validada.
5. **Cabeceras de seguridad** en el sitio público (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`).
6. Tablas temporales de trabajo sin ningún acceso desde la API.

Sesiones: Supabase Auth con JWT. «Cerrar sesión» llama a `signOut()`, que revoca los tokens de refresco. El token de
acceso vigente expira solo (1 hora por defecto); para datos de salud se recomienda bajarlo a 15–30 min en
Supabase → Authentication → Sessions.

Datos personales: el tratamiento está documentado en el aviso de privacidad (`/privacidad`) y los términos (`/terminos`).
No se piden datos clínicos en la plataforma; la historia médica la maneja la clínica.

Pendiente (lo hace el titular de la cuenta en el panel de Supabase):

- Activar **protección contra contraseñas filtradas** (Authentication → Policies). Hoy está desactivada.
- Las funciones `public.crear_perfil`, `public.es_admin` y `public.rls_auto_enable` **no son de PLASTINEX**:
  pertenecen a otra aplicación que comparte el proyecto de Supabase. Conviene revisarlas o, mejor,
  mover PLASTINEX a un proyecto de Supabase propio antes de recibir pacientes reales.
- Borrar las tablas temporales `px_tmp_vista`, `px_privado.demo_coordenadas`, `px_privado.demo_paises` y la vista
  `px_privado.demo_destinos` (ya no tienen acceso; solo falta eliminarlas).
- Revisión legal del aviso de privacidad y los términos (Colombia y Estados Unidos).

## P2 — Funcionalidad e integración

| Punto | Estado |
|---|---|
| Búsqueda, comparación y solicitud de valoración | ✅ Buscador (qué, dónde, fechas, presupuesto), comparador por país, mapa, fichas y formulario de solicitud. |
| Área del paciente conectada con las clínicas | ✅ «Mi cuenta» muestra las solicitudes y su etapa; la clínica las ve en el panel. |
| Estados, notificaciones y trazabilidad | ✅ Etapas con historial automático (`px_solicitud_eventos`). ⚠️ **Faltan notificaciones por correo/WhatsApp** al cambiar de etapa. |
| Panel administrativo y comisiones | ✅ Panel con solicitudes, catálogo, clínicas, verificación y suscripciones. ⚠️ Falta el **cálculo de comisiones** por solicitud concretada. |

## P3 — Conversión y lanzamiento

| Punto | Estado |
|---|---|
| Experiencia móvil | ✅ Revisada con capturas en 390 px: sin desbordes, buscador plegable, botón de mapa. |
| Medición de visitas y embudo | ⚠️ Solo se guardan los UTM de cada solicitud. **Falta analítica** (Vercel Analytics o similar) para visitas, registros y solicitudes iniciadas. |
| Accesibilidad, rendimiento y navegadores | ⚠️ Pendiente auditoría Lighthouse y prueba en Safari/iOS. El paquete JS pesa más de 500 kB: conviene dividirlo por página. |
| Pruebas integrales antes de publicar | ✅ Pruebas de acceso repetibles en `supabase/pruebas/aceptacion_seguridad.sql`; capturas con Playwright. |

## Pruebas de aceptación (12)

Resultado del 21 oct 2026. Las de acceso se repiten con `supabase/pruebas/aceptacion_seguridad.sql`
(crea usuarios de prueba dentro de una transacción que se descarta).

| # | Prueba | Resultado |
|---|---|---|
| 1 | Un paciente no puede consultar solicitudes de otro paciente | ✅ Ve 0 filas en la tabla; «Mis solicitudes» solo trae las suyas |
| 2 | Una clínica no accede a oportunidades de otra clínica | ✅ Solo ve las suyas; modificar la de otra afecta 0 filas |
| 3 | Cerrar sesión invalida la sesión | ✅ `signOut()` revoca los tokens de refresco (el de acceso expira solo; ver P1) |
| 4 | Los endpoints rechazan solicitudes no autorizadas | ✅ Visitante: 0/0/0 en solicitudes, pacientes y perfiles; no puede crear solicitudes |
| 5 | Una solicitud se guarda y persiste tras recargar | ✅ Se guarda en la base y aparece en «Mi cuenta» |
| 6 | Los cambios de estado se reflejan en el área correspondiente | ✅ Cambio de etapa registrado en el historial y visible para el paciente |
| 7 | Los errores de red permiten reintentar sin duplicar | ✅ Corregido hoy: mismo código en el reintento |
| 8 | Datos de clínicas y profesionales de fuentes verificadas | ❌ **Hoy son perfiles de demostración**, marcados como tales. Deben reemplazarse por prestadores reales verificados (REPS/ReTHUS o equivalente) |
| 9 | Formularios en móvil y escritorio | ✅ Verificado con capturas |
| 10 | Errores con mensajes claros | ✅ Mensajes concretos (sesión, términos, límites, disponibilidad). ⚠️ Los que vienen de la base de datos solo están en español |
| 11 | El despliegue publicado supera las pruebas de regresión | ✅ Compila y pasa las pruebas de acceso; ⚠️ falta automatizarlas en CI |
| 12 | Los logs no exponen contraseñas, tokens ni datos clínicos | ✅ El código no registra datos personales; solo un aviso si faltan variables de entorno |

**Bloqueantes para recibir pacientes reales:** prueba 8 (prestadores reales verificados), dominio propio,
protección de contraseñas filtradas, proyecto de Supabase dedicado y revisión legal.
