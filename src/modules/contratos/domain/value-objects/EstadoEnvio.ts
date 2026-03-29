/**
 * VALUE OBJECT: ESTADO ENVIO - TIER 0
 */

export type EstadoEnvioValor = 'pendiente' | 'enviando' | 'enviado' | 'reintentando' | 'fallido'

export class EstadoEnvio {
  private constructor(private readonly _valor: EstadoEnvioValor) {}

  static pendiente(): EstadoEnvio { return new EstadoEnvio('pendiente') }
  static enviando(): EstadoEnvio { return new EstadoEnvio('enviando') }
  static enviado(): EstadoEnvio { return new EstadoEnvio('enviado') }
  static reintentando(): EstadoEnvio { return new EstadoEnvio('reintentando') }
  static fallido(): EstadoEnvio { return new EstadoEnvio('fallido') }

  get valor(): EstadoEnvioValor { return this._valor }
  
  get descripcion(): string {
    const descripciones = {
      'pendiente': 'Pendiente - Listo para envío',
      'enviando': 'Enviando - En proceso de envío',
      'enviado': 'Enviado - Enviado exitosamente',
      'reintentando': 'Reintentando - Programado para reintento',
      'fallido': 'Fallido - Envío falló definitivamente'
    }
    return descripciones[this._valor]
  }

  equals(other: EstadoEnvio): boolean { return this._valor === other._valor }
  toString(): string { return this._valor }
}