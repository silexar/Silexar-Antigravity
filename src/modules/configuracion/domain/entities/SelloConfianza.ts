/**
 * SelloConfianza Entity - Enterprise Certification and Trust Seals
 * CATEGORY: CRITICAL - DDD Completo + CQRS
 * 
 * Maneja la certificación de confianza de clientes y parceiros
 * con niveles: BRONZE, SILVER, GOLD, PLATINUM
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * NivelSello - Nivel de certificación
 */
export type NivelSello = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export const NivelSelloSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']);

/**
 * EstadoCertificacion - Estado de la certificación
 */
export type EstadoCertificacion = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';
export const EstadoCertificacionSchema = z.enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'REVOKED']);

/**
 * TipoVerificador - Tipo de verificación externa
 */
export type TipoVerificador = 'INTERNAL' | 'IAS' | 'DOUBLE_VERIFY' | 'MOAT' | 'EXTENDED_VERIFIED' | 'CUSTOM';
export const TipoVerificadorSchema = z.enum(['INTERNAL', 'IAS', 'DOUBLE_VERIFY', 'MOAT', 'EXTENDED_VERIFIED', 'CUSTOM']);

// ==================== REQUIREMENTS ====================

export interface RequisitoCertificacion {
    id: string;
    nombre: string;
    descripcion: string;
    obligatorio: boolean;
    categoria: 'DOCUMENTATION' | 'COMPLIANCE' | 'BRAND_SAFETY' | 'FINANCIAL' | 'OPERATIONAL';
    peso: number; // 0-100, weight in overall score
    verificador: TipoVerificador;
    evidenciaRequerida: string[];
    cumple: boolean | null; // null = not evaluated
    fechaEvaluacion?: string;
    detallesCumplimiento?: string;
}

export interface CriterioEvaluacion {
    id: string;
    nombre: string;
    descripcion: string;
    nivelMinimo: NivelSello; // Minimum level to pass this criterion
    maximoPuntuacion: number;
    puntuacionActual: number;
}

// ==================== DOMAIN ERRORS ====================

export class SelloDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'SelloDomainError';
    }
}

// ==================== SCHEMAS ====================

export const VerificacionDocumentoSchema = z.object({
    id: z.string().uuid(),
    tipoDocumento: z.string(),
    nombreArchivo: z.string(),
    urlArchivo: z.string().url().optional(),
    hashSha256: z.string().optional(),
    subidoPorId: z.string().uuid(),
    subidoEn: z.string().datetime(),
    verificadoPorId: z.string().uuid().optional(),
    verificadoEn: z.string().datetime().optional(),
    estado: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
    comentario: z.string().optional(),
});

export const HistorialCambioSchema = z.object({
    timestamp: z.string().datetime(),
    usuarioId: z.string().uuid(),
    accion: z.string(),
    nivelAnterior: NivelSelloSchema.optional(),
    nivelNuevo: NivelSelloSchema.optional(),
    motivo: z.string().optional(),
});

