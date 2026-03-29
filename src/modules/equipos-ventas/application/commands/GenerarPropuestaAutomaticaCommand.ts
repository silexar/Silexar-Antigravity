/**
 * COMMAND GENERAR PROPUESTA AUTOMATICA - TIER 0 ENTERPRISE
 * 
 * @description Comando para generar un plan de medios automáticamente usando IA.
 * Valida inventario, aplica rate card dinámica y genera PDF.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export class GenerarPropuestaAutomaticaCommand {
  constructor(
    public readonly anuncianteId: string,
    public readonly vendedorId: string,
    public readonly presupuestoObjetivo: number,
    public readonly objetivoCampana: 'AWARENESS' | 'CONVERSION' | 'BRANDING',
    public readonly publicoObjetivo: string, // "Jóvenes 18-35"
    public readonly duracionDias: number,
    public readonly fechaInicioDeseada: Date,
    public readonly mediosPreferidos: ('RADIO' | 'TV' | 'DIGITAL')[] = ['RADIO', 'DIGITAL'],
    public readonly intensidad: 'CONSERVADOR' | 'AGRESIVO' | 'MAXIMO_ALCANCE' = 'AGRESIVO'
  ) {
    if (presupuestoObjetivo <= 0) throw new Error('Presupuesto inválido');
    if (duracionDias < 1) throw new Error('Duración mínima 1 día');
  }
}
