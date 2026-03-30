import { z } from "zod";

export class HorarioEmision {
  private readonly _timeString: string; // HH:mm:ss

  private constructor(timeString: string) {
    this._timeString = timeString;
  }

  public get value(): string {
    return this._timeString;
  }

  public get hours(): number {
    return parseInt(this._timeString.split(':')[0], 10);
  }
  
  public get minutes(): number {
    return parseInt(this._timeString.split(':')[1], 10);
  }
  
  public get seconds(): number {
    return parseInt(this._timeString.split(':')[2], 10);
  }

  public static create(timeString: string): HorarioEmision {
    // Expected format: HH:mm:ss
    const schema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "El horario debe tener el formato HH:mm:ss");
    const validValue = schema.parse(timeString);
    
    return new HorarioEmision(validValue);
  }

  public equals(other: HorarioEmision): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._timeString === other.value;
  }

  // Diferencia en segundos con otro horario
  public diffInSeconds(other: HorarioEmision): number {
    const thisSeconds = (this.hours * 3600) + (this.minutes * 60) + this.seconds;
    const otherSeconds = (other.hours * 3600) + (other.minutes * 60) + other.seconds;
    return Math.abs(thisSeconds - otherSeconds);
  }
}
