/**
 * COMMAND: CALCULAR COMISIONES
 *
 * @description Dispara el proceso de cálculo de comisiones para un vendedor o equipo
 * en un periodo determinado.
 */

import { ICommand } from '@/lib/cqrs';

export class CalcularComisionesCommand implements ICommand {
  constructor(
    public readonly entidadId: string, // Vendedor o Equipo
    public readonly tipoEntidad: 'VENDEDOR' | 'EQUIPO',
    public readonly periodo: string, // Ej: '2025-01'
    public readonly forzarRecalculo: boolean, // true = sobreescribir cálculos previos
    public readonly solicitanteId: string
  ) {}
}
