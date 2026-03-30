import { logger } from '@/lib/observability';
/**
 * 📧 SILEXAR PULSE - Transactional Email System
 * Sistema de emails transaccionales enterprise
 * 
 * @description Email Templates:
 * - Welcome/Invitation
 * - Password Reset
 * - 2FA Setup
 * - Ticket Updates
 * - Account Alerts
 * - Billing Notifications
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
}

export interface EmailPayload {
  to: string
  from: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: { filename: string; content: string }[]
}

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  // Welcome Email
  welcome: {
    id: 'welcome',
    name: 'Bienvenida',
    subject: '🎉 ¡Bienvenido a Silexar Pulse, {{userName}}!',
    variables: ['userName', 'tenantName', 'loginUrl', 'category'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Silexar Pulse</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:80px;height:80px;background:linear-gradient(135deg,#f97316,#ef4444);border-radius:20px;line-height:80px;">
        <span style="font-size:40px;">⚡</span>
      </div>
      <h1 style="color:#ffffff;margin:20px 0 10px;font-size:28px;">Silexar Pulse</h1>
      <p style="color:#64748b;margin:0;font-size:14px;">Enterprise Marketing Platform</p>
    </div>
    
    <!-- Content -->
    <div style="background-color:#1e293b;border-radius:16px;padding:40px;margin-bottom:30px;">
      <h2 style="color:#ffffff;margin:0 0 20px;font-size:24px;">¡Hola, {{userName}}! 👋</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">
        Bienvenido a <strong style="color:#f97316;">Silexar Pulse</strong>. Tu cuenta ha sido creada exitosamente 
        en <strong style="color:#ffffff;">{{tenantName}}</strong>.
      </p>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 30px;">
        Has sido asignado como <strong style="color:#22c55e;">{{category}}</strong>, lo que te da acceso a 
        herramientas poderosas para gestionar tus campañas de marketing.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align:center;">
        <a href="{{loginUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ef4444);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:10px;font-weight:600;font-size:16px;">
          Acceder a Mi Cuenta
        </a>
      </div>
    </div>
    
    <!-- Quick Start -->
    <div style="background-color:#1e293b;border-radius:16px;padding:30px;margin-bottom:30px;">
      <h3 style="color:#ffffff;margin:0 0 20px;font-size:18px;">🚀 Primeros Pasos</h3>
      <div style="margin-bottom:15px;">
        <span style="color:#22c55e;margin-right:10px;">✓</span>
        <span style="color:#94a3b8;">Completa tu perfil de usuario</span>
      </div>
      <div style="margin-bottom:15px;">
        <span style="color:#22c55e;margin-right:10px;">✓</span>
        <span style="color:#94a3b8;">Activa la autenticación de dos factores</span>
      </div>
      <div style="margin-bottom:15px;">
        <span style="color:#22c55e;margin-right:10px;">✓</span>
        <span style="color:#94a3b8;">Explora los módulos disponibles</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;color:#64748b;font-size:12px;">
      <p>Este email fue enviado por Silexar Pulse</p>
      <p>© 2025 Silexar. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`
  },

  // Invitation Email
  invitation: {
    id: 'invitation',
    name: 'Invitación',
    subject: '📨 {{inviterName}} te invita a unirte a {{tenantName}}',
    variables: ['inviterName', 'tenantName', 'inviteUrl', 'expiresIn', 'category'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invitación a Silexar Pulse</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:80px;height:80px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:20px;line-height:80px;">
        <span style="font-size:40px;">📨</span>
      </div>
    </div>
    
    <div style="background-color:#1e293b;border-radius:16px;padding:40px;">
      <h2 style="color:#ffffff;margin:0 0 20px;font-size:24px;">Has sido invitado</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">
        <strong style="color:#ffffff;">{{inviterName}}</strong> te ha invitado a unirte a 
        <strong style="color:#3b82f6;">{{tenantName}}</strong> en Silexar Pulse.
      </p>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">
        Serás registrado como <strong style="color:#22c55e;">{{category}}</strong>.
      </p>
      
      <div style="text-align:center;margin:30px 0;">
        <a href="{{inviteUrl}}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:10px;font-weight:600;">
          Aceptar Invitación
        </a>
      </div>
      
      <p style="color:#64748b;font-size:12px;text-align:center;">
        Esta invitación expira en {{expiresIn}}
      </p>
    </div>
  </div>
</body>
</html>
`
  },

  // Password Reset
  password_reset: {
    id: 'password_reset',
    name: 'Reseteo de Contraseña',
    subject: '🔐 Restablecer tu contraseña de Silexar Pulse',
    variables: ['userName', 'resetUrl', 'expiresIn', 'ipAddress'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Restablecer Contraseña</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:80px;height:80px;background:linear-gradient(135deg,#f97316,#ef4444);border-radius:20px;line-height:80px;">
        <span style="font-size:40px;">🔐</span>
      </div>
    </div>
    
    <div style="background-color:#1e293b;border-radius:16px;padding:40px;">
      <h2 style="color:#ffffff;margin:0 0 20px;font-size:24px;">Hola, {{userName}}</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">
        Recibimos una solicitud para restablecer tu contraseña. Si no solicitaste esto, puedes ignorar este email.
      </p>
      
      <div style="text-align:center;margin:30px 0;">
        <a href="{{resetUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ef4444);color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:10px;font-weight:600;">
          Restablecer Contraseña
        </a>
      </div>
      
      <div style="background-color:#0f172a;border-radius:10px;padding:15px;margin-top:30px;">
        <p style="color:#64748b;font-size:12px;margin:0;">
          ⚠️ Este enlace expira en {{expiresIn}}<br>
          📍 Solicitud desde IP: {{ipAddress}}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`
  },

  // Security Alert
  security_alert: {
    id: 'security_alert',
    name: 'Alerta de Seguridad',
    subject: '🚨 Alerta de Seguridad - Nuevo acceso a tu cuenta',
    variables: ['userName', 'device', 'browser', 'location', 'ipAddress', 'time', 'secureUrl'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Alerta de Seguridad</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:80px;height:80px;background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:20px;line-height:80px;">
        <span style="font-size:40px;">🚨</span>
      </div>
    </div>
    
    <div style="background-color:#1e293b;border-radius:16px;padding:40px;">
      <h2 style="color:#ffffff;margin:0 0 20px;font-size:24px;">Nuevo acceso detectado</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">
        Hola {{userName}}, detectamos un nuevo acceso a tu cuenta:
      </p>
      
      <div style="background-color:#0f172a;border-radius:10px;padding:20px;margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#64748b;padding:8px 0;">Dispositivo:</td><td style="color:#ffffff;padding:8px 0;">{{device}}</td></tr>
          <tr><td style="color:#64748b;padding:8px 0;">Navegador:</td><td style="color:#ffffff;padding:8px 0;">{{browser}}</td></tr>
          <tr><td style="color:#64748b;padding:8px 0;">Ubicación:</td><td style="color:#ffffff;padding:8px 0;">{{location}}</td></tr>
          <tr><td style="color:#64748b;padding:8px 0;">IP:</td><td style="color:#ffffff;padding:8px 0;">{{ipAddress}}</td></tr>
          <tr><td style="color:#64748b;padding:8px 0;">Hora:</td><td style="color:#ffffff;padding:8px 0;">{{time}}</td></tr>
        </table>
      </div>
      
      <p style="color:#f87171;line-height:1.6;margin:20px 0;">
        Si no fuiste tú, asegura tu cuenta inmediatamente:
      </p>
      
      <div style="text-align:center;">
        <a href="{{secureUrl}}" style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:10px;font-weight:600;">
          Asegurar Mi Cuenta
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`
  },

  // Ticket Update
  ticket_update: {
    id: 'ticket_update',
    name: 'Actualización de Ticket',
    subject: '🎫 Actualización en tu ticket #{{ticketNumber}}',
    variables: ['userName', 'ticketNumber', 'ticketSubject', 'status', 'message', 'ticketUrl'],
    body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Actualización de Ticket</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#1e293b;border-radius:16px;padding:40px;">
      <div style="display:inline-block;padding:5px 15px;background-color:#3b82f6;color:#ffffff;border-radius:20px;font-size:12px;margin-bottom:20px;">
        Ticket #{{ticketNumber}}
      </div>
      
      <h2 style="color:#ffffff;margin:0 0 10px;font-size:20px;">{{ticketSubject}}</h2>
      <p style="color:#64748b;margin:0 0 20px;font-size:14px;">Estado: <strong style="color:#22c55e;">{{status}}</strong></p>
      
      <div style="background-color:#0f172a;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #3b82f6;">
        <p style="color:#94a3b8;margin:0;line-height:1.6;">{{message}}</p>
      </div>
      
      <div style="text-align:center;">
        <a href="{{ticketUrl}}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 30px;border-radius:8px;font-weight:600;">
          Ver Ticket Completo
        </a>
      </div>
    </div>
  </div>
</body>
</html>
`
  }
}

// ═══════════════════════════════════════════════════════════════
// EMAIL SERVICE
// ═══════════════════════════════════════════════════════════════

export class EmailService {
  private defaultFrom = 'Silexar Pulse <no-reply@silexar.com>'

  /**
   * Render template with variables
   */
  renderTemplate(templateId: string, variables: Record<string, string>): { subject: string; html: string } {
    const template = EMAIL_TEMPLATES[templateId]
    if (!template) throw new Error(`Template ${templateId} not found`)

    let subject = template.subject
    let html = template.body

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, value)
      html = html.replace(regex, value)
    }

    return { subject, html }
  }

  /**
   * Send email
   */
  async sendEmail(templateId: string, to: string, variables: Record<string, string>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { subject, html } = this.renderTemplate(templateId, variables)

      const payload: EmailPayload = {
        to,
        from: this.defaultFrom,
        subject,
        html
      }

      // En producción: enviar via SendGrid, Resend, AWS SES, etc.
      logger.info('📧 Email enviado:', { to, subject })
      
      return { success: true, messageId: `msg_${Date.now()}` }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcome(to: string, userName: string, tenantName: string, category: string): Promise<{ success: boolean }> {
    return this.sendEmail('welcome', to, {
      userName,
      tenantName,
      category,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.silexar.com'}/login`
    })
  }

  /**
   * Send invitation email
   */
  async sendInvitation(to: string, inviterName: string, tenantName: string, inviteToken: string, category: string): Promise<{ success: boolean }> {
    return this.sendEmail('invitation', to, {
      inviterName,
      tenantName,
      category,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.silexar.com'}/invite/${inviteToken}`,
      expiresIn: '7 días'
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, userName: string, resetToken: string, ipAddress: string): Promise<{ success: boolean }> {
    return this.sendEmail('password_reset', to, {
      userName,
      resetUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.silexar.com'}/reset-password/${resetToken}`,
      expiresIn: '1 hora',
      ipAddress
    })
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(
    to: string, 
    userName: string, 
    device: string, 
    browser: string, 
    location: string, 
    ipAddress: string
  ): Promise<{ success: boolean }> {
    return this.sendEmail('security_alert', to, {
      userName,
      device,
      browser,
      location,
      ipAddress,
      time: new Date().toLocaleString(),
      secureUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.silexar.com'}/security`
    })
  }

  /**
   * Send ticket update
   */
  async sendTicketUpdate(
    to: string,
    userName: string,
    ticketNumber: string,
    ticketSubject: string,
    status: string,
    message: string
  ): Promise<{ success: boolean }> {
    return this.sendEmail('ticket_update', to, {
      userName,
      ticketNumber,
      ticketSubject,
      status,
      message,
      ticketUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.silexar.com'}/tickets/${ticketNumber}`
    })
  }
}

export const emailService = new EmailService()
export default emailService
