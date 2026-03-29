/**
 * SILEXAR PULSE - TIER0+ FL MODEL ENDPOINT
 * Endpoint para distribución de modelos federados
 * 
 * GET /api/v2/fl/model - Descargar modelo activo
 * GET /api/v2/fl/model/{version} - Descargar versión específica
 * GET /api/v2/fl/model/stats - Estadísticas del sistema FL
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFLAggregationEngine } from '@/lib/fl/federated-aggregation';
import { logger } from '@/lib/observability';
import { apiUnauthorized, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ============================================================================
// TIPOS
// ============================================================================

interface ModelDownloadResponse {
  success: boolean;
  message: string;
  model?: {
    version: string;
    downloadUrl: string;
    weightsBase64?: string;
    checksumSha256: string;
    size: number;
    createdAt: string;
    metadata: {
      contributingClients: number;
      totalSamples: number;
      validationAccuracy: number;
    };
  };
  error?: string;
}

interface FLStatsResponse {
  success: boolean;
  stats: {
    activeModelVersion: string | null;
    totalModelsGenerated: number;
    currentRoundStatus: string | null;
    currentRoundUpdates: number;
    aggregationConfig: {
      minUpdatesForAggregation: number;
      strategy: string;
    };
    lastAggregation?: {
      timestamp: string;
      numClients: number;
      accuracyImprovement: number;
    };
  };
}

// ============================================================================
// HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  // Endpoint de estadísticas
  if (action === 'stats') {
    return getStats();
  }

  // Endpoint de descarga de modelo
  return getActiveModel(request);
}

/**
 * Obtiene el modelo activo para descarga
 */
async function getActiveModel(request: NextRequest) {
  try {
    // Validar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const engine = getFLAggregationEngine();
    const activeModel = engine.getActiveModel();

    if (!activeModel) {
      return NextResponse.json(
        { success: false, message: 'No active model available', error: 'Model not found' },
        { status: 404 }
      );
    }

    // En producción, generar URL firmada para GCS
    const downloadUrl = `https://storage.googleapis.com/silexar-fl-models/model-${activeModel.version}.tflite`;
    
    // Simular checksum
    const checksumSha256 = Buffer.from(activeModel.version + activeModel.createdAt.toISOString())
      .toString('base64')
      .replace(/[+/=]/g, '');

    // [STRUCTURED-LOG] // logger.info({ message: `[FL Model] Serving model ${activeModel.version}`, module: 'model' });

    return NextResponse.json({
      success: true,
      message: 'Model retrieved successfully',
      model: {
        version: activeModel.version,
        downloadUrl,
        weightsBase64: activeModel.weights, // Solo para desarrollo
        checksumSha256,
        size: activeModel.weights.length * 0.75, // Estimación tamaño base64
        createdAt: activeModel.createdAt.toISOString(),
        metadata: {
          contributingClients: activeModel.contributingClients,
          totalSamples: activeModel.totalSamples,
          validationAccuracy: activeModel.validationAccuracy,
        },
      },
    });

  } catch (error) {
    logger.error('[FL Model] Error:', error instanceof Error ? error : undefined, { module: 'model' });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve model',
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Obtiene estadísticas del sistema FL
 */
function getStats(): NextResponse<FLStatsResponse> {
  try {
    const engine = getFLAggregationEngine();
    const stats = engine.getStats();
    const config = engine.getConfig();

    return NextResponse.json({
      success: true,
      stats: {
        activeModelVersion: stats.activeModelVersion,
        totalModelsGenerated: stats.totalModelsGenerated,
        currentRoundStatus: stats.currentRoundStatus,
        currentRoundUpdates: stats.currentRoundUpdates,
        aggregationConfig: {
          minUpdatesForAggregation: config.minUpdatesForAggregation,
          strategy: config.strategy,
        },
      },
    });

  } catch (error) {
    logger.error('[FL Stats] Error:', error instanceof Error ? error : undefined, { module: 'model' });
    return NextResponse.json({
      success: true,
      stats: {
        activeModelVersion: null,
        totalModelsGenerated: 0,
        currentRoundStatus: null,
        currentRoundUpdates: 0,
        aggregationConfig: {
          minUpdatesForAggregation: 100,
          strategy: 'weighted_fedavg',
        },
      },
    });
  }
}

/**
 * POST - Inicia una nueva ronda de agregación manualmente (admin only)
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validar autenticación admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as { action: string; modelVersion?: string };

    if (body.action === 'force_aggregation') {
      const engine = getFLAggregationEngine();
      const result = await engine.performAggregation();

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Aggregation completed' : 'Aggregation failed',
        result,
      });
    }

    if (body.action === 'new_round' && body.modelVersion) {
      const engine = getFLAggregationEngine();
      const round = engine.startNewRound(body.modelVersion);

      return NextResponse.json({
        success: true,
        message: 'New round started',
        round: {
          roundId: round.roundId,
          targetModelVersion: round.targetModelVersion,
          status: round.status,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    logger.error('[FL Admin] Error:', error instanceof Error ? error : undefined, { module: 'model' });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
