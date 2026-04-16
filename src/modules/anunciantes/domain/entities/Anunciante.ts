import { z } from 'zod';

export const AnuncianteEstadoEnum = z.enum(['activo', 'inactivo', 'suspendido', 'pendiente']);
export type AnuncianteEstado = z.infer<typeof AnuncianteEstadoEnum>;

export const AnuncianteSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  codigo: z.string().min(1).max(20),
  rut: z.string().max(12).nullable(),
  nombreRazonSocial: z.string().min(1).max(255),
  giroActividad: z.string().max(500).nullable(),
  direccion: z.string().max(500).nullable(),
  ciudad: z.string().max(100).nullable(),
  comunaProvincia: z.string().max(100).nullable(),
  pais: z.string().max(100),
  emailContacto: z.string().email().max(255).nullable(),
  telefonoContacto: z.string().max(20).nullable(),
  paginaWeb: z.string().max(255).nullable(),
  nombreContactoPrincipal: z.string().max(255).nullable(),
  cargoContactoPrincipal: z.string().max(100).nullable(),
  tieneFacturacionElectronica: z.boolean(),
  direccionFacturacion: z.string().max(500).nullable(),
  emailFacturacion: z.string().email().max(255).nullable(),
  notas: z.string().nullable(),
  estado: AnuncianteEstadoEnum,
  activo: z.boolean(),
  eliminado: z.boolean(),
  fechaCreacion: z.date(),
  fechaModificacion: z.date().nullable(),
  fechaEliminacion: z.date().nullable(),
  creadoPorId: z.string().uuid(),
  modificadoPorId: z.string().uuid().nullable(),
  eliminadoPorId: z.string().uuid().nullable(),
});

export type AnuncianteProps = z.infer<typeof AnuncianteSchema>;

export class Anunciante {
  private constructor(private props: AnuncianteProps) {
    this.validate();
  }

  static create(
    props: Omit<AnuncianteProps, 'id' | 'codigo' | 'fechaCreacion' | 'fechaModificacion' | 'fechaEliminacion' | 'eliminado' | 'modificadoPorId' | 'eliminadoPorId'> & { id?: string; codigo?: string }
  ): Anunciante {
    const now = new Date();
    return new Anunciante({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      codigo: props.codigo ?? '',
      fechaCreacion: now,
      fechaModificacion: null,
      fechaEliminacion: null,
      eliminado: false,
      modificadoPorId: null,
      eliminadoPorId: null,
    });
  }

  static reconstitute(props: AnuncianteProps): Anunciante {
    return new Anunciante(props);
  }

  private validate(): void {
    const result = AnuncianteSchema.safeParse(this.props);
    if (!result.success) {
      throw new Error(`Anunciante inválido: ${result.error.message}`);
    }
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get codigo(): string { return this.props.codigo; }
  set codigo(value: string) { this.props.codigo = value; }
  get rut(): string | null { return this.props.rut; }
  get nombreRazonSocial(): string { return this.props.nombreRazonSocial; }
  get giroActividad(): string | null { return this.props.giroActividad; }
  get direccion(): string | null { return this.props.direccion; }
  get ciudad(): string | null { return this.props.ciudad; }
  get comunaProvincia(): string | null { return this.props.comunaProvincia; }
  get pais(): string { return this.props.pais; }
  get emailContacto(): string | null { return this.props.emailContacto; }
  get telefonoContacto(): string | null { return this.props.telefonoContacto; }
  get paginaWeb(): string | null { return this.props.paginaWeb; }
  get nombreContactoPrincipal(): string | null { return this.props.nombreContactoPrincipal; }
  get cargoContactoPrincipal(): string | null { return this.props.cargoContactoPrincipal; }
  get tieneFacturacionElectronica(): boolean { return this.props.tieneFacturacionElectronica; }
  get direccionFacturacion(): string | null { return this.props.direccionFacturacion; }
  get emailFacturacion(): string | null { return this.props.emailFacturacion; }
  get notas(): string | null { return this.props.notas; }
  get estado(): AnuncianteEstado { return this.props.estado; }
  get activo(): boolean { return this.props.activo; }
  get eliminado(): boolean { return this.props.eliminado; }
  get fechaCreacion(): Date { return this.props.fechaCreacion; }
  get fechaModificacion(): Date | null { return this.props.fechaModificacion; }
  get creadoPorId(): string { return this.props.creadoPorId; }

  update(fields: Partial<Omit<AnuncianteProps, 'id' | 'tenantId' | 'fechaCreacion' | 'creadoPorId'>>, userId: string): void {
    this.props = { ...this.props, ...fields, modificadoPorId: userId, fechaModificacion: new Date() };
    this.validate();
  }

  softDelete(userId: string): void {
    this.props.eliminado = true;
    this.props.eliminadoPorId = userId;
    this.props.fechaEliminacion = new Date();
    this.props.activo = false;
    this.props.estado = 'inactivo';
  }

  toggleActivo(): void {
    this.props.activo = !this.props.activo;
    this.props.estado = this.props.activo ? 'activo' : 'inactivo';
    this.props.fechaModificacion = new Date();
  }

  toJSON(): AnuncianteProps {
    return { ...this.props };
  }
}
