/**
 * ⏰ VALUE OBJECT: TIEMPO ENTREGA
 * 
 * Define los diferentes tipos de tiempo de entrega
 * y sus características específicas
 */

export type TiempoEntregaValue = 
  | 'EXPRESS'      // 0-24 horas
  | 'URGENTE'      // 1-3 días
  | 'RAPIDO'       // 3-7 días
  | 'ESTANDAR'     // 1-2 semanas
  | 'NORMAL'       // 2-4 semanas
  | 'EXTENDIDO'    // 1-2 meses
  | 'LARGO_PLAZO'  // 2+ meses

export class TiempoEntrega {
  private readonly _value: TiempoEntregaValue
  
  constructor(value: TiempoEntregaValue | string) {
    this._value = this.parseValue(value)
    this.validate()
  }
  
  get value(): TiempoEntregaValue {
    return this._value
  }
  
  get displayName(): string {
    const names: Record<TiempoEntregaValue, string> = {
      'EXPRESS': 'Express',
      'URGENTE': 'Urgente',
      'RAPIDO': 'Rápido',
      'ESTANDAR': 'Estándar',
      'NORMAL': 'Normal',
      'EXTENDIDO': 'Extendido',
      'LARGO_PLAZO': 'Largo Plazo'
    }
    
    return names[this._value]
  }
  
  get description(): string {
    const descriptions: Record<TiempoEntregaValue, string> = {
      'EXPRESS': 'Entrega en menos de 24 horas - Máxima prioridad',
      'URGENTE': 'Entrega en 1-3 días - Alta prioridad',
      'RAPIDO': 'Entrega en 3-7 días - Prioridad media-alta',
      'ESTANDAR': 'Entrega en 1-2 semanas - Tiempo estándar del mercado',
      'NORMAL': 'Entrega en 2-4 semanas - Tiempo normal de producción',
      'EXTENDIDO': 'Entrega en 1-2 meses - Proyectos complejos',
      'LARGO_PLAZO': 'Entrega en 2+ meses - Proyectos de gran envergadura'
    }
    
    return descriptions[this._value]
  }
  
  /**
   * Obtiene el rango de días para este tiempo de entrega
   */
  get rangoDias(): { min: number; max: number } {
    const rangos: Record<TiempoEntregaValue, { min: number; max: number }> = {
      'EXPRESS': { min: 0, max: 1 },
      'URGENTE': { min: 1, max: 3 },
      'RAPIDO': { min: 3, max: 7 },
      'ESTANDAR': { min: 7, max: 14 },
      'NORMAL': { min: 14, max: 30 },
      'EXTENDIDO': { min: 30, max: 60 },
      'LARGO_PLAZO': { min: 60, max: 365 }
    }
    
    return rangos[this._value]
  }
  
  /**
   * Obtiene el multiplicador de costo por urgencia
   */
  get multiplicadorCosto(): number {
    const multiplicadores: Record<TiempoEntregaValue, number> = {
      'EXPRESS': 2.5,      // +150% por urgencia extrema
      'URGENTE': 1.8,      // +80% por urgencia alta
      'RAPIDO': 1.4,       // +40% por rapidez
      'ESTANDAR': 1.0,     // Precio base
      'NORMAL': 0.9,       // -10% por tiempo normal
      'EXTENDIDO': 0.8,    // -20% por tiempo extendido
      'LARGO_PLAZO': 0.7   // -30% por largo plazo
    }
    
    return multiplicadores[this._value]
  }
  
  /**
   * Obtiene el nivel de prioridad
   */
  get nivelPrioridad(): number {
    const prioridades: Record<TiempoEntregaValue, number> = {
      'EXPRESS': 10,
      'URGENTE': 8,
      'RAPIDO': 6,
      'ESTANDAR': 4,
      'NORMAL': 3,
      'EXTENDIDO': 2,
      'LARGO_PLAZO': 1
    }
    
    return prioridades[this._value]
  }
  
