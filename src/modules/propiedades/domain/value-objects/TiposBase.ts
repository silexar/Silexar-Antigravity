import { z } from 'zod';

// Value Objects y Tipos Base para el módulo Propiedades

export const CodigoPropiedadSchema = z.string().regex(/^PROP-\d{4}-.+$/, "Formato inválido. Debe ser PROP-YYYY-XXXXX");
export type CodigoPropiedad = z.infer<typeof CodigoPropiedadSchema>;

export enum TipoClasificacion {
  CAMPANA = 'CAMPANA',
  CONTRATO = 'CONTRATO',
  CLIENTE = 'CLIENTE',
  FACTURA = 'FACTURA',
  REPORTE = 'REPORTE'
}

export enum EstadoPropiedad {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  DEPRECADO = 'DEPRECADO',
  PRUEBA = 'PRUEBA'
}

export enum TipoValidacion {
  LISTA_UNICA = 'LISTA_UNICA',
  LISTA_MULTIPLE = 'LISTA_MULTIPLE',
  VALOR_LIBRE = 'VALOR_LIBRE'
}

export const CuentaContableSchema = z.string().regex(/^\d{7}$/, "La cuenta contable debe tener 7 dígitos");
export type CuentaContable = z.infer<typeof CuentaContableSchema>;

export const ConfiguracionValidacionSchema = z.object({
  obligatorio: z.boolean().default(false),
  valorUnico: z.boolean().default(false),
  validarCoherencia: z.boolean().default(true),
  detectarConflictos: z.boolean().default(false),
  aprobacionSupervision: z.boolean().default(false),
});
export type ConfiguracionValidacionProps = z.infer<typeof ConfiguracionValidacionSchema>;
