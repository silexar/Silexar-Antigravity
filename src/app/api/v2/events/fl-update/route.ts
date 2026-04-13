/**
 * SILEXAR PULSE - TIER0+ FL-UPDATE ENDPOINT
 * Endpoint para recibir actualizaciones de Aprendizaje Federado del SDK móvil
 * 
 * Este endpoint implementa el servidor de agregación para TensorFlow Federated.
 * Recibe actualizaciones del modelo (pesos/gradientes) desde los dispositivos móviles
 * de forma anónima, sin recibir datos personales.
 * 
 * POST /api/v2/events/fl-update
 * 
 * @version 2.0.0
 * @author Silexar Pulse Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiUnauthorized, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Payload de actualización del modelo federado
 */
interface FLUpdatePayload {
  /** ID único del SDK (por instalación, no usuario) */
  sdkId: string;
  /** Versión del modelo que se está actualizando */
  modelVersion: string;
  /** Plataforma del dispositivo */
  platform: 'ios' | 'android';
  /** Actualizaciones del modelo (gradientes serializados) */
  modelUpdate: ModelGradients;
  /** Metadatos anónimos de la sesión de entrenamiento */
  trainingMetadata: TrainingMetadata;
  /** Timestamp de cuando se generó la actualización */
  timestamp: string;
  /** Firma HMAC para verificación de integridad */
  signature: string;
}

/**
 * Gradientes del modelo (anonimizados)
 */
interface ModelGradients {
  /** Gradientes serializados en base64 */
  gradients: string;
  /** Número de muestras usadas en el entrenamiento local */
  numSamples: number;
  /** Épocas de entrenamiento local */
  localEpochs: number;
  /** Loss promedio del entrenamiento local */
  avgLoss: number;
}

/**
 * Metadatos anónimos del entrenamiento
 */
interface TrainingMetadata {
  /** Tipo de contexto detectado más frecuentemente */
  primaryContext: 'in_transit' | 'stationary' | 'at_home' | 'at_work' | 'unknown';
  /** Nivel de actividad promedio durante la sesión */
  avgActivityLevel: 'low' | 'medium' | 'high';
  /** Duración de la sesión de entrenamiento en minutos */
  sessionDurationMinutes: number;
  /** Hash del dispositivo (para evitar duplicados sin identificar) */
  deviceHash: string;
}

/**
 * Respuesta del servidor de agregación
 */
interface FLUpdateResponse {
  success: boolean;
  message: string;
  nextModelVersion?: string;
  nextUpdateSchedule?: string;
  aggregationStatus?: {
    updatesReceived: number;
    requiredForAggregation: number;
    estimatedAggregationTime?: string;
  };
}

// ============================================================================
// ALMACENAMIENTO DE ACTUALIZACIONES (In-Memory para demo)
// ============================================================================

interface StoredModelUpdate {
  sdkId: string;
  platform: string;
  gradients: ModelGradients;
  metadata: TrainingMetadata;
  receivedAt: Date;
}

// En producción, esto sería Redis o una tabla PostgreSQL
const pendingUpdates: Map<string, StoredModelUpdate[]> = new Map();
const MINIMUM_UPDATES_FOR_AGGREGATION = 10;

// ============================================================================
// VALIDACIÓN
// ============================================================================

function validatePayload(data: unknown): data is FLUpdatePayload {
  if (!data || typeof data !== 'object') return false;
  
  const payload = data as Record<string, unknown>;
  
  return (
    typeof payload.sdkId === 'string' &&
    typeof payload.modelVersion === 'string' &&
    (payload.platform === 'ios' || payload.platform === 'android') &&
    typeof payload.modelUpdate === 'object' &&
    typeof payload.trainingMetadata === 'object' &&
    typeof payload.timestamp === 'string' &&
    typeof payload.signature === 'string'
  );
}

function verifySignature(payload: FLUpdatePayload): boolean {
  const secret = process.env.FL_HMAC_SECRET;
  if (!secret) {
    // In development without secret configured, allow unsigned payloads
    if (process.env.NODE_ENV === 'development') return true;
    logger.error('FL_HMAC_SECRET not configured', undefined, { module: 'fl-update', action: 'verify_signature' });
    return false;
  }

  try {
    const { createHmac } = require('crypto');
    const { signature, ...dataToSign } = payload;
    const expectedSignature = createHmac('sha256', secret)
      .update(JSON.stringify(dataToSign))
      .digest('hex');
    return signature === expectedSignature;
  } catch {
    logger.error('HMAC verification failed', undefined, { module: 'fl-update', action: 'verify_signature' });
    return false;
  }
}

