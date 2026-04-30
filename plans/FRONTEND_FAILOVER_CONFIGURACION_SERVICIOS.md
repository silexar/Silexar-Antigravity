# Plan de Configuración de Failover - Frontend y Base de Datos

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Database Failover (Supabase ↔ Google Cloud SQL)](#database-failover-supabase--google-cloud-sql)
3. [Frontend Failover (Vercel + Netlify + Cloudflare Pages)](#frontend-failover-vercel--netlify--cloudflare-pages)
4. [Variables de Entorno Requeridas](#variables-de-entorno-requeridas)
5. [Configuración paso a paso](#configuración-paso-a-paso)
6. [Donde ingresar cada configuración en Silexar Pulse](#donde-ingresar-cada-configuración-en-silexar-pulse)

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USUARIOS FINALES                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE CDN (Global Edge)                    │
│                    Latencia: < 50ms globally                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
            │    VERCEL     │ │   NETLIFY     │ │CLOUDFLARE     │
            │   (Primary)   │ │  (Failover 1) │ │  PAGES        │
            │               │ │               │ │(Failover 2)   │
            └───────────────┘ └───────────────┘ └───────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DNS FAILOVER (Cloudflare API)                         │
│                    RTO: < 10 segundos                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BASE DE DATOS                                    │
│                                                                          │
│    ┌─────────────────────┐         ┌─────────────────────┐             │
│    │      SUPABASE       │◄───────►│   GOOGLE CLOUD SQL  │             │
│    │   (Primary Write)   │  Replic  │    (Failover DB)    │             │
│    │                     │          │                     │             │
│    └─────────────────────┘          └─────────────────────┘             │
│                                                                          │
│    RTO: < 30 segundos | RPO: < 5 minutos                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Failover (Supabase ↔ Google Cloud SQL)

### Servicios a Contratar

#### 1. Supabase (Primary Database)
**Plan Recomendado:** Pro Plan o superior
- **Costo:** ~$25/mes (Proyecto Pro)
- **Incluye:**
  - Base de datos PostgreSQL gestionada
  - Auto-scaling hasta 8GB RAM
  - Replicación en lectura
  - Backups automáticos
  - SSL habilitado

**Configuración en Supabase Dashboard:**
1. Ir a https://app.supabase.com
2. Crear proyecto o seleccionar existente
3. Ir a Settings → Database
4. Copiar:
   - `POSTGRES_PASSWORD`
   - `POSTGRES_USER` (通常是 `postgres`)
   - `DB Name`
   - Host: `db.[PROJECT_REF].supabase.co`

#### 2. Google Cloud SQL (Failover Database)
**Plan Recomendado:** Cloud SQL PostgreSQL 2nd Gen
- **Costo:** ~$20-50/mes dependiendo del tamaño
  - Tier: `db-n1-standard-1` (1 vCPU, 3.75GB RAM) mínimo
  - Storage: 10GB SSD
- **Incluye:**
  - Replicación automática
  - Failover automático
  - Backups automáticos
  - Alta disponibilidad

**Configuración en Google Cloud Console:**
1. Ir a https://console.cloud.google.com
2. Crear proyecto o usar existente
3. Ir a SQL → Create instance → PostgreSQL
4. Configurar:
   - Instance ID: `silexar-failover-db`
   - Region: `southamerica-east1` (São Paulo)
   - Zone: `southamerica-east1-a`
   - Machine type: `db-n1-standard-1`
   - Storage: 10GB SSD
   - Enable HA: ✓

5. En Connections:
   - Agregar red autorizada: IP de Supabase
   - Habilitar SSL

**Configuración de Replicación:**
1. En Google Cloud SQL → Instance → Replication
2. Crear replica de lectura
3. Configurar failover:
   - Ir a Cloud SQL → Instance → Failover
   - Habilitar "Automated backups"

### Configuración de Conexión

```
Primary (Supabase):
  Host: db.xxxxx.supabase.co
  Port: 5432
  Database: postgres
  User: postgres
  Password: [SUPABASE_DB_PASSWORD]

Failover (Google Cloud SQL):
  Host: [CLOUD_SQL_PRIVATE_IP]
  Port: 5432
  Database: postgres
  User: postgres
  Password: [GOOGLE_CLOUD_SQL_PASSWORD]
```

### Donde Ingresar en Silexar Pulse

1. **Dashboard de Configuración** → `src/app/configuracion/page.tsx`
2. **Sección "Database Failover"** o crear nueva categoría

**Variables a configurar en el sistema:**
```
# .env.local o sistema de configuración
DATABASE_PRIMARY_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
DATABASE_FAILOVER_URL=postgresql://postgres:[PASSWORD]@[CLOUD_SQL_IP]:5432/postgres
DATABASE_REPLICATION_MODE=async
DATABASE_FAILOVER_THRESHOLD=3
```

---

## Frontend Failover (Vercel + Netlify + Cloudflare Pages)

### Servicios a Contratar

#### 1. Vercel (Primary Deployment)
**Plan Recomendado:** Pro Plan
- **Costo:** $20/mes
- **Incluye:**
  - Edge Network global
  - Auto-scaling ilimitado
  - Preview deployments
  - Analytics básicos
  - SSL automático

**Configuración:**
1. Ir a https://vercel.com
2. Importar proyecto desde GitHub
3. Framework: Next.js
4. Build Command: `npm run build`
5. Output Directory: `.next`
6. Environment Variables: Agregar todas las variables de Next.js

#### 2. Netlify (Failover 1)
**Plan Recomendado:** Pro Plan
- **Costo:** $19/mes
- **Incluye:**
  - CDN global
  - Deploy previews
  - Functions (serverless)
  - Forms
  - Identity

**Configuración:**
1. Ir a https://app.netlify.com
2. "Add new site" → Import from Git
3. Repository: Seleccionar repo de Silexar Pulse
4. Build command: `npm run build`
5. Publish directory: `.next`
6. Ir a Site settings → General → Site information:
   - Netlify site URL: `silexar-pulse-[ID].netlify.app`
   - Custom domain (opcional): `failover1.silexar.cl`

**Obtener Access Token:**
1. Ir a https://app.netlify.com/user/applications
2. Personal access tokens → Create new token
3. Nombre: `silexar-failover-token`
4. Copiar el token

**Obtener Site ID:**
1. Site settings → General → Site information
2. API ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

#### 3. Cloudflare Pages (Failover 2)
**Plan Recomendado:** Pro Plan
- **Costo:** $20/mes
- **Incluye:**
  - 500 builds/min
  - Edge Functions
  - Unlimited bandwidth
  - Analytics avanzados

**Configuración:**
1. Ir a https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages → Create project
3. Connect to Git → Seleccionar repo
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
5. Environment variables: Agregar

**Obtener API Token:**
1. Ir a https://dash.cloudflare.com/profile/api-tokens
2. Create Token → Create Custom Token
3. Permisos necesarios:
   - Account: Cloudflare Pages: Edit
   - Zone: DNS: Edit
4. Account ID: Dashboard → Right sidebar

### DNS Failover Configuration

#### Cloudflare DNS (Control del Failover)
**Plan:** Pro ($20/mes) o Business ($200/mes para failover avanzado)

**Configuración de DNS Failover:**
1. Ir a https://dash.cloudflare.com → DNS → Settings
2. Enable "Proxy status" para el registro principal
3. Configurar Health Checks:
   - Create Health Check
   - Name: `silexar-vercel-health`
   - Endpoint: `https://app.silexar.cl/api/health`
   - Type: HTTPS
   - Interval: 60 seconds
   - Failure threshold: 3

**Registros DNS necesarios:**
```
Type    Name              Content                    Proxy status   TTL
CNAME   app               silexar-pulse.vercel.app   Proxied        Auto
CNAME   failover1         silexar-pulse.netlify.app Proxied        Auto
CNAME   failover2         silexar-pulse.pages.dev   Proxied        Auto
CNAME   vercel-health     silexar-pulse.vercel.app  DNS only       Auto
```

### Configuración de Health Checks

Cada plataforma tiene su propio endpoint de health check que el sistema monitorea:

| Plataforma | URL de Health Check |
|------------|---------------------|
| Vercel | `https://app.silexar.cl/api/health` |
| Netlify | `https://silexar-pulse.netlify.app/api/health` |
| Cloudflare Pages | `https://silexar-pulse.pages.dev/api/health` |

**Respuesta esperada del health check:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## Variables de Entorno Requeridas

### Database Failover
```env
# Supabase (Primary)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...xxx
SUPABASE_DB_PASSWORD=xxxxx
DATABASE_PRIMARY_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Google Cloud SQL (Failover)
GOOGLE_CLOUD_SQL_INSTANCE=silexar-failover-db
GOOGLE_CLOUD_SQL_IP=xxx.xxx.xxx.xxx
GOOGLE_CLOUD_SQL_PASSWORD=xxxxx
DATABASE_FAILOVER_URL=postgresql://postgres:[PASSWORD]@[CLOUD_SQL_IP]:5432/postgres

# Configuración de Failover
DATABASE_FAILOVER_ENABLED=true
DATABASE_FAILOVER_THRESHOLD=3
DATABASE_REPLICATION_MODE=async
DATABASE_HEALTH_CHECK_INTERVAL=30000
```

### Frontend Failover
```env
# Vercel (Primary)
VERCEL_TOKEN=xxxxx
VERCEL_TEAM_ID=team_xxxxx
VERCEL_PROJECT_ID=prj_xxxxx
NEXT_PUBLIC_APP_URL=app.silexar.cl

# Netlify (Failover 1)
NETLIFY_ACCESS_TOKEN=xxxxx
NETLIFY_SITE_ID=xxxxx-xxxxx-xxxxx-xxxxx
NETLIFY_SITE_URL=silexar-pulse-[ID].netlify.app
NETLIFY_TEAM_ID=xxxxx

# Cloudflare Pages (Failover 2)
CLOUDFLARE_API_TOKEN=xxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_PAGES_PROJECT=silexax-pulse
CLOUDFLARE_PAGES_URL=silexar-pulse.pages.dev

# DNS Failover
CLOUDFLARE_ZONE_ID=xxxxx
CLOUDFLARE_ZONE_NAME=silexar.cl
DNS_FAILOVER_RECORD_NAME=app.silexar.cl
FAILOVER_DOMAIN=silexar.cl

# Configuración de Failover
FRONTEND_FAILOVER_ENABLED=true
FRONTEND_HEALTH_CHECK_INTERVAL=30000
FRONTEND_FAILOVER_THRESHOLD=3
FRONTEND_FAILBACK_DELAY=300000
AUTO_FAILOVER_ENABLED=true
AUTO_FAILBACK_ENABLED=true
```

---

## Configuración paso a paso

### Paso 1: Configurar Supabase
1. Crear proyecto en https://app.supabase.com
2. Obtener `PROJECT_REF` del proyecto
3. Configurar password de base de datos
4. Agregar IP de Google Cloud SQL a allowlist (Settings → Database → Connection Pooling → IP Allowlist)
5. Guardar `DB_PASSWORD` y `DB_HOST`

### Paso 2: Configurar Google Cloud SQL
1. Crear instancia en https://console.cloud.google.com/sql
2. Configurar alta disponibilidad
3. Crear usuario `postgres` con password
4. Habilitar conexión privada (VPC)
5. Obtener IP privada de la instancia
6. Configurar replicación desde Supabase

### Paso 3: Configurar Vercel
1. Importar proyecto desde GitHub
2. Configurar variables de entorno
3. Deployar proyecto
4. Obtener `VERCEL_TOKEN` desde https://vercel.com/account/tokens
5. Obtener `TEAM_ID` desde Settings → General
6. Obtener `PROJECT_ID` desde Settings → Projects → [Project] → ID

### Paso 4: Configurar Netlify
1. Crear sitio desde GitHub
2. Configurar build settings
3. Deployar manualmente primero para verificar
4. Obtener `NETLIFY_ACCESS_TOKEN` desde https://app.netlify.com/user/applications
5. Obtener `NETLIFY_SITE_ID` desde Site Settings → General

### Paso 5: Configurar Cloudflare Pages
1. Crear proyecto en Cloudflare Dashboard
2. Conectar GitHub repository
3. Configurar build settings
4. Deployar
5. Obtener `CLOUDFLARE_API_TOKEN` desde https://dash.cloudflare.com/profile/api-tokens
6. Obtener `CLOUDFLARE_ACCOUNT_ID` desde Dashboard right sidebar

### Paso 6: Configurar DNS Failover en Cloudflare
1. Crear health check para cada plataforma
2. Configurar DNS records con proxy
3. Crear regla de failover basada en health checks
4. Configurar notifications de failover

---

## Donde Ingresar Cada Configuración en Silexar Pulse

### 1. Panel de Configuración de Base de Datos
**Ubicación:** `src/app/configuracion/page.tsx` → Categoría "Base de Datos"

**Campos a configurar:**
- `DATABASE_PRIMARY_URL` → URL de Supabase
- `DATABASE_FAILOVER_URL` → URL de Google Cloud SQL
- `DATABASE_FAILOVER_ENABLED` → Toggle boolean

### 2. Panel de Failover de Frontend
**Ubicación:** `src/components/command-center/FrontendFailoverPanel.tsx`

**API de configuración:**
- `POST /api/frontend-failover` con acción `add-deployment`
- Agregar cada deployment con su configuración

### 3. Variables de Entorno Globales
**Ubicación:** `.env.local` o sistema de configuración de hosting

**Proveedores de servicios (Vercel, Netlify, Cloudflare):**
- Ir a Settings → Environment Variables en cada plataforma
- Agregar todas las variables listadas anteriormente

### 4. Panel del Command Center
**Ubicación:** `src/components/command-center/`

- `DatabaseFailoverPanel.tsx` - Panel de estado de failover de DB
- `FrontendFailoverPanel.tsx` - Panel de estado de failover de frontend
- `KillSwitchesPanel.tsx` - Para control manual de failover

### 5. Configuración de Health Checks
**Ubicación:** El sistema realiza health checks automáticamente

**Para configurar thresholds:**
```typescript
// src/lib/failover/health-checker.ts
const healthCheckConfig = {
  interval: 30000,        // 30 segundos
  timeout: 5000,          // 5 segundos
  failureThreshold: 3,    // 3 fallos consecutivos para failover
  retries: 2              // Reintentos antes de marcar como fallido
};
```

---

## Checklist de Configuración

### Database Failover
- [ ] Cuenta de Supabase creada y configurada
- [ ] Instancia de Google Cloud SQL creada con HA
- [ ] IP de Supabase whitelist en Cloud SQL
- [ ] Replicación configurada entre bases de datos
- [ ] Variables de entorno configuradas en Vercel
- [ ] Panel de failover de DB accesible en Command Center

### Frontend Failover
- [ ] Deployment en Vercel verificado y funcional
- [ ] Deployment en Netlify verificado y funcional
- [ ] Deployment en Cloudflare Pages verificado y funcional
- [ ] DNS Failover configurado en Cloudflare
- [ ] Health checks creados para cada plataforma
- [ ] API de failover funcionando
- [ ] Panel de failover de frontend en Command Center

### Monitoreo
- [ ] Dashboard de métricas de failover accesible
- [ ] Alertas configuradas para failover events
- [ ] Notificaciones de email/Slack configuradas
- [ ] Logs de failover visibles en audit log

---

## Costos Mensuales Estimados

### Database Failover
| Servicio | Plan | Costo/Mes |
|----------|------|-----------|
| Supabase | Pro | $25 |
| Google Cloud SQL | n1-standard-1 | $45 |
| **Total DB** | | **$70** |

### Frontend Failover
| Servicio | Plan | Costo/Mes |
|----------|------|-----------|
| Vercel | Pro | $20 |
| Netlify | Pro | $19 |
| Cloudflare Pages | Pro | $20 |
| Cloudflare DNS | Pro | $20 |
| **Total Frontend** | | **$79** |

### Total Failover Infrastructure
| Componente | Costo/Mes |
|------------|-----------|
| Database Failover | $70 |
| Frontend Failover | $79 |
| **TOTAL** | **$149/mes** |

---

## Contacts de Soporte

| Servicio | Soporte |
|----------|---------|
| Supabase | https://supabase.com/support |
| Google Cloud | https://cloud.google.com/support |
| Vercel | https://vercel.com/support |
| Netlify | https://netlify.com/support |
| Cloudflare | https://dash.cloudflare.com/support

---

*Documento creado: 2024-01-15*
*Última actualización: Configuración inicial*
*Versión del sistema: Silexar Pulse v1.0*
