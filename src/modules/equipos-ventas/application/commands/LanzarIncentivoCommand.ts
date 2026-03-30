/**
 * COMMAND: LANZAR INCENTIVO
 *
 * @description Crea y activa una campaña de incentivos (SPIFF) o concurso de ventas.
 */

export class LanzarIncentivoCommand {
  constructor(
    public readonly nombre: string,
    public readonly descripcion: string,
    public readonly tipo: 'FLASH_CONTEST' | 'QUARTERLY_BONUS' | 'PRODUCT_LAUNCH' | 'SPIFF',
    public readonly fechaInicio: Date,
    public readonly fechaFin: Date,
    public readonly presupuesto: number,
    public readonly reglas: Record<string, unknown>,
    public readonly creadorId: string
  ) {}
}
