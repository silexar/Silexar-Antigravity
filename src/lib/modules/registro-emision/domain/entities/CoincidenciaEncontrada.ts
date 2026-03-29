/**
 * 📦 DOMAIN ENTITY: CoincidenciaEncontrada
 * 
 * Representa un "Hit" o hallazgo específico de un material en el stream de audio.
 * 
 * @tier TIER_0_ENTERPRISE
 */

import { PorcentajeCoincidencia } from "../value-objects/PorcentajeCoincidencia";
import { TiempoEmision } from "../value-objects/TiempoEmision";
import { CalidadAudio } from "../value-objects/CalidadAudio";

export class CoincidenciaEncontrada {
  constructor(
    public readonly id: string,
    public readonly materialId: string,
    public readonly momentoEmision: TiempoEmision,
    public readonly duracionDetectadaSegundos: number,
    public readonly porcentajeCoincidencia: PorcentajeCoincidencia,
    public readonly calidadAudio: CalidadAudio,
    public readonly clipUrl?: string // URL al recorte específico
  ) {}

  public esValidaParaCobro(): boolean {
    // Regla de Negocio: Solo cobrable si > 85% match y calidad limpia
    return this.porcentajeCoincidencia.esCoincidenciaValida(85) && 
           this.calidadAudio.esAceptableParaLegal();
  }
}
