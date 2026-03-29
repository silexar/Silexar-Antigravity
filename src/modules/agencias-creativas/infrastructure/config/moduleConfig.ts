/**
 * ⚙️ CONFIGURACIÓN DEL MÓDULO: AGENCIAS CREATIVAS
 * 
 * Configuración centralizada para el módulo de agencias creativas
 */

export interface AgenciasCreativasModuleConfig {
  // Configuración de IA
  cortexCreative: {
    enabled: boolean;
    apiUrl: string;
    apiKey: string;
    analysisTimeout: number;
  };
  
  // Configuración de validaciones
  validation: {
    siiValidation: boolean;
    rutValidation: boolean;
    emailValidation: boolean;
  };
  
  // Configuración de integraciones
  integrations: {
    behance: {
      enabled: boolean;
      apiKey?: string;
    };
    dribbble: {
      enabled: boolean;
      apiKey?: string;
    };
    instagram: {
      enabled: boolean;
      apiKey?: string;
    };
  };
  
  // Configuración de scoring
  scoring: {
    baseScore: number;
    maxScore: number;
    experienceWeight: number;
    qualityWeight: number;
    availabilityWeight: number;
  };
  
  // Configuración de notificaciones
  notifications: {
    enabled: boolean;
    welcomeEmail: boolean;
    alertsEmail: boolean;
    slackIntegration: boolean;
  };
}

export const DEFAULT_MODULE_CONFIG: AgenciasCreativasModuleConfig = {
  cortexCreative: {
    enabled: true,
    apiUrl: process.env.CORTEX_CREATIVE_API_URL || 'https://api.cortex-creative.com',
    apiKey: process.env.CORTEX_CREATIVE_API_KEY || '',
    analysisTimeout: 30000, // 30 segundos
  },
  
  validation: {
    siiValidation: true,
    rutValidation: true,
    emailValidation: true,
  },
  
  integrations: {
    behance: {
      enabled: true,
      apiKey: process.env.BEHANCE_API_KEY,
    },
    dribbble: {
      enabled: true,
      apiKey: process.env.DRIBBBLE_API_KEY,
    },
    instagram: {
      enabled: false, // Requiere configuración adicional
      apiKey: process.env.INSTAGRAM_API_KEY,
    },
  },
  
  scoring: {
    baseScore: 200,
    maxScore: 1000,
    experienceWeight: 0.3,
    qualityWeight: 0.4,
    availabilityWeight: 0.3,
  },
  
  notifications: {
    enabled: true,
    welcomeEmail: true,
    alertsEmail: true,
    slackIntegration: false,
  },
};