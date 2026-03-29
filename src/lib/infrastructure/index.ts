/**
 * SILEXAR PULSE - TIER0+ INFRASTRUCTURE INDEX
 * Barrel export para módulo de infraestructura
 */

export interface InfrastructureConfig {
    readonly environment: 'development' | 'staging' | 'production';
    readonly region: string;
    readonly version: string;
}

export const getInfrastructureConfig = (): InfrastructureConfig => ({
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
    region: process.env.NEXT_PUBLIC_REGION || 'us-east-1',
    version: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
});

export const isProduction = (): boolean => getInfrastructureConfig().environment === 'production';
export const isDevelopment = (): boolean => getInfrastructureConfig().environment === 'development';

export default {
    getInfrastructureConfig,
    isProduction,
    isDevelopment,
};