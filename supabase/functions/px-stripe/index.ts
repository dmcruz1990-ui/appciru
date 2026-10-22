// Cobro recurrente de los planes de médicos con Stripe Billing.
//
// - POST { accion: 'checkout', plan, intervalo } (médico con sesión): crea la página de pago de Stripe.
// - POST { accion: 'portal' } (médico con sesión): abre el portal de Stripe para cambiar de plan, tarjeta,
//   descargar facturas o cancelar.
// - POST con cabecera stripe-signature: webhook de Stripe. Activa, renueva, pausa o cancela la suscripción
//   en px_suscripciones; al quedar sin suscripción vigente, la clínica se retira del sitio (trigger en la base).
//
// Secretos (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET y,
// opcional, PX_URL_PUBLICA (por defecto https://plastinex-cliente.vercel.app).
import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2.45.4'

const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const SITIO = (Deno.env.get('PX_URL_PUBLICA') ?? 'https://plastinex-cliente.vercel.app').replace(/\/$/, '')
const ORIGENES = [SITIO, 'https://plastinex-cliente.vercel.app', 'https://plastinex.com', 'https://www.plastinex.com', 'http://localhost:5173']

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { httpClient: Stripe.createFetchHttpClient() }) : null

function cabeceras(req: Request) {
  const origen = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ORIGENES.includes(origen) ? origen : SITIO,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    'Content-Type': 'application/json',
  }
}

Deno.serve(async (req) => {
  const h = cabeceras(req)
  const responder = (cuerpo: unknown, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: h })
  if (req.method === 'OPTIONS') return new Response(null, { headers: h })
  if (req.method !== 'POST') return responder({ error: 'Método no permitido' }, 405)
  if (!stripe) return responder({ error: 'El cobro con tarjeta aún no está configurado.' }, 503)

  try {
    if (req.headers.get('stripe-signature')) return await webhook(req, responder)

    // Acciones del médico: requieren su sesión de PLASTINEX.
    const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: u } = await db.auth.getUser(token)
    if (!u.user) return responder({ error: 'Debes iniciar sesión' }, 401)
    const { data: post } = await db.from('px_postulaciones').select('*').eq('usuario_id', u.user.id).maybeSingle()
    if (!post || post.estado !== 'aprobada' || !post.institucion_id) return responder({ error: 'Primero debemos aprobar tu registro' }, 403)
    const cuerpo = await req.json().catch(() => ({}))

    if (cuerpo.accion === 'portal') {
      if (!post.stripe_customer_id) return responder({ error: 'Aún no tienes una suscripción' }, 409)
      const s = await stripe.billingPortal.sessions.create({ customer: post.stripe_customer_id, return_url: `${SITIO}/para-clinicas/registro` })
      return responder({ url: s.url })
    }

    if (cuerpo.accion === 'checkout') {
      const anual = cuerpo.intervalo === 'anio'
      const { data: plan } = await db.from('px_planes').select('*').eq('id', cuerpo.plan).eq('activo', true).maybeSingle()
      const precio = plan && (anual ? plan.stripe_price_anual : plan.stripe_price_mensual)
      if (!plan || !precio) return responder({ error: 'Este plan todavía no se puede pagar con tarjeta' }, 409)

      let cliente = post.stripe_customer_id as string | null
      if (!cliente) {
        const c = await stripe.customers.create({
          email: post.email,
          name: post.institucion_nombre,
          metadata: { usuario_id: post.usuario_id, postulacion_id: post.id, institucion_id: post.institucion_id },
        })
        cliente = c.id
        await db.from('px_postulaciones').update({ stripe_customer_id: cliente }).eq('id', post.id)
      }
      const meta = { postulacion_id: post.id, institucion_id: post.institucion_id, plan: plan.id }
      const sesion = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: cliente,
        client_reference_id: post.id,
        line_items: [{ price: precio, quantity: 1 }],
        subscription_data: { metadata: meta },
        metadata: meta,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        tax_id_collection: { enabled: true },
        customer_update: { name: 'auto', address: 'auto' },
        success_url: `${SITIO}/para-clinicas/registro?pago=ok`,
        cancel_url: `${SITIO}/para-clinicas/registro?pago=cancelado`,
      })
      await db.from('px_postulaciones').update({ plan_id: plan.id, pago_estado: 'pendiente', plan_elegido_en: new Date().toISOString() }).eq('id', post.id).neq('pago_estado', 'pagado')
      return responder({ url: sesion.url })
    }

    return responder({ error: 'Acción no válida' }, 400)
  } catch (e) {
    console.error('px-stripe', e instanceof Error ? e.message : e)
    return responder({ error: 'No pudimos procesar la operación. Intenta de nuevo.' }, 500)
  }
})

