/**
 * 📨 APPLICATION COMMAND: IniciarVerificacionCommand
 * 
 * DTO que representa la intención de iniciar una verificación.
 * No contiene lógica, solo datos validados.
 * 
 * @tier TIER_0_ENTERPRISE
 */

import { TipoMaterial } from "../../domain/value-objects/TipoMaterial";

export interface MaterialDTO {
  nombre: string;
  tipo: TipoMaterial;
  duracionSegundos?: number;
  spxCode?: string;
  urlAudio?: string;
}

export class IniciarVerificacionCommand {
  constructor(
    public readonly tenantId: string,
    public readonly clienteId: string,
    public readonly campanaId: string,
    public readonly materiales: MaterialDTO[],
    // Configuración opcional
    public readonly fechaInicio?: string, 
    public readonly fuenteAudio?: 'auto' | 'manual'
  ) {}
}
