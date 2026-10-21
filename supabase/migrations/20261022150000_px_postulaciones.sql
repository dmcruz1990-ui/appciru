-- Registro de cirujanos y clínicas desde «Para clínicas».
-- El médico crea su cuenta, envía su postulación y PLASTINEX la revisa. Al aprobarla se crean su perfil
-- profesional, su clínica y sus procedimientos SIN publicar (verificación en revisión), y su usuario recibe
-- el rol «clinica» para entrar al panel y atender sus solicitudes.

create table if not exists public.px_postulaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  -- Profesional
  nombre text not null check (char_length(nombre) between 3 and 120),
  telefono text not null check (char_length(telefono) between 7 and 30),
  especialidad text not null default 'Cirugía plástica, estética y reconstructiva' check (char_length(especialidad) <= 120),
  registro_profesional text not null check (char_length(registro_profesional) between 3 and 60),
  autoridad_registro text check (char_length(autoridad_registro) <= 120),
  sociedad text check (char_length(sociedad) <= 120),
  anios_experiencia int check (anios_experiencia between 0 and 60),
  idiomas text[] not null default '{}' check (cardinality(idiomas) <= 10),
  procedimientos text[] not null default '{}' check (cardinality(procedimientos) <= 20),
  valoracion_virtual boolean not null default false,
  bio text check (char_length(bio) <= 1500),
  -- Dónde opera
  pais text not null check (pais ~ '^[A-Z]{2}$'),
  ciudad_id text references public.px_ciudades(id) on delete set null,
  ciudad_otra text check (char_length(ciudad_otra) <= 80),
  institucion_nombre text not null check (char_length(institucion_nombre) between 3 and 120),
  institucion_tipo text not null default 'clinica' check (institucion_tipo in ('clinica', 'institucion', 'consultorio')),
  institucion_registro text check (char_length(institucion_registro) <= 60),
  sitio_web text check (char_length(sitio_web) <= 200),
  -- Declaraciones y revisión
  declara_en timestamptz not null,
  terminos_version text not null,
  estado text not null default 'nueva' check (estado in ('nueva', 'en_revision', 'aprobada', 'rechazada')),
  motivo text check (char_length(motivo) <= 600),
  profesional_id uuid references public.px_profesionales(id) on delete set null,
  institucion_id uuid references public.px_instituciones(id) on delete set null,
  revisado_por uuid references public.px_perfiles(id) on delete set null,
  revisado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  check (ciudad_id is not null or ciudad_otra is not null)
);

alter table public.px_postulaciones enable row level security;
revoke all on public.px_postulaciones from anon, authenticated;
grant select on public.px_postulaciones to authenticated;

-- Cada médico ve solo la suya; el equipo de PLASTINEX ve todas. Las escrituras van por las funciones.
create policy "postulante o staff lee" on public.px_postulaciones for select to authenticated
  using (usuario_id = auth.uid() or px_privado.px_es_staff());

-- Enviar o corregir la postulación propia (mientras no esté aprobada).
create or replace function public.px_postular(datos jsonb)
returns public.px_postulaciones
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
  v_actual public.px_postulaciones%rowtype;
  v_fila public.px_postulaciones%rowtype;
  v_ciudad text := nullif(datos->>'ciudad_id', '');
  v_otra text := nullif(trim(datos->>'ciudad_otra'), '');
  v_procs text[] := coalesce(array(select jsonb_array_elements_text(datos->'procedimientos')), '{}');
  v_idiomas text[] := coalesce(array(select trim(x) from jsonb_array_elements_text(datos->'idiomas') x where trim(x) <> ''), '{}');
  v_web text := nullif(trim(datos->>'sitio_web'), '');
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión para registrarte'; end if;
  if coalesce((datos->>'declara')::boolean, false) is not true then
    raise exception 'Debes aceptar las declaraciones para enviar tu registro';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  select * into v_actual from public.px_postulaciones where usuario_id = auth.uid();
  if found and v_actual.estado in ('aprobada', 'en_revision') then
    raise exception 'Tu registro ya está en revisión o aprobado. Escríbenos si necesitas cambiar algún dato.';
  end if;
  if v_ciudad is not null and not exists (select 1 from public.px_ciudades where id = v_ciudad) then
    raise exception 'Ciudad no válida';
  end if;
  if v_ciudad is null and v_otra is null then raise exception 'Indica la ciudad donde operas'; end if;
  if exists (select 1 from unnest(v_procs) p where not exists (select 1 from public.px_procedimientos x where x.id = p)) then
    raise exception 'Algún procedimiento no es válido';
  end if;
  if v_web is not null and v_web !~* '^https?://[^\s]+$' then raise exception 'El sitio web debe empezar por http:// o https://'; end if;

  insert into public.px_postulaciones as p (
    usuario_id, email, nombre, telefono, especialidad, registro_profesional, autoridad_registro, sociedad,
    anios_experiencia, idiomas, procedimientos, valoracion_virtual, bio, pais, ciudad_id, ciudad_otra,
    institucion_nombre, institucion_tipo, institucion_registro, sitio_web, declara_en, terminos_version
  ) values (
    auth.uid(), v_email, trim(datos->>'nombre'), trim(datos->>'telefono'),
    coalesce(nullif(trim(datos->>'especialidad'), ''), 'Cirugía plástica, estética y reconstructiva'),
    trim(datos->>'registro_profesional'), nullif(trim(datos->>'autoridad_registro'), ''), nullif(trim(datos->>'sociedad'), ''),
    nullif(datos->>'anios_experiencia', '')::int, v_idiomas, v_procs, coalesce((datos->>'valoracion_virtual')::boolean, false),
    nullif(trim(datos->>'bio'), ''), upper(datos->>'pais'), v_ciudad, case when v_ciudad is null then v_otra end,
    trim(datos->>'institucion_nombre'), coalesce(nullif(datos->>'institucion_tipo', ''), 'clinica'),
    nullif(trim(datos->>'institucion_registro'), ''), v_web, now(), px_privado.px_version_terminos()
  )
  on conflict (usuario_id) do update set
    email = excluded.email, nombre = excluded.nombre, telefono = excluded.telefono, especialidad = excluded.especialidad,
    registro_profesional = excluded.registro_profesional, autoridad_registro = excluded.autoridad_registro,
    sociedad = excluded.sociedad, anios_experiencia = excluded.anios_experiencia, idiomas = excluded.idiomas,
    procedimientos = excluded.procedimientos, valoracion_virtual = excluded.valoracion_virtual, bio = excluded.bio,
    pais = excluded.pais, ciudad_id = excluded.ciudad_id, ciudad_otra = excluded.ciudad_otra,
    institucion_nombre = excluded.institucion_nombre, institucion_tipo = excluded.institucion_tipo,
    institucion_registro = excluded.institucion_registro, sitio_web = excluded.sitio_web,
    declara_en = excluded.declara_en, terminos_version = excluded.terminos_version,
    estado = 'nueva', motivo = null, actualizado_en = now()
  returning * into v_fila;
  return v_fila;
