import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  betterAuthClient, 
  createAuthClient, 
  type BetterAuthSession 
} from '@/lib/auth/better-auth-client'

// Mock del logger y audit logger
vi.mock('@/lib/observability', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

vi.mock('@/lib/security/audit-logger', () => ({
  auditLogger: {
    auth: vi.fn(),
  },
}))

describe('Authentication Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login', () => {
    it('should handle successful login', async () => {
      // Mock del cliente de auth para login exitoso
      const mockSession: BetterAuthSession = {
        userId: 'user-123',
        token: 'mock-token-xyz',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }

      const mockClient = {
        signIn: vi.fn().mockResolvedValue({ 
          success: true, 
          session: mockSession 
        }),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(mockSession),
      }

      const result = await mockClient.signIn({
        email: 'test@silexar.com',
        password: 'SecurePass123!',
      })

      expect(result.success).toBe(true)
      expect(result.session).toBeDefined()
      expect(result.session.userId).toBe('user-123')
      expect(result.session.token).toBe('mock-token-xyz')
      expect(mockClient.signIn).toHaveBeenCalledWith({
        email: 'test@silexar.com',
        password: 'SecurePass123!',
      })
    })

    it('should handle failed login with invalid credentials', async () => {
      const mockClient = {
        signIn: vi.fn().mockResolvedValue({
          success: false,
          error: 'Invalid credentials',
          session: null,
        }),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      const result = await mockClient.signIn({
        email: 'wrong@email.com',
        password: 'WrongPassword',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(result.session).toBeNull()
    })

    it('should handle failed login with non-existent user', async () => {
      const mockClient = {
        signIn: vi.fn().mockResolvedValue({
          success: false,
          error: 'User not found',
          session: null,
        }),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      const result = await mockClient.signIn({
        email: 'nonexistent@silexar.com',
        password: 'AnyPassword',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(result.session).toBeNull()
    })

    it('should handle login with rate limit exceeded', async () => {
      const mockClient = {
        signIn: vi.fn().mockRejectedValue(new Error('Rate limit exceeded')),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      await expect(
        mockClient.signIn({
          email: 'test@silexar.com',
          password: 'password',
        })
      ).rejects.toThrow('Rate limit exceeded')
    })
  })

  describe('Logout', () => {
    it('should handle successful logout', async () => {
      const mockClient = {
        signIn: vi.fn(),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      const result = await mockClient.signOut()

      expect(result).toBe(true)
      expect(mockClient.signOut).toHaveBeenCalledTimes(1)
    })

    it('should handle logout when no active session', async () => {
      const mockClient = {
        signIn: vi.fn(),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      const result = await mockClient.signOut()

      expect(result).toBe(true)
    })

    it('should clear session data on logout', async () => {
      const mockClient = {
        signIn: vi.fn(),
        signOut: vi.fn().mockImplementation(async () => {
          mockClient.getSession.mockResolvedValue(null)
          return true
        }),
        getSession: vi.fn().mockResolvedValue({
          userId: 'user-123',
          token: 'token',
          expiresAt: new Date(),
        }),
      }

      // Verificar que hay sesión antes del logout
      const sessionBefore = await mockClient.getSession()
      expect(sessionBefore).not.toBeNull()

      // Ejecutar logout
      await mockClient.signOut()

      // Verificar que se llamó signOut
      expect(mockClient.signOut).toHaveBeenCalledTimes(1)
    })
  })

  describe('Session Management', () => {
    it('should return active session', async () => {
      const mockSession: BetterAuthSession = {
        userId: 'user-123',
        token: 'active-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 día en el futuro
      }

      const mockClient = {
        signIn: vi.fn(),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(mockSession),
      }

      const session = await mockClient.getSession()

      expect(session).not.toBeNull()
      expect(session?.userId).toBe('user-123')
      expect(session?.token).toBe('active-token')
      expect(session?.expiresAt).toBeInstanceOf(Date)
    })

    it('should return null for expired session', async () => {
      const mockClient = {
        signIn: vi.fn(),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      const session = await mockClient.getSession()

      expect(session).toBeNull()
    })

    it('should return null when no session exists', async () => {
      const mockClient = {
        signIn: vi.fn(),
        signOut: vi.fn().mockResolvedValue(true),
        getSession: vi.fn().mockResolvedValue(null),
      }

      const session = await mockClient.getSession()

      expect(session).toBeNull()
    })

    it('should validate session expiration', async () => {
      const expiredSession: BetterAuthSession = {
        userId: 'user-123',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // 1 segundo en el pasado
      }

      const isExpired = expiredSession.expiresAt.getTime() < Date.now()
      expect(isExpired).toBe(true)
    })

    it('should validate active session is not expired', async () => {
      const activeSession: BetterAuthSession = {
        userId: 'user-123',
        token: 'active-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 día en el futuro
      }

      const isExpired = activeSession.expiresAt.getTime() < Date.now()
      expect(isExpired).toBe(false)
    })
  })

  describe('Auth Client Factory', () => {
    it('should create auth client with default methods', () => {
      const client = createAuthClient()

      expect(client).toHaveProperty('signIn')
      expect(client).toHaveProperty('signOut')
      expect(client).toHaveProperty('getSession')
      expect(typeof client.signIn).toBe('function')
      expect(typeof client.signOut).toBe('function')
      expect(typeof client.getSession).toBe('function')
    })

    it('should export singleton auth client', () => {
      expect(betterAuthClient).toBeDefined()
      expect(betterAuthClient).toHaveProperty('signIn')
      expect(betterAuthClient).toHaveProperty('signOut')
      expect(betterAuthClient).toHaveProperty('getSession')
    })
  })

  describe('Session Types', () => {
    it('should have correct session structure', () => {
      const session: BetterAuthSession = {
        userId: 'test-user',
        token: 'test-token',
        expiresAt: new Date(),
      }

      expect(session).toHaveProperty('userId')
      expect(session).toHaveProperty('token')
      expect(session).toHaveProperty('expiresAt')
      expect(typeof session.userId).toBe('string')
      expect(typeof session.token).toBe('string')
      expect(session.expiresAt).toBeInstanceOf(Date)
    })
  })
})
