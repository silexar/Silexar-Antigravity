/**
 * 💎 VALUE OBJECT: TiempoEmision
 * 
 * Representa un punto exacto en el tiempo de emisión con precisión de milisegundos.
 * Fundamental para la auditoría legal.
 * 
 * @tier TIER_0_ENTERPRISE
 */

export class TiempoEmision {
  private readonly date: Date;

  private constructor(date: Date) {
    if (isNaN(date.getTime())) {
      throw new Error("Fecha de emisión inválida.");
    }
    this.date = date;
  }

  public static now(): TiempoEmision {
    return new TiempoEmision(new Date());
  }

  public static fromDate(date: Date): TiempoEmision {
    return new TiempoEmision(date);
  }

  public static fromString(isoString: string): TiempoEmision {
    return new TiempoEmision(new Date(isoString));
  }

  public toValue(): Date {
    return new Date(this.date.getTime()); // Return copy for immutability
  }

  public toISOString(): string {
    return this.date.toISOString();
  }

  public formatHumanReadable(): string {
    // Simplificado para evitar problemas de compatibilidad con opciones de Intl
    return this.date.toLocaleString('es-CL');
  }

  public isAfter(other: TiempoEmision): boolean {
    return this.date.getTime() > other.date.getTime();
  }

  public differenceInSeconds(other: TiempoEmision): number {
    return Math.abs((this.date.getTime() - other.date.getTime()) / 1000);
  }
}
