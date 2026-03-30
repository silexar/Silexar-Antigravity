import { logger } from '@/lib/observability';
/**
 * 🔐 SERVICIO DE VAULT TIER0
 * HashiCorp Vault para gestión de secretos
 * Incluye stub para desarrollo y configuración para producción
 */

export interface VaultConfig {
    mode: 'development' | 'production';
    vault: {
        address: string;
        token: string;
        namespace?: string;
        mount: string; // Punto de montaje (ej: 'secret')
    };
}

export interface Secret {
    key: string;
    value: string;
    version: number;
    createdAt: Date;
    metadata?: Record<string, unknown>;
}

export class VaultService {
    private config: VaultConfig;
    private cache: Map<string, Secret> = new Map();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    constructor(config: VaultConfig) {
        this.config = config;
    }

    /**
     * 🔑 Obtiene un secreto de Vault
     */
    async getSecret(key: string): Promise<string> {
        // Verificar cache primero
        const cached = this.cache.get(key);
        if (cached && this.isCacheValid(cached)) {
            logger.info(`📦 Secret obtenido desde cache: ${key}`);
            return cached.value;
        }

        if (this.config.mode === 'development') {
            return this.getSecretStub(key);
        }

        try {
            // PRODUCCIÓN: Llamada real a Vault
            const path = `${this.config.vault.mount}/data/${key}`;
            const response = await fetch(`${this.config.vault.address}/v1/${path}`, {
                method: 'GET',
                headers: {
                    'X-Vault-Token': this.config.vault.token,
                    ...(this.config.vault.namespace && {
                        'X-Vault-Namespace': this.config.vault.namespace
                    })
                }
            });

            if (!response.ok) {
                throw new Error(`Error obteniendo secreto: ${response.statusText}`);
            }

            const data = await response.json();
            const secretValue = data.data.data[key] || data.data.data.value;

            // Guardar en cache
            const secret: Secret = {
                key,
                value: secretValue,
                version: data.data.metadata.version,
                createdAt: new Date(),
                metadata: data.data.metadata
            };

            this.cache.set(key, secret);

            logger.info(`🔐 Secret obtenido de Vault: ${key}`);
            return secretValue;
        } catch (error) {
            logger.error(`Error obteniendo secreto ${key}:`, error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * 🎭 STUB: Obtiene secreto simulado para desarrollo
     */
    private async getSecretStub(key: string): Promise<string> {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 100));

        // Secretos simulados para desarrollo
        const devSecrets: Record<string, string> = {
            // Database
            'database/password': 'dev-db-password-123',
            'database/connection-string': 'postgresql://localhost:5432/silexar_dev',

            // API Keys
            'api/openai-key': 'sk-dev-openai-key-fake',
            'api/stripe-key': 'sk_test_dev_stripe_key',
            'api/sendgrid-key': 'SG.dev-sendgrid-key',

            // OAuth
            'oauth/client-secret': 'dev-oauth-client-secret',
            'oauth/jwt-secret': 'dev-jwt-secret-key-very-long',

            // Encryption
            'encryption/master-key': 'dev-master-encryption-key-256-bits',
            'encryption/data-key': 'dev-data-encryption-key',

            // AWS
            'aws/access-key-id': 'AKIADEV123456789',
            'aws/secret-access-key': 'dev-aws-secret-key-fake',

            // Redis
            'redis/password': 'dev-redis-password',

            // SMTP
            'smtp/password': 'dev-smtp-password'
        };

        const value = devSecrets[key] || `dev-${key}-value`;

        const secret: Secret = {
            key,
            value,
            version: 1,
            createdAt: new Date()
        };

        this.cache.set(key, secret);

        logger.info(`🎭 [DEV MODE] Secret simulado: ${key}`);
        return value;
    }

    /**
     * 💾 Guarda un secreto en Vault
     */
    async setSecret(key: string, value: string, metadata?: Record<string, unknown>): Promise<void> {
        if (this.config.mode === 'development') {
            return this.setSecretStub(key, value);
        }

        try {
            // PRODUCCIÓN: Guardar en Vault
            const path = `${this.config.vault.mount}/data/${key}`;
            const response = await fetch(`${this.config.vault.address}/v1/${path}`, {
                method: 'POST',
                headers: {
                    'X-Vault-Token': this.config.vault.token,
                    'Content-Type': 'application/json',
                    ...(this.config.vault.namespace && {
                        'X-Vault-Namespace': this.config.vault.namespace
                    })
                },
                body: JSON.stringify({
                    data: {
                        [key]: value,
                        ...metadata
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Error guardando secreto: ${response.statusText}`);
            }

            // Invalidar cache
            this.cache.delete(key);

            logger.info(`💾 Secret guardado en Vault: ${key}`);
        } catch (error) {
            logger.error(`Error guardando secreto ${key}:`, error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * 🎭 STUB: Guarda secreto simulado
     */
    private async setSecretStub(key: string, value: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));

        const secret: Secret = {
            key,
            value,
            version: 1,
            createdAt: new Date()
        };

        this.cache.set(key, secret);

        logger.info(`🎭 [DEV MODE] Secret guardado (simulado): ${key}`);
    }

    /**
     * 🗑️ Elimina un secreto de Vault
     */
    async deleteSecret(key: string): Promise<void> {
        if (this.config.mode === 'development') {
            this.cache.delete(key);
            logger.info(`🎭 [DEV MODE] Secret eliminado: ${key}`);
            return;
        }

        try {
            // PRODUCCIÓN: Eliminar de Vault
            const path = `${this.config.vault.mount}/metadata/${key}`;
            const response = await fetch(`${this.config.vault.address}/v1/${path}`, {
                method: 'DELETE',
                headers: {
                    'X-Vault-Token': this.config.vault.token,
                    ...(this.config.vault.namespace && {
                        'X-Vault-Namespace': this.config.vault.namespace
                    })
                }
            });

            if (!response.ok) {
                throw new Error(`Error eliminando secreto: ${response.statusText}`);
            }

            this.cache.delete(key);

            logger.info(`🗑️ Secret eliminado de Vault: ${key}`);
        } catch (error) {
            logger.error(`Error eliminando secreto ${key}:`, error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * 📋 Lista todos los secretos
     */
    async listSecrets(path: string = ''): Promise<string[]> {
        if (this.config.mode === 'development') {
            return this.listSecretsStub();
        }

        try {
            // PRODUCCIÓN: Listar secretos de Vault
            const fullPath = `${this.config.vault.mount}/metadata/${path}`;
            const response = await fetch(`${this.config.vault.address}/v1/${fullPath}?list=true`, {
                method: 'GET',
                headers: {
                    'X-Vault-Token': this.config.vault.token,
                    ...(this.config.vault.namespace && {
                        'X-Vault-Namespace': this.config.vault.namespace
                    })
                }
            });

            if (!response.ok) {
                throw new Error(`Error listando secretos: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data.keys || [];
        } catch (error) {
            logger.error('Error listando secretos:', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * 🎭 STUB: Lista secretos simulados
     */
    private async listSecretsStub(): Promise<string[]> {
        await new Promise(resolve => setTimeout(resolve, 100));

        return [
            'database/password',
            'database/connection-string',
            'api/openai-key',
            'api/stripe-key',
            'oauth/client-secret',
            'encryption/master-key'
        ];
    }

    /**
     * 🔄 Rota un secreto (genera nuevo valor)
     */
    async rotateSecret(key: string, newValue: string): Promise<void> {
        await this.setSecret(key, newValue);
        logger.info(`🔄 Secret rotado: ${key}`);
    }

    /**
     * ⏰ Verifica si el cache es válido
     */
    private isCacheValid(secret: Secret): boolean {
        const age = Date.now() - secret.createdAt.getTime();
        return age < this.CACHE_TTL;
    }

    /**
     * 🧹 Limpia cache
     */
    clearCache(): void {
        this.cache.clear();
        logger.info('🧹 Cache de secretos limpiado');
    }

    /**
     * 🔐 Obtiene múltiples secretos en batch
     */
    async getSecrets(keys: string[]): Promise<Record<string, string>> {
        const results: Record<string, string> = {};

        await Promise.all(
            keys.map(async (key) => {
                try {
                    results[key] = await this.getSecret(key);
                } catch (error) {
                    logger.error(`Error obteniendo secreto ${key}:`, error instanceof Error ? error : undefined);
                    results[key] = '';
                }
            })
        );

        return results;
    }

    /**
     * 📊 Obtiene estadísticas del cache
     */
    getCacheStats(): {
        size: number;
        keys: string[];
        oldestEntry: Date | null;
    } {
        const entries = Array.from(this.cache.values());

        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: entries.length > 0
                ? new Date(Math.min(...entries.map(e => e.createdAt.getTime())))
                : null
        };
    }
}

// Configuración por defecto para desarrollo
export const defaultDevVaultConfig: VaultConfig = {
    mode: 'development',
    vault: {
        address: 'http://localhost:8200',
        token: 'dev-vault-token',
        mount: 'secret'
    }
};

// Instancia singleton para desarrollo
export const vaultService = new VaultService(defaultDevVaultConfig);
