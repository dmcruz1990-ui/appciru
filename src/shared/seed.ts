// Datos de demostración. Todos los nombres de clínicas y médicos son FICTICIOS;
// los códigos REPS / ReTHUS son de ejemplo y no corresponden a registros reales.
import type {
  Alojamiento,
  Ciudad,
  Clinica,
  Configuracion,
  Medico,
  Oferta,
  Pedido,
  Procedimiento,
  ServicioExtra,
} from './types'

export const ciudades: Ciudad[] = [
  { id: 'bog', nombre: 'Bogotá', departamento: 'Cundinamarca' },
  { id: 'med', nombre: 'Medellín', departamento: 'Antioquia' },
  { id: 'cal', nombre: 'Cali', departamento: 'Valle del Cauca' },
  { id: 'baq', nombre: 'Barranquilla', departamento: 'Atlántico' },
  { id: 'ctg', nombre: 'Cartagena', departamento: 'Bolívar' },
  { id: 'bga', nombre: 'Bucaramanga', departamento: 'Santander' },
  { id: 'per', nombre: 'Pereira', departamento: 'Risaralda' },
]

export const clinicas: Clinica[] = [
  {
    id: 'cl-1', nombre: 'Clínica Andina de Cirugía', ciudadId: 'bog', direccion: 'Cra 15 # 93-40',
    codigoREPS: '110010000001', acreditadaICONTEC: true, quirofanos: 6, calificacion: 4.8, resenas: 412,
    servicios: ['UCI', 'Banco de sangre', 'Hospitalización', 'Coordinador internacional'],
    descripcion: 'Centro quirúrgico de alta complejidad en el norte de Bogotá, con unidad de cuidado intensivo y atención bilingüe.',
    activo: true, color: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'cl-2', nombre: 'Centro Médico El Poblado', ciudadId: 'med', direccion: 'Calle 7 # 39-120',
    codigoREPS: '050010000002', acreditadaICONTEC: true, quirofanos: 5, calificacion: 4.9, resenas: 678,
    servicios: ['Hospitalización', 'Cámara hiperbárica', 'Drenajes linfáticos', 'Coordinador internacional'],
    descripcion: 'Referente en cirugía plástica en Medellín, con programa completo para pacientes que viajan.',
    activo: true, color: 'from-sky-500 to-indigo-700',
  },
  {
    id: 'cl-3', nombre: 'Clínica Valle Salud', ciudadId: 'cal', direccion: 'Av. Roosevelt # 38-12',
    codigoREPS: '760010000003', acreditadaICONTEC: false, quirofanos: 4, calificacion: 4.7, resenas: 295,
    servicios: ['Hospitalización', 'Laboratorio', 'Fisioterapia'],
    descripcion: 'Clínica especializada en cirugía corporal y bariátrica en el sur occidente colombiano.',
    activo: true, color: 'from-amber-500 to-orange-700',
  },
  {
    id: 'cl-4', nombre: 'Instituto Caribe de Cirugía', ciudadId: 'baq', direccion: 'Cra 51B # 84-150',
    codigoREPS: '080010000004', acreditadaICONTEC: true, quirofanos: 4, calificacion: 4.6, resenas: 188,
    servicios: ['UCI', 'Hospitalización', 'Imágenes diagnósticas'],
    descripcion: 'Alta complejidad en la costa Caribe con enfoque en cirugía plástica y ortopedia.',
    activo: true, color: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'cl-5', nombre: 'Clínica Bahía Cartagena', ciudadId: 'ctg', direccion: 'Bocagrande, Av. San Martín',
    codigoREPS: '130010000005', acreditadaICONTEC: false, quirofanos: 3, calificacion: 4.7, resenas: 241,
    servicios: ['Hospitalización', 'Coordinador internacional', 'Traslados aeropuerto'],
    descripcion: 'Cirugía estética con recuperación frente al mar, muy elegida por pacientes de EE. UU. y Canadá.',
    activo: true, color: 'from-rose-500 to-pink-700',
  },
  {
    id: 'cl-6', nombre: 'Clínica Santander Integral', ciudadId: 'bga', direccion: 'Floridablanca, Autopista',
    codigoREPS: '680010000006', acreditadaICONTEC: true, quirofanos: 8, calificacion: 4.8, resenas: 350,
    servicios: ['UCI', 'Ortopedia', 'Oftalmología', 'Rehabilitación'],
    descripcion: 'Complejo hospitalario con fuerte oferta en ortopedia, oftalmología y odontología.',
    activo: true, color: 'from-violet-500 to-purple-700',
  },
  {
    id: 'cl-7', nombre: 'Clínica Cafetera', ciudadId: 'per', direccion: 'Av. Circunvalar # 12-30',
    codigoREPS: '660010000007', acreditadaICONTEC: false, quirofanos: 3, calificacion: 4.5, resenas: 120,
    servicios: ['Hospitalización', 'Laboratorio'],
    descripcion: 'Precios competitivos y recuperación en el Eje Cafetero.',
    activo: true, color: 'from-lime-500 to-green-700',
  },
]

