# Ciru — marketplace de cirugías en Colombia

> "Uber no tiene carros, Airbnb no tiene hoteles." Ciru no tiene quirófanos: reúne clínicas, cirujanos,
> quirófanos y alojamiento de todo Colombia y le vende al paciente **el plan completo**.

Nombre de trabajo: *Ciru* (provisional).

## Qué hay en este repo (v0.1)

Una sola app web (Vite + React + TypeScript + Tailwind) con dos interfaces que comparten el mismo modelo de datos:

| Interfaz | Ruta | Qué hace |
|---|---|---|
| **Cliente** (estilo Amazon/eBay) | `/` | Portada con categorías y planes destacados, buscador con filtros (ciudad, categoría, precio, valoración virtual, clínica acreditada), fichas de procedimiento, cirujano y clínica, **armador de plan** (cirugía + alojamiento + noches + servicios extra con total en COP/USD), confirmación y "Mis solicitudes" con línea de tiempo. |
| **Panel admin** | `/admin` | KPIs (pipeline, ventas, conversión, comisión), embudo por estado, ventas por ciudad, pedidos con filtros y búsqueda, detalle de pedido (cambiar estado, notas visibles al paciente, WhatsApp), catálogo (publicar/ocultar médicos, clínicas, procedimientos, alojamientos, ofertas; editar precios; crear publicaciones) y configuración (comisión, tasa USD). |

Por ahora los datos viven en `localStorage` y se sincronizan entre pestañas: si abres el sitio de cliente en
una pestaña y `/admin` en otra, los pedidos aparecen en vivo. **Todos los nombres de clínicas y médicos son
ficticios** y los códigos REPS/ReTHUS son de ejemplo.

```bash
npm install
npm run dev        # http://localhost:5173  y  http://localhost:5173/admin
npm run build
```

### Estructura

```
src/
  shared/   types.ts (modelo de dominio) · seed.ts (datos demo) · store.ts (capa de datos)
            lookup.ts · format.ts · ui.tsx
  cliente/  ClienteLayout + pages/ (Inicio, Buscar, Procedimiento, Médico, Clínica, ArmarPlan, …)
  admin/    AdminLayout + pages/ (Dashboard, Pedidos, PedidoDetalle, Catálogo, Configuración)
```

La unidad central del marketplace es la **Oferta**: *un médico ofrece un procedimiento en una clínica a un
precio*. Es el equivalente al "producto" de Amazon; el plan del paciente es Oferta + Alojamiento + Extras.

## Investigación inicial

- **Mercado:** ISAPS estima ~459 mil procedimientos estéticos en Colombia en 2025 (331 mil quirúrgicos).
  Alrededor de 27–30 % de los pacientes son extranjeros (mediana mundial ~10 %); Colombia es 2.º–3.º destino del
  mundo, detrás de México. Principales orígenes: EE. UU., España y Canadá. Más pedidos: liposucción,
  levantamiento de senos, aumento mamario, párpados y abdominoplastia. Gasto promedio del turista de salud
  ~USD 3.257 (Anato).
- **Competencia internacional:** Bookimed (1.700 clínicas, 32 países) cobra comisión a la clínica, no
  recargo al paciente, y el listado es gratuito pero con selección; PlacidWay y WhatClinic son directorios
  globales. Ninguno se enfoca en Colombia ni en el **plan completo con alojamiento de recobro**, que es el
  diferencial.
- **Confianza = producto.** Tras casos mediáticos de clínicas ilegales, el paciente verifica: clínica
  habilitada en el **REPS** (MinSalud), especialista con la especialidad registrada en **ReTHUS** y miembro
  de la **SCCP**. Por eso cada ficha muestra esas insignias y el flujo de alta en el admin debe validarlas.
- **Legal a considerar:** Ley 1581 de 2012 (datos personales; los de salud son sensibles y requieren
  autorización expresa — ya incluida en el formulario), Resolución 3100 de 2019 y modificaciones (habilitación),
  publicidad de servicios de salud, y que la plataforma intermedia pero no presta el servicio médico.

## Próximos pasos propuestos

1. Incorporar la información del doctor (modelo de negocio, aliados, procedimientos reales, precios).
2. Backend real (Supabase: Postgres + Auth + Storage) con roles: paciente, clínica/médico, coordinador, admin.
3. Inicio de sesión del paciente (enlace mágico/OTP) y subida segura de fotos para la valoración.
4. Portal de aliados: que clínicas, médicos y alojamientos administren su propia oferta y disponibilidad de quirófano.
5. Pagos de anticipo (Wompi / Mercado Pago / Stripe para internacionales) y modelo de comisión.
6. Versión en inglés (la mayoría del turismo médico viene de EE. UU. y Canadá).
7. Reseñas verificadas (solo pacientes con cirugía completada) y fotos antes/después con consentimiento.
