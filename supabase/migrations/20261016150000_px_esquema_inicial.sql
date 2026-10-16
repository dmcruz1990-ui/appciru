-- PLASTINEX · esquema inicial
-- Todas las tablas usan el prefijo px_ porque conviven con otra aplicación en el mismo proyecto.

-- ============ Catálogo ============

create table public.px_ciudades (
  id text primary key,
  nombre text not null,
  departamento text not null,
  orden int not null default 0,
  activa boolean not null default true
);

create table public.px_procedimientos (
  id text primary key,
  nombre text not null,
  categoria text not null check (categoria in ('mamaria', 'corporal', 'facial')),
  descripcion text not null default '',
  duracion_aprox text,
  anestesia text,
  recuperacion text,
  estadia_sugerida_dias int,
  orden int not null default 0,
  publicado boolean not null default true
);

create table public.px_instituciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'clinica' check (tipo in ('clinica', 'institucion', 'consultorio')),
  ciudad_id text not null references public.px_ciudades(id),
  direccion text,
  descripcion text not null default '',
  codigo_reps text,
  servicios text[] not null default '{}',
  imagen_url text,
  telefono_publico text,
  sitio_web text,
  verificacion text not null default 'pendiente' check (verificacion in ('pendiente', 'en_revision', 'verificado', 'rechazado')),
  verificacion_notas text,
  verificado_en timestamptz,
  verificado_por uuid,
  es_demo boolean not null default false,
  publicado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.px_profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad text not null default 'Cirugía plástica, estética y reconstructiva',
  ciudad_id text not null references public.px_ciudades(id),
  rethus text,
  sociedad text,
  anios_experiencia int,
  idiomas text[] not null default '{Español}',
  bio text not null default '',
  valoracion_virtual boolean not null default false,
  foto_url text,
  verificacion text not null default 'pendiente' check (verificacion in ('pendiente', 'en_revision', 'verificado', 'rechazado')),
  verificacion_notas text,
  verificado_en timestamptz,
  verificado_por uuid,
  es_demo boolean not null default false,
  publicado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table public.px_profesional_institucion (
  profesional_id uuid not null references public.px_profesionales(id) on delete cascade,
  institucion_id uuid not null references public.px_instituciones(id) on delete cascade,
  primary key (profesional_id, institucion_id)
);

-- Una oferta: quién hace qué procedimiento, dónde y con qué rango orientativo.
create table public.px_ofertas (
  id uuid primary key default gen_random_uuid(),
  procedimiento_id text not null references public.px_procedimientos(id),
  institucion_id uuid not null references public.px_instituciones(id) on delete cascade,
  profesional_id uuid references public.px_profesionales(id) on delete set null,
  precio_min bigint check (precio_min is null or precio_min > 0),
  precio_max bigint check (precio_max is null or precio_max > 0),
  incluye text,
  no_incluye text,
  precio_actualizado_en date,
  publicado boolean not null default false,
  creado_en timestamptz not null default now(),
  check (precio_min is null or precio_max is null or precio_min <= precio_max)
);

create table public.px_alojamientos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('casa_recobro', 'hotel', 'apartamento')),
  ciudad_id text not null references public.px_ciudades(id),
  descripcion text not null default '',
  precio_noche_desde bigint,
  incluye_enfermeria boolean not null default false,
  incluye_alimentacion boolean not null default false,
  es_demo boolean not null default false,
  publicado boolean not null default false
);

create table public.px_servicios (
  id text primary key,
  nombre text not null,
  descripcion text not null default '',
  precio_desde bigint,
  unidad text not null default 'servicio' check (unidad in ('servicio', 'dia')),
  orden int not null default 0,
  publicado boolean not null default true
);

-- ============ Usuarios internos ============

create table public.px_perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nombre text,
  rol text not null default 'pendiente' check (rol in ('pendiente', 'admin', 'coordinador', 'clinica')),
  institucion_id uuid references public.px_instituciones(id) on delete set null,
  creado_en timestamptz not null default now()
);

-- ============ Solicitudes (CRM) ============