export const procedimientos: Procedimiento[] = [
  {
    id: 'lipo', nombre: 'Liposucción', categoria: 'corporal',
    descripcion: 'Extracción de grasa localizada para remodelar abdomen, flancos, espalda, brazos o muslos.',
    duracionHoras: 3, anestesia: 'General o raquídea', hospitalizacionNoches: 1, estadiaRecomendadaDias: 10,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', 'Sala de cirugía', 'Faja postquirúrgica', '1 noche de hospitalización', '3 controles'],
    activo: true,
  },
  {
    id: 'lipo-hd', nombre: 'Lipoescultura de alta definición', categoria: 'corporal',
    descripcion: 'Liposucción con marcación muscular (VASER o similar) para un contorno atlético.',
    duracionHoras: 4, anestesia: 'General', hospitalizacionNoches: 1, estadiaRecomendadaDias: 14,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', 'Tecnología VASER', 'Faja y tablas', '5 drenajes linfáticos'],
    activo: true,
  },
  {
    id: 'abdomino', nombre: 'Abdominoplastia', categoria: 'corporal',
    descripcion: 'Retiro de piel y grasa del abdomen con reparación de la pared muscular.',
    duracionHoras: 3.5, anestesia: 'General', hospitalizacionNoches: 1, estadiaRecomendadaDias: 14,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', 'Sala de cirugía', 'Faja', '1 noche de hospitalización'],
    activo: true,
  },
  {
    id: 'mommy', nombre: 'Mommy makeover', categoria: 'corporal',
    descripcion: 'Combinación de abdominoplastia, liposucción y cirugía mamaria en un solo tiempo quirúrgico.',
    duracionHoras: 6, anestesia: 'General', hospitalizacionNoches: 2, estadiaRecomendadaDias: 21,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', 'Implantes', '2 noches de hospitalización', '8 drenajes'],
    activo: true,
  },
  {
    id: 'aumento', nombre: 'Aumento mamario', categoria: 'mamaria',
    descripcion: 'Colocación de implantes de silicona para aumentar volumen y mejorar la forma del busto.',
    duracionHoras: 2, anestesia: 'General', hospitalizacionNoches: 0, estadiaRecomendadaDias: 8,
    incluye: ['Honorarios del cirujano', 'Implantes con garantía', 'Anestesiólogo', 'Brasier postquirúrgico'],
    activo: true,
  },
  {
    id: 'mastopexia', nombre: 'Levantamiento de senos (mastopexia)', categoria: 'mamaria',
    descripcion: 'Reposiciona y reafirma el tejido mamario, con o sin implantes.',
    duracionHoras: 3, anestesia: 'General', hospitalizacionNoches: 1, estadiaRecomendadaDias: 10,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', 'Sala de cirugía', 'Brasier postquirúrgico'],
    activo: true,
  },
  {
    id: 'rino', nombre: 'Rinoplastia', categoria: 'facial',
    descripcion: 'Cirugía de nariz estética y/o funcional.',
    duracionHoras: 2.5, anestesia: 'General', hospitalizacionNoches: 0, estadiaRecomendadaDias: 8,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', 'Férula', '3 controles'],
    activo: true,
  },
  {
    id: 'blefaro', nombre: 'Blefaroplastia', categoria: 'facial',
    descripcion: 'Corrección de párpados superiores y/o inferiores.',
    duracionHoras: 1.5, anestesia: 'Local con sedación', hospitalizacionNoches: 0, estadiaRecomendadaDias: 7,
    incluye: ['Honorarios del cirujano', 'Sedación', 'Retiro de puntos'],
    activo: true,
  },
  {
    id: 'lifting', nombre: 'Lifting facial', categoria: 'facial',
    descripcion: 'Rejuvenecimiento del tercio medio e inferior del rostro y cuello.',
    duracionHoras: 4, anestesia: 'General', hospitalizacionNoches: 1, estadiaRecomendadaDias: 14,
    incluye: ['Honorarios del cirujano', 'Anestesiólogo', '1 noche de hospitalización', 'Controles'],
    activo: true,
  },
  {
    id: 'manga', nombre: 'Manga gástrica', categoria: 'bariatrica',
    descripcion: 'Cirugía bariátrica laparoscópica para pérdida de peso.',
    duracionHoras: 2, anestesia: 'General', hospitalizacionNoches: 2, estadiaRecomendadaDias: 10,
    incluye: ['Cirujano bariatra', 'Anestesiólogo', 'Nutricionista', '2 noches de hospitalización', 'Exámenes prequirúrgicos'],
    activo: true,
  },
  {
    id: 'rodilla', nombre: 'Reemplazo de rodilla', categoria: 'ortopedia',
    descripcion: 'Artroplastia total de rodilla con prótesis.',
    duracionHoras: 2.5, anestesia: 'Raquídea', hospitalizacionNoches: 3, estadiaRecomendadaDias: 21,
    incluye: ['Ortopedista', 'Prótesis', '3 noches de hospitalización', '10 sesiones de fisioterapia'],
    activo: true,
  },
  {
    id: 'carillas', nombre: 'Diseño de sonrisa (carillas)', categoria: 'odontologia',
    descripcion: 'Carillas de porcelana o resina en el sector anterior.',
    duracionHoras: 3, anestesia: 'Local', hospitalizacionNoches: 0, estadiaRecomendadaDias: 6,
    incluye: ['10 carillas de porcelana', 'Diseño digital', 'Limpieza', 'Controles'],
    activo: true,
  },
  {
    id: 'lasik', nombre: 'Cirugía refractiva LASIK', categoria: 'oftalmologia',
    descripcion: 'Corrección de miopía, hipermetropía y astigmatismo con láser.',
    duracionHoras: 0.5, anestesia: 'Gotas anestésicas', hospitalizacionNoches: 0, estadiaRecomendadaDias: 4,
    incluye: ['Ambos ojos', 'Exámenes previos', 'Controles a 1 día y 1 semana'],
    activo: true,
  },
]

