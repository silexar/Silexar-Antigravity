/**
 * VALUE OBJECT: VARIABLE PERSONALIZADA — TIER 0
 *
 * Representa una variable dinámica usada en plantillas de PromoIDA.
 * Encapsula la validación del nombre ({VARIABLE}), tipo y valor.
 */

export type TipoVariable = 'texto' | 'numero' | 'fecha' | 'telefono' | 'url' | 'auto';

const PATRON_NOMBRE_VARIABLE = /^\{[A-Z][A-Z0-9_]*\}$/;

export class VariablePersonalizada {
  private constructor(
    private readonly _nombre: string,
    private readonly _tipo: TipoVariable,
    private readonly _valorPorDefecto: string | null,
    private readonly _descripcion: string | null,
    private readonly _requerida: boolean,
  ) {}

  static create(
    nombre: string,
    tipo: TipoVariable,
    opciones?: {
      valorPorDefecto?: string | null;
      descripcion?: string | null;
      requerida?: boolean;
    }
  ): VariablePersonalizada {
    if (!PATRON_NOMBRE_VARIABLE.test(nombre)) {
      throw new Error(
        `Nombre de variable inválido: "${nombre}". Debe tener formato {MAYUSCULAS} (ej: {EVENTO}, {PRECIO})`
      );
    }

    const tipos: TipoVariable[] = ['texto', 'numero', 'fecha', 'telefono', 'url', 'auto'];
    if (!tipos.includes(tipo)) {
      throw new Error(`Tipo de variable inválido: "${tipo}"`);
    }

    return new VariablePersonalizada(
      nombre,
      tipo,
      opciones?.valorPorDefecto ?? null,
      opciones?.descripcion ?? null,
      opciones?.requerida ?? true,
    );
  }

  get nombre(): string { return this._nombre; }
  get tipo(): TipoVariable { return this._tipo; }
  get valorPorDefecto(): string | null { return this._valorPorDefecto; }
  get descripcion(): string | null { return this._descripcion; }
  get requerida(): boolean { return this._requerida; }

  /** Valida que un valor dado sea compatible con el tipo de la variable */
  validarValor(valor: string): { valido: boolean; error?: string } {
    switch (this._tipo) {
      case 'numero':
        if (isNaN(parseFloat(valor))) {
          return { valido: false, error: `"${valor}" no es un número válido para ${this._nombre}` };
        }
        break;
      case 'fecha': {
        const fecha = new Date(valor);
        if (isNaN(fecha.getTime())) {
          return { valido: false, error: `"${valor}" no es una fecha válida para ${this._nombre}` };
        }
        break;
      }
      case 'telefono':
        if (!/^[0-9\-\s\+\(\)]{7,15}$/.test(valor)) {
          return { valido: false, error: `"${valor}" no es un teléfono válido para ${this._nombre}` };
        }
        break;
      case 'url':
        if (!/^https?:\/\/.+\..+/.test(valor)) {
          return { valido: false, error: `"${valor}" no es una URL válida para ${this._nombre}` };
        }
        break;
      case 'texto':
        if (valor.length === 0 || valor.length > 200) {
          return { valido: false, error: `Texto para ${this._nombre} debe tener entre 1 y 200 caracteres` };
        }
        break;
      case 'auto':
        // Las variables auto son calculadas por el sistema
        break;
    }
    return { valido: true };
  }

  equals(other: VariablePersonalizada): boolean {
    return this._nombre === other._nombre && this._tipo === other._tipo;
  }

  toJSON(): {
    nombre: string;
    tipo: TipoVariable;
    valorPorDefecto: string | null;
    descripcion: string | null;
    requerida: boolean;
  } {
    return {
      nombre: this._nombre,
      tipo: this._tipo,
      valorPorDefecto: this._valorPorDefecto,
      descripcion: this._descripcion,
      requerida: this._requerida,
    };
  }

  toString(): string {
    return this._nombre;
  }
}