create table public.px_solicitudes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- contacto (datos mínimos; sin información clínica)
  nombre text not null,
  email text not null,
  telefono text not null,
  pais text not null default 'Colombia',
  -- interés
  procedimiento_id text references public.px_procedimientos(id),
  oferta_id uuid references public.px_ofertas(id) on delete set null,
  institucion_id uuid references public.px_instituciones(id) on delete set null,
  profesional_id uuid references public.px_profesionales(id) on delete set null,
  ciudad_id text references public.px_ciudades(id),
  fecha_tentativa date,
  -- plan complementario
  alojamiento_id uuid references public.px_alojamientos(id) on delete set null,
  noches int check (noches is null or noches between 1 and 60),
  servicio_ids text[] not null default '{}',
  mensaje text,
  -- origen
  canal text not null default 'web',
  utm jsonb,
  -- consentimiento (Ley 1581 de 2012)
  consentimiento_en timestamptz not null,
  consentimiento_version text not null,
  -- gestión
  etapa text not null default 'nueva' check (etapa in ('nueva', 'contactada', 'valoracion_agendada', 'valorada', 'seguimiento', 'programada', 'no_continua')),
  asignado_a uuid references public.px_perfiles(id) on delete set null,
  primera_respuesta_en timestamptz,
  cita_valoracion_en timestamptz,
  asistio boolean,
  motivo_cierre text
);

create index px_solicitudes_etapa_idx on public.px_solicitudes (etapa);
create index px_solicitudes_institucion_idx on public.px_solicitudes (institucion_id);
create index px_solicitudes_email_idx on public.px_solicitudes (lower(email));

create table public.px_solicitud_eventos (
  id bigint generated always as identity primary key,
  solicitud_id uuid not null references public.px_solicitudes(id) on delete cascade,
  creado_en timestamptz not null default now(),
  autor_id uuid references public.px_perfiles(id) on delete set null,
  tipo text not null check (tipo in ('sistema', 'etapa', 'nota_interna', 'mensaje_paciente')),
  etapa text,
  texto text
);

create index px_solicitud_eventos_solicitud_idx on public.px_solicitud_eventos (solicitud_id, creado_en);

-- ============ Clientes B2B ============

create table public.px_suscripciones (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references public.px_instituciones(id) on delete cascade,
  plan text not null check (plan in ('piloto', 'tecnologia', 'administrado')),
  cuota_instalacion bigint not null default 0,
  cuota_mensual bigint not null default 0,
  estado text not null default 'prueba' check (estado in ('prueba', 'activa', 'pausada', 'cancelada')),
  inicio date not null default current_date,
  fin date,
  notas text,
  creado_en timestamptz not null default now()
);

-- ============ Funciones de rol ============

create or replace function public.px_rol()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select rol from public.px_perfiles where id = auth.uid()
$$;

create or replace function public.px_es_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select rol in ('admin', 'coordinador') from public.px_perfiles where id = auth.uid()), false)
$$;

create or replace function public.px_es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select rol = 'admin' from public.px_perfiles where id = auth.uid()), false)
$$;

create or replace function public.px_mi_institucion()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select institucion_id from public.px_perfiles where id = auth.uid() and rol = 'clinica'
$$;

-- ============ RLS ============

alter table public.px_ciudades enable row level security;
alter table public.px_procedimientos enable row level security;
alter table public.px_instituciones enable row level security;
alter table public.px_profesionales enable row level security;
alter table public.px_profesional_institucion enable row level security;
alter table public.px_ofertas enable row level security;
alter table public.px_alojamientos enable row level security;
alter table public.px_servicios enable row level security;
alter table public.px_perfiles enable row level security;
alter table public.px_solicitudes enable row level security;
alter table public.px_solicitud_eventos enable row level security;
alter table public.px_suscripciones enable row level security;

-- Catálogo: el público ve lo publicado; el staff ve y edita todo.
create policy "publico lee ciudades" on public.px_ciudades for select using (activa or public.px_es_staff());
create policy "staff gestiona ciudades" on public.px_ciudades for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee procedimientos" on public.px_procedimientos for select using (publicado or public.px_es_staff());
create policy "staff gestiona procedimientos" on public.px_procedimientos for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee instituciones" on public.px_instituciones for select
  using (publicado or public.px_es_staff() or id = public.px_mi_institucion());
create policy "staff gestiona instituciones" on public.px_instituciones for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee profesionales" on public.px_profesionales for select using (publicado or public.px_es_staff());
create policy "staff gestiona profesionales" on public.px_profesionales for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee vinculos" on public.px_profesional_institucion for select using (true);
create policy "staff gestiona vinculos" on public.px_profesional_institucion for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee ofertas" on public.px_ofertas for select using (
  public.px_es_staff()
  or (publicado and exists (select 1 from public.px_instituciones i where i.id = institucion_id and i.publicado))
);
create policy "staff gestiona ofertas" on public.px_ofertas for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee alojamientos" on public.px_alojamientos for select using (publicado or public.px_es_staff());
create policy "staff gestiona alojamientos" on public.px_alojamientos for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