export const medicos: Medico[] = [
  {
    id: 'md-1', nombre: 'Dra. Laura Restrepo', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-10293847', sociedad: 'SCCP', ciudadId: 'med', clinicaIds: ['cl-2'], aniosExperiencia: 14,
    cirugiasRealizadas: 3200, calificacion: 4.9, resenas: 512, idiomas: ['Español', 'Inglés'],
    bio: 'Especialista en contorno corporal y lipoescultura de alta definición. Formación complementaria en Brasil.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-2', nombre: 'Dr. Andrés Gómez', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-20394851', sociedad: 'SCCP', ciudadId: 'bog', clinicaIds: ['cl-1'], aniosExperiencia: 18,
    cirugiasRealizadas: 4100, calificacion: 4.8, resenas: 389, idiomas: ['Español', 'Inglés', 'Francés'],
    bio: 'Cirugía mamaria y facial. Profesor universitario y conferencista internacional.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-3', nombre: 'Dra. Carolina Mejía', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-30495862', sociedad: 'SCCP', ciudadId: 'cal', clinicaIds: ['cl-3'], aniosExperiencia: 11,
    cirugiasRealizadas: 2100, calificacion: 4.8, resenas: 276, idiomas: ['Español', 'Inglés'],
    bio: 'Enfocada en abdominoplastia y mommy makeover con protocolos de recuperación rápida.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-4', nombre: 'Dr. Felipe Ospina', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-40596873', sociedad: 'SCCP', ciudadId: 'ctg', clinicaIds: ['cl-5'], aniosExperiencia: 9,
    cirugiasRealizadas: 1500, calificacion: 4.7, resenas: 198, idiomas: ['Español', 'Inglés'],
    bio: 'Rinoplastia y cirugía de párpados. Atención preferente a pacientes internacionales.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-5', nombre: 'Dra. Natalia Vargas', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-50697884', sociedad: 'SCCP', ciudadId: 'baq', clinicaIds: ['cl-4'], aniosExperiencia: 12,
    cirugiasRealizadas: 2600, calificacion: 4.7, resenas: 233, idiomas: ['Español'],
    bio: 'Cirugía corporal y mamaria con enfoque en resultados naturales.',
    valoracionVirtual: false, activo: true,
  },
  {
    id: 'md-6', nombre: 'Dr. Santiago Herrera', especialidad: 'Cirugía bariátrica y laparoscópica',
    rethus: 'RT-60798895', sociedad: 'ACCO', ciudadId: 'cal', clinicaIds: ['cl-3'], aniosExperiencia: 15,
    cirugiasRealizadas: 1800, calificacion: 4.9, resenas: 164, idiomas: ['Español', 'Inglés'],
    bio: 'Programa integral de obesidad con seguimiento nutricional y psicológico.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-7', nombre: 'Dr. Juan Camilo Rojas', especialidad: 'Ortopedia y traumatología',
    rethus: 'RT-70899906', sociedad: 'SCCOT', ciudadId: 'bga', clinicaIds: ['cl-6'], aniosExperiencia: 20,
    cirugiasRealizadas: 5000, calificacion: 4.8, resenas: 301, idiomas: ['Español', 'Inglés'],
    bio: 'Reemplazos articulares de cadera y rodilla con cirugía guiada.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-8', nombre: 'Dra. Paula Castaño', especialidad: 'Rehabilitación oral',
    rethus: 'RT-80900017', ciudadId: 'bga', clinicaIds: ['cl-6'], aniosExperiencia: 10,
    cirugiasRealizadas: 1200, calificacion: 4.9, resenas: 420, idiomas: ['Español', 'Inglés'],
    bio: 'Diseño de sonrisa digital y carillas de porcelana.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-9', nombre: 'Dr. Mauricio Salazar', especialidad: 'Oftalmología',
    rethus: 'RT-91011128', sociedad: 'SCO', ciudadId: 'bog', clinicaIds: ['cl-1'], aniosExperiencia: 16,
    cirugiasRealizadas: 8000, calificacion: 4.8, resenas: 510, idiomas: ['Español', 'Inglés'],
    bio: 'Cirugía refractiva y de cataratas con láser de última generación.',
    valoracionVirtual: false, activo: true,
  },
  {
    id: 'md-10', nombre: 'Dra. Valentina Ríos', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-01122239', sociedad: 'SCCP', ciudadId: 'per', clinicaIds: ['cl-7'], aniosExperiencia: 8,
    cirugiasRealizadas: 950, calificacion: 4.6, resenas: 102, idiomas: ['Español'],
    bio: 'Liposucción y aumento mamario a precios competitivos en el Eje Cafetero.',
    valoracionVirtual: true, activo: true,
  },
  {
    id: 'md-11', nombre: 'Dr. Ricardo Londoño', especialidad: 'Cirugía plástica, estética y reconstructiva',
    rethus: 'RT-12233340', sociedad: 'SCCP', ciudadId: 'med', clinicaIds: ['cl-2'], aniosExperiencia: 22,
    cirugiasRealizadas: 6200, calificacion: 4.9, resenas: 744, idiomas: ['Español', 'Inglés', 'Portugués'],
    bio: 'Lifting facial y cirugía de rejuvenecimiento. Más de dos décadas de experiencia.',
    valoracionVirtual: true, activo: true,
  },
]

