/**
 * SILEXAR PULSE - TIER0+ SDK CONFIG ENDPOINT
 * Endpoint de configuración e inicialización del SDK móvil
 * 
 * POST /api/v2/sdk/config - Obtener configuración inicial
 * GET /api/v2/sdk/config - Documentación
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

interface SDKConfigRequest {
  apiKey: string;
  platform: 'ios' | 'android';
  appVersion: string;
  sdkVersion: string;
  deviceInfo?: {
    osVersion: string;
    deviceModel: string;
    deviceId: string;
  };
}

interface SDKConfigResponse {
  success: boolean;
  message: string;
  config?: {
    clientId: string;
    environment: 'production' | 'staging' | 'development';
    modelVersion: string;
    modelDownloadUrl: string;
    serverEndpoints: {
      adRequest: string;
      events: string;
      flUpdate: string;
      heartbeat: string;
    };
    featureFlags: {
      federatedLearningEnabled: boolean;
      contextDetectionEnabled: boolean;
      narrativeAdsEnabled: boolean;
      mraidUtilitiesEnabled: boolean;
    };
    contextDetection: {
      updateIntervalSeconds: number;
      minConfidenceThreshold: number;
      enabledContextTypes: string[];
    };
    federatedLearning: {
      trainingIntervalHours: number;
      minBatchSize: number;
      onlyOnWifi: boolean;
      onlyWhenCharging: boolean;
    };
    privacySettings: {
      gdprApplicable: boolean;
      ccpaApplicable: boolean;
      dataRetentionDays: number;
    };
    rateLimit: {
      maxRequestsPerMinute: number;
      maxEventsPerSecond: number;
    };
  };
  error?: string;
}

// ============================================================================
// ALMACENAMIENTO DE API KEYS (Simulado - En producción usar base de datos)
// ============================================================================

const validApiKeys: Map<string, { clientId: string; platform: 'ios' | 'android'; status: 'active' | 'revoked' }> = new Map([
  ['sdk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', { clientId: 'client_001', platform: 'ios', status: 'active' }],
  ['sdk_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4', { clientId: 'client_001', platform: 'android', status: 'active' }],
]);

// ============================================================================
// VALIDACIÓN
// ============================================================================

function validateRequest(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const body = data as Record<string, unknown>;

  if (!body.apiKey || typeof body.apiKey !== 'string') {
    return { valid: false, error: 'apiKey is required' };
  }

  if (!body.platform || !['ios', 'android'].includes(body.platform as string)) {
    return { valid: false, error: 'platform must be "ios" or "android"' };
  }

  if (!body.appVersion || typeof body.appVersion !== 'string') {
    return { valid: false, error: 'appVersion is required' };
  }

  if (!body.sdkVersion || typeof body.sdkVersion !== 'string') {
    return { valid: false, error: 'sdkVersion is required' };
  }

  return { valid: true };
}

function validateApiKey(apiKey: string): { valid: boolean; clientId?: string; error?: string } {
  const keyData = validApiKeys.get(apiKey);
  
  if (!keyData) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (keyData.status === 'revoked') {
    return { valid: false, error: 'API key has been revoked' };
  }

  return { valid: true, clientId: keyData.clientId };
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
    // Parsear body
    const body = await request.json() as SDKConfigRequest;

    // Validar request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', error: validation.error },
        { status: 400 }
      );
    }

    // Validar API Key
    const keyValidation = validateApiKey(body.apiKey);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed', error: keyValidation.error },
        { status: 401 }
      );
    }

    // [STRUCTURED-LOG] // logger.info({ message: `[SDK Config] Initializing SDK for ${keyValidation.clientId} on ${body.platform} v${body.sdkVersion}`, module: 'config' });

    // Generar configuración
    const config: SDKConfigResponse['config'] = {
      clientId: keyValidation.clientId!,
      environment: 'production',
      modelVersion: '1.2.3',
      modelDownloadUrl: `https://storage.googleapis.com/silexar-models/${keyValidation.clientId}/model-1.2.3.tflite`,
      serverEndpoints: {
        adRequest: '/api/v2/ads/request',
        events: '/api/v2/events/track',
        flUpdate: '/api/v2/events/fl-update',
        heartbeat: '/api/v2/sdk/heartbeat',
      },
      featureFlags: {
        federatedLearningEnabled: true,
        contextDetectionEnabled: true,
        narrativeAdsEnabled: true,
        mraidUtilitiesEnabled: true,
      },
      contextDetection: {
        updateIntervalSeconds: 30,
        minConfidenceThreshold: 0.7,
        enabledContextTypes: [
          'IN_TRANSIT',
          'WALKING',
          'STATIONARY',
          'AT_HOME',
          'SECOND_SCREEN',
          'ACTIVE_BROWSING',
          'EVENING_RELAXATION',
          'WAITING',
          'COMMUTING',
        ],
      },
      federatedLearning: {
        trainingIntervalHours: 24,
        minBatchSize: 100,
        onlyOnWifi: true,
        onlyWhenCharging: true,
      },
      privacySettings: {
        gdprApplicable: false, // Chile no está bajo GDPR
        ccpaApplicable: false,
        dataRetentionDays: 90,
      },
      rateLimit: {
        maxRequestsPerMinute: 60,
        maxEventsPerSecond: 10,
      },
    };

    return NextResponse.json({
      success: true,
      message: 'SDK configuration retrieved successfully',
      config,
    });

  } catch (error) {
    logger.error('[SDK Config] Error:', error instanceof Error ? error : undefined, { module: 'config' });

    return NextResponse.json(
      {
        success: false,
        message: 'Configuration retrieval failed',
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DOCUMENTATION ENDPOINT
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();
  try {
    return NextResponse.json({
    endpoint: 'POST /api/v2/sdk/config',
    description: 'SDK initialization and configuration endpoint',
    authentication: 'API Key in request body',
    requestBody: {
      apiKey: 'string (required) - SDK API key provided by Silexar Pulse',
      platform: 'string (required) - "ios" or "android"',
      appVersion: 'string (required) - Version of the host app',
      sdkVersion: 'string (required) - Version of the Silexar SDK',
      deviceInfo: {
        osVersion: 'string (optional) - Device OS version',
        deviceModel: 'string (optional) - Device model (hashed)',
        deviceId: 'string (optional) - Unique device identifier (hashed)',
      },
    },
    response: {
      success: 'boolean',
      message: 'string',
      config: {
        clientId: 'string - Client identifier',
        environment: 'string - Environment (production/staging/development)',
        modelVersion: 'string - Current FL model version',
        modelDownloadUrl: 'string - URL to download TFLite model',
        serverEndpoints: 'object - API endpoints for SDK operations',
        featureFlags: 'object - Enabled features',
        contextDetection: 'object - Context detection settings',
        federatedLearning: 'object - FL training settings',
        privacySettings: 'object - Privacy compliance settings',
        rateLimit: 'object - Rate limiting configuration',
      },
    },
    example: {
      request: {
        apiKey: 'sdk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        platform: 'ios',
        appVersion: '2.5.1',
        sdkVersion: '1.2.3',
        deviceInfo: {
          osVersion: '17.2',
          deviceModel: 'iPhone15,2',
        },
      },
    },
  });
  } catch (error) {
    logger.error('[API/V2/SDK/Config] Error:', error instanceof Error ? error : undefined);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
