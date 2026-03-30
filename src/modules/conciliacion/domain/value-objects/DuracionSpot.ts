import { z } from "zod";

export class DuracionSpot {
  private readonly _seconds: number;

  private constructor(seconds: number) {
    this._seconds = seconds;
  }

  public get value(): number {
    return this._seconds;
  }

  public get label(): string {
      return `${this._seconds}s`;
  }

  public static create(seconds: number | string): DuracionSpot {
    let secsToValidate = seconds;
    if (typeof seconds === 'string') {
        const parsed = parseInt(seconds.replace(/[^0-9]/g, ''), 10);
        if(!isNaN(parsed)){
            secsToValidate = parsed;
        }
    }

    // Spots radales tipicos: de 5 a 120 segundos
    const schema = z.number().min(5, "La duración mínima esperada es 5 segundos").max(180, "La duración máxima esperada es 180 segundos");
    const validValue = schema.parse(secsToValidate);
    
    return new DuracionSpot(validValue);
  }

  public equals(other: DuracionSpot): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._seconds === other.value;
  }
}
