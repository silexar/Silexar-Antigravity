/**
 * Módulo de Configuración - Silexar Pulse
 * Domain Layer - Entidades
 * 
 * Entidades de dominio para el módulo de configuración.
 * Siguen el patrón DDD con validación de invariantes.
 */

import { v4 as uuidv4 } from 'uuid';
import { TipoConfiguracion, CategoriaConfiguracion, NivelSeguridad } from '../value-objects';
import type { ValorConfig } from '../value-objects';

/**
 * Props para crear una configuración
 */
export interface ConfiguracionProps {
    id?: string;
    tenantId: string;
    clave: string;
    valor: unknown;
    tipo: string;
    categoria: string;
    descripcion?: string;
    editable?: boolean;
    visible?: boolean;
    nivelSeguridad?: string;
    grupo?: string;
    orden?: number;
    creadaPor?: string;
    actualizadaPor?: string;
    creadaEn?: Date;
    actualizadaEn?: Date;
}

/**
 * Entidad: Configuracion
 * Representa una configuración individual del sistema
 */
export class Configuracion {
    readonly id: string;
    readonly tenantId: string;
    private _clave: string;
    private _valor: unknown;
    private _tipo: TipoConfiguracion;
    private _categoria: CategoriaConfiguracion;
    private _descripcion: string;
    private _editable: boolean;
    private _visible: boolean;
    private _nivelSeguridad: NivelSeguridad;
    private _grupo: string;
    private _orden: number;
    readonly creadaPor: string;
    private _actualizadaPor: string;
    readonly creadaEn: Date;
    private _actualizadaEn: Date;

    private constructor(props: ConfiguracionProps) {
        this.id = props.id || uuidv4();
        this.tenantId = props.tenantId;
        this._clave = props.clave;
        this._valor = props.valor;
        this._tipo = props.tipo as TipoConfiguracion;
        this._categoria = props.categoria as CategoriaConfiguracion;
        this._descripcion = props.descripcion || '';
        this._editable = props.editable ?? true;
        this._visible = props.visible ?? true;
        this._nivelSeguridad = (props.nivelSeguridad as NivelSeguridad) || NivelSeguridad.PUBLICO;
        this._grupo = props.grupo || '';
        this._orden = props.orden || 0;
        this.creadaPor = props.creadaPor || '';
        this._actualizadaPor = props.actualizadaPor || '';
        this.creadaEn = props.creadaEn || new Date();
        this._actualizadaEn = props.actualizadaEn || new Date();

        this.validarInvariantes();
    }

    /**
     * Crea una nueva configuración
     */
    static crear(props: ConfiguracionProps): Configuracion {
        return new Configuracion(props);
    }

    /**
     * Reconstituye una configuración desde la base de datos
     */
    static reconstituir(props: ConfiguracionProps): Configuracion {
        return new Configuracion(props);
    }

    /**
     * Valida las invariantes de la entidad
     */
    private validarInvariantes(): void {
        if (!this.tenantId) {
            throw new Error('El tenantId es requerido');
        }
        if (!this._clave) {
            throw new Error('La clave es requerida');
        }
        if (!Object.values(TipoConfiguracion).includes(this._tipo)) {
            throw new Error(`Tipo de configuración inválido: ${this._tipo}`);
        }
        if (!Object.values(CategoriaConfiguracion).includes(this._categoria)) {
            throw new Error(`Categoría de configuración inválida: ${this._categoria}`);
        }
    }

    /**
     * Actualiza el valor de la configuración
     */
    actualizarValor(nuevoValor: unknown, actualizadoPor: string): void {
        if (!this._editable) {
            throw new Error('Esta configuración no es editable');
        }

        // Validar tipo
        this.validarTipo(nuevoValor);

        this._valor = nuevoValor;
        this._actualizadaPor = actualizadoPor;
        this._actualizadaEn = new Date();
    }

