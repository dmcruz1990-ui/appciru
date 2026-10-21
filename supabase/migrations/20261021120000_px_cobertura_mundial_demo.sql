-- Cobertura mundial operativa: todas las ciudades del buscador tienen al menos una opción.
-- Las clínicas, los cirujanos, las ofertas y los alojamientos que crea esta migración son
-- PERFILES DE DEMOSTRACIÓN (es_demo = true, verificación pendiente, sin registros ni sociedades):
-- sirven para mostrar el producto y deben reemplazarse por prestadores reales verificados.

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
  -- Colombia
  ('bogota', 'Bogotá', null, 'Cundinamarca', 'CO', 1, 4.7110, -74.0721),
  ('medellin', 'Medellín', null, 'Antioquia', 'CO', 2, 6.2442, -75.5812),
  ('cali', 'Cali', null, 'Valle del Cauca', 'CO', 3, 3.4516, -76.5320),
  ('cartagena', 'Cartagena', null, 'Bolívar', 'CO', 4, 10.3910, -75.4794),
  ('barranquilla', 'Barranquilla', null, 'Atlántico', 'CO', 5, 10.9685, -74.7813),
  -- Norteamérica
  ('miami', 'Miami', null, 'Florida', 'US', 20, 25.7617, -80.1918),
  ('los-angeles', 'Los Ángeles', 'Los Angeles', 'California', 'US', 21, 34.0522, -118.2437),
  ('nueva-york', 'Nueva York', 'New York', 'Nueva York', 'US', 22, 40.7128, -74.0060),
  ('houston', 'Houston', null, 'Texas', 'US', 23, 29.7604, -95.3698),
  ('dallas', 'Dallas', null, 'Texas', 'US', 24, 32.7767, -96.7970),
  ('toronto', 'Toronto', null, 'Ontario', 'CA', 26, 43.6532, -79.3832),
  ('montreal', 'Montreal', null, 'Quebec', 'CA', 27, 45.5017, -73.5673),
  ('vancouver', 'Vancouver', null, 'Columbia Británica', 'CA', 28, 49.2827, -123.1207),
  ('ciudad-de-mexico', 'Ciudad de México', 'Mexico City', 'CDMX', 'MX', 30, 19.4326, -99.1332),
  ('tijuana', 'Tijuana', null, 'Baja California', 'MX', 31, 32.5149, -117.0382),
  ('guadalajara', 'Guadalajara', null, 'Jalisco', 'MX', 32, 20.6597, -103.3496),
  ('monterrey', 'Monterrey', null, 'Nuevo León', 'MX', 33, 25.6866, -100.3161),
  ('cancun', 'Cancún', 'Cancun', 'Quintana Roo', 'MX', 34, 21.1619, -86.8515),
  -- Caribe y Centroamérica
  ('santo-domingo', 'Santo Domingo', null, 'Distrito Nacional', 'DO', 40, 18.4861, -69.9312),
  ('punta-cana', 'Punta Cana', null, 'La Altagracia', 'DO', 41, 18.5601, -68.3725),
  ('ciudad-de-guatemala', 'Ciudad de Guatemala', 'Guatemala City', 'Guatemala', 'GT', 44, 14.6349, -90.5069),
  ('san-jose-cr', 'San José', null, 'San José', 'CR', 45, 9.9281, -84.0907),
  ('ciudad-de-panama', 'Ciudad de Panamá', 'Panama City', 'Panamá', 'PA', 46, 8.9824, -79.5199),
  -- Suramérica
  ('lima', 'Lima', null, 'Lima', 'PE', 47, -12.0464, -77.0428),
  ('quito', 'Quito', null, 'Pichincha', 'EC', 48, -0.1807, -78.4678),
  ('guayaquil', 'Guayaquil', null, 'Guayas', 'EC', 49, -2.1710, -79.9224),
  ('sao-paulo', 'São Paulo', null, 'São Paulo', 'BR', 50, -23.5505, -46.6333),
  ('rio-de-janeiro', 'Río de Janeiro', 'Rio de Janeiro', 'Río de Janeiro', 'BR', 51, -22.9068, -43.1729),
  ('buenos-aires', 'Buenos Aires', null, 'Buenos Aires', 'AR', 52, -34.6037, -58.3816),
  ('santiago-cl', 'Santiago', null, 'Región Metropolitana', 'CL', 53, -33.4489, -70.6693),
  ('montevideo', 'Montevideo', null, 'Montevideo', 'UY', 54, -34.9011, -56.1645),
  -- Europa
  ('madrid', 'Madrid', null, 'Comunidad de Madrid', 'ES', 60, 40.4168, -3.7038),
  ('barcelona', 'Barcelona', null, 'Cataluña', 'ES', 61, 41.3874, 2.1686),
  ('marbella', 'Marbella', null, 'Andalucía', 'ES', 62, 36.5101, -4.8825),
  ('londres', 'Londres', 'London', 'Inglaterra', 'GB', 63, 51.5074, -0.1278),
  ('paris', 'París', 'Paris', 'Île-de-France', 'FR', 64, 48.8566, 2.3522),
  ('berlin', 'Berlín', 'Berlin', 'Berlín', 'DE', 65, 52.5200, 13.4050),
  ('munich', 'Múnich', 'Munich', 'Baviera', 'DE', 66, 48.1351, 11.5820),
  ('roma', 'Roma', 'Rome', 'Lacio', 'IT', 67, 41.9028, 12.4964),
  ('milan', 'Milán', 'Milan', 'Lombardía', 'IT', 68, 45.4642, 9.1900),
  ('lisboa', 'Lisboa', 'Lisbon', 'Lisboa', 'PT', 69, 38.7223, -9.1393),
  ('zurich', 'Zúrich', 'Zurich', 'Zúrich', 'CH', 70, 47.3769, 8.5417),
  ('varsovia', 'Varsovia', 'Warsaw', 'Mazovia', 'PL', 71, 52.2297, 21.0122),
  ('praga', 'Praga', 'Prague', 'Praga', 'CZ', 72, 50.0755, 14.4378),
  ('budapest', 'Budapest', null, 'Budapest', 'HU', 73, 47.4979, 19.0402),
  ('atenas', 'Atenas', 'Athens', 'Ática', 'GR', 74, 37.9838, 23.7275),
  -- Medio Oriente, Asia, Oceanía y África
  ('estambul', 'Estambul', 'Istanbul', 'Estambul', 'TR', 80, 41.0082, 28.9784),
  ('dubai', 'Dubái', 'Dubai', 'Dubái', 'AE', 81, 25.2048, 55.2708),
  ('nueva-delhi', 'Nueva Delhi', 'New Delhi', 'Delhi', 'IN', 82, 28.6139, 77.2090),
  ('bombay', 'Bombay', 'Mumbai', 'Maharashtra', 'IN', 83, 19.0760, 72.8777),
  ('bangkok', 'Bangkok', null, 'Bangkok', 'TH', 84, 13.7563, 100.5018),
  ('kuala-lumpur', 'Kuala Lumpur', null, 'Kuala Lumpur', 'MY', 85, 3.1390, 101.6869),
  ('singapur', 'Singapur', 'Singapore', 'Singapur', 'SG', 86, 1.3521, 103.8198),
  ('seul', 'Seúl', 'Seoul', 'Seúl', 'KR', 87, 37.5665, 126.9780),
  ('tokio', 'Tokio', 'Tokyo', 'Tokio', 'JP', 88, 35.6762, 139.6503),
  ('sidney', 'Sídney', 'Sydney', 'Nueva Gales del Sur', 'AU', 89, -33.8688, 151.2093),
  ('ciudad-del-cabo', 'Ciudad del Cabo', 'Cape Town', 'Cabo Occidental', 'ZA', 90, -33.9249, 18.4241);

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
