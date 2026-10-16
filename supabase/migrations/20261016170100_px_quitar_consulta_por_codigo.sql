-- El seguimiento ahora se hace desde la cuenta del paciente (px_mis_solicitudes).
-- La consulta por código + correo queda sin permisos de ejecución (se puede borrar con DROP FUNCTION).
revoke execute on function public.px_consultar_solicitud(text, text) from authenticated, anon, public;
