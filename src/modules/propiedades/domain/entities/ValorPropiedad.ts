import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { EstadoPropiedad } from '../value-objects/TiposBase';
import { ConfiguracionContable, CrearConfiguracionContableProps } from './ConfiguracionContable';

const crearValorPropiedadSchema = z.object({
  codigoRef: z.string().min(1, "El código de referencia es obligatorio"),
  descripcion: z.string().min(2, "La descripción es muy corta"),
  descripcionLarga: z.string().optional(),
  obligatorio: z.boolean().default(false),
  orden: z.number().int().default(0),
  configuracionContable: z.any().optional(), // Se valida internamente
});

export type CrearValorPropiedadProps = z.infer<typeof crearValorPropiedadSchema> & {
  configuracionContable?: CrearConfiguracionContableProps;
};

export class ValorPropiedad {
  private constructor(
    public readonly id: string,
    public readonly tipoPropiedadId: string,
    public readonly codigoRef: string,
    private _descripcion: string,
    private _descripcionLarga: string | null,
    private _estado: EstadoPropiedad,
    private _obligatorio: boolean,
    private _orden: number,
    private _configuracionContable: ConfiguracionContable | null,
    public readonly creadoEn: Date,
    public _actualizadoEn: Date
  ) {}

  static create(tipoPropiedadId: string, props: CrearValorPropiedadProps): ValorPropiedad {
    const validated = crearValorPropiedadSchema.parse(props);
    
    const configContable = props.configuracionContable 
      ? ConfiguracionContable.create(props.configuracionContable) 
      : null;

    return new ValorPropiedad(
      uuidv4(),
      tipoPropiedadId,
      validated.codigoRef,
      validated.descripcion,
      validated.descripcionLarga ?? null,
      EstadoPropiedad.ACTIVO,
      validated.obligatorio,
      validated.orden,
      configContable,
      new Date(),
      new Date()
    );
  }

  // Métodos de Dominio
  actualizarDescripcion(descripcion: string, descripcionLarga?: string): void {
    if (!descripcion || descripcion.trim().length === 0) throw new Error("Descripción inválida");
    this._descripcion = descripcion.trim();
    if (descripcionLarga !== undefined) {
      this._descripcionLarga = descripcionLarga.trim() || null;
    }
    this._marcarModificado();
  }

  cambiarEstado(nuevoEstado: EstadoPropiedad): void {
    this._estado = nuevoEstado;
    this._marcarModificado();
  }

  actualizarConfiguracionContable(props: CrearConfiguracionContableProps): void {
    this._configuracionContable = ConfiguracionContable.create(props);
    this._marcarModificado();
  }

  private _marcarModificado(): void {
    this._actualizadoEn = new Date();
  }

  // Getters
  get descripcion(): string { return this._descripcion; }
  get descripcionLarga(): string | null { return this._descripcionLarga; }
  get estado(): EstadoPropiedad { return this._estado; }
  get obligatorio(): boolean { return this._obligatorio; }
  get orden(): number { return this._orden; }
  get actualizadoEn(): Date { return this._actualizadoEn; }
  get configuracionContable(): ConfiguracionContable | null { return this._configuracionContable; }
  get estaActivo(): boolean { return this._estado === EstadoPropiedad.ACTIVO; }

  /** Update methods used by PropiedadesCommandHandler */
  updateEtiqueta(descripcion: string): void { this.actualizarDescripcion(descripcion) }
  updateValor(descripcionLarga: string): void {
    this._descripcionLarga = descripcionLarga
    this._marcarModificado()
  }
  updateOrden(orden: number): void {
    this._orden = orden
    this._marcarModificado()
  }

  /**
   * Reconstitute a ValorPropiedad entity from a DB row.
   * Use ONLY in repository implementations.
   */
  static reconstitute(raw: {
    id: string
    tipoPropiedadId: string
    codigoRef: string
    etiqueta: string           // maps to descripcion in entity
    valor?: string | null      // maps to descripcionLarga
    estado: EstadoPropiedad
    orden: number
    obligatorio?: boolean
    creadoEn: Date
    actualizadoEn: Date
  }): ValorPropiedad {
    return new ValorPropiedad(
      raw.id,
      raw.tipoPropiedadId,
      raw.codigoRef,
      raw.etiqueta,             // descripcion
      raw.valor ?? null,        // descripcionLarga
      raw.estado,
      raw.obligatorio ?? false,
      raw.orden,
      null,                     // configuracionContable — not stored in simple cases
      raw.creadoEn,
      raw.actualizadoEn,
    )
  }
}
