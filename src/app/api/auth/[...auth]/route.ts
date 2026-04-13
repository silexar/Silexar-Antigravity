/**
 * Better-Auth API Route Handler
 *
 * Catch-all route for Better-Auth endpoints.
 * Delegates all auth operations to the Better-Auth instance.
 */

import { auth } from '@/lib/auth/better-auth-config'
import { NextRequest } from 'next/server'

export const { handler: GET, handler: POST, handler: PUT, handler: PATCH, handler: DELETE } = {
  handler: async (request: NextRequest) => {
    return auth.handler(request)
  },
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}
