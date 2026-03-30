/**
 * VALUE OBJECT: CERTIFICACION VENTA
 * 
 * @description Representa una certificación o habilidad validada de un vendedor.
 */

export class CertificacionVenta {
  private constructor(
    public readonly nombre: string,
    public readonly emisor: string, // Ej: 'HubSpot', 'Salesforce', 'Internal Academy'
    public readonly fechaObtencion: Date,
    public readonly fechaExpiracion?: Date,
    public readonly urlCredencial?: string
  ) {}

  public static create(
    nombre: string,
    emisor: string,
    fechaObtencion: Date,
    fechaExpiracion?: Date,
    urlCredencial?: string
  ): CertificacionVenta {
    if (!nombre) throw new Error("El nombre de la certificación es requerido");
    if (fechaExpiracion && fechaExpiracion < fechaObtencion) {
      throw new Error("La fecha de expiración no puede ser anterior a la de obtención");
    }
    return new CertificacionVenta(nombre, emisor, fechaObtencion, fechaExpiracion, urlCredencial);
  }

  public estaVigente(): boolean {
    if (!this.fechaExpiracion) return true;
    return this.fechaExpiracion > new Date();
  }
}
