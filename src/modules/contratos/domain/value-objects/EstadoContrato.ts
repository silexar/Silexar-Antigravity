/**
 * VALUE OBJECT: ESTADO DE CONTRATO - TIER 0
 * 
 * @description Estados con flujo inteligente y validaciones automáticas
 */

export type EstadoContratoValor = 
  | 'borrador' 
  | 'revision' 
  | 'aprobacion' 
  | 'firmado' 
  | 'activo' 
  | 'pausado' 
  | 'finalizado' 
  | 'cancelado'

export class EstadoContrato {
  private constructor(private readonly _valor: EstadoContratoValor) {}

  static borrador(): EstadoContrato {
    return new EstadoContrato('borrador')
  }

  static revision(): EstadoContrato {
    return new EstadoContrato('revision')
  }

  static aprobacion(): EstadoContrato {
    return new EstadoContrato('aprobacion')
  }

  static firmado(): EstadoContrato {
    return new EstadoContrato('firmado')
  }

  static activo(): EstadoContrato {
    return new EstadoContrato('activo')
  }

  static pausado(): EstadoContrato {
    return new EstadoContrato('pausado')
  }

  static finalizado(): EstadoContrato {
    return new EstadoContrato('finalizado')
  }

  static cancelado(): EstadoContrato {
    return new EstadoContrato('cancelado')
  }

  static fromString(valor: string): EstadoContrato {
    const estados: EstadoContratoValor[] = [
      'borrador', 'revision', 'aprobacion', 'firmado', 
      'activo', 'pausado', 'finalizado', 'cancelado'
    ]
    
    if (!estados.includes(valor as EstadoContratoValor)) {
      throw new Error(`Estado de contrato inválido: ${valor}`)
    }
    
    return new EstadoContrato(valor as EstadoContratoValor)
  }

  get valor(): EstadoContratoValor {
    return this._valor
  }

  get descripcion(): string {
    const descripciones: Record<EstadoContratoValor, string> = {
      'borrador': 'Borrador - En creación',
      'revision': 'En Revisión - Validación comercial',
      'aprobacion': 'Esperando Aprobación - Pendiente autorización',
      'firmado': 'Firmado - Listo para activación',
      'activo': 'Activo - En ejecución',
      'pausado': 'Pausado - Temporalmente suspendido',
      'finalizado': 'Finalizado - Completado exitosamente',
      'cancelado': 'Cancelado - Terminado sin completar'
    }
    
    return descripciones[this._valor]
  }

  get color(): string {
    const colores: Record<EstadoContratoValor, string> = {
      'borrador': 'bg-slate-500',
      'revision': 'bg-blue-500',
      'aprobacion': 'bg-yellow-500',
      'firmado': 'bg-purple-500',
      'activo': 'bg-green-500',
      'pausado': 'bg-orange-500',
      'finalizado': 'bg-gray-500',
      'cancelado': 'bg-red-500'
    }
    
    return colores[this._valor]
  }

  get prioridad(): number {
    const prioridades: Record<EstadoContratoValor, number> = {
      'aprobacion': 5,  // Máxima prioridad
      'revision': 4,
      'firmado': 3,
      'borrador': 2,
      'activo': 2,
      'pausado': 1,
      'finalizado': 0,
      'cancelado': 0
    }
    
    return prioridades[this._valor]
  }

  esEditable(): boolean {
    return ['borrador', 'revision'].includes(this._valor)
  }

  requiereAccion(): boolean {
    return ['revision', 'aprobacion', 'firmado'].includes(this._valor)
  }

  esActivo(): boolean {
    return this._valor === 'activo'
  }

  esFinal(): boolean {
    return ['finalizado', 'cancelado'].includes(this._valor)
  }

  puedeTransicionarA(nuevoEstado: EstadoContrato): boolean {
    const transicionesValidas: Record<EstadoContratoValor, EstadoContratoValor[]> = {
      'borrador': ['revision', 'cancelado'],
      'revision': ['aprobacion', 'borrador', 'cancelado'],
      'aprobacion': ['firmado', 'revision', 'cancelado'],
      'firmado': ['activo', 'cancelado'],
      'activo': ['pausado', 'finalizado', 'cancelado'],
      'pausado': ['activo', 'cancelado'],
      'finalizado': [],
      'cancelado': []
    }
    
    return transicionesValidas[this._valor]?.includes(nuevoEstado._valor) || false
  }

  equals(other: EstadoContrato): boolean {
    return this._valor === other._valor
  }

  toString(): string {
    return this._valor
  }
}