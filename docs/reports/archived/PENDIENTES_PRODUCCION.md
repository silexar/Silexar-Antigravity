# PENDIENTES ANTES DE PRODUCCION — Silexar Pulse

## Silexar Pulse - Lista de Configuracion Pre-Deploy + Auditoría Marzo 2026

---

## YA CONFIGURADO (Listo para usar)

- [x] `drizzle.config.ts` - Configuracion de migraciones
- [x] `src/lib/db/index.ts` - Conexion centralizada a BD con todos los schemas
- [x] `scripts/seed.ts` - Script para crear tenant y usuario admin inicial
- [x] `src/lib/api-helper.ts` - Helpers estandarizados para APIs
- [x] `.env.example` - Plantilla de variables de entorno
- [x] Dependencias en package.json (drizzle-orm, postgres ya incluidos)
- [x] TypeScript 0 errores (strict mode)
- [x] Security headers (HSTS, X-Frame-Options, CORP/COEP)
- [x] Auth/JWT con bcrypt 12 rounds + jose HS256
- [x] RBAC con 14 roles y permisos granulares
- [x] Multi-tenant RLS en 15+ tablas
- [x] Rate limiting Redis + fallback memoria
- [x] Observabilidad: logging estructurado + distributed tracing
- [x] K8s manifests production-grade
- [x] Terraform IaC para GCP

---

## PENDIENTE - Configuracion basica (Lo que TU debes hacer)

### Paso 1: Crear archivo `.env.local`

Copia `.env.example` como `.env.local` y configura:

```env
DATABASE_URL=postgresql://tu_usuario:tu_password@db.supabase.co:5432/postgres
JWT_SECRET=genera_con_openssl_rand_base64_64
BETTER_AUTH_SECRET=genera_con_openssl_rand_base64_64
```

### Paso 2: Crear Base de Datos en Supabase

Crear proyecto en Supabase y obtener connection string.

### Paso 3: Ejecutar Migraciones

```bash
npm run db:migrate
```

### Paso 4: Aplicar RLS

```bash
psql $DATABASE_URL -f drizzle/migrations/0001_enable_rls_multi_tenant.sql
```

### Paso 5: Cargar Datos Iniciales

```bash
npx tsx scripts/seed.ts
```

---

## PENDIENTE AUDITORIA MARZO 2026 - Requiere Supabase/Produccion

### P0 - CRITICO (Antes de produccion)

#### 1. Reemplazar Mock APIs con queries reales a BD
Las siguientes rutas usan datos hardcodeados y deben conectarse a la BD real:

- [ ] `src/app/api/contratos/route.ts` — mockContratos[] -> queries a tabla `contratos`
- [ ] `src/app/api/facturacion/route.ts` — mockFacturas[] -> queries a tabla `facturas`
- [ ] `src/app/api/campanas/route.ts` — mockCampanas[] -> queries a tabla `campanas`
- [ ] `src/app/api/emisoras/route.ts` — verificar si usa mock -> queries a tabla `emisoras`
- [ ] `src/app/api/anunciantes/route.ts` — parcialmente mock -> completar queries reales
- [ ] `src/app/api/equipos-ventas/route.ts` — verificar mock data
- [ ] `src/app/api/cotizador/route.ts` — agregar persistencia de cotizaciones
- [ ] `src/app/api/agencias-medios/route.ts` — verificar implementacion

#### 2. Completar modulo campanas (DDD)
- [ ] Crear `src/modules/campanas/domain/` — entidades, value objects
- [ ] Crear `src/modules/campanas/infrastructure/` — repositorios Drizzle
- [ ] Conectar al esquema `campanas-schema.ts` existente

#### 3. Completar modulo conciliacion
- [ ] Crear `src/modules/conciliacion/presentation/` — controllers, DTOs

#### 4. Implementar Kafka/Event Bus
- [ ] Crear `src/lib/events/kafka-client.ts` — producer/consumer
- [ ] Crear `src/lib/events/event-bus.ts` — bus de eventos con fallback a Redis
- [ ] Integrar con flujos de contratos, campanas, facturacion

#### 5. Rotar Token Vercel
- [ ] Rotar `VERCEL_TOKEN` en panel de Vercel (el actual esta expuesto en .env.local)

#### 6. Validar tenant slugs contra BD
- [ ] Implementar cache de slugs validos (Redis/memory)
- [ ] Validar en middleware antes de RLS

#### 7. Exponer Cortex engines como API
- [ ] Crear `/api/cortex/risk/route.ts`
- [ ] Crear `/api/cortex/audience/route.ts`
- [ ] Crear `/api/cortex/sense/route.ts`
- [ ] Crear `/api/cortex/voice/route.ts`

### P1 - ALTO (Primer sprint post-conexion)

#### 8. Tests de integracion
- [ ] Tests E2E para flujo completo: login -> crear contrato -> facturar
- [ ] Tests de integracion con BD real (no mocks)
- [ ] Configurar Playwright contra staging

#### 9. Monitoreo de BD
- [ ] Crear `/api/health/db` endpoint
- [ ] Metricas de connection pool
- [ ] Alertas de conexion fallida

#### 10. JWT Blacklist
- [ ] Implementar blacklist en Redis para revocacion inmediata
- [ ] Integrar con logout y eventos de seguridad

### P2 - MEDIO (Backlog)

#### 11. Formularios con React Hook Form + Zod
- [ ] Auditar TODOS los formularios del sistema
- [ ] Migrar formularios manuales (useState) a React Hook Form

#### 12. Mobile para modulos faltantes
- [ ] `/facturacion/movil/page.tsx`
- [ ] `/informes/movil/page.tsx`
- [ ] `/crm/movil/page.tsx`
- [ ] `/vendedores/movil/page.tsx`

#### 13. Accesibilidad completa
- [ ] Audit WCAG AA en componentes custom
- [ ] aria-labels en componentes neuromorphic
- [ ] Skip navigation links

---

## OPCIONAL - Segun tu uso

| Funcionalidad         | Requiere                     |
| --------------------- | ---------------------------- |
| Facturacion SII Chile | Certificado digital + folios |
| Fingerprinting audio  | API Shazam o ACRCloud        |
| Notificaciones email  | SMTP configurado             |
| Subir archivos audio  | AWS S3 o similar             |

---

*Actualizado: 18 Marzo 2026 (Post-Auditoria integral)*
