-- Ciudades principales de cada país (2 a 7 por país), con los mismos perfiles de demostración por ciudad
-- que 20261021120000_px_cobertura_mundial_demo.sql: clínica, cirujano, siete ofertas y hotel, todos es_demo.
-- Ejemplo: Chile suma Valparaíso, Viña del Mar, Concepción y Antofagasta a Santiago.
alter table public.px_ciudades add column if not exists nombre_en text;

-- Destinos: ciudades nuevas y coordenadas del centro de cada ciudad (solo para ubicar los perfiles demo).
create temporary table px_tmp_destino (
  id text primary key,
  nombre text not null,
  nombre_en text,
  departamento text not null,
  pais text not null,
  orden int not null,
  lat double precision not null,
  lng double precision not null
);

insert into px_tmp_destino values
  ('bucaramanga', 'Bucaramanga', null, 'Santander', 'CO', 11, 7.1193, -73.1227),
  ('santa-marta', 'Santa Marta', null, 'Magdalena', 'CO', 12, 11.2408, -74.199),
  ('cucuta', 'Cúcuta', 'Cucuta', 'Norte de Santander', 'CO', 13, 7.8939, -72.5078),
  ('chicago', 'Chicago', null, 'Illinois', 'US', 25, 41.8781, -87.6298),
  ('las-vegas', 'Las Vegas', null, 'Nevada', 'US', 25, 36.1699, -115.1398),
  ('atlanta', 'Atlanta', null, 'Georgia', 'US', 25, 33.749, -84.388),
  ('san-francisco', 'San Francisco', null, 'California', 'US', 25, 37.7749, -122.4194),
  ('calgary', 'Calgary', null, 'Alberta', 'CA', 29, 51.0447, -114.0719),
  ('ottawa', 'Ottawa', null, 'Ontario', 'CA', 29, 45.4215, -75.6972),
  ('puebla', 'Puebla', null, 'Puebla', 'MX', 35, 19.0414, -98.2063),
  ('queretaro', 'Querétaro', 'Queretaro', 'Querétaro', 'MX', 35, 20.5888, -100.3899),
  ('merida-mx', 'Mérida', 'Merida', 'Yucatán', 'MX', 35, 20.9674, -89.5926),
  ('santiago-de-los-caballeros', 'Santiago de los Caballeros', null, 'Santiago', 'DO', 42, 19.4517, -70.697),
  ('quetzaltenango', 'Quetzaltenango', null, 'Quetzaltenango', 'GT', 44, 14.8347, -91.5181),
  ('arequipa', 'Arequipa', null, 'Arequipa', 'PE', 47, -16.409, -71.5375),
  ('trujillo', 'Trujillo', null, 'La Libertad', 'PE', 47, -8.1091, -79.0215),
  ('cuenca-ec', 'Cuenca', null, 'Azuay', 'EC', 49, -2.9001, -79.0059),
  ('brasilia', 'Brasilia', null, 'Distrito Federal', 'BR', 51, -15.7939, -47.8828),
  ('belo-horizonte', 'Belo Horizonte', null, 'Minas Gerais', 'BR', 51, -19.9167, -43.9345),
  ('curitiba', 'Curitiba', null, 'Paraná', 'BR', 51, -25.4284, -49.2733),
  ('florianopolis', 'Florianópolis', 'Florianopolis', 'Santa Catarina', 'BR', 51, -27.5954, -48.548),
  ('cordoba-ar', 'Córdoba', 'Cordoba', 'Córdoba', 'AR', 52, -31.4201, -64.1888),
  ('rosario', 'Rosario', null, 'Santa Fe', 'AR', 52, -32.9442, -60.6505),
  ('mendoza', 'Mendoza', null, 'Mendoza', 'AR', 52, -32.8895, -68.8458),
  ('valparaiso', 'Valparaíso', 'Valparaiso', 'Valparaíso', 'CL', 53, -33.0472, -71.6127),
  ('vina-del-mar', 'Viña del Mar', 'Vina del Mar', 'Valparaíso', 'CL', 53, -33.0245, -71.5518),
  ('concepcion-cl', 'Concepción', 'Concepcion', 'Biobío', 'CL', 53, -36.827, -73.0503),
  ('antofagasta', 'Antofagasta', null, 'Antofagasta', 'CL', 53, -23.6509, -70.3975),
  ('punta-del-este', 'Punta del Este', null, 'Maldonado', 'UY', 54, -34.962, -54.95),
  ('valencia', 'Valencia', null, 'Comunidad Valenciana', 'ES', 62, 39.4699, -0.3763),
  ('sevilla', 'Sevilla', 'Seville', 'Andalucía', 'ES', 62, 37.3891, -5.9845),
  ('malaga', 'Málaga', 'Malaga', 'Andalucía', 'ES', 62, 36.7213, -4.4214),
  ('bilbao', 'Bilbao', null, 'País Vasco', 'ES', 62, 43.263, -2.935),
  ('manchester', 'Mánchester', 'Manchester', 'Inglaterra', 'GB', 63, 53.4808, -2.2426),
  ('birmingham', 'Birmingham', null, 'Inglaterra', 'GB', 63, 52.4862, -1.8904),
  ('edimburgo', 'Edimburgo', 'Edinburgh', 'Escocia', 'GB', 63, 55.9533, -3.1883),
  ('lyon', 'Lyon', null, 'Auvernia-Ródano-Alpes', 'FR', 64, 45.764, 4.8357),
  ('niza', 'Niza', 'Nice', 'Provenza-Alpes-Costa Azul', 'FR', 64, 43.7102, 7.262),
  ('marsella', 'Marsella', 'Marseille', 'Provenza-Alpes-Costa Azul', 'FR', 64, 43.2965, 5.3698),
  ('hamburgo', 'Hamburgo', 'Hamburg', 'Hamburgo', 'DE', 66, 53.5511, 9.9937),
  ('frankfurt', 'Fráncfort', 'Frankfurt', 'Hesse', 'DE', 66, 50.1109, 8.6821),
  ('dusseldorf', 'Düsseldorf', 'Dusseldorf', 'Renania del Norte-Westfalia', 'DE', 66, 51.2277, 6.7735),
  ('florencia', 'Florencia', 'Florence', 'Toscana', 'IT', 68, 43.7696, 11.2558),
  ('napoles', 'Nápoles', 'Naples', 'Campania', 'IT', 68, 40.8518, 14.2681),
  ('oporto', 'Oporto', 'Porto', 'Norte', 'PT', 69, 41.1579, -8.6291),
  ('ginebra', 'Ginebra', 'Geneva', 'Ginebra', 'CH', 70, 46.2044, 6.1432),
  ('cracovia', 'Cracovia', 'Krakow', 'Pequeña Polonia', 'PL', 71, 50.0647, 19.945),
  ('brno', 'Brno', null, 'Moravia Meridional', 'CZ', 72, 49.1951, 16.6068),
  ('salonica', 'Salónica', 'Thessaloniki', 'Macedonia Central', 'GR', 74, 40.6401, 22.9444),
  ('ankara', 'Ankara', null, 'Ankara', 'TR', 80, 39.9334, 32.8597),
  ('antalya', 'Antalya', null, 'Antalya', 'TR', 80, 36.8969, 30.7133),
  ('esmirna', 'Esmirna', 'Izmir', 'Esmirna', 'TR', 80, 38.4237, 27.1428),
  ('abu-dabi', 'Abu Dabi', 'Abu Dhabi', 'Abu Dabi', 'AE', 81, 24.4539, 54.3773),
  ('bangalore', 'Bangalore', 'Bengaluru', 'Karnataka', 'IN', 83, 12.9716, 77.5946),
  ('chennai', 'Chennai', null, 'Tamil Nadu', 'IN', 83, 13.0827, 80.2707),
  ('phuket', 'Phuket', null, 'Phuket', 'TH', 84, 7.8804, 98.3923),
  ('chiang-mai', 'Chiang Mai', null, 'Chiang Mai', 'TH', 84, 18.7883, 98.9853),
  ('penang', 'Penang', null, 'Penang', 'MY', 85, 5.4141, 100.3288),
  ('busan', 'Busan', null, 'Busan', 'KR', 87, 35.1796, 129.0756),
  ('osaka', 'Osaka', null, 'Osaka', 'JP', 88, 34.6937, 135.5023),
  ('melbourne', 'Melbourne', null, 'Victoria', 'AU', 89, -37.8136, 144.9631),
  ('brisbane', 'Brisbane', null, 'Queensland', 'AU', 89, -27.4698, 153.0251),
  ('johannesburgo', 'Johannesburgo', 'Johannesburg', 'Gauteng', 'ZA', 90, -26.2041, 28.0473);

