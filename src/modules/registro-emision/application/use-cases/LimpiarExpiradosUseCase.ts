import type { IRegistroAireRepository } from '../../domain/repositories/IRegistroAireRepository';
import type { IClipEvidenciaRepository } from '../../domain/repositories/IClipEvidenciaRepository';
import type { ILinkTemporalRepository } from '../../domain/repositories/ILinkTemporalRepository';

export interface LimpiarExpiradosResult {
  clipsEliminados: number;
  accesosRevocados: number;
  registrosAireEliminados: number;
}

export class LimpiarExpiradosUseCase {
  constructor(
    private readonly registroAireRepo: IRegistroAireRepository,
    private readonly clipRepo: IClipEvidenciaRepository,
    private readonly accesoRepo: ILinkTemporalRepository,
  ) {}

  async execute(tenantId: string, fechaCorte?: Date): Promise<LimpiarExpiradosResult> {
    const corte = fechaCorte ?? new Date();

    const clipsExpirados = await this.clipRepo.listarExpirados(tenantId, corte);
    for (const clip of clipsExpirados) {
      await this.clipRepo.eliminar(clip.id, tenantId);
    }

    const accesosExpirados = await this.accesoRepo.listarExpirados(tenantId, corte);
    for (const acceso of accesosExpirados) {
      acceso.revocar();
      await this.accesoRepo.actualizar(acceso);
    }

    // Registros de aire: eliminar después de 60 días (doble ventana vs clips)
    const corteAire = new Date(corte);
    corteAire.setDate(corteAire.getDate() - 30);
    const registrosExpirados = await this.registroAireRepo.listarExpirados(tenantId, corteAire);
    for (const registro of registrosExpirados) {
      await this.registroAireRepo.eliminar(registro.id, tenantId);
    }

    return {
      clipsEliminados: clipsExpirados.length,
      accesosRevocados: accesosExpirados.length,
      registrosAireEliminados: registrosExpirados.length,
    };
  }
}
