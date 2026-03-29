/**
 * ENTIDAD RATE CARD DINAMICA - TIER 0 ENTERPRISE
 * 
 * @description Gestiona el pricing dinámico de los espacios publicitarios
 * basado en franjas horarias, temporadas y demanda.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { TipoFranjaHoraria, FactorPrecioBase } from '../value-objects/TipoFranjaHoraria';

export interface RateCardProps {
  id: string;
  nombre: string;
  medio: 'RADIO' | 'TV' | 'DIGITAL';
  vigenciaInicio: Date;
  vigenciaFin: Date;
  moneda: string;
  precioBaseSegundo: number;
  tipoFranja: TipoFranjaHoraria;
  temporada: 'ALTA' | 'MEDIA' | 'BAJA' | 'ESPECIAL';
  factorTemporada: number;
  activo: boolean;
  metadata: Record<string, unknown>;
}

export class RateCardDinamica {
  private constructor(private props: RateCardProps) {
    this.validate();
  }

  public static create(props: Omit<RateCardProps, 'id' | 'activo'>): RateCardDinamica {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    
    return new RateCardDinamica({
      ...props,
      id,
      activo: true,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: RateCardProps): RateCardDinamica {
    return new RateCardDinamica(props);
  }

  private validate(): void {
    if (this.props.precioBaseSegundo <= 0) throw new Error('Precio base inválido');
    if (this.props.factorTemporada <= 0) throw new Error('Factor temporada inválido');
    if (this.props.vigenciaInicio > this.props.vigenciaFin) throw new Error('Rango de vigencia inválido');
  }

  // Getters
  get id(): string { return this.props.id; }
  get medio(): string { return this.props.medio; }
  get precioBase(): number { return this.props.precioBaseSegundo; }

  // Métodos de Dominio
  public calcularPrecioFinal(segundos: number, factorDemandaInventario: number = 1.0): number {
    const factorFranja = FactorPrecioBase[this.props.tipoFranja];
    const precioUnitario = this.props.precioBaseSegundo * 
                          factorFranja * 
                          this.props.factorTemporada * 
                          factorDemandaInventario;
    
    return precioUnitario * segundos;
  }

  public actualizarPrecioBase(nuevoPrecio: number): void {
    if (nuevoPrecio <= 0) throw new Error('Precio inválido');
    this.props.precioBaseSegundo = nuevoPrecio;
  }

  public desactivar(): void {
    this.props.activo = false;
  }

  public toSnapshot(): RateCardProps {
    return { ...this.props };
  }
}
