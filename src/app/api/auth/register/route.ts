import { NextRequest } from 'next/server';
import { logger } from '@/lib/observability';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { signToken, signRefreshToken } from '@/lib/api/jwt';
import { apiSuccess, apiError, apiServerError, apiValidationError } from '@/lib/api/response';
import { isDatabaseConnected, getDB } from '@/lib/db';
import { users } from '@/lib/db/users-schema';
import { auditLogger } from '@/lib/security/audit-logger'
import { AuditEventType } from '@/lib/security/audit-types';
import { authRateLimiter } from '@/lib/security/rate-limiter';
import { PasswordSecurityEngine } from '@/lib/security/password-security';

const registerSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // IP rate limit — prevent bulk registrations
    const rlResult = await authRateLimiter.checkRateLimit(request)
    if (!rlResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' } }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rlResult.retryAfter ?? 60) } }
      )
    }

    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiValidationError(parsed.error);
    }

    const { email, password, name } = parsed.data;

    if (!isDatabaseConnected()) {
      return apiServerError('Database connection is not available');
    }

    const db = getDB();

    // Check if email already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return apiError('CONFLICT', 'A user with this email already exists', 409);
    }

    // Check if password appears in known data breaches (HaveIBeenPwned k-anonymity)
    const breachCheck = await PasswordSecurityEngine.checkBreached(password)
    if (breachCheck.breached) {
      return apiError(
        'COMPROMISED_PASSWORD',
        `Esta contraseña aparece en ${breachCheck.count.toLocaleString()} filtraciones de datos conocidas. ` +
          'Por favor elige una contraseña diferente.',
        422
      )
    }

    // Hash password — use centralized PasswordSecurityEngine (Argon2id, not raw bcrypt)
    const passwordHash = await PasswordSecurityEngine.hashPassword(password);

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        category: 'vendedor',
        status: 'pending',
      })
      .returning();

    // Generate tokens
    const sessionId = crypto.randomUUID();
    const accessToken = await signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.category,
      tenantId: newUser.tenantId || '',
      tenantSlug: '',
      sessionId,
    });

    const refreshToken = await signRefreshToken(newUser.id, sessionId);

    // Audit log
    await auditLogger.log({
      type: AuditEventType.USER_CREATED,
      userId: newUser.id,
      message: `New user registered: ${newUser.email}`,
      metadata: { userId: newUser.id },
    });

    // Return user data without password
    const { passwordHash: _, ...userData } = newUser;

    return apiSuccess({
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return apiServerError(
      error instanceof Error ? error.message : 'An unexpected error occurred during registration'
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://app.silexar.com',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
