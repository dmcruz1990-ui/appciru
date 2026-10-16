-- PLASTINEX · búsqueda por presupuesto y datos de confianza de cada institución.

-- El paciente puede indicar cuánto quiere invertir; la clínica lo ve en el CRM.
alter table public.px_solicitudes add column presupuesto bigint check (presupuesto is null or presupuesto > 0);

-- Datos comerciales que el paciente compara (inspirado en directorios como clinicasesteticas.com.co).
alter table public.px_instituciones
  add column financiacion boolean not null default false,
  add column valoracion_precio bigint check (valoracion_precio is null or valoracion_precio >= 0);
comment on column public.px_instituciones.valoracion_precio is 'Valor de la primera valoración en COP; 0 = gratis; null = no informado';

update public.px_instituciones set financiacion = true, valoracion_precio = 0 where nombre in ('Clínica Demo Circunvalar', 'Clínica Demo Quindío');
update public.px_instituciones set valoracion_precio = 120000 where nombre = 'Centro Quirúrgico Demo Pinares';
update public.px_instituciones set financiacion = true where nombre = 'Institución Demo Dosquebradas';

-- Tiempo de primera respuesta (mediana, horas) por institución. Solo cifras agregadas, sin datos de pacientes.
create or replace function public.px_tiempos_respuesta()
returns table (institucion_id uuid, mediana_horas numeric, solicitudes bigint)
language sql stable security definer set search_path = ''
as $$
  select s.institucion_id,
         round((percentile_cont(0.5) within group (order by extract(epoch from (s.primera_respuesta_en - s.creado_en)) / 3600))::numeric, 1),
         count(*)
  from public.px_solicitudes s
  where s.institucion_id is not null and s.primera_respuesta_en is not null
  group by s.institucion_id
  having count(*) >= 3
$$;
revoke execute on function public.px_tiempos_respuesta() from public;
grant execute on function public.px_tiempos_respuesta() to anon, authenticated;

-- Crear solicitud: acepta además el presupuesto del paciente.
create or replace function public.px_crear_solicitud(datos jsonb)
returns text language plpgsql security definer set search_path = ''
as $$
declare
  v_codigo text;
  v_pac public.px_pacientes%rowtype;
  v_email text;
  v_oferta public.px_ofertas%rowtype;
  v_ciudad text := nullif(datos->>'ciudad_id', '');
  v_proc text := nullif(datos->>'procedimiento_id', '');
  v_presupuesto bigint := nullif(datos->>'presupuesto', '')::bigint;
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión para solicitar una valoración'; end if;
  select * into v_pac from public.px_pacientes where id = auth.uid();
  if not found or v_pac.terminos_version <> px_privado.px_version_terminos() then
    raise exception 'Debes aceptar los términos vigentes antes de enviar la solicitud';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  if length(coalesce(datos->>'mensaje', '')) > 600 then raise exception 'El mensaje es demasiado largo'; end if;
  if v_presupuesto is not null and (v_presupuesto < 100000 or v_presupuesto > 1000000000) then raise exception 'Presupuesto inválido'; end if;
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
    consentimiento_en, consentimiento_version
  ) values (
    v_codigo, auth.uid(), v_pac.nombre, v_email, v_pac.telefono, v_pac.pais,
    v_proc, v_oferta.id, v_oferta.institucion_id, v_oferta.profesional_id,
    v_ciudad, nullif(datos->>'fecha_tentativa', '')::date,
    nullif(datos->>'alojamiento_id', '')::uuid,
    case when nullif(datos->>'alojamiento_id', '') is null then null else nullif(datos->>'noches', '')::int end,
    coalesce(array(select jsonb_array_elements_text(datos->'servicio_ids')), '{}'),
    nullif(trim(datos->>'mensaje'), ''),
    coalesce(nullif(datos->>'canal', ''), 'web'),
    datos->'utm', v_presupuesto,
    v_pac.terminos_aceptados_en, v_pac.terminos_version
  ) returning id into v_id;

  insert into public.px_solicitud_eventos (solicitud_id, tipo, etapa, texto)
  values (v_id, 'sistema', 'nueva', 'Solicitud recibida desde ' || coalesce(nullif(datos->>'canal', ''), 'web')
    || case when v_presupuesto is not null then ' · presupuesto del paciente: $' || to_char(v_presupuesto, 'FM999G999G999') else '' end);
  return v_codigo;
end
$$;
revoke execute on function public.px_crear_solicitud(jsonb) from anon, public;
grant execute on function public.px_crear_solicitud(jsonb) to authenticated;
