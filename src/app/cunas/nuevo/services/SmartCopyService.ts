import { logger } from '@/lib/observability';
export interface CopyOptions {
  version?: string;
  newName?: string;
}

export class SmartCopyService {
  
  /**
   * Genera el nombre de la nueva versión inteligentemente
   */
  static generateVersionedName(originalName: string, version?: string): string {
    if (version) {
      if (originalName.toLowerCase().includes(version.toLowerCase())) return originalName; // Avoid duplication
      return `${originalName} - ${version}`;
    }
    
    // Auto-detect version pattern " - V2", " - Version 3", etc.
    const versionMatch = originalName.match(/ - (V|Versión|v)(\d+)$/i);
    if (versionMatch) {
      const currentVersion = parseInt(versionMatch[2]);
      const newVersion = currentVersion + 1;
      return originalName.replace(versionMatch[0], ` - Versión ${newVersion}`);
    }
    
    return `${originalName} - Versión 2`;
  }

  /**
   * Simula la creación de una copia
   */
  static async createSmartCopy(originalCuna: Record<string, unknown>, options: CopyOptions) {
    const newName = options.newName || this.generateVersionedName(originalCuna.nombre as string);
    
    // Select fields to copy (White-listing)
    const copiedData = {
       // Basic
       anuncianteId: originalCuna.anuncianteId,
       anuncianteNombre: originalCuna.anuncianteNombre,
       producto: originalCuna.producto,
       tipo: originalCuna.tipo,
       
       // Config
       fechaInicioVigencia: originalCuna.fechaInicioVigencia,
       fechaFinVigencia: originalCuna.fechaFinVigencia,
       distribucion: originalCuna.distribucion, // Keep distribution groups
       
       // Operational
       salesRep: originalCuna.salesRep,
       
       // New Identity
       nombre: newName,
       codigo: `SPX${Math.floor(Math.random()*1000000)}`, // New generated ID
       status: 'draft',
       
       // Reset Content (The "Clean Slate")
       audioFile: null,
       audioMetadata: null,
       validationResults: null,
       history: []
    };

    logger.info("Creating Smart Copy:", copiedData);
    return copiedData;
  }

  static getSuggestions() {
    return [
      { id: 'validation', label: 'Mantener estructura de validaciones', icon: 'shield' },
      { id: 'alerts', label: 'Heredar alertas de vencimientos', icon: 'bell' },
      { id: 'distribution', label: 'Usar mismos grupos de distribución', icon: 'users' },
      { id: 'schedules', label: 'Aplicar misma configuración de horarios', icon: 'calendar' }
    ];
  }
}
