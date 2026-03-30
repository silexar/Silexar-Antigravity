/**
 * COMMAND: REGISTRAR FORECAST
 *
 * @description Permite a un vendedor o gerente registrar su proyección de ventas (Forecast).
 * Soporta categorías estándar (Commit, Most Likely, Best Case).
 */

import { ICommand } from '@/lib/cqrs';

export class RegistrarForecastCommand implements ICommand {
  constructor(
    public readonly vendedorId: string,
    public readonly periodo: string, // Ej: '2025-Q1'
    public readonly categoria: 'COMMIT' | 'MOST_LIKELY' | 'BEST_CASE' | 'PIPELINE',
    public readonly monto: number,
    public readonly notas: string,
    public readonly usuarioEjecutorId: string
  ) {}
}
