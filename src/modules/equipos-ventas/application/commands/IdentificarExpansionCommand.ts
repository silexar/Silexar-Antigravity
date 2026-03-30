/**
 * COMMAND: IDENTIFICAR EXPANSION - TIER 0 ENTERPRISE
 * @version 2025.2.0
 */

import { ExpansionType } from '../../domain/value-objects/ExpansionType';

export interface IdentificarExpansionCommandPayload {
  cuentaId: string;
  cuentaNombre: string;
  kamId: string;
  tipo: ExpansionType;
  titulo: string;
  descripcion: string;
  valorPotencial: number;
  moneda: string;
  probabilidad: number;
  fuenteDeteccion: 'IA' | 'MANUAL' | 'ANALYTICS';
  fechaCierreEstimada?: Date;
  competidorRelacionado?: string;
}

export class IdentificarExpansionCommand {
  constructor(public readonly payload: IdentificarExpansionCommandPayload) {
    this.validate();
  }

  private validate(): void {
    if (!this.payload.cuentaId) throw new Error('CuentaId es requerido');
    if (!this.payload.kamId) throw new Error('KamId es requerido');
    if (this.payload.valorPotencial <= 0) throw new Error('Valor potencial debe ser mayor a 0');
    if (this.payload.probabilidad < 0 || this.payload.probabilidad > 100) {
      throw new Error('Probabilidad debe ser 0-100');
    }
  }
}