// [medicoId, procedimientoId, clinicaId, precio COP]
const tablaOfertas: [string, string, string, number][] = [
  ['md-1', 'lipo', 'cl-2', 11_500_000],
  ['md-1', 'lipo-hd', 'cl-2', 17_800_000],
  ['md-1', 'abdomino', 'cl-2', 15_900_000],
  ['md-1', 'aumento', 'cl-2', 13_200_000],
  ['md-11', 'lifting', 'cl-2', 21_000_000],
  ['md-11', 'blefaro', 'cl-2', 7_400_000],
  ['md-11', 'rino', 'cl-2', 13_500_000],
  ['md-2', 'aumento', 'cl-1', 14_500_000],
  ['md-2', 'mastopexia', 'cl-1', 15_800_000],
  ['md-2', 'rino', 'cl-1', 14_200_000],
  ['md-2', 'lipo', 'cl-1', 12_900_000],
  ['md-3', 'abdomino', 'cl-3', 13_400_000],
  ['md-3', 'mommy', 'cl-3', 24_500_000],
  ['md-3', 'lipo', 'cl-3', 10_200_000],
  ['md-4', 'rino', 'cl-5', 12_100_000],
  ['md-4', 'blefaro', 'cl-5', 6_300_000],
  ['md-4', 'lipo', 'cl-5', 12_400_000],
  ['md-5', 'aumento', 'cl-4', 12_300_000],
  ['md-5', 'mastopexia', 'cl-4', 14_100_000],
  ['md-5', 'mommy', 'cl-4', 26_900_000],
  ['md-6', 'manga', 'cl-3', 24_800_000],
  ['md-7', 'rodilla', 'cl-6', 31_500_000],
  ['md-8', 'carillas', 'cl-6', 11_800_000],
  ['md-9', 'lasik', 'cl-1', 5_900_000],
  ['md-10', 'lipo', 'cl-7', 8_900_000],
  ['md-10', 'aumento', 'cl-7', 10_500_000],
  ['md-10', 'abdomino', 'cl-7', 11_200_000],
]

