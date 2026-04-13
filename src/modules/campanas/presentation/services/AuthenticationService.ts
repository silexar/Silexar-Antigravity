import { logger } from '@/lib/observability';
/**
 * 🔐 SERVICIO DE AUTENTICACIÓN TIER0
 * OAuth 2.0 + OIDC + JWT con refresh tokens
 * Incluye stub para desarrollo y configuración para producción
 */

export interface Usuario {
    id: string;
    email: string;
    nombre: string;
    roles: string[];
    permisos: string[];
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: 'Bearer';
}

export interface AuthConfig {
    mode: 'development' | 'production';
    oauth: {
        provider: 'auth0' | 'keycloak' | 'okta' | 'custom';
        clientId: string;
        clientSecret: string;
        domain: string;
        redirectUri: string;
        scope: string;
    };
    jwt: {
        accessTokenExpiry: number;  // segundos
        refreshTokenExpiry: number; // segundos
        algorithm: 'RS256' | 'HS256';
    };
}

export class AuthenticationService {
    private config: AuthConfig;
    private currentUser: Usuario | null = null;
    private tokens: TokenPair | null = null;
    private refreshTimer: NodeJS.Timeout | null = null;

    constructor(config: AuthConfig) {
        this.config = config;
        this.loadStoredSession();
    }

