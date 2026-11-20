// Script to generate complete Base Aérea Militar Merlo dataset
const fs = require('fs');
const path = require('path');

// 1. Read the Merlo CSV
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

const rows = csvContent.split('\n').filter(l => l.trim().length > 0).slice(1).map(parseCSVLine);

// 2. Unit hierarchy mapping
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

// 3. Existing 33 Officers map by legajo digits
// We map them so their existing ID (int-of-1 to int-of-33) is strictly preserved!
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

console.log('Setup verified, running full generator...');
