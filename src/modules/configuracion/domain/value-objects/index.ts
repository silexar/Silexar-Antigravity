/**
 * Módulo de Configuración - Silexar Pulse
 * Domain Layer - Value Objects
 * 
 * Value Objects inmutables para el módulo de configuración.
 * Cada value object valida sus datos en el constructor.
 */

import { z } from 'zod';

/**
 * Enum de tipos de configuración
 */
export enum TipoConfiguracion {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    JSON = 'json',
    PASSWORD = 'password',
    EMAIL = 'email',
    URL = 'url',
}

export const TipoConfiguracionSchema = z.nativeEnum(TipoConfiguracion);

/**
 * Enum de categorías de configuración
 */
export enum CategoriaConfiguracion {
    GENERAL = 'general',
    NOTIFICACIONES = 'notificaciones',
    SEGURIDAD = 'seguridad',
    AI = 'ai',
    INTEGRACIONES = 'integraciones',
    FACTURACION = 'facturacion',
    EMISORAS = 'emisoras',
    USUARIOS = 'usuarios',
    REPORTES = 'reportes',
    PERSONALIZACION = 'personalizacion',
}

export const CategoriaConfiguracionSchema = z.nativeEnum(CategoriaConfiguracion);

/**
 * Value Object: TipoConfig
 * Representa un tipo de configuración con validación
 */
export class TipoConfig {
    readonly value: TipoConfiguracion;

    private constructor(tipo: TipoConfiguracion) {
        this.value = tipo;
    }

    static create(tipo: string | TipoConfiguracion): TipoConfig {
        const tipoEnum = TipoConfiguracionSchema.parse(tipo);
        return new TipoConfig(tipoEnum);
    }

    static isValid(tipo: string): boolean {
        return Object.values(TipoConfiguracion).includes(tipo as TipoConfiguracion);
    }

    equals(other: TipoConfig): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

/**
 * Value Object: CategoriaConfig
 * Representa una categoría de configuración
 */
export class CategoriaConfig {
    readonly value: CategoriaConfiguracion;
    readonly label: string;
    readonly color: string;

    private static readonly LABELS: Record<CategoriaConfiguracion, string> = {
        [CategoriaConfiguracion.GENERAL]: 'General',
        [CategoriaConfiguracion.NOTIFICACIONES]: 'Notificaciones',
        [CategoriaConfiguracion.SEGURIDAD]: 'Seguridad',
        [CategoriaConfiguracion.AI]: 'Inteligencia Artificial',
        [CategoriaConfiguracion.INTEGRACIONES]: 'Integraciones',
        [CategoriaConfiguracion.FACTURACION]: 'Facturación',
        [CategoriaConfiguracion.EMISORAS]: 'Emisoras',
        [CategoriaConfiguracion.USUARIOS]: 'Usuarios',
        [CategoriaConfiguracion.REPORTES]: 'Reportes',
        [CategoriaConfiguracion.PERSONALIZACION]: 'Personalización',
    };

    private static readonly COLORS: Record<CategoriaConfiguracion, string> = {
        [CategoriaConfiguracion.GENERAL]: '#1D5AE8',
        [CategoriaConfiguracion.NOTIFICACIONES]: '#EF9F27',
        [CategoriaConfiguracion.SEGURIDAD]: '#A32D2D',
        [CategoriaConfiguracion.AI]: '#7C3AED',
        [CategoriaConfiguracion.INTEGRACIONES]: '#534AB7',
        [CategoriaConfiguracion.FACTURACION]: '#3B6D11',
        [CategoriaConfiguracion.EMISORAS]: '#0891B2',
        [CategoriaConfiguracion.USUARIOS]: '#059669',
        [CategoriaConfiguracion.REPORTES]: '#0D9488',
        [CategoriaConfiguracion.PERSONALIZACION]: '#DB2777',
    };

    private constructor(categoria: CategoriaConfiguracion) {
        this.value = categoria;
        this.label = CategoriaConfig.LABELS[categoria];
        this.color = CategoriaConfig.COLORS[categoria];
    }

    static create(categoria: string | CategoriaConfiguracion): CategoriaConfig {
        const categoriaEnum = CategoriaConfiguracionSchema.parse(categoria);
        return new CategoriaConfig(categoriaEnum);
    }

