import { z } from "zod";
import { format, isValid, parseISO } from "date-fns";

export class FechaConciliacion {
  private readonly _date: Date;

  private constructor(date: Date) {
    this._date = date;
  }

  public get value(): Date {
    return this._date;
  }

  public formatYYYYMMDD(): string {
    return format(this._date, "yyyyMMdd");
  }
  
  public formatStandard(): string {
    return format(this._date, "dd/MM/yyyy");
  }

  public static create(dateString: string | Date): FechaConciliacion {
    let dateToValidate = dateString;
    
    if (typeof dateString === 'string') {
        dateToValidate = parseISO(dateString);
        if(!isValid(dateToValidate)) {
           dateToValidate = new Date(dateString); // fallback
        }
    }

    const schema = z.date().refine((d) => isValid(d), "La fecha de conciliación no es válida.");
    const validDate = schema.parse(dateToValidate);
    
    return new FechaConciliacion(validDate);
  }

  public equals(other: FechaConciliacion): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._date.getTime() === other.value.getTime();
  }
  
  public isSameDay(other: FechaConciliacion): boolean {
      return this.formatYYYYMMDD() === other.formatYYYYMMDD();
  }
}
