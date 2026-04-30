# Módulo Configuración - Testing y QA

> **Versión:** 1.0.0  
> **Fecha:** 2026-04-27

---

## 📋 RESUMEN DE TESTING

| Tipo de Testing | Cobertura | Estado |
|-----------------|-----------|--------|
| Unit Tests | Core business logic | ⏳ Pendiente |
| Integration Tests | API endpoints | ⏳ Pendiente |
| E2E Tests | User flows | ⏳ Pendiente |
| Security Tests | OWASP Top 10 | ⏳ Pendiente |
| Load Tests | Performance | ⏳ Pendiente |
| Penetration Tests | Red team | ⏳ Pendiente |

---

## 🧪 5.1.1 Unit Tests

### Módulos que requieren tests

```typescript
// src/modules/configuracion/__tests__/
```

### Cobertura mínima requerida: 80%

| Módulo | Entidades a testear |
|--------|---------------------|
| **Usuarios** | User creation, validation, password hashing |
| **Roles** | Role creation, permission assignment |
| **Permisos** | Permission matrix, checkPermission() |
| **Políticas** | Rule evaluation, conditions, actions |
| **SSO** | Provider configuration, connection test |
| **Feature Flags** | Flag evaluation, targeting rules |
| **Kill Switches** | Activation, deactivation, scope |

### Ejemplo de Test

```typescript
// src/modules/configuracion/__tests__/politica.test.ts
import { describe, it, expect } from 'vitest';
import { RuleEngine } from '../../application/RuleEngine';
import { PoliticaNegocio } from '../../domain/entities/PoliticaNegocio';

describe('RuleEngine', () => {
  describe('evaluateRules', () => {
    it('should return APPROVED when no rules match', async () => {
      const engine = new RuleEngine();
      const result = await engine.evaluateRules(
        { amount: 100, customerTier: 'GOLD' },
        []
      );
      
      expect(result.aplicadas).toHaveLength(0);
      expect(result.resultado).toBe('APROBADO');
    });

    it('should apply matching rules in priority order', async () => {
      const engine = new RuleEngine();
      const rules = [
        PoliticaNegocio.create({
          nombre: 'High Value Approval',
          tipo: 'VALIDACION',
          prioridad: 'ALTA',
          condiciones: {
            operador: 'AND',
            reglas: [{
              campo: 'amount',
              operador: 'gt',
              valor: 10000
            }]
          },
          acciones: [{
            tipo: 'APROBAR',
            parametros: {}
          }],
          estado: 'ACTIVA'
        });
      ];

      const result = await engine.evaluateRules(
        { amount: 15000 },
        rules
      );

      expect(result.aplicadas).toHaveLength(1);
      expect(result.resultado).toBe('APROBADO');
    });

    it('should reject when REJECT action is triggered', async () => {
      const engine = new RuleEngine();
      const rules = [
        PoliticaNegocio.create({
          nombre: 'Block Suspicious',
          tipo: 'VALIDACION',
          prioridad: 'CRITICA',
          condiciones: {
            operador: 'AND',
            reglas: [{
              campo: 'isSuspicious',
              operador: 'eq',
              valor: true
            }]
          },
          acciones: [{
            tipo: 'RECHAZAR',
            parametros: { razon: 'Actividad sospechosa' }
          }],
          estado: 'ACTIVA'
        });
      ];

      const result = await engine.evaluateRules(
        { amount: 5000, isSuspicious: true },
        rules
      );

      expect(result.resultado).toBe('RECHAZADO');
      expect(result.detalle[0].accionesEjecutadas).toContain('RECHAZAR');
    });
  });
});
```

### Scripts de test

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar con coverage
npm run test:coverage

