/**
 * 📦 DOMAIN ENTITY: MaterialCreativo
 * 
 * Representa la pieza de audio que debe ser buscada.
 * Puede ser un archivo físico, un link, o una referencia a una pauta.
 * 
 * @tier TIER_0_ENTERPRISE
 */

import { TipoMaterial } from "../value-objects/TipoMaterial";

export class MaterialCreativo {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly tipo: TipoMaterial,
    public readonly duracionEsperadaSegundos?: number,
    public readonly spxCode?: string, // Código estándar de industria
    public readonly urlAudio?: string,
    public readonly hashHuellaDigital?: string // Fingerprint previo si existe
  ) {
    if (!nombre) throw new Error("Un material creativo debe tener nombre.");
  }

  public tieneMismaHuella(otroHash: string): boolean {
    return this.hashHuellaDigital === otroHash;
  }
}
