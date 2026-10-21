-- Endurecimiento tras la auditoría de seguridad (fase 2 del plan técnico).

-- 1. Una clínica o un coordinador solo puede cambiar los campos de seguimiento de una solicitud.
--    Antes, el permiso de UPDATE cubría todas las columnas (paciente, correo, consentimiento…).
revoke update on public.px_solicitudes from authenticated;
grant update (etapa, asignado_a, cita_valoracion_en, asistio, motivo_cierre) on public.px_solicitudes to authenticated;
-- Las solicitudes solo se crean con px_crear_solicitud (que valida sesión, términos y límites).
revoke insert on public.px_solicitudes from anon, authenticated;

-- Solo el equipo de PLASTINEX asigna responsables; una clínica no puede reasignar.
create or replace function px_privado.px_solicitud_cambio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.asignado_a is distinct from old.asignado_a and not px_privado.px_es_staff() then
    raise exception 'Solo el equipo de coordinación puede asignar responsables';
  end if;
  new.actualizado_en := now();
  if new.etapa is distinct from old.etapa then
    insert into public.px_solicitud_eventos (solicitud_id, autor_id, tipo, etapa)
    values (new.id, auth.uid(), 'etapa', new.etapa);
    if old.etapa = 'nueva' and new.primera_respuesta_en is null then
      new.primera_respuesta_en := now();
    end if;
  end if;
  return new;
end
$$;

-- 2. Reintentos sin duplicados: el navegador envía una clave por intento; si la red falla y la
--    persona vuelve a enviar, se devuelve el mismo código en lugar de crear otra solicitud.
alter table public.px_solicitudes add column if not exists clave_cliente uuid;
create unique index if not exists px_solicitudes_clave_cliente on public.px_solicitudes (paciente_id, clave_cliente) where clave_cliente is not null;

create or replace function public.px_crear_solicitud(datos jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_codigo text;
  v_pac public.px_pacientes%rowtype;
  v_email text;
  v_oferta public.px_ofertas%rowtype;
  v_ciudad text := nullif(datos->>'ciudad_id', '');
  v_proc text := nullif(datos->>'procedimiento_id', '');
  v_presupuesto bigint := nullif(datos->>'presupuesto', '')::bigint;
  v_clave uuid := nullif(datos->>'clave', '')::uuid;
  v_aloj uuid := nullif(datos->>'alojamiento_id', '')::uuid;
  v_noches int := nullif(datos->>'noches', '')::int;
  v_fecha date := nullif(datos->>'fecha_tentativa', '')::date;
  v_servicios text[] := coalesce(array(select jsonb_array_elements_text(datos->'servicio_ids')), '{}');
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión para solicitar una valoración'; end if;
  select * into v_pac from public.px_pacientes where id = auth.uid();
  if not found or v_pac.terminos_version <> px_privado.px_version_terminos() then
    raise exception 'Debes aceptar los términos vigentes antes de enviar la solicitud';
  end if;

  -- Reintento del mismo envío: devolver la solicitud ya creada.
  if v_clave is not null then
    select codigo into v_codigo from public.px_solicitudes where paciente_id = auth.uid() and clave_cliente = v_clave;
    if found then return v_codigo; end if;
  end if;

  select lower(email) into v_email from auth.users where id = auth.uid();
  if length(coalesce(datos->>'mensaje', '')) > 600 then raise exception 'El mensaje es demasiado largo'; end if;
  if v_presupuesto is not null and (v_presupuesto < 100000 or v_presupuesto > 1000000000) then raise exception 'Presupuesto inválido'; end if;
  if v_fecha is not null and (v_fecha < current_date or v_fecha > current_date + interval '3 years') then raise exception 'Fecha tentativa inválida'; end if;
  if v_aloj is not null and not exists (select 1 from public.px_alojamientos where id = v_aloj and publicado) then
    raise exception 'El alojamiento seleccionado ya no está disponible';
  end if;
  if v_aloj is not null and v_noches is not null and (v_noches < 1 or v_noches > 90) then raise exception 'Número de noches inválido'; end if;
  if cardinality(v_servicios) > 20 or exists (select 1 from unnest(v_servicios) s where not exists (select 1 from public.px_servicios x where x.id = s and x.publicado)) then
    raise exception 'Algún servicio seleccionado no está disponible';
  end if;
  if (select count(*) from public.px_solicitudes where paciente_id = auth.uid() and creado_en > now() - interval '1 hour') >= 5 then
    raise exception 'Demasiadas solicitudes. Intenta más tarde.';
  end if;

  if nullif(datos->>'oferta_id', '') is not null then
    select * into v_oferta from public.px_ofertas where id = (datos->>'oferta_id')::uuid and publicado;
    if not found then raise exception 'La opción seleccionada ya no está disponible'; end if;
    v_proc := v_oferta.procedimiento_id;
    select ciudad_id into v_ciudad from public.px_instituciones where id = v_oferta.institucion_id;
  end if;

  loop
    v_codigo := 'PX-' || upper(substr(translate(encode(extensions.gen_random_bytes(6), 'base64'), '+/=0O1Il', ''), 1, 6));
    exit when length(v_codigo) = 9 and not exists (select 1 from public.px_solicitudes where codigo = v_codigo);
  end loop;

  insert into public.px_solicitudes (
    codigo, paciente_id, nombre, email, telefono, pais, procedimiento_id, oferta_id, institucion_id, profesional_id,
    ciudad_id, fecha_tentativa, alojamiento_id, noches, servicio_ids, mensaje, canal, utm, presupuesto,
    consentimiento_en, consentimiento_version, clave_cliente
  ) values (
    v_codigo, auth.uid(), v_pac.nombre, v_email, v_pac.telefono, v_pac.pais,
    v_proc, v_oferta.id, v_oferta.institucion_id, v_oferta.profesional_id,
    v_ciudad, v_fecha, v_aloj,
    case when v_aloj is null then null else v_noches end,
    v_servicios,
    nullif(trim(datos->>'mensaje'), ''),
    coalesce(nullif(datos->>'canal', ''), 'web'),
    datos->'utm', v_presupuesto,
    v_pac.terminos_aceptados_en, v_pac.terminos_version, v_clave
  ) returning id into v_id;

  insert into public.px_solicitud_eventos (solicitud_id, tipo, etapa, texto)
  values (v_id, 'sistema', 'nueva', 'Solicitud recibida desde ' || coalesce(nullif(datos->>'canal', ''), 'web')
    || case when v_presupuesto is not null then ' · presupuesto del paciente: $' || to_char(v_presupuesto, 'FM999G999G999') else '' end);
  return v_codigo;
end
$$;

-- 3. Restos de trabajo interno: sin acceso desde la API pública.
revoke all on public.px_tmp_vista from anon, authenticated;
revoke all on px_privado.demo_coordenadas, px_privado.demo_paises, px_privado.demo_destinos from anon, authenticated, public;
