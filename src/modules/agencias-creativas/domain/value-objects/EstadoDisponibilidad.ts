/**
 * 🟢 VALUE OBJECT: ESTADO DE DISPONIBILIDAD
 * 
 * Define los estados de disponibilidad para agencias creativas
 */

export type EstadoDisponibilidadType = 
  | 'DISPONIBLE'
  | 'OCUPADO'
  | 'PARCIALMENTE_DISPONIBLE'
  | 'NO_DISPONIBLE'
  | 'VACACIONES'
  | 'MANTENIMIENTO'
  | 'SUSPENDIDO';

export class EstadoDisponibilidad {
  private readonly _value: EstadoDisponibilidadType;

  constructor(value: string) {
    this._value = this.validate(value);
  }

  private validate(value: string): EstadoDisponibilidadType {
    const upperValue = value.toUpperCase() as EstadoDisponibilidadType;
    
    const validValues: EstadoDisponibilidadType[] = [
      'DISPONIBLE',
      'OCUPADO',
      'PARCIALMENTE_DISPONIBLE',
      'NO_DISPONIBLE',
      'VACACIONES',
      'MANTENIMIENTO',
      'SUSPENDIDO'
    ];

    if (!validValues.includes(upperValue)) {
      throw new Error(`Estado de disponibilidad inválido: ${value}`);
    }

    return upperValue;
  }

  get value(): EstadoDisponibilidadType {
    return this._value;
  }

  get displayName(): string {
    const displayNames: Record<EstadoDisponibilidadType, string> = {
      'DISPONIBLE': 'Disponible',
      'OCUPADO': 'Ocupado',
      'PARCIALMENTE_DISPONIBLE': 'Parcialmente Disponible',
      'NO_DISPONIBLE': 'No Disponible',
      'VACACIONES': 'En Vacaciones',
      'MANTENIMIENTO': 'En Mantenimiento',
      'SUSPENDIDO': 'Suspendido'
    };

    return displayNames[this._value];
  }

  get color(): string {
    const colors: Record<EstadoDisponibilidadType, string> = {
      'DISPONIBLE': '#10B981',
      'OCUPADO': '#EF4444',
      'PARCIALMENTE_DISPONIBLE': '#F59E0B',
      'NO_DISPONIBLE': '#6B7280',
      'VACACIONES': '#8B5CF6',
      'MANTENIMIENTO': '#F97316',
      'SUSPENDIDO': '#DC2626'
    };

    return colors[this._value];
  }

  get canAcceptProjects(): boolean {
    return this._value === 'DISPONIBLE' || this._value === 'PARCIALMENTE_DISPONIBLE';
  }

  get priority(): number {
    const priorities: Record<EstadoDisponibilidadType, number> = {
      'DISPONIBLE': 1,
      'PARCIALMENTE_DISPONIBLE': 2,
      'OCUPADO': 3,
      'VACACIONES': 4,
      'MANTENIMIENTO': 5,
      'NO_DISPONIBLE': 6,
      'SUSPENDIDO': 7
    };

    return priorities[this._value];
  }

  equals(other: EstadoDisponibilidad): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}