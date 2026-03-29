/**
 * 📊 VALUE OBJECT: NIVEL DE EXPERIENCIA
 * 
 * Define los niveles de experiencia para agencias creativas
 */

export type NivelExperienciaType = 
  | 'JUNIOR'
  | 'SEMI_SENIOR'
  | 'SENIOR'
  | 'EXPERT'
  | 'MASTER';

export class NivelExperiencia {
  private readonly _value: NivelExperienciaType;
  private readonly _años: number;

  constructor(años: number) {
    this._años = this.validateAños(años);
    this._value = this.calculateNivel(años);
  }

  private validateAños(años: number): number {
    if (años < 0) {
      throw new Error('Los años de experiencia no pueden ser negativos');
    }
    if (años > 100) {
      throw new Error('Los años de experiencia no pueden ser mayores a 100');
    }
    return años;
  }

  private calculateNivel(años: number): NivelExperienciaType {
    if (años < 2) return 'JUNIOR';
    if (años < 5) return 'SEMI_SENIOR';
    if (años < 10) return 'SENIOR';
    if (años < 20) return 'EXPERT';
    return 'MASTER';
  }

  get value(): NivelExperienciaType {
    return this._value;
  }

  get años(): number {
    return this._años;
  }

  get displayName(): string {
    const displayNames: Record<NivelExperienciaType, string> = {
      'JUNIOR': 'Junior (0-2 años)',
      'SEMI_SENIOR': 'Semi Senior (2-5 años)',
      'SENIOR': 'Senior (5-10 años)',
      'EXPERT': 'Expert (10-20 años)',
      'MASTER': 'Master (20+ años)'
    };

    return displayNames[this._value];
  }

  get scoreMultiplier(): number {
    const multipliers: Record<NivelExperienciaType, number> = {
      'JUNIOR': 0.7,
      'SEMI_SENIOR': 0.85,
      'SENIOR': 1.0,
      'EXPERT': 1.2,
      'MASTER': 1.5
    };

    return multipliers[this._value];
  }

  equals(other: NivelExperiencia): boolean {
    return this._value === other._value && this._años === other._años;
  }

  toString(): string {
    return `${this._value} (${this._años} años)`;
  }
}