    static isValid(categoria: string): boolean {
        return Object.values(CategoriaConfiguracion).includes(categoria as CategoriaConfiguracion);
    }

    equals(other: CategoriaConfig): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    toJSON(): { value: CategoriaConfiguracion; label: string; color: string } {
        return {
            value: this.value,
            label: this.label,
            color: this.color,
        };
    }
}

/**
 * Value Object: ValorConfig
 * Representa un valor de configuración con tipado fuerte
 */
export class ValorConfig {
    readonly value: unknown;
    readonly tipo: TipoConfiguracion;

    private constructor(value: unknown, tipo: TipoConfiguracion) {
        this.value = value;
        this.tipo = tipo;
    }

    static create(value: unknown, tipo: string | TipoConfiguracion): ValorConfig {
        const tipoEnum = TipoConfiguracionSchema.parse(tipo);
        ValorConfig.validate(value, tipoEnum);
        return new ValorConfig(value, tipoEnum);
    }

    private static validate(value: unknown, tipo: TipoConfiguracion): void {
        switch (tipo) {
            case TipoConfiguracion.STRING:
            case TipoConfiguracion.PASSWORD:
            case TipoConfiguracion.EMAIL:
            case TipoConfiguracion.URL:
                if (typeof value !== 'string') {
                    throw new Error(`El valor debe ser string para tipo ${tipo}`);
                }
                break;
            case TipoConfiguracion.NUMBER:
                if (typeof value !== 'number' || isNaN(value)) {
                    throw new Error(`El valor debe ser número para tipo ${tipo}`);
                }
                break;
            case TipoConfiguracion.BOOLEAN:
                if (typeof value !== 'boolean') {
                    throw new Error(`El valor debe ser booleano para tipo ${tipo}`);
                }
                break;
            case TipoConfiguracion.JSON:
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    throw new Error(`El valor debe ser un objeto para tipo ${tipo}`);
                }
                break;
        }
    }

    getAsString(): string {
        if (this.tipo === TipoConfiguracion.BOOLEAN) {
            return this.value ? 'true' : 'false';
        }
        return String(this.value);
    }

    getAsNumber(): number {
        if (this.tipo === TipoConfiguracion.STRING) {
            const num = Number(this.value);
            if (isNaN(num)) throw new Error('No se puede convertir a número');
            return num;
        }
        if (this.tipo !== TipoConfiguracion.NUMBER) {
            throw new Error(`No se puede obtener como número un valor de tipo ${this.tipo}`);
        }
        return this.value as number;
    }

    getAsBoolean(): boolean {
        if (this.tipo === TipoConfiguracion.NUMBER) {
            return (this.value as number) !== 0;
        }
        if (this.tipo !== TipoConfiguracion.BOOLEAN) {
            throw new Error(`No se puede obtener como booleano un valor de tipo ${this.tipo}`);
        }
        return this.value as boolean;
    }

    getAsObject(): Record<string, unknown> {
        if (this.tipo !== TipoConfiguracion.JSON) {
            throw new Error(`No se puede obtener como objeto un valor de tipo ${this.tipo}`);
        }
        return this.value as Record<string, unknown>;
    }

    equals(other: ValorConfig): boolean {
        return this.value === other.value && this.tipo === other.tipo;
    }

    toJSON(): unknown {
        return this.value;
    }
}

/**
 * Value Object: ClaveConfig
 * Representa una clave de configuración validada
 */
export class ClaveConfig {
    readonly value: string;
    private static readonly PATTERN = /^[A-Z][A-Z0-9_]*$/;
    private static readonly MAX_LENGTH = 255;

    private constructor(clave: string) {
        this.value = clave;
    }

    static create(clave: string): ClaveConfig {
        if (!clave || clave.trim().length === 0) {
            throw new Error('La clave no puede estar vacía');
        }
        if (clave.length > ClaveConfig.MAX_LENGTH) {
            throw new Error(`La clave no puede exceder ${ClaveConfig.MAX_LENGTH} caracteres`);
        }
        if (!ClaveConfig.PATTERN.test(clave)) {
            throw new Error('La clave debe ser MAYÚSCULAS con guiones bajos (ej: NOMBRE_EMPRESA)');
        }
        return new ClaveConfig(clave);
    }

