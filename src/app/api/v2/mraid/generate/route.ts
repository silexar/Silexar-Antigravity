/**
 * SILEXAR PULSE - TIER0+ MRAID GENERATION ENDPOINT
 * Endpoint para generar micro-aplicaciones MRAID v3
 * 
 * POST /api/v2/mraid/generate
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
import {
  createMRAIDBuilder,
  type MRAIDConfig,
  type TemplateType,
  type BillingEventType,
} from '@/lib/mraid/mraid-builder';

// ============================================================================
// TIPOS DE REQUEST/RESPONSE
// ============================================================================

interface GenerateMRAIDRequest {
  template: TemplateType;
  brand: {
    name: string;
    logoBase64?: string;
    sponsorText?: string;
    clickThroughUrl?: string;
    trackingPixels?: string[];
  };
  functionality?: Record<string, unknown>;
  billing: {
    eventType: BillingEventType;
    eventIdentifier: string;
    customEventName?: string;
  };
  appearance?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    borderRadius?: number;
  };
  outputFormat?: 'html' | 'zip' | 'preview';
}

interface GenerateMRAIDResponse {
  success: boolean;
  message: string;
  result?: {
    html?: string;
    manifest: {
      version: string;
      name: string;
      template: string;
      billingEvent: string;
      mraidVersion: string;
      createdAt: string;
    };
    previewUrl?: string;
  };
  error?: string;
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

const VALID_TEMPLATES: TemplateType[] = [
  'loan_calculator',
  'currency_converter',
  'travel_checklist',
  'memory_game',
  'savings_calculator',
  'bmi_calculator',
  'tip_calculator',
  'unit_converter',
];

const VALID_BILLING_EVENTS: BillingEventType[] = [
  'calculation_completed',
  'quote_requested',
  'contact_submitted',
  'conversion_completed',
  'checklist_completed',
  'game_completed',
  'high_score',
  'custom_event',
];

function validateRequest(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const body = data as Record<string, unknown>;

  // Validate template
  if (!body.template || !VALID_TEMPLATES.includes(body.template as TemplateType)) {
    return { valid: false, error: `Invalid template. Valid options: ${VALID_TEMPLATES.join(', ')}` };
  }

  // Validate brand
  if (!body.brand || typeof body.brand !== 'object') {
    return { valid: false, error: 'brand object is required' };
  }

  const brand = body.brand as Record<string, unknown>;
  if (!brand.name || typeof brand.name !== 'string') {
    return { valid: false, error: 'brand.name is required and must be a string' };
  }

  // Validate billing
  if (!body.billing || typeof body.billing !== 'object') {
    return { valid: false, error: 'billing object is required' };
  }

  const billing = body.billing as Record<string, unknown>;
  if (!billing.eventType || !VALID_BILLING_EVENTS.includes(billing.eventType as BillingEventType)) {
    return { valid: false, error: `Invalid billing.eventType. Valid options: ${VALID_BILLING_EVENTS.join(', ')}` };
  }

  if (!billing.eventIdentifier || typeof billing.eventIdentifier !== 'string') {
    return { valid: false, error: 'billing.eventIdentifier is required' };
  }

  return { valid: true };
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

export async function POST(request: NextRequest) {
  const ctx = getUserContext(request);
  if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
  const startTime = performance.now();

  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Parsear body
    const body = await request.json() as GenerateMRAIDRequest;

    // Validar request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', error: validation.error },
        { status: 400 }
      );
    }

    // Construir configuración MRAID
    const mraidConfig: MRAIDConfig = {
      templateType: body.template,
      brand: {
        name: body.brand.name,
        logoBase64: body.brand.logoBase64,
        sponsorText: body.brand.sponsorText || `Patrocinado por ${body.brand.name}`,
        clickThroughUrl: body.brand.clickThroughUrl,
        trackingPixels: body.brand.trackingPixels,
      },
      functionality: body.functionality || {},
      billing: {
        eventType: body.billing.eventType,
        eventIdentifier: body.billing.eventIdentifier,
        customEventName: body.billing.customEventName,
        trackInteractions: true,
      },
      appearance: {
        primaryColor: body.appearance?.primaryColor || '#3b82f6',
        secondaryColor: body.appearance?.secondaryColor || '#1e40af',
        backgroundColor: body.appearance?.backgroundColor || '#f3f4f6',
        textColor: body.appearance?.textColor || '#1f2937',
        fontFamily: body.appearance?.fontFamily || 'Inter',
        borderRadius: body.appearance?.borderRadius || 12,
      },
    };

    // Generar micro-aplicación
    const builder = createMRAIDBuilder(mraidConfig);
    const result = await builder.generate();

    const totalTime = performance.now() - startTime;

    // [STRUCTURED-LOG] // logger.info({ message: `[MRAID Generate API] Generated ${body.template} in ${totalTime.toFixed(0)}ms`, module: 'generate' });

    // Respuesta según formato solicitado
    const outputFormat = body.outputFormat || 'html';

    return NextResponse.json({
      success: true,
      message: `MRAID micro-app generated successfully`,
      result: {
        html: outputFormat === 'html' ? result.combined : undefined,
        manifest: {
          version: result.manifest.version,
          name: result.manifest.name,
          template: result.manifest.template,
          billingEvent: result.manifest.billingEvent,
          mraidVersion: result.manifest.mraidVersion,
          createdAt: result.manifest.createdAt,
        },
        previewUrl: outputFormat === 'preview' 
          ? `/api/v2/mraid/preview?id=${result.manifest.checksum}` 
          : undefined,
      },
    });

  } catch (error) {
    logger.error('[MRAID Generate API] Error:', error instanceof Error ? error : undefined, { module: 'generate' });

    return NextResponse.json(
      {
        success: false,
        message: 'MRAID generation failed',
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
    endpoint: 'POST /api/v2/mraid/generate',
    description: 'Generate MRAID v3 compatible micro-applications with CPVI billing',
    authentication: 'Bearer token required',
    requestBody: {
      template: `string (required) - One of: ${VALID_TEMPLATES.join(', ')}`,
      brand: {
        name: 'string (required) - Brand/advertiser name',
        logoBase64: 'string (optional) - Base64 encoded logo image',
        sponsorText: 'string (optional) - Sponsor text, defaults to "Patrocinado por {name}"',
        clickThroughUrl: 'string (optional) - URL to open on CTA click',
        trackingPixels: 'string[] (optional) - Third-party tracking pixel URLs',
      },
      functionality: 'object (optional) - Template-specific configuration',
      billing: {
        eventType: `string (required) - One of: ${VALID_BILLING_EVENTS.join(', ')}`,
        eventIdentifier: 'string (required) - Unique identifier for billing events',
        customEventName: 'string (optional) - Custom event name if using custom_event type',
      },
      appearance: {
        primaryColor: 'string (optional) - Primary color hex, default: #3b82f6',
        secondaryColor: 'string (optional) - Secondary color hex, default: #1e40af',
        backgroundColor: 'string (optional) - Background color hex, default: #f3f4f6',
        textColor: 'string (optional) - Text color hex, default: #1f2937',
        fontFamily: 'string (optional) - Font family, default: Inter',
        borderRadius: 'number (optional) - Border radius in pixels, default: 12',
      },
      outputFormat: 'string (optional) - html, zip, or preview. Default: html',
    },
    templateConfigurations: {
      loan_calculator: {
        minAmount: 'number - Minimum loan amount',
        maxAmount: 'number - Maximum loan amount',
        defaultAmount: 'number - Default loan amount',
        maxTerm: 'number - Maximum term in years',
        defaultTerm: 'number - Default term in years',
        defaultRate: 'number - Default interest rate',
      },
      currency_converter: {
        baseCurrency: 'string - Default base currency (CLP, USD, EUR)',
      },
      travel_checklist: {
        categories: 'string[] - Checklist categories',
      },
      memory_game: {
        gridSize: 'string - Grid size (3x3, 4x4, 5x5)',
        timeLimit: 'number - Time limit in seconds',
      },
    },
    response: {
      success: 'boolean',
      message: 'string',
      result: {
        html: 'string - Combined HTML/CSS/JS (when outputFormat=html)',
        manifest: 'MRAIDManifest - Metadata about the generated micro-app',
        previewUrl: 'string - Preview URL (when outputFormat=preview)',
      },
    },
    example: {
      template: 'loan_calculator',
      brand: {
        name: 'Banco XYZ',
        sponsorText: 'Patrocinado por Banco XYZ',
        clickThroughUrl: 'https://banco-xyz.cl/prestamos',
      },
      functionality: {
        minAmount: 1000000,
        maxAmount: 100000000,
        defaultRate: 4.5,
        maxTerm: 30,
      },
      billing: {
        eventType: 'calculation_completed',
        eventIdentifier: 'banco-xyz-loan-calc-2024',
      },
      appearance: {
        primaryColor: '#003366',
        secondaryColor: '#0055aa',
      },
    },
  });
  } catch (error) {
    logger.error('[API/V2/MRAID/Generate] Error:', error instanceof Error ? error : undefined);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
