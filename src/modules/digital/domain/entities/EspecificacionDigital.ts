import { z } from 'zod';
import { TipoPresupuestoDigital } from '../value-objects/PresupuestoDigital';

export const EspecificacionDigitalSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  campanaId: z.string().uuid().nullable(),
  contratoId: z.string().uuid().nullable(),
  plataformas: z.array(z.string()),
  presupuestoDigital: z.number().min(0).nullable(),
  moneda: z.string().max(3).default('CLP'),
  tipoPresupuesto: z.enum(['diario', 'total']).nullable(),
  objetivos: z.record(z.string(), z.any()).nullable(),
  trackingLinks: z.array(z.string()),
  configuracionTargeting: z.record(z.string(), z.any()).nullable(),
  estado: z.string().max(50).default('borrador'),
  notas: z.string().nullable(),
  creadoPorId: z.string().uuid(),
  fechaCreacion: z.date(),
  fechaModificacion: z.date().nullable(),
});

export type EspecificacionDigitalProps = z.infer<typeof EspecificacionDigitalSchema>;

export class EspecificacionDigital {
  private constructor(private props: EspecificacionDigitalProps) {
    this.validate();
  }

  static create(
    props: Omit<EspecificacionDigitalProps, 'id' | 'fechaCreacion' | 'fechaModificacion'> & { id?: string }
  ): EspecificacionDigital {
    if (!props.campanaId && !props.contratoId) {
      throw new Error('Debe especificar al menos campanaId o contratoId');
    }
    return new EspecificacionDigital({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      fechaCreacion: new Date(),
      fechaModificacion: null,
    });
  }

  static reconstitute(props: EspecificacionDigitalProps): EspecificacionDigital {
    return new EspecificacionDigital(props);
  }

  private validate(): void {
    const result = EspecificacionDigitalSchema.safeParse(this.props);
    if (!result.success) {
      throw new Error(`EspecificacionDigital invalida: ${result.error.message}`);
    }
    if (!this.props.campanaId && !this.props.contratoId) {
      throw new Error('Debe especificar al menos campanaId o contratoId');
    }
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get campanaId(): string | null { return this.props.campanaId; }
  get contratoId(): string | null { return this.props.contratoId; }
  get plataformas(): string[] { return this.props.plataformas; }
  get presupuestoDigital(): number | null { return this.props.presupuestoDigital; }
  get moneda(): string { return this.props.moneda; }
  get tipoPresupuesto(): TipoPresupuestoDigital | null { return (this.props.tipoPresupuesto as TipoPresupuestoDigital) ?? null; }
  get objetivos(): Record<string, any> | null { return this.props.objetivos; }
  get trackingLinks(): string[] { return this.props.trackingLinks; }
  get configuracionTargeting(): Record<string, any> | null { return this.props.configuracionTargeting; }
  get estado(): string { return this.props.estado; }
  get notas(): string | null { return this.props.notas; }
  get creadoPorId(): string { return this.props.creadoPorId; }
  get fechaCreacion(): Date { return this.props.fechaCreacion; }

  actualizar(fields: Partial<Omit<EspecificacionDigitalProps, 'id' | 'tenantId' | 'fechaCreacion' | 'creadoPorId'>>): void {
    this.props = { ...this.props, ...fields, fechaModificacion: new Date() };
    this.validate();
  }

  toJSON(): EspecificacionDigitalProps {
    return { ...this.props };
  }
}
