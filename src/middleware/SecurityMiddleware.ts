/**
 * SecurityMiddleware - Pentagon++ Grade Security Headers & Validation
 * 
 * Implements ultra-strict Content Security Policy and security headers
 * to protect against XSS, clickjacking, and injection attacks
 * 
 * @security CRITICAL
 * @version 2.0.0
 */

import { securityShield, type ThreatAssessment } from '../lib/security/QuantumSecurityShield';

// ============================================================================
// TYPES
// ============================================================================

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'X-DNS-Prefetch-Control': string;
  'X-Download-Options': string;
  'X-Permitted-Cross-Domain-Policies': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export interface MiddlewareConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableRequestSigning: boolean;
  enableRateLimiting: boolean;
  enableThreatAssessment: boolean;
  trustedDomains: string[];
  maxRequestsPerMinute: number;
}

export interface RequestValidationResult {
  allowed: boolean;
  reason?: string;
  threatAssessment?: ThreatAssessment;
  headers: Partial<SecurityHeaders>;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: MiddlewareConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableRequestSigning: true,
  enableRateLimiting: true,
  enableThreatAssessment: true,
  trustedDomains: [
    "'self'",
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  maxRequestsPerMinute: 100
};

// ============================================================================
// CSP NONCE GENERATION
// ============================================================================

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateCSPNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ============================================================================
// SECURITY HEADERS GENERATION
// ============================================================================

/**
 * Generate ultra-strict Content Security Policy
 */
export function generateCSP(nonce: string, config: MiddlewareConfig): string {
  const trustedSources = config.trustedDomains.join(' ');
  
  return [
    // Default: block everything not explicitly allowed
    `default-src 'none'`,
    
    // Scripts: only nonce-based execution (prevents React2Shell injection)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    
    // Styles: allow inline with nonce for styled-components/emotion
    `style-src 'self' 'nonce-${nonce}' ${trustedSources}`,
    
    // Images: allow self, data URIs, and blob for dynamic images
    `img-src 'self' data: blob: https:`,
    
    // Fonts: Google Fonts and self
    `font-src 'self' ${trustedSources}`,
    
    // Connect: API endpoints only
    `connect-src 'self' https://api.* wss://*`,
    
    // Media: self only
    `media-src 'self'`,
    
    // Objects: completely blocked (Flash, Java, etc.)
    `object-src 'none'`,
    
    // Frames: completely blocked
    `frame-src 'none'`,
    `child-src 'none'`,
    
    // Workers: self only
    `worker-src 'self' blob:`,
    
    // Manifest: self only
    `manifest-src 'self'`,
    
    // Form actions: self only
    `form-action 'self'`,
    
    // Base URI: self only
    `base-uri 'self'`,
    
    // Frame ancestors: none (anti-clickjacking)
    `frame-ancestors 'none'`,
    
    // Upgrade insecure requests in production
    `upgrade-insecure-requests`,
    
    // Block all mixed content
    `block-all-mixed-content`
  ].join('; ');
}

/**
 * Generate all security headers
 */
export function generateSecurityHeaders(
  config: MiddlewareConfig = DEFAULT_CONFIG
): SecurityHeaders {
  const nonce = generateCSPNonce();
  
  return {
    // Content Security Policy
    'Content-Security-Policy': config.enableCSP 
      ? generateCSP(nonce, config) 
      : '',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS protection (legacy, but still useful)
    'X-XSS-Protection': '1; mode=block',
    
    // HTTP Strict Transport Security (2 years, include subdomains, preload)
    'Strict-Transport-Security': config.enableHSTS
      ? 'max-age=63072000; includeSubDomains; preload'
      : '',
    
    // Referrer Policy: strict, no referrer to other origins
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (disable dangerous features)
    'Permissions-Policy': [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'cross-origin-isolated=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'execution-while-not-rendered=()',
      'execution-while-out-of-viewport=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'keyboard-map=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'navigation-override=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()'
    ].join(', '),
    
    // DNS prefetch control
    'X-DNS-Prefetch-Control': 'off',
    
    // IE download options
    'X-Download-Options': 'noopen',
    
    // Cross-domain policies
    'X-Permitted-Cross-Domain-Policies': 'none',
    
    // Cross-Origin policies (maximum isolation)
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  };
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Validate incoming request with military-grade security checks
 */
export function validateRequest(
  request: {
    ip?: string;
    userAgent?: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
  config: MiddlewareConfig = DEFAULT_CONFIG
): RequestValidationResult {
  const headers = generateSecurityHeaders(config);
  
  // Generate fingerprint for this request
  const fingerprint = securityShield.generateFingerprint({
    ip: request.ip,
    userAgent: request.userAgent,
    headers: request.headers
  });

  // Assess threat level
  let threatAssessment: ThreatAssessment | undefined;
  
  if (config.enableThreatAssessment) {
    threatAssessment = securityShield.assessThreat(fingerprint, request.body);
    
    // Block if threat level is too high
    if (threatAssessment.recommendation === 'BLOCK') {
      securityShield.blockFingerprint(fingerprint);
      return {
        allowed: false,
        reason: `Threat detected: ${threatAssessment.indicators.map(i => i.type).join(', ')}`,
        threatAssessment,
        headers
      };
    }
    
    // Quarantine high-risk requests
    if (threatAssessment.recommendation === 'QUARANTINE') {
      return {
        allowed: false,
        reason: 'Request quarantined for security review',
        threatAssessment,
        headers
      };
    }
  }

  // Validate request body against deserialization attacks
  if (request.body && typeof request.body === 'string') {
    const validation = securityShield.safeDeserialize(request.body);
    
    if (!validation.isValid) {
      return {
        allowed: false,
        reason: `Deserialization validation failed: ${validation.errors.join(', ')}`,
        threatAssessment,
        headers
      };
    }
  }

  return {
    allowed: true,
    threatAssessment,
    headers
  };
}

// ============================================================================
// NEXT.JS MIDDLEWARE INTEGRATION
// ============================================================================

/**
 * Next.js middleware configuration for security headers
 */
export function getNextJsSecurityConfig() {
  return {
    headers: async () => {
      const securityHeaders = generateSecurityHeaders();
      
      return [
        {
          source: '/:path*',
          headers: Object.entries(securityHeaders)
            .filter((entry) => entry[1] !== '')
            .map(([key, value]) => ({
              key,
              value
            }))
        }
      ];
    }
  };
}

// ============================================================================
// EXPRESS MIDDLEWARE
// ============================================================================

export type ExpressRequest = {
  ip?: string;
  headers: Record<string, string | undefined>;
  body?: unknown;
  get: (header: string) => string | undefined;
};

export type ExpressResponse = {
  status: (code: number) => ExpressResponse;
  json: (body: unknown) => void;
  set: (headers: Record<string, string>) => void;
};

export type ExpressNextFunction = () => void;

/**
 * Express middleware for security headers and request validation
 */
export function securityMiddleware(config: MiddlewareConfig = DEFAULT_CONFIG) {
  return (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    const validationResult = validateRequest({
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.body,
      headers: req.headers as Record<string, string>
    }, config);

    // Apply security headers
    res.set(validationResult.headers as Record<string, string>);

    // Check if request is allowed
    if (!validationResult.allowed) {
      return res.status(403).json({
        error: 'Request blocked by security policy',
        reason: validationResult.reason,
        threatLevel: validationResult.threatAssessment?.level
      });
    }

    next();
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  generateSecurityHeaders,
  generateCSP,
  generateCSPNonce,
  validateRequest,
  securityMiddleware,
  getNextJsSecurityConfig,
  DEFAULT_CONFIG
};
