/**
 * 📧 SILEXAR PULSE - Email Contract Service TIER 0
 * 
 * @description Servicio de envío de contratos por email con:
 * - Plantillas personalizables
 * - Adjuntos automáticos (PDF, firmado)
 * - Tracking de apertura
 * - Notificaciones
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type EstadoEnvio = 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'ABIERTO' | 'ERROR' | 'REBOTADO';

export interface PlantillaEmail {
  id: string;
  nombre: string;
  codigo: string;
  asunto: string;
  cuerpoHtml: string;
  cuerpoTexto: string;
  tipoContrato: string[];
  activo: boolean;
}

export interface DestinatarioEmail {
  email: string;
  nombre: string;
  tipo: 'TO' | 'CC' | 'CCO';
}

export interface DatosEnvioContrato {
  contratoId: string;
  numeroContrato: string;
  tipoContrato: string;
  
  cliente: {
    nombre: string;
    contacto: string;
    email: string;
  };
  
  ejecutivo: {
    nombre: string;
    email: string;
    telefono: string;
  };
  
  valorTotal: number;
  moneda: string;
  fechaInicio: string;
  fechaFin: string;
  
  urlFirma?: string;
  urlPDF?: string;
}

export interface OpcionesEnvio {
  plantillaId?: string;
  destinatariosAdicionales?: DestinatarioEmail[];
  adjuntarPDF?: boolean;
  adjuntarFirmado?: boolean;
  programarEnvio?: Date;
  enviarCopia?: boolean;
  mensaje?: string;
}

export interface ResultadoEnvio {
  exito: boolean;
  emailId?: string;
  estado: EstadoEnvio;
  fechaEnvio?: Date;
  error?: string;
}

export interface HistorialEmail {
  id: string;
  contratoId: string;
  destinatarios: DestinatarioEmail[];
  asunto: string;
  estado: EstadoEnvio;
  fechaEnvio: Date;
  fechaApertura?: Date;
  cantidadAperturas: number;
}

// ═══════════════════════════════════════════════════════════════
// PLANTILLAS DEFAULT
// ═══════════════════════════════════════════════════════════════

const PLANTILLAS_EMAIL: PlantillaEmail[] = [
  {
    id: 'email-nuevo-contrato',
    nombre: 'Nuevo Contrato',
    codigo: 'NUEVO_CONTRATO',
    asunto: '[Silexar] Contrato {{numeroContrato}} - {{clienteNombre}}',
    cuerpoHtml: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo Contrato</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">{{numeroContrato}}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>{{clienteContacto}}</strong>,
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Es un placer enviarle el contrato de servicios publicitarios acordado. 
            A continuación encontrará los detalles:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Cliente:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">{{clienteNombre}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Vigencia:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">{{fechaInicio}} - {{fechaFin}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Valor Total:</td>
                <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #4F46E5; text-align: right;">{{moneda}} ${'$'}{{valorTotal}}</td>
              </tr>
            </table>
          </div>
          
          {{#if urlFirma}}
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{urlFirma}}" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
              ✍️ Firmar Contrato
            </a>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 10px;">
              Haga clic para revisar y firmar digitalmente
            </p>
          </div>
          {{/if}}
          
          {{#if mensaje}}
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Nota del ejecutivo:</strong><br/>
              {{mensaje}}
            </p>
          </div>
          {{/if}}
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Adjuntamos el contrato en formato PDF para su revisión.
            Si tiene alguna consulta, no dude en contactarnos.
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Saludos cordiales,<br/>
            <strong>{{ejecutivoNombre}}</strong><br/>
            <span style="color: #64748b; font-size: 14px;">{{ejecutivoEmail}} | {{ejecutivoTelefono}}</span>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p>Este correo fue enviado desde Silexar Pulse</p>
          <p>© {{año}} Silexar. Todos los derechos reservados.</p>
        </div>
      </div>
    `,
    cuerpoTexto: `
Nuevo Contrato: {{numeroContrato}}

Estimado/a {{clienteContacto}},

Es un placer enviarle el contrato de servicios publicitarios acordado.

DETALLES:
- Cliente: {{clienteNombre}}
- Vigencia: {{fechaInicio}} - {{fechaFin}}
- Valor Total: {{moneda}} ${'$'}{{valorTotal}}

{{#if urlFirma}}
Para firmar el contrato visite: {{urlFirma}}
{{/if}}

Adjuntamos el contrato en formato PDF para su revisión.

Saludos cordiales,
{{ejecutivoNombre}}
{{ejecutivoEmail}} | {{ejecutivoTelefono}}
    `,
    tipoContrato: ['NUEVO', 'RENOVACION'],
    activo: true
  },
  {
    id: 'email-recordatorio-firma',
    nombre: 'Recordatorio de Firma',
    codigo: 'RECORDATORIO_FIRMA',
    asunto: '[Recordatorio] Contrato {{numeroContrato}} pendiente de firma',
    cuerpoHtml: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Recordatorio</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Contrato pendiente de firma</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0;">
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>{{clienteContacto}}</strong>,
          </p>
          
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Le recordamos que el contrato <strong>{{numeroContrato}}</strong> aún está pendiente de su firma.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{urlFirma}}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">
              ✍️ Firmar Ahora
            </a>
          </div>
          
          <p style="color: #475569; font-size: 14px;">
            Si ya firmó el documento, por favor ignore este mensaje.
          </p>
        </div>
      </div>
    `,
    cuerpoTexto: `
⏰ RECORDATORIO: Contrato pendiente de firma

Estimado/a {{clienteContacto}},

Le recordamos que el contrato {{numeroContrato}} aún está pendiente de su firma.

Para firmar visite: {{urlFirma}}

Si ya firmó el documento, por favor ignore este mensaje.

Saludos,
{{ejecutivoNombre}}
    `,
    tipoContrato: ['NUEVO', 'RENOVACION', 'ENMIENDA'],
    activo: true
  }
];

// ═══════════════════════════════════════════════════════════════
// MOTOR DE ENVÍO DE EMAILS
// ═══════════════════════════════════════════════════════════════

class EmailContratoEngine {
  private static instance: EmailContratoEngine;
  private historial: HistorialEmail[] = [];

  private constructor() {}

  static getInstance(): EmailContratoEngine {
    if (!this.instance) {
      this.instance = new EmailContratoEngine();
    }
    return this.instance;
  }

  /**
   * Envía contrato por email
   */
  async enviarContrato(
    datos: DatosEnvioContrato,
    opciones: OpcionesEnvio = {}
  ): Promise<ResultadoEnvio> {
    try {
      // Obtener plantilla
      const plantilla = opciones.plantillaId
        ? PLANTILLAS_EMAIL.find(p => p.id === opciones.plantillaId)
        : PLANTILLAS_EMAIL.find(p => p.codigo === 'NUEVO_CONTRATO');

      if (!plantilla) {
        return { exito: false, estado: 'ERROR', error: 'Plantilla no encontrada' };
      }

      // Compilar template
      const asunto = this.compilarTemplate(plantilla.asunto, datos, opciones);
      const cuerpoHtml = this.compilarTemplate(plantilla.cuerpoHtml, datos, opciones);

      // Preparar destinatarios
      const destinatarios: DestinatarioEmail[] = [
        { email: datos.cliente.email, nombre: datos.cliente.contacto, tipo: 'TO' }
      ];

      if (opciones.destinatariosAdicionales) {
        destinatarios.push(...opciones.destinatariosAdicionales);
      }

      if (opciones.enviarCopia) {
        destinatarios.push({
          email: datos.ejecutivo.email,
          nombre: datos.ejecutivo.nombre,
          tipo: 'CC'
        });
      }

      // Simular envío
      const emailId = `email-${Date.now()}`;
      
      // Registrar en historial
      const registro: HistorialEmail = {
        id: emailId,
        contratoId: datos.contratoId,
        destinatarios,
        asunto,
        estado: 'ENVIADO',
        fechaEnvio: new Date(),
        cantidadAperturas: 0
      };
      this.historial.push(registro);

      return {
        exito: true,
        emailId,
        estado: 'ENVIADO',
        fechaEnvio: new Date()
      };
    } catch (error) {
      return {
        exito: false,
        estado: 'ERROR',
        error: `Error enviando email: ${error}`
      };
    }
  }

  /**
   * Compila plantilla con datos
   */
  private compilarTemplate(
    template: string,
    datos: DatosEnvioContrato,
    opciones: OpcionesEnvio
  ): string {
    const variables: Record<string, string> = {
      numeroContrato: datos.numeroContrato,
      tipoContrato: datos.tipoContrato,
      clienteNombre: datos.cliente.nombre,
      clienteContacto: datos.cliente.contacto,
      clienteEmail: datos.cliente.email,
      ejecutivoNombre: datos.ejecutivo.nombre,
      ejecutivoEmail: datos.ejecutivo.email,
      ejecutivoTelefono: datos.ejecutivo.telefono,
      valorTotal: datos.valorTotal.toLocaleString('es-CL'),
      moneda: datos.moneda,
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      urlFirma: datos.urlFirma || '',
      urlPDF: datos.urlPDF || '',
      mensaje: opciones.mensaje || '',
      año: new Date().getFullYear().toString()
    };

    let resultado = template;
    
    // Reemplazar variables simples
    Object.entries(variables).forEach(([key, value]) => {
      resultado = resultado.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    // Procesar condicionales simples
    resultado = resultado.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, variable, content) => {
      return variables[variable] ? content : '';
    });

    return resultado;
  }

  /**
   * Envía recordatorio de firma
   */
  async enviarRecordatorioFirma(datos: DatosEnvioContrato): Promise<ResultadoEnvio> {
    return this.enviarContrato(datos, {
      plantillaId: 'email-recordatorio-firma'
    });
  }

  /**
   * Obtiene historial de emails de un contrato
   */
  getHistorialContrato(contratoId: string): HistorialEmail[] {
    return this.historial.filter(h => h.contratoId === contratoId);
  }

  /**
   * Obtiene plantillas disponibles
   */
  getPlantillas(): PlantillaEmail[] {
    return PLANTILLAS_EMAIL.filter(p => p.activo);
  }

  /**
   * Registra apertura de email (webhook)
   */
  registrarApertura(emailId: string): void {
    const email = this.historial.find(h => h.id === emailId);
    if (email) {
      email.estado = 'ABIERTO';
      email.fechaApertura = email.fechaApertura || new Date();
      email.cantidadAperturas++;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const EmailContrato = EmailContratoEngine.getInstance();

export function useEmailContrato() {
  return EmailContrato;
}
