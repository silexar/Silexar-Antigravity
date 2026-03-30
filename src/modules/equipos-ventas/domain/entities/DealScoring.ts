/**
 * ENTIDAD DEAL SCORING - TIER 0 ENTERPRISE
 * 
 * @description Gestión de puntuación predictiva de oportunidades (Deals) basada en ML.
 * Calcula probabilidad de cierre y categoriza oportunidades.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { DealScoreCategory, getCategoryFromScore } from '../value-objects/DealScoreCategory';

export interface DealScoringProps {
  id: string;
  dealId: string; // Relación con oportunidad en CRM/Pipeline
  vendedorId: string;
  anuncianteId: string;
  scoreActual: number; // 0-100
  scoreAnterior: number;
  categoriaActual: DealScoreCategory;
  factoresPositivos: string[]; // ["Respuesta rápida", "Presupuesto confirmado"]
  factoresNegativos: string[]; // ["Sin decisión maker", "Competencia agresiva"]
  probabilidadCierre: number; // 0.0 - 1.0 (decimal)
  fechaCalculo: Date;
  proximoCalculo: Date;
  modeloVersion: string; // "v2.5.1-cortex"
  metadata: Record<string, unknown>;
}

export class DealScoring {
  private constructor(private props: DealScoringProps) {
    this.validate();
  }

  public static create(props: Omit<DealScoringProps, 'id' | 'categoriaActual' | 'scoreAnterior'>): DealScoring {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    
    return new DealScoring({
      ...props,
      id,
      scoreAnterior: props.scoreActual, // Al inicio es igual
      categoriaActual: getCategoryFromScore(props.scoreActual),
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: DealScoringProps): DealScoring {
    return new DealScoring(props);
  }

  private validate(): void {
    if (this.props.scoreActual < 0 || this.props.scoreActual > 100) {
      throw new Error('Score debe estar entre 0 y 100');
    }
    if (this.props.probabilidadCierre < 0 || this.props.probabilidadCierre > 1) {
      throw new Error('Probabilidad debe estar entre 0.0 y 1.0');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get score(): number { return this.props.scoreActual; }
  get categoria(): DealScoreCategory { return this.props.categoriaActual; }
  get tendencia(): number { return this.props.scoreActual - this.props.scoreAnterior; }
  get esRiesgo(): boolean { return this.props.scoreActual < this.props.scoreAnterior - 15; } // Caída > 15 puntos

  // Métodos de Dominio
  public actualizarScore(nuevoScore: number, nuevosFactoresPos: string[], nuevosFactoresNeg: string[], nuevaProbabilidad: number): void {
    if (nuevoScore < 0 || nuevoScore > 100) throw new Error('Score inválido');
    
    // Guardar histórico simple
    this.props.scoreAnterior = this.props.scoreActual;
    
    // Actualizar valores
    this.props.scoreActual = nuevoScore;
    this.props.categoriaActual = getCategoryFromScore(nuevoScore);
    this.props.factoresPositivos = nuevosFactoresPos;
    this.props.factoresNegativos = nuevosFactoresNeg;
    this.props.probabilidadCierre = nuevaProbabilidad;
    this.props.fechaCalculo = new Date(); // Using Date() constructor
    
    // Logica de validación de caída brusca podría disparar evento de dominio fuera de la entidad
  }

  public toSnapshot(): DealScoringProps {
    return { ...this.props };
  }
}