insert into public.px_ciudades (id, nombre, nombre_en, departamento, pais, orden)
select id, nombre, nombre_en, departamento, pais, orden from px_tmp_destino
on conflict (id) do update set nombre_en = excluded.nombre_en, orden = excluded.orden, activa = true;

-- Nivel de precio de referencia de cada país frente a Colombia (1 = Colombia). Solo para los ejemplos.
create temporary table px_tmp_pais (pais text primary key, factor numeric not null, idioma text not null);
insert into px_tmp_pais values
  ('CO', 1.00, 'Español'), ('US', 3.20, 'Inglés'), ('CA', 2.80, 'Francés'), ('MX', 1.00, 'Español'),
  ('DO', 0.85, 'Español'), ('GT', 0.90, 'Español'), ('CR', 1.10, 'Español'), ('PA', 1.20, 'Español'),
  ('PE', 0.90, 'Español'), ('EC', 0.85, 'Español'), ('BR', 1.10, 'Portugués'), ('AR', 0.90, 'Español'),
  ('CL', 1.30, 'Español'), ('UY', 1.20, 'Español'), ('ES', 1.80, 'Español'), ('GB', 2.60, 'Inglés'),
  ('FR', 2.30, 'Francés'), ('DE', 2.40, 'Alemán'), ('IT', 2.00, 'Italiano'), ('PT', 1.50, 'Portugués'),
  ('CH', 3.30, 'Alemán'), ('PL', 1.10, 'Polaco'), ('CZ', 1.10, 'Checo'), ('HU', 1.00, 'Húngaro'),
  ('GR', 1.30, 'Griego'), ('TR', 0.75, 'Turco'), ('AE', 2.00, 'Árabe'), ('IN', 0.60, 'Hindi'),
  ('TH', 0.80, 'Tailandés'), ('MY', 0.90, 'Malayo'), ('SG', 2.40, 'Chino'), ('KR', 1.40, 'Coreano'),
  ('JP', 2.20, 'Japonés'), ('AU', 2.70, 'Inglés'), ('ZA', 1.00, 'Afrikáans');

