# 🔧 ERRORES IDENTIFICADOS Y PLAN DE CORRECCIÓN

## ❌ PROBLEMA PRINCIPAL

El proyecto actual es un **proyecto Vite + React** (frontend), pero se crearon archivos para un **backend NestJS** que no está configurado en este proyecto.

### Archivos con Errores

#### 1. **Archivos NestJS Backend** (No compatibles con proyecto actual)
- ❌ `src/main.ts` - Entry point NestJS
- ❌ `src/app.module.ts` - Root module NestJS
- ❌ `src/modules/campaigns/campaigns.module.ts`
- ❌ `src/modules/campaigns/campaigns.controller.ts`
- ❌ `src/modules/campaigns/campaigns.service.ts`
- ❌ `src/modules/campaigns/entities/*.entity.ts` - TypeORM entities
- ❌ `src/modules/campaigns/dto/*.dto.ts`
- ❌ `src/modules/cortex/cortex.module.ts`
- ❌ `src/modules/cortex/cortex.controller.ts`
- ❌ `src/modules/cortex/cortex.service.ts`
- ❌ `src/modules/auth/auth.module.ts`
- ❌ `src/modules/auth/guards/jwt-auth.guard.ts`
- ❌ `src/modules/narratives/narratives.service.ts`

**Dependencias faltantes:**
- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/typeorm`
- `typeorm`
- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `@nestjs/cache-manager`
- `cache-manager-redis-store`
- `@nestjs/throttler`
- `@nestjs/schedule`

#### 2. **Archivos de Infraestructura** (✅ Correctos)
- ✅ `terraform/main.tf`
- ✅ `terraform/variables.tf`
- ✅ `k8s/production/deployment.yaml`
- ✅ `k8s/production/ingress.yaml`
- ✅ `scripts/deploy-gcp.ps1`
- ✅ `scripts/health-check.ps1`
- ✅ `scripts/disaster-recovery.ps1`
- ✅ `docs/GCP_DEPLOYMENT_GUIDE.md`
- ✅ `docs/DISASTER_RECOVERY_RUNBOOK.md`

#### 3. **Archivos de Cortex AI** (✅ Correctos después de correcciones)
- ✅ `src/lib/cortex/cortex-prophet.ts`
- ✅ `src/lib/cortex/cortex-orchestrator-v2.ts`
- ✅ `src/lib/cortex/cortex-context.ts` (ya existía)
- ✅ `src/lib/campaign/narrative-planner.ts` (corregido)

#### 4. **Archivos Frontend** (⚠️ Necesita reactflow)
- ⚠️ `src/components/campaign/NarrativePlanner.tsx` - Necesita `reactflow` instalado

#### 5. **Archivos CI/CD** (✅ Correctos)
- ✅ `.github/workflows/deploy-gcp.yml`
- ✅ `Dockerfile`

---

## ✅ SOLUCIONES PROPUESTAS

### Opción 1: Crear Proyecto Backend Separado (RECOMENDADO)

Crear un proyecto NestJS separado para el backend API:

```bash
# Crear carpeta backend
mkdir backend
cd backend

# Crear proyecto NestJS
npx @nestjs/cli new silexar-pulse-api

# Mover archivos backend
mv ../src/modules ./src/
mv ../src/main.ts ./src/
mv ../src/app.module.ts ./src/

# Instalar dependencias
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/cache-manager cache-manager-redis-store
npm install @nestjs/throttler @nestjs/schedule
npm install @tensorflow/tfjs-node @google-cloud/pubsub
```

**Estructura resultante:**
```
Silexar Pulse Antygravity/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── modules/
│   │   └── lib/
│   └── package.json
├── src/                  # Frontend React
│   ├── components/
│   ├── lib/
│   └── ...
├── terraform/
├── k8s/
├── scripts/
└── package.json
```

### Opción 2: Mantener Solo Frontend + Cortex Engines

Eliminar archivos NestJS y mantener solo:
- Frontend React (actual)
- Cortex AI engines (Prophet, Orchestrator, Context)
- Narrative Planner (lógica)
- Infraestructura (Terraform, K8s, scripts)

**Archivos a eliminar:**
```bash
rm -rf src/modules
rm src/main.ts
rm src/app.module.ts
```

### Opción 3: Convertir Proyecto a Monorepo

Usar herramientas como Nx o Turborepo para gestionar frontend y backend juntos.

---

## 🔧 CORRECCIONES INMEDIATAS APLICADAS

### ✅ Ya Corregidos
1. **narrative-planner.ts**: Eliminada dependencia de `reactflow`, definidos tipos propios
2. **narratives.service.ts**: Cambiado path `@/lib` a `../../lib`
3. **campaigns.service.ts**: Cambiado path `@/lib` a `../../lib`
4. **cortex.service.ts**: Cambiado path `@/lib` a `../../lib`

### ⚠️ Pendientes de Corrección

#### NarrativePlanner.tsx
Necesita instalar `reactflow`:
```bash
npm install reactflow
```

O crear versión simplificada sin reactflow.

---

## 📋 RECOMENDACIÓN FINAL

**Para continuar con el desarrollo:**

1. **Decidir arquitectura:**
   - ¿Backend separado (NestJS)?
   - ¿Solo frontend con Cortex engines?
   - ¿Monorepo?

2. **Si backend separado:**
   - Crear carpeta `backend/`
   - Inicializar proyecto NestJS
   - Mover archivos de `src/modules/` y `src/main.ts`
   - Instalar dependencias NestJS

3. **Si solo frontend:**
   - Eliminar archivos NestJS
   - Instalar `reactflow` para NarrativePlanner.tsx
   - Mantener Cortex engines en `src/lib/`

4. **Infraestructura (mantener):**
   - Terraform
   - Kubernetes
   - Scripts
   - CI/CD
   - Documentación

---

## 🎯 ESTADO ACTUAL

### ✅ Funcionando
- Infraestructura GCP (Terraform, K8s)
- Scripts de automatización (deploy, health-check, DR)
- Cortex AI engines (Prophet, Orchestrator, Context)
- Narrative Planner (lógica)
- CI/CD pipeline
- Documentación

### ❌ No Funcionando (Requiere decisión de arquitectura)
- Backend API NestJS (no instalado)
- Endpoints REST (requieren NestJS)
- TypeORM entities (requieren TypeORM)
- Auth JWT (requiere NestJS)

### ⚠️ Parcialmente Funcionando
- NarrativePlanner.tsx (requiere `reactflow`)

---

**¿Qué arquitectura prefieres para continuar?**
1. Backend NestJS separado
2. Solo frontend + Cortex engines
3. Monorepo
