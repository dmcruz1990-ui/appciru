-- PLASTINEX · cuentas de paciente, aceptación de términos e imágenes.

-- Versión vigente de los documentos legales que el paciente acepta al registrarse.
create or replace function px_privado.px_version_terminos()
returns text language sql immutable set search_path = ''
as $$ select 'v1-2026-10' $$;
grant execute on function px_privado.px_version_terminos() to anon, authenticated;

create table public.px_pacientes (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text not null,
  pais text not null default 'Colombia',
  terminos_version text not null,
  terminos_aceptados_en timestamptz not null,
  intermediacion_aceptada_en timestamptz not null,
  confidencialidad_aceptada_en timestamptz not null,
  datos_sensibles_autorizado_en timestamptz not null,
  ip_registro text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.px_pacientes enable row level security;
create policy "paciente ve su ficha" on public.px_pacientes for select to authenticated
  using (id = auth.uid() or px_privado.px_es_staff());

alter table public.px_solicitudes add column paciente_id uuid references auth.users(id) on delete set null;
create index px_solicitudes_paciente_idx on public.px_solicitudes (paciente_id);

alter table public.px_procedimientos add column imagen_url text;

-- Registra (o actualiza) la ficha del paciente autenticado con la aceptación explícita de los documentos.
create or replace function public.px_registrar_paciente(datos jsonb)
returns public.px_pacientes language plpgsql security definer set search_path = ''
as $$
declare
  v public.px_pacientes;
  v_nombre text := trim(datos->>'nombre');
  v_tel text := trim(datos->>'telefono');
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if v_nombre is null or length(v_nombre) < 2 or length(v_nombre) > 80 then raise exception 'Nombre inválido'; end if;
  if v_tel is null or length(v_tel) < 7 or length(v_tel) > 30 then raise exception 'Teléfono inválido'; end if;
  if not (coalesce((datos->>'acepta_terminos')::boolean, false)
          and coalesce((datos->>'acepta_intermediacion')::boolean, false)
          and coalesce((datos->>'acepta_confidencialidad')::boolean, false)
          and coalesce((datos->>'autoriza_datos')::boolean, false)) then
    raise exception 'Debes aceptar todos los documentos para continuar';
  end if;

  insert into public.px_pacientes as p (id, nombre, telefono, pais, terminos_version, terminos_aceptados_en,
    intermediacion_aceptada_en, confidencialidad_aceptada_en, datos_sensibles_autorizado_en)
  values (auth.uid(), v_nombre, v_tel, coalesce(nullif(datos->>'pais', ''), 'Colombia'), px_privado.px_version_terminos(),
    now(), now(), now(), now())
  on conflict (id) do update set
    nombre = excluded.nombre, telefono = excluded.telefono, pais = excluded.pais,
    terminos_version = excluded.terminos_version, terminos_aceptados_en = excluded.terminos_aceptados_en,
    intermediacion_aceptada_en = excluded.intermediacion_aceptada_en,
    confidencialidad_aceptada_en = excluded.confidencialidad_aceptada_en,
    datos_sensibles_autorizado_en = excluded.datos_sensibles_autorizado_en,
    actualizado_en = now()
  returning * into v;
  return v;
end
$$;

-- Ficha del paciente actual (null si aún no completó el registro).
create or replace function public.px_mi_paciente()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select to_jsonb(p) || jsonb_build_object('terminos_vigentes', p.terminos_version = px_privado.px_version_terminos())
  from public.px_pacientes p where p.id = auth.uid()
$$;

-- Vista pública de una solicitud (sin notas internas), reutilizada por las consultas del paciente.
create or replace function px_privado.px_solicitud_publica(s public.px_solicitudes)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'codigo', s.codigo, 'creado_en', s.creado_en, 'etapa', s.etapa,
    'nombre', split_part(s.nombre, ' ', 1),
    'procedimiento', (select nombre from public.px_procedimientos where id = s.procedimiento_id),
    'institucion', (select nombre from public.px_instituciones where id = s.institucion_id),
    'profesional', (select nombre from public.px_profesionales where id = s.profesional_id),
    'ciudad', (select nombre from public.px_ciudades where id = s.ciudad_id),
    'fecha_tentativa', s.fecha_tentativa, 'cita_valoracion_en', s.cita_valoracion_en,
    'alojamiento', (select nombre from public.px_alojamientos where id = s.alojamiento_id),
    'noches', s.noches,
    'servicios', (select coalesce(jsonb_agg(sv.nombre), '[]'::jsonb) from public.px_servicios sv where sv.id = any(s.servicio_ids)),
    'eventos', (
      select coalesce(jsonb_agg(jsonb_build_object('creado_en', e.creado_en, 'tipo', e.tipo, 'etapa', e.etapa, 'texto', e.texto) order by e.creado_en), '[]'::jsonb)
      from public.px_solicitud_eventos e
      where e.solicitud_id = s.id and e.tipo in ('sistema', 'etapa', 'mensaje_paciente')
    )
  )
