-- Pruebas de aceptación de acceso y operación (PLASTINEX).
-- Se ejecutan dentro de una transacción que NUNCA se confirma: no dejan datos.
-- Uso: pegar completo en el editor SQL de Supabase (o en el MCP) y revisar el JSON final.
-- Todos los valores esperados están en el comentario de cada prueba.

begin;

-- Datos de prueba: paciente A, paciente B y un usuario de la clínica demo de Madrid.
insert into auth.users (id, email, aud, role) values
 ('00000000-0000-4000-a000-00000000000a', 'prueba.a@ejemplo.test', 'authenticated', 'authenticated'),
 ('00000000-0000-4000-a000-00000000000b', 'prueba.b@ejemplo.test', 'authenticated', 'authenticated'),
 ('00000000-0000-4000-a000-00000000000c', 'prueba.c@ejemplo.test', 'authenticated', 'authenticated');
insert into public.px_perfiles (id, email, rol, institucion_id) values
 ('00000000-0000-4000-a000-00000000000c', 'prueba.c@ejemplo.test', 'clinica', md5('px-demo-inst-madrid')::uuid)
on conflict (id) do update set rol = 'clinica', institucion_id = excluded.institucion_id;
insert into public.px_pacientes (id, nombre, telefono, pais, terminos_version, terminos_aceptados_en, intermediacion_aceptada_en, confidencialidad_aceptada_en, datos_sensibles_autorizado_en)
select u, n, '3000000000', 'Colombia', px_privado.px_version_terminos(), now(), now(), now(), now()
from (values ('00000000-0000-4000-a000-00000000000a'::uuid, 'Prueba A'), ('00000000-0000-4000-a000-00000000000b'::uuid, 'Prueba B')) v(u, n);
insert into public.px_solicitudes (codigo, paciente_id, nombre, email, telefono, institucion_id, consentimiento_en, consentimiento_version) values
 ('PX-TESTBB', '00000000-0000-4000-a000-00000000000b', 'Prueba B', 'prueba.b@ejemplo.test', '3000000000', md5('px-demo-inst-miami')::uuid, now(), 'prueba');

do $$
declare r text; o uuid; k text := '11111111-1111-4111-8111-111111111111';
begin
  select id into o from public.px_ofertas where institucion_id = md5('px-demo-inst-madrid')::uuid and publicado limit 1;

  -- Visitante sin sesión: no ve datos privados (esperado: 0 en todo).
  perform set_config('role', 'anon', true);
  perform set_config('px.anon', (select count(*) from public.px_solicitudes)::text || '/' || (select count(*) from public.px_pacientes)::text || '/' || (select count(*) from public.px_perfiles)::text, true);
  begin
    perform public.px_crear_solicitud('{}'::jsonb);
    perform set_config('px.anon_rpc', 'permitido', true);
  exception when others then perform set_config('px.anon_rpc', 'bloqueado', true); end;

  -- Paciente A.
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000a","role":"authenticated"}', true);
  perform set_config('px.envio1', public.px_crear_solicitud(jsonb_build_object('oferta_id', o, 'clave', k, 'servicio_ids', '[]'::jsonb)), true);
  perform set_config('px.envio2', public.px_crear_solicitud(jsonb_build_object('oferta_id', o, 'clave', k, 'servicio_ids', '[]'::jsonb)), true);
  perform set_config('px.a_tabla', (select count(*) from public.px_solicitudes)::text, true);
  perform set_config('px.a_mias', coalesce((select string_agg(x->>'codigo', ',') from jsonb_array_elements(public.px_mis_solicitudes()) x), '-'), true);
  perform set_config('px.a_pacientes', coalesce((select string_agg(nombre, ',') from public.px_pacientes), '-'), true);
  update public.px_perfiles set rol = 'admin' where id = auth.uid();
  get diagnostics r = row_count;
  perform set_config('px.a_admin', r, true);
  begin
    insert into public.px_solicitudes (codigo, nombre, email, telefono, consentimiento_en, consentimiento_version) values ('PX-DIRECT', 'x', 'x@x', '1', now(), 'v');
    perform set_config('px.a_insert', 'permitido', true);
  exception when others then perform set_config('px.a_insert', 'bloqueado', true); end;

  -- Clínica de Madrid.
  perform set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-a000-00000000000c","role":"authenticated"}', true);
  perform set_config('px.c_ve', coalesce((select string_agg(codigo, ',') from public.px_solicitudes), '-'), true);
  perform set_config('px.c_pacientes', (select count(*) from public.px_pacientes)::text, true);
  update public.px_solicitudes set etapa = 'contactada' where codigo = 'PX-TESTBB';
  get diagnostics r = row_count;
  perform set_config('px.c_otra', r, true);
  update public.px_solicitudes set etapa = 'contactada' where codigo = current_setting('px.envio1');
  get diagnostics r = row_count;
  perform set_config('px.c_suya', r, true);
  begin
    update public.px_solicitudes set email = 'otro@x.test' where codigo = current_setting('px.envio1');
    perform set_config('px.c_email', 'permitido', true);
  exception when others then perform set_config('px.c_email', 'bloqueado', true); end;
  begin
    update public.px_solicitudes set asignado_a = auth.uid() where codigo = current_setting('px.envio1');
    perform set_config('px.c_asigna', 'permitido', true);
  exception when others then perform set_config('px.c_asigna', 'bloqueado', true); end;
end $$;

select json_build_object(
 '01 Visitante ve solicitudes/pacientes/perfiles (esperado 0/0/0)', current_setting('px.anon'),
 '02 Visitante crea solicitud (esperado bloqueado)', current_setting('px.anon_rpc'),
 '03 Paciente lee la tabla de solicitudes (esperado 0)', current_setting('px.a_tabla'),
 '04 Paciente ve en «Mis solicitudes» (esperado solo la suya)', current_setting('px.a_mias'),
 '05 Paciente ve fichas de pacientes (esperado solo Prueba A)', current_setting('px.a_pacientes'),
 '06 Paciente se asigna rol admin (esperado 0)', current_setting('px.a_admin'),
 '07 Paciente inserta directo en la tabla (esperado bloqueado)', current_setting('px.a_insert'),
 '08 Reintento con la misma clave (esperado mismo código)', current_setting('px.envio1') || ' = ' || current_setting('px.envio2'),
 '09 Clínica ve (esperado solo la de Madrid, no PX-TESTBB)', current_setting('px.c_ve'),
 '10 Clínica ve fichas de pacientes (esperado 0)', current_setting('px.c_pacientes'),
 '11 Clínica modifica solicitud de otra clínica (esperado 0)', current_setting('px.c_otra'),
 '12 Clínica cambia etapa de la suya (esperado 1)', current_setting('px.c_suya'),
 '13 Clínica cambia correo del paciente (esperado bloqueado)', current_setting('px.c_email'),
 '14 Clínica asigna responsable (esperado bloqueado)', current_setting('px.c_asigna'),
 '15 Trazabilidad registrada (esperado sistema:nueva, etapa:contactada)', (select string_agg(e.tipo || ':' || coalesce(e.etapa, ''), ', ' order by e.id) from public.px_solicitud_eventos e join public.px_solicitudes s on s.id = e.solicitud_id where s.codigo = current_setting('px.envio1'))
) as resultado;

rollback;