create policy "publico lee servicios" on public.px_servicios for select using (publicado or public.px_es_staff());
create policy "staff gestiona servicios" on public.px_servicios for all to authenticated using (public.px_es_staff()) with check (public.px_es_staff());

-- Perfiles: cada quien ve el suyo; el admin ve y cambia todos.
create policy "ver mi perfil" on public.px_perfiles for select to authenticated using (id = auth.uid() or public.px_es_staff());
create policy "admin gestiona perfiles" on public.px_perfiles for update to authenticated using (public.px_es_admin()) with check (public.px_es_admin());

-- Solicitudes: nunca accesibles a anónimos (se crean y consultan por funciones).
create policy "staff lee solicitudes" on public.px_solicitudes for select to authenticated
  using (public.px_es_staff() or institucion_id = public.px_mi_institucion());
create policy "staff actualiza solicitudes" on public.px_solicitudes for update to authenticated
  using (public.px_es_staff() or institucion_id = public.px_mi_institucion())
  with check (public.px_es_staff() or institucion_id = public.px_mi_institucion());
create policy "admin borra solicitudes" on public.px_solicitudes for delete to authenticated using (public.px_es_admin());

create policy "staff lee eventos" on public.px_solicitud_eventos for select to authenticated using (
  exists (select 1 from public.px_solicitudes s where s.id = solicitud_id
          and (public.px_es_staff() or s.institucion_id = public.px_mi_institucion()))
);
create policy "staff escribe eventos" on public.px_solicitud_eventos for insert to authenticated with check (
  autor_id = auth.uid()
  and tipo in ('nota_interna', 'mensaje_paciente')
  and exists (select 1 from public.px_solicitudes s where s.id = solicitud_id
              and (public.px_es_staff() or s.institucion_id = public.px_mi_institucion()))
);

create policy "staff lee suscripciones" on public.px_suscripciones for select to authenticated using (public.px_es_staff());
create policy "admin gestiona suscripciones" on public.px_suscripciones for all to authenticated using (public.px_es_admin()) with check (public.px_es_admin());

-- ============ Trigger: historial automático de etapas ============

create or replace function public.px_solicitud_cambio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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

create trigger px_solicitud_cambio
before update on public.px_solicitudes
for each row execute function public.px_solicitud_cambio();

-- ============ RPC públicas ============

