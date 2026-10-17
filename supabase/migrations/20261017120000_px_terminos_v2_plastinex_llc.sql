-- Documentos v2: titular PLASTINEX LLC y relación paciente – clínica – PLASTINEX (la clínica cobra; PLASTINEX factura a la clínica).
-- Los pacientes con la versión anterior deben aceptar de nuevo antes de enviar otra solicitud.
create or replace function px_privado.px_version_terminos()
returns text language sql immutable set search_path = ''
as $$ select 'v2-2026-10' $$;