export const SelloConfianzaPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    clienteId: z.string().uuid(),

    // Información del sello
    nombre: z.string().min(1).max(255),
    descripcion: z.string().max(1000).optional(),
    nivel: NivelSelloSchema,
    estado: EstadoCertificacionSchema.default('PENDING'),

    // Fechas y vigencia
    fechaSolicitud: z.string().datetime(),
    fechaInicio: z.string().datetime().optional(),
    fechaVencimientos: z.string().datetime().optional(),
    diasParaVencimientos: z.number().optional(),

    // Verificación y scoring
    puntuacionTotal: z.number().min(0).max(100).default(0),
    verificadorExterno: TipoVerificadorSchema.optional(),
    verificacionCompletada: z.boolean().default(false),

    // Requisitos y criterios
    requisitos: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string(),
        descripcion: z.string(),
        obligatorio: z.boolean(),
        categoria: z.enum(['DOCUMENTATION', 'COMPLIANCE', 'BRAND_SAFETY', 'FINANCIAL', 'OPERATIONAL']),
        peso: z.number(),
        verificador: TipoVerificadorSchema,
        evidenciaRequerida: z.array(z.string()),
        cumple: z.boolean().nullable(),
        fechaEvaluacion: z.string().datetime().optional(),
        detallesCumplimiento: z.string().optional(),
    })).default([]),

    // Documentos de evidencia
    documentos: z.array(z.object({
        id: z.string().uuid(),
        tipoDocumento: z.string(),
        nombreArchivo: z.string(),
        urlArchivo: z.string().url().optional(),
        hashSha256: z.string().optional(),
        subidoPorId: z.string().uuid(),
        subidoEn: z.string().datetime(),
        verificadoPorId: z.string().uuid().optional(),
        verificadoEn: z.string().datetime().optional(),
        estado: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
        comentario: z.string().optional(),
    })).default([]),

    // Metadatos adicionales
    badges: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    notas: z.string().optional(),

    // Historial
    historialCambios: z.array(z.object({
        timestamp: z.string().datetime(),
        usuarioId: z.string().uuid(),
        accion: z.string(),
        nivelAnterior: NivelSelloSchema.optional(),
        nivelNuevo: NivelSelloSchema.optional(),
        motivo: z.string().optional(),
    })).default([]),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type SelloConfianzaProps = z.infer<typeof SelloConfianzaPropsSchema>;

// ==================== ENTITY ====================

