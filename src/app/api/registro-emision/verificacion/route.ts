import { NextRequest } from "next/server";
import { logger } from '@/lib/observability';

import { IniciarVerificacionCommand } from "@/lib/modules/registro-emision/application/commands/IniciarVerificacionCommand";
import { VerificacionEmisionHandler } from "@/lib/modules/registro-emision/application/handlers/VerificacionEmisionHandler";
import { DrizzleRegistroEmisionRepository } from "@/lib/modules/registro-emision/infrastructure/repositories/DrizzleRegistroEmisionRepository";
import { MockCortexSenseService } from "@/lib/modules/registro-emision/infrastructure/external/CortexSenseUltraService";
import { apiSuccess } from "@/lib/api/response";
import { secureHandler } from "@/lib/api/secure-handler";
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

/**
 * POST /api/registro-emision/verificacion
 *
 * Inicia el proceso de verificación de emisión (audio fingerprinting / "Shazam Militar").
 * Arquitectura Clean Architecture / DDD — tenant extraído del JWT, no hardcodeado.
 */
export const POST = secureHandler(
  { resource: 'emisiones', action: 'create' },
  async (req, { user }) => {
    const body = await req.json();

    // 1. Composition Root per request
    const repository = new DrizzleRegistroEmisionRepository();
    const cortexService = new MockCortexSenseService();
    const handler = new VerificacionEmisionHandler(repository, cortexService);

    // 2. Build Command — tenantId from verified JWT, not from client body
    const command = new IniciarVerificacionCommand(
      user.tenantId,
      body.clienteId,
      body.campanaId,
      body.materiales,
      new Date().toISOString(),
      'auto'
    );

    // 3. Ejecución
    const resultId = await handler.handle(command);

    return apiSuccess({
      verificacionId: resultId,
      message: "Proceso de verificación iniciado con arquitectura Enterprise DDD."
    });
  }
);
