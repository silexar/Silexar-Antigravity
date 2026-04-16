/**
 * ENTITY: MENCIÓN — TIER 0
 *
 * Texto de locución en vivo para un locutor. Asociada a una Cuna padre.
 * Puede ser generada manualmente o por Cortex-Voice (IA).
 */

import { TiempoLocucion } from '../value-objects/TiempoLocucion';

export interface MencionProps {
  id: string;
  tenantId: string;
  cunaId: string;
  texto: string;
  duracionEstimadaSegundos: number;
  generadaPorIA: boolean;
  wpm?: number | null;
  observaciones?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LONGITUD_MINIMA = 10;
const LONGITUD_MAXIMA = 2000;

export class Mencion {
  private constructor(private props: MencionProps) {}

  static create(
    props: Omit<MencionProps, 'id' | 'duracionEstimadaSegundos' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): Mencion {
    Mencion.validarTexto(props.texto);
    const tiempoLocucion = TiempoLocucion.calcularDesdeTexto(props.texto, props.wpm ?? undefined);
    const now = new Date();
    return new Mencion({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      duracionEstimadaSegundos: tiempoLocucion.segundosEstimados,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: MencionProps): Mencion {
    return new Mencion(props);
  }

  private static validarTexto(texto: string): void {
    if (texto.trim().length < LONGITUD_MINIMA) {
      throw new Error(`El texto de mención debe tener al menos ${LONGITUD_MINIMA} caracteres.`);
    }
    if (texto.length > LONGITUD_MAXIMA) {
      throw new Error(`El texto de mención no puede superar ${LONGITUD_MAXIMA} caracteres.`);
    }
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get cunaId(): string { return this.props.cunaId; }
  get texto(): string { return this.props.texto; }
  get duracionEstimadaSegundos(): number { return this.props.duracionEstimadaSegundos; }
  get generadaPorIA(): boolean { return this.props.generadaPorIA; }

  get tiempoLocucion(): TiempoLocucion {
    return TiempoLocucion.fromSegundos(this.props.duracionEstimadaSegundos);
  }

  /** Actualiza el texto y recalcula la duración estimada */
  actualizarTexto(nuevoTexto: string, wpm?: number): void {
    Mencion.validarTexto(nuevoTexto);
    const tiempoLocucion = TiempoLocucion.calcularDesdeTexto(nuevoTexto, wpm);
    this.props.texto = nuevoTexto;
    this.props.duracionEstimadaSegundos = tiempoLocucion.segundosEstimados;
    this.props.updatedAt = new Date();
  }

  /** Valida que el texto no sea demasiado largo para la duración asignada */
  validarLongitud(duracionMaxSegundos: number): boolean {
    return this.props.duracionEstimadaSegundos <= duracionMaxSegundos;
  }

  toJSON(): MencionProps {
    return { ...this.props };
  }
}
