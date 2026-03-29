/**
 * SILEXAR PULSE - TIER0+ GENERATE IMAGE ENDPOINT
 * Endpoint para generación de imágenes con IA
 * 
 * POST /api/v2/generate/image
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
  type ImageGenerationPrompt,
  type ImageGenerationResult,
  type ImageStyle,
  type AspectRatio,
  type TargetPlatform,
} from '@/lib/cortex/cortex-generative-ai';

// ============================================================================
// TIPOS DE REQUEST/RESPONSE
// ============================================================================

interface GenerateImageRequest {
  description: string;
  style?: ImageStyle;
  aspectRatio?: AspectRatio;
  platform?: TargetPlatform;
  negativeFeedback?: string[];
  brand?: {
    name: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    tagline?: string;
  };
  numVariants?: number;
}

interface GenerateImageResponse {
  success: boolean;
  message: string;
  images?: ImageGenerationResult[];
  error?: string;
  metadata?: {
    totalGenerationTimeMs: number;
    prompt: string;
    numVariants: number;
  };
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

const VALID_STYLES: ImageStyle[] = [
  'photorealistic', 'illustration', 'minimalist', 'corporate',
  'vibrant', 'dark', 'elegant', 'playful'
];

const VALID_ASPECT_RATIOS: AspectRatio[] = [
  '1:1', '16:9', '9:16', '4:5', '728x90', '300x250', '160x600', '320x50'
];

const VALID_PLATFORMS: TargetPlatform[] = [
  'instagram_story', 'instagram_feed', 'facebook_feed', 'facebook_story',
  'tiktok', 'youtube_thumbnail', 'display_banner', 'email', 'landing_page'
];

function validateRequest(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const body = data as Record<string, unknown>;

  if (!body.description || typeof body.description !== 'string') {
    return { valid: false, error: 'description is required and must be a string' };
  }

  if (body.description.length < 10) {
    return { valid: false, error: 'description must be at least 10 characters' };
  }

  if (body.description.length > 1000) {
    return { valid: false, error: 'description must not exceed 1000 characters' };
  }

  if (body.style && !VALID_STYLES.includes(body.style as ImageStyle)) {
    return { valid: false, error: `Invalid style. Valid options: ${VALID_STYLES.join(', ')}` };
  }

  if (body.aspectRatio && !VALID_ASPECT_RATIOS.includes(body.aspectRatio as AspectRatio)) {
    return { valid: false, error: `Invalid aspectRatio. Valid options: ${VALID_ASPECT_RATIOS.join(', ')}` };
  }

  if (body.platform && !VALID_PLATFORMS.includes(body.platform as TargetPlatform)) {
    return { valid: false, error: `Invalid platform. Valid options: ${VALID_PLATFORMS.join(', ')}` };
  }

  if (body.numVariants !== undefined) {
    const num = body.numVariants as number;
    if (typeof num !== 'number' || num < 1 || num > 8) {
      return { valid: false, error: 'numVariants must be between 1 and 8' };
    }
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
    const body = await request.json() as GenerateImageRequest;

    // Validar request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', error: validation.error },
        { status: 400 }
      );
    }

    // Construir prompt
    const prompt: ImageGenerationPrompt = {
      description: body.description,
      style: body.style,
      aspectRatio: body.aspectRatio,
      platform: body.platform,
      negativeFeedback: body.negativeFeedback,
      brandAssets: body.brand ? {
        brandName: body.brand.name,
        logoUrl: body.brand.logoUrl,
        primaryColor: body.brand.primaryColor,
        secondaryColor: body.brand.secondaryColor,
        tagline: body.brand.tagline,
      } : undefined,
    };

    // Generar imágenes
    const generativeAI = getCortexGenerativeAI();
    const images = await generativeAI.generateImage(prompt);

    // Limitar número de variantes si se especificó
    const maxVariants = body.numVariants || 4;
    const limitedImages = images.slice(0, maxVariants);

    const totalTime = performance.now() - startTime;

    // [STRUCTURED-LOG] // logger.info({ message: `[Generate Image API] Generated ${limitedImages.length} images in ${totalTime.toFixed(0)}ms`, module: 'image' });

    return NextResponse.json({
      success: true,
      message: `Generated ${limitedImages.length} image variants successfully`,
      images: limitedImages,
      metadata: {
        totalGenerationTimeMs: Math.round(totalTime),
        prompt: prompt.description,
        numVariants: limitedImages.length,
      },
    });

  } catch (error) {
    logger.error('[Generate Image API] Error:', error instanceof Error ? error : undefined, { module: 'image' });

    return NextResponse.json(
      {
        success: false,
        message: 'Image generation failed',
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
    endpoint: 'POST /api/v2/generate/image',
    description: 'Generate advertising images using AI (Vertex AI Imagen)',
    authentication: 'Bearer token required',
    requestBody: {
      description: 'string (required) - Description of the image to generate',
      style: `string (optional) - One of: ${VALID_STYLES.join(', ')}`,
      aspectRatio: `string (optional) - One of: ${VALID_ASPECT_RATIOS.join(', ')}`,
      platform: `string (optional) - One of: ${VALID_PLATFORMS.join(', ')}`,
      negativeFeedback: 'string[] (optional) - Things to avoid in the image',
      brand: {
        name: 'string (required if brand provided)',
        logoUrl: 'string (optional)',
        primaryColor: 'string (optional)',
        secondaryColor: 'string (optional)',
        tagline: 'string (optional)',
      },
      numVariants: 'number (optional, 1-8, default: 4)',
    },
    response: {
      success: 'boolean',
      message: 'string',
      images: 'ImageGenerationResult[]',
      metadata: {
        totalGenerationTimeMs: 'number',
        prompt: 'string',
        numVariants: 'number',
      },
    },
    example: {
      description: 'Create a professional banner for a banking loan promotion showing a happy family in front of a new house',
      style: 'corporate',
      aspectRatio: '300x250',
      platform: 'display_banner',
      brand: {
        name: 'Banco XYZ',
        primaryColor: '#003366',
      },
      numVariants: 4,
    },
  });
}
