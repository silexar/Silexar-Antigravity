/**
 * 🎨 VALUE OBJECT: ESPECIALIZACIÓN CREATIVA
 * 
 * Define las especializaciones disponibles para agencias creativas
 */

export type EspecializacionCreativaType = 
  | 'BRANDING'
  | 'PUBLICIDAD_DIGITAL'
  | 'PRODUCCION_AUDIOVISUAL'
  | 'MOTION_GRAPHICS'
  | 'DISEÑO_GRAFICO'
  | 'DESARROLLO_WEB'
  | 'MARKETING_DIGITAL'
  | 'FOTOGRAFIA'
  | 'ILUSTRACION'
  | 'UX_UI_DESIGN'
  | 'ANIMACION_3D'
  | 'REALIDAD_AUMENTADA'
  | 'REALIDAD_VIRTUAL'
  | 'PACKAGING'
  | 'EDITORIAL'
  | 'EVENTOS'
  | 'RETAIL_DESIGN'
  | 'ARQUITECTURA_MARCA';

export class EspecializacionCreativa {
  private readonly _value: EspecializacionCreativaType;

  constructor(value: string) {
    this._value = this.validate(value);
  }

  private validate(value: string): EspecializacionCreativaType {
    const upperValue = value.toUpperCase() as EspecializacionCreativaType;
    
    const validValues: EspecializacionCreativaType[] = [
      'BRANDING',
      'PUBLICIDAD_DIGITAL',
      'PRODUCCION_AUDIOVISUAL',
      'MOTION_GRAPHICS',
      'DISEÑO_GRAFICO',
      'DESARROLLO_WEB',
      'MARKETING_DIGITAL',
      'FOTOGRAFIA',
      'ILUSTRACION',
      'UX_UI_DESIGN',
      'ANIMACION_3D',
      'REALIDAD_AUMENTADA',
      'REALIDAD_VIRTUAL',
      'PACKAGING',
      'EDITORIAL',
      'EVENTOS',
      'RETAIL_DESIGN',
      'ARQUITECTURA_MARCA'
    ];

    if (!validValues.includes(upperValue)) {
      throw new Error(`Especialización inválida: ${value}`);
    }

    return upperValue;
  }

  get value(): EspecializacionCreativaType {
    return this._value;
  }

  get displayName(): string {
    const displayNames: Record<EspecializacionCreativaType, string> = {
      'BRANDING': 'Branding',
      'PUBLICIDAD_DIGITAL': 'Publicidad Digital',
      'PRODUCCION_AUDIOVISUAL': 'Producción Audiovisual',
      'MOTION_GRAPHICS': 'Motion Graphics',
      'DISEÑO_GRAFICO': 'Diseño Gráfico',
      'DESARROLLO_WEB': 'Desarrollo Web',
      'MARKETING_DIGITAL': 'Marketing Digital',
      'FOTOGRAFIA': 'Fotografía',
      'ILUSTRACION': 'Ilustración',
      'UX_UI_DESIGN': 'UX/UI Design',
      'ANIMACION_3D': 'Animación 3D',
      'REALIDAD_AUMENTADA': 'Realidad Aumentada',
      'REALIDAD_VIRTUAL': 'Realidad Virtual',
      'PACKAGING': 'Packaging',
      'EDITORIAL': 'Editorial',
      'EVENTOS': 'Eventos',
      'RETAIL_DESIGN': 'Retail Design',
      'ARQUITECTURA_MARCA': 'Arquitectura de Marca'
    };

    return displayNames[this._value];
  }

  equals(other: EspecializacionCreativa): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}