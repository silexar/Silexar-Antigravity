/**
 * Silexar Pulse - JWT Utilities
 * Server-side JWT signing and verification using jose
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

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters. Set it in .env.local'
    )
  }
  return new TextEncoder().encode(secret)
}

/**
 * Sign a JWT token with HS256
 * Tokens expire in 24 hours by default, refresh tokens in 7 days
 */
export async function signToken(
  payload: Omit<SilexarTokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>,
  expiresIn: string = '24h'
): Promise<string> {
  const secretKey = getSecretKey()

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer('silexar-pulse')
    .setAudience('silexar-pulse-app')
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setJti(crypto.randomUUID())
    .sign(secretKey)
}

/**
 * Sign a refresh token (longer expiry, minimal claims)
 */
export async function signRefreshToken(
  userId: string,
  sessionId: string
): Promise<string> {
  const secretKey = getSecretKey()

  return new SignJWT({ userId, sessionId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer('silexar-pulse')
    .setAudience('silexar-pulse-app')
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(crypto.randomUUID())
    .sign(secretKey)
}

/**
 * Verify and decode a JWT token
 */
export async function verifyTokenServer(
  token: string
): Promise<SilexarTokenPayload | null> {
  try {
    const secretKey = getSecretKey()
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'silexar-pulse',
      audience: 'silexar-pulse-app',
      clockTolerance: 30,
    })
    return payload as SilexarTokenPayload
  } catch {
    return null
  }
}
