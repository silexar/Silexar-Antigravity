/**
 * POST /api/auth/refresh — Rotate access & refresh tokens
 *
 * Reads the refresh token from the `silexar_refresh` httpOnly cookie
 * (scoped to this path). Issues a new access token + rotates the refresh token.
 * The client never sees the refresh token — it lives only in httpOnly cookies.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  verifyTokenServer,
  signToken,
  signRefreshToken,
  type SilexarTokenPayload,
} from '@/lib/api/jwt'
import { apiError, apiServerError } from '@/lib/api/response'
import { logger } from '@/lib/observability';

export async function POST(request: NextRequest) {
  try {
    // Read refresh token from httpOnly cookie — never from the body
    const refreshToken = request.cookies.get('silexar_refresh')?.value

    if (!refreshToken) {
      return apiError('TOKEN_MISSING', 'No refresh token found. Please log in again.', 401)
    }

    // Verify the refresh token
    const payload = await verifyTokenServer(refreshToken)
    if (!payload) {
      return apiError('TOKEN_INVALID', 'Invalid or expired refresh token', 401)
    }

    // Ensure this is a refresh token (type claim set by signRefreshToken)
    if ((payload as SilexarTokenPayload & { type?: string }).type !== 'refresh') {
      return apiError('TOKEN_INVALID', 'Token is not a refresh token', 401)
    }

    // Issue new token pair
    const sessionId = payload.sessionId || crypto.randomUUID()

    const accessToken = await signToken({
      userId: payload.userId,
      email: payload.email || '',
      role: payload.role || 'USER',
      tenantId: payload.tenantId || '',
      tenantSlug: payload.tenantSlug || '',
      sessionId,
    })

    const newRefreshToken = await signRefreshToken(payload.userId, sessionId)

    // Return new access token in body; rotate refresh token in httpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 86400,
      },
    })

    response.cookies.set('silexar_session', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    })

    response.cookies.set('silexar_refresh', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600,
      path: '/api/auth/refresh',
    })

    return response
  } catch (error) {
    logger.error('Error in auth refresh', error instanceof Error ? error : undefined, { module: 'auth', action: 'refresh' })
    return apiServerError('Token refresh service error')
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
