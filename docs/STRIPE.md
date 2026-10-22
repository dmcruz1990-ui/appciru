# Cobro de suscripciones con Stripe Billing

PLASTINEX LLC cobra a cirujanos y clínicas una suscripción mensual o anual. El cobro, la renovación, las facturas,
los reintentos de tarjetas rechazadas y las cancelaciones los gestiona Stripe; PLASTINEX solo escucha los eventos.
Los anticipos de cirugía **no** pasan por PLASTINEX: el paciente los paga a la clínica con sus propios medios.

## Planes (precios iniciales de prueba, sin impuestos)

| Plan | Id interno | USD/mes |
|---|---|---|
| Starter | `piloto` | 49 |
| Professional | `tecnologia` | 149 |
| Clinic Premium | `administrado` | 299 |

Se editan en el panel: **Catálogo → Planes de médicos**. Deben validarse con cirujanos y clínicas antes de fijarlos.

## Flujo

1. El médico se registra en `/para-clinicas/registro`; PLASTINEX verifica sus documentos y lo aprueba
   (pagar **no** equivale a acreditación).
2. Con la aprobación elige plan → página de pago de Stripe (Checkout, modo suscripción).
3. Stripe avisa al webhook → `px_suscripciones` queda **activa** y el equipo puede publicar su perfil.
4. Renovaciones automáticas. Si una tarjeta falla, Stripe reintenta (estado `past_due`, el perfil sigue visible).
   Si se agotan los reintentos (`unpaid`) o se cancela, la suscripción pasa a pausada/cancelada y **la clínica y sus
   cirujanos se retiran del sitio automáticamente**; sus datos se conservan para reactivarlos al pagar.
5. El médico cambia de plan o tarjeta, descarga facturas o cancela desde «Gestionar suscripción y facturas»
   (portal de clientes de Stripe).

Sin Stripe configurado sigue funcionando el flujo manual: el médico elige plan y el equipo confirma el pago en
«Registros de médicos».

## Puesta en marcha (una sola vez)

1. **Cuenta de Stripe** a nombre de PLASTINEX LLC (Wyoming), con la actividad aprobada por Stripe.
2. **Productos y precios**: en Stripe → Product catalog, crea Starter, Professional y Clinic Premium con un precio
   recurrente mensual en USD (y anual, si se ofrece). Copia cada `price_…` en el panel:
   Catálogo → Planes de médicos → «Stripe · price ID mensual / anual». Con eso el botón cambia a «Suscribirme».
3. **Webhook**: en Stripe → Developers → Webhooks, agrega el endpoint
   `https://luooqfyknyyexexhfhvm.supabase.co/functions/v1/px-stripe` con los eventos
   `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` y
   `customer.subscription.deleted`.
4. **Secretos** en Supabase → Edge Functions → Secrets (nunca en el código ni en el chat):
   - `STRIPE_SECRET_KEY` (sk_live_… o sk_test_… para pruebas)
   - `STRIPE_WEBHOOK_SECRET` (whsec_… del paso 3)
   - `PX_URL_PUBLICA` = `https://plastinex.com` cuando se conecte el dominio
5. **Portal de clientes**: en Stripe → Settings → Billing → Customer portal, activa cambio de plan (con los tres
   precios), actualización de tarjeta, facturas y cancelación al final del periodo.
6. **Reintentos y periodo de gracia**: Stripe → Settings → Billing → Subscriptions and emails → Smart Retries; define
   cuántos días reintentar y marca «Mark the subscription as unpaid» al final, para que se retire el perfil.
7. **Impuestos**: activa Stripe Tax si corresponde (los precios publicados no incluyen impuestos).

Prueba todo primero en **modo de prueba** con la tarjeta 4242 4242 4242 4242.

## Comisión comercial

La comisión por operaciones atribuibles a la plataforma es un **contrato aparte** de la suscripción y solo donde la
ley de cada mercado lo permita. No se cobra por Stripe Billing: se factura según ese contrato.

Código: `supabase/functions/px-stripe/index.ts` (checkout, portal y webhook) y la migración
`20261022230000_px_planes_stripe.sql`.
