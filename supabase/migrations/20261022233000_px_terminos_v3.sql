-- Términos v3: explican el modelo de ingresos (suscripción de clínicas y, donde la ley lo permita, comisión
-- comercial en contrato aparte) y que la verificación de médicos es independiente del pago.
-- Debe coincidir con TERMINOS_VERSION en packages/shared/src/formato.ts.
create or replace function px_privado.px_version_terminos()
returns text language sql immutable set search_path = ''
as $$ select 'v3-2026-10' $$;