end
$$;

-- Revisión por el equipo de PLASTINEX: en_revision, aprobada (crea los registros sin publicar) o rechazada.
create or replace function public.px_revisar_postulacion(p_id uuid, p_estado text, p_motivo text default null, p_ciudad_id text default null)
returns public.px_postulaciones
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.px_postulaciones%rowtype;
  v_ciudad text;
  v_prof uuid;
  v_inst uuid;
begin
  if not px_privado.px_es_staff() then raise exception 'Solo el equipo de PLASTINEX revisa registros'; end if;
  if p_estado not in ('en_revision', 'aprobada', 'rechazada') then raise exception 'Estado no válido'; end if;
  select * into v from public.px_postulaciones where id = p_id for update;
  if not found then raise exception 'Registro no encontrado'; end if;
  if v.estado = 'aprobada' then raise exception 'Este registro ya fue aprobado'; end if;
  if p_estado = 'rechazada' and nullif(trim(p_motivo), '') is null then raise exception 'Indica el motivo del rechazo'; end if;

  if p_estado = 'aprobada' then
    v_ciudad := coalesce(nullif(p_ciudad_id, ''), v.ciudad_id);
    if v_ciudad is null or not exists (select 1 from public.px_ciudades where id = v_ciudad) then
      raise exception 'Elige la ciudad (créala antes en Catálogo → Ciudades si no existe)';
    end if;
    insert into public.px_instituciones (nombre, tipo, ciudad_id, codigo_reps, sitio_web, verificacion, es_demo, publicado)
    values (v.institucion_nombre, v.institucion_tipo, v_ciudad, v.institucion_registro, v.sitio_web, 'en_revision', false, false)
    returning id into v_inst;
    insert into public.px_profesionales (nombre, especialidad, ciudad_id, rethus, sociedad, anios_experiencia, idiomas, bio, valoracion_virtual, verificacion, es_demo, publicado)
    values (v.nombre, v.especialidad, v_ciudad, v.registro_profesional, v.sociedad, v.anios_experiencia,
            case when cardinality(v.idiomas) > 0 then v.idiomas else '{Español}' end, coalesce(v.bio, ''), v.valoracion_virtual, 'en_revision', false, false)
    returning id into v_prof;
    insert into public.px_profesional_institucion (profesional_id, institucion_id) values (v_prof, v_inst);
    insert into public.px_ofertas (procedimiento_id, institucion_id, profesional_id, publicado)
    select unnest(v.procedimientos), v_inst, v_prof, false;
    -- Acceso al panel con rol de clínica (sin rebajar a quien ya es del equipo).
    insert into public.px_perfiles (id, email, nombre, rol, institucion_id)
    values (v.usuario_id, v.email, v.nombre, 'clinica', v_inst)
    on conflict (id) do update set
      nombre = coalesce(public.px_perfiles.nombre, excluded.nombre),
      rol = case when public.px_perfiles.rol in ('admin', 'coordinador') then public.px_perfiles.rol else 'clinica' end,
      institucion_id = case when public.px_perfiles.rol in ('admin', 'coordinador') then public.px_perfiles.institucion_id else v_inst end;
  end if;

  update public.px_postulaciones set
    estado = p_estado,
    motivo = nullif(trim(p_motivo), ''),
    ciudad_id = coalesce(v_ciudad, ciudad_id),
    profesional_id = coalesce(v_prof, profesional_id),
    institucion_id = coalesce(v_inst, institucion_id),
    revisado_por = auth.uid(),
    revisado_en = now(),
    actualizado_en = now()
  where id = p_id
  returning * into v;
  return v;
end
$$;

revoke execute on function public.px_postular(jsonb), public.px_revisar_postulacion(uuid, text, text, text) from public, anon;
grant execute on function public.px_postular(jsonb), public.px_revisar_postulacion(uuid, text, text, text) to authenticated;
