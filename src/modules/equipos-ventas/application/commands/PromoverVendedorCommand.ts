/**
 * COMMAND: PROMOVER VENDEDOR
 *
 * @description Ejecuta el ascenso de un vendedor al siguiente nivel de su plan de carrera,
 * actualizando su rol, compensación y permisos.
 */

import { ICommand } from '@/lib/cqrs';

export class PromoverVendedorCommand implements ICommand {
  constructor(
    public readonly vendedorId: string,
    public readonly nuevoNivel: string,
    public readonly motivoPromocion: string,
    public readonly nuevoSueldoBase: number,
    public readonly aprobadorId: string // Usuario que aprueba (VP/Director)
  ) {}
}