// ============================================================================
// AGREGACIÓN DE MODELOS
// ============================================================================

async function processAggregation(modelVersion: string): Promise<void> {
  const updates = pendingUpdates.get(modelVersion) || [];
  
  if (updates.length < MINIMUM_UPDATES_FOR_AGGREGATION) {
    return;
  }

  // [STRUCTURED-LOG] // logger.info({ message: `[FL-Aggregation] Starting aggregation for model ${modelVersion} with ${updates.length} updates`, module: 'fl-update' });
  
  // TODO: Implementar agregación real con TensorFlow Federated
  // 1. Deserializar gradientes de cada cliente
  // 2. Aplicar Federated Averaging
  // 3. Actualizar modelo global
  // 4. Guardar nuevo modelo en tabla fl_global_models
  
  // Simulación de agregación
  const aggregatedWeights = {
    version: `${modelVersion}.1`,
    timestamp: new Date().toISOString(),
    numContributors: updates.length,
    avgLoss: updates.reduce((sum, u) => sum + u.gradients.avgLoss, 0) / updates.length,
  };
  
  // [STRUCTURED-LOG] // logger.info({ message: `[FL-Aggregation] Completed:`, aggregatedWeights, module: 'fl-update' });
  
  // Limpiar updates procesados
  pendingUpdates.delete(modelVersion);
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
    // Verificar Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { success: false, message: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Verificar API Key del SDK
    const apiKey = request.headers.get('x-silexar-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Missing API key' },
        { status: 401 }
      );
    }

    // Validate API key against configured keys
    const validApiKeys = (process.env.FL_SDK_API_KEYS || '').split(',').filter(Boolean);
    if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey)) {
      logger.warn('fl-update api_key_validation', { module: 'fl-update', action: 'api_key_validation', message: 'Invalid API key' });
      return NextResponse.json(
        { success: false, message: 'Invalid API key' },
        { status: 403 }
      );
    }

    // Parsear payload
    const body = await request.json();
    
    if (!validatePayload(body)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    // Verificar firma
    if (!verifySignature(body)) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Almacenar actualización
    const storedUpdate: StoredModelUpdate = {
      sdkId: body.sdkId,
      platform: body.platform,
      gradients: body.modelUpdate,
      metadata: body.trainingMetadata,
      receivedAt: new Date(),
    };

    const modelVersion = body.modelVersion;
    if (!pendingUpdates.has(modelVersion)) {
      pendingUpdates.set(modelVersion, []);
    }
    const updatesList = pendingUpdates.get(modelVersion)
    if (!updatesList) {
      return NextResponse.json({ success: false, error: 'Model version not found' }, { status: 404 })
    }
    updatesList.push(storedUpdate)

    const currentUpdates = updatesList.length

    // [STRUCTURED-LOG] // logger.info({ message: `[FL-Update] Received update from ${body.sdkId} (${body.platform}) for model ${modelVersion}. Total: ${currentUpdates}`, module: 'fl-update' });

    // Intentar agregación si tenemos suficientes updates
    if (currentUpdates >= MINIMUM_UPDATES_FOR_AGGREGATION) {
      // Ejecutar agregación en background
      processAggregation(modelVersion).catch(err => {
        logger.error('[FL-Update] Aggregation error', err instanceof Error ? err : undefined, { module: 'fl-update' });
      });
    }

    // Respuesta exitosa
    const response: FLUpdateResponse = {
      success: true,
      message: 'Model update received successfully',
      nextModelVersion: modelVersion,
      nextUpdateSchedule: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      aggregationStatus: {
        updatesReceived: currentUpdates,
        requiredForAggregation: MINIMUM_UPDATES_FOR_AGGREGATION,
        estimatedAggregationTime: currentUpdates >= MINIMUM_UPDATES_FOR_AGGREGATION 
          ? 'In progress'
          : undefined,
      },
    };

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    logger.error('[FL-Update] Error processing request:', error instanceof Error ? error : undefined, { module: 'fl-update' });
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  const stats = {
    status: 'healthy',
    endpoint: '/api/v2/events/fl-update',
    pendingModels: Array.from(pendingUpdates.keys()),
    totalPendingUpdates: Array.from(pendingUpdates.values()).reduce((sum, arr) => sum + arr.length, 0),
    minimumForAggregation: MINIMUM_UPDATES_FOR_AGGREGATION,
  };

  return NextResponse.json(stats);
}
