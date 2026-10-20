-- Cobertura mundial: cada ciudad pertenece a un país (código ISO 3166-1 alfa-2).
-- «departamento» pasa a significar estado, provincia o departamento según el país.
alter table public.px_ciudades add column if not exists pais text not null default 'CO';
alter table public.px_ciudades add constraint px_ciudades_pais check (pais ~ '^[A-Z]{2}$');
create index if not exists px_ciudades_pais_idx on public.px_ciudades (pais);

-- Principales destinos de cirugía plástica. Las ciudades sin clínicas aparecen como «Próximamente» en el buscador.
insert into public.px_ciudades (id, nombre, departamento, pais, orden) values
  ('bogota', 'Bogotá', 'Cundinamarca', 'CO', 1),
  ('medellin', 'Medellín', 'Antioquia', 'CO', 2),
  ('cali', 'Cali', 'Valle del Cauca', 'CO', 3),
  ('cartagena', 'Cartagena', 'Bolívar', 'CO', 4),
  ('barranquilla', 'Barranquilla', 'Atlántico', 'CO', 5),
  ('miami', 'Miami', 'Florida', 'US', 20),
  ('los-angeles', 'Los Ángeles', 'California', 'US', 21),
  ('nueva-york', 'Nueva York', 'Nueva York', 'US', 22),
  ('houston', 'Houston', 'Texas', 'US', 23),
  ('dallas', 'Dallas', 'Texas', 'US', 24),
  ('ciudad-de-mexico', 'Ciudad de México', 'CDMX', 'MX', 30),
  ('tijuana', 'Tijuana', 'Baja California', 'MX', 31),
  ('guadalajara', 'Guadalajara', 'Jalisco', 'MX', 32),
  ('monterrey', 'Monterrey', 'Nuevo León', 'MX', 33),
  ('cancun', 'Cancún', 'Quintana Roo', 'MX', 34),
  ('santo-domingo', 'Santo Domingo', 'Distrito Nacional', 'DO', 40),
  ('punta-cana', 'Punta Cana', 'La Altagracia', 'DO', 41),
  ('san-jose-cr', 'San José', 'San José', 'CR', 45),
  ('ciudad-de-panama', 'Ciudad de Panamá', 'Panamá', 'PA', 46),
  ('lima', 'Lima', 'Lima', 'PE', 47),
  ('sao-paulo', 'São Paulo', 'São Paulo', 'BR', 50),
  ('rio-de-janeiro', 'Río de Janeiro', 'Río de Janeiro', 'BR', 51),
  ('buenos-aires', 'Buenos Aires', 'Buenos Aires', 'AR', 52),
  ('madrid', 'Madrid', 'Comunidad de Madrid', 'ES', 60),
  ('barcelona', 'Barcelona', 'Cataluña', 'ES', 61),
  ('marbella', 'Marbella', 'Andalucía', 'ES', 62),
  ('estambul', 'Estambul', 'Estambul', 'TR', 70),
  ('dubai', 'Dubái', 'Dubái', 'AE', 71),
  ('seul', 'Seúl', 'Seúl', 'KR', 72),
  ('bangkok', 'Bangkok', 'Bangkok', 'TH', 73)
on conflict (id) do nothing;

-- Las ciudades del Eje Cafetero (piloto) quedan después de las grandes ciudades de Colombia.
update public.px_ciudades c set orden = v.o
from (values ('pereira', 6), ('dosquebradas', 7), ('armenia', 8), ('manizales', 9), ('cartago', 10)) v(id, o)
where c.id = v.id;
