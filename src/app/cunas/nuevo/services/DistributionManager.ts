// Tipos
import { TenantConfigurationService } from './TenantConfigurationService';

export interface Recipient {
  email: string;
  name?: string;
  role: 'operator' | 'sales_exec' | 'manager' | 'client';
  phone?: string;
  lastContact?: Date;
}

export interface DistributionGroup {
  id: string;
  name: string;
  recipients: Recipient[];
}

export interface DisplayGroup extends DistributionGroup {
  description: string;
  selected: boolean;
  members: Recipient[]; // Helper for UI display
}

export class DistributionManager {
  
  // Grupos Predefinidos (Mock)
  private static systemGroups: Record<string, DistributionGroup & { description: string; type: 'system' | 'custom'; autoAdd: boolean }> = {
    'operadores_corazon': {
      id: 'grp_ops_corazon',
      name: 'Operadores Radio Corazón',
      description: 'Todos los operadores de turno - Radio Corazón',
      type: 'system',
      autoAdd: true,
      recipients: [ // Changed from members to recipients
        { email: 'operador.manana@radiocorazon.cl', role: 'operator', name: 'Op. Turno Mañana', phone: '+56 9 8765 4321', lastContact: new Date(Date.now() - 86400000) },
        { email: 'operador.tarde@radiocorazon.cl', role: 'operator', name: 'Op. Turno Tarde', phone: '+56 9 8765 4322', lastContact: new Date(Date.now() - 3600000) },
      ]
    },
    'comercial_team': {
      id: 'grp_sales',
      name: 'Equipo Comercial',
      description: 'Ejecutivos responsables de la cuenta',
      type: 'system',
      autoAdd: false,
      recipients: [] // Changed from members to recipients
    }
  };

  /**
   * Verifica reglas de distribución por Tenant
   */
  static validateDistributionRules(tenantId: string) {
    const config = TenantConfigurationService.getClientConfig(tenantId).distributionSettings;
    return {
       canAutoSend: config.autoDistribution,
       requiresConfirmation: config.confirmationRequired,
       slaHours: config.maxConfirmationTime
    };
  }

  /**
   * Detecta destinatarios automáticamente basado en la data de la cuña
   */
  static async autoDetectRecipients(metadata: Record<string, unknown>): Promise<DisplayGroup[]> {
    // Simular lógica de negocio
    const groups: DisplayGroup[] = [];

    // 1. Operadores (Siempre van)
    groups.push({
      ...this.systemGroups['operadores_corazon'],
      selected: true,
      members: this.systemGroups['operadores_corazon'].recipients,
    } as DisplayGroup);

    // 2. Equipo Comercial (Dinámico)
    const salesRecipients: Recipient[] = [
       { email: 'carlos.mendoza@megamedia.com', name: 'Carlos Mendoza', role: 'sales_exec', phone: '+56 9 8765 4323', lastContact: new Date() },
       { email: 'maria.silva@megamedia.com', name: 'María Silva', role: 'sales_exec', phone: '' }
    ];
    groups.push({ ...this.systemGroups['comercial_team'], selected: true, recipients: salesRecipients, members: salesRecipients } as DisplayGroup);

    return groups;
  }
}

// Interfaz para UI
export interface DisplayGroup extends DistributionGroup {
  selected: boolean;
}
