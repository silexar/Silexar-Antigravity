import { z } from 'zod';

export const ValidarDisponibilidadSchema = z.object({
  programaId: z.string().min(1, 'El ID de programa es requerido'),
  franjaHoraria: z.string().min(1, 'La franja horaria es requerida'),
});

export type ValidarDisponibilidadDto = z.infer<typeof ValidarDisponibilidadSchema>;

export const ConfigurarTarifarioSchema = z.object({
  emisoraId: z.string().min(1, 'El ID de emisora es requerido'),
  franjaHoraria: z.string().min(1, 'La franja horaria es requerida'),
  factorRecargo: z.number().min(0.1, 'El factor de recargo debe ser al menos 0.1'),
});

export type ConfigurarTarifarioDto = z.infer<typeof ConfigurarTarifarioSchema>;
