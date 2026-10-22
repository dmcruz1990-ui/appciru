-- Modelo de suscripción: Starter 49, Professional 149 y Clinic Premium 299 USD/mes (precios iniciales de prueba,
-- sin impuestos) y cobro recurrente automático con Stripe Billing. Los identificadores internos se conservan
-- (piloto = Starter, tecnologia = Professional, administrado = Clinic Premium).

alter table public.px_planes
  add column if not exists precio_anual_usd numeric(10, 2) check (precio_anual_usd >= 0),
  add column if not exists stripe_price_mensual text,
  add column if not exists stripe_price_anual text;

update public.px_planes set
  nombre = 'Starter', nombre_en = 'Starter', precio_mensual_usd = 49, destacado = false, orden = 1,
  descripcion = 'Para cirujanos que empiezan a captar pacientes internacionalmente.',
  descripcion_en = 'For surgeons starting to attract international patients.',
  beneficios = array['Perfil profesional verificado', 'Publicación de procedimientos', 'Recepción de solicitudes de valoración'],
  beneficios_en = array['Verified professional profile', 'Procedure listings', 'Consultation requests']
where id = 'piloto';

update public.px_planes set
  nombre = 'Professional', nombre_en = 'Professional', precio_mensual_usd = 149, destacado = true, orden = 2,
  descripcion = 'Para profesionales con actividad comercial recurrente.',
  descripcion_en = 'For professionals with recurring patient activity.',
  beneficios = array['Todo lo del plan Starter', 'Panel de oportunidades y seguimiento', 'Estadísticas de conversión', 'Gestión ampliada del perfil'],
  beneficios_en = array['Everything in Starter', 'Opportunity and follow-up dashboard', 'Conversion statistics', 'Extended profile management']
where id = 'tecnologia';

update public.px_planes set
  nombre = 'Clinic Premium', nombre_en = 'Clinic Premium', precio_mensual_usd = 299, destacado = false, orden = 3,
  descripcion = 'Para clínicas con varios profesionales y procedimientos.',
  descripcion_en = 'For clinics with several surgeons and procedures.',
  beneficios = array['Perfiles de varios cirujanos', 'Panel de equipo y oportunidades', 'Analítica avanzada', 'Herramientas de visibilidad y marketing'],
  beneficios_en = array['Multiple surgeon profiles', 'Team and opportunity dashboard', 'Advanced analytics', 'Visibility and marketing tools']
where id = 'administrado';

-- Datos de Stripe en la suscripción (los escribe solo el webhook, con la clave de servicio).
alter table public.px_suscripciones
  add column if not exists proveedor text not null default 'manual' check (proveedor in ('manual', 'stripe')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists stripe_estado text,
  add column if not exists intervalo text check (intervalo in ('mes', 'anio')),
  add column if not exists periodo_fin timestamptz;

-- Cliente de Stripe del médico, para reutilizarlo en renovaciones y en el portal de facturación.
alter table public.px_postulaciones add column if not exists stripe_customer_id text;

-- Si la clínica se queda sin ninguna suscripción vigente (impago tras los reintentos o cancelación),
-- se retira del sitio junto con sus cirujanos. Los datos se conservan para reactivarla al pagar.
create or replace function px_privado.px_suspender_sin_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.estado not in ('activa', 'prueba') and not exists (
    select 1 from public.px_suscripciones s where s.institucion_id = new.institucion_id and s.estado in ('activa', 'prueba') and s.id <> new.id
  ) then
    update public.px_instituciones set publicado = false where id = new.institucion_id and not es_demo;
    update public.px_profesionales p set publicado = false
    where not p.es_demo and exists (select 1 from public.px_profesional_institucion pi where pi.profesional_id = p.id and pi.institucion_id = new.institucion_id)
      and not exists (
        select 1 from public.px_profesional_institucion pi join public.px_suscripciones s on s.institucion_id = pi.institucion_id
        where pi.profesional_id = p.id and pi.institucion_id <> new.institucion_id and s.estado in ('activa', 'prueba')
      );
  end if;
  return new;
end
$$;

create or replace trigger px_suspender_sin_plan after insert or update of estado on public.px_suscripciones
  for each row execute function px_privado.px_suspender_sin_plan();
