/**
 * Silexar Pulse - API Versioning Middleware
 * 
 * Provides version negotiation, deprecation warnings, and backward compatibility
 * for API v1 to v2 migration.
 * 
 * Line Reference: src/lib/api/api-versioning.ts:1
 */

import { NextRequest, NextResponse } from 'next/server';

// Supported API versions
export const API_VERSIONS = ['v1', 'v2'] as const;
export type ApiVersion = typeof API_VERSIONS[number];

// Version headers
const VERSION_HEADER = 'X-API-Version';
const DEPRECATED_HEADER = 'X-API-Deprecated';
const MIGRATION_HEADER = 'X-API-Migration-URL';

// Version-specific configurations
export const VERSION_CONFIG: Record<ApiVersion, {
    sunsetDate?: string;
    migrationUrl?: string;
    breakingChanges: string[];
}> = {
    v1: {
        sunsetDate: '2026-12-31',
        migrationUrl: '/api/v2',
        breakingChanges: [
            'Response envelope structure changed',
            'Pagination format updated (cursor-based)',
            'Error codes consolidated',
        ],
    },
    v2: {
        breakingChanges: [],
    },
};

// ─── Version Negotiation ────────────────────────────────────────────────────

export interface VersionInfo {
    version: ApiVersion;
    raw: string | null;
    isDeprecated: boolean;
    sunsetDate?: string;
    breakingChanges: string[];
    migrationUrl?: string;
}

/**
 * Extract and validate API version from request
 */
export function getVersionInfo(request: NextRequest): VersionInfo {
    // Check header first
    const headerVersion = request.headers.get(VERSION_HEADER);
    const acceptHeader = request.headers.get('Accept');

    let version: ApiVersion = 'v2'; // Default to latest
    let raw: string | null = null;

    // Priority: Header > Accept > Path > Default
    if (headerVersion && API_VERSIONS.includes(headerVersion as ApiVersion)) {
        version = headerVersion as ApiVersion;
        raw = headerVersion;
    } else if (acceptHeader?.includes('application/vnd.silexar.v1')) {
        version = 'v1';
        raw = 'Accept header';
    } else if (acceptHeader?.includes('application/vnd.silexar.v2')) {
        version = 'v2';
        raw = 'Accept header';
    }

    const config = VERSION_CONFIG[version];

    return {
        version,
        raw,
        isDeprecated: version === 'v1',
        sunsetDate: config.sunsetDate,
        breakingChanges: config.breakingChanges,
        migrationUrl: config.migrationUrl,
    };
}

/**
 * Apply version-specific headers to response
 */
export function applyVersionHeaders(
    response: NextResponse,
    versionInfo: VersionInfo
): NextResponse {
    // Add current version header
    response.headers.set(VERSION_HEADER, versionInfo.version);

    // Add deprecation header if applicable
    if (versionInfo.isDeprecated) {
        response.headers.set(DEPRECATED_HEADER, 'true');
        response.headers.set('Sunset', versionInfo.sunsetDate || '2026-12-31');

        if (versionInfo.migrationUrl) {
            response.headers.set(MIGRATION_HEADER, versionInfo.migrationUrl);
        }
    }

    // Add RateLimit headers for version awareness
    response.headers.set('X-RateLimit-Version', versionInfo.version);

    return response;
}

// ─── Version Validation ──────────────────────────────────────────────────────

export interface VersionValidationResult {
    valid: boolean;
    error?: string;
    warnings?: string[];
}

/**
 * Validate request is using supported version
 */
export function validateVersion(request: NextRequest): VersionValidationResult {
    const info = getVersionInfo(request);

    if (!API_VERSIONS.includes(info.version as ApiVersion)) {
        return {
            valid: false,
            error: `Unsupported API version: ${info.version}. Supported: ${API_VERSIONS.join(', ')}`,
        };
    }

    const warnings: string[] = [];

    if (info.isDeprecated) {
        warnings.push(
            `API v1 is deprecated and will be sunset on ${info.sunsetDate}.`,
            `Please migrate to v2 at ${info.migrationUrl}.`
        );

        // Add breaking changes warnings
        for (const change of info.breakingChanges) {
            warnings.push(`Breaking: ${change}`);
        }
    }

    return { valid: true, warnings };
}

