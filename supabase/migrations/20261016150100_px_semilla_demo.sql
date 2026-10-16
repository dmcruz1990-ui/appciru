-- PLASTINEX · permisos finos + datos de demostración (Eje Cafetero).
-- Todas las instituciones, profesionales y alojamientos son FICTICIOS (es_demo = true).
-- Los códigos REPS / ReTHUS son de ejemplo y no corresponden a registros reales.

revoke execute on function public.px_mi_perfil() from anon;
revoke execute on function public.px_reclamar_admin() from anon;
revoke execute on function public.px_solicitud_cambio() from anon, authenticated;

insert into public.px_ciudades (id, nombre, departamento, orden) values
  ('pereira', 'Pereira', 'Risaralda', 1),
  ('dosquebradas', 'Dosquebradas', 'Risaralda', 2),
  ('armenia', 'Armenia', 'Quindío', 3),
  ('manizales', 'Manizales', 'Caldas', 4),
  ('cartago', 'Cartago', 'Valle del Cauca', 5);

insert into public.px_procedimientos (id, nombre, categoria, descripcion, duracion_aprox, anestesia, recuperacion, estadia_sugerida_dias, orden) values
  ('mamoplastia-aumento', 'Mamoplastia de aumento', 'mamaria', 'Aumento del volumen mamario con implantes. La técnica, el tipo y el tamaño del implante se definen en la valoración.', '1,5 – 2 h', 'General', 'Actividades suaves en 1–2 semanas', 7, 1),
  ('mamoplastia-reduccion', 'Mamoplastia de reducción', 'mamaria', 'Reducción del volumen mamario. Puede tener componente funcional además del estético.', '2,5 – 3,5 h', 'General', '2–3 semanas', 10, 2),
  ('mastopexia', 'Mastopexia', 'mamaria', 'Levantamiento y remodelación del tejido mamario, con o sin implantes.', '2 – 3 h', 'General', '2 semanas', 10, 3),
  ('lipoescultura', 'Lipoescultura', 'corporal', 'Remodelación del contorno corporal mediante liposucción y, en algunos casos, transferencia de grasa.', '2 – 4 h', 'General o regional', '2–3 semanas', 10, 4),
  ('lipoabdominoplastia', 'Lipoabdominoplastia', 'corporal', 'Combina liposucción con retiro de piel del abdomen y plicatura de la pared muscular.', '3 – 4 h', 'General', '3–4 semanas', 14, 5),
  ('abdominoplastia', 'Abdominoplastia', 'corporal', 'Retiro de exceso de piel y grasa del abdomen con reparación muscular.', '2,5 – 3,5 h', 'General', '3 semanas', 14, 6),
  ('gluteoplastia', 'Gluteoplastia', 'corporal', 'Aumento o remodelación de glúteos con implantes o grasa propia, según valoración.', '2 – 3 h', 'General', '2–3 semanas', 12, 7),
  ('rinoplastia', 'Rinoplastia', 'facial', 'Cirugía de nariz con fines estéticos y/o funcionales.', '2 – 3 h', 'General', '1–2 semanas visibles; resultado final en meses', 8, 8),
  ('blefaroplastia', 'Blefaroplastia', 'facial', 'Corrección de párpados superiores y/o inferiores.', '1 – 2 h', 'Local con sedación', '7–10 días', 7, 9),
  ('lifting-facial', 'Lifting facial', 'facial', 'Rejuvenecimiento del tercio medio e inferior del rostro y cuello.', '3 – 5 h', 'General', '2–3 semanas', 14, 10);

insert into public.px_servicios (id, nombre, descripcion, precio_desde, unidad, orden) values
  ('traslados', 'Traslados aeropuerto – clínica – alojamiento', 'Conductor para llegada, cirugía y controles.', 350000, 'servicio', 1),
  ('enfermeria', 'Enfermería en el alojamiento', 'Acompañamiento de enfermería 12 h al día.', 160000, 'dia', 2),
  ('drenajes', 'Paquete de drenajes linfáticos', '10 sesiones a domicilio, si el cirujano las indica.', 550000, 'servicio', 3),
  ('acompanante', 'Acompañante / intérprete bilingüe', 'Para pacientes que vienen del exterior.', 300000, 'servicio', 4),
  ('fajas', 'Prendas de compresión', 'Faja y accesorios según indicación médica.', 280000, 'servicio', 5);

