# 🚀 PLAN DE IMPLEMENTACIÓN CRÍTICA

## 📊 RESUMEN EJECUTIVO

**OBJETIVO**: Implementar las mejoras críticas identificadas en la auditoría de seguridad y tecnología  
**PRIORIDAD**: CRÍTICA - Implementación inmediata requerida  
**TIEMPO ESTIMADO**: 4-6 semanas  
**BENEFICIO**: Type safety completo, gestión robusta de datos, autenticación moderna  

---

## 🎯 FASE 1: DRIZZLE ORM IMPLEMENTATION (Semana 1-2)

### 📦 **1.1 Instalación y Configuración**

```bash
# Instalar Drizzle ORM y dependencias
npm install drizzle-orm drizzle-kit
npm install @planetscale/database  # Para PlanetScale
# O alternativamente:
# npm install postgres  # Para PostgreSQL
# npm install mysql2     # Para MySQL

# Instalar tipos de desarrollo
npm install -D @types/pg  # Si usas PostgreSQL
```

### 🗄️ **1.2 Configuración de Base de Datos**

**Archivo**: `src/lib/db/config.ts`
```typescript
import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { connect } from '@planetscale/database'

// Configuración de conexión
const connection = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
})

export const db = drizzle(connection)
```

### 📋 **1.3 Esquemas de Base de Datos**

**Archivo**: `src/lib/db/schema.ts`
```typescript
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  integer,
  jsonb 
} from 'drizzle-orm/pg-core'

// Tabla de usuarios
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  tenantId: uuid('tenant_id').notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Tabla de sesiones
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  refreshToken: varchar('refresh_token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Tabla de campañas
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tenantId: uuid('tenant_id').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  budget: integer('budget'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  metrics: jsonb('metrics').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Tabla de métricas de Cortex
export const cortexMetrics = pgTable('cortex_metrics', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  tenantId: uuid('tenant_id').notNull(),
  metricType: varchar('metric_type', { length: 100 }).notNull(),
  value: jsonb('value').$type<Record<string, any>>().notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
})

// Tipos TypeScript inferidos
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert
export type CortexMetric = typeof cortexMetrics.$inferSelect
export type NewCortexMetric = typeof cortexMetrics.$inferInsert
```

### 🔧 **1.4 Configuración de Drizzle Kit**

**Archivo**: `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USERNAME!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
  }
} satisfies Config
```

### 📝 **1.5 Queries y Mutaciones**

**Archivo**: `src/lib/db/queries/users.ts`
```typescript
import { eq, and, lt } from 'drizzle-orm'
import { db } from '../config'
import { users, sessions, type User, type NewUser } from '../schema'

export class UserQueries {
  // Obtener usuario por email
  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    
    return result[0] || null
  }

  // Obtener usuario por ID
  static async getUserById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
    
    return result[0] || null
  }

  // Crear nuevo usuario
  static async createUser(userData: NewUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .returning()
    
    return result[0]
  }

  // Actualizar usuario
  static async updateUser(id: string, updates: Partial<NewUser>): Promise<User | null> {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    
    return result[0] || null
  }

  // Incrementar intentos fallidos de login
  static async incrementFailedAttempts(id: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        failedLoginAttempts: sql`${users.failedLoginAttempts} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
  }

  // Bloquear cuenta
  static async lockAccount(id: string, lockUntil: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        lockedUntil: lockUntil,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
  }

  // Resetear intentos fallidos
  static async resetFailedAttempts(id: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
  }

  // Limpiar cuentas bloqueadas expiradas
  static async unlockExpiredAccounts(): Promise<void> {
    await db
      .update(users)
      .set({ 
        lockedUntil: null,
        failedLoginAttempts: 0,
        updatedAt: new Date()
      })
      .where(and(
        lt(users.lockedUntil, new Date()),
        eq(users.lockedUntil, null)
      ))
  }
}
```

---

## ⚡ FASE 2: tRPC IMPLEMENTATION (Semana 3-4)

### 📦 **2.1 Instalación y Configuración**

```bash
# Instalar tRPC y dependencias
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
npm install superjson  # Para serialización avanzada
```

### 🔧 **2.2 Configuración del Servidor tRPC**

**Archivo**: `src/lib/trpc/context.ts`
```typescript
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db/config'
import { UserQueries } from '@/lib/db/queries/users'

