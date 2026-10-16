-- Las funciones auxiliares de RLS y el trigger no deben exponerse por la API: se mueven a un esquema no expuesto.
create schema if not exists px_privado;
revoke all on schema px_privado from public;
grant usage on schema px_privado to anon, authenticated;

alter function public.px_rol() set schema px_privado;
alter function public.px_es_staff() set schema px_privado;
alter function public.px_es_admin() set schema px_privado;
alter function public.px_mi_institucion() set schema px_privado;
alter function public.px_solicitud_cambio() set schema px_privado;

revoke execute on all functions in schema px_privado from public, anon, authenticated;
grant execute on function px_privado.px_rol(), px_privado.px_es_staff(), px_privado.px_es_admin(), px_privado.px_mi_institucion() to anon, authenticated;

revoke execute on function public.px_mi_perfil() from anon, public;
revoke execute on function public.px_reclamar_admin() from anon, public;
