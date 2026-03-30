/**
 * QUERY: OBTENER PRONÓSTICO VENTAS
 *
 * @description Recupera el forecast de ventas consolidado para un equipo o vendedor.
 * Permite visualizar commits vs meta y tendencias.
 */

import { IQuery } from '@/lib/cqrs';

export class ObtenerPronosticoVentasQuery implements IQuery {
  constructor(
    public readonly entidadId: string, // Vendedor o Equipo
    public readonly tipoEntidad: 'VENDEDOR' | 'EQUIPO',
    public readonly periodo: string
  ) {}
}
