/**
 * VALUE OBJECT: TIPO DOCUMENTO - TIER 0
 * 
 * @description Tipos de documentos con validaciones específicas
 */

export type TipoDocumentoValor = 
  | 'contrato_principal' 
  | 'anexo' 
  | 'orden_compra' 
  | 'factura' 
  | 'carta_tercerización' 
  | 'clausulas_especiales'
  | 'propuesta_comercial'
  | 'acuerdo_confidencialidad'
  | 'terminos_condiciones'

export class TipoDocumento {
  private constructor(private readonly _valor: TipoDocumentoValor) {}

  static contratoPrincipal(): TipoDocumento {
    return new TipoDocumento('contrato_principal')
  }

  static anexo(): TipoDocumento {
    return new TipoDocumento('anexo')
  }

  static ordenCompra(): TipoDocumento {
    return new TipoDocumento('orden_compra')
  }

  static factura(): TipoDocumento {
    return new TipoDocumento('factura')
  }

  static cartaTercerización(): TipoDocumento {
    return new TipoDocumento('carta_tercerización')
  }

  static clausulasEspeciales(): TipoDocumento {
    return new TipoDocumento('clausulas_especiales')
  }

  static propuestaComercial(): TipoDocumento {
    return new TipoDocumento('propuesta_comercial')
  }

  static acuerdoConfidencialidad(): TipoDocumento {
    return new TipoDocumento('acuerdo_confidencialidad')
  }

  static terminosCondiciones(): TipoDocumento {
    return new TipoDocumento('terminos_condiciones')
  }

  static fromString(valor: string): TipoDocumento {
    const tipos: TipoDocumentoValor[] = [
      'contrato_principal', 'anexo', 'orden_compra', 'factura', 
      'carta_tercerización', 'clausulas_especiales', 'propuesta_comercial',
      'acuerdo_confidencialidad', 'terminos_condiciones'
    ]
    
    if (!tipos.includes(valor as TipoDocumentoValor)) {
      throw new Error(`Tipo de documento inválido: ${valor}`)
    }
    
    return new TipoDocumento(valor as TipoDocumentoValor)
  }

  get valor(): TipoDocumentoValor {
    return this._valor
  }

  get descripcion(): string {
    const descripciones: Record<TipoDocumentoValor, string> = {
      'contrato_principal': 'Contrato Principal - Documento base del acuerdo',
      'anexo': 'Anexo - Documento complementario al contrato',
      'orden_compra': 'Orden de Compra - Solicitud formal de productos/servicios',
      'factura': 'Factura - Documento de cobro',
      'carta_tercerización': 'Carta de Tercerización - Para agencias',
      'clausulas_especiales': 'Cláusulas Especiales - Términos adicionales',
      'propuesta_comercial': 'Propuesta Comercial - Oferta inicial',
      'acuerdo_confidencialidad': 'Acuerdo de Confidencialidad - NDA',
      'terminos_condiciones': 'Términos y Condiciones - Condiciones generales'
    }
    
    return descripciones[this._valor]
  }

  get icono(): string {
    const iconos: Record<TipoDocumentoValor, string> = {
      'contrato_principal': '📄',
      'anexo': '📎',
      'orden_compra': '🛒',
      'factura': '💰',
      'carta_tercerización': '🏢',
      'clausulas_especiales': '⚖️',
      'propuesta_comercial': '💼',
      'acuerdo_confidencialidad': '🔒',
      'terminos_condiciones': '📋'
    }
    
    return iconos[this._valor]
  }

  requiereFirmaDigital(): boolean {
    return [
      'contrato_principal', 
      'anexo', 
      'carta_tercerización', 
      'acuerdo_confidencialidad'
    ].includes(this._valor)
  }

  esObligatorio(): boolean {
    return ['contrato_principal', 'orden_compra'].includes(this._valor)
  }

  getPlantillaDefecto(): string {
    const plantillas: Record<TipoDocumentoValor, string> = {
      'contrato_principal': 'plantilla_contrato_base',
      'anexo': 'plantilla_anexo_base',
      'orden_compra': 'plantilla_orden_compra',
      'factura': 'plantilla_factura',
      'carta_tercerización': 'plantilla_tercerización',
      'clausulas_especiales': 'plantilla_clausulas',
      'propuesta_comercial': 'plantilla_propuesta',
      'acuerdo_confidencialidad': 'plantilla_nda',
      'terminos_condiciones': 'plantilla_terminos'
    }
    
    return plantillas[this._valor]
  }

  requiereAprobacionLegal(): boolean {
    return [
      'contrato_principal', 
      'clausulas_especiales', 
      'acuerdo_confidencialidad'
    ].includes(this._valor)
  }

  obtenerFirmantesRequeridos(): string[] {
    const firmantes: Record<TipoDocumentoValor, string[]> = {
      'contrato_principal': ['cliente', 'empresa', 'legal'],
      'anexo': ['cliente', 'empresa'],
      'orden_compra': ['cliente'],
      'factura': [],
      'carta_tercerización': ['agencia', 'empresa'],
      'clausulas_especiales': ['cliente', 'empresa', 'legal'],
      'propuesta_comercial': [],
      'acuerdo_confidencialidad': ['cliente', 'empresa'],
      'terminos_condiciones': []
    }
    
    return firmantes[this._valor] || []
  }

  obtenerTiempoRetencion(): number {
    // Años de retención según tipo de documento
    const retencion: Record<TipoDocumentoValor, number> = {
      'contrato_principal': 10,
      'anexo': 10,
      'orden_compra': 7,
      'factura': 7,
      'carta_tercerización': 5,
      'clausulas_especiales': 10,
      'propuesta_comercial': 3,
      'acuerdo_confidencialidad': 15,
      'terminos_condiciones': 5
    }
    
    return retencion[this._valor]
  }

  equals(other: TipoDocumento): boolean {
    return this._valor === other._valor
  }

  toString(): string {
    return this._valor
  }
}