-- Precio base de referencia en Colombia (COP) por procedimiento.
create temporary table px_tmp_base (procedimiento_id text primary key, precio bigint not null);
insert into px_tmp_base values
  ('mamoplastia-aumento', 12000000), ('mamoplastia-reduccion', 13000000), ('mastopexia', 13000000),
  ('lipoescultura', 10000000), ('lipoabdominoplastia', 15500000), ('abdominoplastia', 13000000),
  ('gluteoplastia', 14000000), ('rinoplastia', 11000000), ('blefaroplastia', 6000000), ('lifting-facial', 18000000);

-- Ciudades que aún no tienen ninguna institución publicada.
create temporary table px_tmp_vacia as
select d.*, row_number() over (order by d.orden) as k, p.factor, p.idioma
from px_tmp_destino d
join px_tmp_pais p on p.pais = d.pais
where not exists (select 1 from public.px_instituciones i where i.ciudad_id = d.id and i.publicado);

-- Una clínica demo por ciudad (identificadores deterministas para que la migración sea repetible).
insert into public.px_instituciones
  (id, nombre, tipo, ciudad_id, descripcion, descripcion_en, servicios, servicios_en, verificacion, es_demo, publicado, lat, lng, financiacion)
select
  md5('px-demo-inst-' || v.id)::uuid,
  'Clínica Demo ' || v.nombre,
  'clinica',
  v.id,
  'Clínica de demostración en ' || v.nombre || '. Perfil de ejemplo: se reemplazará por una clínica real verificada.',
  'Demo clinic in ' || coalesce(v.nombre_en, v.nombre) || '. Sample profile: it will be replaced by a real, verified clinic.',
  array['Hospitalización', 'Coordinador de pacientes internacionales', 'Valoración virtual'],
  array['Hospital stay', 'International patient coordinator', 'Virtual consultation'],
  'pendiente', true, true,
  v.lat + 0.012 * sin(v.k), v.lng + 0.012 * cos(v.k),
  v.k % 3 = 0
