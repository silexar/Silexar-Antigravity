import { Result } from '@/lib/utils/result';
import { Anunciante } from '../../domain/entities/Anunciante';
import { IAnuncianteRepository } from '../../domain/repositories/IAnuncianteRepository';
import { ActualizarAnuncianteCommand } from '../commands/ActualizarAnuncianteCommand';

export class ActualizarAnuncianteHandler {
  constructor(private readonly repository: IAnuncianteRepository) {}

  async execute(command: ActualizarAnuncianteCommand): Promise<Result<Anunciante>> {
    try {
      const { input } = command;
      const existing = await this.repository.findById(input.id, input.tenantId);
      if (!existing) {
        return Result.fail('Anunciante no encontrado');
      }

      if (input.rut) {
        const rutExists = await this.repository.existsByRut(input.rut, input.tenantId, input.id);
        if (rutExists) {
          return Result.fail(`Ya existe un anunciante con el RUT ${input.rut}`);
        }
      }

      existing.update({
        rut: input.rut ?? existing.rut,
        nombreRazonSocial: input.nombreRazonSocial ?? existing.nombreRazonSocial,
        giroActividad: input.giroActividad ?? existing.giroActividad,
        direccion: input.direccion ?? existing.direccion,
        ciudad: input.ciudad ?? existing.ciudad,
        comunaProvincia: input.comunaProvincia ?? existing.comunaProvincia,
        pais: input.pais ?? existing.pais,
        emailContacto: input.emailContacto ?? existing.emailContacto,
        telefonoContacto: input.telefonoContacto ?? existing.telefonoContacto,
        paginaWeb: input.paginaWeb ?? existing.paginaWeb,
        nombreContactoPrincipal: input.nombreContactoPrincipal ?? existing.nombreContactoPrincipal,
        cargoContactoPrincipal: input.cargoContactoPrincipal ?? existing.cargoContactoPrincipal,
        tieneFacturacionElectronica: input.tieneFacturacionElectronica ?? existing.tieneFacturacionElectronica,
        direccionFacturacion: input.direccionFacturacion ?? existing.direccionFacturacion,
        emailFacturacion: input.emailFacturacion ?? existing.emailFacturacion,
        notas: input.notas ?? existing.notas,
        estado: input.estado ?? existing.estado,
        activo: input.activo ?? existing.activo,
      }, input.modificadoPorId);

      await this.repository.update(existing);
      return Result.ok(existing);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al actualizar anunciante'));
    }
  }
}
