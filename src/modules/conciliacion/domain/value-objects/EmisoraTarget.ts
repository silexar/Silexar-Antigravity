import { z } from "zod";

export class EmisoraTarget {
  private readonly _id: string;
  private readonly _nombre: string;

  private constructor(id: string, nombre: string) {
    this._id = id;
    this._nombre = nombre;
  }

  public get id(): string {
    return this._id;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public static create(id: string, nombre: string): EmisoraTarget {
    const idSchema = z.string().min(1, "El ID de la emisora es requerido");
    const nombreSchema = z.string().min(1, "El nombre de la emisora es requerido");
    
    return new EmisoraTarget(idSchema.parse(id), nombreSchema.parse(nombre));
  }

  public equals(other: EmisoraTarget): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this._id === other.id;
  }
}
