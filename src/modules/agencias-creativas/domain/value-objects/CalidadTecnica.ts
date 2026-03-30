/**
 * 🔧 VALUE OBJECT: CALIDAD TÉCNICA
 * 
 * Define los niveles de calidad técnica para producciones creativas
 * Incluye especificaciones técnicas y estándares de calidad
 */

export type CalidadTecnicaValue = 
  | 'BASICA'       // Calidad básica, especificaciones mínimas
  | 'ESTANDAR'     // Calidad estándar del mercado
  | 'PROFESIONAL'  // Calidad profesional, especificaciones altas
  | 'PREMIUM'      // Calidad premium, especificaciones superiores
  | 'BROADCAST'    // Calidad broadcast, especificaciones TV/cine
  | 'CINEMA'       // Calidad cinematográfica, máximas especificaciones

export interface EspecificacionesTecnicas {
  video?: {
    resolucion: string[]
    frameRate: number[]
    bitrate: string
    codec: string[]
    colorSpace: string
    colorDepth: string
  }
  audio?: {
    sampleRate: number[]
    bitDepth: number[]
    channels: string[]
    format: string[]
    loudness: string
    dynamicRange: string
  }
  imagen?: {
    resolucion: string[]
    dpi: number[]
    colorMode: string[]
    format: string[]
    compression: string
  }
  digital?: {
    responsive: boolean
    accessibility: string[]
    performance: string
    seo: boolean
    crossBrowser: boolean
  }
}

export class CalidadTecnica {
  private readonly _value: CalidadTecnicaValue
  
  constructor(value: CalidadTecnicaValue | string) {
    this._value = this.parseValue(value)
    this.validate()
  }
  
  get value(): CalidadTecnicaValue {
    return this._value
  }
  
  get displayName(): string {
    const names: Record<CalidadTecnicaValue, string> = {
      'BASICA': 'Básica',
      'ESTANDAR': 'Estándar',
      'PROFESIONAL': 'Profesional',
      'PREMIUM': 'Premium',
      'BROADCAST': 'Broadcast',
      'CINEMA': 'Cinema'
    }
    
    return names[this._value]
  }
  
  get description(): string {
    const descriptions: Record<CalidadTecnicaValue, string> = {
      'BASICA': 'Calidad básica para contenido web y redes sociales',
      'ESTANDAR': 'Calidad estándar para la mayoría de aplicaciones comerciales',
      'PROFESIONAL': 'Calidad profesional para presentaciones corporativas y marketing',
      'PREMIUM': 'Calidad premium para campañas importantes y contenido destacado',
      'BROADCAST': 'Calidad broadcast para televisión y medios masivos',
      'CINEMA': 'Calidad cinematográfica para producciones de alto nivel'
    }
    
    return descriptions[this._value]
  }
  
