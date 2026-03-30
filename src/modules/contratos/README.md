# Módulo de Contratos - TIER 0 Enterprise System

## 🏢 Descripción General

El Módulo de Contratos es el corazón comercial y operativo de Silexar Pulse, diseñado como un sistema empresarial de clase mundial para Fortune 10. Funciona como el sistema nervioso central que transforma oportunidades de venta en acuerdos ejecutables, gestionando todo el ciclo desde la cotización inicial hasta la facturación final, con inteligencia artificial que optimiza, valida y automatiza cada paso del proceso.

## 🎯 Características Principales

### ✨ Funcionalidades Core
- **Gestión Completa del Ciclo de Vida**: Desde borrador hasta finalización
- **Workflows Automatizados**: Flujos de aprobación multinivel inteligentes
- **Validación de Inventario en Tiempo Real**: Integración con WideOrbit, Sara y Dalet
- **Análisis de Riesgo Crediticio**: Integración con Cortex-Risk
- **Predicciones IA**: Análisis predictivo con Cortex-Flow
- **Firma Digital**: Integración con DocuSign y Adobe Sign
- **Facturación Automática**: Generación automática de planes de facturación

### 🔒 Seguridad Tier 0
- **Encriptación Cuántica**: Resistente a computación cuántica futura
- **Zero-Trust Architecture**: Validación continua de cada acceso
- **Auditoría Inmutable**: Logs blockchain de cada transacción
- **Control de Acceso Granular**: Permisos por rol, nivel y valor
- **Rate Limiting Inteligente**: Protección contra ataques DDoS

### 🤖 Inteligencia Artificial
- **Cortex-Risk**: Análisis automático de riesgo crediticio
- **Cortex-Flow**: Predicciones de renovación y optimización
- **Validación Automática**: Términos de pago según riesgo
- **Recomendaciones Inteligentes**: Sugerencias de mejora continua

## 🏗️ Arquitectura

### Domain-Driven Design (DDD)
```
src/modules/contratos/
├── domain/                 # Lógica de negocio pura
│   ├── entities/          # Entidades del dominio
│   ├── value-objects/     # Objetos de valor
│   └── repositories/      # Interfaces de repositorios
├── application/           # Casos de uso y orquestación
│   ├── commands/         # Comandos (escritura)
│   ├── queries/          # Consultas (lectura)
│   └── handlers/         # Manejadores de comandos/consultas
├── infrastructure/       # Implementaciones técnicas
│   ├── repositories/     # Implementaciones de repositorios
│   └── external/         # Servicios externos
└── presentation/         # Capa de presentación
    ├── controllers/      # Controladores REST
    ├── dto/             # Data Transfer Objects
    ├── routes/          # Definición de rutas
    └── middleware/      # Middleware de seguridad
```

### Entidades Principales

#### 🔷 Contrato
- **Propósito**: Entidad raíz del agregado
- **Responsabilidades**: 
  - Validaciones de negocio
  - Transiciones de estado
  - Cálculos automáticos
  - Generación de alertas

#### 🔷 LineaEspecificacion
- **Propósito**: Especificaciones de pauta detalladas
- **Responsabilidades**:
  - Validación de inventario
  - Cálculo de GRPs
  - Reserva de espacios

#### 🔷 AprobacionContrato
- **Propósito**: Flujo de aprobaciones multinivel
- **Responsabilidades**:
  - Escalamiento automático
  - Notificaciones push
  - Control de tiempos límite

### Value Objects

#### 💎 NumeroContrato
- Generación automática con formato `CON-YYYY-XXXXX`
- Validación de unicidad
- Secuencia automática por año

#### 💎 EstadoContrato
- Estados: borrador, revision, aprobacion, firmado, activo, pausado, finalizado, cancelado
- Transiciones válidas automáticas
- Colores y descripciones integradas

#### 💎 TotalesContrato
- Cálculos automáticos de valores
- Validación de coherencia
- Formateo por moneda

#### 💎 RiesgoCredito
- Score dinámico 0-1000
- Niveles: bajo, medio, alto
- Recomendaciones automáticas

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 18.0.0
TypeScript >= 5.0.0
Prisma >= 5.0.0
```

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma generate
npx prisma db push

# Configurar variables de entorno
cp .env.example .env
```

### Variables de Entorno
```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/silexar"

# Cortex-Risk
CORTEX_RISK_URL="https://api.cortex-risk.silexar.com"
CORTEX_RISK_API_KEY="your-api-key"

# Cortex-Flow
CORTEX_FLOW_URL="https://api.cortex-flow.silexar.com"
CORTEX_FLOW_API_KEY="your-api-key"

# Sistemas de emisión
WIDEORBIT_URL="https://wideorbit.company.com"
SARA_URL="https://sara.company.com"
DALET_URL="https://dalet.company.com"

# Firma digital
DOCUSIGN_API_KEY="your-docusign-key"
ADOBE_SIGN_API_KEY="your-adobe-key"
```

## 📚 Uso del API

### Autenticación
```bash
# Obtener token
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com", "password": "password"}'

# Usar token en requests
curl -H "Authorization: Bearer YOUR_TOKEN" /api/contratos
```

### Endpoints Principales

#### Buscar Contratos
```bash
GET /api/contratos?q=search&estado=activo&pagina=1&limite=50
```

#### Crear Contrato
```bash
POST /api/contratos
Content-Type: application/json

{
  "anunciante": "Banco de Chile",
  "rutAnunciante": "97.004.000-5",
  "producto": "Cuenta Corriente Premium",
  "ejecutivo": "Juan Pérez",
  "valorBruto": 25000000,
  "fechaInicio": "2025-03-01",
  "fechaFin": "2025-05-31",
  "diasPago": 30
}
```