  /**
   * Obtiene el color asociado al tiempo de entrega
   */
  get color(): string {
    const colors: Record<TiempoEntregaValue, string> = {
      'EXPRESS': '#DC2626',     // Rojo intenso
      'URGENTE': '#EA580C',     // Naranja rojo
      'RAPIDO': '#D97706',      // Naranja
      'ESTANDAR': '#059669',    // Verde
      'NORMAL': '#0D9488',      // Verde azulado
      'EXTENDIDO': '#0284C7',   // Azul
      'LARGO_PLAZO': '#7C3AED'  // Púrpura
    }
    
    return colors[this._value]
  }
  
  /**
   * Obtiene el emoji asociado
   */
  get emoji(): string {
    const emojis: Record<TiempoEntregaValue, string> = {
      'EXPRESS': '🚀',
      'URGENTE': '⚡',
      'RAPIDO': '🏃‍♂️',
      'ESTANDAR': '⏰',
      'NORMAL': '📅',
      'EXTENDIDO': '🗓️',
      'LARGO_PLAZO': '📆'
    }
    
    return emojis[this._value]
  }
  
  /**
   * Verifica si requiere recursos adicionales
   */
  get requiereRecursosAdicionales(): boolean {
    return ['EXPRESS', 'URGENTE', 'RAPIDO'].includes(this._value)
  }
  
  /**
   * Verifica si permite trabajo en fin de semana
   */
  get permiteTrabajFinSemana(): boolean {
    return ['EXPRESS', 'URGENTE'].includes(this._value)
  }
  
  /**
   * Verifica si requiere aprobación especial
   */
  get requiereAprobacionEspecial(): boolean {
    return this._value === 'EXPRESS'
  }
  
  /**
   * Calcula la fecha de entrega basada en una fecha de inicio
   */
  calcularFechaEntrega(fechaInicio: Date, incluirFinSemana: boolean = false): Date {
    const rango = this.rangoDias
    let diasAñadir = rango.max
    
    // Para tiempos express y urgentes, usar el mínimo del rango
    if (['EXPRESS', 'URGENTE'].includes(this._value)) {
      diasAñadir = rango.min
    }
    
    const fechaEntrega = new Date(fechaInicio)
    
    if (incluirFinSemana || this.permiteTrabajFinSemana) {
      // Añadir días calendario
      fechaEntrega.setDate(fechaEntrega.getDate() + diasAñadir)
    } else {
      // Añadir solo días laborales
      let diasAñadidos = 0
      while (diasAñadidos < diasAñadir) {
        fechaEntrega.setDate(fechaEntrega.getDate() + 1)
        const diaSemana = fechaEntrega.getDay()
        // 0 = Domingo, 6 = Sábado
        if (diaSemana !== 0 && diaSemana !== 6) {
          diasAñadidos++
        }
      }
    }
    
    return fechaEntrega
  }
  
