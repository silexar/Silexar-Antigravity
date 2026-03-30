# Auth Module — Architectural Decision

## Decision: Auth lives in `/api/auth/` + `src/lib/auth/`, NOT as a full DDD module

### Context

Silexar Pulse uses **better-auth 1.4.5** as the authentication framework. This library handles
the session lifecycle, OAuth callbacks, JWT issuance, and Drizzle adapter integration directly
via its own internals.

### Why NOT a full DDD auth module?

| DDD pattern | Why redundant here |
|-------------|-------------------|
| Auth domain entity | better-auth owns the `users` schema and session state |
| Auth repository | Drizzle adapter in `src/lib/auth/better-auth-config.ts` IS the repository |
| Auth command handler | `/api/auth/login`, `/api/auth/register` ARE the handlers |
| Auth value objects | `UserRole`, `UserStatus` are defined in `src/lib/security/rbac.ts` |

### Actual auth locations

| Concern | Location |
|---------|---------|
| Session config, OAuth, 2FA, Drizzle adapter | `src/lib/auth/better-auth-config.ts` |
| Client-side auth state | `src/lib/auth/better-auth-client.ts` |
| JWT signing/verification | `src/lib/api/jwt.ts` |
| Login/register/logout/refresh endpoints | `src/app/api/auth/` |
| Role-based access control (14 roles, 14 resources) | `src/lib/security/rbac.ts` |
| Request-level auth context extraction | `src/lib/api/response.ts` → `getUserContext()` |
| Edge middleware (JWT verify on every request) | `src/middleware.ts` |
| Audit logging of auth events | `src/lib/security/audit-logger.ts` |

### What this module retains

`src/modules/auth/guards/` — Thin adapters for use in non-Next.js contexts (e.g., WebSocket
handlers, background jobs). These re-use `src/lib/api/jwt.ts` under the hood.

The `JWTAuthGuard` in `guards/jwt-auth.guard.ts` is intentionally a thin wrapper and should
call `verifyTokenServer()` from `@/lib/api/jwt` at runtime.

### Rule going forward

> **Do NOT expand this module into a full DDD structure.** Adding application layer, command
> handlers, or a separate repository here would duplicate better-auth's internals and create
> two sources of truth for user state.

If user profile management (avatar, preferences, notification settings) grows complex enough
to need DDD encapsulation, create `src/modules/perfil/` instead — keeping auth concerns here.

---
*Decision recorded: 2026-03-24*
*Next review: when better-auth is upgraded to v2.x*