// ─── Versioned Route Handler ───────────────────────────────────────────────

export type VersionedHandler = (
    request: NextRequest,
    context: { version: ApiVersion; params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Create a version-aware route handler
 */
export function createVersionedRoute(
    handlers: Partial<Record<ApiVersion, VersionedHandler>>,
    defaultHandler: VersionedHandler
): VersionedHandler {
    return async (request, context) => {
        const versionInfo = getVersionInfo(request);
        const handler = handlers[versionInfo.version] || defaultHandler;

        const response = await handler(request, {
            ...context,
            version: versionInfo.version,
        });

        return applyVersionHeaders(response, versionInfo);
    };
}

// ─── Migration Assistant ─────────────────────────────────────────────────────

export interface MigrationStep {
    from: string;
    to: string;
    description: string;
    codeExample?: string;
    breaking: boolean;
}

/**
 * Get migration steps for moving from v1 to v2
 */
export function getMigrationGuide(): MigrationStep[] {
    return [
        {
            from: '/api/v1/users',
            to: '/api/v2/users',
            description: 'Endpoint path updated',
            breaking: false,
        },
        {
            from: '/api/v1/users?page=1&limit=20',
            to: '/api/v2/users?cursor=<token>&limit=20',
            description: 'Pagination now uses cursor-based tokens',
            codeExample: '// Replace page-based pagination\nconst response = await fetch("/api/v2/users?cursor=<next_cursor>");\nconst { data, nextCursor } = await response.json();',
            breaking: true,
        },
        {
            from: '{ "error": "NOT_FOUND", "message": "..." }',
            to: '{ "error": { "code": "RESOURCE_NOT_FOUND", "message": "...", "requestId": "..." } }',
            description: 'Error response format restructured',
            breaking: true,
        },
        {
            from: 'Authorization: Bearer <token>',
            to: 'Authorization: Bearer <token>\nX-Request-ID: <uuid>',
            description: 'Request ID header now required for tracing',
            breaking: false,
        },
    ];
}

// ─── Compatibility Mode ─────────────────────────────────────────────────────

export interface CompatibilityOptions {
    strictMode: boolean;
    includeWarnings: boolean;
    suppressDeprecation: boolean;
}

/**
 * Create a response compatible with v1 format while using v2 internally
 */
export function toV1Compatibility<T>(
    data: T,
    options: CompatibilityOptions = { strictMode: false, includeWarnings: true, suppressDeprecation: false }
): Record<string, unknown> {
    const response: Record<string, unknown> = {
        // V1 envelope structure
        status: 'success',
        data,
    };

    if (options.includeWarnings && !options.suppressDeprecation) {
        response.warnings = [
            'This response is formatted for API v1 compatibility',
            'Migrate to v2 for improved performance and features',
        ];
    }

    return response;
}

/**
 * Convert v1 request format to v2 internal format
 */
export function fromV1Compatibility<T>(body: T, versionInfo: VersionInfo): T {
    // Transform v1 request to v2 format if needed
    if (versionInfo.version === 'v1' && body) {
        // Add v1-specific transformations here
        // Currently no transformations needed as v2 is backward compatible
    }
    return body;
}

// ─── Version Discovery Endpoint ─────────────────────────────────────────────

export function createVersionDiscoveryResponse(): NextResponse {
    const discovery = {
        versions: API_VERSIONS.map((v) => ({
            version: v,
            status: v === 'v1' ? 'deprecated' : 'current',
            sunsetDate: VERSION_CONFIG[v].sunsetDate,
            migrationUrl: VERSION_CONFIG[v].migrationUrl,
            breakingChanges: VERSION_CONFIG[v].breakingChanges,
        })),
        defaultVersion: 'v2',
        documentation: '/api/docs',
        swagger: '/api/v2/swagger.json',
        health: '/api/v2/health',
    };

    return NextResponse.json(discovery, {
        status: 200,
        headers: {
            'Cache-Control': 'public, max-age=3600',
        },
    });
}

export default {
    API_VERSIONS,
    getVersionInfo,
    applyVersionHeaders,
    validateVersion,
    createVersionedRoute,
    getMigrationGuide,
    toV1Compatibility,
    fromV1Compatibility,
    createVersionDiscoveryResponse,
};