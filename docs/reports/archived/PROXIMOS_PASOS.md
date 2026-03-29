# 🎯 PRÓXIMOS PASOS - Ejecución Local del Backend

## ✅ Estado Actual
- [x] Backend NestJS completo (4 modules, 26 endpoints)
- [x] Dependencias instaladas (npm install)
- [x] Archivo .env creado
- [x] Scripts de inicio creados

## 🚀 OPCIÓN 1: Inicio Rápido (Recomendado)

### Windows PowerShell
```powershell
cd backend
.\start.ps1
```

Este script automáticamente:
1. ✅ Verifica dependencias
2. ✅ Crea .env si no existe
3. ✅ Compila el backend
4. ✅ Inicia en modo desarrollo

## 🔧 OPCIÓN 2: Paso a Paso Manual

### 1. Verificar Instalación
```powershell
cd backend
npm list --depth=0
```

### 2. Compilar Backend
```powershell
npm run build
```

### 3. Iniciar en Modo Desarrollo
```powershell
npm run start:dev
```

### 4. Verificar que Funciona
Abre tu navegador en:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health/ready

## 📊 Endpoints Disponibles

### Auth (http://localhost:3000/api/v2/auth)
- `POST /register` - Registrar usuario
- `POST /login` - Login
- `GET /profile` - Perfil (requiere JWT)

### Campaigns (http://localhost:3000/api/v2/campaigns)
- `POST /` - Crear campaña
- `GET /` - Listar campañas
- `GET /:id` - Obtener campaña
- `PUT /:id` - Actualizar campaña
- `DELETE /:id` - Eliminar campaña
- `POST /:id/activate` - Activar
- `POST /:id/pause` - Pausar
- `GET /:id/analytics` - Analytics
- `GET /:id/forecast` - Forecast (Cortex-Prophet)

### Cortex (http://localhost:3000/api/v2/cortex)
- `GET /status` - Estado de AI engines
- `GET /engines` - Lista de engines
- `POST /predict` - Predicción
- `POST /optimize` - Optimización (Orchestrator)
- `POST /forecast` - Forecasting (Prophet)
- `GET /analytics` - Analytics de engines

### Narratives (http://localhost:3000/api/v2/narratives)
- `POST /` - Crear narrativa
- `GET /:id` - Obtener narrativa
- `GET /campaign/:campaignId` - Narrativas de campaña
- `PUT /:id` - Actualizar
- `DELETE /:id` - Eliminar
- `POST /:id/validate` - Validar flujo
- `POST /:id/activate` - Activar
- `POST /:id/execute/:nodeId` - Ejecutar nodo

## 🧪 Probar la API

### 1. Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Crear Campaña (con token)
```bash
curl -X POST http://localhost:3000/api/v2/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Campaign",
    "clientId": "client_123",
    "advertiserId": "adv_456",
    "budget": 10000,
    "createdBy": "user_123"
  }'
```

### 4. Obtener Estado de Cortex Engines
```bash
curl -X GET http://localhost:3000/api/v2/cortex/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## ⚠️ IMPORTANTE: Requisitos Previos

### Para Ejecución Local (Sin GCP)
El backend funcionará en modo local sin necesidad de GCP. Los AI engines funcionarán en modo simulado.

### Para Funcionalidad Completa (Con GCP)
Si quieres usar las funcionalidades completas de Cortex-Context (Pub/Sub):

1. **Instalar Google Cloud SDK**
   ```powershell
   # Descargar de: https://cloud.google.com/sdk/docs/install
   ```

2. **Configurar GCP Project**
   ```powershell
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Actualizar .env**
   ```env
   GCP_PROJECT_ID=your-project-id
   GCP_REGION=us-central1
   ```

### Base de Datos (Opcional para Testing)
El backend usa TypeORM en memoria por defecto. Para usar PostgreSQL:

1. **Instalar PostgreSQL**
   ```powershell
   # Descargar de: https://www.postgresql.org/download/windows/
   ```

2. **Crear Base de Datos**
   ```sql
   CREATE DATABASE silexar_pulse;
   ```

3. **Ya está configurado en .env**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=silexar_pulse
   ```

## 🐛 Troubleshooting

### Error: "Cannot find module '@nestjs/common'"
```powershell
cd backend
rm -rf node_modules
npm install
```

### Error: "Port 3000 already in use"
```powershell
# Cambiar puerto en .env
PORT=3001
```

### Error: "Cannot connect to database"
```powershell
# Verificar que PostgreSQL está corriendo
# O comentar TypeORM en app.module.ts para usar modo en memoria
```

## 📈 Siguiente Paso: Conectar Frontend

Una vez que el backend esté corriendo, actualiza el frontend para usar la API:

```typescript
// En tu frontend (src/lib/api.ts)
const API_URL = 'http://localhost:3000/api/v2';

export const api = {
  auth: {
    register: (data) => fetch(`${API_URL}/auth/register`, {...}),
    login: (data) => fetch(`${API_URL}/auth/login`, {...}),
  },
  campaigns: {
    list: () => fetch(`${API_URL}/campaigns`, {...}),
    create: (data) => fetch(`${API_URL}/campaigns`, {...}),
  }
};
```

## 🎉 ¡Listo!

Tu backend TIER0 está corriendo localmente. Ahora puedes:
1. ✅ Probar todos los endpoints en Swagger
2. ✅ Integrar con el frontend
3. ✅ Desarrollar nuevas features
4. ✅ Hacer deploy a GCP cuando estés listo
