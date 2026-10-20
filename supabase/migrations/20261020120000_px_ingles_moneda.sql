-- Versión en inglés del catálogo y tasa de referencia para mostrar precios en dólares.
-- Si un campo *_en está vacío, el sitio muestra el texto en español.

alter table public.px_procedimientos
  add column if not exists nombre_en text,
  add column if not exists descripcion_en text,
  add column if not exists duracion_aprox_en text,
  add column if not exists anestesia_en text,
  add column if not exists recuperacion_en text;
alter table public.px_servicios
  add column if not exists nombre_en text,
  add column if not exists descripcion_en text;
alter table public.px_instituciones
  add column if not exists descripcion_en text,
  add column if not exists servicios_en text[] not null default '{}';
alter table public.px_profesionales
  add column if not exists especialidad_en text,
  add column if not exists bio_en text;
alter table public.px_alojamientos add column if not exists descripcion_en text;
alter table public.px_ofertas
  add column if not exists incluye_en text,
  add column if not exists no_incluye_en text;

-- Ajustes numéricos del sitio (por ahora, la tasa COP por dólar). Lectura pública; solo el admin los cambia.
create table if not exists public.px_ajustes (
  clave text primary key,
  valor numeric not null check (valor > 0),
  descripcion text not null default '',
  actualizado_en timestamptz not null default now()
);
alter table public.px_ajustes enable row level security;
create policy "publico lee ajustes" on public.px_ajustes for select using (true);
create policy "admin gestiona ajustes" on public.px_ajustes for all to authenticated
  using (px_privado.px_es_admin()) with check (px_privado.px_es_admin());
grant select on public.px_ajustes to anon, authenticated;
grant insert, update, delete on public.px_ajustes to authenticated;

insert into public.px_ajustes (clave, valor, descripcion) values
  ('tasa_usd_cop', 4000, 'Pesos colombianos por 1 dólar. Solo para mostrar valores aproximados en USD; la clínica cobra en su moneda.')
on conflict (clave) do nothing;

-- Traducciones del catálogo de demostración.
update public.px_procedimientos p set nombre_en = v.n, descripcion_en = v.d, anestesia_en = v.a, recuperacion_en = v.r, duracion_aprox_en = replace(p.duracion_aprox, ',', '.')
from (values
  ('mamoplastia-aumento', 'Breast augmentation', 'Increases breast volume with implants. Technique, implant type and size are defined at the consultation.', 'General', 'Light activity in 1–2 weeks'),
  ('mamoplastia-reduccion', 'Breast reduction', 'Reduces breast volume. It may have a functional component as well as an aesthetic one.', 'General', '2–3 weeks'),
  ('mastopexia', 'Breast lift', 'Lifts and reshapes the breast tissue, with or without implants.', 'General', '2 weeks'),
  ('lipoescultura', 'Liposculpture', 'Body contouring with liposuction and, in some cases, fat transfer.', 'General or regional', '2–3 weeks'),
  ('lipoabdominoplastia', 'Lipoabdominoplasty', 'Combines liposuction with removal of abdominal skin and tightening of the muscle wall.', 'General', '3–4 weeks'),
  ('abdominoplastia', 'Tummy tuck', 'Removes excess abdominal skin and fat and repairs the muscles.', 'General', '3 weeks'),
  ('gluteoplastia', 'Buttock augmentation', 'Augments or reshapes the buttocks with implants or your own fat, depending on the consultation.', 'General', '2–3 weeks'),
  ('rinoplastia', 'Rhinoplasty', 'Nose surgery for aesthetic and/or functional purposes.', 'General', '1–2 weeks visible; final result in months'),
  ('blefaroplastia', 'Eyelid surgery', 'Correction of the upper and/or lower eyelids.', 'Local with sedation', '7–10 days'),
  ('lifting-facial', 'Facelift', 'Rejuvenates the mid and lower face and the neck.', 'General', '2–3 weeks')
) v(id, n, d, a, r) where p.id = v.id;

