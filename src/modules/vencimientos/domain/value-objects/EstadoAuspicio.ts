/**
 * VALUE OBJECT: ESTADO DE AUSPICIO - TIER 0 ENTERPRISE
 *
 * @description Estados con flujo inteligente, transiciones válidas,
 * y validaciones automáticas para el ciclo de vida del auspicio.
 *
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 */

export type EstadoAuspicioValor =
  | 'pre_cierre'
  | 'pendiente'
  | 'confirmado'
  | 'activo'
  | 'pausado'
  | 'vencido'
  | 'cancelado'
  | 'no_iniciado'
  | 'en_extension'
  | 'lista_espera'
  | 'bloqueado_temporal'

export class EstadoAuspicio {
  private constructor(private readonly _valor: EstadoAuspicioValor) {}

  // ── Factory Methods ──
  static preCierre(): EstadoAuspicio { return new EstadoAuspicio('pre_cierre') }
  static pendiente(): EstadoAuspicio { return new EstadoAuspicio('pendiente') }
  static confirmado(): EstadoAuspicio { return new EstadoAuspicio('confirmado') }
  static activo(): EstadoAuspicio { return new EstadoAuspicio('activo') }
  static pausado(): EstadoAuspicio { return new EstadoAuspicio('pausado') }
  static vencido(): EstadoAuspicio { return new EstadoAuspicio('vencido') }
  static cancelado(): EstadoAuspicio { return new EstadoAuspicio('cancelado') }
  static noIniciado(): EstadoAuspicio { return new EstadoAuspicio('no_iniciado') }
  static enExtension(): EstadoAuspicio { return new EstadoAuspicio('en_extension') }
  static listaEspera(): EstadoAuspicio { return new EstadoAuspicio('lista_espera') }
  static bloqueadoTemporal(): EstadoAuspicio { return new EstadoAuspicio('bloqueado_temporal') }

  static fromString(valor: string): EstadoAuspicio {
    const estados: EstadoAuspicioValor[] = [
      'pre_cierre', 'pendiente', 'confirmado', 'activo', 'pausado',
      'vencido', 'cancelado', 'no_iniciado', 'en_extension', 'lista_espera', 'bloqueado_temporal'
    ]
    if (!estados.includes(valor as EstadoAuspicioValor)) {
      throw new Error(`Estado de auspicio inválido: ${valor}`)
    }
    return new EstadoAuspicio(valor as EstadoAuspicioValor)
  }

  // ── Getters ──
  get valor(): EstadoAuspicioValor { return this._valor }

  get descripcion(): string {
    const descripciones: Record<EstadoAuspicioValor, string> = {
      'pre_cierre': 'Pre-cierre - Pendiente de confirmación final por el ejecutivo',
      'pendiente': 'Pendiente de confirmación por programador',
      'confirmado': 'Confirmado - Esperando fecha de inicio',
      'activo': 'Activo - En emisión',
      'pausado': 'Pausado temporalmente',
      'vencido': 'Vencido - Período finalizado',
      'cancelado': 'Cancelado - Terminado sin completar',
      'no_iniciado': 'No iniciado - Superó fecha de inicio sin confirmar arranque',
      'en_extension': 'En extensión - Solicitó ampliación de fecha',
      'lista_espera': 'En lista de espera - Sin cupo disponible actualmente',
      'bloqueado_temporal': 'Bloqueado temporalmente - Reserva ejecutiva rápida (4h)'
    }
    return descripciones[this._valor]
  }

  get color(): string {
    const colores: Record<EstadoAuspicioValor, string> = {
      'pre_cierre': 'bg-pink-500',
      'pendiente': 'bg-yellow-500',
      'confirmado': 'bg-blue-500',
      'activo': 'bg-green-500',
      'pausado': 'bg-orange-500',
      'vencido': 'bg-gray-500',
      'cancelado': 'bg-red-500',
      'no_iniciado': 'bg-red-700',
      'en_extension': 'bg-purple-500',
      'lista_espera': 'bg-cyan-500',
      'bloqueado_temporal': 'bg-indigo-500'
    }
    return colores[this._valor]
  }