  /**
   * Obtiene las especificaciones técnicas para este nivel
   */
  get especificaciones(): EspecificacionesTecnicas {
    const specs: Record<CalidadTecnicaValue, EspecificacionesTecnicas> = {
      'BASICA': {
        video: {
          resolucion: ['720p', '1080p'],
          frameRate: [24, 25, 30],
          bitrate: '2-5 Mbps',
          codec: ['H.264'],
          colorSpace: 'Rec.709',
          colorDepth: '8-bit'
        },
        audio: {
          sampleRate: [44100, 48000],
          bitDepth: [16],
          channels: ['Stereo'],
          format: ['MP3', 'AAC'],
          loudness: '-23 LUFS',
          dynamicRange: 'Estándar'
        },
        imagen: {
          resolucion: ['1920x1080', '1280x720'],
          dpi: [72, 150],
          colorMode: ['RGB', 'sRGB'],
          format: ['JPEG', 'PNG'],
          compression: 'Estándar'
        },
        digital: {
          responsive: true,
          accessibility: ['WCAG 2.0 A'],
          performance: 'Básico',
          seo: true,
          crossBrowser: true
        }
      },
      'ESTANDAR': {
        video: {
          resolucion: ['1080p', '1440p'],
          frameRate: [24, 25, 30, 50, 60],
          bitrate: '5-15 Mbps',
          codec: ['H.264', 'H.265'],
          colorSpace: 'Rec.709',
          colorDepth: '8-bit'
        },
        audio: {
          sampleRate: [48000, 96000],
          bitDepth: [16, 24],
          channels: ['Stereo', '5.1'],
          format: ['WAV', 'AAC', 'MP3'],
          loudness: '-23 LUFS',
          dynamicRange: 'Mejorado'
        },
        imagen: {
          resolucion: ['2560x1440', '1920x1080'],
          dpi: [150, 300],
          colorMode: ['RGB', 'sRGB', 'Adobe RGB'],
          format: ['JPEG', 'PNG', 'TIFF'],
          compression: 'Optimizado'
        },
        digital: {
          responsive: true,
          accessibility: ['WCAG 2.1 AA'],
          performance: 'Optimizado',
          seo: true,
          crossBrowser: true
        }
      },
      'PROFESIONAL': {
        video: {
          resolucion: ['1080p', '4K UHD'],
          frameRate: [24, 25, 30, 50, 60, 120],
          bitrate: '15-50 Mbps',
          codec: ['H.264', 'H.265', 'ProRes'],
          colorSpace: 'Rec.709/Rec.2020',
          colorDepth: '10-bit'
        },
        audio: {
          sampleRate: [48000, 96000, 192000],
          bitDepth: [24, 32],
          channels: ['Stereo', '5.1', '7.1'],
          format: ['WAV', 'AIFF', 'FLAC'],
          loudness: '-23 LUFS',
          dynamicRange: 'Profesional'
        },
        imagen: {
          resolucion: ['4K', '6K', '8K'],
          dpi: [300, 600],
          colorMode: ['Adobe RGB', 'ProPhoto RGB'],
          format: ['TIFF', 'PSD', 'EXR'],
          compression: 'Sin pérdida'
        },
        digital: {
          responsive: true,
          accessibility: ['WCAG 2.1 AAA'],
          performance: 'Alto rendimiento',
          seo: true,
          crossBrowser: true
        }
      },
      'PREMIUM': {
        video: {
          resolucion: ['4K UHD', '4K DCI', '6K'],
          frameRate: [24, 25, 30, 50, 60, 120],
          bitrate: '50-150 Mbps',
          codec: ['ProRes 422 HQ', 'ProRes 4444', 'DNxHR'],
          colorSpace: 'Rec.2020',
          colorDepth: '10-bit/12-bit'
        },
        audio: {
          sampleRate: [96000, 192000],
          bitDepth: [24, 32],
          channels: ['5.1', '7.1', 'Atmos'],
          format: ['WAV', 'AIFF', 'DSD'],
          loudness: '-23 LUFS',
          dynamicRange: 'Premium'
        },
        imagen: {
          resolucion: ['6K', '8K', '12K'],
          dpi: [600, 1200],
          colorMode: ['ProPhoto RGB', 'ACES'],
          format: ['TIFF 16-bit', 'EXR', 'DPX'],
          compression: 'Sin pérdida'
        },
        digital: {
          responsive: true,
          accessibility: ['WCAG 2.1 AAA', 'Section 508'],
          performance: 'Máximo rendimiento',
          seo: true,
          crossBrowser: true
        }
      },
      'BROADCAST': {
        video: {
          resolucion: ['1080i/p', '4K UHD', '4K DCI'],
          frameRate: [25, 29.97, 50, 59.94],
          bitrate: '50-300 Mbps',
          codec: ['XDCAM', 'AVC-Intra', 'ProRes 422 HQ'],
          colorSpace: 'Rec.709/Rec.2020',
          colorDepth: '10-bit'
        },
        audio: {
          sampleRate: [48000],
          bitDepth: [24],
          channels: ['Stereo', '5.1', 'Dolby E'],
          format: ['BWF', 'MXF'],
          loudness: '-23 LUFS (EBU R128)',
          dynamicRange: 'Broadcast'
        },
        imagen: {
          resolucion: ['4K', '6K', '8K'],
          dpi: [300, 600],
          colorMode: ['Rec.709', 'Rec.2020'],
          format: ['TIFF', 'DPX', 'EXR'],
          compression: 'Broadcast estándar'
        },
        digital: {
          responsive: true,
          accessibility: ['WCAG 2.1 AAA', 'FCC'],
          performance: 'Broadcast grade',
          seo: true,
          crossBrowser: true
        }
      },
      'CINEMA': {
        video: {
          resolucion: ['4K DCI', '6K', '8K', '12K'],
          frameRate: [24, 25, 48, 60, 120],
          bitrate: '200-800 Mbps',
          codec: ['ProRes 4444 XQ', 'DNxHR 444', 'RAW'],
          colorSpace: 'ACES/DCI-P3',
          colorDepth: '12-bit/16-bit'
        },
        audio: {
          sampleRate: [96000, 192000],
          bitDepth: [24, 32],
          channels: ['7.1', 'Atmos', '22.2'],
          format: ['WAV', 'AIFF', 'DSD'],
          loudness: 'Cinema estándar',
          dynamicRange: 'Cinematográfico'
        },
        imagen: {
          resolucion: ['8K', '12K', '16K'],
          dpi: [1200, 2400],
          colorMode: ['ACES', 'DCI-P3', 'Rec.2020'],
          format: ['EXR 16-bit', 'DPX', 'TIFF 16-bit'],
          compression: 'Sin pérdida'
        },
        digital: {
          responsive: true,
          accessibility: ['WCAG 2.1 AAA', 'Cinema standards'],
          performance: 'Cinema grade',
          seo: true,
          crossBrowser: true
        }
      }
    }
    
    return specs[this._value]
  }
  
