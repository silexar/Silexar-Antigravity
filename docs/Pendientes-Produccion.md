# 📋 Pendientes para Producción - Módulos de Usuarios

> **Estado**: PENDIENTE  
> **Última actualización**: 15 Diciembre 2025  
> **Módulos**: Super Admin, Admin Cliente, Usuario Final, Shadow Admin

---

## 🔴 Críticos (Bloquean producción)

### Backend / Base de Datos

- [ ] **Ejecutar migraciones de base de datos**

  - Archivo: `src/lib/db/users-schema.ts`
  - Acción: Ejecutar `drizzle-kit push`

- [ ] **Configurar conexión PostgreSQL producción**

  - Variable: `DATABASE_URL`
  - Configurar SSL y pooling

- [ ] **Implementar hashing con Argon2**

  - Instalar: `npm install argon2`
  - Archivo: `password-security.ts`

- [ ] **Configurar variables Shadow Admin**
  ```env
  SHADOW_USERNAME_HASH=<generar>
  SHADOW_PASSWORD_HASH=<generar>
  SHADOW_EMERGENCY_CODE=<definir>
  SHADOW_ENCRYPTION_KEY=<generar>
  SHADOW_ALLOWED_IPS=<definir>
  ```

### Autenticación

- [ ] **Implementar JWT real**
- [ ] **Integrar 2FA con TOTP** (`npm install otplib`)
- [ ] **Configurar envío de emails** (SendGrid/Resend)

---

## 🟠 Alta Prioridad

### APIs Backend

- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/logout`
- [ ] `POST /api/auth/refresh`
- [ ] `POST /api/auth/reset-password`
- [ ] `POST /api/auth/verify-2fa`
- [ ] `GET/POST/PUT/DELETE /api/users`
- [ ] `GET/DELETE /api/sessions`
- [ ] `GET/POST/PUT /api/tickets`

### Seguridad

- [ ] **Configurar CORS**
- [ ] **Implementar rate limiting con Redis**
- [ ] **Configurar IP Whitelist Shadow Admin**
- [ ] **Integrar HaveIBeenPwned API**

---

## 🟡 Media Prioridad

### SSO / OAuth

- [ ] **Microsoft Azure AD**

  - Variables: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`

- [ ] **Google Workspace SSO**

  - Variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

- [ ] **SAML empresas**

### Integraciones

- [ ] **Webhooks con cola de mensajes**
- [ ] **Geolocalización por IP**
- [ ] **Almacenamiento S3** (avatares, adjuntos)

---

## 🟢 Baja Prioridad (Post-launch)

- [ ] Multilenguaje (i18n)
- [ ] Dark/light mode toggle
- [ ] Optimizar imágenes
- [ ] Logging centralizado
- [ ] Alertas de seguridad
- [ ] Dashboard métricas

---

## 🧪 Testing Requerido

- [ ] Tests unitarios: Password, Sessions, Rate Limiter
- [ ] Tests integración: Login, 2FA, Password Reset
- [ ] Tests seguridad: SQL Injection, XSS, CSRF
- [ ] Tests E2E: Flujos completos

---

## ⚙️ Variables de Entorno

```env
# Base de Datos
DATABASE_URL=postgresql://user:pass@host:5432/db

# Auth
JWT_SECRET=<256-bits>
JWT_EXPIRES_IN=15m

# Email
SMTP_HOST=smtp.sendgrid.net
EMAIL_FROM=no-reply@silexar.com

# Storage
S3_BUCKET=silexar-pulse-files

# Shadow Admin
SHADOW_USERNAME_HASH=<sha256>
SHADOW_PASSWORD_HASH=<sha512>
SHADOW_EMERGENCY_CODE=EMERGENCY_2025_01
SHADOW_ENCRYPTION_KEY=<64-chars>
SHADOW_ALLOWED_IPS=1.2.3.4

# SSO
AZURE_AD_CLIENT_ID=<id>
GOOGLE_CLIENT_ID=<id>

# App
NEXT_PUBLIC_APP_URL=https://app.silexar.com
NODE_ENV=production
```

---

## ✅ Checklist Pre-Producción

- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] SSL/TLS configurado
- [ ] Backups automatizados
- [ ] Logs configurados
- [ ] Alertas configuradas
- [ ] Tests seguridad pasados
- [ ] Shadow Admin credenciales guardadas físicamente
- [ ] Equipo capacitado

---

> **Responsable**: [Por asignar]  
> **Fecha límite**: [Por definir]
