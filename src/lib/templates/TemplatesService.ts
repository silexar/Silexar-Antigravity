/**
 * 📋 SILEXAR PULSE - Templates System TIER 0
 * 
 * Sistema de plantillas y presets para creación rápida
 * de cuñas y activos digitales
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface PlantillaCuna {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'comercial' | 'institucional' | 'evento' | 'promocion' | 'custom';
  tipo: 'audio' | 'mencion' | 'presentacion' | 'cierre' | 'promo_ida';
  
  // Configuración default
  duracionDefault: number;
  urgenciaDefault: string;
  
  // Textos template
  textoPlantilla?: string;
  variablesRequeridas: string[];
  
  // Tags automáticos
  tagsDefault: string[];
  
  // Segmentación default (para digitales)
  segmentacionDefault?: {
    edadRangos?: string[];
    generos?: string[];
    regiones?: string[];
    intereses?: string[];
  };
  
  // Metadata
  vecesUsada: number;
  creadoPor: string;
  esPublica: boolean;
  anuncianteId?: string; // Si es específica de un anunciante
}

export interface PresetSegmentacion {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  
  // Configuración
  demografica: {
    edadRangos: string[];
    generos: string[];
    nivelSocioeconomico: string[];
  };
  geografica: {
    regiones: string[];
    ciudades: string[];
  };
  conductual: {
    intereses: string[];
  };
  
  // Estimación
  alcanceEstimado: string;
}

// ═══════════════════════════════════════════════════════════════
// PLANTILLAS PREDEFINIDAS
// ═══════════════════════════════════════════════════════════════

export const PLANTILLAS_CUNAS: PlantillaCuna[] = [
  // COMERCIALES
  {
    id: 'tpl-comercial-30s',
    nombre: 'Spot Comercial 30s',
    descripcion: 'Spot estándar de 30 segundos para radio',
    categoria: 'comercial',
    tipo: 'audio',
    duracionDefault: 30,
    urgenciaDefault: 'programada',
    variablesRequeridas: ['anunciante', 'producto'],
    tagsDefault: ['comercial', 'spot', '30s'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  {
    id: 'tpl-comercial-15s',
    nombre: 'Spot Comercial 15s',
    descripcion: 'Spot corto de 15 segundos, ideal para refuerzos',
    categoria: 'comercial',
    tipo: 'audio',
    duracionDefault: 15,
    urgenciaDefault: 'programada',
    variablesRequeridas: ['anunciante'],
    tagsDefault: ['comercial', 'spot', '15s', 'refuerzo'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  
  // MENCIONES
  {
    id: 'tpl-mencion-locutor',
    nombre: 'Mención Locutada',
    descripcion: 'Texto para lectura en vivo por locutor',
    categoria: 'comercial',
    tipo: 'mencion',
    duracionDefault: 20,
    urgenciaDefault: 'programada',
    textoPlantilla: 'Amigos de {PROGRAMA}, un saludo especial de nuestros amigos de {ANUNCIANTE}. {MENSAJE_PRINCIPAL}. Más información en {CONTACTO}.',
    variablesRequeridas: ['programa', 'anunciante', 'mensaje_principal', 'contacto'],
    tagsDefault: ['mencion', 'vivo', 'locutor'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  
  // PROMOCIONES
  {
    id: 'tpl-promo-urgente',
    nombre: 'Promoción Urgente',
    descripcion: 'Para ofertas de último momento con urgencia',
    categoria: 'promocion',
    tipo: 'audio',
    duracionDefault: 20,
    urgenciaDefault: 'urgente',
    textoPlantilla: '¡Atención! Solo por hoy, {ANUNCIANTE} te ofrece {OFERTA}. ¡No lo dejes pasar! {CTA}.',
    variablesRequeridas: ['anunciante', 'oferta', 'cta'],
    tagsDefault: ['promocion', 'urgente', 'oferta'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  {
    id: 'tpl-promo-descuento',
    nombre: 'Promoción con Descuento',
    descripcion: 'Para comunicar descuentos específicos',
    categoria: 'promocion',
    tipo: 'audio',
    duracionDefault: 25,
    urgenciaDefault: 'programada',
    textoPlantilla: '{ANUNCIANTE} te invita a aprovechar {DESCUENTO} en {PRODUCTOS}. Válido hasta el {FECHA_FIN}. {CTA}.',
    variablesRequeridas: ['anunciante', 'descuento', 'productos', 'fecha_fin', 'cta'],
    tagsDefault: ['promocion', 'descuento'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  
  // EVENTOS
  {
    id: 'tpl-evento-concierto',
    nombre: 'Evento / Concierto',
    descripcion: 'Para promoción de eventos y espectáculos',
    categoria: 'evento',
    tipo: 'audio',
    duracionDefault: 30,
    urgenciaDefault: 'programada',
    textoPlantilla: '¡{EVENTO} en {LUGAR}! {FECHA_EVENTO}. {ARTISTAS}. Entradas en {PUNTO_VENTA}. {PRECIO}. ¡No te lo pierdas!',
    variablesRequeridas: ['evento', 'lugar', 'fecha_evento', 'artistas', 'punto_venta', 'precio'],
    tagsDefault: ['evento', 'concierto', 'espectaculo'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  
  // INSTITUCIONALES
  {
    id: 'tpl-institucional',
    nombre: 'Institucional / Imagen',
    descripcion: 'Para posicionamiento de marca sin oferta específica',
    categoria: 'institucional',
    tipo: 'audio',
    duracionDefault: 30,
    urgenciaDefault: 'standby',
    textoPlantilla: '{ANUNCIANTE}. {SLOGAN}. Porque {VALOR_MARCA}. {ANUNCIANTE}, siempre contigo.',
    variablesRequeridas: ['anunciante', 'slogan', 'valor_marca'],
    tagsDefault: ['institucional', 'imagen', 'branding'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  
  // PRESENTACIONES Y CIERRES
  {
    id: 'tpl-presentacion-programa',
    nombre: 'Presentación de Programa',
    descripcion: 'Entrada de programa auspiciado',
    categoria: 'comercial',
    tipo: 'presentacion',
    duracionDefault: 10,
    urgenciaDefault: 'programada',
    textoPlantilla: 'A continuación, {PROGRAMA}, presentado por {ANUNCIANTE}.',
    variablesRequeridas: ['programa', 'anunciante'],
    tagsDefault: ['presentacion', 'auspicio', 'programa'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  },
  {
    id: 'tpl-cierre-programa',
    nombre: 'Cierre de Programa',
    descripcion: 'Salida de programa auspiciado',
    categoria: 'comercial',
    tipo: 'cierre',
    duracionDefault: 10,
    urgenciaDefault: 'programada',
    textoPlantilla: '{PROGRAMA} fue presentado por {ANUNCIANTE}. {SLOGAN_CORTO}.',
    variablesRequeridas: ['programa', 'anunciante', 'slogan_corto'],
    tagsDefault: ['cierre', 'auspicio', 'programa'],
    vecesUsada: 0,
    creadoPor: 'Sistema',
    esPublica: true
  }
];

// ═══════════════════════════════════════════════════════════════
// PRESETS DE SEGMENTACIÓN
// ═══════════════════════════════════════════════════════════════

export const PRESETS_SEGMENTACION: PresetSegmentacion[] = [
  {
    id: 'seg-jovenes-urbanos',
    nombre: 'Jóvenes Urbanos',
    descripcion: 'Millennials y Gen Z en ciudades principales',
    icono: '🎯',
    demografica: {
      edadRangos: ['18-24', '25-34'],
      generos: ['masculino', 'femenino', 'no_binario'],
      nivelSocioeconomico: ['ABC1', 'C2', 'C3']
    },
    geografica: {
      regiones: ['RM', 'V'],
      ciudades: ['santiago', 'valparaiso', 'vina_del_mar']
    },
    conductual: {
      intereses: ['tecnologia', 'musica', 'gaming', 'moda']
    },
    alcanceEstimado: '1.8M'
  },
  {
    id: 'seg-familias',
    nombre: 'Familias con Hijos',
    descripcion: 'Padres y madres con hijos en edad escolar',
    icono: '👨‍👩‍👧‍👦',
    demografica: {
      edadRangos: ['25-34', '35-44', '45-54'],
      generos: ['masculino', 'femenino'],
      nivelSocioeconomico: ['ABC1', 'C2', 'C3']
    },
    geografica: {
      regiones: [],
      ciudades: []
    },
    conductual: {
      intereses: ['hogar', 'mascotas', 'viajes', 'deportes']
    },
    alcanceEstimado: '2.5M'
  },
  {
    id: 'seg-profesionales',
    nombre: 'Profesionales',
    descripcion: 'Ejecutivos y profesionales de alto nivel',
    icono: '💼',
    demografica: {
      edadRangos: ['25-34', '35-44', '45-54'],
      generos: ['masculino', 'femenino'],
      nivelSocioeconomico: ['ABC1', 'C2']
    },
    geografica: {
      regiones: ['RM'],
      ciudades: ['santiago']
    },
    conductual: {
      intereses: ['negocios', 'tecnologia', 'viajes', 'automoviles']
    },
    alcanceEstimado: '800K'
  },
  {
    id: 'seg-mujeres-empoderadas',
    nombre: 'Mujeres Empoderadas',
    descripcion: 'Mujeres profesionales e independientes',
    icono: '💪',
    demografica: {
      edadRangos: ['25-34', '35-44'],
      generos: ['femenino'],
      nivelSocioeconomico: ['ABC1', 'C2']
    },
    geografica: {
      regiones: ['RM', 'V', 'VIII'],
      ciudades: []
    },
    conductual: {
      intereses: ['moda', 'fitness', 'viajes', 'gastronomia']
    },
    alcanceEstimado: '650K'
  },
  {
    id: 'seg-adultos-mayores',
    nombre: 'Adultos Mayores',
    descripcion: 'Personas mayores de 55 años',
    icono: '👴',
    demografica: {
      edadRangos: ['55-64', '65+'],
      generos: ['masculino', 'femenino'],
      nivelSocioeconomico: ['ABC1', 'C2', 'C3']
    },
    geografica: {
      regiones: [],
      ciudades: []
    },
    conductual: {
      intereses: ['hogar', 'viajes']
    },
    alcanceEstimado: '1.2M'
  },
  {
    id: 'seg-todo-chile',
    nombre: 'Todo Chile',
    descripcion: 'Alcance masivo nacional sin filtros',
    icono: '🇨🇱',
    demografica: {
      edadRangos: [],
      generos: [],
      nivelSocioeconomico: []
    },
    geografica: {
      regiones: [],
      ciudades: []
    },
    conductual: {
      intereses: []
    },
    alcanceEstimado: '5.2M'
  }
];

// ═══════════════════════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════════════════════

export class TemplatesService {
  private customTemplates: PlantillaCuna[] = [];
  
  getPlantillas(categoria?: string): PlantillaCuna[] {
    const todas = [...PLANTILLAS_CUNAS, ...this.customTemplates];
    if (!categoria) return todas;
    return todas.filter(p => p.categoria === categoria);
  }
  
  getPlantilla(id: string): PlantillaCuna | undefined {
    return [...PLANTILLAS_CUNAS, ...this.customTemplates].find(p => p.id === id);
  }
  
  getPresetsSegmentacion(): PresetSegmentacion[] {
    return PRESETS_SEGMENTACION;
  }
  
  getPresetSegmentacion(id: string): PresetSegmentacion | undefined {
    return PRESETS_SEGMENTACION.find(p => p.id === id);
  }
  
  procesarPlantilla(plantilla: PlantillaCuna, variables: Record<string, string>): string {
    if (!plantilla.textoPlantilla) return '';
    
    let texto = plantilla.textoPlantilla;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key.toUpperCase()}}`, 'g');
      texto = texto.replace(regex, value);
    });
    
    return texto;
  }
  
  async guardarPlantillaCustom(plantilla: Omit<PlantillaCuna, 'id' | 'vecesUsada'>): Promise<PlantillaCuna> {
    const nueva: PlantillaCuna = {
      ...plantilla,
      id: `tpl-custom-${Date.now()}`,
      vecesUsada: 0
    };
    this.customTemplates.push(nueva);
    return nueva;
  }
  
  incrementarUso(id: string): void {
    const plantilla = this.getPlantilla(id);
    if (plantilla) {
      plantilla.vecesUsada++;
    }
  }
}

export const templatesService = new TemplatesService();
export default templatesService;
