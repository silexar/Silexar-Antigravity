/**
 * SILEXAR PULSE - TIER0+ GENERATE TEXT ENDPOINT
 * Endpoint para generación de copy/texto publicitario con IA
 * 
 * POST /api/v2/generate/text
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
  getCortexGenerativeAI,
  type TextGenerationPrompt,
  type TextGenerationResult,
  type TextTone,
  type TextFormat,
} from '@/lib/cortex/cortex-generative-ai';

// ============================================================================
// TIPOS DE REQUEST/RESPONSE
// ============================================================================

interface GenerateTextRequest {
  brief: string;
  tone: TextTone;
  format: TextFormat;
  audience?: {
    ageRange?: string;
    gender?: 'male' | 'female' | 'all';
    interests?: string[];
    location?: string;
    incomeLevel?: 'low' | 'medium' | 'high' | 'luxury';
  };
  keywords?: string[];
  callToAction?: string;
  maxLength?: number;
  brandVoice?: {
    personality: string[];
    doUse?: string[];
    dontUse?: string[];
    examples?: string[];
  };
}

interface GenerateTextResponse {
  success: boolean;
  message: string;
  result?: TextGenerationResult;
  error?: string;
  metadata?: {
    generationTimeMs: number;
    numVariants: number;
  };
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

const VALID_TONES: TextTone[] = [
  'professional', 'friendly', 'energetic', 'urgent',
  'informative', 'emotional', 'humorous', 'inspirational'
];

const VALID_FORMATS: TextFormat[] = [
  'headline', 'tagline', 'body_copy', 'call_to_action',
  'social_post', 'ad_script', 'email_subject', 'email_body', 'radio_mention'
];

function validateRequest(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const body = data as Record<string, unknown>;

  if (!body.brief || typeof body.brief !== 'string') {
    return { valid: false, error: 'brief is required and must be a string' };
  }

  if (body.brief.length < 10) {
    return { valid: false, error: 'brief must be at least 10 characters' };
  }

  if (body.brief.length > 2000) {
    return { valid: false, error: 'brief must not exceed 2000 characters' };
  }

  if (!body.tone || !VALID_TONES.includes(body.tone as TextTone)) {
    return { valid: false, error: `tone is required. Valid options: ${VALID_TONES.join(', ')}` };
  }

  if (!body.format || !VALID_FORMATS.includes(body.format as TextFormat)) {
    return { valid: false, error: `format is required. Valid options: ${VALID_FORMATS.join(', ')}` };
  }

  if (body.maxLength !== undefined) {
    const maxLen = body.maxLength as number;
    if (typeof maxLen !== 'number' || maxLen < 10 || maxLen > 5000) {
      return { valid: false, error: 'maxLength must be between 10 and 5000' };
    }
  }

  if (body.keywords && !Array.isArray(body.keywords)) {
    return { valid: false, error: 'keywords must be an array of strings' };
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
    const body = await request.json() as GenerateTextRequest;

    // Validar request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', error: validation.error },
        { status: 400 }
      );
    }

    // Construir prompt
    const prompt: TextGenerationPrompt = {
      brief: body.brief,
      tone: body.tone,
      format: body.format,
      audience: body.audience ? {
        ageRange: body.audience.ageRange,
        gender: body.audience.gender,
        interests: body.audience.interests,
        location: body.audience.location,
        incomeLevel: body.audience.incomeLevel,
      } : { ageRange: '25-54', gender: 'all' },
      keywords: body.keywords,
      callToAction: body.callToAction,
      maxLength: body.maxLength,
      brandVoice: body.brandVoice ? {
        personality: body.brandVoice.personality,
        doUse: body.brandVoice.doUse || [],
        dontUse: body.brandVoice.dontUse || [],
        examples: body.brandVoice.examples,
      } : undefined,
    };

    // Generar texto
    const generativeAI = getCortexGenerativeAI();
    const result = await generativeAI.generateText(prompt);

    const totalTime = performance.now() - startTime;

    // [STRUCTURED-LOG] // logger.info({ message: `[Generate Text API] Generated text with ${result.variants.length} variants in ${totalTime.toFixed(0)}ms`, module: 'text' });

    return NextResponse.json({
      success: true,
      message: 'Text generated successfully',
      result,
      metadata: {
        generationTimeMs: Math.round(totalTime),
        numVariants: result.variants.length,
      },
    });

  } catch (error) {
    logger.error('[Generate Text API] Error:', error instanceof Error ? error : undefined, { module: 'text' });

    return NextResponse.json(
      {
        success: false,
        message: 'Text generation failed',
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
  return NextResponse.json({
    endpoint: 'POST /api/v2/generate/text',
    description: 'Generate advertising copy using AI (Gemini Pro)',
    authentication: 'Bearer token required',
    requestBody: {
      brief: 'string (required) - Description of what you want to communicate',
      tone: `string (required) - One of: ${VALID_TONES.join(', ')}`,
      format: `string (required) - One of: ${VALID_FORMATS.join(', ')}`,
      audience: {
        ageRange: 'string (optional, e.g., "25-45")',
        gender: 'string (optional) - male, female, or all',
        interests: 'string[] (optional)',
        location: 'string (optional)',
        incomeLevel: 'string (optional) - low, medium, high, or luxury',
      },
      keywords: 'string[] (optional) - Keywords to include',
      callToAction: 'string (optional) - Desired CTA',
      maxLength: 'number (optional, 10-5000)',
      brandVoice: {
        personality: 'string[] (optional)',
        doUse: 'string[] (optional)',
        dontUse: 'string[] (optional)',
        examples: 'string[] (optional)',
      },
    },
    response: {
      success: 'boolean',
      message: 'string',
      result: {
        id: 'string',
        text: 'string',
        variants: 'TextVariant[]',
        tone: 'string',
        format: 'string',
        analysis: {
          readabilityScore: 'number (0-100)',
          emotionalImpact: 'number (0-100)',
          clarity: 'number (0-100)',
          callToActionStrength: 'number (0-100)',
          estimatedCTR: 'number (percentage)',
          suggestions: 'string[]',
        },
      },
    },
    example: {
      brief: 'Promoción de préstamos hipotecarios para familias jóvenes que buscan su primera vivienda',
      tone: 'friendly',
      format: 'social_post',
      audience: {
        ageRange: '25-40',
        gender: 'all',
        interests: ['bienes raíces', 'familia', 'finanzas personales'],
      },
      keywords: ['primera vivienda', 'tasa preferencial', 'sin pie inicial'],
      callToAction: 'Solicita tu pre-aprobación hoy',
    },
  });
}