$$;

create or replace function public.px_mis_solicitudes()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(px_privado.px_solicitud_publica(s) order by s.creado_en desc), '[]'::jsonb)
  from public.px_solicitudes s where s.paciente_id = auth.uid()
$$;

-- Crear solicitud ahora exige sesión y términos vigentes; los datos de contacto salen de la ficha del paciente.
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
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión para solicitar una valoración'; end if;
  select * into v_pac from public.px_pacientes where id = auth.uid();
  if not found or v_pac.terminos_version <> px_privado.px_version_terminos() then
    raise exception 'Debes aceptar los términos vigentes antes de enviar la solicitud';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  if length(coalesce(datos->>'mensaje', '')) > 600 then raise exception 'El mensaje es demasiado largo'; end if;
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
    ciudad_id, fecha_tentativa, alojamiento_id, noches, servicio_ids, mensaje, canal, utm,
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
    datos->'utm',
    v_pac.terminos_aceptados_en, v_pac.terminos_version
  ) returning id into v_id;

  insert into public.px_solicitud_eventos (solicitud_id, tipo, etapa, texto)
  values (v_id, 'sistema', 'nueva', 'Solicitud recibida desde ' || coalesce(nullif(datos->>'canal', ''), 'web'));
  return v_codigo;
end
$$;

revoke execute on function public.px_crear_solicitud(jsonb) from anon, public;
revoke execute on function public.px_consultar_solicitud(text, text) from anon, public;
revoke execute on function public.px_registrar_paciente(jsonb) from anon, public;
revoke execute on function public.px_mi_paciente() from anon, public;
revoke execute on function public.px_mis_solicitudes() from anon, public;
revoke execute on function px_privado.px_solicitud_publica(public.px_solicitudes) from anon, public;
grant execute on function public.px_crear_solicitud(jsonb), public.px_registrar_paciente(jsonb), public.px_mi_paciente(), public.px_mis_solicitudes() to authenticated;
grant execute on function px_privado.px_solicitud_publica(public.px_solicitudes) to authenticated;

-- Imágenes del catálogo: bucket público de lectura; solo el staff sube o borra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('px-imagenes', 'px-imagenes', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "px staff sube imagenes" on storage.objects for insert to authenticated
  with check (bucket_id = 'px-imagenes' and px_privado.px_es_staff());
create policy "px staff actualiza imagenes" on storage.objects for update to authenticated
  using (bucket_id = 'px-imagenes' and px_privado.px_es_staff());
create policy "px staff borra imagenes" on storage.objects for delete to authenticated
  using (bucket_id = 'px-imagenes' and px_privado.px_es_staff());

-- Imágenes provisionales de banco (Unsplash) por procedimiento; se reemplazan desde el panel.
update public.px_procedimientos set imagen_url = 'https://images.unsplash.com/photo-' || v.foto
from (values
  ('mamoplastia-aumento', '1576091160399-112ba8d25d1d'),
  ('mamoplastia-reduccion', '1519494026892-80bbd2d6fd0d'),
  ('mastopexia', '1629909613654-28e377c37b09'),
  ('lipoescultura', '1559757175-0eb30cd8c063'),
  ('lipoabdominoplastia', '1579684385127-1ef15d508118'),
  ('abdominoplastia', '1586773860418-d37222d8fce3'),
  ('gluteoplastia', '1587351021759-3e566b6af7cc'),
  ('rinoplastia', '1584982751601-97dcc096659c'),
  ('blefaroplastia', '1612349317150-e413f6a5b16d'),
  ('lifting-facial', '1629909613654-28e377c37b09')
) v(id, foto) where px_procedimientos.id = v.id;
