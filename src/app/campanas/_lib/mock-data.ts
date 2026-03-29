/**
 * 🎯 SILEXAR PULSE — Campañas: Datos Mock
 * 
 * Datos de demostración para desarrollo.
 * En producción, reemplazar por llamadas API reales.
 * 
 * @module campanas/mock-data
 * @version 2026.3.0
 */

import type { CampanaListado, ColumnConfig, FiltroGuardado } from './types'

export const mockCampanas: CampanaListado[] = [
  {
    id: 'cam-001',
    numeroCampana: 'CMP-25-001',
    numeroContrato: 'CON-25-0234',
    estado: 'ejecutando',
    anunciante: 'BANCO CHILE',
    referencia: 'BCH-NAV-2025',
    nombreCampana: 'Navidad Premium',
    nombreProducto: 'Cuenta Corriente',
    valorNeto: 2500000,
    fechaInicio: '2025-12-01',
    fechaTermino: '2025-12-31',
    cantidadCunas: 150,
    tipoPedido: 'Prime Determinado',
    vendedor: 'Ana García',
    agenciaCreativa: 'OMD Chile',
    agenciaMedios: 'Havas Media',
    usuario: 'agarcia',
    alertas: 2,
    cumplimiento: 85,
    favorito: true
  },
  {
    id: 'cam-002',
    numeroCampana: 'CMP-25-002',
    numeroContrato: 'CON-25-0189',
    estado: 'planificando',
    anunciante: 'COCA COLA',
    referencia: 'CC-ZERO-2025',
    nombreCampana: 'Lanzamiento Zero',
    nombreProducto: 'Coca Cola Zero',
    valorNeto: 1800000,
    fechaInicio: '2025-12-15',
    fechaTermino: '2026-01-15',
    cantidadCunas: 200,
    tipoPedido: 'Auspicio + Menciones',
    vendedor: 'Carlos Ruiz',
    agenciaCreativa: 'McCann',
    agenciaMedios: 'Starcom',
    usuario: 'cruiz',
    alertas: 0,
    cumplimiento: 0
  },
  {
    id: 'cam-003',
    numeroCampana: 'CMP-25-003',
    numeroContrato: 'CON-25-0156',
    estado: 'conflictos',
    anunciante: 'TOYOTA',
    referencia: 'TOY-COR-2025',
    nombreCampana: 'Nuevo Corolla',
    nombreProducto: 'Toyota Corolla 2025',
    valorNeto: 3200000,
    fechaInicio: '2025-01-10',
    fechaTermino: '2025-02-28',
    cantidadCunas: 280,
    tipoPedido: 'Prime Matinal',
    vendedor: 'María López',
    agenciaCreativa: 'Publicis',
    agenciaMedios: 'Zenith',
    usuario: 'mlopez',
    alertas: 5,
    cumplimiento: 45
  },
  {
    id: 'cam-004',
    numeroCampana: 'CMP-25-004',
    numeroContrato: 'CON-25-0298',
    estado: 'completada',
    anunciante: 'FALABELLA',
    referencia: 'FAL-BF-2025',
    nombreCampana: 'Black Friday 2025',
    nombreProducto: 'Promoción General',
    valorNeto: 4500000,
    fechaInicio: '2025-11-20',
    fechaTermino: '2025-11-30',
    cantidadCunas: 400,
    tipoPedido: 'Saturation Pack',
    vendedor: 'Pedro Sánchez',
    agenciaCreativa: 'Grey',
    agenciaMedios: 'Initiative',
    usuario: 'psanchez',
    alertas: 0,
    cumplimiento: 100,
    favorito: true
  },
  {
    id: 'cam-005',
    numeroCampana: 'CMP-25-005',
    numeroContrato: 'CON-25-0312',
    estado: 'borrador',
    anunciante: 'ENTEL',
    referencia: 'ENT-5G-2025',
    nombreCampana: 'Red 5G Nacional',
    nombreProducto: 'Plan 5G Ilimitado',
    valorNeto: 5800000,
    fechaInicio: '2026-01-01',
    fechaTermino: '2026-03-31',
    cantidadCunas: 500,
    tipoPedido: 'Prime + Rotativo',
    vendedor: 'Laura Martínez',
    agenciaCreativa: 'DDB',
    agenciaMedios: 'OMD',
    usuario: 'lmartinez',
    alertas: 0,
    cumplimiento: 0
  },
  {
    id: 'cam-006',
    numeroCampana: 'CMP-25-006',
    numeroContrato: 'CON-25-0345',
    estado: 'ejecutando',
    anunciante: 'LATAM AIRLINES',
    referencia: 'LAT-VER-2025',
    nombreCampana: 'Verano LATAM',
    nombreProducto: 'Vuelos Nacionales',
    valorNeto: 6200000,
    fechaInicio: '2025-12-01',
    fechaTermino: '2026-02-28',
    cantidadCunas: 350,
    tipoPedido: 'Prime Nocturno',
    vendedor: 'Ana García',
    agenciaCreativa: 'BBDO',
    agenciaMedios: 'PHD',
    usuario: 'agarcia',
    alertas: 1,
    cumplimiento: 32
  }
]

export const defaultColumns: ColumnConfig[] = [
  { id: 'numeroCampana', label: '# Campaña', visible: true, width: '100px' },
  { id: 'numeroContrato', label: '# Contrato', visible: true, width: '100px' },
  { id: 'estado', label: 'Estado', visible: true, width: '120px' },
  { id: 'anunciante', label: 'Anunciante', visible: true, width: '150px' },
  { id: 'referencia', label: 'Referencia', visible: true, width: '120px' },
  { id: 'nombreCampana', label: 'Campaña', visible: true, width: '180px' },
  { id: 'nombreProducto', label: 'Producto', visible: true, width: '140px' },
  { id: 'valorNeto', label: 'Valor Neto', visible: true, width: '100px' },
  { id: 'fechaInicio', label: 'Inicio', visible: true, width: '90px' },
  { id: 'fechaTermino', label: 'Término', visible: true, width: '90px' },
  { id: 'cantidadCunas', label: 'Cuñas', visible: true, width: '70px' },
  { id: 'tipoPedido', label: 'Tipo Pedido', visible: false, width: '130px' },
  { id: 'vendedor', label: 'Vendedor', visible: true, width: '110px' },
  { id: 'agenciaCreativa', label: 'Ag. Creativa', visible: false, width: '110px' },
  { id: 'agenciaMedios', label: 'Ag. Medios', visible: false, width: '110px' },
  { id: 'usuario', label: 'Usuario', visible: false, width: '80px' }
]

export const defaultFiltrosGuardados: FiltroGuardado[] = [
  { id: 'fg-1', nombre: '📌 Mis campañas activas', filtros: { searchTerm: '', filtroActivo: 'mis' } },
  { id: 'fg-2', nombre: '🔔 Requieren atención', filtros: { searchTerm: '', filtroActivo: 'atencion' } },
  { id: 'fg-3', nombre: '💰 Alto valor (>$3M)', filtros: { searchTerm: '>$3M', filtroActivo: 'todas' } }
]
