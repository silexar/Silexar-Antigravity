/**
 * VALUE OBJECT: DimensionesAsset
 *
 * Encapsula las dimensiones de un activo digital (ancho, alto, aspect ratio)
 * con reglas de validación y helpers de conversión.
 */

import { z } from 'zod';

export const AspectRatioSchema = z.enum(['16:9', '9:16', '1:1', '4:5', '4:3', '3:2', '2:3', '21:9']);
export type AspectRatio = z.infer<typeof AspectRatioSchema>;

interface DimensionesProps {
  ancho: number;
  alto: number;
  aspectRatio: AspectRatio | string;
}

export class DimensionesAsset {
  private constructor(private props: DimensionesProps) {}

  static create(ancho: number, alto: number, aspectRatio?: AspectRatio | string): DimensionesAsset {
    if (ancho <= 0 || alto <= 0) {
      throw new Error('Las dimensiones deben ser mayores a 0');
    }
    const ratio = aspectRatio || DimensionesAsset.calcularAspectRatio(ancho, alto);
    return new DimensionesAsset({ ancho, alto, aspectRatio: ratio });
  }

  static reconstitute(props: DimensionesProps): DimensionesAsset {
    return new DimensionesAsset(props);
  }

  static fromString(anchoStr: string, altoStr: string): DimensionesAsset {
    const ancho = parseInt(anchoStr, 10);
    const alto = parseInt(altoStr, 10);
    if (isNaN(ancho) || isNaN(alto)) {
      throw new Error('Dimensiones inválidas');
    }
    return DimensionesAsset.create(ancho, alto);
  }

  /** Calcula el aspect ratio más cercano a partir de dimensiones reales */
  private static calcularAspectRatio(ancho: number, alto: number): string {
    const ratio = ancho / alto;
    const ratios: { label: string; value: number }[] = [
      { label: '16:9', value: 16 / 9 },
      { label: '9:16', value: 9 / 16 },
      { label: '1:1', value: 1 },
      { label: '4:5', value: 4 / 5 },
      { label: '4:3', value: 4 / 3 },
      { label: '3:2', value: 3 / 2 },
      { label: '2:3', value: 2 / 3 },
      { label: '21:9', value: 21 / 9 },
    ];
    const closest = ratios.reduce((best, r) =>
      Math.abs(r.value - ratio) < Math.abs(best.value - ratio) ? r : best
    );
    return closest.label;
  }

  get ancho(): number { return this.props.ancho; }
  get alto(): number { return this.props.alto; }
  get aspectRatio(): string { return this.props.aspectRatio; }

  /** Área total en píxeles */
  get area(): number {
    return this.props.ancho * this.props.alto;
  }

  /** Es un formato vertical (portrait) */
  esVertical(): boolean {
    return this.props.alto > this.props.ancho;
  }

  /** Es un formato cuadrado */
  esCuadrado(): boolean {
    return this.props.ancho === this.props.alto;
  }

  /** Es un formato horizontal (landscape) */
  esHorizontal(): boolean {
    return this.props.ancho > this.props.alto;
  }

  /** Escala las dimensiones manteniendo el aspect ratio */
  escalar(nuevoAncho: number): DimensionesAsset {
    const factor = nuevoAncho / this.props.ancho;
    const nuevoAlto = Math.round(this.props.alto * factor);
    return DimensionesAsset.create(nuevoAncho, nuevoAlto, this.props.aspectRatio);
  }

  /** Verifica si las dimensiones coinciden con las de este asset */
  coincide(ancho: number, alto: number, tolerancia: number = 0): boolean {
    return (
      Math.abs(this.props.ancho - ancho) <= tolerancia &&
      Math.abs(this.props.alto - alto) <= tolerancia
    );
  }

  toString(): string {
    return `${this.props.ancho}x${this.props.alto}`;
  }

  toJSON(): DimensionesProps {
    return { ...this.props };
  }
}
