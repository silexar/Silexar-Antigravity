/**
 * COMMAND: GENERAR ACCOUNT HEALTH - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

export interface GenerarAccountHealthCommandPayload {
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  dimensiones: Array<{
    nombre: 'ENGAGEMENT' | 'SATISFACTION' | 'GROWTH' | 'ADVOCACY';
    score: number;
    peso: number;
  }>;
  proximaAccionRequerida?: string;
}

export class GenerarAccountHealthCommand {
  constructor(public readonly payload: GenerarAccountHealthCommandPayload) {
    this.validate();
  }

  private validate(): void {
    if (!this.payload.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.payload.kamId) throw new Error('KamId es requerido');
    if (this.payload.dimensiones.length === 0) throw new Error('Debe tener al menos una dimensión');
    for (const d of this.payload.dimensiones) {
      if (d.score < 0 || d.score > 100) throw new Error(`Score inválido para ${d.nombre}`);
    }
  }
}
