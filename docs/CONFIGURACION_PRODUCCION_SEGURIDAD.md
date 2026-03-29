# 🚀 Guía de Configuración para Producción - Servicios de Seguridad TIER0

## 📋 Descripción General

Esta guía explica cómo configurar los servicios de seguridad en **producción** (OAuth 2.0, JWT, Vault). Durante el desarrollo, los servicios usan **stubs/mocks** que simulan el comportamiento real.

---

## 🔐 1. OAUTH 2.0 + OIDC + JWT

### Opciones de Providers

Puedes usar cualquiera de estos providers:

| Provider | Recomendado Para | Complejidad | Costo |
|----------|------------------|-------------|-------|
| **Auth0** | Empresas, fácil setup | Baja | Gratis hasta 7,000 usuarios |
| **Keycloak** | Self-hosted, control total | Media | Gratis (self-hosted) |
| **Okta** | Grandes empresas | Baja | Desde $2/usuario/mes |
| **AWS Cognito** | Si usas AWS | Media | Pay-as-you-go |

---

### Opción 1: Auth0 (Recomendado)

#### Paso 1: Crear Cuenta en Auth0

1. Ve a [auth0.com](https://auth0.com)
2. Crea una cuenta gratuita
3. Crea un nuevo "Tenant" (ej: `silexar-prod`)

#### Paso 2: Configurar Aplicación

1. En el dashboard, ve a **Applications** → **Create Application**
2. Nombre: "Silexar Pulse"
3. Tipo: **Single Page Application**
4. Click **Create**

#### Paso 3: Obtener Credenciales

Copia estos valores:

```
Domain: silexar-prod.us.auth0.com
Client ID: abc123...
Client Secret: xyz789...
```

#### Paso 4: Configurar Callbacks

En **Application Settings**:

```
Allowed Callback URLs:
https://tudominio.com/callback
http://localhost:3000/callback (para desarrollo)

Allowed Logout URLs:
https://tudominio.com
http://localhost:3000

Allowed Web Origins:
https://tudominio.com
http://localhost:3000
```

#### Paso 5: Configurar en tu Aplicación

Crea archivo `.env.production`:

```env
# Auth0 Configuration
AUTH_MODE=production
OAUTH_PROVIDER=auth0
OAUTH_DOMAIN=https://silexar-prod.us.auth0.com
OAUTH_CLIENT_ID=tu_client_id_aqui
OAUTH_CLIENT_SECRET=tu_client_secret_aqui
OAUTH_REDIRECT_URI=https://tudominio.com/callback
OAUTH_SCOPE=openid profile email

# JWT Configuration
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800
JWT_ALGORITHM=RS256
```

#### Paso 6: Actualizar Código

```typescript
import { AuthenticationService } from './services/AuthenticationService';

const authConfig = {
  mode: 'production' as const,
  oauth: {
    provider: 'auth0' as const,
    clientId: process.env.OAUTH_CLIENT_ID!,
    clientSecret: process.env.OAUTH_CLIENT_SECRET!,
    domain: process.env.OAUTH_DOMAIN!,
    redirectUri: process.env.OAUTH_REDIRECT_URI!,
    scope: process.env.OAUTH_SCOPE!
  },
  jwt: {
    accessTokenExpiry: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY!),
    refreshTokenExpiry: parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY!),
    algorithm: process.env.JWT_ALGORITHM as 'RS256'
  }
};

export const authService = new AuthenticationService(authConfig);
```

---

### Opción 2: Keycloak (Self-Hosted)

#### Paso 1: Instalar Keycloak

**Con Docker**:

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

**Con Kubernetes**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keycloak
spec:
  replicas: 2
  selector:
    matchLabels:
      app: keycloak
  template:
    metadata:
      labels:
        app: keycloak
    spec:
      containers:
      - name: keycloak
        image: quay.io/keycloak/keycloak:latest
        ports:
        - containerPort: 8080
        env:
        - name: KEYCLOAK_ADMIN
          value: admin
        - name: KEYCLOAK_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: keycloak-secret
              key: admin-password
```

#### Paso 2: Configurar Realm

1. Accede a `http://localhost:8080`
2. Login con admin/admin
3. Crea un nuevo Realm: "silexar"

#### Paso 3: Crear Cliente

1. Ve a **Clients** → **Create**
2. Client ID: `silexar-pulse`
3. Client Protocol: `openid-connect`
4. Access Type: `confidential`
5. Valid Redirect URIs: `https://tudominio.com/*`
6. Guarda y copia el **Client Secret**

#### Paso 4: Configurar Variables

```env
AUTH_MODE=production
OAUTH_PROVIDER=keycloak
OAUTH_DOMAIN=https://keycloak.tudominio.com/realms/silexar
OAUTH_CLIENT_ID=silexar-pulse
OAUTH_CLIENT_SECRET=tu_client_secret
OAUTH_REDIRECT_URI=https://tudominio.com/callback
OAUTH_SCOPE=openid profile email
```

---

## 🔐 2. HASHICORP VAULT

### Opción 1: Vault Cloud (Recomendado para Producción)

#### Paso 1: Crear Cuenta HCP Vault

1. Ve a [cloud.hashicorp.com](https://cloud.hashicorp.com)
2. Crea una cuenta
3. Crea un nuevo cluster de Vault

#### Paso 2: Obtener Credenciales

```
Vault Address: https://vault-cluster-public-vault-abc123.hashicorp.cloud:8200
Vault Token: hvs.CAESIJ...
Namespace: admin
```

#### Paso 3: Configurar en Aplicación

```env
# Vault Configuration
VAULT_MODE=production
VAULT_ADDRESS=https://vault-cluster-public-vault-abc123.hashicorp.cloud:8200
VAULT_TOKEN=hvs.CAESIJ...
VAULT_NAMESPACE=admin
VAULT_MOUNT=secret
```

```typescript
import { VaultService } from './services/VaultService';

const vaultConfig = {
  mode: 'production' as const,
  vault: {
    address: process.env.VAULT_ADDRESS!,
    token: process.env.VAULT_TOKEN!,
    namespace: process.env.VAULT_NAMESPACE,
    mount: process.env.VAULT_MOUNT!
  }
};

export const vaultService = new VaultService(vaultConfig);
```

---

### Opción 2: Vault Self-Hosted

#### Paso 1: Instalar Vault

**Con Docker**:

```bash
docker run -d \
  --name vault \
  --cap-add=IPC_LOCK \
  -p 8200:8200 \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' \
  -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' \
  vault:latest
```

**Con Kubernetes**:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: vault
spec:
  serviceName: vault
  replicas: 3
  selector:
    matchLabels:
      app: vault
  template:
    metadata:
      labels:
        app: vault
    spec:
      containers:
      - name: vault
        image: vault:latest
        ports:
        - containerPort: 8200
          name: vault
        - containerPort: 8201
          name: cluster
        env:
        - name: VAULT_ADDR
          value: "http://127.0.0.1:8200"
        - name: VAULT_API_ADDR
          value: "http://$(POD_IP):8200"
        volumeMounts:
        - name: vault-data
          mountPath: /vault/data
  volumeClaimTemplates:
  - metadata:
      name: vault-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

#### Paso 2: Inicializar Vault

```bash
# Inicializar
vault operator init

# Guardar las 5 unseal keys y el root token
# Desbloquear (necesitas 3 de las 5 keys)
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>

# Login
vault login <root_token>
```

#### Paso 3: Habilitar Secrets Engine

```bash
# Habilitar KV v2
vault secrets enable -path=secret kv-v2

# Crear política
vault policy write silexar-policy - <<EOF
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF

# Crear token con la política
vault token create -policy=silexar-policy
```

#### Paso 4: Guardar Secretos

```bash
# Guardar secretos
vault kv put secret/database/password value="super-secret-password"
vault kv put secret/api/openai-key value="sk-..."
vault kv put secret/encryption/master-key value="256-bit-key"

# Leer secreto
vault kv get secret/database/password
```

---

## 🔧 3. CONFIGURACIÓN COMPLETA DE PRODUCCIÓN

### Archivo: `.env.production`

```env
# ========================================
# MODO DE OPERACIÓN
# ========================================
NODE_ENV=production

# ========================================
# AUTENTICACIÓN (Auth0)
# ========================================
AUTH_MODE=production
OAUTH_PROVIDER=auth0
OAUTH_DOMAIN=https://silexar-prod.us.auth0.com
OAUTH_CLIENT_ID=abc123xyz789
OAUTH_CLIENT_SECRET=secret_abc123
OAUTH_REDIRECT_URI=https://app.silexar.com/callback
OAUTH_SCOPE=openid profile email

# JWT
JWT_ACCESS_TOKEN_EXPIRY=3600
JWT_REFRESH_TOKEN_EXPIRY=604800
JWT_ALGORITHM=RS256

# ========================================
# VAULT (HashiCorp)
# ========================================
VAULT_MODE=production
VAULT_ADDRESS=https://vault.silexar.com:8200
VAULT_TOKEN=hvs.CAESIJ...
VAULT_NAMESPACE=admin
VAULT_MOUNT=secret

# ========================================
# BASE DE DATOS
# ========================================
# Obtener desde Vault: secret/database/connection-string
DATABASE_URL=postgresql://...

# ========================================
# REDIS (Cache)
# ========================================
# Obtener desde Vault: secret/redis/password
REDIS_URL=redis://...

# ========================================
# APIS EXTERNAS
# ========================================
# Obtener desde Vault: secret/api/openai-key
OPENAI_API_KEY=sk-...

# Obtener desde Vault: secret/api/stripe-key
STRIPE_SECRET_KEY=sk_live_...

# ========================================
# ENCRIPTACIÓN
# ========================================
# Obtener desde Vault: secret/encryption/master-key
ENCRYPTION_MASTER_KEY=...

# ========================================
# MONITORING
# ========================================
SENTRY_DSN=https://...
DATADOG_API_KEY=...
```

---

## 🚀 4. DEPLOYMENT

### Paso 1: Build para Producción

```bash
# Instalar dependencias
npm install

# Build
npm run build

# Verificar variables de entorno
npm run check:env
```

### Paso 2: Deploy con Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build imagen
docker build -t silexar-pulse:latest .

# Run con variables de entorno
docker run -d \
  --name silexar-pulse \
  -p 3000:3000 \
  --env-file .env.production \
  silexar-pulse:latest
```

### Paso 3: Deploy con Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: silexar-pulse
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
      - name: silexar-pulse
        image: silexar-pulse:latest
        ports:
        - containerPort: 3000
        envFrom:
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
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## 🔒 5. SEGURIDAD EN PRODUCCIÓN

### Checklist de Seguridad

- [ ] **Secrets en Vault**: Todos los secretos en Vault, NO en código
- [ ] **HTTPS Only**: Forzar HTTPS en producción
- [ ] **CORS**: Configurar CORS correctamente
- [ ] **Rate Limiting**: Implementar rate limiting
- [ ] **MFA**: Habilitar MFA para usuarios admin
- [ ] **Audit Logs**: Habilitar logs de auditoría
- [ ] **Backup**: Configurar backups automáticos de Vault
- [ ] **Rotation**: Rotar secretos cada 90 días
- [ ] **Monitoring**: Configurar alertas de seguridad
- [ ] **Firewall**: Configurar firewall/WAF

### Rotación de Secretos

```bash
# Script para rotar secretos cada 90 días
#!/bin/bash

# Generar nuevo secreto
NEW_SECRET=$(openssl rand -base64 32)

# Guardar en Vault
vault kv put secret/database/password value="$NEW_SECRET"

# Actualizar aplicación (rolling update)
kubectl rollout restart deployment/silexar-pulse

# Verificar
kubectl rollout status deployment/silexar-pulse
```

---

## 📊 6. MONITORING Y LOGS

### Configurar Logs

```typescript
import { authService } from './services/AuthenticationService';
import { vaultService } from './services/VaultService';

// Logs de autenticación
authService.subscribe((event) => {
  console.log('[AUTH]', event);
  // Enviar a Datadog/Sentry
});

// Logs de Vault
vaultService.on('secret-accessed', (key) => {
  console.log('[VAULT] Secret accessed:', key);
  // Audit log
});
```

### Métricas Importantes

- Tasa de login exitoso/fallido
- Tiempo de respuesta de OAuth
- Tasa de refresh token
- Accesos a Vault
- Errores de autenticación

---

## 🆘 7. TROUBLESHOOTING

### Problema: "Invalid OAuth token"

**Solución**:
1. Verificar que el `OAUTH_DOMAIN` sea correcto
2. Verificar que el `CLIENT_ID` y `CLIENT_SECRET` sean correctos
3. Verificar que la URL de callback esté en la whitelist

### Problema: "Vault connection refused"

**Solución**:
1. Verificar que Vault esté corriendo: `vault status`
2. Verificar el `VAULT_ADDRESS`
3. Verificar que el token sea válido: `vault token lookup`
4. Verificar firewall/network

### Problema: "JWT verification failed"

**Solución**:
1. Verificar que el algoritmo sea correcto (RS256 vs HS256)
2. Verificar que el token no haya expirado
3. Verificar la clave pública del provider

---

## 📚 8. RECURSOS ADICIONALES

### Documentación Oficial

- [Auth0 Docs](https://auth0.com/docs)
- [Keycloak Docs](https://www.keycloak.org/documentation)
- [Vault Docs](https://www.vaultproject.io/docs)
- [OAuth 2.0 RFC](https://oauth.net/2/)
- [JWT RFC](https://jwt.io/)

### Tutoriales

- [Auth0 Quick Start](https://auth0.com/docs/quickstarts)
- [Vault Getting Started](https://learn.hashicorp.com/vault)
- [OAuth 2.0 Simplified](https://aaronparecki.com/oauth-2-simplified/)

---

**Versión**: 1.0.0  
**Última Actualización**: 2025-11-22  
**Mantenido por**: Equipo TIER0
