/**
 * 🏢 VALUE OBJECT: TIPO AGENCIA CREATIVA
 * 
 * Define los diferentes tipos de agencias creativas
 * y sus características específicas
 */

export type TipoAgenciaCreativaValue = 
  | 'FULL_SERVICE'
  | 'ESPECIALIZADA'
  | 'BOUTIQUE'
  | 'FREELANCE'
  | 'DIGITAL_NATIVE'
  | 'TRADICIONAL'
  | 'HIBRIDA'

export class TipoAgenciaCreativa {
  private readonly _value: TipoAgenciaCreativaValue
  
  constructor(value: TipoAgenciaCreativaValue | string) {
    this._value = this.parseValue(value)
    this.validate()
  }
  
  get value(): TipoAgenciaCreativaValue {
    return this._value
  }
  
  get displayName(): string {
    const names: Record<TipoAgenciaCreativaValue, string> = {
      'FULL_SERVICE': 'Full Service',
      'ESPECIALIZADA': 'Especializada',
      'BOUTIQUE': 'Boutique',
      'FREELANCE': 'Freelance',
      'DIGITAL_NATIVE': 'Digital Native',
      'TRADICIONAL': 'Tradicional',
      'HIBRIDA': 'Híbrida'
    }
    
    return names[this._value]
  }
  
  get description(): string {
    const descriptions: Record<TipoAgenciaCreativaValue, string> = {
      'FULL_SERVICE': 'Agencia integral que ofrece servicios completos de publicidad y marketing',
      'ESPECIALIZADA': 'Agencia enfocada en una disciplina específica (video, audio, digital, etc.)',
      'BOUTIQUE': 'Agencia pequeña y exclusiva con enfoque personalizado y alta calidad',
      'FREELANCE': 'Profesional independiente o equipo muy pequeño',
      'DIGITAL_NATIVE': 'Agencia nativa digital especializada en medios digitales y tecnología',
      'TRADICIONAL': 'Agencia con enfoque en medios tradicionales (TV, radio, print)',
      'HIBRIDA': 'Combinación de servicios tradicionales y digitales'
    }
    
    return descriptions[this._value]
  }
  
  /**
   * Obtiene las características típicas del tipo de agencia
   */
  getCaracteristicas(): {
    tamaño: 'Pequeño' | 'Mediano' | 'Grande'
    especializacion: 'Alta' | 'Media' | 'Baja'
    flexibilidad: 'Alta' | 'Media' | 'Baja'
    costoPromedio: 'Bajo' | 'Medio' | 'Alto' | 'Premium'
    tiempoRespuesta: 'Rapido' | 'Medio' | 'Lento'
  } {
    const caracteristicas = {
      'FULL_SERVICE': {
        tamaño: 'Grande' as const,
        especializacion: 'Baja' as const,
        flexibilidad: 'Media' as const,
        costoPromedio: 'Alto' as const,
        tiempoRespuesta: 'Medio' as const
      },
      'ESPECIALIZADA': {
        tamaño: 'Mediano' as const,
        especializacion: 'Alta' as const,
        flexibilidad: 'Media' as const,
        costoPromedio: 'Medio' as const,
        tiempoRespuesta: 'Rapido' as const
      },
      'BOUTIQUE': {
        tamaño: 'Pequeño' as const,
        especializacion: 'Alta' as const,
        flexibilidad: 'Alta' as const,
        costoPromedio: 'Premium' as const,
        tiempoRespuesta: 'Rapido' as const
      },
      'FREELANCE': {
        tamaño: 'Pequeño' as const,
        especializacion: 'Alta' as const,
        flexibilidad: 'Alta' as const,
        costoPromedio: 'Bajo' as const,
        tiempoRespuesta: 'Rapido' as const
      },
      'DIGITAL_NATIVE': {
        tamaño: 'Mediano' as const,
        especializacion: 'Alta' as const,
        flexibilidad: 'Alta' as const,
        costoPromedio: 'Medio' as const,
        tiempoRespuesta: 'Rapido' as const
      },
      'TRADICIONAL': {
        tamaño: 'Grande' as const,
        especializacion: 'Media' as const,
        flexibilidad: 'Baja' as const,
        costoPromedio: 'Alto' as const,
        tiempoRespuesta: 'Lento' as const
      },
      'HIBRIDA': {
        tamaño: 'Mediano' as const,
        especializacion: 'Media' as const,
        flexibilidad: 'Media' as const,
        costoPromedio: 'Medio' as const,
        tiempoRespuesta: 'Medio' as const
      }
    }
    
    return caracteristicas[this._value]
  }
  