export const ofertas: Oferta[] = tablaOfertas.map(([medicoId, procedimientoId, clinicaId, precio], i) => ({
  id: `of-${i + 1}`,
  medicoId,
  procedimientoId,
  clinicaId,
  precio,
  activo: true,
}))

export const alojamientos: Alojamiento[] = [
  { id: 'al-1', nombre: 'Casa de Recobro Las Palmas', tipo: 'casa_recobro', ciudadId: 'med', precioNoche: 280_000, calificacion: 4.9, incluyeEnfermeria: true, incluyeAlimentacion: true, distanciaClinicaKm: 2.1, activo: true },
  { id: 'al-2', nombre: 'Hotel Jardín Poblado', tipo: 'hotel', ciudadId: 'med', precioNoche: 350_000, calificacion: 4.6, incluyeEnfermeria: false, incluyeAlimentacion: false, distanciaClinicaKm: 0.8, activo: true },
  { id: 'al-3', nombre: 'Recovery House Usaquén', tipo: 'casa_recobro', ciudadId: 'bog', precioNoche: 300_000, calificacion: 4.8, incluyeEnfermeria: true, incluyeAlimentacion: true, distanciaClinicaKm: 3.0, activo: true },
  { id: 'al-4', nombre: 'Apartamento Chicó 93', tipo: 'apartamento', ciudadId: 'bog', precioNoche: 240_000, calificacion: 4.5, incluyeEnfermeria: false, incluyeAlimentacion: false, distanciaClinicaKm: 0.5, activo: true },
  { id: 'al-5', nombre: 'Hogar de Recuperación Granada', tipo: 'casa_recobro', ciudadId: 'cal', precioNoche: 230_000, calificacion: 4.7, incluyeEnfermeria: true, incluyeAlimentacion: true, distanciaClinicaKm: 1.7, activo: true },
  { id: 'al-6', nombre: 'Hotel Brisas de Bocagrande', tipo: 'hotel', ciudadId: 'ctg', precioNoche: 420_000, calificacion: 4.7, incluyeEnfermeria: false, incluyeAlimentacion: true, distanciaClinicaKm: 0.6, activo: true },
  { id: 'al-7', nombre: 'Casa Recobro Caribe', tipo: 'casa_recobro', ciudadId: 'ctg', precioNoche: 310_000, calificacion: 4.8, incluyeEnfermeria: true, incluyeAlimentacion: true, distanciaClinicaKm: 2.4, activo: true },
  { id: 'al-8', nombre: 'Recobro Alto Prado', tipo: 'casa_recobro', ciudadId: 'baq', precioNoche: 250_000, calificacion: 4.6, incluyeEnfermeria: true, incluyeAlimentacion: true, distanciaClinicaKm: 1.2, activo: true },
  { id: 'al-9', nombre: 'Hotel Cabecera Norte', tipo: 'hotel', ciudadId: 'bga', precioNoche: 260_000, calificacion: 4.5, incluyeEnfermeria: false, incluyeAlimentacion: false, distanciaClinicaKm: 4.0, activo: true },
  { id: 'al-10', nombre: 'Finca de Recobro Cerritos', tipo: 'casa_recobro', ciudadId: 'per', precioNoche: 210_000, calificacion: 4.7, incluyeEnfermeria: true, incluyeAlimentacion: true, distanciaClinicaKm: 6.5, activo: true },
]

