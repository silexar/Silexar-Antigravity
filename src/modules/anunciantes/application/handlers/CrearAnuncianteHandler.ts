import { Result } from '@/lib/utils/result';
import { Anunciante } from '../../domain/entities/Anunciante';
import { IAnuncianteRepository } from '../../domain/repositories/IAnuncianteRepository';
import { CrearAnuncianteCommand } from '../commands/CrearAnuncianteCommand';

export class CrearAnuncianteHandler {
  constructor(private readonly repository: IAnuncianteRepository) {}

  async execute(command: CrearAnuncianteCommand): Promise<Result<Anunciante>> {
    try {
      const { input } = command;

      if (input.rut) {
        const exists = await this.repository.existsByRut(input.rut, input.tenantId);
        if (exists) {
          return Result.fail(`Ya existe un anunciante con el RUT ${input.rut}`);
        }
      }

      const codigo = await this.repository.generateCode(input.tenantId);

      const anunciante = Anunciante.create({
        tenantId: input.tenantId,
        codigo,
        rut: input.rut ?? null,
        nombreRazonSocial: input.nombreRazonSocial.trim(),
        giroActividad: input.giroActividad ?? null,
        direccion: input.direccion ?? null,
        ciudad: input.ciudad ?? null,
        comunaProvincia: input.comunaProvincia ?? null,
        pais: input.pais ?? 'Chile',
        emailContacto: input.emailContacto ?? null,
        telefonoContacto: input.telefonoContacto ?? null,
        paginaWeb: input.paginaWeb ?? null,
        nombreContactoPrincipal: input.nombreContactoPrincipal ?? null,
        cargoContactoPrincipal: input.cargoContactoPrincipal ?? null,
        tieneFacturacionElectronica: input.tieneFacturacionElectronica ?? false,
        direccionFacturacion: input.direccionFacturacion ?? null,
        emailFacturacion: input.emailFacturacion ?? null,
        notas: input.notas ?? null,
        estado: 'activo',
        activo: true,
        creadoPorId: input.creadoPorId,
      });

      await this.repository.save(anunciante);
      return Result.ok(anunciante);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error al crear anunciante'));
    }
  }
}
