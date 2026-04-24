/**
 * VALUE OBJECT: DURACIÓN - TIER 0
 * 
 * Representa la duración de una cuña en segundos y milisegundos.
 * Garantiza valores positivos y convierte entre unidades.
 */

export class Duracion {
  private readonly segundos: number;
  private readonly milisegundos: number;

  private constructor(segundos: number, milisegundos: number) {
    this.segundos = this.validarSegundos(segundos);
    this.milisegundos = this.validarMilisegundos(milisegundos);
  }

  static create(segundos: number, milisegundos: number = 0): Duracion {
    return new Duracion(segundos, milisegundos);
  }

  private validarSegundos(segundos: number): number {
    if (segundos < 0) {
      throw new Error('Los segundos no pueden ser negativos');
    }
    if (!Number.isInteger(segundos)) {
      throw new Error('Los segundos deben ser números enteros');
    }
    return segundos;
  }

  private validarMilisegundos(milisegundos: number): number {
    if (milisegundos < 0) {
      throw new Error('Los milisegundos no pueden ser negativos');
    }
    if (milisegundos >= 1000) {
      throw new Error('Los milisegundos no pueden ser mayores o iguales a 1000');
    }
    if (!Number.isInteger(milisegundos)) {
      throw new Error('Los milisegundos deben ser números enteros');
    }
    return milisegundos;
  }

  getSegundos(): number {
    return this.segundos;
  }

  getMilisegundos(): number {
    return this.milisegundos;
  }

  getTotalMilisegundos(): number {
    return this.segundos * 1000 + this.milisegundos;
  }

  getTotalSegundos(): number {
    return this.segundos + this.milisegundos / 1000;
  }

  /**
   * Formatea la duración en formato MM:SS o HH:MM:SS si es más de una hora
   */
  formatear(): string {
    const totalSegundos = this.getTotalSegundos();
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = Math.floor(totalSegundos % 60);

    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
    
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  /**
   * Formatea la duración en formato HH:MM:SS.MMM
   */
  formatearConMilisegundos(): string {
    const totalSegundos = this.getTotalSegundos();
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = Math.floor(totalSegundos % 60);
    const milisegundos = this.milisegundos;

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
  }

  /**
   * Verifica si la duración es menor a un valor dado
   */
  esMenorQue(otra: Duracion): boolean {
    return this.getTotalMilisegundos() < otra.getTotalMilisegundos();
  }

  /**
   * Verifica si la duración es mayor a un valor dado
   */
  esMayorQue(otra: Duracion): boolean {
    return this.getTotalMilisegundos() > otra.getTotalMilisegundos();
  }

  /**
   * Verifica si la duración es igual a otra
   */
  equals(otra: Duracion): boolean {
    return this.getTotalMilisegundos() === otra.getTotalMilisegundos();
  }

  /**
   * Suma dos duraciones
   */
  sumar(otra: Duracion): Duracion {
    const totalMilisegundos = this.getTotalMilisegundos() + otra.getTotalMilisegundos();
    const segundos = Math.floor(totalMilisegundos / 1000);
    const milisegundos = totalMilisegundos % 1000;
    
    return new Duracion(segundos, milisegundos);
  }

  /**
   * Resta dos duraciones (siempre devuelve una duración positiva)
   */
  restar(otra: Duracion): Duracion {
    const diferenciaMilisegundos = Math.abs(this.getTotalMilisegundos() - otra.getTotalMilisegundos());
    const segundos = Math.floor(diferenciaMilisegundos / 1000);
    const milisegundos = diferenciaMilisegundos % 1000;
    
    return new Duracion(segundos, milisegundos);
  }
}