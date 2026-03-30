/**
 * COMMAND CREAR EQUIPO VENTAS - TIER 0 ENTERPRISE
 * 
 * @description Comando para la creación de un nuevo equipo de ventas con validaciones
 * de estructura organizacional y asignación de líder.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoEquipo } from '../../domain/value-objects/TipoEquipo';

export class CrearEquipoVentasCommand {
  constructor(
    public readonly nombre: string,
    public readonly tipo: TipoEquipo,
    public readonly liderId: string, // ID de usuario/empleado existente
    public readonly metaAnual: number,
    public readonly territorioId?: string,
    public readonly padreId?: string, // Si reporta a otro equipo/región
    public readonly tags?: string[],
    public readonly moneda: string = 'USD'
  ) {
    if (!nombre || nombre.trim().length < 3) throw new Error('Nombre inválido');
    if (!liderId) throw new Error('Líder requerido');
    if (metaAnual < 0) throw new Error('Meta inválida');
  }
}
