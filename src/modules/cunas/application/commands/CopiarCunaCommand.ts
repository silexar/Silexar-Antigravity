/**
 * COMMAND: COPIAR CUÑA — TIER 0
 *
 * Crea una nueva cuña como copia de una existente.
 * Útil para renovaciones, versiones alternativas y plantillas.
 * La copia siempre inicia en estado 'borrador'.
 */

export interface CopiarCunaInput {
  tenantId: string;
  cunaOrigenId: string;          // ID de la cuña a copiar
  nuevoNombre: string;
  // Sobrescrituras opcionales en la copia
  nuevoContratoId?: string | null;
  nuevaCampanaId?: string | null;
  nuevaFechaFinVigencia?: Date | null;
  copiadoPorId: string;
  esRenovacion?: boolean;        // true = link semántico a la versión anterior
}

export class CopiarCunaCommand {
  constructor(public readonly input: CopiarCunaInput) {}
}
