/**
 * COMMAND: DEFINIR META EQUIPO
 *
 * @description Establece la cuota de ventas para un equipo en un periodo específico.
 */

import { ICommand } from '@/lib/cqrs';

export class DefinirMetaEquipoCommand implements ICommand {
  constructor(
    public readonly equipoId: string,
    public readonly periodo: 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL',
    public readonly montoObjetivo: number,
    public readonly fechaInicio: Date,
    public readonly fechaFin: Date,
    public readonly moneda: string,
    public readonly usuarioEjecutorId: string
  ) {}
}