export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts

  // Obtener sesión del usuario
  const session = await getServerSession(req, res)
  
  let user = null
  if (session?.user?.email) {
    user = await UserQueries.getUserByEmail(session.user.email)
  }

  return {
    req,
    res,
    db,
    user,
    session
  }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
```

**Archivo**: `src/lib/trpc/trpc.ts`
```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// Middleware de autenticación
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is now non-nullable
    },
  })
})

// Middleware de admin
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !['admin', 'super_admin'].includes(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)
```

### 📋 **2.3 Routers tRPC**

**Archivo**: `src/lib/trpc/routers/auth.ts`
```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { UserQueries } from '@/lib/db/queries/users'
import { inputValidator, authSchemas } from '@/lib/security/input-validator'
import { auditLogger } from '@/lib/security/audit-logger'

export const authRouter = router({
  // Login
  login: publicProcedure
    .input(authSchemas.login)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input

      // Validar email
      const emailValidation = inputValidator.validateEmail(email)
      if (!emailValidation.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid email format'
        })
      }

      // Buscar usuario
      const user = await UserQueries.getUserByEmail(emailValidation.sanitized!)
      if (!user) {
        await auditLogger.auth('Login attempt with non-existent email', ctx.req, {
          event: 'AUTH_USER_NOT_FOUND',
          email: email.substring(0, 10) + '***'
        })
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        })
      }

      // Verificar si la cuenta está bloqueada
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account is temporarily locked'
        })
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        await UserQueries.incrementFailedAttempts(user.id)
        
        if ((user.failedLoginAttempts || 0) >= 4) { // 5 intentos total
          const lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
          await UserQueries.lockAccount(user.id, lockUntil)
        }

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        })
      }

      // Reset failed attempts
      await UserQueries.resetFailedAttempts(user.id)

      // Generar tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions
      }

      const accessToken = sign(
        tokenPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      )

      const refreshToken = sign(
        { userId: user.id, tokenType: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      )

      // Log successful auth
      await auditLogger.auth('Successful authentication', ctx.req, {
        event: 'AUTH_SUCCESS',
        userId: user.id,
        email: user.email
      })

      const { password: _, ...userData } = user

      return {
        user: userData,
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }
    }),

  // Get current user
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const { password: _, ...userData } = ctx.user
      return userData
    }),

  // Update profile
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255).optional(),
      avatar: z.string().url().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await UserQueries.updateUser(ctx.user.id, input)
      
      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      const { password: _, ...userData } = updatedUser
      return userData
    })
})
```

**Archivo**: `src/lib/trpc/routers/campaigns.ts`
```typescript
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'
import { CampaignQueries } from '@/lib/db/queries/campaigns'

export const campaignsRouter = router({
  // Obtener todas las campañas del usuario
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return await CampaignQueries.getCampaignsByUserId(ctx.user.id)
    }),

  // Obtener campaña por ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const campaign = await CampaignQueries.getCampaignById(input.id)
      
      if (!campaign || campaign.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found'
        })
      }

      return campaign
    }),

  // Crear nueva campaña
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      budget: z.number().positive().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await CampaignQueries.createCampaign({
        ...input,
        userId: ctx.user.id,
        tenantId: ctx.user.tenantId
      })
    }),

  // Actualizar campaña
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      budget: z.number().positive().optional(),
      status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input
      
      // Verificar ownership
      const campaign = await CampaignQueries.getCampaignById(id)
      if (!campaign || campaign.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found'
        })
      }

      return await CampaignQueries.updateCampaign(id, updates)
    }),

  // Eliminar campaña
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar ownership
      const campaign = await CampaignQueries.getCampaignById(input.id)
      if (!campaign || campaign.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found'
        })
      }

      await CampaignQueries.deleteCampaign(input.id)
      return { success: true }
    })
})
```

### 🔗 **2.4 Router Principal**

**Archivo**: `src/lib/trpc/root.ts`
```typescript
import { router } from './trpc'
import { authRouter } from './routers/auth'
import { campaignsRouter } from './routers/campaigns'
import { cortexRouter } from './routers/cortex'