    /**
     * Valida que el valor corresponda al tipo
     */
    private validarTipo(valor: unknown): void {
        switch (this._tipo) {
            case TipoConfiguracion.STRING:
            case TipoConfiguracion.PASSWORD:
            case TipoConfiguracion.EMAIL:
            case TipoConfiguracion.URL:
                if (typeof valor !== 'string') {
                    throw new Error(`El valor debe ser string para tipo ${this._tipo}`);
                }
                break;
            case TipoConfiguracion.NUMBER:
                if (typeof valor !== 'number' || isNaN(valor)) {
                    throw new Error('El valor debe ser un número válido');
                }
                break;
            case TipoConfiguracion.BOOLEAN:
                if (typeof valor !== 'boolean') {
                    throw new Error('El valor debe ser booleano');
                }
                break;
            case TipoConfiguracion.JSON:
                if (typeof valor !== 'object' || valor === null) {
                    throw new Error('El valor debe ser un objeto JSON');
                }
                break;
        }
    }

    /**
     * Actualiza la descripción
     */
    actualizarDescripcion(nuevaDescripcion: string): void {
        this._descripcion = nuevaDescripcion;
        this._actualizadaEn = new Date();
    }

    /**
     * Actualiza la visibilidad
     */
    actualizarVisibilidad(visible: boolean): void {
        this._visible = visible;
        this._actualizadaEn = new Date();
    }

    /**
     * Actualiza el grupo
     */
    actualizarGrupo(grupo: string): void {
        this._grupo = grupo;
        this._actualizadaEn = new Date();
    }

    /**
     * Actualiza el orden
     */
    actualizarOrden(orden: number): void {
        this._orden = orden;
        this._actualizadaEn = new Date();
    }

    /**
     * Obtiene el valor formateado según el tipo
     */
    getValorFormateado(): string {
        switch (this._tipo) {
            case TipoConfiguracion.BOOLEAN:
                return (this._valor as boolean) ? 'Sí' : 'No';
            case TipoConfiguracion.NUMBER:
                return new Intl.NumberFormat('es-CL').format(this._valor as number);
            case TipoConfiguracion.PASSWORD:
                return '••••••••';
            default:
                return String(this._valor);
        }
    }

    /**
     * Obtiene el valor para mostrar (con máscara si es necesario)
     */
    getValorParaMostrar(): unknown {
        if (this._nivelSeguridad === NivelSeguridad.CONFIDENCIAL ||
            this._nivelSeguridad === NivelSeguridad.CRITICO) {
            if (this._tipo === TipoConfiguracion.PASSWORD) {
                return '••••••••';
            }
        }
        return this._valor;
    }

    // Getters
    get clave(): string { return this._clave; }
    get valor(): unknown { return this._valor; }
    get tipo(): TipoConfiguracion { return this._tipo; }
    get categoria(): CategoriaConfiguracion { return this._categoria; }
    get descripcion(): string { return this._descripcion; }
    get editable(): boolean { return this._editable; }
    get visible(): boolean { return this._visible; }
    get nivelSeguridad(): NivelSeguridad { return this._nivelSeguridad; }
    get grupo(): string { return this._grupo; }
    get orden(): number { return this._orden; }
    get actualizadaPor(): string { return this._actualizadaPor; }
    get actualizadaEn(): Date { return this._actualizadaEn; }

    /**
     * Convierte a JSON para persistencia
     */
    toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            tenantId: this.tenantId,
            clave: this._clave,
            valor: this._valor,
            tipo: this._tipo,
            categoria: this._categoria,
            descripcion: this._descripcion,
            editable: this._editable,
            visible: this._visible,
            nivelSeguridad: this._nivelSeguridad,
            grupo: this._grupo,
            orden: this._orden,
            creadaPor: this.creadaPor,
            actualizadaPor: this._actualizadaPor,
            creadaEn: this.creadaEn.toISOString(),
            actualizadaEn: this._actualizadaEn.toISOString(),
        };
    }

    /**
     * Convierte a JSON para respuesta API
     */
    toAPIModel(): Record<string, unknown> {
        return {
            id: this.id,
            clave: this._clave,
            valor: this.getValorParaMostrar(),
            valorFormateado: this.getValorFormateado(),
            tipo: this._tipo,
            categoria: this._categoria,
            descripcion: this._descripcion,
            editable: this._editable,
            visible: this._visible,
            nivelSeguridad: this._nivelSeguridad,
            grupo: this._grupo,
            orden: this._orden,
            actualizadaEn: this._actualizadaEn.toISOString(),
        };
    }
}