with inst as (
  insert into public.px_instituciones (nombre, tipo, ciudad_id, direccion, descripcion, codigo_reps, servicios, verificacion, verificado_en, es_demo, publicado) values
    ('Clínica Demo Circunvalar', 'clinica', 'pereira', 'Av. Circunvalar (dirección de ejemplo)', 'Clínica de demostración con quirófanos propios y hospitalización corta.', '660010000001', '{Quirófanos propios,Hospitalización,Coordinador de pacientes}', 'verificado', now(), true, true),
    ('Centro Quirúrgico Demo Pinares', 'clinica', 'pereira', 'Sector Pinares (dirección de ejemplo)', 'Centro quirúrgico ambulatorio de demostración.', '660010000002', '{Cirugía ambulatoria,Valoración virtual}', 'en_revision', null, true, true),
    ('Institución Demo Dosquebradas', 'institucion', 'dosquebradas', 'Zona centro (dirección de ejemplo)', 'Institución de demostración con enfoque en contorno corporal.', '661700000003', '{Hospitalización,Laboratorio}', 'pendiente', null, true, true),
    ('Clínica Demo Quindío', 'clinica', 'armenia', 'Norte de Armenia (dirección de ejemplo)', 'Clínica de demostración en Armenia con programa de recuperación.', '630010000004', '{Quirófanos propios,Casa de recobro aliada}', 'verificado', now(), true, true),
    ('Centro Médico Demo Cable', 'clinica', 'manizales', 'Sector El Cable (dirección de ejemplo)', 'Centro médico de demostración en Manizales.', '170010000005', '{Hospitalización,Coordinador de pacientes}', 'pendiente', null, true, true),
    ('Consultorio Demo Cartago', 'consultorio', 'cartago', 'Centro (dirección de ejemplo)', 'Consultorio de demostración para valoraciones; cirugías en institución aliada.', null, '{Valoración presencial}', 'pendiente', null, true, true)
  returning id, nombre
),
prof as (
  insert into public.px_profesionales (nombre, ciudad_id, rethus, sociedad, anios_experiencia, idiomas, bio, valoracion_virtual, verificacion, verificado_en, es_demo, publicado) values
    ('Dra. Perfil Demo A', 'pereira', 'RT-DEMO-0001', 'SCCP', 12, '{Español,Inglés}', 'Perfil ficticio de demostración. Enfoque en cirugía mamaria y contorno corporal.', true, 'verificado', now(), true, true),
    ('Dr. Perfil Demo B', 'pereira', 'RT-DEMO-0002', 'SCCP', 9, '{Español}', 'Perfil ficticio de demostración. Enfoque en cirugía facial.', true, 'en_revision', null, true, true),
    ('Dra. Perfil Demo C', 'dosquebradas', 'RT-DEMO-0003', null, 7, '{Español}', 'Perfil ficticio de demostración.', false, 'pendiente', null, true, true),
    ('Dr. Perfil Demo D', 'armenia', 'RT-DEMO-0004', 'SCCP', 15, '{Español,Inglés}', 'Perfil ficticio de demostración. Enfoque en lipoabdominoplastia.', true, 'verificado', now(), true, true),
    ('Dra. Perfil Demo E', 'manizales', 'RT-DEMO-0005', 'SCCP', 10, '{Español}', 'Perfil ficticio de demostración.', true, 'pendiente', null, true, true)
  returning id, nombre
),
vinc as (
  insert into public.px_profesional_institucion (profesional_id, institucion_id)
  select p.id, i.id from (values
    ('Dra. Perfil Demo A', 'Clínica Demo Circunvalar'),
    ('Dra. Perfil Demo A', 'Centro Quirúrgico Demo Pinares'),
    ('Dr. Perfil Demo B', 'Centro Quirúrgico Demo Pinares'),
    ('Dra. Perfil Demo C', 'Institución Demo Dosquebradas'),
    ('Dr. Perfil Demo D', 'Clínica Demo Quindío'),
    ('Dra. Perfil Demo E', 'Centro Médico Demo Cable')
  ) v(prof, inst) join prof p on p.nombre = v.prof join inst i on i.nombre = v.inst
  returning 1
)
insert into public.px_ofertas (procedimiento_id, institucion_id, profesional_id, precio_min, precio_max, incluye, no_incluye, precio_actualizado_en, publicado)
select v.proc, i.id, p.id, v.pmin, v.pmax, v.incluye, v.no_incluye, case when v.pmin is null and v.pmax is null then null else current_date end, true
from (values
  ('mamoplastia-aumento', 'Clínica Demo Circunvalar', 'Dra. Perfil Demo A', 11000000::bigint, 15000000::bigint, 'Honorarios, anestesia, sala, implantes, prenda postquirúrgica, controles.', 'Exámenes prequirúrgicos, medicamentos, alojamiento.'),
  ('mastopexia', 'Clínica Demo Circunvalar', 'Dra. Perfil Demo A', 12000000, 16000000, 'Honorarios, anestesia, sala, controles.', 'Implantes (si se requieren), exámenes.'),
  ('lipoescultura', 'Clínica Demo Circunvalar', 'Dra. Perfil Demo A', 9000000, 13000000, 'Honorarios, anestesia, sala, faja, 1 noche de hospitalización.', 'Drenajes linfáticos, exámenes.'),
  ('lipoabdominoplastia', 'Centro Quirúrgico Demo Pinares', 'Dra. Perfil Demo A', null, null, null, null),
  ('rinoplastia', 'Centro Quirúrgico Demo Pinares', 'Dr. Perfil Demo B', 9500000, 13500000, 'Honorarios, anestesia, sala, férula, controles.', 'Exámenes, medicamentos.'),
  ('blefaroplastia', 'Centro Quirúrgico Demo Pinares', 'Dr. Perfil Demo B', 5000000, 7500000, 'Honorarios, sedación, sala.', 'Exámenes.'),
  ('lifting-facial', 'Centro Quirúrgico Demo Pinares', 'Dr. Perfil Demo B', null, null, null, null),
  ('lipoescultura', 'Institución Demo Dosquebradas', 'Dra. Perfil Demo C', 8500000, 11500000, 'Honorarios, anestesia, sala, faja.', 'Hospitalización, exámenes.'),
  ('gluteoplastia', 'Institución Demo Dosquebradas', 'Dra. Perfil Demo C', null, null, null, null),
  ('lipoabdominoplastia', 'Clínica Demo Quindío', 'Dr. Perfil Demo D', 14000000, 19000000, 'Honorarios, anestesia, sala, faja, 1 noche de hospitalización, controles.', 'Exámenes, drenajes, alojamiento.'),
  ('abdominoplastia', 'Clínica Demo Quindío', 'Dr. Perfil Demo D', 12500000, 16500000, 'Honorarios, anestesia, sala, faja.', 'Exámenes, medicamentos.'),
  ('mamoplastia-aumento', 'Centro Médico Demo Cable', 'Dra. Perfil Demo E', 10500000, 14000000, 'Honorarios, anestesia, sala, implantes.', 'Exámenes, prenda postquirúrgica.'),
  ('mamoplastia-reduccion', 'Centro Médico Demo Cable', 'Dra. Perfil Demo E', null, null, null, null),
  ('rinoplastia', 'Consultorio Demo Cartago', null, null, null, null, null)
) v(proc, inst, prof, pmin, pmax, incluye, no_incluye)
join inst i on i.nombre = v.inst
left join prof p on p.nombre = v.prof;

