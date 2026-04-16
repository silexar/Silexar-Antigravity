import { z } from 'zod';
import { AnuncianteEstadoEnum } from '../../domain/entities/Anunciante';

export const ActualizarAnuncianteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  rut: z.string().max(12).optional(),
  nombreRazonSocial: z.string().min(1).max(255).optional(),
  giroActividad: z.string().max(500).optional(),
  direccion: z.string().max(500).optional(),
  ciudad: z.string().max(100).optional(),
  comunaProvincia: z.string().max(100).optional(),
  pais: z.string().max(100).optional(),
  emailContacto: z.string().email().max(255).optional(),
  telefonoContacto: z.string().max(20).optional(),
  paginaWeb: z.string().max(255).optional(),
  nombreContactoPrincipal: z.string().max(255).optional(),
  cargoContactoPrincipal: z.string().max(100).optional(),
  tieneFacturacionElectronica: z.boolean().optional(),
  direccionFacturacion: z.string().max(500).optional(),
  emailFacturacion: z.string().email().max(255).optional(),
  notas: z.string().optional(),
  estado: AnuncianteEstadoEnum.optional(),
  activo: z.boolean().optional(),
  modificadoPorId: z.string().uuid(),
});

export type ActualizarAnuncianteInput = z.infer<typeof ActualizarAnuncianteSchema>;

export class ActualizarAnuncianteCommand {
  constructor(public readonly input: ActualizarAnuncianteInput) {
    const result = ActualizarAnuncianteSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input inválido: ${result.error.message}`);
    }
  }
}
