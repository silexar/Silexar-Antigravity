/**
 * VALUE OBJECT: ESTADO CUNA — TIER 0
 *
 * Máquina de estados para el ciclo de vida de una cuña publicitaria.
 * Valida transiciones legales e impide las inválidas.
 *
 * Ciclo: borrador → pendiente_aprobacion → aprobada → en_aire ↔ pausada → finalizada
 *                                          └→ rechazada
 */

export type EstadoCunaValor =
  | 'borrador'
  | 'pendiente_aprobacion'
  | 'aprobada'
  | 'en_aire'
  | 'pausada'
  | 'finalizada'
  | 'rechazada';

/** Transiciones permitidas por estado actual */
const TRANSICIONES_VALIDAS: Record<EstadoCunaValor, EstadoCunaValor[]> = {
  borrador:              ['pendiente_aprobacion'],
  pendiente_aprobacion:  ['aprobada', 'rechazada', 'borrador'],
  aprobada:              ['en_aire', 'borrador'],
  en_aire:               ['pausada', 'finalizada'],
  pausada:               ['en_aire', 'finalizada'],
  finalizada:            [],
  rechazada:             ['borrador'],
};

export class EstadoCuna {
  private constructor(private readonly _valor: EstadoCunaValor) {}

  static create(valor: EstadoCunaValor): EstadoCuna {
    return new EstadoCuna(valor);
  }

  static borrador(): EstadoCuna {
    return new EstadoCuna('borrador');
  }

  /** Verifica si la transición al nuevo estado es legal */
  puedeTransicionarA(nuevo: EstadoCunaValor): boolean {
    return TRANSICIONES_VALIDAS[this._valor].includes(nuevo);
  }

  /**
   * Retorna el nuevo EstadoCuna tras la transición.
   * Lanza error si la transición no es válida.
   */
  transicionarA(nuevo: EstadoCunaValor): EstadoCuna {
    if (!this.puedeTransicionarA(nuevo)) {
      throw new Error(
        `Transición de estado inválida: ${this._valor} → ${nuevo}. ` +
        `Estados permitidos desde "${this._valor}": [${TRANSICIONES_VALIDAS[this._valor].join(', ')}]`
      );
    }
    return new EstadoCuna(nuevo);
  }

  get valor(): EstadoCunaValor {
    return this._valor;
  }

  get esFinal(): boolean {
    return this._valor === 'finalizada';
  }

  get estaActiva(): boolean {
    return this._valor === 'en_aire';
  }

  get requiereAprobacion(): boolean {
    return this._valor === 'pendiente_aprobacion';
  }

  equals(other: EstadoCuna): boolean {
    return this._valor === other._valor;
  }

  toString(): string {
    return this._valor;
  }
}