export const appRouter = router({
  auth: authRouter,
  campaigns: campaignsRouter,
  cortex: cortexRouter
})

export type AppRouter = typeof appRouter
```

### 🌐 **2.5 API Route Handler**

**Archivo**: `src/app/api/trpc/[trpc]/route.ts`
```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/lib/trpc/root'
import { createTRPCContext } from '@/lib/trpc/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
```

### 🎯 **2.6 Cliente tRPC**

**Archivo**: `src/lib/trpc/client.ts`
```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from './root'

export const trpc = createTRPCReact<AppRouter>()
```

**Archivo**: `src/components/providers/trpc-provider.tsx`
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'
import { trpc } from '@/lib/trpc/client'

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: '/api/trpc',
          headers() {
            const token = localStorage.getItem('quantum_token')
            return token ? { authorization: `Bearer ${token}` } : {}
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

---

## 🔐 FASE 3: BETTER-AUTH IMPLEMENTATION (Semana 5-6)

### 📦 **3.1 Instalación**

```bash
# Instalar Better-Auth
npm install better-auth
npm install @better-auth/drizzle-adapter  # Adapter para Drizzle
```

### 🔧 **3.2 Configuración Better-Auth**

**Archivo**: `src/lib/auth/config.ts`
```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { db } from '@/lib/db/config'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // 1 día
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutos
    }
  },
  rateLimit: {
    window: 60, // 1 minuto
    max: 5 // 5 intentos
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.COOKIE_DOMAIN
    }
  },
  plugins: [
    // Plugin de 2FA
    {
      id: 'two-factor',
      init: (ctx) => {
        // Configuración de 2FA
      }
    }
  ]
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User
```

### 🌐 **3.3 API Routes**

**Archivo**: `src/app/api/auth/[...auth]/route.ts`
```typescript
import { auth } from '@/lib/auth/config'

export const { GET, POST } = auth.handler
```

### 🎯 **3.4 Cliente Better-Auth**

**Archivo**: `src/lib/auth/client.ts`
```typescript
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession
} = authClient
```

---

## 📋 CRONOGRAMA DE IMPLEMENTACIÓN

### **SEMANA 1: Drizzle Setup**
- [ ] Día 1-2: Instalación y configuración inicial
- [ ] Día 3-4: Creación de esquemas de base de datos
- [ ] Día 5: Implementación de queries básicas

### **SEMANA 2: Drizzle Completion**
- [ ] Día 1-2: Queries avanzadas y mutaciones
- [ ] Día 3-4: Migración de datos existentes
- [ ] Día 5: Testing y optimización

### **SEMANA 3: tRPC Setup**
- [ ] Día 1-2: Configuración del servidor tRPC
- [ ] Día 3-4: Implementación de routers básicos
- [ ] Día 5: Integración con cliente

### **SEMANA 4: tRPC Completion**
- [ ] Día 1-2: Routers avanzados y middleware
- [ ] Día 3-4: Migración de endpoints REST
- [ ] Día 5: Testing y optimización

### **SEMANA 5: Better-Auth Setup**
- [ ] Día 1-2: Configuración inicial
- [ ] Día 3-4: Implementación de providers
- [ ] Día 5: Migración de usuarios

### **SEMANA 6: Better-Auth Completion**
- [ ] Día 1-2: Features avanzadas (2FA, WebAuthn)
- [ ] Día 3-4: Testing completo
- [ ] Día 5: Documentación y deployment

---

## 🎯 MÉTRICAS DE ÉXITO

### **Drizzle ORM**
- ✅ Queries 50% más rápidas que implementación actual
- ✅ Type safety 100% en operaciones de base de datos
- ✅ Reducción de bugs relacionados con datos en 90%

### **tRPC**
- ✅ Type safety end-to-end completo
- ✅ Reducción de código boilerplate en 60%
- ✅ Mejor developer experience y autocompletado

### **Better-Auth**
- ✅ Soporte para múltiples providers OAuth
- ✅ Implementación de 2FA y WebAuthn
- ✅ Mejor seguridad y gestión de sesiones

---

**Plan creado por**: Kiro AI Assistant  
**Fecha**: 1 de Agosto, 2025  
**Revisión**: Semanal durante implementación