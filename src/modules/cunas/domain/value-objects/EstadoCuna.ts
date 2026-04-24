/**
 * VALUE OBJECT: ESTADO CUÑA - TIER 0
 * 
 * Modela el estado de una cuña y encapsula las reglas de transición
 * entre estados. Garantiza integridad de negocio.
 */

export type EstadoCunaValor = 
  | 'borrador'
  | 'pendiente_aprobacion'
  | 'aprobada'
  | 'en_aire'
  | 'pausada'
  | 'finalizada'
  | 'rechazada';

export interface EstadoTransitionRule {
  from: EstadoCunaValor;
  to: EstadoCunaValor;
  allowed: boolean;
  reason?: string;
}

export class EstadoCuna {
  private constructor(private _valor: EstadoCunaValor) {
    this.validate(_valor);
  }

  static create(valor: EstadoCunaValor): EstadoCuna {
    return new EstadoCuna(valor);
  }

  get valor(): EstadoCunaValor {
    return this._valor;
  }

  /**
   * Transiciona a un nuevo estado según reglas de negocio
   * Lanza error si la transición no es válida
   */
  transicionarA(nuevoEstado: EstadoCunaValor): EstadoCuna {
    const regla = this.getTransitionRule(this._valor, nuevoEstado);
    
    if (!regla.allowed) {
      throw new Error(`Transición no permitida de ${this._valor} a ${nuevoEstado}: ${regla.reason}`);
    }

    return new EstadoCuna(nuevoEstado);
  }

  /**
   * Verifica si una transición es válida
   */
  puedeTransicionarA(nuevoEstado: EstadoCunaValor): boolean {
    return this.getTransitionRule(this._valor, nuevoEstado).allowed;
  }

  private validate(valor: EstadoCunaValor): void {
    const estadosValidos: EstadoCunaValor[] = [
      'borrador',
      'pendiente_aprobacion',
      'aprobada',
      'en_aire',
      'pausada',
      'finalizada',
      'rechazada'
    ];

    if (!estadosValidos.includes(valor)) {
      throw new Error(`Estado inválido: ${valor}`);
    }
  }

  private getTransitionRule(from: EstadoCunaValor, to: EstadoCunaValor): EstadoTransitionRule {
    // Reglas de transición
    const reglas: EstadoTransitionRule[] = [
      // Desde borrador
      { from: 'borrador', to: 'pendiente_aprobacion', allowed: true },
      { from: 'borrador', to: 'pausada', allowed: false, reason: 'Solo se puede enviar a aprobación' },
      { from: 'borrador', to: 'en_aire', allowed: false, reason: 'Debe aprobarse primero' },
      { from: 'borrador', to: 'finalizada', allowed: false, reason: 'Debe aprobarse primero' },
      { from: 'borrador', to: 'rechazada', allowed: false, reason: 'No se puede rechazar una cuña en borrador' },
      
      // Desde pendiente_aprobacion
      { from: 'pendiente_aprobacion', to: 'borrador', allowed: true },
      { from: 'pendiente_aprobacion', to: 'aprobada', allowed: true },
      { from: 'pendiente_aprobacion', to: 'rechazada', allowed: true },
      { from: 'pendiente_aprobacion', to: 'en_aire', allowed: false, reason: 'Debe estar aprobada primero' },
      { from: 'pendiente_aprobacion', to: 'pausada', allowed: false, reason: 'Debe estar aprobada primero' },
      
      // Desde aprobada
      { from: 'aprobada', to: 'en_aire', allowed: true },
      { from: 'aprobada', to: 'borrador', allowed: false, reason: 'No se puede retornar a borrador desde aprobada' },
      { from: 'aprobada', to: 'pendiente_aprobacion', allowed: false, reason: 'Ya está aprobada' },
      { from: 'aprobada', to: 'rechazada', allowed: false, reason: 'No se puede rechazar después de aprobada' },
      
      // Desde en_aire
      { from: 'en_aire', to: 'pausada', allowed: true },
      { from: 'en_aire', to: 'finalizada', allowed: true },
      { from: 'en_aire', to: 'borrador', allowed: false, reason: 'No se puede editar mientras está en aire' },
      { from: 'en_aire', to: 'pendiente_aprobacion', allowed: false, reason: 'No se puede editar mientras está en aire' },
      
      // Desde pausada
      { from: 'pausada', to: 'en_aire', allowed: true },
      { from: 'pausada', to: 'finalizada', allowed: true },
      { from: 'pausada', to: 'borrador', allowed: false, reason: 'No se puede editar mientras está pausada' },
      
      // Desde finalizada
      { from: 'finalizada', to: 'borrador', allowed: false, reason: 'No se puede editar una cuña finalizada' },
      { from: 'finalizada', to: 'en_aire', allowed: false, reason: 'No se puede reactivar una cuña finalizada' },
      { from: 'finalizada', to: 'pausada', allowed: false, reason: 'No se puede reactivar una cuña finalizada' },
      
      // Desde rechazada
      { from: 'rechazada', to: 'borrador', allowed: true },
      { from: 'rechazada', to: 'pendiente_aprobacion', allowed: false, reason: 'Debe volver a borrador primero' },
    ];

    // Buscar regla específica
    const regla = reglas.find(r => r.from === from && r.to === to);
    
    if (regla) {
      return regla;
    }

    // Regla por defecto (no permitida)
    return {
      from,
      to,
      allowed: false,
      reason: 'Transición no definida'
    };
  }

  equals(other: EstadoCuna): boolean {
    return this._valor === other._valor;
  }
}