/**
 * ENTITY: CIERRE — TIER 0
 *
 * Texto de salida (outro) de auspicio para un programa de radio.
 * Siempre se asocia a una Presentacion complementaria.
 */

export interface CierreProps {
  id: string;
  tenantId: string;
  cunaId: string;
  presentacionId?: string | null;  // Presentación a la que complementa
  texto: string;
  duracionSegundos: number;
  programaId?: string | null;
  programaNombre?: string | null;
  observaciones?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Cierre {
  private constructor(private props: CierreProps) {}

  static create(
    props: Omit<CierreProps, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Cierre {
    if (props.texto.trim().length < 5) {
      throw new Error('El texto de cierre debe tener al menos 5 caracteres.');
    }
    const now = new Date();
    return new Cierre({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CierreProps): Cierre {
    return new Cierre(props);
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get cunaId(): string { return this.props.cunaId; }
  get presentacionId(): string | null { return this.props.presentacionId ?? null; }
  get texto(): string { return this.props.texto; }
  get duracionSegundos(): number { return this.props.duracionSegundos; }

  /** Asocia este cierre a su presentación complementaria */
  asociarConPresentacion(presentacionId: string): void {
    this.props.presentacionId = presentacionId;
    this.props.updatedAt = new Date();
  }

  actualizarTexto(nuevoTexto: string, duracionSegundos?: number): void {
    if (nuevoTexto.trim().length < 5) {
      throw new Error('El texto de cierre debe tener al menos 5 caracteres.');
    }
    this.props.texto = nuevoTexto;
    if (duracionSegundos !== undefined) this.props.duracionSegundos = duracionSegundos;
    this.props.updatedAt = new Date();
  }

  toJSON(): CierreProps {
    return { ...this.props };
  }
}