-- Crea una solicitud de valoración desde el sitio público. Devuelve el código de seguimiento.
create or replace function public.px_crear_solicitud(datos jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_codigo text;
  v_email text := lower(trim(datos->>'email'));
  v_nombre text := trim(datos->>'nombre');
  v_telefono text := trim(datos->>'telefono');
  v_oferta public.px_ofertas%rowtype;
  v_ciudad text := nullif(datos->>'ciudad_id', '');
  v_proc text := nullif(datos->>'procedimiento_id', '');
  v_id uuid;
begin
  if coalesce((datos->>'consentimiento')::boolean, false) is not true then
    raise exception 'Se requiere la autorización de tratamiento de datos';
  end if;
  if v_nombre is null or length(v_nombre) < 2 or length(v_nombre) > 80 then
    raise exception 'Nombre inválido';
  end if;
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 120 then
    raise exception 'Correo inválido';
  end if;
  if v_telefono is null or length(v_telefono) < 7 or length(v_telefono) > 30 then
    raise exception 'Teléfono inválido';
  end if;
  if length(coalesce(datos->>'mensaje', '')) > 600 then
    raise exception 'El mensaje es demasiado largo';
  end if;
  -- Límite básico contra abuso.
  if (select count(*) from public.px_solicitudes where lower(email) = v_email and creado_en > now() - interval '1 hour') >= 5 then
    raise exception 'Demasiadas solicitudes. Intenta más tarde.';
  end if;

  if nullif(datos->>'oferta_id', '') is not null then
    select * into v_oferta from public.px_ofertas where id = (datos->>'oferta_id')::uuid and publicado;
    if not found then
      raise exception 'La opción seleccionada ya no está disponible';
    end if;
    v_proc := v_oferta.procedimiento_id;
    select ciudad_id into v_ciudad from public.px_instituciones where id = v_oferta.institucion_id;
  end if;

  loop
    v_codigo := 'PX-' || upper(substr(translate(encode(extensions.gen_random_bytes(6), 'base64'), '+/=0O1Il', ''), 1, 6));
    exit when length(v_codigo) = 9 and not exists (select 1 from public.px_solicitudes where codigo = v_codigo);
  end loop;

  insert into public.px_solicitudes (
    codigo, nombre, email, telefono, pais, procedimiento_id, oferta_id, institucion_id, profesional_id,
    ciudad_id, fecha_tentativa, alojamiento_id, noches, servicio_ids, mensaje, canal, utm,
    consentimiento_en, consentimiento_version
  ) values (
    v_codigo, v_nombre, v_email, v_telefono, coalesce(nullif(datos->>'pais', ''), 'Colombia'),
    v_proc, v_oferta.id, v_oferta.institucion_id, v_oferta.profesional_id,
    v_ciudad, nullif(datos->>'fecha_tentativa', '')::date,
    nullif(datos->>'alojamiento_id', '')::uuid,
    case when nullif(datos->>'alojamiento_id', '') is null then null else nullif(datos->>'noches', '')::int end,
    coalesce(array(select jsonb_array_elements_text(datos->'servicio_ids')), '{}'),
    nullif(trim(datos->>'mensaje'), ''),
    coalesce(nullif(datos->>'canal', ''), 'web'),
    datos->'utm',
    now(), coalesce(nullif(datos->>'consentimiento_version', ''), 'v1')
  ) returning id into v_id;

  insert into public.px_solicitud_eventos (solicitud_id, tipo, etapa, texto)
  values (v_id, 'sistema', 'nueva', 'Solicitud recibida desde ' || coalesce(nullif(datos->>'canal', ''), 'web'));

  return v_codigo;
end
$$;

-- Consulta pública de una solicitud con código + correo. No expone notas internas.
create or replace function public.px_consultar_solicitud(p_codigo text, p_email text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'codigo', s.codigo,
    'creado_en', s.creado_en,
    'etapa', s.etapa,
    'nombre', split_part(s.nombre, ' ', 1),
    'procedimiento', p.nombre,
    'institucion', i.nombre,
    'profesional', pr.nombre,
    'ciudad', c.nombre,
    'fecha_tentativa', s.fecha_tentativa,
    'cita_valoracion_en', s.cita_valoracion_en,
    'alojamiento', a.nombre,
    'noches', s.noches,
    'servicios', (select coalesce(jsonb_agg(sv.nombre), '[]'::jsonb) from public.px_servicios sv where sv.id = any(s.servicio_ids)),
    'eventos', (
      select coalesce(jsonb_agg(jsonb_build_object('creado_en', e.creado_en, 'tipo', e.tipo, 'etapa', e.etapa, 'texto', e.texto) order by e.creado_en), '[]'::jsonb)
      from public.px_solicitud_eventos e
      where e.solicitud_id = s.id and e.tipo in ('sistema', 'etapa', 'mensaje_paciente')
    )
  )
  from public.px_solicitudes s
  left join public.px_procedimientos p on p.id = s.procedimiento_id
  left join public.px_instituciones i on i.id = s.institucion_id
  left join public.px_profesionales pr on pr.id = s.profesional_id
  left join public.px_ciudades c on c.id = s.ciudad_id
  left join public.px_alojamientos a on a.id = s.alojamiento_id
  where s.codigo = upper(trim(p_codigo)) and lower(s.email) = lower(trim(p_email))
$$;

-- Crea (si no existe) el perfil interno del usuario actual y lo devuelve.
create or replace function public.px_mi_perfil()
returns public.px_perfiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.px_perfiles;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  insert into public.px_perfiles (id, email, nombre)
  select u.id, u.email, coalesce(u.raw_user_meta_data->>'nombre', '')
  from auth.users u where u.id = auth.uid()
  on conflict (id) do nothing;
  select * into v from public.px_perfiles where id = auth.uid();
  return v;
end
$$;

-- Arranque: el primer usuario que lo invoque se vuelve admin, solo si aún no hay ningún admin.
create or replace function public.px_reclamar_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  lock table public.px_perfiles in exclusive mode;
  if exists (select 1 from public.px_perfiles where rol = 'admin') then
    return false;
  end if;
  update public.px_perfiles set rol = 'admin' where id = auth.uid();
  return found;
end
$$;

revoke execute on function public.px_crear_solicitud(jsonb) from public;
revoke execute on function public.px_consultar_solicitud(text, text) from public;
revoke execute on function public.px_mi_perfil() from public;
revoke execute on function public.px_reclamar_admin() from public;
grant execute on function public.px_crear_solicitud(jsonb) to anon, authenticated;
grant execute on function public.px_consultar_solicitud(text, text) to anon, authenticated;
grant execute on function public.px_mi_perfil() to authenticated;
grant execute on function public.px_reclamar_admin() to authenticated;
