/**
 * Silexar Pulse - JWT Utilities
 * Server-side JWT signing and verification using jose
 *
 * Security: access and refresh tokens use SEPARATE secrets
 * so a compromised refresh secret cannot be used to forge access tokens.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export interface SilexarTokenPayload extends JWTPayload {
  userId: string
  email: string
  role: string
  tenantId: string
  tenantSlug: string
  sessionId: string
}

function getAccessSecretKey(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_ACCESS_SECRET must be at least 32 characters. Set it in .env.local'
    )
  }
  return new TextEncoder().encode(secret)
}

function getRefreshSecretKey(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_REFRESH_SECRET must be at least 32 characters. Set it in .env.local'
    )
  }
  return new TextEncoder().encode(secret)
}

/**
 * Sign an access JWT token with HS256 (signed with JWT_ACCESS_SECRET)
 */
export async function signToken(
  payload: Omit<SilexarTokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  expiresIn: string = '1h'
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer('silexar-pulse')
    .setAudience('silexar-pulse-app')
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setJti(crypto.randomUUID())
    .sign(getAccessSecretKey())
}

/**
 * Sign a refresh token (longer expiry, minimal claims, separate secret)
 */
export async function signRefreshToken(
  userId: string,
  sessionId: string
): Promise<string> {
  return new SignJWT({ userId, sessionId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer('silexar-pulse')
    .setAudience('silexar-pulse-refresh')
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(crypto.randomUUID())
    .sign(getRefreshSecretKey())
}

/**
 * Verify and decode an access token
 */
export async function verifyTokenServer(
  token: string
): Promise<SilexarTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecretKey(), {
      issuer: 'silexar-pulse',
      audience: 'silexar-pulse-app',
      clockTolerance: 30,
    })
    return payload as SilexarTokenPayload
  } catch {
    return null
  }
}

/**
 * Verify and decode a refresh token (uses separate secret + audience)
 */
export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecretKey(), {
      issuer: 'silexar-pulse',
      audience: 'silexar-pulse-refresh',
      clockTolerance: 30,
    })
    if (payload['type'] !== 'refresh') return null
    return {
      userId: payload['userId'] as string,
      sessionId: payload['sessionId'] as string,
    }
  } catch {
    return null
  }
}