insert into public.px_alojamientos (nombre, tipo, ciudad_id, descripcion, precio_noche_desde, incluye_enfermeria, incluye_alimentacion, es_demo, publicado) values
  ('Casa de Recobro Demo Pereira', 'casa_recobro', 'pereira', 'Habitaciones de recuperación con enfermería y alimentación (demostración).', 230000, true, true, true, true),
  ('Hotel Demo Centro Pereira', 'hotel', 'pereira', 'Hotel cercano a las clínicas del sector (demostración).', 260000, false, false, true, true),
  ('Finca de Recobro Demo Cerritos', 'casa_recobro', 'pereira', 'Recuperación en ambiente campestre (demostración).', 210000, true, true, true, true),
  ('Casa de Recobro Demo Armenia', 'casa_recobro', 'armenia', 'Recuperación con enfermería (demostración).', 200000, true, true, true, true),
  ('Apartamento Demo Manizales', 'apartamento', 'manizales', 'Apartamento amoblado (demostración).', 180000, false, false, true, true);

insert into public.px_suscripciones (institucion_id, plan, cuota_instalacion, cuota_mensual, estado, inicio, notas)
select id, v.plan, v.inst, v.mes, v.estado, current_date - v.dias, 'Dato de demostración'
from public.px_instituciones i
join (values
  ('Clínica Demo Circunvalar', 'administrado', 3000000::bigint, 3500000::bigint, 'activa', 75),
  ('Centro Quirúrgico Demo Pinares', 'tecnologia', 1500000, 1500000, 'activa', 40),
  ('Clínica Demo Quindío', 'piloto', 0, 1000000, 'prueba', 12)
) v(nombre, plan, inst, mes, estado, dias) on v.nombre = i.nombre;