export class SelloConfianza {
    private constructor(private props: SelloConfianzaProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<SelloConfianzaProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt' | 'puntuacionTotal' | 'estado'>): SelloConfianza {
        const now = new Date().toISOString();
        return new SelloConfianza({
            ...props,
            id: uuidv4(),
            version: 1,
            estado: 'PENDING',
            puntuacionTotal: 0,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createWithDefaults(
        tenantId: string,
        clienteId: string,
        nombre: string,
        nivel: NivelSello
    ): SelloConfianza {
        const now = new Date().toISOString();

        const requisitosDefault = [
            // Documentación
            { id: uuidv4(), nombre: 'RUC vigente', descripcion: 'Registro Único de Contribuyente vigente', obligatorio: true, categoria: 'DOCUMENTATION' as const, peso: 10, verificador: 'INTERNAL' as const, evidenciaRequerida: ['documento_pdf'], cumple: null },
            { id: uuidv4(), nombre: 'Certificación bancaria', descripcion: ' Carta de certificación bancaria', obligatorio: nivel !== 'BRONZE', categoria: 'FINANCIAL' as const, peso: 15, verificador: 'INTERNAL' as const, evidenciaRequerida: ['carta_banco'], cumple: null },
            // Brand Safety
            { id: uuidv4(), nombre: 'Política de Brand Safety', descripcion: 'Documento de políticas de seguridad de marca', obligatorio: true, categoria: 'BRAND_SAFETY' as const, peso: 20, verificador: 'DOUBLE_VERIFY' as const, evidenciaRequerida: ['pdf_politica'], cumple: null },
            { id: uuidv4(), nombre: 'GDPR Compliance', descripcion: 'Certificación de cumplimiento GDPR', obligatorio: nivel !== 'BRONZE', categoria: 'COMPLIANCE' as const, peso: 15, verificador: 'IAS' as const, evidenciaRequerida: ['certificado_gdpr'], cumple: null },
            // Operacional
            { id: uuidv4(), nombre: 'Contrato de servicio', descripcion: 'Contrato de prestação de servicios firmado', obligatorio: true, categoria: 'OPERATIONAL' as const, peso: 20, verificador: 'INTERNAL' as const, evidenciaRequerida: ['contrato_firmado'], cumple: null },
        ];

        return new SelloConfianza({
            id: uuidv4(),
            tenantId,
            clienteId,
            nombre,
            nivel,
            estado: 'PENDING',
            fechaSolicitud: now,
            verificadorExterno: nivel === 'PLATINUM' ? 'EXTENDED_VERIFIED' : nivel === 'GOLD' ? 'DOUBLE_VERIFY' : 'INTERNAL',
            verificacionCompletada: false,
            requisitos: requisitosDefault,
            documentos: [],
            badges: [],
            tags: [],
            historialCambios: [],
            puntuacionTotal: 0,
            version: 1,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static fromSnapshot(props: SelloConfianzaProps): SelloConfianza {
        return new SelloConfianza(props);
    }

    // Validation
    private validate(): void {
        if (this.props.nivel === 'PLATINUM' && this.props.verificadorExterno === 'INTERNAL') {
            throw new SelloDomainError(
                'PLATINUM requiere verificador externo',
                'INVALID_VERIFIER_FOR_LEVEL'
            );
        }

        if (this.props.fechaVencimientos && this.props.fechaInicio) {
            if (new Date(this.props.fechaVencimientos) <= new Date(this.props.fechaInicio)) {
                throw new SelloDomainError('Fecha de vencimientos debe ser posterior a fecha de inicio', 'INVALID_DATES');
            }
        }
    }

    // State transitions
    submit(): void {
        if (this.props.estado !== 'PENDING') {
            throw new SelloDomainError('Solo se puede submitir desde estado PENDING', 'INVALID_STATE');
        }
        this.props.estado = 'IN_REVIEW';
        this.recordChange('SUBMITTED', { estadoAnterior: 'PENDING' });
    }

    approve(): void {
        if (!this.canApprove()) {
            throw new SelloDomainError('No cumple requisitos para aprobación', 'REQUIREMENTS_NOT_MET');
        }

        const nivelAnterior = this.props.nivel;
        this.props.estado = 'APPROVED';
        this.props.verificacionCompletada = true;
        this.props.fechaInicio = new Date().toISOString();

        // Set expiration based on level
        const expirationDays = this.getExpirationDays();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expirationDays);
        this.props.fechaVencimientos = expiryDate.toISOString();
        this.props.diasParaVencimientos = expirationDays;

        this.recordChange('APPROVED', { nivelAnterior });
    }

    reject(reason: string): void {
        this.props.estado = 'REJECTED';
        this.props.notas = reason;
        this.recordChange('REJECTED', { motivo: reason });
    }

    revoke(reason: string): void {
        this.props.estado = 'REVOKED';
        this.props.notas = reason;
        this.recordChange('REVOKED', { motivo: reason });
    }

    expire(): void {
        if (this.props.fechaVencimientos) {
            if (new Date() >= new Date(this.props.fechaVencimientos)) {
                this.props.estado = 'EXPIRED';
                this.recordChange('EXPIRED');
            }
        }
    }

    // Requirement management
    evaluateRequirement(requisitoId: string, cumple: boolean, evaluadorId: string, detalles?: string): void {
        const requisito = this.props.requisitos.find(r => r.id === requisitoId);
        if (!requisito) {
            throw new SelloDomainError('Requisito no encontrado', 'REQUIREMENT_NOT_FOUND');
        }

        requisito.cumple = cumple;
        requisito.fechaEvaluacion = new Date().toISOString();
        requisito.detallesCumplimiento = detalles;

        this.recalculateScore();
        this.props.actualizadoAt = new Date().toISOString();
    }

    private recalculateScore(): void {
        const weightedSum = this.props.requisitos.reduce((sum, req) => {
            if (req.cumple === true) {
                return sum + req.peso;
            }
            return sum;
        }, 0);

        const totalWeight = this.props.requisitos.reduce((sum, req) => sum + req.peso, 0);
        this.props.puntuacionTotal = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
    }

    // Document management
    addDocument(doc: {
        tipoDocumento: string;
        nombreArchivo: string;
        urlArchivo?: string;
        hashSha256?: string;
        subidoPorId: string;
    }): void {
        this.props.documentos.push({
            id: uuidv4(),
            ...doc,
            subidoEn: new Date().toISOString(),
            estado: 'PENDING',
        });
        this.props.actualizadoAt = new Date().toISOString();
    }

    verifyDocument(documentId: string, verificadorId: string, approved: boolean, comentario?: string): void {
        const doc = this.props.documentos.find(d => d.id === documentId);
        if (!doc) {
            throw new SelloDomainError('Documento no encontrado', 'DOCUMENT_NOT_FOUND');
        }

        doc.estado = approved ? 'APPROVED' : 'REJECTED';
        doc.verificadoPorId = verificadorId;
        doc.verificadoEn = new Date().toISOString();
        doc.comentario = comentario;
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Helpers
    private recordChange(accion: string, context: Record<string, unknown> = {}): void {
        this.props.historialCambios.push({
            timestamp: new Date().toISOString(),
            usuarioId: context.usuarioId as string || 'system',
            accion,
            nivelAnterior: context.nivelAnterior as NivelSello | undefined,
            nivelNuevo: context.nivelNuevo as NivelSello | undefined,
            motivo: context.motivo as string | undefined,
        });
    }

    private getExpirationDays(): number {
        const daysByLevel: Record<NivelSello, number> = {
            BRONZE: 180,
            SILVER: 365,
            GOLD: 365,
            PLATINUM: 730,
        };
        return daysByLevel[this.props.nivel];
    }

    private canApprove(): boolean {
        // Check all mandatory requirements are met
        const mandatoryRequirements = this.props.requisitos.filter(r => r.obligatorio);
        const allMandatoryMet = mandatoryRequirements.every(r => r.cumple === true);

        // Check minimum score based on level
        const minScoreByLevel: Record<NivelSello, number> = {
            BRONZE: 60,
            SILVER: 75,
            GOLD: 85,
            PLATINUM: 95,
        };

        return allMandatoryMet && this.props.puntuacionTotal >= minScoreByLevel[this.props.nivel];
    }

    // Queries
    getCumplimientoPercentage(): number {
        return this.props.puntuacionTotal;
    }

    getNivelLabel(): string {
        const labels: Record<NivelSello, string> = {
            BRONZE: 'Bronce',
            SILVER: 'Plata',
            GOLD: 'Oro',
            PLATINUM: 'Platino',
        };
        return labels[this.props.nivel];
    }

    getEstadoLabel(): string {
        const labels: Record<EstadoCertificacion, string> = {
            PENDING: 'Pendiente',
            IN_REVIEW: 'En Revisión',
            APPROVED: 'Aprobado',
            REJECTED: 'Rechazado',
            EXPIRED: 'Vencido',
            REVOKED: 'Revocado',
        };
        return labels[this.props.estado];
    }

    isActivo(): boolean {
        return this.props.estado === 'APPROVED' &&
            (!this.props.fechaVencimientos || new Date() < new Date(this.props.fechaVencimientos));
    }

    getDaysRemaining(): number {
        if (!this.props.fechaVencimientos) return Infinity;
        const now = new Date();
        const expiry = new Date(this.props.fechaVencimientos);
        const diff = expiry.getTime() - now.getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    getPendingRequirements(): RequisitoCertificacion[] {
        return this.props.requisitos.filter(r => r.cumple === null);
    }

    // Snapshot
    toSnapshot(): SelloConfianzaProps {
        return { ...this.props };
    }
}

// ==================== EXPORTS ====================
// Note: SelloConfianzaProps is already exported via the type declaration above

export const NIVEL_LABELS: Record<NivelSello, { label: string; color: string; icon: string }> = {
    BRONZE: { label: 'Bronce', color: '#CD7F32', icon: 'award' },
    SILVER: { label: 'Plata', color: '#C0C0C0', icon: 'award' },
    GOLD: { label: 'Oro', color: '#FFD700', icon: 'star' },
    PLATINUM: { label: 'Platino', color: '#E5E4E2', icon: 'gem' },
};

export const VERIFIER_LABELS: Record<TipoVerificador, string> = {
    INTERNAL: 'Verificación Interna',
    IAS: 'IAS (International Auditing Services)',
    DOUBLE_VERIFY: 'DoubleVerify',
    MOAT: 'Moat Analytics',
    EXTENDED_VERIFIED: 'Verified Plus',
    CUSTOM: 'Verificador Personalizado',
};