  /**
   * Obtiene el multiplicador de costo por calidad
   */
  get multiplicadorCosto(): number {
    const multiplicadores: Record<CalidadTecnicaValue, number> = {
      'BASICA': 0.7,       // -30% por calidad básica
      'ESTANDAR': 1.0,     // Precio base
      'PROFESIONAL': 1.5,  // +50% por calidad profesional
      'PREMIUM': 2.2,      // +120% por calidad premium
      'BROADCAST': 3.0,    // +200% por calidad broadcast
      'CINEMA': 4.5        // +350% por calidad cinema
    }
    
    return multiplicadores[this._value]
  }
  
  /**
   * Obtiene el tiempo adicional requerido por la calidad
   */
  get multiplicadorTiempo(): number {
    const multiplicadores: Record<CalidadTecnicaValue, number> = {
      'BASICA': 0.8,       // -20% tiempo por simplicidad
      'ESTANDAR': 1.0,     // Tiempo base
      'PROFESIONAL': 1.3,  // +30% tiempo por calidad
      'PREMIUM': 1.7,      // +70% tiempo por alta calidad
      'BROADCAST': 2.2,    // +120% tiempo por estándares broadcast
      'CINEMA': 3.0        // +200% tiempo por calidad cinema
    }
    
    return multiplicadores[this._value]
  }
  
  /**
   * Obtiene el nivel de expertise requerido
   */
  get nivelExpertiseRequerido(): number {
    const niveles: Record<CalidadTecnicaValue, number> = {
      'BASICA': 3,         // Nivel básico
      'ESTANDAR': 5,       // Nivel intermedio
      'PROFESIONAL': 7,    // Nivel avanzado
      'PREMIUM': 8,        // Nivel experto
      'BROADCAST': 9,      // Nivel especialista
      'CINEMA': 10         // Nivel maestro
    }
    
    return niveles[this._value]
  }
  
