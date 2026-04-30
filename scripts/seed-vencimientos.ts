/**
 * 🌱 SEED: Módulo Vencimientos — Datos Reales Canal 13 (RDF Media)
 * Basado en: AUSPICIOS NVO FORMATO 27 de Abril al 03 de Mayo de 2026
 *
 * @description Puebla las tablas del módulo vencimientos con datos REALES
 *              de las emisoras de radio del grupo Canal 13 (Chile).
 *              Extraído del archivo Excel de tráfico comercial.
 *
 * @version 3.0.0
 */

import { getDB, isDatabaseConnected } from '../src/lib/db'
import {
  programas,
  vencimientosAuspicio,
  alertasProgramador,
  solicitudesExtension,
  listasEspera,
  tandasComerciales,
  senalesEspeciales,
  exclusividadesRubro,
  configuracionTarifa,
  historialOcupacion,
  cupoComercial,
} from '../src/lib/db/vencimientos-schema'
import { emisoras } from '../src/lib/db/emisoras-schema'
import { tenants, users } from '../src/lib/db/users-schema'

// ── IDs fijos para consistencia ──
const TENANT_ID = '00000000-0000-0000-0000-000000000001'
const USER_ID   = '00000000-0000-0000-0000-000000000001'

const EMI_PLAY   = '11111111-1111-1111-1111-111111111111'
const EMI_SONAR  = '22222222-2222-2222-2222-222222222222'
const EMI_T13    = '33333333-3333-3333-3333-333333333333'
const EMI_13C    = '44444444-4444-4444-4444-444444444444'

// ── Programas Play FM ──
const PROG_PLAY_AGENDA  = 'p1111111-1111-1111-1111-111111111112'
const PROG_PLAY_LOOK    = 'p1111111-1111-1111-1111-111111111113'
const PROG_PLAY_LIST    = 'p1111111-1111-1111-1111-111111111114'
const PROG_PLAY_POWER   = 'p1111111-1111-1111-1111-111111111115'
const PROG_PLAY_FUERA   = 'p1111111-1111-1111-1111-111111111116'
const PROG_PLAY_GEN     = 'p1111111-1111-1111-1111-111111111117'
const PROG_PLAY_FAV     = 'p1111111-1111-1111-1111-111111111118'
const PROG_PLAY_POPUP   = 'p1111111-1111-1111-1111-111111111119'

// ── Programas Sonar FM ──
const PROG_SONAR_INFO   = 'p2222222-2222-2222-2222-222222222221'
const PROG_SONAR_RADIO  = 'p2222222-2222-2222-2222-222222222222'
const PROG_SONAR_ROCK   = 'p2222222-2222-2222-2222-222222222223'
const PROG_SONAR_CLAS   = 'p2222222-2222-2222-2222-222222222224'
const PROG_SONAR_HERO   = 'p2222222-2222-2222-2222-222222222225'
const PROG_SONAR_DEP    = 'p2222222-2222-2222-2222-222222222226'
const PROG_SONAR_90S    = 'p2222222-2222-2222-2222-222222222227'
const PROG_SONAR_GLOBAL = 'p2222222-2222-2222-2222-222222222228'
const PROG_SONAR_MOTOR  = 'p2222222-2222-2222-2222-222222222229'

// ── Programas Tele13 Radio ──
const PROG_T13_MESA     = 'p3333333-3333-3333-3333-333333333331'
const PROG_T13_MANANA   = 'p3333333-3333-3333-3333-333333333332'
const PROG_T13_MERCADO  = 'p3333333-3333-3333-3333-333333333334'
const PROG_T13_SELECC   = 'p3333333-3333-3333-3333-33333333333a'
const PROG_T13_AVION    = 'p3333333-3333-3333-3333-333333333339'
const PROG_T13_FIN      = 'p3333333-3333-3333-3333-333333333335'
const PROG_T13_TARDE    = 'p3333333-3333-3333-3333-333333333336'
const PROG_T13_CLICK    = 'p3333333-3333-3333-3333-333333333333'
const PROG_T13_CONEX    = 'p3333333-3333-3333-3333-333333333337'
const PROG_T13_PAGINA   = 'p3333333-3333-3333-3333-333333333338'

// ── Programas Radio 13C ──
const PROG_13C_CUATRO   = 'p4444444-4444-4444-4444-444444444441'
const PROG_13C_GLOBAL   = 'p4444444-4444-4444-4444-444444444442'
const PROG_13C_CADENA   = 'p4444444-4444-4444-4444-444444444443'
const PROG_13C_DESPUES  = 'p4444444-4444-4444-4444-444444444444'
const PROG_13C_CORR     = 'p4444444-4444-4444-4444-444444444445'
const PROG_13C_CANC     = 'p4444444-4444-4444-4444-444444444446'
const PROG_13C_BLOQUE   = 'p4444444-4444-4444-4444-444444444447'

