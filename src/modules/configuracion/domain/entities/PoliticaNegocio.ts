/**
 * 🏗️ SILEXAR PULSE - Módulo de Políticas de Negocio
 * 
 * @description Motor de reglas de negocio con constructor visual
 * Categorías: Riesgo, Pricing, Workflow, Renovación, Compliance
 * 
 * @version 2025.1.0
 * @tier TIER_CORE - DDD Completo
 * @phase FASE 2: Intelligence & Automation
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Condición de una política
 */
export const CondicionSchema = z.object({
    campo: z.string().min(1),
    operador: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'between', 'is_null', 'is_not_null']),
    valor: z.union([z.string(), z.number(), z.boolean()]).optional(),
    valorFinal: z.union([z.string(), z.number()]).optional(), // Para 'between'
});

export type CondicionProps = z.infer<typeof CondicionSchema>;

/**
 * Acción automática de una política
 */
export const AccionAutomaticaSchema = z.object({
    tipo: z.enum(['notificar', 'aprobar', 'rechazar', 'asignar', 'actualizar', 'escalonar', 'generar_alerta', 'bloquear']),
    destino: z.string().optional(), // email, userId, rol
    plantilla: z.string().optional(),
    parametros: z.record(z.string(), z.unknown()).optional(),
});

export type AccionAutomaticaProps = z.infer<typeof AccionAutomaticaSchema>;

/**
 * Operador lógico para combinar condiciones
 */
export type OperadorLogico = 'AND' | 'OR';

// ═══════════════════════════════════════════════════════════════════
// ENTITY: PoliticaNegocio
// ═══════════════════════════════════════════════════════════════════

export const PoliticaNegocioSchema = z.object({
    id: z.string().uuid().optional(),
    tenantId: z.string().uuid(),
    nombre: z.string().min(3).max(200),
    descripcion: z.string().max(1000).optional(),
    categoria: z.enum(['RIESGO', 'PRICING', 'WORKFLOW', 'RENOVACION', 'COMPLIANCE', 'GENERAL']),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).default('MEDIA'),
    condiciones: z.array(z.object({
        operadorLogico: z.enum(['AND', 'OR']).default('AND'),
        condiciones: z.array(CondicionSchema),
    })).min(1),
    acciones: z.array(AccionAutomaticaSchema).min(1),
    activa: z.boolean().default(true),
    fechaInicio: z.string().datetime().optional(),
    fechaFin: z.string().datetime().optional(),
    version: z.number().int().positive().default(1),
    requiereAprobacion: z.boolean().default(false),
    aprobadorId: z.string().uuid().optional(),
    metadatos: z.record(z.string(), z.unknown()).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    createdBy: z.string().uuid().optional(),
});

export type PoliticaNegocioProps = z.infer<typeof PoliticaNegocioSchema>;

/**
 * Entidad de Política de Negocio
 */
export class PoliticaNegocio {
    private constructor(private props: PoliticaNegocioProps) {
        this.validate();
    }

    static create(props: Omit<PoliticaNegocioProps, 'id' | 'version' | 'createdAt' | 'updatedAt'>): PoliticaNegocio {
        const now = new Date().toISOString();
        return new PoliticaNegocio({
            ...props,
            id: crypto.randomUUID(),
            version: 1,
            createdAt: now,
            updatedAt: now,
        });
    }

    static reconstitute(props: PoliticaNegocioProps): PoliticaNegocio {
        return new PoliticaNegocio(props);
    }

    private validate(): void {
        const result = PoliticaNegocioSchema.safeParse(this.props);
        if (!result.success) {
            throw new Error(`Política inválida: ${result.error.message}`);
        }
    }

    get id(): string { return this.props.id!; }
    get tenantId(): string { return this.props.tenantId; }
    get nombre(): string { return this.props.nombre; }
    get descripcion(): string { return this.props.descripcion || ''; }
    get categoria(): string { return this.props.categoria; }
    get prioridad(): string { return this.props.prioridad; }
    get condiciones(): PoliticaNegocioProps['condiciones'] { return this.props.condiciones; }
    get acciones(): AccionAutomaticaProps[] { return this.props.acciones; }
    get activa(): boolean { return this.props.activa; }
    get version(): number { return this.props.version; }

    estaVigente(): boolean {
        const now = new Date();
        const inicio = this.props.fechaInicio ? new Date(this.props.fechaInicio) : null;
        const fin = this.props.fechaFin ? new Date(this.props.fechaFin) : null;

        if (inicio && now < inicio) return false;
        if (fin && now > fin) return false;
        return this.props.activa;
    }

    evaluarCondiciones(contexto: Record<string, unknown>): boolean {
        for (const grupo of this.props.condiciones) {
            const resultados = grupo.condiciones.map(condicion => {
                const valorContexto = this.obtenerValorCampo(contexto, condicion.campo);
                return this.evaluarCondicionUnica(condicion, valorContexto);
            });

            const grupoCumple = grupo.operadorLogico === 'AND'
                ? resultados.every(r => r)
                : resultados.some(r => r);

            if (!grupoCumple) return false;
        }
        return true;
    }