  get colorHex(): string {
    const colores: Record<EstadoAuspicioValor, string> = {
      'pre_cierre': '#ec4899',
      'pendiente': '#eab308',
      'confirmado': '#3b82f6',
      'activo': '#22c55e',
      'pausado': '#f97316',
      'vencido': '#6b7280',
      'cancelado': '#ef4444',
      'no_iniciado': '#b91c1c',
      'en_extension': '#a855f7',
      'lista_espera': '#06b6d4',
      'bloqueado_temporal': '#6366f1'
    }
    return colores[this._valor]
  }

  get prioridad(): number {
    const prioridades: Record<EstadoAuspicioValor, number> = {
      'no_iniciado': 10,    // Máxima urgencia — requiere acción inmediata
      'en_extension': 9,    // Alta urgencia — pendiente aprobación
      'pre_cierre': 8,      // Requiere confirmación de pre-cierre
      'pendiente': 7,       // Requiere confirmación
      'bloqueado_temporal': 6,
      'confirmado': 5,      // Próximo a iniciar
      'activo': 4,          // En curso normal
      'pausado': 3,
      'lista_espera': 2,
      'vencido': 1,
      'cancelado': 0
    }
    return prioridades[this._valor]
  }

  // ── Transiciones válidas ──
  get transicionesValidas(): EstadoAuspicioValor[] {
    const transiciones: Record<EstadoAuspicioValor, EstadoAuspicioValor[]> = {
      'pre_cierre': ['confirmado', 'cancelado', 'pendiente'],
      'pendiente': ['confirmado', 'cancelado', 'lista_espera'],
      'confirmado': ['activo', 'no_iniciado', 'cancelado', 'en_extension'],
      'activo': ['pausado', 'vencido', 'cancelado'],
      'pausado': ['activo', 'cancelado'],
      'vencido': [],
      'cancelado': [],
      'no_iniciado': ['en_extension', 'cancelado'],
      'en_extension': ['confirmado', 'cancelado'],
      'lista_espera': ['pendiente', 'cancelado'],
      'bloqueado_temporal': ['confirmado', 'cancelado']
    }
    return transiciones[this._valor]
  }

  puedeTransicionarA(nuevoEstado: EstadoAuspicio): boolean {
    return this.transicionesValidas.includes(nuevoEstado._valor)
  }

  // ── Métodos de consulta ──
  esPreCierre(): boolean { return this._valor === 'pre_cierre' }
  esPendiente(): boolean { return this._valor === 'pendiente' }
  esConfirmado(): boolean { return this._valor === 'confirmado' }
  esActivo(): boolean { return this._valor === 'activo' }
  esPausado(): boolean { return this._valor === 'pausado' }
  esVencido(): boolean { return this._valor === 'vencido' }
  esCancelado(): boolean { return this._valor === 'cancelado' }
  esNoIniciado(): boolean { return this._valor === 'no_iniciado' }
  esEnExtension(): boolean { return this._valor === 'en_extension' }
  esListaEspera(): boolean { return this._valor === 'lista_espera' }
  esBloqueadoTemporal(): boolean { return this._valor === 'bloqueado_temporal' }

  esFinal(): boolean {
    return ['vencido', 'cancelado'].includes(this._valor)
  }

  requiereAccion(): boolean {
    return ['pendiente', 'no_iniciado', 'en_extension'].includes(this._valor)
  }

  esEditable(): boolean {
    return ['pendiente', 'confirmado', 'en_extension', 'bloqueado_temporal'].includes(this._valor)
  }

  ocupaCupo(): boolean {
    return ['confirmado', 'activo', 'pausado', 'no_iniciado', 'en_extension', 'bloqueado_temporal'].includes(this._valor)
  }

  // ── Igualdad ──
  equals(other: EstadoAuspicio): boolean {
    return this._valor === other._valor
  }

  toString(): string { return this._valor }
}