from px_tmp_vacia v
on conflict (id) do nothing;

-- Un cirujano demo por ciudad, sin registro profesional ni sociedad (no se afirma nada que no exista).
insert into public.px_profesionales
  (id, nombre, ciudad_id, anios_experiencia, idiomas, bio, bio_en, especialidad_en, valoracion_virtual, verificacion, es_demo, publicado)
select
  md5('px-demo-prof-' || v.id)::uuid,
  case when v.k % 2 = 0 then 'Dra. Perfil Demo ' else 'Dr. Perfil Demo ' end || v.nombre,
  v.id,
  8 + (v.k * 7) % 15,
  case when v.idioma in ('Español', 'Inglés') then array['Español', 'Inglés'] else array[v.idioma, 'Inglés', 'Español'] end,
  'Perfil ficticio de demostración en ' || v.nombre || '. Se reemplazará por un cirujano real verificado.',
  'Fictitious demo profile in ' || coalesce(v.nombre_en, v.nombre) || '. It will be replaced by a real, verified surgeon.',
  'Plastic, aesthetic and reconstructive surgery',
  true, 'pendiente', true, true
from px_tmp_vacia v
on conflict (id) do nothing;

insert into public.px_profesional_institucion (profesional_id, institucion_id)
select md5('px-demo-prof-' || v.id)::uuid, md5('px-demo-inst-' || v.id)::uuid from px_tmp_vacia v
on conflict do nothing;

-- Siete procedimientos por ciudad (rotan para que no todas ofrezcan lo mismo), con rangos orientativos.
insert into public.px_ofertas
  (id, procedimiento_id, institucion_id, profesional_id, precio_min, precio_max, incluye, incluye_en, no_incluye, no_incluye_en, precio_actualizado_en, publicado)
select
  md5('px-demo-oferta-' || v.id || '-' || b.procedimiento_id)::uuid,
  b.procedimiento_id,
  md5('px-demo-inst-' || v.id)::uuid,
  md5('px-demo-prof-' || v.id)::uuid,
  round(b.precio * v.factor * (0.95 + (v.k % 5) * 0.025) / 100000) * 100000,
  round(b.precio * v.factor * (0.95 + (v.k % 5) * 0.025) * 1.35 / 100000) * 100000,
  'Ejemplo de demostración: honorarios, anestesia, sala de cirugía y controles.',
  'Demo example: surgeon fees, anesthesia, operating room and follow-ups.',
  'Exámenes prequirúrgicos, medicamentos, viaje y alojamiento.',
  'Pre-operative tests, medication, travel and lodging.',
  current_date, true
from px_tmp_vacia v
join public.px_procedimientos p on p.publicado
join px_tmp_base b on b.procedimiento_id = p.id
where (p.orden + v.k) % 10 not in (0, 4, 7)
on conflict (id) do nothing;

-- Un alojamiento demo por ciudad para planear la recuperación.
insert into public.px_alojamientos
  (id, nombre, tipo, ciudad_id, descripcion, descripcion_en, precio_noche_desde, incluye_enfermeria, incluye_alimentacion, es_demo, publicado, lat, lng, capacidad)
select
  md5('px-demo-aloj-' || v.id)::uuid,
  'Hotel de Recuperación Demo ' || v.nombre,
  'hotel',
  v.id,
  'Hotel de demostración cercano a la clínica, con habitaciones tranquilas para la recuperación.',
  'Demo hotel near the clinic, with quiet rooms for recovery.',
  round(260000 * v.factor / 10000) * 10000,
  false, true, true, true,
  v.lat - 0.010 * cos(v.k), v.lng + 0.010 * sin(v.k),
  2
from px_tmp_vacia v
where not exists (select 1 from public.px_alojamientos a where a.ciudad_id = v.id and a.publicado)
on conflict (id) do nothing;

drop table px_tmp_destino, px_tmp_pais, px_tmp_base, px_tmp_vacia;