# Ejecutar tests específicos
npm run test -- --grep "Policy"
```

---

## 🔗 5.1.2 Integration Tests

### API Endpoints a testear

```typescript
// src/app/__tests__/api/
```

### Checklist de Integration Tests

```
INTEGRATION TESTS CHECKLIST:
├── [ ] GET /api/usuarios - Lista usuarios
├── [ ] POST /api/usuarios - Crea usuario
├── [ ] GET /api/usuarios/[id] - Obtiene usuario
├── [ ] PUT /api/usuarios/[id] - Actualiza usuario
├── [ ] DELETE /api/usuarios/[id] - Elimina usuario
├── [ ] GET /api/roles - Lista roles
├── [ ] POST /api/roles - Crea rol
├── [ ] GET /api/roles/[id]/permisos - Obtiene permisos
├── [ ] POST /api/politicas - Crea política
├── [ ] POST /api/politicas/evaluar - Evalúa políticas
├── [ ] GET /api/cortex - Obtiene dashboard
├── [ ] POST /api/sso - Configura SSO
├── [ ] GET /api/health - Health check
├── [ ] POST /api/feature-flags - Crea feature flag
├── [ ] POST /api/kill-switches - Activa kill switch
└── [ ] POST /api/encryption/encrypt - Encripta datos
```

### Ejemplo de Integration Test

```typescript
// src/app/__tests__/api/usuarios.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';

describe('Users API Integration', () => {
  const request = supertest(BASE_URL);
  
  let authToken: string;
  
  beforeAll(async () => {
    // Login y obtener token
    const loginRes = await request
      .post('/api/auth/login')
      .send({
        email: process.env.TEST_ADMIN_EMAIL,
        password: process.env.TEST_ADMIN_PASSWORD
      });
    
    authToken = loginRes.body.data.token;
  });

  describe('GET /api/usuarios', () => {
    it('should return users for valid tenant', async () => {
      const res = await request
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Tenant-ID', 'test-tenant-id');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject without tenant header', async () => {
      const res = await request
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });
  });
});
```

---

## 🔒 5.1.3 Security Testing

### OWASP Top 10 Testing

| # | Categoría | Prueba |
|---|-----------|--------|
| A01 | Broken Access Control | Tests de autorización entre tenants |
| A02 | Cryptographic Failures | Verificar datos sensibles encriptados |
| A03 | Injection | Tests de SQL/NoSQL injection |
| A04 | Insecure Design | Threat model review |
| A05 | Security Misconfiguration | Scan de headers de seguridad |
| A06 | Vulnerable Components | Dependency check |
| A07 | Auth Failures | Tests de MFA, brute force protection |
| A08 | Data Integrity Failures | Verificar integridad de datos |
| A09 | Logging Failures | Verificar audit logs |
| A10 | SSRF | Tests de server-side request forgery |

### Security Test Commands

```bash
# Dependency vulnerability scan
npm audit

# Security headers check
npx security-checker

# OWASP ZAP scan (requiere ZAP instalado)
./scripts/security/owasp-zap-scan.sh

# Secrets detection
git clone https://github.com/awslabs/git-secrets.git
git secrets --scan -r ./src
```

---

## 📈 5.1.4 Load Testing

### Configuración de k6

```javascript
// k6/configuracion-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Steady state
    { duration: '2m', target: 200 },   // Stress test
    { duration: '5m', target: 200 },    // Steady state
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'],  // 99% bajo 500ms
    http_req_failed: ['rate<0.01'],      // <1% errors
  },
};

const BASE_URL = 'https://api.silexar.com';

export default function () {
  // Test: List users
  const res = http.get(`${BASE_URL}/api/usuarios`, {
    headers: {
      'Authorization': `Bearer ${__ENV.TOKEN}`,
      'X-Tenant-ID': __ENV.TENANT_ID,
    },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has data': (r) => JSON.parse(r.body).success === true,
  });

  sleep(1);
}
```

### Run Load Test

```bash
# Instalar k6 si no está
brew install k6

# Ejecutar test
k6 run k6/configuracion-load-test.js \
  -e TOKEN=$ADMIN_TOKEN \
  -e TENANT_ID=$TENANT_ID