#### Obtener Detalle
```bash
GET /api/contratos/cont_123?incluirAnalisis=true
```

#### Aprobar Contrato
```bash
POST /api/contratos/cont_123/aprobar
Content-Type: application/json

{
  "justificacion": "Contrato aprobado según políticas comerciales"
}
```

## 🔧 Configuración Avanzada

### Límites por Nivel de Usuario
```typescript
const levelLimits = {
  1: 10000000,    // $10M - Ejecutivo Junior
  2: 50000000,    // $50M - Ejecutivo Senior  
  3: 100000000,   // $100M - Supervisor
  4: 500000000,   // $500M - Gerente
  5: 1000000000,  // $1B - Gerente General
  6: Infinity     // Sin límite - Director
}
```

### Configuración de Aprobaciones
```typescript
const approvalLevels = {
  1: { name: 'Supervisor', maxValue: 50000000, maxHours: 2 },
  2: { name: 'Gerente Comercial', maxValue: 100000000, maxHours: 4 },
  3: { name: 'Gerente General', maxValue: 500000000, maxHours: 24 },
  4: { name: 'Directorio', maxValue: Infinity, maxHours: 48 }
}
```

### Configuración de Riesgo
```typescript
const riskLevels = {
  low: { minScore: 750, maxPaymentTerms: 90, requiresGuarantee: false },
  medium: { minScore: 600, maxPaymentTerms: 45, requiresGuarantee: false },
  high: { minScore: 0, maxPaymentTerms: 15, requiresGuarantee: true }
}
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

### Estructura de Tests
```
tests/
├── unit/              # Tests unitarios
│   ├── domain/       # Tests de entidades y value objects
│   ├── application/  # Tests de handlers
│   └── infrastructure/ # Tests de repositorios
├── integration/      # Tests de integración
└── e2e/             # Tests end-to-end
```

## 📊 Monitoreo y Métricas

### Métricas Clave
- **Tiempo de Respuesta**: < 200ms para consultas, < 500ms para comandos
- **Throughput**: > 1000 contratos/minuto
- **Disponibilidad**: 99.99% uptime
- **Tasa de Error**: < 0.1%

### Alertas Configuradas
- Tiempo de respuesta > 1s
- Tasa de error > 1%
- CPU > 80%
- Memoria > 85%
- Disco > 90%

### Dashboards
- **Operacional**: Métricas en tiempo real
- **Comercial**: KPIs de ventas y pipeline
- **Técnico**: Performance y errores
- **Ejecutivo**: Resumen de alto nivel

## 🔄 Integraciones

### Sistemas Externos
- **WideOrbit**: Validación y programación de inventario
- **Sara**: Gestión de pauta y emisión
- **Dalet**: Sistemas de playout y emisión
- **DocuSign/Adobe**: Firma digital de contratos
- **SII**: Validación tributaria automática

### APIs de IA
- **Cortex-Risk**: Análisis de riesgo crediticio
- **Cortex-Flow**: Predicciones y optimizaciones
- **Cortex-Analytics**: Métricas avanzadas

## 🚨 Troubleshooting

### Problemas Comunes

#### Error de Validación de Inventario
```bash
# Verificar conectividad
curl -X GET /api/contratos/validar-inventario/health

# Logs detallados
tail -f logs/inventory-validation.log
```

#### Error de Cortex-Risk
```bash
# Verificar API key
curl -H "Authorization: Bearer $CORTEX_RISK_API_KEY" \
  $CORTEX_RISK_URL/api/v1/health

# Fallback a análisis básico automático
```

#### Error de Base de Datos
```bash
# Verificar conexión
npx prisma db pull

# Regenerar cliente
npx prisma generate
```

### Logs Importantes
```bash
# Logs de aplicación
tail -f logs/contratos.log

# Logs de auditoría
tail -f logs/audit.log

# Logs de performance
tail -f logs/metrics.log
```

## 📈 Roadmap

### Q1 2025
- [x] Implementación core del módulo
- [x] Integración con Cortex-Risk
- [x] Workflows de aprobación
- [ ] Firma digital completa
- [ ] Reportes avanzados

### Q2 2025
- [ ] Integración móvil nativa
- [ ] WhatsApp Business API
- [ ] Análisis predictivo avanzado
- [ ] Optimización de precios IA
- [ ] Dashboard ejecutivo 3D

### Q3 2025
- [ ] Blockchain para auditoría
- [ ] Machine Learning personalizado
- [ ] Integración con CRM externo
- [ ] API pública para partners
- [ ] Módulo de renovaciones automáticas

## 👥 Equipo de Desarrollo

### Roles y Responsabilidades
- **Tech Lead**: Arquitectura y decisiones técnicas
- **Backend Developers**: Implementación de lógica de negocio
- **Frontend Developers**: Interfaces de usuario
- **DevOps Engineers**: Infraestructura y despliegue
- **QA Engineers**: Testing y calidad
- **Product Owner**: Requisitos y priorización

### Contacto
- **Email**: contratos-dev@silexar.com
- **Slack**: #contratos-module
- **Jira**: CONT project
- **Confluence**: Contratos Module Space

## 📄 Licencia

Copyright © 2025 Silexar Technologies. Todos los derechos reservados.

Este software es propiedad de Silexar Technologies y está protegido por leyes de derechos de autor y tratados internacionales. El uso no autorizado está prohibido.

---

**Versión**: 2025.3.0  
**Última Actualización**: 16 de Agosto, 2025  
**Clasificación**: TIER 0 - ENTERPRISE SECURITY  
**Nivel de Seguridad**: MILITARY GRADE