  /**
   * Obtiene el color asociado al nivel de calidad
   */
  get color(): string {
    const colors: Record<CalidadTecnicaValue, string> = {
      'BASICA': '#9CA3AF',      // Gris
      'ESTANDAR': '#059669',    // Verde
      'PROFESIONAL': '#0284C7', // Azul
      'PREMIUM': '#7C3AED',     // Púrpura
      'BROADCAST': '#DC2626',   // Rojo
      'CINEMA': '#B91C1C'       // Rojo oscuro
    }
    
    return colors[this._value]
  }
  
  /**
   * Obtiene el emoji asociado
   */
  get emoji(): string {
    const emojis: Record<CalidadTecnicaValue, string> = {
      'BASICA': '📱',
      'ESTANDAR': '💻',
      'PROFESIONAL': '📺',
      'PREMIUM': '🎬',
      'BROADCAST': '📡',
      'CINEMA': '🎭'
    }
    
    return emojis[this._value]
  }
  
  /**
   * Verifica si requiere equipos especializados
   */
  get requiereEquiposEspecializados(): boolean {
    return ['PREMIUM', 'BROADCAST', 'CINEMA'].includes(this._value)
  }
  
  /**
   * Verifica si requiere certificaciones específicas
   */
  get requiereCertificaciones(): boolean {
    return ['BROADCAST', 'CINEMA'].includes(this._value)
  }
  
  /**
   * Obtiene las herramientas recomendadas
   */
  getHerramientasRecomendadas(): string[] {
    const herramientas: Record<CalidadTecnicaValue, string[]> = {
      'BASICA': [
        'Adobe Premiere Elements',
        'Canva Pro',
        'Audacity',
        'GIMP'
      ],
      'ESTANDAR': [
        'Adobe Creative Suite',
        'Final Cut Pro',
        'Logic Pro',
        'Sketch'
      ],
      'PROFESIONAL': [
        'Adobe Creative Cloud',
        'Avid Media Composer',
        'Pro Tools',
        'Cinema 4D Lite'
      ],
      'PREMIUM': [
        'Adobe Creative Cloud Premium',
        'DaVinci Resolve Studio',
        'Pro Tools Ultimate',
        'Cinema 4D Studio',
        'Nuke'
      ],
      'BROADCAST': [
        'Avid Media Composer',
        'Grass Valley EDIUS',
        'Pro Tools HDX',
        'Baselight',
        'Flame'
      ],
      'CINEMA': [
        'Avid Symphony',
        'DaVinci Resolve Advanced',
        'Pro Tools Ultimate',
        'Nuke Studio',
        'Flame Premium',
        'Lustre'
      ]
    }
    
    return herramientas[this._value]
  }
  
  /**
   * Obtiene los formatos de entrega recomendados
   */
  getFormatosEntrega(): string[] {
    const formatos: Record<CalidadTecnicaValue, string[]> = {
      'BASICA': ['MP4 H.264', 'JPEG', 'PNG', 'MP3'],
      'ESTANDAR': ['MP4 H.264/H.265', 'MOV', 'TIFF', 'WAV', 'AAC'],
      'PROFESIONAL': ['ProRes 422', 'DNxHD', 'TIFF 16-bit', 'WAV 24-bit'],
      'PREMIUM': ['ProRes 422 HQ', 'DNxHR HQ', 'EXR', 'WAV 32-bit'],
      'BROADCAST': ['XDCAM', 'AVC-Intra', 'MXF', 'BWF'],
      'CINEMA': ['ProRes 4444 XQ', 'DNxHR 444', 'DPX', 'EXR 16-bit']
    }
    
    return formatos[this._value]
  }
  
  /**
   * Verifica si es compatible con un presupuesto
   */
  esCompatibleConPresupuesto(presupuesto: number, presupuestoBase: number): boolean {
    const costoRequerido = presupuestoBase * this.multiplicadorCosto
    return presupuesto >= costoRequerido
  }
  
