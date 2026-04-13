# Guía de Deployment - Silexar Pulse Quantum

## Requisitos

### Infraestructura Mínima (Staging)

| Recurso | Especificación |
|---------|----------------|
| CPU | 2 cores |
| RAM | 4 GB |
| Disco | 50 GB SSD |
| PostgreSQL | 15+ |
| Redis | 7+ |
| Node.js | 20+ |

### Infraestructura Recomendada (Producción)

| Recurso | Especificación |
|---------|----------------|
| CPU | 4+ cores |
| RAM | 8+ GB |
| Disco | 100 GB SSD |
| PostgreSQL | 15+ (con replicas) |
| Redis | Cluster 3+ nodos |
| CDN | Vercel Edge / CloudFlare |

## Variables de Entorno

### Variables Obligatorias

```bash
# Aplicación
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.silexarpulse.com
NEXT_PUBLIC_APP_VERSION=2040.6.0

# Base de datos
DATABASE_URL=postgresql://user:password@db-host:5432/silexar_prod

# Redis
REDIS_URL=redis://:password@redis-host:6379/0

# Autenticación
JWT_SECRET=super-secret-minimum-32-characters
AUTH_ALLOWED_ORIGINS=https://app.silexarpulse.com

# Seguridad
SECRET_ENCRYPTION_KEY=64-char-hex-key
```

### Variables Opcionales (Features)

```bash
# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Monitoreo
SENTRY_DSN=https://...
NEXT_PUBLIC_GA_ID=G-...

# Email
SENDGRID_API_KEY=SG...
SMTP_HOST=smtp.sendgrid.net

# Storage
AWS_S3_BUCKET_NAME=silexar-assets
AWS_ACCESS_KEY_ID=...

# IA
OPENAI_API_KEY=sk-...
```

Ver [`.env.example`](../.env.example) para lista completa.

## Deployment en Vercel (Recomendado)

### Paso 1: Configuración Inicial

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link proyecto
vercel link
```

### Paso 2: Configurar Variables de Entorno

```bash
# Desde CLI
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production

