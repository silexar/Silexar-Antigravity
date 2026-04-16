import { Result } from '@/lib/utils/result';
import { Factura } from '../../domain/entities/Factura';
import { IFacturaRepository } from '../../domain/repositories/IFacturaRepository';
import { CrearFacturaCommand } from '../commands/CrearFacturaCommand';

export class CrearFacturaHandler {
  constructor(private readonly repository: IFacturaRepository) {}

  async execute(command: CrearFacturaCommand): Promise<Result<Factura>> {
    try {
      const { input } = command;
      const numeroFactura = await this.repository.generateNumeroFactura(input.tenantId);

      const factura = Factura.create({
        tenantId: input.tenantId,
        numeroFactura,
        folio: null,
        tipoDocumento: 'factura_electronica',
        codigoSii: 33,
        anuncianteId: input.anuncianteId ?? null,
        agenciaId: input.agenciaId ?? null,
        contratoId: null,
        receptorRut: input.receptorRut.trim(),
        receptorRazonSocial: input.receptorRazonSocial.trim(),
        receptorGiro: input.receptorGiro ?? null,
        receptorDireccion: input.receptorDireccion ?? null,
        receptorCiudad: input.receptorCiudad ?? null,
        receptorComuna: input.receptorComuna ?? null,
        fechaEmision: input.fechaEmision,
        fechaVencimiento: input.fechaVencimiento ?? null,
        montoNeto: input.montoNeto,
        montoExento: input.montoExento ?? 0,
        tasaIva: input.tasaIva ?? 19,
        formaPago: input.formaPago,
        observaciones: input.observaciones ?? null,
        creadoPorId: input.creadoPorId,
      } as any);

      await this.repository.save(factura);
      return Result.ok(factura);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al crear factura'));
    }
  }
}
