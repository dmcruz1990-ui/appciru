-- Mapa y galerías estilo marketplace: coordenadas y varias fotos por institución y alojamiento.
alter table public.px_instituciones
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists galeria text[] not null default '{}';
alter table public.px_alojamientos
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists galeria text[] not null default '{}',
  add column if not exists capacidad smallint;

alter table public.px_instituciones add constraint px_inst_coordenadas check (lat is null or (lat between -90 and 90 and lng between -180 and 180));
alter table public.px_alojamientos add constraint px_aloj_coordenadas check (lat is null or (lat between -90 and 90 and lng between -180 and 180));
alter table public.px_instituciones add constraint px_inst_galeria check (cardinality(galeria) <= 20);
alter table public.px_alojamientos add constraint px_aloj_galeria check (cardinality(galeria) <= 20);

-- Coordenadas aproximadas de los perfiles de demostración (no son direcciones reales).
update public.px_instituciones i set lat = v.lat, lng = v.lng
from (values
  ('Clínica Demo Circunvalar', 4.8087, -75.6890),
  ('Centro Quirúrgico Demo Pinares', 4.8019, -75.6797),
  ('Institución Demo Dosquebradas', 4.8392, -75.6673),
  ('Clínica Demo Quindío', 4.5560, -75.6610),
  ('Centro Médico Demo Cable', 5.0590, -75.4900),
  ('Consultorio Demo Cartago', 4.7464, -75.9117)
) v(nombre, lat, lng) where i.nombre = v.nombre and i.lat is null;

update public.px_alojamientos a set lat = v.lat, lng = v.lng, capacidad = v.cap
from (values
  ('Casa de Recobro Demo Pereira', 4.8060, -75.6850, 2),
  ('Finca de Recobro Demo Cerritos', 4.8370, -75.8010, 4),
  ('Hotel Demo Centro Pereira', 4.8143, -75.6946, 2),
  ('Casa de Recobro Demo Armenia', 4.5390, -75.6720, 2),
  ('Apartamento Demo Manizales', 5.0630, -75.4960, 3)
) v(nombre, lat, lng, cap) where a.nombre = v.nombre and a.lat is null;