    static isValid(clave: string): boolean {
        return ClaveConfig.PATTERN.test(clave) && clave.length <= ClaveConfig.MAX_LENGTH;
    }

    equals(other: ClaveConfig): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

/**
 * Value Object: NivelSeguridad
 * Representa el nivel de seguridad de una configuración
 */
export enum NivelSeguridad {
    PUBLICO = 'publico',
    INTERNO = 'interno',
    CONFIDENCIAL = 'confidencial',
    CRITICO = 'critico',
}

export class NivelSeguridadVO {
    readonly value: NivelSeguridad;
    readonly level: number;

    private constructor(value: NivelSeguridad) {
        this.value = value;
        this.level = NivelSeguridadVO.getLevel(value);
    }

    private static getLevel(value: NivelSeguridad): number {
        const levels: Record<NivelSeguridad, number> = {
            [NivelSeguridad.PUBLICO]: 0,
            [NivelSeguridad.INTERNO]: 1,
            [NivelSeguridad.CONFIDENCIAL]: 2,
            [NivelSeguridad.CRITICO]: 3,
        };
        return levels[value];
    }

    static create(value: string | NivelSeguridad): NivelSeguridadVO {
        if (!Object.values(NivelSeguridad).includes(value as NivelSeguridad)) {
            throw new Error(`Nivel de seguridad inválido: ${value}`);
        }
        return new NivelSeguridadVO(value as NivelSeguridad);
    }

    requiresAuth(): boolean {
        return this.level >= NivelSeguridadVO.getLevel(NivelSeguridad.INTERNO);
    }

    requiresAudit(): boolean {
        return this.level >= NivelSeguridadVO.getLevel(NivelSeguridad.CONFIDENCIAL);
    }

    isMasked(): boolean {
        return this.level >= NivelSeguridadVO.getLevel(NivelSeguridad.CONFIDENCIAL);
    }

    equals(other: NivelSeguridadVO): boolean {
        return this.value === other.value;
    }
}

/**
 * Value Object: RegistroAuditoria
 * Representa un registro de auditoría de configuración
 */
export interface RegistroAuditoriaProps {
    id: string;
    configuracionId: string;
    usuarioId: string;
    accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
    valorAnterior: unknown;
    valorNuevo: unknown;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

export class RegistroAuditoria {
    readonly id: string;
    readonly configuracionId: string;
    readonly usuarioId: string;
    readonly accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';
    readonly valorAnterior: unknown;
    readonly valorNuevo: unknown;
    readonly ipAddress?: string;
    readonly userAgent?: string;
    readonly timestamp: Date;

    private constructor(props: RegistroAuditoriaProps) {
        this.id = props.id;
        this.configuracionId = props.configuracionId;
        this.usuarioId = props.usuarioId;
        this.accion = props.accion;
        this.valorAnterior = props.valorAnterior;
        this.valorNuevo = props.valorNuevo;
        this.ipAddress = props.ipAddress;
        this.userAgent = props.userAgent;
        this.timestamp = props.timestamp;
    }

    static create(props: RegistroAuditoriaProps): RegistroAuditoria {
        return new RegistroAuditoria(props);
    }

    isModificacion(): boolean {
        return this.accion === 'UPDATE';
    }

    getDiff(): { field: string; before: unknown; after: unknown }[] {
        if (!this.isModificacion()) return [];

        const diff: { field: string; before: unknown; after: unknown }[] = [];

        if (this.valorAnterior !== this.valorNuevo) {
            diff.push({
                field: 'valor',
                before: this.valorAnterior,
                after: this.valorNuevo,
            });
        }

        return diff;
    }

    toJSON(): RegistroAuditoriaProps {
        return {
            id: this.id,
            configuracionId: this.configuracionId,
            usuarioId: this.usuarioId,
            accion: this.accion,
            valorAnterior: this.valorAnterior,
            valorNuevo: this.valorNuevo,
            ipAddress: this.ipAddress,
            userAgent: this.userAgent,
            timestamp: this.timestamp,
        };
    }
}

// Exportar todos los value objects
export const CONFIGURACION_VALUE_OBJECTS = {
    TipoConfig,
    CategoriaConfig,
    ValorConfig,
    ClaveConfig,
    NivelSeguridadVO,
    RegistroAuditoria,
} as const;
