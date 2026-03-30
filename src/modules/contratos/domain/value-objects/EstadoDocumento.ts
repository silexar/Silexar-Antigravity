/**
 * VALUE OBJECT: ESTADO DOCUMENTO - TIER 0
 * 
 * @description Estados de documentos con flujo inteligente
 */

export type EstadoDocumentoValor = 
  | 'borrador' 
  | 'revision' 
  | 'aprobado' 
  | 'en_firma' 
  | 'firmado' 
  | 'vencido'
  | 'cancelado'

export class EstadoDocumento {
  private constructor(private readonly _valor: EstadoDocumentoValor) {}

  static borrador(): EstadoDocumento {
    return new EstadoDocumento('borrador')
  }

  static revision(): EstadoDocumento {
    return new EstadoDocumento('revision')
  }

  static aprobado(): EstadoDocumento {
    return new EstadoDocumento('aprobado')
  }

  static enFirma(): EstadoDocumento {
    return new EstadoDocumento('en_firma')
  }

  static firmado(): EstadoDocumento {
    return new EstadoDocumento('firmado')
  }

  static vencido(): EstadoDocumento {
    return new EstadoDocumento('vencido')
  }

  static cancelado(): EstadoDocumento {
    return new EstadoDocumento('cancelado')
  }

  static fromString(valor: string): EstadoDocumento {
    const estados: EstadoDocumentoValor[] = [
      'borrador', 'revision', 'aprobado', 'en_firma', 'firmado', 'vencido', 'cancelado'
    ]
    
    if (!estados.includes(valor as EstadoDocumentoValor)) {
      throw new Error(`Estado de documento inválido: ${valor}`)
    }
    
    return new EstadoDocumento(valor as EstadoDocumentoValor)
  }

  get valor(): EstadoDocumentoValor {
    return this._valor
  }

  get descripcion(): string {
    const descripciones: Record<EstadoDocumentoValor, string> = {
      'borrador': 'Borrador - En edición',
      'revision': 'En Revisión - Pendiente aprobación',
      'aprobado': 'Aprobado - Listo para firma',
      'en_firma': 'En Firma - Proceso de firma en curso',
      'firmado': 'Firmado - Documento completado',
      'vencido': 'Vencido - Proceso de firma expirado',
      'cancelado': 'Cancelado - Documento anulado'
    }
    
    return descripciones[this._valor]
  }

  get color(): string {
    const colores: Record<EstadoDocumentoValor, string> = {
      'borrador': 'bg-gray-500',
      'revision': 'bg-yellow-500',
      'aprobado': 'bg-blue-500',
      'en_firma': 'bg-purple-500',
      'firmado': 'bg-green-500',
      'vencido': 'bg-red-500',
      'cancelado': 'bg-red-700'
    }
    
    return colores[this._valor]
  }

  get icono(): string {
    const iconos: Record<EstadoDocumentoValor, string> = {
      'borrador': '✏️',
      'revision': '👀',
      'aprobado': '✅',
      'en_firma': '✍️',
      'firmado': '🔒',
      'vencido': '⏰',
      'cancelado': '❌'
    }
    
    return iconos[this._valor]
  }

  get prioridad(): number {
    const prioridades: Record<EstadoDocumentoValor, number> = {
      'en_firma': 5,    // Máxima prioridad
      'revision': 4,    // Alta prioridad
      'aprobado': 3,    // Media prioridad
      'borrador': 2,    // Baja prioridad
      'vencido': 1,     // Muy baja prioridad
      'firmado': 0,     // Sin prioridad
      'cancelado': 0    // Sin prioridad
    }
    
    return prioridades[this._valor]
  }

  esEditable(): boolean {
    return ['borrador', 'revision'].includes(this._valor)
  }

  requiereAccion(): boolean {
    return ['revision', 'en_firma', 'vencido'].includes(this._valor)
  }

  esFinal(): boolean {
    return ['firmado', 'cancelado'].includes(this._valor)
  }

  permiteEnvioFirma(): boolean {
    return ['aprobado', 'revision'].includes(this._valor)
  }

  puedeTransicionarA(nuevoEstado: EstadoDocumento): boolean {
    const transicionesValidas: Record<EstadoDocumentoValor, EstadoDocumentoValor[]> = {
      'borrador': ['revision', 'cancelado'],
      'revision': ['aprobado', 'borrador', 'cancelado'],
      'aprobado': ['en_firma', 'revision', 'cancelado'],
      'en_firma': ['firmado', 'vencido', 'cancelado'],
      'firmado': [], // Estado final
      'vencido': ['en_firma', 'cancelado'],
      'cancelado': [] // Estado final
    }
    
    return transicionesValidas[this._valor]?.includes(nuevoEstado._valor) || false
  }

  obtenerAccionesDisponibles(): string[] {
    const acciones: Record<EstadoDocumentoValor, string[]> = {
      'borrador': ['editar', 'enviar_revision', 'cancelar'],
      'revision': ['aprobar', 'rechazar', 'editar'],
      'aprobado': ['enviar_firma', 'editar'],
      'en_firma': ['ver_estado_firmas', 'cancelar_firma'],
      'firmado': ['descargar', 'ver_firmas'],
      'vencido': ['reenviar_firma', 'cancelar'],
      'cancelado': ['ver_historial']
    }
    
    return acciones[this._valor] || []
  }

  obtenerProximoPasoSugerido(): string {
    const pasos: Record<EstadoDocumentoValor, string> = {
      'borrador': 'Completar edición y enviar a revisión',
      'revision': 'Revisar contenido y aprobar o rechazar',
      'aprobado': 'Enviar documento para firma digital',
      'en_firma': 'Esperar completar proceso de firmas',
      'firmado': 'Documento completado - Archivar',
      'vencido': 'Reenviar para firma o cancelar proceso',
      'cancelado': 'Documento cancelado - Sin acciones'
    }
    
    return pasos[this._valor]
  }

  calcularTiempoEnEstado(fechaInicio: Date): number {
    return Math.floor((new Date().getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  esEstadoCritico(diasEnEstado: number): boolean {
    const limitesCriticos: Record<EstadoDocumentoValor, number> = {
      'borrador': 7,     // 7 días en borrador es crítico
      'revision': 3,     // 3 días en revisión es crítico
      'aprobado': 5,     // 5 días aprobado sin enviar es crítico
      'en_firma': 10,    // 10 días en firma es crítico
      'firmado': 0,      // No aplica
      'vencido': 0,      // Ya es crítico por definición
      'cancelado': 0     // No aplica
    }
    
    const limite = limitesCriticos[this._valor]
    return limite > 0 && diasEnEstado > limite
  }

  equals(other: EstadoDocumento): boolean {
    return this._valor === other._valor
  }

  toString(): string {
    return this._valor
  }
}