    private obtenerValorCampo(contexto: Record<string, unknown>, campo: string): unknown {
        const partes = campo.split('.');
        let valor: unknown = contexto;
        for (const parte of partes) {
            if (typeof valor === 'object' && valor !== null) {
                valor = (valor as Record<string, unknown>)[parte];
            } else {
                return undefined;
            }
        }
        return valor;
    }

    private evaluarCondicionUnica(condicion: CondicionProps, valorContexto: unknown): boolean {
        const { operador, valor, valorFinal } = condicion;

        switch (operador) {
            case 'equals':
                return valorContexto === valor;
            case 'not_equals':
                return valorContexto !== valor;
            case 'greater_than':
                return typeof valorContexto === 'number' && valorContexto > (valor as number);
            case 'less_than':
                return typeof valorContexto === 'number' && valorContexto < (valor as number);
            case 'contains':
                return typeof valorContexto === 'string' && valorContexto.includes(String(valor));
            case 'starts_with':
                return typeof valorContexto === 'string' && valorContexto.startsWith(String(valor));
            case 'ends_with':
                return typeof valorContexto === 'string' && valorContexto.endsWith(String(valor));
            case 'in':
                return Array.isArray(valor) && valor.includes(valorContexto);
            case 'not_in':
                return Array.isArray(valor) && !valor.includes(valorContexto);
            case 'between':
                return typeof valorContexto === 'number' && valor !== undefined && valorFinal !== undefined
                    && valorContexto >= (valor as number) && valorContexto <= (valorFinal as number);
            case 'is_null':
                return valorContexto === null || valorContexto === undefined;
            case 'is_not_null':
                return valorContexto !== null && valorContexto !== undefined;
            default:
                return false;
        }
    }

    toSnapshot(): PoliticaNegocioProps {
        return { ...this.props };
    }

    toJSON(): PoliticaNegocioProps {
        return this.toSnapshot();
    }
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ═══════════════════════════════════════════════════════════════════

export const CATEGORIAS_POLITICA = [
    { id: 'RIESGO', nombre: 'Riesgo', descripcion: 'Políticas de evaluación y gestión de riesgo', icono: '⚠️', color: '#EF4444' },
    { id: 'PRICING', nombre: 'Pricing', descripcion: 'Políticas de precios y descuentos', icono: '💰', color: '#10B981' },
    { id: 'WORKFLOW', nombre: 'Workflow', descripcion: 'Políticas de flujo de trabajo', icono: '🔄', color: '#3B82F6' },
    { id: 'RENOVACION', nombre: 'Renovación', descripcion: 'Políticas de renovación de contratos', icono: '🔁', color: '#8B5CF6' },
    { id: 'COMPLIANCE', nombre: 'Compliance', descripcion: 'Políticas de cumplimiento normativo', icono: '✅', color: '#F59E0B' },
    { id: 'GENERAL', nombre: 'General', descripcion: 'Políticas generales del sistema', icono: '⚙️', color: '#6B7280' },
] as const;

export const OPERADORES_DISPONIBLES = [
    { id: 'equals', nombre: 'Es igual a', tipo: 'string|number|boolean' },
    { id: 'not_equals', nombre: 'No es igual a', tipo: 'string|number|boolean' },
    { id: 'greater_than', nombre: 'Mayor que', tipo: 'number' },
    { id: 'less_than', nombre: 'Menor que', tipo: 'number' },
    { id: 'contains', nombre: 'Contiene', tipo: 'string' },
    { id: 'starts_with', nombre: 'Comienza con', tipo: 'string' },
    { id: 'ends_with', nombre: 'Termina con', tipo: 'string' },
    { id: 'in', nombre: 'Está en lista', tipo: 'array' },
    { id: 'not_in', nombre: 'No está en lista', tipo: 'array' },
    { id: 'between', nombre: 'Está entre', tipo: 'range' },
    { id: 'is_null', nombre: 'Es nulo', tipo: 'any' },
    { id: 'is_not_null', nombre: 'No es nulo', tipo: 'any' },
] as const;

export const TIPOS_ACCION = [
    { id: 'notificar', nombre: 'Enviar notificación', icono: '📧' },
    { id: 'aprobar', nombre: 'Aprobar automáticamente', icono: '✅' },
    { id: 'rechazar', nombre: 'Rechazar automáticamente', icono: '❌' },
    { id: 'asignar', nombre: 'Asignar a usuario/rol', icono: '👤' },
    { id: 'actualizar', nombre: 'Actualizar campo', icono: '✏️' },
    { id: 'escalonar', nombre: 'Escalonar a siguiente nivel', icono: '📈' },
    { id: 'generar_alerta', nombre: 'Generar alerta', icono: '🚨' },
    { id: 'bloquear', nombre: 'Bloquear operación', icono: '🔒' },
] as const;