/**
 * QUERY INVENTARIO PUBLICITARIO - TIER 0 ENTERPRISE
 * 
 * @description Filtra y consulta disponibilidad de inventario en tiempo real.
 * Soporta mapa de calor y pricing dinámico.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoFranjaHoraria } from '../../domain/value-objects/TipoFranjaHoraria';

export class InventarioPublicitarioQuery {
  constructor(
    public readonly medio: 'RADIO' | 'TV' | 'DIGITAL',
    public readonly fechaInicio: Date,
    public readonly fechaFin: Date,
    public readonly franjas?: TipoFranjaHoraria[],
    public readonly soloDisponible: boolean = true,
    public readonly incluirPreciosDinamicos: boolean = true
  ) {
    if (fechaInicio > fechaFin) throw new Error('Rango de fechas inválido');
  }
}