```

### Métricas a verificar

| Métrica | Target | Umbral de Alerta |
|---------|--------|------------------|
| p99 Latency | <500ms | >1000ms |
| p95 Latency | <300ms | >750ms |
| Error Rate | <0.1% | >1% |
| Throughput | >100 RPS | <50 RPS |
| CPU Usage | <70% | >85% |
| Memory Usage | <80% | >90% |

---

## 🛡️ 5.1.5 Penetration Testing

### Alcance del Pentest

```
PENTEST SCOPE:
├── API Endpoints (14 módulos)
├── Authentication flow
├── SSO Integration (if enabled)
├── Database (through API only)
├── Admin interfaces
└── Report generation
```

### Herramientas recomendadas

| Herramienta | Uso |
|------------|-----|
| Burp Suite Pro | Web vulnerability scanner |
| SQLMap | SQL injection detection |
| Nuclei | Vulnerability templates |
| OWASP ZAP | Automated security testing |
| Metasploit | Exploitation framework |
| Hydra | Brute force testing |

### Checklist de Pentest

```
PENTEST CHECKLIST:
├── [ ] Information gathering
├── [ ] Threat modeling
├── [ ] Vulnerability analysis
├── [ ] Exploitation
├── [ ] Post-exploitation
├── [ ] Reporting
└── [ ] Remediation verification
```

---

## ✅ 5.1.6 User Acceptance Testing (UAT)

### Usuarios Clave para UAT

| Rol | Cantidad | Funcionalidades a probar |
|-----|----------|--------------------------|
| Super Admin | 2 | Todas las funcionalidades |
| Admin Cliente | 3 | Gestión de usuarios y roles de su tenant |
| Usuario | 5 | Uso de políticas y feature flags |

### UAT Scripts

```
UAT SCRIPT 1: Creación de Usuario
1. Admin hace login
2. Ir a Gestión de Usuarios
3. Crear nuevo usuario con rol USUARIO
4. Verificar email de bienvenida recibido
5. Usuario hace login con password temporal
6. Verificar que debe cambiar password

UAT SCRIPT 2: Configuración de Política
1. Admin hace login
2. Ir a Políticas de Negocio
3. Crear política con condición: amount > 10000
4. Crear acción: REQUERIR_APROBACION
5. Crear contrato con amount = 15000
6. Verificar que requiere aprobación

UAT SCRIPT 3: Feature Flag
1. Admin hace login
2. Ir a Feature Flags
3. Crear flag "NEW_DASHBOARD_V2"
4. Habilitar para 10% de usuarios
5. Verificar que algunos ven el nuevo dashboard
```

---

## 🔄 5.1.7 Rollback Procedures Testing

### Test de Rollback

```bash
# 1. Deploy versión actual
./scripts/deploy.sh v1.0.0

# 2. Hacer cambios de prueba
# (Crear/modificar configuraciones)

# 3. Verificar estado
curl https://api.silexar.com/api/health

# 4. Ejecutar rollback
./scripts/rollback.sh v1.0.0

# 5. Verificar que rollback funcionó
curl https://api.silexar.com/api/health

# 6. Verificar que datos están恢复
curl https://api.silexar.com/api/usuarios
```

---

## 💾 5.1.8 Disaster Recovery Testing

### DR Test Checklist

```
DISASTER RECOVERY TEST:
├── [ ] Backup de base de datos completado
├── [ ] Backup de archivos de configuración completado
├── [ ] Restore en environment de staging probado
├── [ ] Tiempo de restore documentado
├── [ ] Integridad de datos verificada post-restore
└── [ ] Team conoce procedures de DR
```

---

## 📊 Resumen de Testing

| Actividad | Estado | Notas |
|-----------|--------|-------|
| Unit Tests | ⏳ Pendiente | ~80% coverage target |
| Integration Tests | ⏳ Pendiente | 14+ endpoints |
| Security Tests | ⏳ Pendiente | OWASP Top 10 |
| Load Tests | ⏳ Pendiente | k6 scripts ready |
| Penetration Tests | ⏳ Pendiente | External team required |
| UAT | ⏳ Pendiente | 10 usuarios clave |
| Rollback Test | ⏳ Pendiente | Documentado |
| DR Test | ⏳ Pendiente | Trimestral |

---

*Documento de Testing - Actualizar con resultados reales*
