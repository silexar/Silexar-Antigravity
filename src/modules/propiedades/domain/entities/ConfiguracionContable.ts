import { z } from 'zod';
import { CuentaContable, CuentaContableSchema } from '../value-objects/TiposBase';

const configuracionContableSchema = z.object({
  cuentaIngresos: CuentaContableSchema.nullable().optional(),
  cuentaCostos: CuentaContableSchema.nullable().optional(),
  centroCosto: z.string().nullable().optional(),
  requiereAprobacionCfo: z.boolean().default(false),
  validarExistencia: z.boolean().default(true),
});

export type CrearConfiguracionContableProps = z.infer<typeof configuracionContableSchema>;

export class ConfiguracionContable {
  private constructor(
    private readonly _cuentaIngresos: CuentaContable | null,
    private readonly _cuentaCostos: CuentaContable | null,
    private readonly _centroCosto: string | null,
    private readonly _requiereAprobacionCfo: boolean,
    private readonly _validarExistencia: boolean
  ) {}

  static create(props: CrearConfiguracionContableProps): ConfiguracionContable {
    const validated = configuracionContableSchema.parse(props);
    return new ConfiguracionContable(
      validated.cuentaIngresos ?? null,
      validated.cuentaCostos ?? null,
      validated.centroCosto ?? null,
      validated.requiereAprobacionCfo,
      validated.validarExistencia
    );
  }

  // Getters
  get cuentaIngresos(): CuentaContable | null { return this._cuentaIngresos; }
  get cuentaCostos(): CuentaContable | null { return this._cuentaCostos; }
  get centroCosto(): string | null { return this._centroCosto; }
  get requiereAprobacionCfo(): boolean { return this._requiereAprobacionCfo; }
  get validarExistencia(): boolean { return this._validarExistencia; }

  toValue(): CrearConfiguracionContableProps {
    return {
      cuentaIngresos: this._cuentaIngresos,
      cuentaCostos: this._cuentaCostos,
      centroCosto: this._centroCosto,
      requiereAprobacionCfo: this._requiereAprobacionCfo,
      validarExistencia: this._validarExistencia
    };
  }
}