  /**
   * Verifica si una fecha está dentro del rango de este tiempo de entrega
   */
  estaEnRango(fechaInicio: Date, fechaEntrega: Date): boolean {
    const diasDiferencia = Math.ceil(
      (fechaEntrega.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const rango = this.rangoDias
    return diasDiferencia >= rango.min && diasDiferencia <= rango.max
  }
  
  /**
   * Obtiene recomendaciones para este tiempo de entrega
   */
  getRecomendaciones(): string[] {
    const recomendaciones: Record<TiempoEntregaValue, string[]> = {
      'EXPRESS': [
        'Asignar equipo dedicado exclusivamente',
        'Confirmar disponibilidad inmediata de recursos',
        'Establecer comunicación directa con cliente',
        'Preparar plan de contingencia',
        'Considerar trabajo en horario extendido'
      ],
      'URGENTE': [
        'Priorizar sobre otros proyectos',
        'Asegurar disponibilidad de equipo clave',
        'Establecer checkpoints frecuentes',
        'Preparar recursos de backup'
      ],
      'RAPIDO': [
        'Optimizar flujo de trabajo',
        'Confirmar disponibilidad de recursos',
        'Establecer comunicación clara de expectativas'
      ],
      'ESTANDAR': [
        'Seguir proceso estándar de producción',
        'Mantener comunicación regular',
        'Aplicar mejores prácticas'
      ],
      'NORMAL': [
        'Permitir tiempo para iteraciones',
        'Incluir revisiones intermedias',
        'Optimizar calidad sobre velocidad'
      ],
      'EXTENDIDO': [
        'Planificar fases detalladas',
        'Incluir múltiples revisiones',
        'Considerar investigación adicional'
      ],
      'LARGO_PLAZO': [
        'Desarrollar roadmap detallado',
        'Establecer hitos intermedios',
        'Planificar recursos a largo plazo',
        'Incluir tiempo para innovación'
      ]
    }
    
    return recomendaciones[this._value]
  }
  
  /**
   * Compara con otro tiempo de entrega
   */
  esMasRapidoQue(otro: TiempoEntrega): boolean {
    return this.nivelPrioridad > otro.nivelPrioridad
  }
  
  /**
   * Verifica si es compatible con la capacidad de una agencia
   */
  esCompatibleConCapacidad(
    proyectosActivos: number,
    capacidadMaxima: number,
    factorUrgencia: number = 1
  ): boolean {
    const capacidadRequerida = this.nivelPrioridad * factorUrgencia
    const capacidadDisponible = capacidadMaxima - proyectosActivos
    
    return capacidadDisponible >= capacidadRequerida
  }
  
  /**
   * Parsea el valor de entrada
   */
  private parseValue(value: TiempoEntregaValue | string): TiempoEntregaValue {
    if (typeof value === 'string') {
      const upperValue = value.toUpperCase().replace(/\s+/g, '_')
      
      // Mapeo de valores alternativos
      const mappings: Record<string, TiempoEntregaValue> = {
        'INMEDIATO': 'EXPRESS',
        'YA': 'EXPRESS',
        'AHORA': 'EXPRESS',
        'CRITICO': 'EXPRESS',
        'ASAP': 'URGENTE',
        'PRONTO': 'URGENTE',
        'FAST': 'RAPIDO',
        'QUICK': 'RAPIDO',
        'STANDARD': 'ESTANDAR',
        'REGULAR': 'NORMAL',
        'LENTO': 'EXTENDIDO',
        'LARGO': 'LARGO_PLAZO'
      }
      
      return mappings[upperValue] || upperValue as TiempoEntregaValue
    }
    
    return value
  }
  
  /**
   * Valida el valor
   */
  private validate(): void {
    const validValues: TiempoEntregaValue[] = [
      'EXPRESS',
      'URGENTE',
      'RAPIDO',
      'ESTANDAR',
      'NORMAL',
      'EXTENDIDO',
      'LARGO_PLAZO'
    ]
    
    if (!validValues.includes(this._value)) {
      throw new Error(`Tiempo de entrega inválido: ${this._value}. Valores válidos: ${validValues.join(', ')}`)
    }
  }
  
  /**
   * Compara con otro tiempo de entrega
   */
  equals(other: TiempoEntrega): boolean {
    return this._value === other._value
  }
  
  /**
   * Representación como string
   */
  toString(): string {
    return this.displayName
  }
  
  /**
   * Serialización para JSON
   */
  toJSON(): TiempoEntregaValue {
    return this._value
  }
  
  /**
   * Obtiene todos los tiempos disponibles
   */
  static getAllTiempos(): TiempoEntrega[] {
    const tiempos: TiempoEntregaValue[] = [
      'EXPRESS',
      'URGENTE',
      'RAPIDO',
      'ESTANDAR',
      'NORMAL',
      'EXTENDIDO',
      'LARGO_PLAZO'
    ]
    
    return tiempos.map(tiempo => new TiempoEntrega(tiempo))
  }
  
  /**
   * Crea desde string
   */
  static fromString(value: string): TiempoEntrega {
    return new TiempoEntrega(value)
  }
  
  /**
   * Crea desde número de días
   */
  static fromDias(dias: number): TiempoEntrega {
    if (dias <= 1) return new TiempoEntrega('EXPRESS')
    if (dias <= 3) return new TiempoEntrega('URGENTE')
    if (dias <= 7) return new TiempoEntrega('RAPIDO')
    if (dias <= 14) return new TiempoEntrega('ESTANDAR')
    if (dias <= 30) return new TiempoEntrega('NORMAL')
    if (dias <= 60) return new TiempoEntrega('EXTENDIDO')
    return new TiempoEntrega('LARGO_PLAZO')
  }
}