update public.px_servicios s set nombre_en = v.n, descripcion_en = v.d
from (values
  ('traslados', 'Airport – clinic – lodging transfers', 'Driver for arrival, surgery and follow-ups.'),
  ('enfermeria', 'Nursing at your lodging', 'Nursing care 12 hours a day.'),
  ('drenajes', 'Lymphatic drainage package', '10 home sessions, if your surgeon prescribes them.'),
  ('acompanante', 'Bilingual companion / interpreter', 'For patients travelling from abroad.'),
  ('fajas', 'Compression garments', 'Garment and accessories as prescribed.')
) v(id, n, d) where s.id = v.id;

update public.px_instituciones i set descripcion_en = v.d, servicios_en = v.s
from (values
  ('Centro Médico Demo Cable', 'Demo medical center in Manizales.', array['Hospital stay', 'Patient coordinator']),
  ('Consultorio Demo Cartago', 'Demo practice for consultations; surgeries at a partner facility.', array['In-person consultation']),
  ('Clínica Demo Circunvalar', 'Demo clinic with its own operating rooms and short hospital stay.', array['Own operating rooms', 'Hospital stay', 'Patient coordinator']),
  ('Clínica Demo Quindío', 'Demo clinic in Armenia with a recovery program.', array['Own operating rooms', 'Partner recovery house']),
  ('Centro Quirúrgico Demo Pinares', 'Demo outpatient surgery center.', array['Outpatient surgery', 'Virtual consultation']),
  ('Institución Demo Dosquebradas', 'Demo facility focused on body contouring.', array['Hospital stay', 'Laboratory'])
) v(nombre, d, s) where i.nombre = v.nombre;

update public.px_profesionales p set especialidad_en = 'Plastic, aesthetic and reconstructive surgery', bio_en = v.b
from (values
  ('Dra. Perfil Demo A', 'Fictitious demo profile. Focus on breast surgery and body contouring.'),
  ('Dr. Perfil Demo B', 'Fictitious demo profile. Focus on facial surgery.'),
  ('Dra. Perfil Demo C', 'Fictitious demo profile.'),
  ('Dr. Perfil Demo D', 'Fictitious demo profile. Focus on lipoabdominoplasty.'),
  ('Dra. Perfil Demo E', 'Fictitious demo profile.')
) v(nombre, b) where p.nombre = v.nombre;

update public.px_alojamientos a set descripcion_en = v.d
from (values
  ('Casa de Recobro Demo Pereira', 'Recovery rooms with nursing and meals (demo).'),
  ('Finca de Recobro Demo Cerritos', 'Recovery in a countryside setting (demo).'),
  ('Hotel Demo Centro Pereira', 'Hotel close to the clinics in the area (demo).'),
  ('Casa de Recobro Demo Armenia', 'Recovery with nursing (demo).'),
  ('Apartamento Demo Manizales', 'Furnished apartment (demo).')
) v(nombre, d) where a.nombre = v.nombre;

update public.px_ofertas o set incluye_en = v.e
from (values
  ('Honorarios, anestesia, sala, controles.', 'Surgeon fees, anesthesia, operating room, follow-ups.'),
  ('Honorarios, anestesia, sala, faja, 1 noche de hospitalización, controles.', 'Surgeon fees, anesthesia, operating room, compression garment, 1 night in hospital, follow-ups.'),
  ('Honorarios, anestesia, sala, faja, 1 noche de hospitalización.', 'Surgeon fees, anesthesia, operating room, compression garment, 1 night in hospital.'),
  ('Honorarios, anestesia, sala, faja.', 'Surgeon fees, anesthesia, operating room, compression garment.'),
  ('Honorarios, anestesia, sala, férula, controles.', 'Surgeon fees, anesthesia, operating room, splint, follow-ups.'),
  ('Honorarios, anestesia, sala, implantes, prenda postquirúrgica, controles.', 'Surgeon fees, anesthesia, operating room, implants, post-surgical garment, follow-ups.'),
  ('Honorarios, anestesia, sala, implantes.', 'Surgeon fees, anesthesia, operating room, implants.'),
  ('Honorarios, sedación, sala.', 'Surgeon fees, sedation, operating room.')
) v(es, e) where o.incluye = v.es;