export const extras: ServicioExtra[] = [
  { id: 'ex-traslado', nombre: 'Traslados aeropuerto ↔ clínica ↔ alojamiento', descripcion: 'Conductor privado durante toda la estadía para citas y controles.', precio: 450_000, porNoche: false },
  { id: 'ex-enfermera', nombre: 'Enfermera personal', descripcion: 'Acompañamiento de enfermería 12 h al día en tu alojamiento.', precio: 180_000, porNoche: true },
  { id: 'ex-drenajes', nombre: 'Paquete 10 drenajes linfáticos', descripcion: 'Masajes postoperatorios a domicilio.', precio: 600_000, porNoche: false },
  { id: 'ex-traductor', nombre: 'Intérprete / acompañante bilingüe', descripcion: 'Acompañamiento en la cirugía y controles.', precio: 350_000, porNoche: false },
  { id: 'ex-seguro', nombre: 'Seguro de complicaciones', descripcion: 'Cobertura de complicaciones postquirúrgicas hasta por 30 días.', precio: 520_000, porNoche: false },
  { id: 'ex-sim', nombre: 'SIM card + datos', descripcion: 'Línea colombiana con datos para tu estadía.', precio: 60_000, porNoche: false },
]

export const configuracion: Configuracion = { comision: 0.12, tasaUSD: 4000 }

const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000).toISOString()
const en = (dias: number) => new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10)

export const pedidosDemo: Pedido[] = [
  {
    id: 'CIR-1001', creado: hace(6),
    paciente: { nombre: 'Jessica Martínez', email: 'jessica@example.com', telefono: '+1 305 555 0101', pais: 'Estados Unidos', edad: 34 },
    ofertaId: 'of-2', alojamientoId: 'al-1', noches: 14, extraIds: ['ex-traslado', 'ex-drenajes'], fechaDeseada: en(30),
    estado: 'confirmado',
    historial: [
      { fecha: hace(6), estado: 'nuevo', autor: 'paciente' },
      { fecha: hace(5), estado: 'valoracion', autor: 'admin', nota: 'Valoración virtual agendada con la Dra. Restrepo.' },
      { fecha: hace(2), estado: 'confirmado', autor: 'admin', nota: 'Anticipo recibido. Exámenes prequirúrgicos enviados.' },
    ],
    totales: { cirugia: 17_800_000, alojamiento: 3_920_000, extras: 1_050_000, total: 22_770_000 },
  },
  {
    id: 'CIR-1002', creado: hace(3),
    paciente: { nombre: 'Carmen López', email: 'carmen@example.com', telefono: '+34 600 123 456', pais: 'España', edad: 41 },
    ofertaId: 'of-13', alojamientoId: 'al-5', noches: 21, extraIds: ['ex-enfermera'], fechaDeseada: en(45),
    estado: 'valoracion',
    historial: [
      { fecha: hace(3), estado: 'nuevo', autor: 'paciente' },
      { fecha: hace(1), estado: 'valoracion', autor: 'admin', nota: 'Paciente envió fotos. Pendiente valoración.' },
    ],
    totales: { cirugia: 24_500_000, alojamiento: 4_830_000, extras: 3_780_000, total: 33_110_000 },
  },
  {
    id: 'CIR-1003', creado: hace(1),
    paciente: { nombre: 'Michael Brown', email: 'michael@example.com', telefono: '+1 416 555 0199', pais: 'Canadá', edad: 52 },
    ofertaId: 'of-22', alojamientoId: 'al-9', noches: 21, extraIds: ['ex-traslado', 'ex-traductor'], fechaDeseada: en(60),
    estado: 'nuevo',
    historial: [{ fecha: hace(1), estado: 'nuevo', autor: 'paciente' }],
    totales: { cirugia: 31_500_000, alojamiento: 5_460_000, extras: 800_000, total: 37_760_000 },
  },
  {
    id: 'CIR-1004', creado: hace(20),
    paciente: { nombre: 'Daniela Pérez', email: 'daniela@example.com', telefono: '+57 300 555 1234', pais: 'Colombia', edad: 29 },
    ofertaId: 'of-15', noches: 0, extraIds: [], fechaDeseada: en(-5),
    estado: 'completado',
    historial: [
      { fecha: hace(20), estado: 'nuevo', autor: 'paciente' },
      { fecha: hace(18), estado: 'valoracion', autor: 'admin' },
      { fecha: hace(15), estado: 'confirmado', autor: 'admin' },
      { fecha: hace(5), estado: 'en_curso', autor: 'admin', nota: 'Cirugía realizada sin novedad.' },
      { fecha: hace(1), estado: 'completado', autor: 'admin', nota: 'Alta y último control.' },
    ],
    totales: { cirugia: 12_100_000, alojamiento: 0, extras: 0, total: 12_100_000 },
  },
]