async function webhook(req: Request, responder: (c: unknown, s?: number) => Response) {
  if (!WEBHOOK_SECRET) return responder({ error: 'Webhook sin configurar' }, 503)
  const cuerpo = await req.text()
  let evento: Stripe.Event
  try {
    evento = await stripe!.webhooks.constructEventAsync(cuerpo, req.headers.get('stripe-signature')!, WEBHOOK_SECRET, undefined, Stripe.createSubtleCryptoProvider())
  } catch {
    return responder({ error: 'Firma no válida' }, 400)
  }

  if (evento.type === 'checkout.session.completed') {
    const s = evento.data.object as Stripe.Checkout.Session
    if (s.mode === 'subscription' && typeof s.subscription === 'string') await sincronizar(await stripe!.subscriptions.retrieve(s.subscription))
  } else if (evento.type.startsWith('customer.subscription.')) {
    await sincronizar(evento.data.object as Stripe.Subscription)
  }
  return responder({ recibido: true })
}

/** Traduce el estado de Stripe al de PLASTINEX. past_due conserva el acceso mientras Stripe reintenta el cobro. */
const ESTADOS: Record<string, 'activa' | 'prueba' | 'pausada' | 'cancelada' | null> = {
  active: 'activa',
  trialing: 'prueba',
  past_due: 'activa',
  unpaid: 'pausada',
  paused: 'pausada',
  incomplete_expired: 'cancelada',
  canceled: 'cancelada',
  incomplete: null,
}

async function sincronizar(sub: Stripe.Subscription) {
  const estado = ESTADOS[sub.status]
  if (estado === null || estado === undefined) return
  const item = sub.items.data[0]
  const precio = item?.price
  // El plan sale del precio (sirve también cuando cambia de plan en el portal) o de los metadatos.
  const { data: planes } = await db.from('px_planes').select('id, stripe_price_mensual, stripe_price_anual')
  const plan = planes?.find((p) => p.stripe_price_mensual === precio?.id || p.stripe_price_anual === precio?.id)?.id ?? sub.metadata.plan
  const postulacionId = sub.metadata.postulacion_id
  const { data: post } = postulacionId
    ? await db.from('px_postulaciones').select('id, institucion_id, pago_confirmado_en').eq('id', postulacionId).maybeSingle()
    : await db.from('px_postulaciones').select('id, institucion_id, pago_confirmado_en').eq('stripe_customer_id', sub.customer as string).maybeSingle()
  const institucion = sub.metadata.institucion_id || post?.institucion_id
  if (!institucion || !plan) return console.error('px-stripe: suscripción sin clínica o plan', sub.id)

  const { data: ajuste } = await db.from('px_ajustes').select('valor').eq('clave', 'tasa_usd_cop').maybeSingle()
  const anual = precio?.recurring?.interval === 'year'
  const usdMes = (precio?.unit_amount ?? 0) / 100 / (anual ? 12 : 1)
  const fin = (item as unknown as { current_period_end?: number })?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end
  const fila = {
    institucion_id: institucion,
    plan,
    estado,
    proveedor: 'stripe',
    stripe_customer_id: sub.customer as string,
    stripe_subscription_id: sub.id,
    stripe_estado: sub.status,
    intervalo: anual ? 'anio' : 'mes',
    periodo_fin: fin ? new Date(fin * 1000).toISOString() : null,
    cuota_mensual: Math.round(usdMes * Number(ajuste?.valor ?? 0)),
    inicio: new Date(sub.start_date * 1000).toISOString().slice(0, 10),
    fin: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString().slice(0, 10) : null,
    notas: 'Suscripción gestionada por Stripe Billing',
  }
  const { error } = await db.from('px_suscripciones').upsert(fila, { onConflict: 'stripe_subscription_id' })
  if (error) throw new Error(error.message)

  if (post) {
    const vigente = estado === 'activa' || estado === 'prueba'
    await db
      .from('px_postulaciones')
      .update({
        plan_id: plan,
        pago_estado: vigente ? 'pagado' : estado === 'cancelada' ? 'sin_plan' : 'pendiente',
        pago_confirmado_en: vigente ? (post.pago_confirmado_en ?? new Date().toISOString()) : post.pago_confirmado_en,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', post.id)
  }
}
