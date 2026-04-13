import { z } from 'zod';

export const CrearProgramaAuspicioSchema = z.object({
  emisoraId: z.string().min(1, 'El ID de emisora es requerido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  horaInicio: z.string().min(1, 'La hora de inicio es requerida'),
  horaFin: z.string().min(1, 'La hora de fin es requerida'),
  diasEmision: z.array(z.number()).min(1, 'Debe especificar al menos un día de emisión'),
  cupoDisponible: z.number().min(1, 'El cupo debe ser al menos 1'),
});

export type CrearProgramaAuspicioDto = z.infer<typeof CrearProgramaAuspicioSchema>;
