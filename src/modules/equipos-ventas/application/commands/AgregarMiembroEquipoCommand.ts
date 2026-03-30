/**
 * COMMAND: AGREGAR MIEMBRO EQUIPO
 *
 * @description Agrega un vendedor a un equipo existente, ajustando jerarquías si es necesario.
 */

import { ICommand } from '@/lib/cqrs';

export class AgregarMiembroEquipoCommand implements ICommand {
  constructor(
    public readonly equipoId: string,
    public readonly vendedorId: string,
    public readonly rolEnEquipo: string, // Ej: 'MEMBER', 'TEAM_LEAD'
    public readonly usuarioEjecutorId: string
  ) {}
}
