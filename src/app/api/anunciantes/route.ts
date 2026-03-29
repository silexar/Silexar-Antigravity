/**
 * GET /api/anunciantes  — List advertisers
 * POST /api/anunciantes — Create advertiser
 *
 * Security: withApiRoute enforces JWT auth, RBAC, rate limiting, CSRF, and audit logging.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiError, apiServerError } from '@/lib/api/response'
import { logger } from '@/lib/observability'
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types'
import { withTenantContext } from '@/lib/db/tenant-context'
import { getDB } from '@/lib/db'
import { anunciantes } from '@/lib/db/schema'
import { eq, and, desc, asc, ilike, or, count, ne } from 'drizzle-orm'

// ─── Zod validation schema ────────────────────────────────────────────────────

const createAnuncianteSchema = z.object({
  nombreRazonSocial: z.string().min(1, 'La razón social es requerida').max(255),
  rut: z.string().max(12).optional(),
  giroActividad: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().max(100).optional(),
  comunaProvincia: z.string().max(100).optional(),
  pais: z.string().max(100).optional().default('Chile'),
  emailContacto: z.string().email('Email de contacto inválido').max(255).optional(),
  telefonoContacto: z.string().max(20).optional(),
  paginaWeb: z.string().max(255).optional(),
  nombreContactoPrincipal: z.string().max(255).optional(),
  cargoContactoPrincipal: z.string().max(100).optional(),
  tieneFacturacionElectronica: z.boolean().optional().default(false),
  direccionFacturacion: z.string().optional(),
  emailFacturacion: z.string().email('Email de facturación inválido').max(255).optional(),
  notas: z.string().optional(),
})

// ─── GET /api/anunciantes ────────────────────────────────────────────────────

export const GET = withApiRoute(
  { resource: 'anunciantes', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    try {
      const { searchParams } = new URL(req.url)

      const search = searchParams.get('search') || ''
      const estado = searchParams.get('estado') || ''
      const activoParam = searchParams.get('activo')
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
      const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
      const sortBy = searchParams.get('sortBy') || 'fechaCreacion'
      const sortOrder = searchParams.get('sortOrder') || 'desc'
      const offset = (page - 1) * limit

      const result = await withTenantContext(ctx.tenantId, async () => {
        // Build filter conditions
        const conditions = [
          eq(anunciantes.tenantId, ctx.tenantId),
          eq(anunciantes.eliminado, false),
        ]

        if (search) {
          conditions.push(
            or(
              ilike(anunciantes.nombreRazonSocial, `%${search}%`),
              ilike(anunciantes.rut, `%${search}%`),
              ilike(anunciantes.emailContacto, `%${search}%`),
              ilike(anunciantes.codigo, `%${search}%`),
            ) as ReturnType<typeof eq>
          )
        }

        if (estado) {
          conditions.push(eq(anunciantes.estado, estado as 'activo' | 'inactivo' | 'suspendido' | 'pendiente'))
        }

        if (activoParam !== null && activoParam !== undefined && activoParam !== '') {
          conditions.push(eq(anunciantes.activo, activoParam === 'true'))
        }

        const whereClause = and(...conditions)

        // Determine sort column
        const orderCol = (() => {
          switch (sortBy) {
            case 'nombreRazonSocial': return anunciantes.nombreRazonSocial
            case 'rut':               return anunciantes.rut
            case 'ciudad':            return anunciantes.ciudad
            case 'estado':            return anunciantes.estado
            case 'fechaCreacion':
            default:                  return anunciantes.fechaCreacion
          }
        })()

        const orderFn = sortOrder === 'asc' ? asc : desc

        // Fetch page
        const data = await getDB()
          .select({
            id:                    anunciantes.id,
            codigo:                anunciantes.codigo,
            rut:                   anunciantes.rut,
            nombreRazonSocial:     anunciantes.nombreRazonSocial,
            giroActividad:         anunciantes.giroActividad,
            direccion:             anunciantes.direccion,
            ciudad:                anunciantes.ciudad,
            comunaProvincia:       anunciantes.comunaProvincia,
            pais:                  anunciantes.pais,
            emailContacto:         anunciantes.emailContacto,
            telefonoContacto:      anunciantes.telefonoContacto,
            paginaWeb:             anunciantes.paginaWeb,
            nombreContactoPrincipal: anunciantes.nombreContactoPrincipal,
            tieneFacturacionElectronica: anunciantes.tieneFacturacionElectronica,
            estado:                anunciantes.estado,
            activo:                anunciantes.activo,
            fechaCreacion:         anunciantes.fechaCreacion,
            fechaModificacion:     anunciantes.fechaModificacion,
          })
          .from(anunciantes)
          .where(whereClause)
          .orderBy(orderFn(orderCol))
          .limit(limit)
          .offset(offset)

        // Total count for pagination
        const [{ total }] = await getDB()
          .select({ total: count() })
          .from(anunciantes)
          .where(whereClause)

        return { data, total: Number(total) }
      })

      const totalPages = Math.ceil(result.total / limit)

      return apiSuccess(result.data, 200, {
        pagination: {
          total: result.total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes GET', error instanceof Error ? error : undefined, { module: 'anunciantes', action: 'GET' })
      return apiServerError() as unknown as NextResponse
    }
  }
)

// ─── POST /api/anunciantes ───────────────────────────────────────────────────

export const POST = withApiRoute(
  { resource: 'anunciantes', action: 'create' },
  async ({ ctx, req }) => {
    try {
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return apiError('INVALID_JSON', 'Request body must be valid JSON', 400) as unknown as NextResponse
      }

      const parsed = createAnuncianteSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(
          'VALIDATION_ERROR',
          'Error en la validación de los datos',
          422,
          parsed.error.flatten().fieldErrors
        ) as unknown as NextResponse
      }

      const data = parsed.data

      const newAnunciante = await withTenantContext(ctx.tenantId, async () => {
        // RUT uniqueness check within the tenant
        if (data.rut) {
          const normalizedRut = data.rut.replace(/[.-]/g, '')
          const existing = await getDB()
            .select({ id: anunciantes.id })
            .from(anunciantes)
            .where(
              and(
                eq(anunciantes.tenantId, ctx.tenantId),
                eq(anunciantes.eliminado, false),
                ilike(anunciantes.rut, `%${normalizedRut}%`)
              )
            )
            .limit(1)

          if (existing.length > 0) {
            return null // signal duplicate
          }
        }

        // Generate correlative code
        const [{ nextNum }] = await getDB()
          .select({ nextNum: count() })
          .from(anunciantes)
          .where(
            and(
              eq(anunciantes.tenantId, ctx.tenantId),
              ne(anunciantes.eliminado, true)
            )
          )

        const codigo = `ANU-${(Number(nextNum) + 1).toString().padStart(4, '0')}`

        const [inserted] = await getDB()
          .insert(anunciantes)
          .values({
            tenantId:                    ctx.tenantId,
            codigo,
            rut:                         data.rut ?? null,
            nombreRazonSocial:           data.nombreRazonSocial.trim(),
            giroActividad:               data.giroActividad ?? null,
            direccion:                   data.direccion ?? null,
            ciudad:                      data.ciudad ?? null,
            comunaProvincia:             data.comunaProvincia ?? null,
            pais:                        data.pais ?? 'Chile',
            emailContacto:               data.emailContacto ?? null,
            telefonoContacto:            data.telefonoContacto ?? null,
            paginaWeb:                   data.paginaWeb ?? null,
            nombreContactoPrincipal:     data.nombreContactoPrincipal ?? null,
            cargoContactoPrincipal:      data.cargoContactoPrincipal ?? null,
            tieneFacturacionElectronica: data.tieneFacturacionElectronica ?? false,
            direccionFacturacion:        data.direccionFacturacion ?? null,
            emailFacturacion:            data.emailFacturacion ?? null,
            notas:                       data.notas ?? null,
            estado:                      'activo',
            activo:                      true,
            eliminado:                   false,
            creadoPorId:                 ctx.userId,
          })
          .returning()

        return inserted
      })

      if (newAnunciante === null) {
        return apiError(
          'DUPLICATE_ENTRY',
          `Ya existe un anunciante con el RUT ${data.rut}`,
          409
        ) as unknown as NextResponse
      }

      auditLogger.log({
        type: AuditEventType.DATA_CREATE,
        userId: ctx.userId,
        metadata: { module: 'anunciantes', resourceId: newAnunciante.id },
      })

      return apiSuccess(newAnunciante, 201, { message: 'Anunciante creado exitosamente' }) as unknown as NextResponse
    } catch (error) {
      logger.error('Error in anunciantes POST', error instanceof Error ? error : undefined, { module: 'anunciantes', action: 'POST' })
      return apiServerError() as unknown as NextResponse
    }
  }
)
