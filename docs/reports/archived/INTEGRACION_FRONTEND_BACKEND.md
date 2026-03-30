# 🔌 INTEGRACIÓN FRONTEND-BACKEND COMPLETADA

## ✅ Archivos Creados

### 1. Cliente API (`src/lib/api.ts`)
Cliente completo con axios que incluye:
- ✅ Configuración de baseURL (`http://localhost:3000/api/v2`)
- ✅ Interceptors para auth token automático
- ✅ Manejo de errores 401 (redirect a login)
- ✅ APIs completas:
  - **Auth**: register, login, logout, profile, isAuthenticated
  - **Campaigns**: CRUD + activate/pause/analytics/forecast
  - **Cortex**: status, engines, predict, optimize, forecast, analytics
  - **Narratives**: CRUD + validate/activate/executeNode
  - **Health**: check

### 2. Variables de Entorno (`.env`)
```env
VITE_API_URL=http://localhost:3000/api/v2
VITE_APP_NAME=Silexar Pulse
VITE_APP_VERSION=2.0.0
```

### 3. Ejemplos de Uso (`src/lib/api-examples.ts`)
- ✅ Funciones de ejemplo para cada API
- ✅ React Hooks personalizados:
  - `useCampaigns()` - Lista de campañas
  - `useCortexStatus()` - Estado de AI engines

---

## 🚀 CÓMO USAR EN TUS COMPONENTES

### Ejemplo 1: Login Component
```typescript
import { authAPI } from '@/lib/api';

function LoginPage() {
  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await authAPI.login({ email, password });
      console.log('Login successful:', result);
      // Token guardado automáticamente en localStorage
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login form here
  );
}
```

### Ejemplo 2: Campaigns List Component
```typescript
import { useCampaigns } from '@/lib/api-examples';

function CampaignsList() {
  const { campaigns, loading, error } = useCampaigns();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {campaigns.map(campaign => (
        <div key={campaign.id}>
          <h3>{campaign.name}</h3>
          <p>Budget: ${campaign.budget}</p>
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo 3: Create Campaign
```typescript
import { campaignsAPI } from '@/lib/api';

function CreateCampaignForm() {
  const handleSubmit = async (data: any) => {
    try {
      const campaign = await campaignsAPI.create({
        name: data.name,
        clientId: data.clientId,
        advertiserId: data.advertiserId,
        budget: data.budget,
        createdBy: 'current_user_id',
      });
      console.log('Campaign created:', campaign);
      // Redirect or update UI
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  return (
    // Your form here
  );
}
```

### Ejemplo 4: Cortex Status Dashboard
```typescript
import { useCortexStatus } from '@/lib/api-examples';

function CortexDashboard() {
  const { status, loading } = useCortexStatus();

  if (loading) return <div>Loading Cortex status...</div>;

  return (
    <div>
      <h2>Cortex AI Engines</h2>
      <div>
        <h3>Orchestrator</h3>
        <p>Status: {status?.orchestrator?.status}</p>
      </div>
      <div>
        <h3>Prophet</h3>
        <p>Status: {status?.prophet?.status}</p>
      </div>
      <div>
        <h3>Context</h3>
        <p>Status: {status?.context?.status}</p>
      </div>
    </div>
  );
}
```

---

## 🔐 Autenticación

El cliente API maneja automáticamente:
1. **Guardar token**: Después de login/register, el token se guarda en `localStorage`
2. **Enviar token**: En cada request, el token se envía en header `Authorization: Bearer <token>`
3. **Logout automático**: Si el backend responde 401, se limpia el token y redirect a `/login`

### Verificar si está autenticado:
```typescript
import { authAPI } from '@/lib/api';

if (authAPI.isAuthenticated()) {
  // Usuario autenticado
} else {
  // Redirect a login
  window.location.href = '/login';
}
```

---

## 📊 Endpoints Disponibles

### Auth
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login
- `GET /auth/profile` - Obtener perfil (requiere auth)

### Campaigns
- `GET /campaigns` - Listar campañas (paginado)
- `POST /campaigns` - Crear campaña
- `GET /campaigns/:id` - Obtener campaña
- `PUT /campaigns/:id` - Actualizar campaña
- `DELETE /campaigns/:id` - Eliminar campaña
- `POST /campaigns/:id/activate` - Activar campaña
- `POST /campaigns/:id/pause` - Pausar campaña
- `GET /campaigns/:id/analytics` - Analytics de campaña
- `GET /campaigns/:id/forecast` - Forecast de campaña

### Cortex
- `GET /cortex/status` - Estado de AI engines
- `GET /cortex/engines` - Lista de engines
- `POST /cortex/predict` - Predicción
- `POST /cortex/optimize` - Optimización
- `POST /cortex/forecast` - Forecasting
- `GET /cortex/analytics` - Analytics de engines

### Narratives
- `POST /narratives` - Crear narrativa
- `GET /narratives/:id` - Obtener narrativa
- `GET /narratives/campaign/:campaignId` - Narrativas de campaña
- `PUT /narratives/:id` - Actualizar narrativa
- `DELETE /narratives/:id` - Eliminar narrativa
- `POST /narratives/:id/validate` - Validar narrativa
- `POST /narratives/:id/activate` - Activar narrativa
- `POST /narratives/:id/execute/:nodeId` - Ejecutar nodo

---

## 🧪 Probar la Integración

### 1. Iniciar Backend
```bash
cd backend
npm run start:dev
```
Backend corriendo en: http://localhost:3000

### 2. Iniciar Frontend
```bash
npm run dev
```
Frontend corriendo en: http://localhost:5173

### 3. Probar en Browser Console
```javascript
// Importar API (si usas módulos ES6)
import { authAPI, campaignsAPI } from './src/lib/api.ts';

// Registrar usuario
await authAPI.register({
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123'
});

// Listar campañas
const campaigns = await campaignsAPI.list();
console.log(campaigns);
```

---

## ⚠️ IMPORTANTE

### CORS
El backend ya tiene CORS habilitado para `http://localhost:5173` (frontend).

### Variables de Entorno
Asegúrate de que `.env` existe en la raíz del proyecto frontend con:
```env
VITE_API_URL=http://localhost:3000/api/v2
```

### Axios Instalado
```bash
npm install axios
```

---

## 🎉 ¡LISTO!

Tu frontend ahora está completamente integrado con el backend API. Puedes:
- ✅ Autenticar usuarios
- ✅ Gestionar campañas
- ✅ Usar AI engines de Cortex
- ✅ Crear y gestionar narrativas
- ✅ Todo con manejo automático de auth tokens

**Próximo paso**: Implementa tus componentes UI usando el cliente API! 🚀