/**
 * Entidad: ConfiguracionGrupo
 * Representa un grupo de configuraciones relacionadas
 */
export interface ConfiguracionGrupoProps {
    id?: string;
    tenantId: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    orden: number;
    configuraciones?: Configuracion[];
}

export class ConfiguracionGrupo {
    readonly id: string;
    readonly tenantId: string;
    private _nombre: string;
    private _descripcion: string;
    private _categoria: CategoriaConfiguracion;
    private _orden: number;
    private _configuraciones: Configuracion[];

    constructor(props: ConfiguracionGrupoProps) {
        this.id = props.id || uuidv4();
        this.tenantId = props.tenantId;
        this._nombre = props.nombre;
        this._descripcion = props.descripcion || '';
        this._categoria = props.categoria as CategoriaConfiguracion;
        this._orden = props.orden;
        this._configuraciones = props.configuraciones || [];
    }

    static crear(props: ConfiguracionGrupoProps): ConfiguracionGrupo {
        return new ConfiguracionGrupo(props);
    }

    agregarConfiguracion(configuracion: Configuracion): void {
        if (configuracion.tenantId !== this.tenantId) {
            throw new Error('La configuración debe pertenecer al mismo tenant');
        }
        this._configuraciones.push(configuracion);
    }

    quitarConfiguracion(configuracionId: string): void {
        this._configuraciones = this._configuraciones.filter(c => c.id !== configuracionId);
    }

    get configuraciones(): Configuracion[] {
        return [...this._configuraciones];
    }

    get cantidad(): number {
        return this._configuraciones.length;
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            tenantId: this.tenantId,
            nombre: this._nombre,
            descripcion: this._descripcion,
            categoria: this._categoria,
            orden: this._orden,
            configuraciones: this._configuraciones.map(c => c.toJSON()),
        };
    }
}

/**
 * Factory para crear configuraciones comunes
 */
export const ConfiguracionFactory = {
    /**
     * Crea una configuración de texto simple
     */
    crearTexto(
        tenantId: string,
        clave: string,
        valor: string,
        opciones: Partial<Omit<ConfiguracionProps, 'tenantId' | 'clave' | 'valor' | 'tipo'>> = {}
    ): Configuracion {
        return Configuracion.crear({
            tenantId,
            clave,
            valor,
            tipo: TipoConfiguracion.STRING,
            categoria: opciones.categoria || 'general',
            ...opciones,
        });
    },

    /**
     * Crea una configuración numérica
     */
    crearNumerica(
        tenantId: string,
        clave: string,
        valor: number,
        opciones: Partial<Omit<ConfiguracionProps, 'tenantId' | 'clave' | 'valor' | 'tipo'>> = {}
    ): Configuracion {
        return Configuracion.crear({
            tenantId,
            clave,
            valor,
            tipo: TipoConfiguracion.NUMBER,
            categoria: opciones.categoria || 'general',
            ...opciones,
        });
    },

    /**
     * Crea una configuración booleana
     */
    crearBooleana(
        tenantId: string,
        clave: string,
        valor: boolean,
        opciones: Partial<Omit<ConfiguracionProps, 'tenantId' | 'clave' | 'valor' | 'tipo'>> = {}
    ): Configuracion {
        return Configuracion.crear({
            tenantId,
            clave,
            valor,
            tipo: TipoConfiguracion.BOOLEAN,
            categoria: opciones.categoria || 'general',
            ...opciones,
        });
    },

    /**
     * Crea una configuración JSON
     */
    crearJSON(
        tenantId: string,
        clave: string,
        valor: Record<string, unknown>,
        opciones: Partial<Omit<ConfiguracionProps, 'tenantId' | 'clave' | 'valor' | 'tipo'>> = {}
    ): Configuracion {
        return Configuracion.crear({
            tenantId,
            clave,
            valor,
            tipo: TipoConfiguracion.JSON,
            categoria: opciones.categoria || 'general',
            ...opciones,
        });
    },
};

// Exportar entidades
export const CONFIGURACION_ENTITIES = {
    Configuracion,
    ConfiguracionGrupo,
    ConfiguracionFactory,
} as const;
