import { z } from 'zod';

export const CrearAnuncianteSchema = z.object({
  tenantId: z.string().uuid(),
  rut: z.string().max(12).optional(),
  nombreRazonSocial: z.string().min(1).max(255),
  giroActividad: z.string().max(500).optional(),
  direccion: z.string().max(500).optional(),
  ciudad: z.string().max(100).optional(),
  comunaProvincia: z.string().max(100).optional(),
  pais: z.string().max(100).optional().default('Chile'),
  emailContacto: z.string().email().max(255).optional(),
  telefonoContacto: z.string().max(20).optional(),
  paginaWeb: z.string().max(255).optional(),
  nombreContactoPrincipal: z.string().max(255).optional(),
  cargoContactoPrincipal: z.string().max(100).optional(),
  tieneFacturacionElectronica: z.boolean().optional().default(false),
  direccionFacturacion: z.string().max(500).optional(),
  emailFacturacion: z.string().email().max(255).optional(),
  notas: z.string().optional(),
  creadoPorId: z.string().uuid(),
});

export type CrearAnuncianteInput = z.infer<typeof CrearAnuncianteSchema>;

export class CrearAnuncianteCommand {
  constructor(public readonly input: CrearAnuncianteInput) {
    const result = CrearAnuncianteSchema.safeParse(input);
    if (!result.success) {
      throw new Error(`Input inválido: ${result.error.message}`);
    }
  }
}
