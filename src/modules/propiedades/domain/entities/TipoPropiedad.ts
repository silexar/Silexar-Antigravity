import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  CodigoPropiedad,
  CodigoPropiedadSchema,
  EstadoPropiedad,
  TipoClasificacion,
  TipoValidacion,
  ConfiguracionValidacionSchema,
  ConfiguracionValidacionProps
} from '../value-objects/TiposBase';

const crearTipoPropiedadSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  aplicacion: z.array(z.nativeEnum(TipoClasificacion)).min(1, "Debe aplicar al menos a una clasificación"),
  configuracionValidacion: ConfiguracionValidacionSchema.optional(),
  tipoValidacion: z.nativeEnum(TipoValidacion).default(TipoValidacion.LISTA_UNICA),
});

export type CrearTipoPropiedadProps = z.infer<typeof crearTipoPropiedadSchema>;

export class TipoPropiedad {
  private constructor(
    public readonly id: string,
    public readonly codigo: CodigoPropiedad,
    private _nombre: string,
    private _descripcion: string | null,
    private _estado: EstadoPropiedad,
    private _aplicacion: TipoClasificacion[],
    private _configuracionValidacion: ConfiguracionValidacionProps,
    private _tipoValidacion: TipoValidacion,
    public readonly creadoEn: Date,
    private _actualizadoEn: Date
  ) {}

  static create(codigo: CodigoPropiedad, props: CrearTipoPropiedadProps): TipoPropiedad {
    const validated = crearTipoPropiedadSchema.parse(props);
    CodigoPropiedadSchema.parse(codigo); // Ensure the code format is strictly valid

    const configValidacion = validated.configuracionValidacion ?? {
      obligatorio: false,
      valorUnico: false,
      validarCoherencia: true,
      detectarConflictos: false,
      aprobacionSupervision: false,
    };

    return new TipoPropiedad(
      uuidv4(),
      codigo,
      validated.nombre,
      validated.descripcion ?? null,
      EstadoPropiedad.ACTIVO,
      validated.aplicacion,
      configValidacion,
      validated.tipoValidacion,
      new Date(),
      new Date()
    );
  }

  // Métodos de Dominio
  actualizarDatosGenerales(nombre: string, descripcion?: string): void {
    if (!nombre || nombre.trim().length === 0) throw new Error("Nombre inválido");
    this._nombre = nombre.trim();
    if (descripcion !== undefined) {
      this._descripcion = descripcion.trim() || null;
    }
    this._marcarModificado();
  }

  cambiarEstado(nuevoEstado: EstadoPropiedad): void {
    this._estado = nuevoEstado;
    this._marcarModificado();
  }

  actualizarConfiguracionValidacion(config: Partial<ConfiguracionValidacionProps>): void {
    this._configuracionValidacion = {
      ...this._configuracionValidacion,
      ...config
    };
    this._marcarModificado();
  }

  agregarAplicacion(tipo: TipoClasificacion): void {
    if (!this._aplicacion.includes(tipo)) {
      this._aplicacion.push(tipo);
      this._marcarModificado();
    }
  }

  removerAplicacion(tipo: TipoClasificacion): void {
    this._aplicacion = this._aplicacion.filter(a => a !== tipo);
    if (this._aplicacion.length === 0) {
      throw new Error("El tipo de propiedad debe aplicar al menos a una clasificación");
    }
    this._marcarModificado();
  }

  private _marcarModificado(): void {
    this._actualizadoEn = new Date();
  }

  // Getters
  get nombre(): string { return this._nombre; }
  get descripcion(): string | null { return this._descripcion; }
  get estado(): EstadoPropiedad { return this._estado; }
  get aplicacion(): TipoClasificacion[] { return [...this._aplicacion]; }
  get configuracionValidacion(): ConfiguracionValidacionProps { return { ...this._configuracionValidacion }; }
  get tipoValidacion(): TipoValidacion { return this._tipoValidacion; }
  get actualizadoEn(): Date { return this._actualizadoEn; }
  get estaActivo(): boolean { return this._estado === EstadoPropiedad.ACTIVO; }

  /**
   * Reconstitute an entity from a DB row (bypass domain validation for already-persisted data).
   * Use ONLY in repository implementations — never in application/presentation layer.
   */
  static reconstitute(raw: {
    id: string
    codigo: string
    nombre: string
    descripcion: string | null
    estado: EstadoPropiedad
    aplicacion: TipoClasificacion[]
    tipoValidacion: TipoValidacion
    configuracionValidacion: ConfiguracionValidacionProps
    creadoEn: Date
    actualizadoEn: Date
  }): TipoPropiedad {
    return new TipoPropiedad(
      raw.id,
      raw.codigo as CodigoPropiedad,
      raw.nombre,
      raw.descripcion,
      raw.estado,
      raw.aplicacion,
      raw.configuracionValidacion,
      raw.tipoValidacion,
      raw.creadoEn,
      raw.actualizadoEn,
    )
  }

  /** Apply partial update from DTO (used by handler only) */
  update(props: Partial<CrearTipoPropiedadProps>): void {
    if (props.nombre) this._nombre = props.nombre
    if (props.descripcion !== undefined) this._descripcion = props.descripcion ?? null
    if (props.aplicacion) this._aplicacion = props.aplicacion
    if (props.tipoValidacion) this._tipoValidacion = props.tipoValidacion
    if (props.configuracionValidacion) {
      this._configuracionValidacion = { ...this._configuracionValidacion, ...props.configuracionValidacion }
    }
    this._marcarModificado()
  }
}
