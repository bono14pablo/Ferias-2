const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../public/assets/aistudio/distribucion_cargos_base_merlo_completo_74568a16.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  result.push(cur.trim());
  return result;
}

const lines = csvContent.split('\n').filter(l => l.trim().length > 0).slice(1);
const rows = lines.map(parseCSVLine);

// 35 Units of BAM Merlo
const UNIT_MAPPING = {
  'JEFATURA': { id: 'dep-merlo-jefatura', name: 'Jefatura de Base', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Jefatura de Base', code: 'JEF-MERLO', desc: 'Comando y conducción de la Base Aérea Militar Merlo, enlace institucional y supervisión operativa general.' },
  'OFICINA DE GÉNERO': { id: 'dep-merlo-genero', name: 'Oficina de Género', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Oficina Especial', code: 'OFIGEN-MERLO', desc: 'Atención, asesoramiento y promoción de políticas de género e igualdad en el ámbito de la unidad.' },
  'DIVISIÓN RELACIONES INSTITUCIONALES': { id: 'dep-merlo-rr-ii', name: 'División Relaciones Institucionales', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'División de Estado Mayor', code: 'RRII-MERLO', desc: 'Ceremonial, relaciones públicas, comunicación social y prensa, enlace institucional y oficina técnica de infraestructura.' },
  'DIVISIÓN ASUNTOS JURÍDICOS': { id: 'dep-merlo-juridico', name: 'División Asuntos Jurídicos', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Asesoría Letrada', code: 'ASJUR-MERLO', desc: 'Asesoramiento letrado a la Jefatura, sumarios militares, causas judiciales y dictámenes reglamentarios.' },
  'DEPARTAMENTO OPERACIONES': { id: 'dep-merlo-operaciones', name: 'Departamento Operaciones', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Departamento Operativo', code: 'DPTO-OPS', desc: 'Planificación de operaciones, control de gestión, inteligencia (MSCIA), puesto comando, instrucción centralizada y deportes.' },
  'DIVISIÓN ECONOMÍA': { id: 'dep-merlo-economia', name: 'División Economía', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'División Administrativa', code: 'DIV-ECON', desc: 'Ejecución presupuestaria, anteproyecto de presupuesto y Unidad Operativa de Compras (UOC).' },
  'DIVISIÓN PERSONAL': { id: 'dep-merlo-personal', name: 'División Personal', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'División de Personal', code: 'DIV-PERS', desc: 'Administración de personal militar superior, subalterno, personal civil y mesa general de entradas y salidas.' },
  'DIVISIÓN CONTADURÍA': { id: 'dep-merlo-contaduria', name: 'División Contaduría', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'División Contable y Financiera', code: 'DIV-CONT', desc: 'Tesorería, contabilidad fiscal, balances de rendición y auditoría financiera de la unidad.' },
  'DIVISIÓN PREVAC-SEGURIDAD E HIGIENE EN EL TRABAJO AMBIENTAL': { id: 'dep-merlo-prevac', name: 'División PREVAC y Seguridad Ambiental', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'División de Prevención', code: 'PREVAC-MERLO', desc: 'Prevención de accidentes, seguridad e higiene ocupacional y mitigación de impacto ambiental.' },
  'DIVISIÓN CONTROL DE CARGOS': { id: 'dep-merlo-cargos', name: 'División Control de Cargos', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'División de Fiscalización', code: 'CARGOS-MERLO', desc: 'Fiscalización patrimonial, auditoría de cargos de material y control de inventarios de la unidad.' },
  'CASINO DE OFICIALES': { id: 'dep-merlo-casino-of', name: 'Casino de Oficiales', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Servicio de Bienestar', code: 'CAS-OF-MERLO', desc: 'Alojamiento, racionamiento, recreación y bienestar del personal militar superior destinado o en tránsito.' },
  'CASINO DE SUBOFICIALES': { id: 'dep-merlo-casino-so', name: 'Casino de Suboficiales', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Servicio de Bienestar', code: 'CAS-SO-MERLO', desc: 'Alojamiento, bienestar, comedor y servicios sociales del cuadro de suboficiales de la base.' },
  
  // Escuadrón I VYCA
  'ESCUADRÓN I VYCA': { id: 'dep-merlo-esc-vyca', name: 'Escuadrón I VYCA (Vigilancia y Control)', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Escuadrón Operativo', code: 'ESC-I-VYCA', desc: 'Operación permanente de los sistemas de radar de alerta temprana, vigilancia aeroespacial y vectorización aérea táctica.' },
  'SIACOM': { id: 'dep-merlo-siacom', name: 'SIACOM - Sistema Integrado de Alerta y Control', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio Técnico Operativo', code: 'SIACOM-MERLO', desc: 'Comando de la red de alerta y control, guerra electrónica y centro de operaciones COVYCA Merlo.' },
  'SERVICIO METEOROLOGÍA': { id: 'dep-merlo-meteo', name: 'Servicio Meteorología', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio Operativo', code: 'MET-MERLO', desc: 'Pronóstico de aeródromo, estación meteorológica, sensores remotos e información climática para operaciones.' },
  'SERVICIO ADIESTRAMIENTO': { id: 'dep-merlo-adiestramiento', name: 'Servicio Adiestramiento Operativo', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio de Adiestramiento', code: 'ADIEST-VYCA', desc: 'Simulador de radar, cursos operacionales y entrenamiento continuo de los controladores aeroespaciales.' },
  'SERVICIO OPERACIONES': { id: 'dep-merlo-serv-operaciones', name: 'Servicio Operaciones y ROA', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio Operativo', code: 'OPS-VYCA', desc: 'Alistamiento operacional táctico, medidas de control aeroespacial, evaluación de sitio y Red de Observadores del Aire (ROA).' },
  'SERVICIO DE ANÁLISIS DATOS RADAR': { id: 'dep-merlo-analisis-radar', name: 'Servicio de Análisis Datos Radar', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio Técnico Operativo', code: 'AN-RADAR', desc: 'Registro, desgrabación, archivo, análisis de datos de trazas radar y apoyo técnico a investigaciones operativas.' },
  'SERVICIO ESTACIÓN RADAR (MER/VGY)': { id: 'dep-merlo-estacion-radar', name: 'Servicio Estación Radar (Merlo / Villaguay)', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Estación Radar', code: 'EST-RADAR', desc: 'Operación continua del radar 3D primario/secundario en Merlo y del destacamento radar en Villaguay (Entre Ríos).' },
  'SERVICIO PRODUCCIÓN DE MOVIMIENTO AÉREO GENERAL': { id: 'dep-merlo-mov-aereo', name: 'Servicio Producción Movimiento Aéreo', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio de Tránsito Aéreo', code: 'MOV-AEREO', desc: 'Consolidación de planes de vuelo, detección, identificación y vigilancia del movimiento aéreo general.' },
  'SERVICIO DE CONTROL AEROESPACIAL': { id: 'dep-merlo-control-aeroespacial', name: 'Servicio de Control Aeroespacial', parent: 'dep-merlo-esc-vyca', nivel: 5, nivelNombre: 'Servicio de Control', code: 'CTRL-AERO', desc: 'Coordinación táctica de espacio aéreo de defensa y control e interceptación guiada de tránsito aéreo irregular.' },

  // Escuadrón VYCA Escuela
  'ESCUADRÒN VYCA ESCUELA': { id: 'dep-merlo-esc-escuela', name: 'Escuadrón VYCA Escuela', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Escuadrón de Instrucción', code: 'ESC-VYCA-ESC', desc: 'Formación y especialización de oficiales, suboficiales y cursantes en control aeroespacial y radar.' },
  'SERVICIO ENSEÑANZA': { id: 'dep-merlo-ensenanza', name: 'Servicio Enseñanza y Regencia', parent: 'dep-merlo-esc-escuela', nivel: 5, nivelNombre: 'Servicio Académico', code: 'ENS-ESC', desc: 'Planificación pedagógica, claustro docente, regencia y gabinete psicopedagógico de la escuela.' },
  'SERVICIO APOYO LOGÍSTICO': { id: 'dep-merlo-apoyo-log', name: 'Servicio Apoyo Logístico a Cursos', parent: 'dep-merlo-esc-escuela', nivel: 5, nivelNombre: 'Servicio de Apoyo Académico', code: 'AP-LOG-ESC', desc: 'Soporte de aulas, biblioteca técnica y logística a los cursos de Oficial VYCA, Mecánico de Radar y Operador de Radar.' },

  // Escuadrón Base
  'ESCUADRÓN BASE': { id: 'dep-merlo-esc-base', name: 'Escuadrón Base', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Escuadrón de Apoyo', code: 'ESC-BASE-MERLO', desc: 'Servicios de apoyo a la vida y operación de la unidad: seguridad terrestre, mantenimiento, abastecimiento y sanidad.' },
  'SERVICIO ABASTECIMIENTO': { id: 'dep-merlo-abastecimiento', name: 'Servicio Abastecimiento e Intendencia', parent: 'dep-merlo-esc-base', nivel: 5, nivelNombre: 'Servicio Logístico', code: 'ABAST-MERLO', desc: 'Almacén general, centro de costos, detall, depósito de intendencia, recepción y expedición y OCAM.' },
  'SERVICIOS GENERALES': { id: 'dep-merlo-serv-grales', name: 'Servicios Generales y Mantenimiento', parent: 'dep-merlo-esc-base', nivel: 5, nivelNombre: 'Servicio de Infraestructura', code: 'SERV-GRALES', desc: 'Conservación edilicia, albañilería, electricidad, herrería, carpintería, automotores y parques.' },
  'SERVICIOS ESPECIALES': { id: 'dep-merlo-serv-especiales', name: 'Servicios Especiales (Comunicaciones e IT)', parent: 'dep-merlo-esc-base', nivel: 5, nivelNombre: 'Servicio Técnico', code: 'SERV-ESP', desc: 'Redes de datos, telefonía militar, soporte informático, telecomunicaciones de seguridad y sala de armas.' },
  'SERVICIO SANIDAD': { id: 'dep-merlo-sanidad', name: 'Servicio Sanidad Militar', parent: 'dep-merlo-esc-base', nivel: 5, nivelNombre: 'Servicio Médico', code: 'SAN-MERLO', desc: 'Atención médica de urgencia, consultorio general, odontología, farmacia y gabinete psicofísico.' },
  'COMPAÑÍA TROPA': { id: 'dep-merlo-tropa', name: 'Compañía Tropa y Seguridad', parent: 'dep-merlo-esc-base', nivel: 5, nivelNombre: 'Compañía Operativa', code: 'CIA-TROPA', desc: 'Seguridad y custodia perimetral, guardia militar permanente 24h, instrucción de soldados voluntarios y orden de base.' },

  // Escuadrón Técnico
  'ESCUADRÓN TÉCNICO': { id: 'dep-merlo-esc-tecnico', name: 'Escuadrón Técnico', parent: 'dep-bam-merlo', nivel: 4, nivelNombre: 'Escuadrón de Mantenimiento', code: 'ESC-TEC-MERLO', desc: 'Mantenimiento preventivo, correctivo y de escalón mayor de sensores de radar 3D y sistemas de comunicación asociados.' },
  'SERVICIO PLANIFICACIÓN Y CONTROL': { id: 'dep-merlo-tec-planificacion', name: 'Servicio Planificación y Control Técnico', parent: 'dep-merlo-esc-tecnico', nivel: 5, nivelNombre: 'Servicio Técnico', code: 'PLAN-TEC', desc: 'Planificación técnica, monitoreo remoto de sistemas, catalogación SIL y control de órdenes de trabajo.' },
  'SERVICIO DE CALIDAD': { id: 'dep-merlo-tec-calidad', name: 'Servicio de Calidad e Inspección', parent: 'dep-merlo-esc-tecnico', nivel: 5, nivelNombre: 'Servicio de Aseguramiento', code: 'CALIDAD-TEC', desc: 'Inspección técnica reglamentaria, control de aseguramiento de calidad e ingeniería de mantenimiento.' },
  'SERVICIO INSPECCIÓN Y RECAMBIO': { id: 'dep-merlo-tec-inspeccion', name: 'Servicio Inspección y Recambio de Radar', parent: 'dep-merlo-esc-tecnico', nivel: 5, nivelNombre: 'Servicio Técnico de Radar', code: 'INSP-RADAR', desc: 'Mantenimiento de radares móviles y fijos, enlaces de radiofrecuencia y recambio de módulos electrónicos.' },
  'SERVICIÓ TALLERES': { id: 'dep-merlo-tec-talleres', name: 'Servicio Talleres y Laboratorios', parent: 'dep-merlo-esc-tecnico', nivel: 5, nivelNombre: 'Servicio de Talleres', code: 'TALLERES-TEC', desc: 'Laboratorio de microelectrónica, talleres de generadores y equipos auxiliares, calibración e instrumental.' }
};

// 33 Officers map by legajo digits
const EXISTING_OFFICERS = [
  { id: 'int-of-1', apellido: 'Burgos', nombre: 'Pablo Ignacio', legajoNum: '101264', nroIosfa: '101.264', gradoId: 'gr-of-5', dni: '23.411.890', sexo: 'M', email: 'pburgos@faa.mil.ar' },
  { id: 'int-of-2', apellido: 'Arballo', nombre: 'Angel Daniel', legajoNum: '101819', nroIosfa: '101.819', gradoId: 'gr-of-6', dni: '24.120.334', sexo: 'M', email: 'darballo@faa.mil.ar' },
  { id: 'int-of-3', apellido: 'Valenti', nombre: 'Ricardo Cristian', legajoNum: '101616', nroIosfa: '101.616', gradoId: 'gr-of-6', dni: '23.998.412', sexo: 'M', email: 'rvalenti@faa.mil.ar' },
  { id: 'int-of-4', apellido: 'Hermida', nombre: 'Martin Manuel', legajoNum: '101838', nroIosfa: '101.838', gradoId: 'gr-of-7', dni: '25.044.112', sexo: 'M', email: 'mhermida@faa.mil.ar' },
  { id: 'int-of-5', apellido: 'Nieto', nombre: 'Carla Maria Lujan', legajoNum: '101856', nroIosfa: '101.856', gradoId: 'gr-of-7', dni: '25.689.441', sexo: 'F', email: 'cnieto@faa.mil.ar' },
  { id: 'int-of-6', apellido: 'Torres', nombre: 'Gabriel Damian', legajoNum: '102168', nroIosfa: '102.168', gradoId: 'gr-of-7', dni: '26.115.890', sexo: 'M', email: 'gtorres@faa.mil.ar' },
  { id: 'int-of-7', apellido: 'Valazza', nombre: 'Emilio David', legajoNum: '102169', nroIosfa: '102.169', gradoId: 'gr-of-7', dni: '26.432.198', sexo: 'M', email: 'evalazza@faa.mil.ar' },
  { id: 'int-of-8', apellido: 'Burgueño', nombre: 'Mariana Elizabeth', legajoNum: '102931', nroIosfa: '102.931', gradoId: 'gr-of-7', dni: '26.890.312', sexo: 'F', email: 'mburgueno@faa.mil.ar' },
  { id: 'int-of-9', apellido: 'Moreno', nombre: 'Gerardo Ulises', legajoNum: '102632', nroIosfa: '102.632', gradoId: 'gr-of-8', dni: '27.441.980', sexo: 'M', email: 'gmoreno@faa.mil.ar' },
  { id: 'int-of-10', apellido: 'Aguirre', nombre: 'Gonzalo Sebastian', legajoNum: '102692', nroIosfa: '102.692', gradoId: 'gr-of-8', dni: '27.912.445', sexo: 'M', email: 'gaguirre@faa.mil.ar' },
  { id: 'int-of-11', apellido: 'Zapata', nombre: 'Jonathan Alejandro', legajoNum: '102847', nroIosfa: '102.847', gradoId: 'gr-of-8', dni: '28.140.672', sexo: 'M', email: 'jzapata@faa.mil.ar' },
  { id: 'int-of-12', apellido: 'Jara', nombre: 'Carolina Alejandra', legajoNum: '102978', nroIosfa: '102.978', gradoId: 'gr-of-8', dni: '28.650.312', sexo: 'F', email: 'cjara@faa.mil.ar' },
  { id: 'int-of-13', apellido: 'Varvaro', nombre: 'Carlos Ivan', legajoNum: '103114', nroIosfa: '103.114', gradoId: 'gr-of-8', dni: '29.012.339', sexo: 'M', email: 'cvarvaro@faa.mil.ar' },
  { id: 'int-of-14', apellido: 'Alvarez', nombre: 'Nicolas', legajoNum: '103124', nroIosfa: '103.124', gradoId: 'gr-of-8', dni: '29.330.125', sexo: 'M', email: 'nalvarez@faa.mil.ar' },
  { id: 'int-of-15', apellido: 'Mansilla', nombre: 'Agustin Nicolas', legajoNum: '103268', nroIosfa: '103.268', gradoId: 'gr-of-8', dni: '29.780.441', sexo: 'M', email: 'nmansilla@faa.mil.ar' },
  { id: 'int-of-16', apellido: 'Puñales Montero', nombre: 'Johanna', legajoNum: '103358', nroIosfa: '103.358', gradoId: 'gr-of-8', dni: '30.119.890', sexo: 'F', email: 'jpunales@faa.mil.ar' },
  { id: 'int-of-17', apellido: 'Tolaba', nombre: 'Maximiliano Marcelo', legajoNum: '103373', nroIosfa: '103.373', gradoId: 'gr-of-8', dni: '30.450.712', sexo: 'M', email: 'mtolaba@faa.mil.ar' },
  { id: 'int-of-18', apellido: 'Saravia', nombre: 'Florencia Nadia', legajoNum: '103397', nroIosfa: '103.397', gradoId: 'gr-of-8', dni: '30.880.123', sexo: 'F', email: 'fsaravia@faa.mil.ar' },
  { id: 'int-of-19', apellido: 'Karpintchuk', nombre: 'Jorge Rolando', legajoNum: '199191', nroIosfa: '199.191', gradoId: 'gr-of-8', dni: '24.990.110', sexo: 'M', email: 'jkarpintchuk@faa.mil.ar' },
  { id: 'int-of-20', apellido: 'Erbetta', nombre: 'Ignacio Tomas', legajoNum: '103503', nroIosfa: '103.503', gradoId: 'gr-of-9', dni: '31.229.450', sexo: 'M', email: 'ierbetta@faa.mil.ar' },
  { id: 'int-of-21', apellido: 'Paredes', nombre: 'Mauro Luis', legajoNum: '103509', nroIosfa: '103.509', gradoId: 'gr-of-9', dni: '31.550.812', sexo: 'M', email: 'mparedes@faa.mil.ar' },
  { id: 'int-of-22', apellido: 'Gonzalez', nombre: 'Mauro Andres', legajoNum: '103813', nroIosfa: '103.813', gradoId: 'gr-of-9', dni: '32.190.412', sexo: 'M', email: 'mgonzalez@faa.mil.ar' },
  { id: 'int-of-23', apellido: 'Ander Egg', nombre: 'Luciano Mauricio', legajoNum: '103972', nroIosfa: '103.972', gradoId: 'gr-of-9', dni: '32.610.745', sexo: 'M', email: 'landeregg@faa.mil.ar' },
  { id: 'int-of-24', apellido: 'Vacca', nombre: 'Yanina Beatriz', legajoNum: '104141', nroIosfa: '104.141', gradoId: 'gr-of-9', dni: '33.045.890', sexo: 'F', email: 'yvacca@faa.mil.ar' },
  { id: 'int-of-25', apellido: 'Correa Muñoz', nombre: 'Yanet Maricel', legajoNum: '103886', nroIosfa: '103.886', gradoId: 'gr-of-10', dni: '33.512.901', sexo: 'F', email: 'ycorrea@faa.mil.ar' },
  { id: 'int-of-26', apellido: 'Avalos', nombre: 'Jose Gabriel', legajoNum: '103888', nroIosfa: '103.888', gradoId: 'gr-of-10', dni: '33.890.114', sexo: 'M', email: 'javalos@faa.mil.ar' },
  { id: 'int-of-27', apellido: 'Gainza', nombre: 'Micaela Ingrid', legajoNum: '104023', nroIosfa: '104.023', gradoId: 'gr-of-10', dni: '34.220.551', sexo: 'F', email: 'mgainza@faa.mil.ar' },
  { id: 'int-of-28', apellido: 'Leiva', nombre: 'Enzo Gabriel', legajoNum: '104147', nroIosfa: '104.147', gradoId: 'gr-of-10', dni: '34.612.390', sexo: 'M', email: 'eleiva@faa.mil.ar' },
  { id: 'int-of-29', apellido: 'Sosa', nombre: 'Carolina Marlene', legajoNum: '104299', nroIosfa: '104.299', gradoId: 'gr-of-11', dni: '35.120.441', sexo: 'F', email: 'csosa@faa.mil.ar' },
  { id: 'int-of-30', apellido: 'Loza', nombre: 'Esteven Dario', legajoNum: '104448', nroIosfa: '104.448', gradoId: 'gr-of-11', dni: '35.789.012', sexo: 'M', email: 'eloza@faa.mil.ar' },
  { id: 'int-of-31', apellido: 'Pieszczek', nombre: 'Ailen Celine', legajoNum: '104449', nroIosfa: '104.449', gradoId: 'gr-of-11', dni: '36.145.220', sexo: 'F', email: 'apieszczek@faa.mil.ar' },
  { id: 'int-of-32', apellido: 'Rivero', nombre: 'Elian Jorge', legajoNum: '104450', nroIosfa: '104.450', gradoId: 'gr-of-11', dni: '36.520.198', sexo: 'M', email: 'erivero@faa.mil.ar' },
  { id: 'int-of-33', apellido: 'Conti Marcozzi', nombre: 'Diego Gabriel', legajoNum: '104452', nroIosfa: '104.452', gradoId: 'gr-of-11', dni: '36.910.450', sexo: 'M', email: 'dmarcozzi@faa.mil.ar' }
];

// Parser for Person string in CSV
function parsePersonEntry(raw) {
  if (!raw) return null;
  let str = raw.trim().replace(/^"+|"+$/g, '').trim();
  if (['a designar', 'jefe (sdf)', 'vacante', 'vacante.'].includes(str.toLowerCase())) return null;
  if (str.startsWith(',')) str = str.slice(1).trim();

  let escalafon = '';
  let legajo = '';
  const parenMatch = str.match(/\(([^)]+)\)$/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    const numMatch = inside.match(/(\d[\d\.\s]+)/);
    if (numMatch) {
      legajo = numMatch[1].replace(/\s+/g, '').replace(/\.$/, '');
      escalafon = inside.replace(numMatch[1], '').replace(/[\.\s]+$/, '').trim();
    } else {
      escalafon = inside;
    }
    str = str.replace(/\([^)]+\)$/, '').trim();
  }

  let gradoId = 'gr-so-7';
  let categoria = 'SUBOFICIAL';
  let cleanName = str;

  const patterns = [
    { re: /^Com\.\s*/i, gid: 'gr-of-5', cat: 'OFICIAL' },
    { re: /^Vcom\.\s*/i, gid: 'gr-of-6', cat: 'OFICIAL' },
    { re: /^My\.\s*/i, gid: 'gr-of-7', cat: 'OFICIAL' },
    { re: /^Cap\.\s*,?\s*/i, gid: 'gr-of-8', cat: 'OFICIAL' },
    { re: /^(1º|1°|1er\.?)\s*Ten\.\s*/i, gid: 'gr-of-9', cat: 'OFICIAL' },
    { re: /^Ten\.\s*/i, gid: 'gr-of-10', cat: 'OFICIAL' },
    { re: /^Alf\.\s*/i, gid: 'gr-of-11', cat: 'OFICIAL' },
    { re: /^S\.\s*M\.\s*|^SM\s+/i, gid: 'gr-so-1', cat: 'SUBOFICIAL' },
    { re: /^S\.\s*P\.\s*|^SP\s+/i, gid: 'gr-so-2', cat: 'SUBOFICIAL' },
    { re: /^S\.\s*A\.\s*|^SA\s+/i, gid: 'gr-so-3', cat: 'SUBOFICIAL' },
    { re: /^S\.\s*Aux\.\s*|^SAux\s+/i, gid: 'gr-so-4', cat: 'SUBOFICIAL' },
    { re: /^C\.\s*P\.\s*|^CP\s+/i, gid: 'gr-so-5', cat: 'SUBOFICIAL' },
    { re: /^(C\.\s*1[°º]|C1[°º]?)\s*/i, gid: 'gr-so-6', cat: 'SUBOFICIAL' },
    { re: /^(Cº|C°|Co|Cabo|C\.)\s*/i, gid: 'gr-so-7', cat: 'SUBOFICIAL' },
    { re: /^SV\s*[-I1]\s*|^SV\s*I\b/i, gid: 'gr-vo-1', cat: 'VOLUNTARIO' },
    { re: /^SV\s*[-II2]\s*|^SV\s*II\b/i, gid: 'gr-vo-2', cat: 'VOLUNTARIO' },
    { re: /^SV\b/i, gid: 'gr-vo-2', cat: 'VOLUNTARIO' },
    { re: /^(Prof\.|Doc\.|Tec\.)\s*/i, gid: 'gr-ci-1', cat: 'CIVIL' },
    { re: /^Adm\.\s*/i, gid: 'gr-ci-2', cat: 'CIVIL' },
    { re: /^MyS\s*/i, gid: 'gr-ci-3', cat: 'CIVIL' }
  ];

  for (const p of patterns) {
    if (p.re.test(cleanName)) {
      gradoId = p.gid;
      categoria = p.cat;
      cleanName = cleanName.replace(p.re, '').trim();
      break;
    }
  }

  // Parse name into apellido and nombre
  let apellido = '';
  let nombre = '';
  const nameParts = cleanName.split(/\s+/);
  const upperIndices = [];
  nameParts.forEach((part, idx) => {
    if (part === part.toUpperCase() && part.length > 1 && !/^\d+$/.test(part)) {
      upperIndices.push(idx);
    }
  });

  if (upperIndices.length > 0 && upperIndices.length < nameParts.length) {
    const sur = [];
    const nom = [];
    nameParts.forEach((p, idx) => {
      if (upperIndices.includes(idx)) sur.push(p);
      else nom.push(p);
    });
    apellido = sur.join(' ');
    nombre = nom.join(' ');
  } else if (nameParts.length >= 2) {
    apellido = nameParts[nameParts.length - 1];
    nombre = nameParts.slice(0, -1).join(' ');
  } else {
    apellido = cleanName;
    nombre = '';
  }

  return {
    raw,
    cleanName,
    apellido: apellido || cleanName,
    nombre: nombre || '',
    gradoId,
    categoria,
    escalafon: escalafon || 'GENERAL',
    legajo: legajo || ''
  };
}

// 4. Group CSV rows by person
const peopleMap = new Map();

rows.forEach((r, idx) => {
  const [unit, sec, cargo, personRaw] = r;
  const parsed = parsePersonEntry(personRaw);
  if (!parsed) return;

  const legDigits = parsed.legajo ? parsed.legajo.replace(/\D/g, '') : '';
  const key = legDigits && legDigits.length >= 3 
    ? 'LEG_' + legDigits 
    : 'NAME_' + parsed.cleanName.toLowerCase().replace(/[^a-z]/g, '');

  if (!peopleMap.has(key)) {
    peopleMap.set(key, {
      key,
      legDigits,
      parsed,
      assignments: []
    });
  }
  peopleMap.get(key).assignments.push({ unit, sec, cargo, line: idx + 2 });
});

// 5. Match with existing 33 officers
const matchedOfficerKeys = new Set();
const finalOfficers = [];

EXISTING_OFFICERS.forEach(of => {
  const digits = of.legajoNum;
  let personGroup = null;
  for (const [k, group] of peopleMap.entries()) {
    if (group.legDigits === digits || group.parsed.apellido.toLowerCase() === of.apellido.toLowerCase()) {
      personGroup = group;
      matchedOfficerKeys.add(k);
      break;
    }
  }

  let primaryUnit = 'JEFATURA';
  let primaryCargo = 'Oficial de Estado Mayor';
  let secundarias = [];

  if (personGroup && personGroup.assignments.length > 0) {
    const nonSpf = personGroup.assignments.find(a => !a.cargo.includes('(SPF)'));
    const prim = nonSpf || personGroup.assignments[0];
    primaryUnit = prim.unit;
    primaryCargo = prim.cargo + (prim.sec ? ` (${prim.sec})` : '');

    personGroup.assignments.forEach(a => {
      const roleStr = `${a.cargo} - ${a.unit}${a.sec ? ' / ' + a.sec : ''}`;
      if (!secundarias.includes(roleStr) && roleStr !== primaryCargo) {
        secundarias.push(roleStr);
      }
    });
  }

  const mappedDep = UNIT_MAPPING[primaryUnit] || UNIT_MAPPING['JEFATURA'];

  finalOfficers.push({
    id: of.id,
    legajoNumero: `LEG-OF-${of.legajoNum}`,
    dni: of.dni,
    apellido: of.apellido,
    nombre: of.nombre,
    categoria: 'OFICIAL',
    gradoId: of.gradoId,
    dependenciaId: mappedDep.id,
    puestoPrincipal: primaryCargo,
    funcionesSecundarias: secundarias.length > 0 ? secundarias : ['Comando y Control', 'Supervisión de Turno'],
    superiorInmediatoId: of.id === 'int-of-1' ? 'int-sup-3' : 'int-of-1',
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '2005-02-01',
    antiguedadAnios: 20,
    fechaNacimiento: '1982-05-14',
    lugarNacimiento: 'Buenos Aires, Argentina',
    domicilio: 'Barrio Aeronáutico Merlo, Buenos Aires',
    telefono: '+54 11 4483-5000',
    email: of.email,
    grupoSanguineo: '0+',
    nroIosfa: of.nroIosfa,
    sexo: of.sexo,
    cuerpo: 'COMANDO',
    escalafon: 'AIRE',
    especialidadPrimaria: 'VIGILANCIA Y CONTROL AEROESPACIAL',
    especialidadAvanzada: 'DEFENSA AEROESPACIAL Y RADAR 3D',
    fechaEgreso: '2008-12-10',
    fechaUltimoAscenso: '2023-12-31',
    aniosGradoActual: 2,
    destinoNombre: 'BAM MERLO',
    fechaUltimoDestino: '2022-01-15',
    aniosEnDestino: 3,
    observacionesLaborales: 'Destinado en Base Aérea Militar Merlo.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      {
        parentesco: 'Cónyuge / Familiar',
        nombreCompleto: `Familiar de ${of.apellido}`,
        telefono: '+54 11 4483-5001',
        esContactoEmergencia: true
      }
    ],
    usuarioId: of.id === 'int-of-1' ? 'usr-1' : (of.id === 'int-of-2' ? 'usr-4' : (of.id === 'int-of-13' ? 'usr-6' : (of.id === 'int-of-22' ? 'usr-7' : undefined)))
  });
});

// 6. Build the remaining personnel
const otherPersonnel = [];
let soCounter = 1;
let voCounter = 1;
let ciCounter = 1;

for (const [k, group] of peopleMap.entries()) {
  if (matchedOfficerKeys.has(k)) continue;
  const p = group.parsed;
  
  const nonSpf = group.assignments.find(a => !a.cargo.includes('(SPF)'));
  const prim = nonSpf || group.assignments[0];
  const mappedDep = UNIT_MAPPING[prim.unit] || UNIT_MAPPING['JEFATURA'];

  const secondary = [];
  group.assignments.forEach(a => {
    const roleStr = `${a.cargo} - ${a.unit}${a.sec ? ' / ' + a.sec : ''}`;
    if (!secondary.includes(roleStr)) secondary.push(roleStr);
  });

  let id = '';
  if (p.categoria === 'SUBOFICIAL') {
    id = `int-so-${soCounter++}`;
  } else if (p.categoria === 'VOLUNTARIO') {
    id = `int-vo-${voCounter++}`;
  } else if (p.categoria === 'CIVIL') {
    id = `int-ci-${ciCounter++}`;
  } else {
    id = `int-of-extra-${soCounter++}`;
  }

  const legNumber = p.legajo ? p.legajo : `${Math.floor(200000 + Math.random() * 800000)}`;
  const dniNum = `${Math.floor(28 + Math.random() * 18)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}`;

  otherPersonnel.push({
    id,
    legajoNumero: `LEG-${legNumber.replace(/\./g, '')}`,
    dni: dniNum,
    apellido: p.apellido,
    nombre: p.nombre,
    categoria: p.categoria,
    gradoId: p.gradoId,
    dependenciaId: mappedDep.id,
    puestoPrincipal: prim.cargo + (prim.sec ? ` (${prim.sec})` : ''),
    funcionesSecundarias: secondary.slice(1),
    superiorInmediatoId: mappedDep.parent === 'dep-bam-merlo' ? 'int-of-1' : 'int-of-2',
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '2015-03-01',
    antiguedadAnios: 9,
    fechaNacimiento: '1992-06-15',
    lugarNacimiento: 'Buenos Aires, Argentina',
    domicilio: 'Merlo, Prov. de Buenos Aires',
    telefono: '+54 11 4483-5000',
    email: `${p.apellido.toLowerCase().replace(/[^a-z]/g, '')}@faa.mil.ar`,
    grupoSanguineo: '0+',
    nroIosfa: legNumber,
    sexo: 'M',
    cuerpo: p.categoria === 'CIVIL' ? 'PERSONAL CIVIL' : 'SERVICIOS',
    escalafon: p.escalafon || 'GENERAL',
    especialidadPrimaria: p.escalafon || 'APOYO OPERATIVO',
    fechaUltimoAscenso: '2022-12-31',
    destinoNombre: 'BAM MERLO',
    fechaUltimoDestino: '2022-01-10',
    aniosEnDestino: 3,
    observacionesLaborales: 'Personal orgánico destinado en Base Aérea Militar Merlo.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      {
        parentesco: 'Familiar Principal',
        nombreCompleto: `Familiar de ${p.apellido}`,
        telefono: '+54 11 4483-5001',
        esContactoEmergencia: true
      }
    ]
  });
}

// 7. Higher Command & Suboficial Bono
const HIGH_COMMAND = [
  {
    id: 'int-sup-1',
    legajoNumero: 'LEG-OF-100001',
    dni: '17.482.110',
    apellido: 'Valverde',
    nombre: 'Gustavo Javier',
    categoria: 'OFICIAL',
    gradoId: 'gr-of-1',
    dependenciaId: 'dep-emgfaa',
    puestoPrincipal: 'Jefe del Estado Mayor General de la Fuerza Aérea Argentina (JEMGFAA)',
    funcionesSecundarias: ['Comando Superior Aeronáutico', 'Conducción Estratégica del Poder Aeroespacial', 'Máxima Autoridad Orgánica FAA'],
    superiorInmediatoId: null,
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '1985-02-15',
    antiguedadAnios: 41,
    fechaNacimiento: '1965-08-14',
    lugarNacimiento: 'Córdoba, Argentina',
    domicilio: 'Edificio Cóndor / Residencia Militar Olivos',
    telefono: '+54 11 4317-6000',
    email: 'gvalverde@faa.mil.ar',
    grupoSanguineo: '0+',
    nroIosfa: '100.001',
    sexo: 'M',
    cuerpo: 'COMANDO',
    escalafon: 'AIRE',
    especialidadPrimaria: 'PILOTO',
    especialidadAvanzada: 'CAZA / ESTRATEGIA',
    fechaEgreso: '1988-12-10',
    fechaUltimoAscenso: '2024-01-01',
    aniosGradoActual: 2,
    destinoNombre: 'EMGFAA',
    fechaUltimoDestino: '2024-01-05',
    aniosEnDestino: 2,
    observacionesLaborales: 'Jefe del Estado Mayor General de la FAA designado por Decreto Presidencial.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      { parentesco: 'Esposa', nombreCompleto: 'Familiar de Valverde', telefono: '+54 11 4317-6001', esContactoEmergencia: true }
    ],
    usuarioId: 'usr-valverde'
  },
  {
    id: 'int-sup-2',
    legajoNumero: 'LEG-OF-100045',
    dni: '18.239.540',
    apellido: 'Monetto',
    nombre: 'Marcelo José',
    categoria: 'OFICIAL',
    gradoId: 'gr-of-3',
    dependenciaId: 'dep-subemgfaa',
    puestoPrincipal: 'Subjefe del Estado Mayor General de la Fuerza Aérea Argentina (SUBJEMGFAA)',
    funcionesSecundarias: ['Supervisión General del Estado Mayor', 'Coordinación Interfuerzas', 'Gestión Institucional'],
    superiorInmediatoId: 'int-sup-1',
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '1987-02-10',
    antiguedadAnios: 39,
    fechaNacimiento: '1966-11-20',
    lugarNacimiento: 'Rosario, Santa Fe',
    domicilio: 'CABA, Argentina',
    telefono: '+54 11 4317-6010',
    email: 'mmonetto@faa.mil.ar',
    grupoSanguineo: 'A+',
    nroIosfa: '100.045',
    sexo: 'M',
    cuerpo: 'COMANDO',
    escalafon: 'AIRE',
    especialidadPrimaria: 'PILOTO',
    especialidadAvanzada: 'TRANSPORTE AÉREO',
    fechaEgreso: '1990-12-10',
    fechaUltimoAscenso: '2024-01-01',
    aniosGradoActual: 2,
    destinoNombre: 'SUBEMGFAA',
    fechaUltimoDestino: '2024-01-10',
    aniosEnDestino: 2,
    observacionesLaborales: 'Subjefe del Estado Mayor General.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      { parentesco: 'Familiar', nombreCompleto: 'Familiar de Monetto', telefono: '+54 11 4317-6011', esContactoEmergencia: true }
    ],
    usuarioId: 'usr-monetto'
  },
  {
    id: 'int-sup-3',
    legajoNumero: 'LEG-OF-100080',
    dni: '18.910.220',
    apellido: 'Leiva',
    nombre: 'Aníbal Hernán',
    categoria: 'OFICIAL',
    gradoId: 'gr-of-3',
    dependenciaId: 'dep-comater',
    puestoPrincipal: 'Comandante de Adiestramiento y Alistamiento (COMATER)',
    funcionesSecundarias: ['Comando Operativo FAA', 'Alistamiento de Brigadas y Bases Aéreas', 'Operaciones Militares de Defensa'],
    superiorInmediatoId: 'int-sup-1',
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '1988-02-15',
    antiguedadAnios: 38,
    fechaNacimiento: '1967-04-12',
    lugarNacimiento: 'Paraná, Entre Ríos',
    domicilio: 'Provincia de Buenos Aires',
    telefono: '+54 11 4317-6050',
    email: 'aniballeiva@faa.mil.ar',
    grupoSanguineo: 'B+',
    nroIosfa: '100.080',
    sexo: 'M',
    cuerpo: 'COMANDO',
    escalafon: 'AIRE',
    especialidadPrimaria: 'PILOTO MILITAR',
    especialidadAvanzada: 'OPERACIONES AEROESPACIALES CONJUNTAS',
    fechaEgreso: '1991-12-15',
    fechaUltimoAscenso: '2024-01-01',
    aniosGradoActual: 2,
    destinoNombre: 'COMATER',
    fechaUltimoDestino: '2024-01-12',
    aniosEnDestino: 2,
    observacionesLaborales: 'Comandante Operativo de la FAA.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      { parentesco: 'Familiar', nombreCompleto: 'Familiar de Leiva', telefono: '+54 11 4317-6051', esContactoEmergencia: true }
    ],
    usuarioId: 'usr-leiva'
  },
  {
    id: 'int-sup-4',
    legajoNumero: 'LEG-OF-100092',
    dni: '19.450.880',
    apellido: 'Villegas Campos',
    nombre: 'Gonzalo',
    categoria: 'OFICIAL',
    gradoId: 'gr-of-3',
    dependenciaId: 'dep-em-comater',
    puestoPrincipal: 'Jefe del Estado Mayor del Comando de Adiestramiento y Alistamiento',
    funcionesSecundarias: ['Jefatura de Estado Mayor COMATER', 'Planificación Operativa y Doctrina', 'Coordinación de Medios'],
    superiorInmediatoId: 'int-sup-3',
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '1989-02-15',
    antiguedadAnios: 37,
    fechaNacimiento: '1968-09-03',
    lugarNacimiento: 'Mendoza, Argentina',
    domicilio: 'Provincia de Buenos Aires',
    telefono: '+54 11 4317-6055',
    email: 'gvillegascampos@faa.mil.ar',
    grupoSanguineo: '0+',
    nroIosfa: '100.092',
    sexo: 'M',
    cuerpo: 'COMANDO',
    escalafon: 'AIRE',
    especialidadPrimaria: 'PILOTO MILITAR',
    especialidadAvanzada: 'ESTADO MAYOR',
    fechaEgreso: '1992-12-10',
    fechaUltimoAscenso: '2024-01-01',
    aniosGradoActual: 2,
    destinoNombre: 'JEM COMATER',
    fechaUltimoDestino: '2024-01-15',
    aniosEnDestino: 2,
    observacionesLaborales: 'Jefe de Estado Mayor de COMATER.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      { parentesco: 'Familiar', nombreCompleto: 'Familiar de Villegas', telefono: '+54 11 4317-6056', esContactoEmergencia: true }
    ],
    usuarioId: 'usr-villegas'
  },
  {
    id: 'int-bono',
    legajoNumero: 'LEG-SO-201882',
    dni: '27.892.441',
    apellido: 'Bono',
    nombre: 'Juan Pablo',
    categoria: 'SUBOFICIAL',
    gradoId: 'gr-so-2',
    dependenciaId: 'dep-merlo-serv-especiales',
    puestoPrincipal: 'Encargado de Sistemas y Telecomunicaciones Militares',
    funcionesSecundarias: ['Supervisión Técnica de Redes Militares', 'Operador Principal ERP Institucional', 'Control de Enlaces Criptográficos'],
    superiorInmediatoId: 'int-of-22',
    estadoRevista: 'SERVICIO_ACTIVO',
    fechaIngreso: '2004-03-01',
    antiguedadAnios: 22,
    fechaNacimiento: '1980-08-20',
    lugarNacimiento: 'Morón, Buenos Aires',
    domicilio: 'Av. Libertador 450, Merlo, Buenos Aires',
    telefono: '+54 11 4483-5010',
    email: 'jpbono@faa.mil.ar',
    grupoSanguineo: 'A+',
    nroIosfa: '201.882',
    sexo: 'M',
    cuerpo: 'SERVICIOS',
    escalafon: 'COMUNICACIONES',
    especialidadPrimaria: 'TELECOMUNICACIONES',
    especialidadAvanzada: 'CIBERDEFENSA Y SISTEMAS RADAR',
    fechaEgreso: '2006-12-01',
    fechaUltimoAscenso: '2021-12-31',
    aniosGradoActual: 4,
    destinoNombre: 'BAM MERLO',
    fechaUltimoDestino: '2019-02-01',
    aniosEnDestino: 7,
    observacionesLaborales: 'Encargado del Sistema Informático y Telecomunicaciones de BAM Merlo.',
    situacionRevistaCodigo: 'SE',
    esVeterano: false,
    contactosFamiliares: [
      { parentesco: 'Cónyuge', nombreCompleto: 'Silvia Bono', telefono: '+54 11 4483-5011', esContactoEmergencia: true }
    ],
    usuarioId: 'usr-bono'
  }
];

const ALL_INTEGRANTES = [...HIGH_COMMAND, ...finalOfficers, ...otherPersonnel];

// 8. Build DEPENDENCIAS_DATA
const DEPENDENCIAS = [
  {
    id: 'dep-emgfaa',
    codigo: 'EMGFAA',
    denominacion: 'Estado Mayor General de la Fuerza Aérea Argentina',
    nivel: 1,
    nivelNombre: 'Comando General / Estado Mayor General',
    dependenciaPadreId: null,
    responsableId: 'int-sup-1',
    funciones: 'Conducción superior, planificación estratégica, administración institucional y comando supremo de la Fuerza Aérea Argentina.',
    activa: true,
    fechaCreacion: '1945-01-04'
  },
  {
    id: 'dep-subemgfaa',
    codigo: 'SUBEMGFAA',
    denominacion: 'Subjefatura del Estado Mayor General de la Fuerza Aérea',
    nivel: 2,
    nivelNombre: 'Subjefatura de Estado Mayor',
    dependenciaPadreId: 'dep-emgfaa',
    responsableId: 'int-sup-2',
    funciones: 'Asistencia inmediata a la JEMGFAA, control de la gestión de los organismos dependientes.',
    activa: true,
    fechaCreacion: '1945-01-04'
  },
  {
    id: 'dep-comater',
    codigo: 'COMATER',
    denominacion: 'Comando de Adiestramiento y Alistamiento (COMATER)',
    nivel: 2,
    nivelNombre: 'Comando Operativo Mayor',
    dependenciaPadreId: 'dep-emgfaa',
    responsableId: 'int-sup-3',
    funciones: 'Alistamiento, instrucción, adiestramiento y empleo operacional de los medios aéreos y terrestres de la FAA.',
    activa: true,
    fechaCreacion: '2011-01-01'
  },
  {
    id: 'dep-em-comater',
    codigo: 'JEM-COMATER',
    denominacion: 'Estado Mayor del Comando de Adiestramiento y Alistamiento',
    nivel: 3,
    nivelNombre: 'Estado Mayor de Comando',
    dependenciaPadreId: 'dep-comater',
    responsableId: 'int-sup-4',
    funciones: 'Planificación de operaciones aéreas conjuntas y supervisión operativa de Brigadas y Bases Aéreas Militares.',
    activa: true,
    fechaCreacion: '2011-01-01'
  },
  {
    id: 'dep-bam-merlo',
    codigo: 'BAM-MERLO',
    denominacion: 'Base Aérea Militar Merlo (BAM Merlo)',
    nivel: 3,
    nivelNombre: 'Base Aérea Militar / Centro de Vigilancia Aeroespacial',
    dependenciaPadreId: 'dep-comater',
    responsableId: 'int-of-1',
    funciones: 'Sede del Centro de Vigilancia y Control Aeroespacial (VYCA), control radar del espacio aéreo soberano nacional 24/7 y apoyo logístico y operativo.',
    activa: true,
    fechaCreacion: '1952-11-20'
  }
];

Object.entries(UNIT_MAPPING).forEach(([k, u]) => {
  let respId = 'int-of-1';
  if (u.id === 'dep-merlo-jefatura') respId = 'int-of-1';
  else if (u.id === 'dep-merlo-genero') respId = 'int-of-12';
  else if (u.id === 'dep-merlo-rr-ii') respId = 'int-of-7';
  else if (u.id === 'dep-merlo-juridico') respId = 'int-of-8';
  else if (u.id === 'dep-merlo-prevac') respId = 'int-of-3';
  else if (u.id === 'dep-merlo-casino-of') respId = 'int-of-2';
  else if (u.id === 'dep-merlo-casino-so') respId = 'int-of-7';
  else if (u.id === 'dep-merlo-operaciones') respId = 'int-of-18';
  else if (u.id === 'dep-merlo-economia') respId = 'int-of-27';
  else if (u.id === 'dep-merlo-personal') respId = 'int-of-16';
  else if (u.id === 'dep-merlo-contaduria') respId = 'int-of-11';
  else if (u.id === 'dep-merlo-esc-vyca') respId = 'int-of-2';
  else if (u.id === 'dep-merlo-siacom') respId = 'int-of-17';
  else if (u.id === 'dep-merlo-meteo') respId = 'int-of-3';
  else if (u.id === 'dep-merlo-adiestramiento') respId = 'int-of-17';
  else if (u.id === 'dep-merlo-serv-operaciones') respId = 'int-of-13';
  else if (u.id === 'dep-merlo-analisis-radar') respId = 'int-of-13';
  else if (u.id === 'dep-merlo-estacion-radar') respId = 'int-of-26';
  else if (u.id === 'dep-merlo-control-aeroespacial') respId = 'int-of-12';
  else if (u.id === 'dep-merlo-esc-escuela') respId = 'int-of-12';
  else if (u.id === 'dep-merlo-esc-base') respId = 'int-of-14';
  else if (u.id === 'dep-merlo-abastecimiento') respId = 'int-of-20';
  else if (u.id === 'dep-merlo-serv-grales') respId = 'int-of-15';
  else if (u.id === 'dep-merlo-serv-especiales') respId = 'int-of-22';
  else if (u.id === 'dep-merlo-sanidad') respId = 'int-of-4';
  else if (u.id === 'dep-merlo-tropa') respId = 'int-of-15';
  else if (u.id === 'dep-merlo-esc-tecnico') respId = 'int-of-7';
  else if (u.id === 'dep-merlo-tec-talleres') respId = 'int-of-21';

  DEPENDENCIAS.push({
    id: u.id,
    codigo: u.code,
    denominacion: u.name,
    nivel: u.nivel,
    nivelNombre: u.nivelNombre,
    dependenciaPadreId: u.parent,
    responsableId: respId,
    funciones: u.desc,
    activa: true,
    fechaCreacion: '1952-11-20'
  });
});

// Build PRESENTISMO_DATA array for both 2026-10-24 and 2026-10-19
const dates = ['2026-10-24', '2026-10-19'];
const PRESENTISMO_RECORDS = [];

dates.forEach(fecha => {
  ALL_INTEGRANTES.forEach((integ, index) => {
    let situacion = 'PRESENTE';
    let horaEntrada = '07:00';
    let observaciones = 'Presente en puesto de revista ordinario.';

    if ((index + (fecha === '2026-10-19' ? 3 : 0)) % 17 === 0) {
      situacion = 'GUARDIA_ACTIVA';
      horaEntrada = '06:45';
      observaciones = 'Cumpliendo servicio de guardia operativa de 24 horas.';
    } else if ((index + (fecha === '2026-10-19' ? 5 : 0)) % 29 === 0) {
      situacion = 'COMISION';
      horaEntrada = '08:00';
      observaciones = 'Comisión oficial de servicio en Destacamento Radar Villaguay.';
    } else if (index % 37 === 0) {
      situacion = 'LICENCIA_ORDINARIA';
      horaEntrada = undefined;
      observaciones = 'Licencia anual reglamentaria con visto bueno de Jefatura.';
    } else if (index % 53 === 0) {
      situacion = 'LICENCIA_MEDICA';
      horaEntrada = undefined;
      observaciones = 'Parte médico registrado con atención en Servicio de Sanidad.';
    }

    PRESENTISMO_RECORDS.push({
      id: `pres-bam-${fecha}-${integ.id}`,
      fecha,
      integranteId: integ.id,
      dependenciaId: integ.dependenciaId,
      situacion,
      horaEntrada,
      observaciones,
      validadoPorId: 'int-of-1',
      validado: true
    });
  });
});

// Construct the TypeScript code
const tsCodeParts = [
`import {
  GradoJerarquico,
  Dependencia,
  Integrante,
  UsuarioSistema,
  RegistroPresentismo,
  Guardia24h,
  ComisionServicio,
  TareaCadenaMando,
  SolicitudLicencia,
  RegistroAuditoria,
  DocumentoLegajo,
  MovimientoHistorial,
  SolicitudLegajo
} from '../types/erp';

export const GRADOS_DATA: GradoJerarquico[] = [
  // OFICIALES - FUERZA AÉREA ARGENTINA (FAA)
  { id: 'gr-of-1', codigo: 'BG', denominacion: 'Brigadier General', abreviatura: 'Brig. Gral.', categoria: 'OFICIAL', ordenPrecedencia: 1 },
  { id: 'gr-of-2', codigo: 'BM', denominacion: 'Brigadier Mayor', abreviatura: 'Brig. My.', categoria: 'OFICIAL', ordenPrecedencia: 2 },
  { id: 'gr-of-3', codigo: 'BR', denominacion: 'Brigadier', abreviatura: 'Brig.', categoria: 'OFICIAL', ordenPrecedencia: 3 },
  { id: 'gr-of-4', codigo: 'CMM', denominacion: 'Comodoro Mayor', abreviatura: 'Com. My.', categoria: 'OFICIAL', ordenPrecedencia: 4 },
  { id: 'gr-of-5', codigo: 'CM', denominacion: 'Comodoro', abreviatura: 'Com.', categoria: 'OFICIAL', ordenPrecedencia: 5 },
  { id: 'gr-of-6', codigo: 'VC', denominacion: 'Vicecomodoro', abreviatura: 'Vcom.', categoria: 'OFICIAL', ordenPrecedencia: 6 },
  { id: 'gr-of-7', codigo: 'MY', denominacion: 'Mayor', abreviatura: 'My.', categoria: 'OFICIAL', ordenPrecedencia: 7 },
  { id: 'gr-of-8', codigo: 'CP', denominacion: 'Capitán', abreviatura: 'Cap.', categoria: 'OFICIAL', ordenPrecedencia: 8 },
  { id: 'gr-of-9', codigo: '1T', denominacion: 'Primer Teniente', abreviatura: '1er. Ten.', categoria: 'OFICIAL', ordenPrecedencia: 9 },
  { id: 'gr-of-10', codigo: 'TN', denominacion: 'Teniente', abreviatura: 'Ten.', categoria: 'OFICIAL', ordenPrecedencia: 10 },
  { id: 'gr-of-11', codigo: 'AF', denominacion: 'Alférez', abreviatura: 'Alf.', categoria: 'OFICIAL', ordenPrecedencia: 11 },
  
  // SUBOFICIALES - FUERZA AÉREA ARGENTINA (FAA)
  { id: 'gr-so-1', codigo: 'SM', denominacion: 'Suboficial Mayor', abreviatura: 'Subof. My.', categoria: 'SUBOFICIAL', ordenPrecedencia: 12 },
  { id: 'gr-so-2', codigo: 'SP', denominacion: 'Suboficial Principal', abreviatura: 'Subof. Ppal.', categoria: 'SUBOFICIAL', ordenPrecedencia: 13 },
  { id: 'gr-so-3', codigo: 'SA', denominacion: 'Suboficial Ayudante', abreviatura: 'Subof. Ay.', categoria: 'SUBOFICIAL', ordenPrecedencia: 14 },
  { id: 'gr-so-4', codigo: 'SX', denominacion: 'Suboficial Auxiliar', abreviatura: 'Subof. Aux.', categoria: 'SUBOFICIAL', ordenPrecedencia: 15 },
  { id: 'gr-so-5', codigo: 'CP', denominacion: 'Cabo Principal', abreviatura: 'Cabo Ppal.', categoria: 'SUBOFICIAL', ordenPrecedencia: 16 },
  { id: 'gr-so-6', codigo: 'C1', denominacion: 'Cabo Primero', abreviatura: 'Cabo 1ro.', categoria: 'SUBOFICIAL', ordenPrecedencia: 17 },
  { id: 'gr-so-7', codigo: 'CB', denominacion: 'Cabo', abreviatura: 'Cabo', categoria: 'SUBOFICIAL', ordenPrecedencia: 18 },
  
  // TROPA VOLUNTARIA - FUERZA AÉREA ARGENTINA (FAA)
  { id: 'gr-vo-1', codigo: 'V1', denominacion: 'Soldado Voluntario de 1ra', abreviatura: 'Vol. 1ra', categoria: 'VOLUNTARIO', ordenPrecedencia: 19 },
  { id: 'gr-vo-2', codigo: 'V2', denominacion: 'Soldado Voluntario de 2da', abreviatura: 'Vol. 2da', categoria: 'VOLUNTARIO', ordenPrecedencia: 20 },
  
  // PERSONAL CIVIL
  { id: 'gr-ci-1', codigo: 'PCS', denominacion: 'Personal Civil Superior / Docente / Técnico', abreviatura: 'PC. Sup.', categoria: 'CIVIL', ordenPrecedencia: 21 },
  { id: 'gr-ci-2', codigo: 'PCA', denominacion: 'Personal Civil Administrativo', abreviatura: 'PC. Adm.', categoria: 'CIVIL', ordenPrecedencia: 22 },
  { id: 'gr-ci-3', codigo: 'PCSERV', denominacion: 'Personal Civil de Maestranza y Servicios', abreviatura: 'PC. Serv.', categoria: 'CIVIL', ordenPrecedencia: 23 },
];`,

`export const DEPENDENCIAS_DATA: Dependencia[] = ` + JSON.stringify(DEPENDENCIAS, null, 2) + `;`,

`export const INTEGRANTES_DATA: Integrante[] = ` + JSON.stringify(ALL_INTEGRANTES, null, 2) + `;`,

`export const USUARIOS_DATA: UsuarioSistema[] = [
  {
    id: 'usr-valverde',
    username: 'gvalverde',
    email: 'gvalverde@faa.mil.ar',
    nombreCompleto: 'Brig. Gral. Gustavo Javier Valverde (JEMGFAA)',
    rol: 'COMANDO_GENERAL',
    integranteId: 'int-sup-1',
    dependenciaId: 'dep-emgfaa',
    alcanceOrgánico: 'INSTITUCIONAL',
    activo: true,
    ultimoAcceso: '2026-10-24 08:30'
  },
  {
    id: 'usr-monetto',
    username: 'mmonetto',
    email: 'mmonetto@faa.mil.ar',
    nombreCompleto: 'Brig. Marcelo José Monetto (SUBJEMGFAA)',
    rol: 'COMANDO_GENERAL',
    integranteId: 'int-sup-2',
    dependenciaId: 'dep-subemgfaa',
    alcanceOrgánico: 'INSTITUCIONAL',
    activo: true,
    ultimoAcceso: '2026-10-24 08:10'
  },
  {
    id: 'usr-leiva',
    username: 'aniballeiva',
    email: 'aniballeiva@faa.mil.ar',
    nombreCompleto: 'Brig. Aníbal Hernán Leiva (COMATER)',
    rol: 'COMANDO_GENERAL',
    integranteId: 'int-sup-3',
    dependenciaId: 'dep-comater',
    alcanceOrgánico: 'INSTITUCIONAL',
    activo: true,
    ultimoAcceso: '2026-10-24 07:45'
  },
  {
    id: 'usr-villegas',
    username: 'gvillegas',
    email: 'gvillegascampos@faa.mil.ar',
    nombreCompleto: 'Brig. Gonzalo Villegas Campos (JEM COMATER)',
    rol: 'JEFE_UNIDAD',
    integranteId: 'int-sup-4',
    dependenciaId: 'dep-em-comater',
    alcanceOrgánico: 'UNIDAD',
    activo: true,
    ultimoAcceso: '2026-10-24 07:30'
  },
  {
    id: 'usr-1',
    username: 'pburgos',
    email: 'pburgos@faa.mil.ar',
    nombreCompleto: 'Com. Pablo Ignacio Burgos (Jefe Base Merlo)',
    rol: 'COMANDO_GENERAL',
    integranteId: 'int-of-1',
    dependenciaId: 'dep-bam-merlo',
    alcanceOrgánico: 'INSTITUCIONAL',
    activo: true,
    ultimoAcceso: '2026-10-24 08:15'
  },
  {
    id: 'usr-4',
    username: 'darballo',
    email: 'darballo@faa.mil.ar',
    nombreCompleto: 'Vcom. Ángel Daniel Arballo (Esc. I VYCA)',
    rol: 'JEFE_UNIDAD',
    integranteId: 'int-of-2',
    dependenciaId: 'dep-merlo-esc-vyca',
    alcanceOrgánico: 'UNIDAD',
    activo: true,
    ultimoAcceso: '2026-10-24 07:50'
  },
  {
    id: 'usr-6',
    username: 'cvarvaro',
    email: 'cvarvaro@faa.mil.ar',
    nombreCompleto: 'Cap. Carlos Iván Várvaro (Serv. Ops / Radar)',
    rol: 'JEFE_SECCION',
    integranteId: 'int-of-13',
    dependenciaId: 'dep-merlo-analisis-radar',
    alcanceOrgánico: 'SECCION',
    activo: true,
    ultimoAcceso: '2026-10-24 08:05'
  },
  {
    id: 'usr-7',
    username: 'mgonzalez',
    email: 'mgonzalez@faa.mil.ar',
    nombreCompleto: '1er. Ten. Mauro Andrés González (Servicios Especiales)',
    rol: 'OFICIAL_GUARDIA',
    integranteId: 'int-of-22',
    dependenciaId: 'dep-merlo-serv-especiales',
    alcanceOrgánico: 'SECCION',
    activo: true,
    ultimoAcceso: '2026-10-24 08:00'
  },
  {
    id: 'usr-bono',
    username: 'jpbono',
    email: 'jpbono@faa.mil.ar',
    nombreCompleto: 'Subof. Ppal. Juan Pablo Bono (Telecomunicaciones)',
    rol: 'ADMINISTRADOR',
    integranteId: 'int-bono',
    dependenciaId: 'dep-merlo-serv-especiales',
    alcanceOrgánico: 'INSTITUCIONAL',
    activo: true,
    ultimoAcceso: '2026-10-24 08:45'
  },
  {
    id: 'usr-admin',
    username: 'admin.tecnico',
    email: 'soporte.sistemas@faa.mil.ar',
    nombreCompleto: 'Ing. Sistemas (Administrador)',
    rol: 'ADMINISTRADOR',
    alcanceOrgánico: 'INSTITUCIONAL',
    activo: true,
    ultimoAcceso: '2026-10-24 08:45'
  }
];`,

`export const PRESENTISMO_DATA: RegistroPresentismo[] = ` + JSON.stringify(PRESENTISMO_RECORDS, null, 2) + `;`,

`export const GUARDIAS_DATA: Guardia24h[] = [
  {
    id: 'grd-merlo-1',
    codigoServicio: 'GRD-SEC-01',
    denominacion: 'Guardia Militar y Seguridad de Base Aérea Militar Merlo',
    dependenciaId: 'dep-merlo-tropa',
    fechaInicio: '2026-10-24T08:00',
    fechaFin: '2026-10-25T08:00',
    estado: 'EN_CURSO',
    jefeGuardiaId: 'int-of-22',
    integrantesIds: ['int-of-22', 'int-of-32', 'int-bono'],
    novedadesServicio: [
      {
        id: 'nov-1',
        hora: '08:00',
        descripcion: 'Asume la guardia militar el 1er. Ten. González con dotación completa.',
        registradoPorId: 'int-of-22'
      },
      {
        id: 'nov-2',
        hora: '10:30',
        descripcion: 'Verificación de enlaces UHF/VHF y enlace microondas con el radar 3D primario.',
        registradoPorId: 'int-bono'
      }
    ],
    descansoComputado: false,
    horasDescansoReglamentario: 24
  },
  {
    id: 'grd-merlo-2',
    codigoServicio: 'GRD-OPS-02',
    denominacion: 'Turno Operativo Sala de Vigilancia Radar y Control Aéreo',
    dependenciaId: 'dep-merlo-analisis-radar',
    fechaInicio: '2026-10-24T08:00',
    fechaFin: '2026-10-25T08:00',
    estado: 'EN_CURSO',
    jefeGuardiaId: 'int-of-13',
    integrantesIds: ['int-of-13', 'int-of-26'],
    novedadesServicio: [
      {
        id: 'nov-3',
        hora: '08:00',
        descripcion: 'Recepción de consolas y confirmación de enlace con Villaguay.',
        registradoPorId: 'int-of-13'
      }
    ],
    descansoComputado: false,
    horasDescansoReglamentario: 24
  }
];`,

`export const COMISIONES_DATA: ComisionServicio[] = [
  {
    id: 'com-merlo-1',
    codigoComision: 'DISP-BAM-MERLO-2026-088',
    integrantesIds: ['int-of-21', 'int-of-26'],
    dependenciaOrigenId: 'dep-merlo-tec-inspeccion',
    destinoComision: 'Destacamento Radar Villaguay, Entre Ríos',
    motivoOperativo: 'Mantenimiento preventivo de estación de radar y calibración de antena 3D.',
    fechaHoraSalida: '2026-10-22T08:00',
    fechaHoraRegresoPrevista: '2026-10-27T18:00',
    ordenRespaldo: 'O.S. N° 088/26',
    autoridadSolicitanteId: 'int-of-7',
    autoridadAutorizanteId: 'int-of-1',
    estado: 'EN_CURSO',
    vehiculoAsignado: 'Móvil FAA 2284',
    gastosViaticos: '$180.000'
  }
];`,

`export const TAREAS_DATA: TareaCadenaMando[] = [
  {
    id: 'tar-merlo-1',
    codigoTarea: 'TAR-MERLO-2026-01',
    titulo: 'Auditoría e inventario trimestral de repuestos electrónicos de radar 3D',
    descripcion: 'Verificar existencias físicas en Almacén Técnico y contrastar con el sistema logístico SIL.',
    dependenciaOrigenId: 'dep-merlo-abastecimiento',
    asignadorId: 'int-of-1',
    responsableId: 'int-of-20',
    participantesIds: ['int-of-20', 'int-bono'],
    fechaAsignacion: '2026-10-20',
    fechaLimite: '2026-10-28',
    prioridad: 'ALTA',
    estado: 'EN_EJECUCION',
    porcentajeAvance: 65,
    historialSeguimiento: [
      {
        id: 'seg-1',
        fecha: '2026-10-22',
        autorId: 'int-of-20',
        porcentajeAvance: 65,
        comentario: 'Verificados almacenes A y B, en curso componentes de RF.'
      }
    ]
  },
  {
    id: 'tar-merlo-2',
    codigoTarea: 'TAR-MERLO-2026-02',
    titulo: 'Actualización y firma de libro de novedades de guardia 24h',
    descripcion: 'Revisión reglamentaria de firmas de oficiales de guardia saliente y entrante.',
    dependenciaOrigenId: 'dep-merlo-jefatura',
    asignadorId: 'int-of-1',
    responsableId: 'int-of-22',
    participantesIds: ['int-of-22'],
    fechaAsignacion: '2026-10-24',
    fechaLimite: '2026-10-25',
    prioridad: 'NORMAL',
    estado: 'EN_EJECUCION',
    porcentajeAvance: 50,
    historialSeguimiento: [
      {
        id: 'seg-2',
        fecha: '2026-10-24',
        autorId: 'int-of-22',
        porcentajeAvance: 50,
        comentario: 'Turno en desarrollo con relevos al día.'
      }
    ]
  }
];`,

`export const SOLICITUDES_LICENCIA_DATA: SolicitudLicencia[] = [
  {
    id: 'lic-merlo-1',
    numeroTramite: 'LIC-2026-014',
    integranteId: 'int-of-12',
    dependenciaId: 'dep-merlo-genero',
    tipoLicencia: 'ORDINARIA_ANUAL',
    fechaInicio: '2026-11-05',
    fechaFin: '2026-11-19',
    diasHabiles: 10,
    motivo: 'Uso de fracción ordinaria de licencia anual reglamentaria.',
    estado: 'APROBADA',
    vistoBuenoJefeId: 'int-of-1'
  }
];

export const LICENCIAS_DATA = SOLICITUDES_LICENCIA_DATA;`,

`export const AUDITORIA_DATA: RegistroAuditoria[] = [
  {
    id: 'aud-merlo-1',
    fechaHora: '2026-10-24 08:30:15',
    usuarioId: 'usr-1',
    usuarioNombre: 'Com. Pablo Ignacio Burgos',
    usuarioRol: 'COMANDO_GENERAL',
    dependenciaNombre: 'Base Aérea Militar Merlo',
    modulo: 'ORGANIGRAMA',
    accion: 'MODIFICACION',
    registroAfectado: 'Estructura Orgánica Integral BAM Merlo',
    resultado: 'EXITO'
  },
  {
    id: 'aud-merlo-2',
    fechaHora: '2026-10-24 07:15:00',
    usuarioId: 'usr-bono',
    usuarioNombre: 'Subof. Ppal. Juan Pablo Bono',
    usuarioRol: 'ADMINISTRADOR',
    dependenciaNombre: 'Servicios Especiales',
    modulo: 'PRESENTISMO',
    accion: 'CREACION',
    registroAfectado: 'Parte Diario de Presentismo 24-OCT',
    resultado: 'EXITO'
  }
];`,

`export const DOCUMENTOS_LEGAJO_DATA: DocumentoLegajo[] = [
  {
    id: 'doc-1',
    integranteId: 'int-of-1',
    tipoDocumento: 'DESIGNACION',
    numeroResolucion: 'DEC-PEN-2022-1044',
    titulo: 'Decreto de Designación como Jefe de la Base Aérea Militar Merlo',
    fechaEmision: '2022-01-10',
    fechaSubida: '2022-01-15',
    subidoPorUsuario: 'usr-admin',
    tamanoBytes: 154200,
    nombreArchivo: 'designacion-burgos.pdf',
    hashSha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
  }
];`,

`export const MOVIMIENTOS_HISTORIAL_DATA: MovimientoHistorial[] = [
  {
    id: 'mov-1',
    integranteId: 'int-of-1',
    fecha: '2022-01-15',
    tipo: 'DESTINO',
    descripcion: 'Asignación de destino como Jefe de la Base Aérea Militar Merlo (BAM Merlo).',
    documentoRespaldo: 'BO-FAA-2022-008',
    registradoPor: 'usr-admin'
  }
];

export const HISTORIAL_MOVIMIENTOS_DATA = MOVIMIENTOS_HISTORIAL_DATA;

export const SOLICITUDES_LEGAJO_DATA: SolicitudLegajo[] = [];`
];

fs.writeFileSync(path.join(__dirname, '../src/data/mockData.ts'), tsCodeParts.join('\n\n'), 'utf8');
console.log('Successfully generated and updated src/data/mockData.ts');