function fecha(diasDesdeHoy: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + diasDesdeHoy)
  d.setHours(0, 0, 0, 0)
  return d
}

function uuid(prefix = ''): string {
  const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `${prefix}${hex}`
}

async function seed() {
  console.log('📅 Seed Módulo Vencimientos — Canal 13 (RDF Media)\n')
  console.log('   Fuente: AUSPICIOS NVO FORMATO 27 Abril - 03 Mayo 2026\n')

  if (!isDatabaseConnected()) {
    console.error('❌ No hay conexión a base de datos.')
    console.log('   Configura DATABASE_URL en .env.local')
    process.exit(1)
  }

  const db = getDB()

  try {
    // ── 0. Tenant y Usuario base ──
    console.log('0️⃣  Verificando tenant y usuario base...')
    await db.insert(tenants).values({
      id: TENANT_ID,
      name: 'RDF Media Chile',
      slug: 'rdf-media',
      email: 'admin@rdfmedia.cl',
      plan: 'enterprise',
      status: 'active',
      maxUsers: 50,
    }).onConflictDoNothing()

    await db.insert(users).values({
      id: USER_ID,
      tenantId: TENANT_ID,
      email: 'ejecutivo@rdfmedia.cl',
      passwordHash: '$2a$10$seed.hash.no.real.password',
      name: 'Ejecutivo Comercial RDF',
      category: 'ejecutivo',
      status: 'active',
      isTenantAdmin: true,
    }).onConflictDoNothing()
    console.log('   ✅ Tenant y usuario base listos')

    // ── 1. Emisoras reales Canal 13 ──
    console.log('1️⃣  Insertando emisoras (Canal 13 / RDF Media)...')
    await db.insert(emisoras).values([
      {
        id: EMI_PLAY, tenantId: TENANT_ID, codigo: 'PLAY-FM',
        nombre: 'Play FM', nombreComercial: 'Play FM 100.9',
        slogan: 'La radio que escucha Chile',
        tipoFrecuencia: 'fm', frecuencia: '100.9', banda: 'FM',
        cobertura: 'Gran Santiago', ciudad: 'Santiago', region: 'Región Metropolitana', pais: 'Chile',
        emailContacto: 'contacto@playfm.cl', paginaWeb: 'https://playfm.cl', streamUrl: 'https://stream.playfm.cl',
        horaInicioEmision: '06:00:00', horaFinEmision: '00:00:00', emite24Horas: false,
        duracionSpotDefault: 30, maxSpotsHora: 12, maxSpotsTanda: 6, duracionMaxTanda: 180,
        estado: 'activa', activa: true, creadoPorId: USER_ID,
      },
      {
        id: EMI_SONAR, tenantId: TENANT_ID, codigo: 'SONAR-FM',
        nombre: 'Sonar FM', nombreComercial: 'Sonar FM 105.3',
        slogan: 'Rock desde el corazón',
        tipoFrecuencia: 'fm', frecuencia: '105.3', banda: 'FM',
        cobertura: 'Gran Santiago', ciudad: 'Santiago', region: 'Región Metropolitana', pais: 'Chile',
        emailContacto: 'contacto@sonarfm.cl', paginaWeb: 'https://sonarfm.cl', streamUrl: 'https://stream.sonarfm.cl',
        horaInicioEmision: '06:00:00', horaFinEmision: '00:00:00', emite24Horas: false,
        duracionSpotDefault: 30, maxSpotsHora: 10, maxSpotsTanda: 5, duracionMaxTanda: 180,
        estado: 'activa', activa: true, creadoPorId: USER_ID,
      },
      {
        id: EMI_T13, tenantId: TENANT_ID, codigo: 'T13-RADIO',
        nombre: 'Tele13 Radio', nombreComercial: 'Tele13 Radio 103.3',
        slogan: 'Información que importa',
        tipoFrecuencia: 'fm', frecuencia: '103.3', banda: 'FM',
        cobertura: 'Gran Santiago', ciudad: 'Santiago', region: 'Región Metropolitana', pais: 'Chile',
        emailContacto: 'contacto@tele13radio.cl', paginaWeb: 'https://tele13radio.cl', streamUrl: 'https://stream.tele13radio.cl',
        horaInicioEmision: '05:00:00', horaFinEmision: '23:00:00', emite24Horas: false,
        duracionSpotDefault: 30, maxSpotsHora: 14, maxSpotsTanda: 7, duracionMaxTanda: 210,
        estado: 'activa', activa: true, creadoPorId: USER_ID,
      },
      {
        id: EMI_13C, tenantId: TENANT_ID, codigo: 'RADIO-13C',
        nombre: 'Radio 13C', nombreComercial: 'Radio 13C',
        slogan: 'Cooltura en el aire',
        tipoFrecuencia: 'online',
        cobertura: 'Chile (streaming)', ciudad: 'Santiago', region: 'Región Metropolitana', pais: 'Chile',
        emailContacto: 'contacto@radio13c.cl', paginaWeb: 'https://radio13c.cl', streamUrl: 'https://stream.radio13c.cl',
        horaInicioEmision: '08:00:00', horaFinEmision: '22:00:00', emite24Horas: false,
        duracionSpotDefault: 30, maxSpotsHora: 8, maxSpotsTanda: 4, duracionMaxTanda: 120,
        estado: 'activa', activa: true, creadoPorId: USER_ID,
      },
    ]).onConflictDoNothing()
    console.log('   ✅ 4 emisoras insertadas')

    // ── 2. Programas reales por emisora ──
    console.log('2️⃣  Insertando programas reales del Excel...')
    const programasData = [
      // ═══ PLAY FM ═══
      {
        id: PROG_PLAY_AGENDA, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-AGENDA', nombre: 'Agenda Play',
        descripcion: 'Mañana informativa y musical con Cata Chuaqui. Noticias, entrevistas y la mejor música para comenzar el día.',
        tipoPrograma: 'noticiero', horaInicio: '07:00', horaFin: '09:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Cata Chuaqui', audienciaPromedio: 38000, rating: '6.80',
        tarifaAuspicio: '8100000', tarifaMencion: '400000', tarifaSpot: '320000',
        cuposData: JSON.stringify({ tipoA: { total: 20, ocupados: 12 }, tipoB: { total: 24, ocupados: 10 }, menciones: { total: 8, ocupados: 5 } }),
        conductoresData: JSON.stringify([{ id: 'c1', nombre: 'Cata Chuaqui', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '21000000', revenuePotencial: '45000000', listaEsperaCount: 4,
      },
      {
        id: PROG_PLAY_LOOK, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-LOOK', nombre: 'Look',
        descripcion: 'Moda, tendencias y estilo de vida con Milla Kemp. Lo último en cultura pop y entretenimiento.',
        tipoPrograma: 'magazin', horaInicio: '09:00', horaFin: '11:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Milla Kemp', audienciaPromedio: 32000, rating: '5.90',
        tarifaAuspicio: '6800000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 8, ocupados: 5 }, tipoB: { total: 16, ocupados: 8 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 'c5', nombre: 'Milla Kemp', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '15000000', revenuePotencial: '32000000', listaEsperaCount: 2,
      },
      {
        id: PROG_PLAY_LIST, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-LIST', nombre: 'Playlist',
        descripcion: 'Las playlists más escuchadas del momento. Música sin interrupciones para tu día con Rosario Grez.',
        tipoPrograma: 'musical', horaInicio: '10:00', horaFin: '13:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Rosario Grez', audienciaPromedio: 30000, rating: '5.50',
        tarifaAuspicio: '6700000', tarifaMencion: '320000', tarifaSpot: '260000',
        cuposData: JSON.stringify({ tipoA: { total: 20, ocupados: 10 }, tipoB: { total: 20, ocupados: 9 }, menciones: { total: 8, ocupados: 4 } }),
        conductoresData: JSON.stringify([{ id: 'c3', nombre: 'Rosario Grez', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '18000000', revenuePotencial: '38000000', listaEsperaCount: 3,
      },
      {
        id: PROG_PLAY_POWER, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-POWER', nombre: 'Play Power',
        descripcion: 'La tarde con energía. Música, conversación y actualidad con Vero Calabi.',
        tipoPrograma: 'entretenimiento', horaInicio: '13:00', horaFin: '16:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Vero Calabi', audienciaPromedio: 35000, rating: '6.20',
        tarifaAuspicio: '8500000', tarifaMencion: '380000', tarifaSpot: '300000',
        cuposData: JSON.stringify({ tipoA: { total: 17, ocupados: 11 }, tipoB: { total: 22, ocupados: 12 }, menciones: { total: 8, ocupados: 5 } }),
        conductoresData: JSON.stringify([{ id: 'c4', nombre: 'Vero Calabi', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '22000000', revenuePotencial: '48000000', listaEsperaCount: 3,
      },
      {
        id: PROG_PLAY_FUERA, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-FUERA', nombre: 'Fuera de Contexto',
        descripcion: 'Conversaciones impertinentes con Milla Kemp. Actualidad, cultura pop y entrevistas sin filtros.',
        tipoPrograma: 'entretenimiento', horaInicio: '16:00', horaFin: '19:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Milla Kemp', audienciaPromedio: 30000, rating: '5.80',
        tarifaAuspicio: '6800000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 10, ocupados: 6 }, tipoB: { total: 18, ocupados: 9 }, menciones: { total: 5, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 'c5', nombre: 'Milla Kemp', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '16000000', revenuePotencial: '35000000', listaEsperaCount: 2,
      },
      {
        id: PROG_PLAY_GEN, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-GEN', nombre: 'Generación Play',
        descripcion: 'La generación que creció con la mejor música. Nostalgia y actualidad con Ignacio Franzani.',
        tipoPrograma: 'musical', horaInicio: '19:00', horaFin: '22:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Ignacio Franzani', audienciaPromedio: 25000, rating: '4.50',
        tarifaAuspicio: '5500000', tarifaMencion: '280000', tarifaSpot: '220000',
        cuposData: JSON.stringify({ tipoA: { total: 8, ocupados: 3 }, tipoB: { total: 16, ocupados: 6 }, menciones: { total: 4, ocupados: 1 } }),
        conductoresData: JSON.stringify([{ id: 'c6', nombre: 'Ignacio Franzani', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '11000000', revenuePotencial: '28000000', listaEsperaCount: 1,
      },
      {
        id: PROG_PLAY_FAV, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-FAV', nombre: 'Agenda de Favoritos',
        descripcion: 'Los favoritos de la semana seleccionados por Cata Chuaqui. Lo mejor de Play FM en un solo programa.',
        tipoPrograma: 'magazin', horaInicio: '11:00', horaFin: '12:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Cata Chuaqui', audienciaPromedio: 28000, rating: '5.20',
        tarifaAuspicio: '5750000', tarifaMencion: '300000', tarifaSpot: '240000',
        cuposData: JSON.stringify({ tipoA: { total: 6, ocupados: 3 }, tipoB: { total: 12, ocupados: 5 }, menciones: { total: 4, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 'c1', nombre: 'Cata Chuaqui', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '9500000', revenuePotencial: '22000000', listaEsperaCount: 0,
      },
      {
        id: PROG_PLAY_POPUP, tenantId: TENANT_ID, emiId: EMI_PLAY,
        codigo: 'PLAY-POPUP', nombre: 'Pop Up',
        descripcion: 'Música pop emergente y artistas nuevos descubiertos por Rosario Grez. El sonido del mañana hoy.',
        tipoPrograma: 'musical', horaInicio: '14:00', horaFin: '15:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Rosario Grez', audienciaPromedio: 26000, rating: '4.80',
        tarifaAuspicio: '5600000', tarifaMencion: '290000', tarifaSpot: '230000',
        cuposData: JSON.stringify({ tipoA: { total: 6, ocupados: 2 }, tipoB: { total: 10, ocupados: 4 }, menciones: { total: 3, ocupados: 1 } }),
        conductoresData: JSON.stringify([{ id: 'c3', nombre: 'Rosario Grez', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '8200000', revenuePotencial: '19000000', listaEsperaCount: 0,
      },
      // ═══ SONAR FM ═══
      {
        id: PROG_SONAR_INFO, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-INFO', nombre: 'Sonar Informativo',
        descripcion: 'Las noticias del rock y la actualidad chilena con Pablo Aranzaes. Información con actitud rock.',
        tipoPrograma: 'noticiero', horaInicio: '07:00', horaFin: '09:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Pablo Aranzaes', audienciaPromedio: 22000, rating: '4.50',
        tarifaAuspicio: '7000000', tarifaMencion: '380000', tarifaSpot: '300000',
        cuposData: JSON.stringify({ tipoA: { total: 22, ocupados: 15 }, tipoB: { total: 18, ocupados: 10 }, menciones: { total: 8, ocupados: 5 } }),
        conductoresData: JSON.stringify([{ id: 's1', nombre: 'Pablo Aranzaes', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '19500000', revenuePotencial: '42000000', listaEsperaCount: 3,
      },
      {
        id: PROG_SONAR_RADIO, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-RADIO', nombre: 'Radiotransmisor',
        descripcion: 'El viaje sonoro de Alfredo Lewin. Rock clásico y nuevas propuestas musicales.',
        tipoPrograma: 'musical', horaInicio: '09:00', horaFin: '12:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Alfredo Lewin', audienciaPromedio: 20000, rating: '4.00',
        tarifaAuspicio: '7300000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 12, ocupados: 8 }, tipoB: { total: 16, ocupados: 9 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 's2', nombre: 'Alfredo Lewin', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '15000000', revenuePotencial: '35000000', listaEsperaCount: 2,
      },
      {
        id: PROG_SONAR_ROCK, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-ROCK', nombre: 'Rock y Guitarras',
        descripcion: 'El sonido de las seis cuerdas. De Hendrix a los guitarristas chilenos contemporáneos con Pablo Márquez.',
        tipoPrograma: 'musical', horaInicio: '12:00', horaFin: '15:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Pablo Márquez', audienciaPromedio: 24000, rating: '4.80',
        tarifaAuspicio: '5800000', tarifaMencion: '300000', tarifaSpot: '240000',
        cuposData: JSON.stringify({ tipoA: { total: 10, ocupados: 5 }, tipoB: { total: 14, ocupados: 7 }, menciones: { total: 5, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 's3', nombre: 'Pablo Márquez', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '12000000', revenuePotencial: '28000000', listaEsperaCount: 1,
      },
      {
        id: PROG_SONAR_CLAS, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-CLAS', nombre: 'Sonar Clásico',
        descripcion: 'Los clásicos del rock en su versión más pura. Con Francisco Reinoso.',
        tipoPrograma: 'musical', horaInicio: '15:00', horaFin: '18:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Francisco Reinoso', audienciaPromedio: 21000, rating: '4.20',
        tarifaAuspicio: '5500000', tarifaMencion: '280000', tarifaSpot: '220000',
        cuposData: JSON.stringify({ tipoA: { total: 9, ocupados: 5 }, tipoB: { total: 14, ocupados: 7 }, menciones: { total: 5, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 's4', nombre: 'Francisco Reinoso', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '11000000', revenuePotencial: '26000000', listaEsperaCount: 1,
      },
      {
        id: PROG_SONAR_HERO, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-HERO', nombre: 'Sonar Héroes',
        descripcion: 'Homenaje a las leyendas del rock. Historias, anécdotas y los himnos de siempre.',
        tipoPrograma: 'musical', horaInicio: '18:00', horaFin: '21:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Ignacio Pérez Tuesta', audienciaPromedio: 26000, rating: '5.00',
        tarifaAuspicio: '4500000', tarifaMencion: '250000', tarifaSpot: '200000',
        cuposData: JSON.stringify({ tipoA: { total: 16, ocupados: 10 }, tipoB: { total: 18, ocupados: 10 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 's5', nombre: 'Ignacio Pérez Tuesta', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '10000000', revenuePotencial: '24000000', listaEsperaCount: 2,
      },
      {
        id: PROG_SONAR_DEP, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-DEP', nombre: 'Sonar Deportivo',
        descripcion: 'El deporte con la actitud del rock. Análisis, entrevistas y pasión con Pablo Aranzaes.',
        tipoPrograma: 'deportivo', horaInicio: '21:00', horaFin: '23:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Pablo Aranzaes', audienciaPromedio: 16000, rating: '3.60',
        tarifaAuspicio: '4000000', tarifaMencion: '220000', tarifaSpot: '180000',
        cuposData: JSON.stringify({ tipoA: { total: 2, ocupados: 1 }, tipoB: { total: 8, ocupados: 4 }, menciones: { total: 3, ocupados: 1 } }),
        conductoresData: JSON.stringify([{ id: 's1', nombre: 'Pablo Aranzaes', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '6500000', revenuePotencial: '18000000', listaEsperaCount: 0,
      },
      {
        id: PROG_SONAR_90S, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-90S', nombre: 'Sonar 90s',
        descripcion: 'Los mejores hits de los años 90. Nostalgia noventera con Vero Calabi.',
        tipoPrograma: 'musical', horaInicio: '09:00', horaFin: '11:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Vero Calabi', audienciaPromedio: 23000, rating: '4.60',
        tarifaAuspicio: '5500000', tarifaMencion: '290000', tarifaSpot: '230000',
        cuposData: JSON.stringify({ tipoA: { total: 9, ocupados: 5 }, tipoB: { total: 14, ocupados: 7 }, menciones: { total: 5, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 's6', nombre: 'Vero Calabi', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '11000000', revenuePotencial: '26000000', listaEsperaCount: 1,
      },
      {
        id: PROG_SONAR_GLOBAL, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-GLOBAL', nombre: 'Sonar Global',
        descripcion: 'Rock internacional y escena global. Lo mejor del mundo con Pablo Aranzaes.',
        tipoPrograma: 'musical', horaInicio: '12:00', horaFin: '14:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Pablo Aranzaes', audienciaPromedio: 25000, rating: '4.90',
        tarifaAuspicio: '7000000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 13, ocupados: 8 }, tipoB: { total: 16, ocupados: 9 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 's1', nombre: 'Pablo Aranzaes', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '14000000', revenuePotencial: '32000000', listaEsperaCount: 2,
      },
      {
        id: PROG_SONAR_MOTOR, tenantId: TENANT_ID, emiId: EMI_SONAR,
        codigo: 'SONAR-MOTOR', nombre: 'Sonar de Motores',
        descripcion: 'El mundo del automovilismo con espíritu rock. Reviews, noticias y adrenalida con Pablo Aranzaes.',
        tipoPrograma: 'deportivo', horaInicio: '15:00', horaFin: '16:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Pablo Aranzaes', audienciaPromedio: 18000, rating: '3.80',
        tarifaAuspicio: '5500000', tarifaMencion: '280000', tarifaSpot: '220000',
        cuposData: JSON.stringify({ tipoA: { total: 5, ocupados: 2 }, tipoB: { total: 8, ocupados: 4 }, menciones: { total: 3, ocupados: 1 } }),
        conductoresData: JSON.stringify([{ id: 's1', nombre: 'Pablo Aranzaes', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '7500000', revenuePotencial: '19000000', listaEsperaCount: 0,
      },
      // ═══ TELE13 RADIO ═══
      {
        id: PROG_T13_MESA, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-MESA', nombre: 'Mesa Central',
        descripcion: 'El noticiero matinal de referencia en Chile. Análisis profundo de la actualidad con Iván Valenzuela.',
        tipoPrograma: 'noticiero', horaInicio: '07:00', horaFin: '10:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Iván Valenzuela', audienciaPromedio: 48000, rating: '9.00',
        tarifaAuspicio: '17200000', tarifaMencion: '550000', tarifaSpot: '440000',
        cuposData: JSON.stringify({ tipoA: { total: 25, ocupados: 18 }, tipoB: { total: 30, ocupados: 20 }, menciones: { total: 12, ocupados: 8 } }),
        conductoresData: JSON.stringify([{ id: 't1', nombre: 'Iván Valenzuela', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '52000000', revenuePotencial: '95000000', listaEsperaCount: 5,
      },
      {
        id: PROG_T13_MANANA, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-MANANA', nombre: 'Lo que marca la mañana',
        descripcion: 'Actualidad, entrevistas y el análisis que marca la jornada informativa con Andrea Rivera.',
        tipoPrograma: 'magazin', horaInicio: '10:00', horaFin: '12:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Andrea Rivera', audienciaPromedio: 32000, rating: '6.20',
        tarifaAuspicio: '4500000', tarifaMencion: '320000', tarifaSpot: '260000',
        cuposData: JSON.stringify({ tipoA: { total: 5, ocupados: 3 }, tipoB: { total: 12, ocupados: 6 }, menciones: { total: 4, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 't2', nombre: 'Andrea Rivera', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '12000000', revenuePotencial: '28000000', listaEsperaCount: 1,
      },
      {
        id: PROG_T13_MERCADO, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-MERCADO', nombre: 'Mercado Global',
        descripcion: 'Análisis financiero y económico de los mercados internacionales con Axel Christensen.',
        tipoPrograma: 'cultural', horaInicio: '10:00', horaFin: '11:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Axel Christensen', audienciaPromedio: 28000, rating: '5.80',
        tarifaAuspicio: '8200000', tarifaMencion: '380000', tarifaSpot: '300000',
        cuposData: JSON.stringify({ tipoA: { total: 6, ocupados: 4 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 4, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 't10', nombre: 'Axel Christensen', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '15000000', revenuePotencial: '32000000', listaEsperaCount: 2,
      },
      {
        id: PROG_T13_SELECC, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-SELECC', nombre: 'Mesa Central Selección',
        descripcion: 'Lo mejor de Mesa Central en formato resumen. Grabado para reemisión.',
        tipoPrograma: 'noticiero', horaInicio: '10:00', horaFin: '11:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Iván Valenzuela', audienciaPromedio: 25000, rating: '5.00',
        tarifaAuspicio: '6200000', tarifaMencion: '320000', tarifaSpot: '260000',
        cuposData: JSON.stringify({ tipoA: { total: 8, ocupados: 5 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 4, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 't1', nombre: 'Iván Valenzuela', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '12000000', revenuePotencial: '26000000', listaEsperaCount: 1,
      },
      {
        id: PROG_T13_AVION, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-AVION', nombre: 'Modo Avión',
        descripcion: 'Viajes, turismo y destinos con Consuelo Saavedra. Escapadas y recomendaciones.',
        tipoPrograma: 'cultural', horaInicio: '12:00', horaFin: '13:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Consuelo Saavedra', audienciaPromedio: 22000, rating: '4.50',
        tarifaAuspicio: '7500000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 8, ocupados: 4 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 4, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 't11', nombre: 'Consuelo Saavedra', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '11000000', revenuePotencial: '25000000', listaEsperaCount: 1,
      },
      {
        id: PROG_T13_FIN, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-FIN', nombre: 'El Fin del Dinero',
        descripcion: 'Economía para todos. Entender el dinero sin complicaciones con Paula Comandari.',
        tipoPrograma: 'cultural', horaInicio: '14:00', horaFin: '15:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Paula Comandari', audienciaPromedio: 24000, rating: '4.80',
        tarifaAuspicio: '6000000', tarifaMencion: '320000', tarifaSpot: '260000',
        cuposData: JSON.stringify({ tipoA: { total: 5, ocupados: 3 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 4, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 't12', nombre: 'Paula Comandari', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '10000000', revenuePotencial: '22000000', listaEsperaCount: 1,
      },
      {
        id: PROG_T13_TARDE, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-TARDE', nombre: 'Lo que marca la tarde',
        descripcion: 'La actualidad de la tarde con Paloma Ávila. Entrevistas y análisis de lo que pasa en Chile.',
        tipoPrograma: 'magazin', horaInicio: '15:00', horaFin: '17:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Paloma Ávila', audienciaPromedio: 30000, rating: '5.60',
        tarifaAuspicio: '5500000', tarifaMencion: '300000', tarifaSpot: '240000',
        cuposData: JSON.stringify({ tipoA: { total: 8, ocupados: 5 }, tipoB: { total: 12, ocupados: 6 }, menciones: { total: 5, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 't13', nombre: 'Paloma Ávila', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '12000000', revenuePotencial: '26000000', listaEsperaCount: 1,
      },
      {
        id: PROG_T13_CLICK, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-CLICK', nombre: 'Doble Click',
        descripcion: 'Tecnología, innovación y cultura digital con Ramón Ulloa. El futuro en un click.',
        tipoPrograma: 'magazin', horaInicio: '17:00', horaFin: '19:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Ramón Ulloa', audienciaPromedio: 29000, rating: '5.70',
        tarifaAuspicio: '7000000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 12, ocupados: 8 }, tipoB: { total: 16, ocupados: 9 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 't5', nombre: 'Ramón Ulloa', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '16000000', revenuePotencial: '35000000', listaEsperaCount: 2,
      },
      {
        id: PROG_T13_CONEX, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-CONEX', nombre: 'Conexión Tele13',
        descripcion: 'La conexión directa con la actualidad nacional e internacional. Edición nocturna informativa.',
        tipoPrograma: 'noticiero', horaInicio: '19:00', horaFin: '20:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Ramón Ulloa', audienciaPromedio: 34000, rating: '6.80',
        tarifaAuspicio: '11800000', tarifaMencion: '450000', tarifaSpot: '360000',
        cuposData: JSON.stringify({ tipoA: { total: 14, ocupados: 10 }, tipoB: { total: 18, ocupados: 12 }, menciones: { total: 8, ocupados: 5 } }),
        conductoresData: JSON.stringify([
          { id: 't6', nombre: 'Ramón Ulloa', rol: 'conductor_principal' },
          { id: 't14', nombre: 'Angélica Bulnes', rol: 'co_conductor' }
        ]),
        estado: 'ACTIVO', revenueActual: '28000000', revenuePotencial: '58000000', listaEsperaCount: 3,
      },
      {
        id: PROG_T13_PAGINA, tenantId: TENANT_ID, emiId: EMI_T13,
        codigo: 'T13-PAGINA', nombre: 'Página 13',
        descripcion: 'El análisis político de fondo. Las historias detrás de las noticias con Kike Mujica y Consuelo Saavedra.',
        tipoPrograma: 'noticiero', horaInicio: '20:00', horaFin: '21:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Kike Mujica', audienciaPromedio: 28000, rating: '5.50',
        tarifaAuspicio: '11000000', tarifaMencion: '420000', tarifaSpot: '340000',
        cuposData: JSON.stringify({ tipoA: { total: 14, ocupados: 9 }, tipoB: { total: 18, ocupados: 10 }, menciones: { total: 8, ocupados: 4 } }),
        conductoresData: JSON.stringify([
          { id: 't8', nombre: 'Kike Mujica', rol: 'conductor_principal' },
          { id: 't11', nombre: 'Consuelo Saavedra', rol: 'co_conductor' }
        ]),
        estado: 'ACTIVO', revenueActual: '25000000', revenuePotencial: '52000000', listaEsperaCount: 3,
      },
      // ═══ RADIO 13C ═══
      {
        id: PROG_13C_CUATRO, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-CUATRO', nombre: 'Cuatro Cabezas',
        descripcion: 'Cultura, humor y conversación con Kike Mujica. Cuatro cabezas piensan mejor que una.',
        tipoPrograma: 'cultural', horaInicio: '07:00', horaFin: '09:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Kike Mujica', audienciaPromedio: 12000, rating: '3.00',
        tarifaAuspicio: '8600000', tarifaMencion: '400000', tarifaSpot: '320000',
        cuposData: JSON.stringify({ tipoA: { total: 13, ocupados: 8 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 'r1', nombre: 'Kike Mujica', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '18000000', revenuePotencial: '35000000', listaEsperaCount: 2,
      },
      {
        id: PROG_13C_GLOBAL, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-GLOBAL', nombre: 'Cuatro Cabezas Global',
        descripcion: 'Versión global de Cuatro Cabezas. Conversaciones culturales con Consuelo Saavedra.',
        tipoPrograma: 'cultural', horaInicio: '08:00', horaFin: '09:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Consuelo Saavedra', audienciaPromedio: 10000, rating: '2.80',
        tarifaAuspicio: '8400000', tarifaMencion: '380000', tarifaSpot: '300000',
        cuposData: JSON.stringify({ tipoA: { total: 13, ocupados: 7 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 5, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 'r3', nombre: 'Consuelo Saavedra', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '15000000', revenuePotencial: '32000000', listaEsperaCount: 1,
      },
      {
        id: PROG_13C_CADENA, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-CADENA', nombre: 'Cadena de Valor',
        descripcion: 'Economía, negocios y emprendimiento con Cata Edwards. Análisis del mundo corporativo.',
        tipoPrograma: 'cultural', horaInicio: '09:00', horaFin: '10:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Cata Edwards', audienciaPromedio: 15000, rating: '3.50',
        tarifaAuspicio: '7700000', tarifaMencion: '360000', tarifaSpot: '290000',
        cuposData: JSON.stringify({ tipoA: { total: 12, ocupados: 7 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 5, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 'r4', nombre: 'Cata Edwards', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '16000000', revenuePotencial: '34000000', listaEsperaCount: 2,
      },
      {
        id: PROG_13C_DESPUES, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-DESPUES', nombre: 'Después de Todo',
        descripcion: 'Reflexiones, entrevistas y conversaciones profundas con Soledad Onetto.',
        tipoPrograma: 'cultural', horaInicio: '10:00', horaFin: '12:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Soledad Onetto', audienciaPromedio: 14000, rating: '3.40',
        tarifaAuspicio: '8600000', tarifaMencion: '400000', tarifaSpot: '320000',
        cuposData: JSON.stringify({ tipoA: { total: 12, ocupados: 7 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 'r5', nombre: 'Soledad Onetto', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '17000000', revenuePotencial: '36000000', listaEsperaCount: 2,
      },
      {
        id: PROG_13C_CORR, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-CORR', nombre: 'Corresponsales',
        descripcion: 'Noticias desde las regiones con Marcelo Comparini. La actualidad local de todo Chile.',
        tipoPrograma: 'noticiero', horaInicio: '12:00', horaFin: '13:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Marcelo Comparini', audienciaPromedio: 13000, rating: '3.20',
        tarifaAuspicio: '7200000', tarifaMencion: '350000', tarifaSpot: '280000',
        cuposData: JSON.stringify({ tipoA: { total: 12, ocupados: 7 }, tipoB: { total: 10, ocupados: 5 }, menciones: { total: 5, ocupados: 2 } }),
        conductoresData: JSON.stringify([{ id: 'r6', nombre: 'Marcelo Comparini', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '14000000', revenuePotencial: '30000000', listaEsperaCount: 1,
      },
      {
        id: PROG_13C_CANC, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-CANC', nombre: 'Cancionero',
        descripcion: 'Música chilena y latinoamericana con Marcelo Comparini. El cancionero de la cultura.',
        tipoPrograma: 'musical', horaInicio: '13:00', horaFin: '14:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Marcelo Comparini', audienciaPromedio: 12000, rating: '3.00',
        tarifaAuspicio: '5500000', tarifaMencion: '280000', tarifaSpot: '220000',
        cuposData: JSON.stringify({ tipoA: { total: 16, ocupados: 8 }, tipoB: { total: 12, ocupados: 6 }, menciones: { total: 6, ocupados: 3 } }),
        conductoresData: JSON.stringify([{ id: 'r6', nombre: 'Marcelo Comparini', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '11000000', revenuePotencial: '24000000', listaEsperaCount: 1,
      },
      {
        id: PROG_13C_BLOQUE, tenantId: TENANT_ID, emiId: EMI_13C,
        codigo: '13C-BLOQUE', nombre: 'Bloque Musical',
        descripcion: 'Bloque de música continua con Pablo Márquez. El mejor rock y pop en una sola tanda.',
        tipoPrograma: 'musical', horaInicio: '14:00', horaFin: '16:00', diasSemana: 'LMMJVS',
        conductorPrincipal: 'Pablo Márquez', audienciaPromedio: 11000, rating: '2.80',
        tarifaAuspicio: '5500000', tarifaMencion: '270000', tarifaSpot: '210000',
        cuposData: JSON.stringify({ tipoA: { total: 25, ocupados: 12 }, tipoB: { total: 15, ocupados: 7 }, menciones: { total: 8, ocupados: 4 } }),
        conductoresData: JSON.stringify([{ id: 'r7', nombre: 'Pablo Márquez', rol: 'conductor_principal' }]),
        estado: 'ACTIVO', revenueActual: '12000000', revenuePotencial: '26000000', listaEsperaCount: 1,
      },
    ]

    await db.insert(programas).values(programasData as any).onConflictDoNothing()
    console.log('   ✅ 34 programas insertados')
