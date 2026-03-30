/**
 * COMMAND: ASIGNAR TERRITORIO
 *
 * @description Comando para asignar un territorio de ventas a un Vendedor o Equipo.
 * Valida que el territorio esté libre o soporte asignación múltiple.
 */

import { ICommand } from '@/lib/cqrs';

export class AsignarTerritorioCommand implements ICommand {
  constructor(
    public readonly territorioId: string,
    public readonly asignadoAId: string, // ID de Vendedor o Equipo
    public readonly tipoAsignacion: 'VENDEDOR' | 'EQUIPO',
    public readonly usuarioEjecutorId: string
  ) {}
}