# O desde dashboard de Vercel
# Settings > Environment Variables
```

### Paso 3: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Configuración `vercel.json`

```json
{
  "version": 2,
  "regions": ["scl1", "gru1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Deployment con Docker

### Build Local

```bash
# Build imagen
docker build -t silexar-pulse:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  silexar-pulse:latest
```

### Docker Compose (Desarrollo Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/silexar
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=silexar
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
docker-compose up -d
```

### Dockerfile (Producción)

```dockerfile
# Dockerfile.production
FROM node:20-alpine AS base

# Instalar dependencias
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## Deployment en Kubernetes

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: silexar-pulse
```

### ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: silexar-config
  namespace: silexar-pulse
data:
  NEXT_PUBLIC_APP_URL: "https://app.silexarpulse.com"
  NODE_ENV: "production"
```

### Secrets

```bash
# Crear secrets desde CLI
kubectl create secret generic silexar-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=JWT_SECRET='...' \
  --namespace=silexar-pulse
```

### Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: silexar-pulse
  namespace: silexar-pulse
spec:
  replicas: 3
  selector:
    matchLabels:
      app: silexar-pulse
  template:
    metadata:
      labels:
        app: silexar-pulse
    spec:
      containers:
        - name: app
          image: silexar-pulse:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: silexar-config
            - secretRef:
                name: silexar-secrets
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: silexar-pulse-service
  namespace: silexar-pulse
spec:
  selector:
    app: silexar-pulse
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

### Ingress (con HTTPS)

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: silexar-pulse-ingress
  namespace: silexar-pulse
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - app.silexarpulse.com
      secretName: silexar-tls
  rules:
    - host: app.silexarpulse.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: silexar-pulse-service
                port:
                  number: 80
```

### Aplicar Manifiestos

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## Base de Datos

### Migraciones

```bash
# Generar migración
npm run db:generate

# Aplicar migraciones (producción)
DATABASE_URL=postgresql://... npm run db:migrate
```

### Backup Automático

```bash
# Script de backup (agregar a cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > backup_$DATE.sql.gz
# Subir a S3
aws s3 cp backup_$DATE.sql.gz s3://silexar-backups/
```

### Helm Chart

```bash
# Instalar PostgreSQL con Helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --set auth.database=silexar \
  --set auth.username=silexar \
  --set auth.password=secure-password
```

## Monitoreo Post-Deploy

### Health Checks

```bash
# Verificar salud
curl https://app.silexarpulse.com/api/health

# Response esperado
{
  "status": "healthy",
  "version": "2040.6.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Logs

```bash
# Vercel
vercel logs --json

# Kubernetes
kubectl logs -f deployment/silexar-pulse -n silexar-pulse

# Docker
docker logs -f container_name
```

### Métricas Importantes

| Métrica | Threshold | Alerta |
|---------|-----------|--------|
| CPU | > 80% | Warning |
| Memory | > 85% | Critical |
| Response Time | > 500ms | Warning |
| Error Rate | > 1% | Critical |
| DB Connections | > 80% | Warning |

## Rollback

### Vercel

```bash
# Ver deployments
vercel --version

# Promover versión anterior
vercel --prod --target=previous_deployment_url
```

### Kubernetes

```bash
# Rollback deployment
kubectl rollout undo deployment/silexar-pulse -n silexar-pulse

# Ver historial
kubectl rollout history deployment/silexar-pulse -n silexar-pulse
```

### Docker

```bash
# Ejecutar versión anterior
docker run -p 3000:3000 silexar-pulse:previous-tag
```

## Troubleshooting

### Problema: Build Falla

**Síntomas:** Error durante `npm run build`

**Soluciones:**
```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build

# Verificar variables de entorno
cat .env.local | grep -E 'DATABASE_URL|REDIS_URL'

# Type check
npm run check
```

### Problema: Database Connection Error

**Síntomas:** `Error: connect ECONNREFUSED`

**Soluciones:**
```bash
# Verificar conectividad
psql $DATABASE_URL -c "SELECT 1"

# Verificar SSL (producción)
psql "${DATABASE_URL}?sslmode=require" -c "SELECT 1"

# Verificar firewalls
nc -zv db-host 5432
```

### Problema: Redis Connection Timeout

**Síntomas:** Errores de cache/rate limiting

**Soluciones:**
```bash
# Verificar Redis
redis-cli -u $REDIS_URL ping

# Verificar memory usage
redis-cli -u $REDIS_URL INFO memory
```

### Problema: 502 Bad Gateway

**Síntomas:** Vercel/Kubernetes retorna 502

**Soluciones:**
```bash
# Verificar app está corriendo
curl localhost:3000/api/health

# Verificar logs
vercel logs

# Verificar memory limits
# Aumentar en vercel.json o k8s deployment
```

### Problema: Migraciones Fallan

**Síntomas:** Error al aplicar migraciones

**Soluciones:**
```bash
# Verificar estado actual
npm run db:status

# Reset (CUIDADO: borra datos)
# npm run db:reset

# Migración manual
psql $DATABASE_URL -f drizzle/0000_initial.sql
```

### Problema: Assets 404

**Síntomas:** Imágenes/JS no cargan

**Soluciones:**
```bash
# Reconstruir
npm run build

# Verificar public/
ls -la public/

# Verificar next.config.js
# output: 'standalone' para Docker
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Redis accesible
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] Health check respondiendo
- [ ] SSL configurado
- [ ] CDN configurado (opcional)
- [ ] Monitoreo activo
- [ ] Backups configurados
- [ ] Rollback plan documentado

---

## Recursos Adicionales

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Docs](https://kubernetes.io/docs/)

## Soporte

- **Email**: devops@silexarpulse.com
- **Slack**: #deployments
- **Runbook**: https://wiki.silexarpulse.com/runbooks
