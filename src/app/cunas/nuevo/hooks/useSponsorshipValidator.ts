import { useState } from 'react';
import { isWithinInterval, format } from 'date-fns';

export interface ValidationItem {
    id: string;
    label: string;
    status: 'success' | 'warning' | 'error';
    message?: string;
    suggestions?: string[];
}

export interface SponsorshipValidationResult {
  overallScore: number; // 0-100
  items: ValidationItem[];
  saturation: {
    current: number;
    projected: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  missingPresentations: {
    client: string;
    program: string;
    expiresInDays: number;
  }[];
  recommendations: string[];
}

interface ValidationContext {
  clientName: string;
  programId?: string;
  startDate?: Date;
  endDate?: Date;
  type: string; // 'mencion' | 'presentacion' | ...
  duration?: number;
}

/**
 * Hook para validar reglas de negocio Enterprise.
 * Incluye lógica de "Validación Cruzada con Módulo Vencimientos".
 */
export function useSponsorshipValidator(context: ValidationContext) {
  const [isValidating, setIsValidating] = useState(false);

  // Mock Service: vencimientoservice
  const vencimientoservice = {
    findSponsorship: async (params: { clientName: string }) => {
       // Simular búsqueda exitosa para "Cliente Demo"
       if (params.clientName === 'Cliente Demo' || params.clientName.includes('SuperMax')) {
         return {
           id: 'sp_123',
           startDate: new Date(2025, 0, 1), // 1 Ene 2025
           endDate: new Date(2025, 11, 31), // 31 Dic 2025
           type: 'gold',
           program: {
             id: 'prog_morning',
             name: 'Mañana Mix',
             requirements: ['mencion', 'presentacion', 'cierre']
           }
         };
       }
       return null;
    }
  };

  const validate = async (): Promise<SponsorshipValidationResult> => {
    setIsValidating(true);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simular API

    const items: ValidationItem[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 1. Búsqueda de asociación (Cross-Validation)
    const sponsorship = await vencimientoservice.findSponsorship({
      clientName: context.clientName,
    } as Parameters<typeof vencimientoservice.findSponsorship>[0]);

    if (!sponsorship) {
      items.push({
        id: 'sponsorship-check',
        label: 'Auspicio Activo',
        status: 'error',
        message: 'No se encontró auspicio activo para este cliente y período',
        suggestions: ['Verificar fechas', 'Crear auspicio', 'Cambiar cliente']
      });
      score -= 50; // Critical failure
    } else {
      items.push({
        id: 'sponsorship-check',
        label: 'Auspicio Activo',
        status: 'success',
        message: `Vinculado a contrato ${sponsorship.type.toUpperCase()} - ${sponsorship.program.name}`
      });

      // 2. Validación de Coherencia Temporal
      if (context.startDate && context.endDate) {
        const isStartValid = isWithinInterval(context.startDate, { start: sponsorship.startDate, end: sponsorship.endDate });
        const isEndValid = isWithinInterval(context.endDate, { start: sponsorship.startDate, end: sponsorship.endDate });

        if (isStartValid && isEndValid) {
           items.push({
             id: 'temporal-coherence',
             label: 'Coherencia Temporal',
             status: 'success',
             message: 'Las fechas están dentro del periodo contratado'
           });
        } else {
           items.push({
             id: 'temporal-coherence',
             label: 'Coherencia Temporal',
             status: 'warning',
             message: 'Las fechas exceden el periodo del contrato',
             suggestions: [`Ajustar fin al ${format(sponsorship.endDate, 'dd/MM/yyyy')}`]
           });
           score -= 15;
        }
      }

      // 3. Validación de Tipo de Contenido
      const allowedTypes = sponsorship.program.requirements;
      if (allowedTypes.includes(context.type)) {
         items.push({
           id: 'content-type',
           label: 'Tipo de Contenido',
           status: 'success',
           message: `El tipo '${context.type}' está permitido en paquete ${sponsorship.type}`
         });
      } else {
         items.push({
           id: 'content-type',
           label: 'Tipo de Contenido',
           status: 'warning',
           message: `El tipo '${context.type}' no es estándar en este paquete`,
           suggestions: [`Considerar upgrade a Platinum`]
         });
         score -= 10;
      }
    }

    // 4. Análisis de Saturación
    const currentLoad = 65; // Mock
    const projectedLoad = currentLoad + 4;
    const saturationStatus = projectedLoad > 85 ? 'critical' : projectedLoad > 75 ? 'warning' : 'healthy';
    
    // 5. Contenido Faltante (Missing Content)
    // Lógica: Si es contrato Gold y no tiene "Cierre", sugerirlo.
    const missingPresentations = [];
    if (context.type !== 'cierre') {
       missingPresentations.push({
         client: context.clientName,
         program: sponsorship?.program.name || 'Programa',
         expiresInDays: 5 // Mock expiration logic
       });
       recommendations.push("Falta programar Ciere para completar el bloque");
    }

    if (saturationStatus === 'critical') {
      recommendations.push("Considerar mover anuncio al bloque de las 11:00 AM para reducir saturación");
    }

    recommendations.push("Sugerencia: Rotar creatividades cada 7 días para evitar fatiga de audiencia");

    setIsValidating(false);

    return {
      overallScore: Math.max(0, score),
      items,
      saturation: {
        current: currentLoad,
        projected: projectedLoad,
        status: saturationStatus
      },
      missingPresentations,
      recommendations
    };
  };

  return {
    validate,
    isValidating
  };
}