  /**
   * Verifica si una agencia puede manejar esta calidad
   */
  puedeSerManejadaPor(nivelAgencia: number, equiposDisponibles: string[]): boolean {
    // Verificar nivel de expertise
    if (nivelAgencia < this.nivelExpertiseRequerido) {
      return false
    }
    
    // Verificar herramientas disponibles
    const herramientasRequeridas = this.getHerramientasRecomendadas()
    const tieneHerramientas = herramientasRequeridas.some(herramienta =>
      equiposDisponibles.some(equipo => 
        equipo.toLowerCase().includes(herramienta.toLowerCase())
      )
    )
    
    return tieneHerramientas
  }
  
  /**
   * Compara con otra calidad técnica
   */
  esMayorQue(otra: CalidadTecnica): boolean {
    const orden = ['BASICA', 'ESTANDAR', 'PROFESIONAL', 'PREMIUM', 'BROADCAST', 'CINEMA']
    return orden.indexOf(this._value) > orden.indexOf(otra._value)
  }
  
  /**
   * Parsea el valor de entrada
   */
  private parseValue(value: CalidadTecnicaValue | string): CalidadTecnicaValue {
    if (typeof value === 'string') {
      const upperValue = value.toUpperCase().replace(/\s+/g, '_')
      
      // Mapeo de valores alternativos
      const mappings: Record<string, CalidadTecnicaValue> = {
        'BASIC': 'BASICA',
        'SIMPLE': 'BASICA',
        'STANDARD': 'ESTANDAR',
        'NORMAL': 'ESTANDAR',
        'PROFESSIONAL': 'PROFESIONAL',
        'PRO': 'PROFESIONAL',
        'HIGH': 'PREMIUM',
        'ALTA': 'PREMIUM',
        'TV': 'BROADCAST',
        'TELEVISION': 'BROADCAST',
        'CINE': 'CINEMA',
        'FILM': 'CINEMA'
      }
      
      return mappings[upperValue] || upperValue as CalidadTecnicaValue
    }
    
    return value
  }
  
  /**
   * Valida el valor
   */
  private validate(): void {
    const validValues: CalidadTecnicaValue[] = [
      'BASICA',
      'ESTANDAR',
      'PROFESIONAL',
      'PREMIUM',
      'BROADCAST',
      'CINEMA'
    ]
    
    if (!validValues.includes(this._value)) {
      throw new Error(`Calidad técnica inválida: ${this._value}. Valores válidos: ${validValues.join(', ')}`)
    }
  }
  
  /**
   * Compara con otra calidad técnica
   */
  equals(other: CalidadTecnica): boolean {
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
  toJSON(): CalidadTecnicaValue {
    return this._value
  }
  
  /**
   * Obtiene todas las calidades disponibles
   */
  static getAllCalidades(): CalidadTecnica[] {
    const calidades: CalidadTecnicaValue[] = [
      'BASICA',
      'ESTANDAR',
      'PROFESIONAL',
      'PREMIUM',
      'BROADCAST',
      'CINEMA'
    ]
    
    return calidades.map(calidad => new CalidadTecnica(calidad))
  }
  
  /**
   * Crea desde string
   */
  static fromString(value: string): CalidadTecnica {
    return new CalidadTecnica(value)
  }
  
  /**
   * Recomienda calidad basada en presupuesto
   */
  static recomendarPorPresupuesto(presupuesto: number): CalidadTecnica {
    if (presupuesto < 1000000) return new CalidadTecnica('BASICA')
    if (presupuesto < 5000000) return new CalidadTecnica('ESTANDAR')
    if (presupuesto < 15000000) return new CalidadTecnica('PROFESIONAL')
    if (presupuesto < 50000000) return new CalidadTecnica('PREMIUM')
    if (presupuesto < 100000000) return new CalidadTecnica('BROADCAST')
    return new CalidadTecnica('CINEMA')
  }
}