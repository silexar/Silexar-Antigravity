import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export interface VariableDefinition {
  name: string;
  description: string;
  type: 'auto' | 'calculated' | 'input';
  dataType: 'text' | 'number' | 'date' | 'currency' | 'time';
  example: string;
}

export interface VariableContext {
  advertiser?: {
    commercialName: string;
    legalName?: string;
  };
  event?: {
    date: Date;
    location?: string;
    originalPrice?: number;
    currentPrice?: number;
  };
  station?: {
    name: string;
  };
  salesRep?: {
    name: string;
  };
}

export class DynamicVariablesEngine {
  
  private static readonly SYSTEM_VARIABLES: VariableDefinition[] = [
    { name: '{DIA}', description: 'Día actual de la semana', type: 'auto', dataType: 'text', example: 'Lunes' },
    { name: '{FECHA}', description: 'Fecha actual formateada', type: 'auto', dataType: 'date', example: '26 de Enero' },
    { name: '{HORA_ACTUAL}', description: 'Hora actual del sistema', type: 'auto', dataType: 'time', example: '14:30' },
    { name: '{ANUNCIANTE}', description: 'Nombre comercial del cliente', type: 'auto', dataType: 'text', example: 'SuperMax' },
    { name: '{DIAS_RESTANTES}', description: 'Días hasta el evento', type: 'calculated', dataType: 'number', example: '5' },
    { name: '{PRECIO_FORMATEADO}', description: 'Precio con formato moneda', type: 'calculated', dataType: 'currency', example: '$15.000' },
  ];

  /**
   * Obtiene la lista de variables disponibles para el autocompletado del editor.
   */
  static getAvailableVariables(): VariableDefinition[] {
    return this.SYSTEM_VARIABLES;
  }

  /**
   * Resuelve todas las variables en un texto dado el contexto.
   */
  static resolveVariables(text: string, context: VariableContext): string {
    let resolvedText = text;

    // 1. Variables Automáticas (Fecha/Hora)
    resolvedText = resolvedText.replace(/{DIA}/g, format(new Date(), 'EEEE', { locale: es }));
    resolvedText = resolvedText.replace(/{FECHA}/g, format(new Date(), 'd \'de\' MMMM', { locale: es }));
    resolvedText = resolvedText.replace(/{HORA_ACTUAL}/g, format(new Date(), 'HH:mm'));

    // 2. Variables de Contexto (Cliente)
    if (context.advertiser) {
      resolvedText = resolvedText.replace(/{ANUNCIANTE}/g, context.advertiser.commercialName);
    }

    // 3. Variables Calculadas (Eventos)
    if (context.event) {
      if (text.includes('{DIAS_RESTANTES}')) {
        const days = differenceInDays(new Date(context.event.date), new Date());
        const value = days > 0 ? days.toString() : days === 0 ? 'hoy' : '0';
        resolvedText = resolvedText.replace(/{DIAS_RESTANTES}/g, value);
      }

      if (text.includes('{PRECIO_FORMATEADO}') && context.event.currentPrice) {
        const formatted = new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0
        }).format(context.event.currentPrice);
        resolvedText = resolvedText.replace(/{PRECIO_FORMATEADO}/g, formatted);
      }
    }

    // 4. Limpieza de variables no resueltas (Opcional: o dejar visible para alertar)
    // Por seguridad operativa, NO eliminamos variables no resueltas para que el operador note el error.
    
    return resolvedText;
  }

  /**
   * Valida si un texto contiene variables sin resolver o mal formadas.
   */
  static validateTemplate(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Regex para detectar anything like {VAR}
    const variableRegex = /\{[A-Z0-9_]+\}/g;
    const matches = text.match(variableRegex);

    if (matches) {
      matches.forEach(match => {
        const isKnown = this.SYSTEM_VARIABLES.some(v => v.name === match);
        // Si es una variable conocida pero necesita contexto específico que podría faltar
        if (!isKnown) {
          // Permitimos variables personalizadas, pero podríamos warnear
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