    /**
     * 🔑 Login con OAuth 2.0 + OIDC
     */
    async login(email: string, password: string): Promise<{ user: Usuario; tokens: TokenPair }> {
        if (this.config.mode === 'development') {
            return this.loginStub(email, password);
        }

        try {
            // PRODUCCIÓN: Llamada real a OAuth provider
            const response = await fetch(`${this.config.oauth.domain}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'password',
                    client_id: this.config.oauth.clientId,
                    client_secret: this.config.oauth.clientSecret,
                    username: email,
                    password: password,
                    scope: this.config.oauth.scope
                })
            });

            if (!response.ok) {
                throw new Error('Autenticación fallida');
            }

            const data = await response.json();

            // Decodificar JWT para obtener información del usuario
            const user = this.decodeJWT(data.access_token);

            this.tokens = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
                tokenType: 'Bearer'
            };

            this.currentUser = user;
            this.saveSession();
            this.scheduleTokenRefresh();

            return { user, tokens: this.tokens };
        } catch (error) {
            logger.error('Error en login:', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * 🎭 STUB: Login simulado para desarrollo
     */
    private async loginStub(email: string, password: string): Promise<{ user: Usuario; tokens: TokenPair }> {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simular validación
        if (!email || !password) {
            throw new Error('Email y password requeridos');
        }

        // Usuario simulado
        const user: Usuario = {
            id: 'dev-user-123',
            email: email,
            nombre: email.split('@')[0],
            roles: ['ADMIN', 'USER'],
            permisos: ['CREAR_CAMPANA', 'EDITAR_CAMPANA', 'ELIMINAR_CAMPANA', 'VER_REPORTES']
        };

        // Tokens simulados
        const tokens: TokenPair = {
            accessToken: this.generateFakeJWT(user),
            refreshToken: `refresh_${Math.random().toString(36).substr(2, 9)}`,
            expiresIn: 3600, // 1 hora
            tokenType: 'Bearer'
        };

        this.currentUser = user;
        this.tokens = tokens;
        this.saveSession();
        this.scheduleTokenRefresh();

        logger.info(`🎭 [DEV MODE] Login simulado exitoso — userId: ${user.id}`);

        return { user, tokens };
    }

    /**
     * 🔄 Refresh token
     */
    async refreshAccessToken(): Promise<TokenPair> {
        if (!this.tokens?.refreshToken) {
            throw new Error('No hay refresh token disponible');
        }

        if (this.config.mode === 'development') {
            return this.refreshTokenStub();
        }

        try {
            // PRODUCCIÓN: Llamada real para refresh
            const response = await fetch(`${this.config.oauth.domain}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    client_id: this.config.oauth.clientId,
                    client_secret: this.config.oauth.clientSecret,
                    refresh_token: this.tokens.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Refresh token fallido');
            }

            const data = await response.json();

            this.tokens = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token || this.tokens.refreshToken,
                expiresIn: data.expires_in,
                tokenType: 'Bearer'
            };

            this.saveSession();
            this.scheduleTokenRefresh();

            return this.tokens;
        } catch (error) {
            logger.error('Error en refresh token:', error instanceof Error ? error : undefined);
            this.logout();
            throw error;
        }
    }

    /**
     * 🎭 STUB: Refresh token simulado
     */
    private async refreshTokenStub(): Promise<TokenPair> {
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!this.currentUser) {
            throw new Error('No hay usuario autenticado');
        }

        const tokens: TokenPair = {
            accessToken: this.generateFakeJWT(this.currentUser),
            refreshToken: this.tokens!.refreshToken,
            expiresIn: 3600,
            tokenType: 'Bearer'
        };

        this.tokens = tokens;
        this.saveSession();

        logger.info('🎭 [DEV MODE] Token refrescado');

        return tokens;
    }

    /**
     * 🚪 Logout
     */
    async logout(): Promise<void> {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (this.config.mode === 'production' && this.tokens) {
            try {
                // PRODUCCIÓN: Revocar tokens en el servidor
                await fetch(`${this.config.oauth.domain}/oauth/revoke`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.tokens.accessToken}`
                    },
                    body: JSON.stringify({
                        token: this.tokens.refreshToken,
                        token_type_hint: 'refresh_token'
                    })
                });
            } catch (error) {
                logger.error('Error revocando tokens:', error instanceof Error ? error : undefined);
            }
        }

        this.currentUser = null;
        this.tokens = null;
        this.clearSession();

        logger.info('👋 Logout exitoso');
    }

    /**
     * 👤 Obtiene usuario actual
     */
    getCurrentUser(): Usuario | null {
        return this.currentUser;
    }

    /**
     * 🎫 Obtiene access token actual
     */
    getAccessToken(): string | null {
        return this.tokens?.accessToken || null;
    }

    /**
     * ✅ Verifica si está autenticado
     */
    isAuthenticated(): boolean {
        return this.currentUser !== null && this.tokens !== null;
    }

    /**
     * 🔐 Verifica si tiene permiso
     */
    hasPermission(permission: string): boolean {
        return this.currentUser?.permisos.includes(permission) || false;
    }

    /**
     * 👥 Verifica si tiene rol
     */
    hasRole(role: string): boolean {
        return this.currentUser?.roles.includes(role) || false;
    }

    /**
     * 🔓 Decodifica JWT (sin verificar firma en desarrollo)
     */
    private decodeJWT(token: string): Usuario {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('JWT inválido');
            }

            const payload = JSON.parse(atob(parts[1]));

            return {
                id: payload.sub || payload.user_id,
                email: payload.email,
                nombre: payload.name || payload.email.split('@')[0],
                roles: payload.roles || [],
                permisos: payload.permissions || []
            };
        } catch (error) {
            logger.error('Error decodificando JWT:', error instanceof Error ? error : undefined);
            throw new Error('Token inválido');
        }
    }

    /**
     * 🎭 Genera JWT falso para desarrollo
     */
    private generateFakeJWT(user: Usuario): string {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.id,
            email: user.email,
            name: user.nombre,
            roles: user.roles,
            permissions: user.permisos,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        }));
        const signature = btoa('fake-signature');

        return `${header}.${payload}.${signature}`;
    }

    /**
     * ⏰ Programa refresh automático de token
     */
    private scheduleTokenRefresh(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (!this.tokens) return;

        // Refrescar 5 minutos antes de expirar
        const refreshIn = (this.tokens.expiresIn - 300) * 1000;

        this.refreshTimer = setTimeout(async () => {
            try {
                await this.refreshAccessToken();
            } catch (error) {
                logger.error('Error en refresh automático:', error instanceof Error ? error : undefined);
            }
        }, refreshIn);
    }

    /**
     * 💾 Guarda sesión — solo datos de usuario NO sensibles.
     *
     * SECURITY: Tokens JWT NUNCA se almacenan en localStorage (XSS-accessible).
     * Los tokens viven únicamente en memoria (this.tokens). Si la página se recarga,
     * el usuario debe re-autenticarse. Para persistencia segura entre recargas
     * usar httpOnly cookies gestionadas por SecurityInitializer (src/components/security-initializer.tsx).
     */
    private saveSession(): void {
        if (typeof window === 'undefined') return;

        try {
            // Solo guardamos datos de UI (nombre, rol) — sin tokens ni credentials
            if (this.currentUser) {
                const safeUserData = {
                    id: this.currentUser.id,
                    nombre: this.currentUser.nombre,
                    roles: this.currentUser.roles,
                };
                localStorage.setItem('auth_user', JSON.stringify(safeUserData));
            }
            // NEVER: localStorage.setItem('auth_tokens', ...) — tokens solo en memoria
        } catch (error) {
            logger.error('Error guardando sesión:', error instanceof Error ? error : undefined);
        }
    }

    /**
     * 📥 Carga datos de UI desde localStorage (solo datos no sensibles).
     * Los tokens NO se restauran desde storage — requieren re-autenticación.
     */
    private loadStoredSession(): void {
        if (typeof window === 'undefined') return;

        try {
            const storedUser = localStorage.getItem('auth_user');
            // SECURITY: 'auth_tokens' ya no se persiste — ignorar si existía de versiones anteriores
            localStorage.removeItem('auth_tokens');

            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                logger.info('📥 Datos de usuario UI restaurados desde localStorage (tokens requieren re-auth)');
            }
        } catch (error) {
            logger.error('Error cargando sesión:', error instanceof Error ? error : undefined);
            this.clearSession();
        }
    }

    /**
     * 🗑️ Limpia sesión de localStorage
     */
    private clearSession(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_tokens'); // limpieza de clave legacy
        } catch (error) {
            logger.error('Error limpiando sesión:', error instanceof Error ? error : undefined);
        }
    }

    /**
     * 🔧 Interceptor para agregar token a requests
     */
    createAuthInterceptor() {
        return async (config: RequestInit): Promise<RequestInit> => {
            const token = this.getAccessToken();

            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                };
            }

            return config;
        };
    }
}

// Configuración por defecto para desarrollo
export const defaultDevConfig: AuthConfig = {
    mode: 'development',
    oauth: {
        provider: 'custom',
        clientId: process.env.OAUTH_CLIENT_ID || '',
        clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
        domain: 'http://localhost:3000',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'openid profile email'
    },
    jwt: {
        accessTokenExpiry: 3600,
        refreshTokenExpiry: 604800,
        algorithm: 'HS256'
    }
};

// Instancia singleton para desarrollo
export const authService = new AuthenticationService(defaultDevConfig);
