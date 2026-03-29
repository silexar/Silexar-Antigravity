/**
 * ENTIDAD CONVERSACION WHATSAPP - TIER 0 ENTERPRISE
 *
 * @description Representa una conversación de ventas vía WhatsApp Business API.
 * Permite análisis de sentimiento y tracking de keywords comerciales.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface MensajeWhatsApp {
  id: string;
  remitente: 'VENDEDOR' | 'CLIENTE' | 'BOT';
  contenido: string;
  timestamp: Date;
  leido: boolean;
  sentimiento?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO';
}

export interface ConversacionWhatsAppProps {
  id: string;
  vendedorId: string;
  clienteTelefono: string; // E.164 format
  clienteNombre?: string;
  dealId?: string; // Relación opcional con un Deal activo
  mensajes: MensajeWhatsApp[];
  ultimoMensaje?: Date;
  estado: 'ACTIVA' | 'ARCHIVADA' | 'BLOQUEADA';
  etiquetas: string[]; // Ej: 'INTERESADO', 'PRECIO', 'QUEJA'
  resumenIA?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class ConversacionWhatsApp {
  private constructor(private props: ConversacionWhatsAppProps) {
    this.validate();
  }

  public static create(
    props: Omit<ConversacionWhatsAppProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'mensajes' | 'estado'>
  ): ConversacionWhatsApp {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new ConversacionWhatsApp({
      ...props,
      id,
      mensajes: [],
      estado: 'ACTIVA',
      etiquetas: props.etiquetas || [],
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: ConversacionWhatsAppProps): ConversacionWhatsApp {
    return new ConversacionWhatsApp(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('Vendedor requerido');
    if (!this.props.clienteTelefono) throw new Error('Teléfono cliente requerido');
  }

  // Business Logic
  public agregarMensaje(contenido: string, remitente: 'VENDEDOR' | 'CLIENTE' | 'BOT', sentimiento?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO'): void {
      const mensaje: MensajeWhatsApp = {
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4(),
          remitente,
          contenido,
          timestamp: new Date(),
          leido: false,
          sentimiento
      };
      
      this.props.mensajes.push(mensaje);
      this.props.ultimoMensaje = mensaje.timestamp;
      this.props.fechaActualizacion = new Date();
  }

  public marcarLeidos(): void {
      this.props.mensajes.forEach(m => {
          if (m.remitente === 'CLIENTE') m.leido = true;
      });
      this.props.fechaActualizacion = new Date();
  }

  public asociarDeal(dealId: string): void {
      this.props.dealId = dealId;
      this.props.fechaActualizacion = new Date();
  }

  public actualizarResumenIA(resumen: string): void {
      this.props.resumenIA = resumen;
      this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): ConversacionWhatsAppProps {
    return { ...this.props };
  }
}
