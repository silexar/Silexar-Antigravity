/**
 * ENTITY: PRESENTACIÓN — TIER 0
 *
 * Texto de entrada (intro) de auspicio para un programa de radio.
 * Debe validarse contra el módulo de Vencimientos para confirmar
 * que el auspicio programado está vigente.
 */

export interface PresentacionProps {
  id: string;
  tenantId: string;
  cunaId: string;
  texto: string;
  duracionSegundos: number;
  programaId?: string | null;
  programaNombre?: string | null;
  vencimientoId?: string | null;   // Referencia al auspicio en módulo Vencimientos
  validadaContraVencimiento: boolean;
  observaciones?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Presentacion {
  private constructor(private props: PresentacionProps) {}

  static create(
    props: Omit<PresentacionProps, 'id' | 'validadaContraVencimiento' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): Presentacion {
    if (props.texto.trim().length < 5) {
      throw new Error('El texto de presentación debe tener al menos 5 caracteres.');
    }
    const now = new Date();
    return new Presentacion({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      validadaContraVencimiento: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PresentacionProps): Presentacion {
    return new Presentacion(props);
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get cunaId(): string { return this.props.cunaId; }
  get texto(): string { return this.props.texto; }
  get duracionSegundos(): number { return this.props.duracionSegundos; }
  get programaId(): string | null { return this.props.programaId ?? null; }
  get vencimientoId(): string | null { return this.props.vencimientoId ?? null; }
  get validadaContraVencimiento(): boolean { return this.props.validadaContraVencimiento; }

  /** Marca la presentación como validada contra el vencimiento correspondiente */
  validarContraVencimiento(vencimientoId: string): void {
    this.props.vencimientoId = vencimientoId;
    this.props.validadaContraVencimiento = true;
    this.props.updatedAt = new Date();
  }

  actualizarTexto(nuevoTexto: string, duracionSegundos?: number): void {
    if (nuevoTexto.trim().length < 5) {
      throw new Error('El texto de presentación debe tener al menos 5 caracteres.');
    }
    this.props.texto = nuevoTexto;
    if (duracionSegundos !== undefined) this.props.duracionSegundos = duracionSegundos;
    this.props.validadaContraVencimiento = false; // Requiere re-validación tras edición
    this.props.updatedAt = new Date();
  }

  toJSON(): PresentacionProps {
    return { ...this.props };
  }
}
