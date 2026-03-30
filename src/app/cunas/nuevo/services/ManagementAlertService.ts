export interface OperationalMetrics {
  activeMaterial: {
    total: number;
    newThisWeek: number;
    trend: number; // percentage
    expiringIn7Days: number;
    missingMaterialContracts: number;
  };
  quality: {
    autoApprovalRate: number;
    technicalIssues: number;
    averageScore: number;
    avgValidationTime: number; // minutes
  };
  distribution: {
    successRate: number; // percentage
    pendingConfirmations: number;
    avgConfirmationTime: number; // minutes
    topResponders: string[];
  };
}

export interface TeamMember {
  name: string;
  role: string;
  itemsCreated: number;
  itemsProcessed: number;
  avgResponseTime: number; // hours
  status: 'active' | 'offline' | 'busy';
}

export interface AlertItem {
  id: string;
  type: 'expiration' | 'technical' | 'missing_material' | 'workload';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  actionLabel: string;
}

export interface CortexPrediction {
  title: string;
  probability: number;
  impact: string;
}

export class ManagementAlertService {
  /**
   * Obtiene métricas operativas en tiempo real (Simulado)
   */
  static async getOperationalMetrics(): Promise<OperationalMetrics> {
    return {
      activeMaterial: {
        total: 1847,
        newThisWeek: 156,
        trend: 12,
        expiringIn7Days: 23,
        missingMaterialContracts: 8
      },
      quality: {
        autoApprovalRate: 94,
        technicalIssues: 3,
        averageScore: 91,
        avgValidationTime: 8
      },
      distribution: {
        successRate: 97,
        pendingConfirmations: 12,
        avgConfirmationTime: 45,
        topResponders: ['Radio Corazón', 'FM Dos']
      }
    };
  }

  /**
   * Analiza el rendimiento del equipo
   */
  static async getTeamPerformance(): Promise<TeamMember[]> {
    return [
      { name: 'Carlos Mendoza', role: 'Ejecutivo', itemsCreated: 23, itemsProcessed: 5, avgResponseTime: 1.2, status: 'active' },
      { name: 'Ana García', role: 'Operaciones', itemsCreated: 18, itemsProcessed: 42, avgResponseTime: 2.3, status: 'busy' },
      { name: 'Roberto Silva', role: 'Tráfico', itemsCreated: 15, itemsProcessed: 89, avgResponseTime: 0.8, status: 'active' }
    ];
  }

  /**
   * Genera alertas inteligentes basadas en reglas de negocio
   */
  static async generateIntelligentAlerts(): Promise<AlertItem[]> {
    return [
      {
         id: 'alt-1', type: 'expiration', priority: 'critical',
         title: 'Banco Nacional', description: 'Vence HOY 12:00 (Sin reemplazo)',
         actionLabel: 'Contactar Inmediato'
      },
      {
         id: 'alt-2', type: 'expiration', priority: 'high',
         title: 'SuperMax Promo', description: 'Vence mañana (Renovación en proceso)',
         actionLabel: 'Verificar Estatus'
      },
      {
         id: 'alt-3', type: 'technical', priority: 'high',
         title: 'SPX001834', description: 'Audio corrupto detectado en re-procesamiento',
         actionLabel: 'Revisar Audio'
      },
      {
         id: 'alt-4', type: 'missing_material', priority: 'medium',
         title: 'Contrato CNT-2025-0234', description: 'Sin cuñas asociadas (Cliente: TechCorp)',
         actionLabel: 'Crear Material'
      }
    ];
  }

  /**
   * Predicciones de Cortex AI
   */
  static async getCortexPredictions() {
     return {
        predictions: [
           { title: '15 cuñas requerirán renovación', probability: 78, impact: 'High' },
           { title: 'Peak de actividad esperado: Mañana 10:00-12:00', probability: 92, impact: 'Medium' }
        ],
        recommendations: [
           'Contactar Banco Nacional INMEDIATAMENTE',
           'Preparar plantillas para renovaciones masivas',
           'Asignar recurso adicional turno mañana'
        ]
     };
  }
}
