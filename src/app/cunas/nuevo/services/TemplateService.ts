import { logger } from '@/lib/observability';
export interface TemplateDefinition {
  id: string;
  name: string;
  defaultDuration: number;
  suggestedStructure: string;
  commonElements: string[];
  brandingRequirements: string[];
  description: string;
}

export interface CunaFormData {
  duracionSegundos: number;
  formato: string;
  observaciones: string;
  etiquetas: string[];
  [key: string]: unknown;
}

export class TemplateService {
  
  private static templates: Record<string, TemplateDefinition> = {
    'retail': {
      id: 'retail',
      name: 'Retail / Tiendas',
      description: 'Ideal para promociones de productos, ventas de temporada y liquidaciones.',
      defaultDuration: 30,
      suggestedStructure: 'Gancho (Oferta) -> Producto -> Precio -> Ubicación -> Cierre (Urgencia)',
      commonElements: ['precio', 'ubicacion', 'horarios', 'vigencia_oferta'],
      brandingRequirements: ['nombre_tienda', 'slogan_campana']
    },
    'servicios_financieros': {
      id: 'servicios_financieros',
      name: 'Banca y Finanzas',
      description: 'Enfoque en confianza, beneficios claros y cumplimiento normativo.',
      defaultDuration: 45,
      suggestedStructure: 'Problema -> Solución Financiera -> Beneficio -> Disclaimer Legal',
      commonElements: ['tasa_interes', 'condiciones', 'cae', 'disclaimer_legal'],
      brandingRequirements: ['nombre_banco', 'numero_contacto', 'year_fundacion']
    },
    'automotriz': {
      id: 'automotriz',
      name: 'Automotriz',
      description: 'Diseñada para lanzamientos de modelos y test drives.',
      defaultDuration: 35,
      suggestedStructure: 'Emoción/Viaje -> Características -> Precio/Cuota -> Call to Action (Test Drive)',
      commonElements: ['modelo', 'precio_desde', 'bono_financiamiento', 'concesionario'],
      brandingRequirements: ['marca_vehiculo', 'red_concesionarios']
    }
  };

  /**
   * Obtiene la lista de plantillas disponibles
   */
  static getAvailableTemplates(): TemplateDefinition[] {
    return Object.values(this.templates);
  }

  /**
   * Aplica una plantilla a los datos de una cuña
   */
  static applyTemplate(currentData: Partial<CunaFormData>, templateId: string): Partial<CunaFormData> {
    const template = this.templates[templateId];
    if (!template) {
      logger.warn(`Template ${templateId} not found.`);
      return currentData;
    }

    // Logic: Merge template defaults into current data
    return {
      ...currentData,
      duracionSegundos: template.defaultDuration,
      formato: template.name, // Mapping to UI field equivalent
      observaciones: (currentData.observaciones || '') + `\n[Estructura Sugerida]: ${template.suggestedStructure}`,
      etiquetas: [
        ...(currentData.etiquetas || []),
        ...template.commonElements
      ],
      // Meta-data for guidance attached as non-enumerable or specific field
    };
  }
}
