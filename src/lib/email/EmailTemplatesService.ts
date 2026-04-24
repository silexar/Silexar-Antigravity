/**
 * 📧 SILEXAR PULSE - Email Templates Service TIER 0
 * 
 * @description Servicio de plantillas de email profesionales para:
 * - Envío de contratos a clientes
 * - Notificaciones de aprobación
 * - Recordatorios de vencimientos
 * - Estados de cuenta
 * - Alertas de cobranza
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoPlantilla = 
  | 'CONTRATO_NUEVO'
  | 'CONTRATO_APROBADO'
  | 'CONTRATO_RECHAZADO'
  | 'SOLICITUD_FIRMA'
  | 'FIRMA_COMPLETADA'
  | 'RECORDATORIO_VENCIMIENTO'
  | 'RENOVACION_OFERTA'
  | 'FACTURA_EMITIDA'
  | 'RECORDATORIO_PAGO'
  | 'PAGO_RECIBIDO'
  | 'ESTADO_CUENTA'
  | 'COBRANZA_PREVENTIVA'
  | 'COBRANZA_URGENTE'
  | 'BIENVENIDA_CLIENTE'
  | 'RESUMEN_SEMANAL';

export interface DatosPlantilla {
  // Empresa
  empresaNombre?: string;
  empresaLogo?: string;
  empresaDireccion?: string;
  empresaTelefono?: string;
  empresaEmail?: string;
  empresaWeb?: string;
  
  // Destinatario
  destinatarioNombre: string;
  destinatarioEmail: string;
  destinatarioCargo?: string;
  
  // Contrato
  contratoNumero?: string;
  contratoTitulo?: string;
  contratoValor?: number;
  contratoFechaInicio?: Date;
  contratoFechaFin?: Date;
  contratoEstado?: string;
  
  // Facturación
  facturaNumero?: string;
  facturaMonto?: number;
  facturaFechaVencimiento?: Date;
  facturaUrl?: string;
  
  // Cuenta Corriente
  saldoPendiente?: number;
  diasMora?: number;
  
  // URLs
  urlContrato?: string;
  urlFirma?: string;
  urlPago?: string;
  urlPortal?: string;
  
  // Ejecutivo
  ejecutivoNombre?: string;
  ejecutivoEmail?: string;
  ejecutivoTelefono?: string;
  ejecutivoFoto?: string;
  
  // Otros
  mensaje?: string;
  fechaLimite?: Date;
  moneda?: string;
  [key: string]: unknown;
}

export interface PlantillaEmail {
  tipo: TipoPlantilla;
  asunto: string;
  html: string;
  texto: string;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS BASE
// ═══════════════════════════════════════════════════════════════

const ESTILOS = {
  // Colores corporativos
  colores: {
    primario: '#4F46E5',      // Indigo
    secundario: '#7C3AED',    // Violet
    exito: '#10B981',         // Emerald
    alerta: '#F59E0B',        // Amber
    error: '#EF4444',         // Red
    texto: '#1F2937',         // Gray 800
    textoClaro: '#6B7280',    // Gray 500
    fondo: '#F3F4F6',         // Gray 100
    fondoBlanco: '#FFFFFF',
    borde: '#E5E7EB'          // Gray 200
  },
  
  // Fuentes
  fuentes: {
    principal: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    monospace: "'Courier New', Courier, monospace"
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const formatCurrency = (value: number, moneda = 'CLP') => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: moneda, 
    maximumFractionDigits: 0 
  }).format(value);
};

const formatFecha = (fecha: Date | undefined) => {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-CL', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
};

// ═══════════════════════════════════════════════════════════════
// LAYOUT BASE
// ═══════════════════════════════════════════════════════════════

const baseLayout = (contenido: string, datos: DatosPlantilla): string => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Silexar Pulse</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${ESTILOS.colores.fondo}; font-family: ${ESTILOS.fuentes.principal};">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: ${ESTILOS.colores.fondo};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${ESTILOS.colores.fondoBlanco}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${ESTILOS.colores.primario}, ${ESTILOS.colores.secundario}); padding: 32px 40px; text-align: center;">
              ${datos.empresaLogo 
                ? `<img src="${datos.empresaLogo}" alt="${datos.empresaNombre || 'Silexar Pulse'}" style="height: 48px; margin-bottom: 16px;">`
                : `<h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">${datos.empresaNombre || 'Silexar Pulse'}</h1>`
              }
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px;">
              ${contenido}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${ESTILOS.colores.fondo}; padding: 32px 40px; border-top: 1px solid ${ESTILOS.colores.borde};">
              <!-- Ejecutivo de cuenta -->
              ${datos.ejecutivoNombre ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-right: 16px;">
                    ${datos.ejecutivoFoto 
                      ? `<img src="${datos.ejecutivoFoto}" alt="${datos.ejecutivoNombre}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover;">`
                      : `<div style="width: 56px; height: 56px; border-radius: 50%; background: ${ESTILOS.colores.primario}; color: white; font-size: 20px; font-weight: 600; display: flex; align-items: center; justify-content: center;">${datos.ejecutivoNombre.charAt(0)}</div>`
                    }
                  </td>
                  <td>
                    <p style="margin: 0 0 4px; font-weight: 600; color: ${ESTILOS.colores.texto};">${datos.ejecutivoNombre}</p>
                    <p style="margin: 0 0 4px; font-size: 14px; color: ${ESTILOS.colores.textoClaro};">Tu ejecutivo de cuenta</p>
                    ${datos.ejecutivoEmail ? `<a href="mailto:${datos.ejecutivoEmail}" style="font-size: 14px; color: ${ESTILOS.colores.primario}; text-decoration: none;">${datos.ejecutivoEmail}</a>` : ''}
                    ${datos.ejecutivoTelefono ? `<span style="font-size: 14px; color: ${ESTILOS.colores.textoClaro};"> · ${datos.ejecutivoTelefono}</span>` : ''}
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Info empresa -->
              <p style="margin: 0 0 8px; font-size: 12px; color: ${ESTILOS.colores.textoClaro}; text-align: center;">
                ${datos.empresaNombre || 'Silexar Pulse'} ${datos.empresaDireccion ? `· ${datos.empresaDireccion}` : ''}
              </p>
              <p style="margin: 0; font-size: 12px; color: ${ESTILOS.colores.textoClaro}; text-align: center;">
                ${datos.empresaTelefono ? `Tel: ${datos.empresaTelefono}` : ''} 
                ${datos.empresaWeb ? `· <a href="${datos.empresaWeb}" style="color: ${ESTILOS.colores.primario}; text-decoration: none;">${datos.empresaWeb}</a>` : ''}
              </p>
              
              <!-- Legal -->
              <p style="margin: 24px 0 0; font-size: 11px; color: ${ESTILOS.colores.textoClaro}; text-align: center; line-height: 1.5;">
                Este correo es confidencial y está dirigido exclusivamente a ${datos.destinatarioNombre}. 
                Si lo recibiste por error, por favor notifícanos y elimínalo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTES REUTILIZABLES
// ═══════════════════════════════════════════════════════════════

const boton = (texto: string, url: string, color = ESTILOS.colores.primario): string => `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
  <tr>
    <td style="background: linear-gradient(135deg, ${color}, ${color}dd); border-radius: 12px; padding: 16px 32px;">
      <a href="${url}" style="color: white; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block;">
        ${texto}
      </a>
    </td>
  </tr>
</table>
`;

const tarjeta = (titulo: string, valor: string, color = ESTILOS.colores.texto): string => `
<td style="padding: 16px 24px; background-color: ${ESTILOS.colores.fondo}; border-radius: 12px; text-align: center;">
  <p style="margin: 0 0 4px; font-size: 12px; color: ${ESTILOS.colores.textoClaro}; text-transform: uppercase; letter-spacing: 0.5px;">${titulo}</p>
  <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${color};">${valor}</p>
</td>
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _separador = (): string => `
<tr><td style="height: 1px; background-color: ${ESTILOS.colores.borde}; margin: 24px 0;"></td></tr>
`;

const alerta = (mensaje: string, tipo: 'info' | 'warning' | 'error' | 'success' = 'info'): string => {
  const colores = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
    error: { bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
    success: { bg: '#F0FDF4', border: '#22C55E', text: '#166534' }
  };
  const c = colores[tipo];
  return `
  <div style="background-color: ${c.bg}; border-left: 4px solid ${c.border}; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 0; color: ${c.text}; font-size: 14px;">${mensaje}</p>
  </div>
  `;
};

// ═══════════════════════════════════════════════════════════════
// PLANTILLAS ESPECÍFICAS
// ═══════════════════════════════════════════════════════════════

const plantillas: Record<TipoPlantilla, (datos: DatosPlantilla) => { asunto: string; contenido: string }> = {
  
  CONTRATO_NUEVO: (datos) => ({
    asunto: `Nuevo contrato: ${datos.contratoTitulo || datos.contratoNumero}`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        ¡Hola ${datos.destinatarioNombre}! 👋
      </h2>
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px; line-height: 1.6;">
        Nos complace presentarte el nuevo contrato que hemos preparado para ti. 
        Hemos trabajado cuidadosamente en cada detalle para asegurar que cumpla con tus expectativas.
      </p>
      
      <!-- Detalles del contrato -->
      <div style="background: linear-gradient(135deg, ${ESTILOS.colores.fondo}, ${ESTILOS.colores.fondoBlanco}); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; color: ${ESTILOS.colores.primario}; font-size: 18px;">
          📄 ${datos.contratoTitulo || 'Contrato Comercial'}
        </h3>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${ESTILOS.colores.borde};">
              <span style="color: ${ESTILOS.colores.textoClaro};">Número:</span>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid ${ESTILOS.colores.borde}; text-align: right; font-weight: 600;">
              ${datos.contratoNumero}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${ESTILOS.colores.borde};">
              <span style="color: ${ESTILOS.colores.textoClaro};">Vigencia:</span>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid ${ESTILOS.colores.borde}; text-align: right; font-weight: 600;">
              ${formatFecha(datos.contratoFechaInicio)} - ${formatFecha(datos.contratoFechaFin)}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: ${ESTILOS.colores.textoClaro};">Valor Total:</span>
            </td>
            <td style="padding: 8px 0; text-align: right; font-size: 20px; font-weight: 700; color: ${ESTILOS.colores.primario};">
              ${formatCurrency(datos.contratoValor || 0, datos.moneda)}
            </td>
          </tr>
        </table>
      </div>
      
      ${datos.urlContrato ? boton('📋 Ver Contrato Completo', datos.urlContrato) : ''}
      
      <p style="margin: 24px 0 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">
        Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.
      </p>
    `
  }),

  SOLICITUD_FIRMA: (datos) => ({
    asunto: `⏳ Firma requerida: ${datos.contratoNumero}`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Firma Digital Pendiente ✍️
      </h2>
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px; line-height: 1.6;">
        El contrato <strong>${datos.contratoNumero}</strong> está listo y esperando tu firma digital.
        El proceso es simple, seguro y legalmente válido.
      </p>
      
      ${alerta('Este enlace de firma expirará en 7 días. Te recomendamos completar el proceso lo antes posible.', 'warning')}
      
      ${datos.urlFirma ? boton('✍️ Firmar Contrato Ahora', datos.urlFirma, ESTILOS.colores.secundario) : ''}
      
      <div style="margin-top: 24px; padding: 20px; background-color: ${ESTILOS.colores.fondo}; border-radius: 12px;">
        <h4 style="margin: 0 0 12px; color: ${ESTILOS.colores.texto}; font-size: 14px;">¿Cómo funciona la firma digital?</h4>
        <ol style="margin: 0; padding-left: 20px; color: ${ESTILOS.colores.textoClaro}; font-size: 14px; line-height: 1.8;">
          <li>Haz clic en el botón "Firmar Contrato"</li>
          <li>Revisa el documento completo</li>
          <li>Confirma tu identidad con tu email</li>
          <li>Dibuja o escribe tu firma</li>
          <li>¡Listo! Recibirás una copia firmada por email</li>
        </ol>
      </div>
    `
  }),

  FACTURA_EMITIDA: (datos) => ({
    asunto: `Factura ${datos.facturaNumero} - ${formatCurrency(datos.facturaMonto || 0)}`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Nueva Factura Disponible 📄
      </h2>
      
      <div style="background: linear-gradient(135deg, ${ESTILOS.colores.primario}15, ${ESTILOS.colores.secundario}15); border: 2px solid ${ESTILOS.colores.primario}30; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">Monto a Pagar</p>
        <p style="margin: 0 0 16px; color: ${ESTILOS.colores.primario}; font-size: 36px; font-weight: 700;">
          ${formatCurrency(datos.facturaMonto || 0, datos.moneda)}
        </p>
        <p style="margin: 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">
          Vencimiento: <strong style="color: ${ESTILOS.colores.texto};">${formatFecha(datos.facturaFechaVencimiento)}</strong>
        </p>
      </div>
      
      <table role="presentation" cellpadding="0" cellspacing="16" style="width: 100%; margin-bottom: 24px;">
        <tr>
          ${tarjeta('N° Factura', datos.facturaNumero || '-')}
          ${tarjeta('Contrato', datos.contratoNumero || '-')}
        </tr>
      </table>
      
      ${datos.facturaUrl ? boton('📥 Descargar Factura PDF', datos.facturaUrl) : ''}
      ${datos.urlPago ? boton('💳 Pagar Ahora', datos.urlPago, ESTILOS.colores.exito) : ''}
      
      <div style="margin-top: 24px; padding: 20px; background-color: ${ESTILOS.colores.fondo}; border-radius: 12px;">
        <h4 style="margin: 0 0 12px; color: ${ESTILOS.colores.texto}; font-size: 14px;">Datos para Transferencia:</h4>
        <p style="margin: 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px; font-family: ${ESTILOS.fuentes.monospace}; line-height: 1.8;">
          Banco: Banco Estado<br>
          Cuenta Corriente: 123-456789-00<br>
          RUT: 76.XXX.XXX-X<br>
          Razón Social: ${datos.empresaNombre || 'Silexar SpA'}<br>
          Email: pagos@silexar.cl
        </p>
      </div>
    `
  }),

  RECORDATORIO_PAGO: (datos) => ({
    asunto: `⚠️ Recordatorio: Factura ${datos.facturaNumero} vence ${formatFecha(datos.facturaFechaVencimiento)}`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Recordatorio de Pago 🔔
      </h2>
      
      ${alerta(`Tu factura ${datos.facturaNumero} vence ${datos.diasMora && datos.diasMora < 0 ? `en ${Math.abs(datos.diasMora)} días` : 'pronto'}. Te invitamos a regularizar el pago para evitar intereses.`, 'warning')}
      
      <div style="text-align: center; padding: 24px; background-color: ${ESTILOS.colores.fondo}; border-radius: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">Monto Pendiente</p>
        <p style="margin: 0; color: ${ESTILOS.colores.alerta}; font-size: 32px; font-weight: 700;">
          ${formatCurrency(datos.saldoPendiente || datos.facturaMonto || 0)}
        </p>
      </div>
      
      ${datos.urlPago ? boton('💳 Pagar Ahora', datos.urlPago, ESTILOS.colores.exito) : ''}
      
      <p style="margin: 24px 0 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px; text-align: center;">
        Si ya realizaste el pago, por favor ignora este mensaje o envíanos el comprobante para actualizar tu estado de cuenta.
      </p>
    `
  }),

  ESTADO_CUENTA: (datos) => ({
    asunto: `Estado de Cuenta - ${datos.contratoNumero}`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Tu Estado de Cuenta 📊
      </h2>
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px;">
        Adjunto encontrarás el detalle completo de los movimientos de tu cuenta corriente asociada al contrato ${datos.contratoNumero}.
      </p>
      
      <table role="presentation" cellpadding="0" cellspacing="16" style="width: 100%; margin-bottom: 24px;">
        <tr>
          ${tarjeta('Saldo Pendiente', formatCurrency(datos.saldoPendiente || 0), datos.saldoPendiente && datos.saldoPendiente > 0 ? ESTILOS.colores.error : ESTILOS.colores.exito)}
        </tr>
      </table>
      
      ${datos.urlPortal ? boton('📋 Ver Estado de Cuenta Completo', datos.urlPortal) : ''}
      
      <p style="margin: 24px 0 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">
        Este estado de cuenta fue generado automáticamente. Para cualquier consulta, contacta a tu ejecutivo de cuenta.
      </p>
    `
  }),

  CONTRATO_APROBADO: (datos) => ({
    asunto: `✅ Contrato ${datos.contratoNumero} Aprobado`,
    contenido: `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: ${ESTILOS.colores.exito}20; border-radius: 50%; padding: 24px; margin-bottom: 16px;">
          <span style="font-size: 48px;">✅</span>
        </div>
        <h2 style="margin: 0; color: ${ESTILOS.colores.exito}; font-size: 28px;">¡Contrato Aprobado!</h2>
      </div>
      
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px; text-align: center; line-height: 1.6;">
        Excelentes noticias, ${datos.destinatarioNombre}. Tu contrato ha sido aprobado y está listo para continuar al siguiente paso.
      </p>
      
      <div style="background-color: ${ESTILOS.colores.fondo}; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 16px;">Detalle del Contrato</h3>
        <p style="margin: 0 0 8px;"><strong>Contrato:</strong> ${datos.contratoNumero}</p>
        <p style="margin: 0 0 8px;"><strong>Título:</strong> ${datos.contratoTitulo}</p>
        <p style="margin: 0;"><strong>Valor:</strong> ${formatCurrency(datos.contratoValor || 0)}</p>
      </div>
      
      ${datos.mensaje ? `<p style="margin: 0 0 24px; color: ${ESTILOS.colores.texto}; font-size: 14px; padding: 16px; background-color: ${ESTILOS.colores.fondo}; border-radius: 8px;"><strong>Comentario:</strong> ${datos.mensaje}</p>` : ''}
      
      ${datos.urlContrato ? boton('📄 Ver Contrato', datos.urlContrato) : ''}
    `
  }),

  CONTRATO_RECHAZADO: (datos) => ({
    asunto: `❌ Contrato ${datos.contratoNumero} Requiere Modificaciones`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Contrato Requiere Revisión
      </h2>
      
      ${alerta('Tu contrato ha sido revisado y requiere algunas modificaciones antes de poder ser aprobado.', 'warning')}
      
      <div style="background-color: ${ESTILOS.colores.fondo}; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 16px;">Motivo:</h3>
        <p style="margin: 0; color: ${ESTILOS.colores.texto}; font-size: 14px; line-height: 1.6;">
          ${datos.mensaje || 'Se requieren ajustes en el contrato. Por favor contacta a tu ejecutivo para más detalles.'}
        </p>
      </div>
      
      ${datos.urlContrato ? boton('📝 Editar Contrato', datos.urlContrato, ESTILOS.colores.alerta) : ''}
      
      <p style="margin: 24px 0 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">
        Si tienes dudas sobre los cambios requeridos, tu ejecutivo de cuenta está disponible para ayudarte.
      </p>
    `
  }),

  FIRMA_COMPLETADA: (datos) => ({
    asunto: `✍️ Firma completada - ${datos.contratoNumero}`,
    contenido: `
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 64px;">✍️</span>
        <h2 style="margin: 16px 0 0; color: ${ESTILOS.colores.exito}; font-size: 24px;">
          ¡Firma Completada Exitosamente!
        </h2>
      </div>
      
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px; text-align: center;">
        El contrato ${datos.contratoNumero} ha sido firmado digitalmente y es legalmente válido.
      </p>
      
      ${datos.urlContrato ? boton('📥 Descargar Contrato Firmado', datos.urlContrato, ESTILOS.colores.exito) : ''}
    `
  }),

  RECORDATORIO_VENCIMIENTO: (datos) => ({
    asunto: `⏰ Contrato ${datos.contratoNumero} vence pronto`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Tu Contrato Vence Pronto ⏰
      </h2>
      
      ${alerta(`El contrato ${datos.contratoNumero} vence el ${formatFecha(datos.contratoFechaFin)}. Te invitamos a iniciar el proceso de renovación.`, 'warning')}
      
      ${datos.urlContrato ? boton('🔄 Iniciar Renovación', datos.urlContrato) : ''}
    `
  }),

  RENOVACION_OFERTA: (datos) => ({
    asunto: `🎉 Oferta de renovación - ${datos.contratoNumero}`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        ¡Tenemos una Oferta para Ti! 🎉
      </h2>
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px;">
        Gracias por ser nuestro cliente. Hemos preparado condiciones especiales para la renovación de tu contrato.
      </p>
      ${datos.urlContrato ? boton('Ver Oferta de Renovación', datos.urlContrato, ESTILOS.colores.secundario) : ''}
    `
  }),

  PAGO_RECIBIDO: (datos) => ({
    asunto: `✅ Pago recibido - ${formatCurrency(datos.facturaMonto || 0)}`,
    contenido: `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background-color: ${ESTILOS.colores.exito}20; border-radius: 50%; padding: 24px;">
          <span style="font-size: 48px;">💰</span>
        </div>
        <h2 style="margin: 16px 0 0; color: ${ESTILOS.colores.exito}; font-size: 24px;">¡Pago Recibido!</h2>
      </div>
      
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px; text-align: center;">
        Hemos recibido tu pago por ${formatCurrency(datos.facturaMonto || 0)}. ¡Gracias!
      </p>
      
      <table role="presentation" cellpadding="0" cellspacing="16" style="width: 100%;">
        <tr>
          ${tarjeta('Monto', formatCurrency(datos.facturaMonto || 0), ESTILOS.colores.exito)}
          ${tarjeta('Factura', datos.facturaNumero || '-')}
        </tr>
      </table>
    `
  }),

  COBRANZA_PREVENTIVA: (datos) => ({
    asunto: `📋 Aviso: Documentos próximos a vencer`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Aviso de Vencimiento 📋
      </h2>
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px;">
        Te recordamos que tienes documentos próximos a vencer. Regulariza tu situación para mantener tu historial en óptimas condiciones.
      </p>
      ${datos.urlPago ? boton('Ver Estado de Cuenta', datos.urlPago) : ''}
    `
  }),

  COBRANZA_URGENTE: (datos) => ({
    asunto: `🚨 URGENTE: Deuda vencida ${datos.diasMora} días - ${formatCurrency(datos.saldoPendiente || 0)}`,
    contenido: `
      ${alerta(`Tu cuenta presenta una deuda vencida de ${formatCurrency(datos.saldoPendiente || 0)} con ${datos.diasMora} días de mora. Es necesario regularizar a la brevedad.`, 'error')}
      
      <h2 style="margin: 24px 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Acción Requerida 🚨
      </h2>
      
      ${datos.urlPago ? boton('💳 Pagar Ahora', datos.urlPago, ESTILOS.colores.error) : ''}
      
      <p style="margin: 24px 0 0; color: ${ESTILOS.colores.textoClaro}; font-size: 14px;">
        Si ya realizaste el pago o necesitas coordinar un plan de pago, contacta a tu ejecutivo inmediatamente.
      </p>
    `
  }),

  BIENVENIDA_CLIENTE: (datos) => ({
    asunto: `🎉 ¡Bienvenido a ${datos.empresaNombre || 'Silexar Pulse'}!`,
    contenido: `
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="font-size: 64px;">🎉</span>
        <h2 style="margin: 16px 0; color: ${ESTILOS.colores.primario}; font-size: 28px;">
          ¡Bienvenido, ${datos.destinatarioNombre}!
        </h2>
      </div>
      
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px; text-align: center; line-height: 1.6;">
        Estamos emocionados de tenerte como cliente. A partir de ahora, podrás gestionar todos tus contratos desde nuestro portal.
      </p>
      
      ${datos.urlPortal ? boton('🚀 Acceder al Portal', datos.urlPortal) : ''}
    `
  }),

  RESUMEN_SEMANAL: (datos) => ({
    asunto: `📊 Tu resumen semanal de contratos`,
    contenido: `
      <h2 style="margin: 0 0 16px; color: ${ESTILOS.colores.texto}; font-size: 24px;">
        Resumen Semanal 📊
      </h2>
      <p style="margin: 0 0 24px; color: ${ESTILOS.colores.textoClaro}; font-size: 16px;">
        Aquí tienes un resumen de la actividad de tus contratos esta semana.
      </p>
      ${datos.urlPortal ? boton('Ver Dashboard Completo', datos.urlPortal) : ''}
    `
  })
};

// ═══════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

class EmailTemplatesEngine {
  private static instance: EmailTemplatesEngine;
  
  private config = {
    empresaNombre: 'Silexar Pulse',
    empresaLogo: '/logo.png',
    empresaDireccion: 'Santiago, Chile',
    empresaTelefono: '+56 2 2345 6789',
    empresaEmail: 'contacto@silexar.cl',
    empresaWeb: 'https://silexar.cl'
  };

  private constructor() {}

  static getInstance(): EmailTemplatesEngine {
    if (!this.instance) {
      this.instance = new EmailTemplatesEngine();
    }
    return this.instance;
  }

  /**
   * Genera un email a partir de una plantilla
   */
  generar(tipo: TipoPlantilla, datos: DatosPlantilla): PlantillaEmail {
    const datosCompletos = { ...this.config, ...datos };
    const plantilla = plantillas[tipo];
    
    if (!plantilla) {
      throw new Error(`Plantilla no encontrada: ${tipo}`);
    }

    const { asunto, contenido } = plantilla(datosCompletos);
    const html = baseLayout(contenido, datosCompletos);
    
    // Versión texto plano (básica)
    const texto = contenido
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { tipo, asunto, html, texto };
  }

  /**
   * Previsualiza un email (retorna HTML completo)
   */
  previsualizar(tipo: TipoPlantilla, datos: DatosPlantilla): string {
    return this.generar(tipo, datos).html;
  }

  /**
   * Lista todas las plantillas disponibles
   */
  listarPlantillas(): { tipo: TipoPlantilla; descripcion: string }[] {
    return [
      { tipo: 'CONTRATO_NUEVO', descripcion: 'Nuevo contrato creado' },
      { tipo: 'CONTRATO_APROBADO', descripcion: 'Contrato aprobado' },
      { tipo: 'CONTRATO_RECHAZADO', descripcion: 'Contrato requiere modificaciones' },
      { tipo: 'SOLICITUD_FIRMA', descripcion: 'Solicitud de firma digital' },
      { tipo: 'FIRMA_COMPLETADA', descripcion: 'Firma completada' },
      { tipo: 'RECORDATORIO_VENCIMIENTO', descripcion: 'Recordatorio de vencimientos' },
      { tipo: 'RENOVACION_OFERTA', descripcion: 'Oferta de renovación' },
      { tipo: 'FACTURA_EMITIDA', descripcion: 'Factura emitida' },
      { tipo: 'RECORDATORIO_PAGO', descripcion: 'Recordatorio de pago' },
      { tipo: 'PAGO_RECIBIDO', descripcion: 'Confirmación de pago' },
      { tipo: 'ESTADO_CUENTA', descripcion: 'Estado de cuenta' },
      { tipo: 'COBRANZA_PREVENTIVA', descripcion: 'Cobranza preventiva' },
      { tipo: 'COBRANZA_URGENTE', descripcion: 'Cobranza urgente' },
      { tipo: 'BIENVENIDA_CLIENTE', descripcion: 'Bienvenida nuevo cliente' },
      { tipo: 'RESUMEN_SEMANAL', descripcion: 'Resumen semanal' }
    ];
  }

  /**
   * Configura datos de empresa
   */
  configurarEmpresa(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export const EmailTemplates = EmailTemplatesEngine.getInstance();

export function useEmailTemplates() {
  return EmailTemplates;
}

export default EmailTemplates;
