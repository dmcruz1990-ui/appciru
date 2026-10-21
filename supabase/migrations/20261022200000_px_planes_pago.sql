-- Planes de pago para médicos y clínicas. Flujo: registro → verificación → aprobación → el médico elige plan
-- y paga → PLASTINEX confirma el pago (suscripción activa) → recién entonces la clínica se puede publicar.

-- Lo que ve el médico de cada plan. Los identificadores son los mismos de px_suscripciones.plan.
-- PLASTINEX fija precios y enlace de pago (Stripe, Mercado Pago, Wompi…) desde el panel.
create table if not exists public.px_planes (
  id text primary key check (id in ('piloto', 'tecnologia', 'administrado')),
  nombre text not null,
  nombre_en text,
  descripcion text not null default '',
  descripcion_en text,
  beneficios text[] not null default '{}',
  beneficios_en text[] not null default '{}',
  precio_mensual_usd numeric(10, 2) check (precio_mensual_usd >= 0),
  cuota_inicial_usd numeric(10, 2) check (cuota_inicial_usd >= 0),
  enlace_pago text check (enlace_pago is null or enlace_pago ~* '^https://'),
  destacado boolean not null default false,
  activo boolean not null default true,
  orden int not null default 0
);
alter table public.px_planes enable row level security;
create policy "publico lee planes activos" on public.px_planes for select using (activo or px_privado.px_es_staff());
create policy "admin gestiona planes" on public.px_planes for all to authenticated using (px_privado.px_es_admin()) with check (px_privado.px_es_admin());
grant select on public.px_planes to anon, authenticated;
grant insert, update, delete on public.px_planes to authenticated;

insert into public.px_planes (id, nombre, nombre_en, descripcion, descripcion_en, beneficios, beneficios_en, destacado, orden) values
  ('piloto', 'Piloto', 'Pilot',
   'Para empezar: tu perfil publicado y las solicitudes de pacientes en tu panel.',
   'To get started: your published profile and patient requests in your dashboard.',
   array['Perfil verificado del cirujano y la clínica', 'Aparición en el buscador y el mapa', 'Solicitudes de valoración en tu panel'],
   array['Verified surgeon and clinic profile', 'Listing in search and on the map', 'Consultation requests in your dashboard'], false, 1),
  ('tecnologia', 'Suscripción tecnológica', 'Technology subscription',
   'La plataforma completa para gestionar y medir tus leads.',
   'The full platform to manage and measure your leads.',
   array['Todo lo del plan Piloto', 'CRM con etapas, responsables y trazabilidad', 'Métricas de respuesta, citas y conversión', 'Galería de fotos y procedimientos ilimitados'],
   array['Everything in Pilot', 'CRM with stages, owners and traceability', 'Response, appointment and conversion metrics', 'Photo gallery and unlimited procedures'], true, 2),
  ('administrado', 'Servicio administrado', 'Managed service',
   'Nuestro equipo atiende y hace seguimiento de tus leads por ti.',
   'Our team handles and follows up on your leads for you.',
   array['Todo lo de la Suscripción tecnológica', 'Coordinador de pacientes de PLASTINEX', 'Primera respuesta y agenda de valoraciones', 'Informe mensual de resultados'],
   array['Everything in Technology', 'PLASTINEX patient coordinator', 'First response and consultation scheduling', 'Monthly results report'], false, 3)
on conflict (id) do nothing;

-- Estado del pago en el registro del médico.
alter table public.px_postulaciones
  add column if not exists plan_id text references public.px_planes(id),
  add column if not exists pago_estado text not null default 'sin_plan' check (pago_estado in ('sin_plan', 'pendiente', 'pagado')),
  add column if not exists plan_elegido_en timestamptz,
  add column if not exists pago_confirmado_en timestamptz;

-- El médico aprobado elige su plan; devuelve el plan (con su enlace de pago, si existe).
create or replace function public.px_elegir_plan(p_plan text)
returns public.px_planes
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.px_postulaciones%rowtype;
  v_plan public.px_planes%rowtype;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  select * into v from public.px_postulaciones where usuario_id = auth.uid();
  if not found or v.estado <> 'aprobada' then raise exception 'Primero debemos aprobar tu registro'; end if;
  if v.pago_estado = 'pagado' then raise exception 'Tu plan ya está activo. Escríbenos para cambiarlo.'; end if;
  select * into v_plan from public.px_planes where id = p_plan and activo;
  if not found then raise exception 'Plan no disponible'; end if;
  update public.px_postulaciones set plan_id = p_plan, pago_estado = 'pendiente', plan_elegido_en = now(), actualizado_en = now()
  where id = v.id;
  return v_plan;
end
$$;

-- PLASTINEX confirma el pago: crea o reactiva la suscripción de la clínica.
create or replace function public.px_confirmar_pago(p_postulacion uuid)
returns public.px_postulaciones
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.px_postulaciones%rowtype;
  v_plan public.px_planes%rowtype;
  v_tasa numeric := coalesce((select valor from public.px_ajustes where clave = 'tasa_usd_cop'), 0);
begin
  if not px_privado.px_es_staff() then raise exception 'Solo el equipo de PLASTINEX confirma pagos'; end if;
  select * into v from public.px_postulaciones where id = p_postulacion for update;
  if not found or v.estado <> 'aprobada' or v.institucion_id is null then raise exception 'El registro debe estar aprobado'; end if;
  if v.plan_id is null then raise exception 'El médico aún no eligió plan'; end if;
  select * into v_plan from public.px_planes where id = v.plan_id;
  insert into public.px_suscripciones (institucion_id, plan, cuota_instalacion, cuota_mensual, estado, inicio, notas)
  values (v.institucion_id, v.plan_id,
          round(coalesce(v_plan.cuota_inicial_usd, 0) * v_tasa), round(coalesce(v_plan.precio_mensual_usd, 0) * v_tasa),
          'activa', current_date, 'Pago confirmado desde Registros de médicos');
  update public.px_postulaciones set pago_estado = 'pagado', pago_confirmado_en = now(), actualizado_en = now()
  where id = v.id returning * into v;
  return v;
end
$$;

revoke execute on function public.px_elegir_plan(text), public.px_confirmar_pago(uuid) from public, anon;
grant execute on function public.px_elegir_plan(text), public.px_confirmar_pago(uuid) to authenticated;

-- Solo se publica una clínica real con plan activo o en prueba (los perfiles de demostración quedan exentos).
create or replace function px_privado.px_exigir_plan()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.publicado and not new.es_demo and (tg_op = 'INSERT' or not old.publicado) then
    if tg_table_name = 'px_instituciones' and not exists (
      select 1 from public.px_suscripciones s where s.institucion_id = new.id and s.estado in ('activa', 'prueba')
    ) then
      raise exception 'Esta clínica necesita un plan activo para publicarse';
    end if;
    if tg_table_name = 'px_profesionales' and not exists (
      select 1 from public.px_profesional_institucion pi join public.px_suscripciones s on s.institucion_id = pi.institucion_id
      where pi.profesional_id = new.id and s.estado in ('activa', 'prueba')
    ) then
      raise exception 'Este cirujano necesita una clínica con plan activo para publicarse';
    end if;
  end if;
  return new;
end
$$;

create or replace trigger px_exigir_plan before insert or update of publicado on public.px_instituciones
  for each row execute function px_privado.px_exigir_plan();
create or replace trigger px_exigir_plan before insert or update of publicado on public.px_profesionales
  for each row execute function px_privado.px_exigir_plan();