  /**
   * Obtiene los servicios típicos que ofrece este tipo de agencia
   */
  getServiciosTipicos(): string[] {
    const servicios: Record<TipoAgenciaCreativaValue, string[]> = {
      'FULL_SERVICE': [
        'Estrategia de marca',
        'Creatividad publicitaria',
        'Producción audiovisual',
        'Medios digitales',
        'Medios tradicionales',
        'Activaciones BTL',
        'Relaciones públicas'
      ],
      'ESPECIALIZADA': [
        'Servicio especializado principal',
        'Consultoría técnica',
        'Desarrollo de expertise',
        'Innovación en la especialidad'
      ],
      'BOUTIQUE': [
        'Creatividad premium',
        'Atención personalizada',
        'Proyectos exclusivos',
        'Consultoría estratégica'
      ],
      'FREELANCE': [
        'Servicios específicos',
        'Flexibilidad horaria',
        'Costos competitivos',
        'Atención directa'
      ],
      'DIGITAL_NATIVE': [
        'Marketing digital',
        'Social media',
        'E-commerce',
        'Desarrollo web/app',
        'SEO/SEM',
        'Analytics digital'
      ],
      'TRADICIONAL': [
        'Publicidad TV',
        'Publicidad radio',
        'Publicidad impresa',
        'Outdoor/OOH',
        'Producción tradicional'
      ],
      'HIBRIDA': [
        'Servicios integrados',
        'Estrategia omnicanal',
        'Producción multimedia',
        'Medios mixtos'
      ]
    }
    
    return servicios[this._value]
  }
  
  /**
   * Verifica si es compatible con un tipo de proyecto
   */
  esCompatibleCon(tipoProyecto: string): boolean {
    const compatibilidades: Record<TipoAgenciaCreativaValue, string[]> = {
      'FULL_SERVICE': ['video', 'audio', 'grafico', 'digital', 'btl', 'integral'],
      'ESPECIALIZADA': [], // Depende de la especialización específica
      'BOUTIQUE': ['video', 'grafico', 'digital', 'premium'],
      'FREELANCE': ['grafico', 'digital', 'audio', 'simple'],
      'DIGITAL_NATIVE': ['digital', 'social', 'web', 'app', 'ecommerce'],
      'TRADICIONAL': ['video', 'audio', 'tv', 'radio', 'print'],
      'HIBRIDA': ['video', 'audio', 'grafico', 'digital', 'integral']
    }
    
    const tiposCompatibles = compatibilidades[this._value]
    return tiposCompatibles.some(tipo => 
      tipoProyecto.toLowerCase().includes(tipo.toLowerCase())
    )
  }
  
  /**
   * Obtiene el multiplicador de capacidad basado en el tipo
   */
  getCapacityMultiplier(): number {
    const multipliers: Record<TipoAgenciaCreativaValue, number> = {
      'FULL_SERVICE': 1.5,
      'ESPECIALIZADA': 1.2,
      'BOUTIQUE': 0.8,
      'FREELANCE': 0.5,
      'DIGITAL_NATIVE': 1.3,
      'TRADICIONAL': 1.0,
      'HIBRIDA': 1.1
    }
    
    return multipliers[this._value]
  }
  
  /**
   * Parsea el valor de entrada
   */
  private parseValue(value: TipoAgenciaCreativaValue | string): TipoAgenciaCreativaValue {
    if (typeof value === 'string') {
      const upperValue = value.toUpperCase().replace(/\s+/g, '_')
      
      // Mapeo de valores alternativos
      const mappings: Record<string, TipoAgenciaCreativaValue> = {
        'FULL': 'FULL_SERVICE',
        'COMPLETA': 'FULL_SERVICE',
        'INTEGRAL': 'FULL_SERVICE',
        'ESPECIALISTA': 'ESPECIALIZADA',
        'EXPERTA': 'ESPECIALIZADA',
        'PEQUEÑA': 'BOUTIQUE',
        'EXCLUSIVA': 'BOUTIQUE',
        'INDEPENDIENTE': 'FREELANCE',
        'AUTONOMO': 'FREELANCE',
        'DIGITAL': 'DIGITAL_NATIVE',
        'NATIVA_DIGITAL': 'DIGITAL_NATIVE',
        'CLASICA': 'TRADICIONAL',
        'CONVENCIONAL': 'TRADICIONAL',
        'MIXTA': 'HIBRIDA',
        'COMBINADA': 'HIBRIDA'
      }
      
      return mappings[upperValue] || upperValue as TipoAgenciaCreativaValue
    }
    
    return value
  }
  
  /**
   * Valida el valor
   */
  private validate(): void {
    const validValues: TipoAgenciaCreativaValue[] = [
      'FULL_SERVICE',
      'ESPECIALIZADA',
      'BOUTIQUE',
      'FREELANCE',
      'DIGITAL_NATIVE',
      'TRADICIONAL',
      'HIBRIDA'
    ]
    
    if (!validValues.includes(this._value)) {
      throw new Error(`Tipo de agencia inválido: ${this._value}. Valores válidos: ${validValues.join(', ')}`)
    }
  }
  
  /**
   * Compara con otro tipo
   */
  equals(other: TipoAgenciaCreativa): boolean {
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
  toJSON(): TipoAgenciaCreativaValue {
    return this._value
  }
  
  /**
   * Obtiene todos los tipos disponibles
   */
  static getAllTypes(): TipoAgenciaCreativa[] {
    const types: TipoAgenciaCreativaValue[] = [
      'FULL_SERVICE',
      'ESPECIALIZADA',
      'BOUTIQUE',
      'FREELANCE',
      'DIGITAL_NATIVE',
      'TRADICIONAL',
      'HIBRIDA'
    ]
    
    return types.map(type => new TipoAgenciaCreativa(type))
  }
  
  /**
   * Crea desde string
   */
  static fromString(value: string): TipoAgenciaCreativa {
    return new TipoAgenciaCreativa(value)
  }
}