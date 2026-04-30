/**
 * MonitoreoSalud Entity - Enterprise Health Monitoring System
 * CATEGORY: CRITICAL - DDD + CQRS
 * 
 * Sistema de monitoreo de salud, incident management, SLA y runbooks
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// ==================== VALUE OBJECTS ====================

/**
 * HealthStatus - Estado de salud general
 */
export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL' | 'UNKNOWN';
export const HealthStatusSchema = z.enum(['HEALTHY', 'DEGRADED', 'UNHEALTHY', 'CRITICAL', 'UNKNOWN']);

/**
 * IncidentSeverity - Severidad del incidente
 */
export type IncidentSeverity = 'P1' | 'P2' | 'P3' | 'P4';
export const IncidentSeveritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);

/**
 * IncidentStatus - Estado del incidente
 */
export type IncidentStatus = 'TRIGGERED' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'POST_MORTEM';
export const IncidentStatusSchema = z.enum(['TRIGGERED', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'POST_MORTEM']);

/**
 * MetricType - Tipo de métrica
 */
export type MetricType = 'CPU' | 'MEMORY' | 'DISK' | 'NETWORK' | 'LATENCY' | 'ERROR_RATE' | 'REQUEST_RATE' | 'AVAILABILITY';
export const MetricTypeSchema = z.enum(['CPU', 'MEMORY', 'DISK', 'NETWORK', 'LATENCY', 'ERROR_RATE', 'REQUEST_RATE', 'AVAILABILITY']);

// ==================== DOMAIN ERRORS ====================

export class MonitoreoDomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context: Record<string, unknown> = {}
    ) {
        super(message);
        this.name = 'MonitoreoDomainError';
    }
}

// ==================== SCHEMAS ====================

export const MetricaSchema = z.object({
    tipo: MetricTypeSchema,
    valor: z.number(),
    unidad: z.string(),
    timestamp: z.string().datetime(),
    umbral: z.number().optional(),
    estado: HealthStatusSchema,
});

export const UmbralConfigSchema = z.object({
    id: z.string().uuid(),
    metrica: MetricTypeSchema,
    warningThreshold: z.number(),
    criticalThreshold: z.number(),
    comparisonOperator: z.enum(['GT', 'LT', 'GTE', 'LTE', 'EQ']).default('GT'),
    windowSeconds: z.number().default(300),
    consecutiveBreaches: z.number().default(3),
    enabled: z.boolean().default(true),
});

export const IncidenteSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),

    //基本信息
    titulo: z.string().min(1).max(255),
    descripcion: z.string().optional(),
    severity: IncidentSeveritySchema,
    status: IncidentStatusSchema.default('TRIGGERED'),

    // Métricas relacionadas
    metricasDisparadas: z.array(z.object({
        tipo: MetricTypeSchema,
        valor: z.number(),
        umbral: z.number(),
    })).default([]),

    // Asignación
    asignadoAId: z.string().uuid().optional(),
    asignadoANombre: z.string().optional(),

    // Resolución
    causaRaiz: z.string().optional(),
    solucion: z.string().optional(),
    impactedServices: z.array(z.string()).default([]),
    impactedUsers: z.number().default(0),

    // Tiempos
    triggeredAt: z.string().datetime(),
    acknowledgedAt: z.string().datetime().optional(),
    resolvedAt: z.string().datetime().optional(),
    mttdMinutes: z.number().optional(), // Mean Time To Detect
    mttaMinutes: z.number().optional(), // Mean Time To Acknowledge
    mttrMinutes: z.number().optional(), // Mean Time To Resolve

    // Comunicación
    notificacionesEnvidadas: z.array(z.object({
        canal: z.enum(['EMAIL', 'SMS', 'PUSH', 'SLACK', 'TEAMS', 'WEBHOOK']),
        destinatario: z.string(),
        timestamp: z.string().datetime(),
        success: z.boolean(),
    })).default([]),

    // Post-mortem
    postMortem: z.object({
        timeline: z.array(z.object({
            timestamp: z.string().datetime(),
            evento: z.string(),
            responsable: z.string().optional(),
        })).default([]),
        lecciones: z.array(z.string()).default([]),
        acciones: z.array(z.object({
            descripcion: z.string(),
            responsable: z.string(),
            fechaLimite: z.string().datetime(),
            completada: z.boolean().default(false),
        })).default([]),
        hecho: z.boolean().default(false),
    }).optional(),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export const ComponentHealthSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    tipo: z.string(), // API, Database, Cache, Queue, etc.
    region: z.string().optional(),
    estado: HealthStatusSchema.default('UNKNOWN'),

    // Métricas actuales
    metricas: z.array(z.object({
        tipo: MetricTypeSchema,
        valor: z.number(),
        unidad: z.string(),
        timestamp: z.string().datetime(),
        umbral: z.number().optional(),
        estado: HealthStatusSchema,
    })).default([]),

    // Historial
    uptimePercentage: z.number().min(0).max(100),
    lastIncidentAt: z.string().datetime().optional(),
    consecutiveIncidents: z.number().default(0),

    // Configuración
    umbrales: z.array(z.object({
        id: z.string().uuid(),
        metrica: MetricTypeSchema,
        warningThreshold: z.number(),
        criticalThreshold: z.number(),
        comparisonOperator: z.enum(['GT', 'LT', 'GTE', 'LTE', 'EQ']).default('GT'),
        windowSeconds: z.number().default(300),
        consecutiveBreaches: z.number().default(3),
        enabled: z.boolean().default(true),
    })).default([]),
});

export const SLAConfigSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    nombre: z.string().min(1).max(255),
    tipo: z.enum(['UPTIME', 'LATENCY', 'ERROR_RATE', 'THROUGHPUT']),
    objetivo: z.number(), // Percentage or milliseconds
    ventana: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
    habilitado: z.boolean().default(true),
});

export const MonitoreoSaludPropsSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string(),
    nombre: z.string().min(1).max(255),

    // Estado general
    estado: HealthStatusSchema.default('UNKNOWN'),
    ultimoCheck: z.string().datetime(),
    siguienteCheck: z.string().datetime(),

    // Componentes
    componentes: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string(),
        tipo: z.string(),
        region: z.string().optional(),
        estado: HealthStatusSchema.default('UNKNOWN'),
        metricas: z.array(z.object({
            tipo: MetricTypeSchema,
            valor: z.number(),
            unidad: z.string(),
            timestamp: z.string().datetime(),
            umbral: z.number().optional(),
            estado: HealthStatusSchema,
        })).default([]),
        uptimePercentage: z.number().min(0).max(100),
        lastIncidentAt: z.string().datetime().optional(),
        consecutiveIncidents: z.number().default(0),
        umbrales: z.array(z.object({
            id: z.string().uuid(),
            metrica: MetricTypeSchema,
            warningThreshold: z.number(),
            criticalThreshold: z.number(),
            comparisonOperator: z.enum(['GT', 'LT', 'GTE', 'LTE', 'EQ']).default('GT'),
            windowSeconds: z.number().default(300),
            consecutiveBreaches: z.number().default(3),
            enabled: z.boolean().default(true),
        })).default([]),
    })).default([]),

    // Incidentes activos
    incidentesActivos: z.array(z.object({
        id: z.string().uuid(),
        titulo: z.string(),
        severity: IncidentSeveritySchema,
        status: IncidentStatusSchema,
        triggeredAt: z.string().datetime(),
        asignadoAId: z.string().optional(),
        asignadoANombre: z.string().optional(),
        acknowledgedAt: z.string().optional(),
        resolvedAt: z.string().optional(),
        causaRaiz: z.string().optional(),
        solucion: z.string().optional(),
        impactedServices: z.array(z.string()).optional(),
        impactedUsers: z.number().optional(),
        mttrMinutes: z.number().optional(),
    })).default([]),

    // Métricas agregadas
    metricasAgregadas: z.object({
        uptimeOverall: z.number().min(0).max(100),
        avgLatencyMs: z.number(),
        errorRatePercentage: z.number(),
        requestsPerSecond: z.number(),
        activeConnections: z.number(),
    }).optional(),

    // SLA
    slas: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string(),
        tipo: z.enum(['UPTIME', 'LATENCY', 'ERROR_RATE', 'THROUGHPUT']),
        objetivo: z.number(),
        ventana: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
        habilitado: z.boolean().default(true),
    })).default([]),

    // Configuración de alertas
    canalesAlerta: z.array(z.object({
        tipo: z.enum(['EMAIL', 'SMS', 'PUSH', 'SLACK', 'TEAMS', 'WEBHOOK']),
        destino: z.string(),
        enabled: z.boolean().default(true),
        severityFilter: z.array(IncidentSeveritySchema).optional(),
    })).default([]),

    // Runbooks
    runbooks: z.array(z.object({
        id: z.string().uuid(),
        nombre: z.string(),
        descripcion: z.string(),
        pasos: z.array(z.object({
            orden: z.number(),
            instruccion: z.string(),
            comando: z.string().optional(),
            expectedResult: z.string().optional(),
            timeoutSeconds: z.number().default(30),
        })).default([]),
        applicableIncidents: z.array(z.string()).default([]), // Severity types
    })).default([]),

    // Auditoría
    creadoPorId: z.string().uuid().optional(),
    creadoAt: z.string().datetime(),
    actualizadoPorId: z.string().uuid().optional(),
    actualizadoAt: z.string().datetime(),
    version: z.number().default(1),
});

export type MonitoreoSaludProps = z.infer<typeof MonitoreoSaludPropsSchema>;

// ==================== ENTITY ====================

export class MonitoreoSalud {
    private constructor(private props: MonitoreoSaludProps) {
        this.validate();
    }

    // Factory methods
    static create(props: Omit<MonitoreoSaludProps, 'id' | 'version' | 'creadoAt' | 'actualizadoAt'>): MonitoreoSalud {
        const now = new Date().toISOString();
        return new MonitoreoSalud({
            ...props,
            id: uuidv4(),
            version: 1,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static createDefault(tenantId: string, nombre: string): MonitoreoSalud {
        const now = new Date().toISOString();
        const nextCheck = new Date(Date.now() + 60000).toISOString(); // 1 minute

        return new MonitoreoSalud({
            id: uuidv4(),
            tenantId,
            nombre,
            estado: 'UNKNOWN',
            ultimoCheck: now,
            siguienteCheck: nextCheck,
            componentes: [],
            incidentesActivos: [],
            slas: [
                { id: uuidv4(), nombre: 'Uptime 99.9%', tipo: 'UPTIME', objetivo: 99.9, ventana: 'MONTHLY', habilitado: true },
                { id: uuidv4(), nombre: 'Latencia < 200ms', tipo: 'LATENCY', objetivo: 200, ventana: 'MONTHLY', habilitado: true },
                { id: uuidv4(), nombre: 'Error Rate < 0.1%', tipo: 'ERROR_RATE', objetivo: 0.1, ventana: 'MONTHLY', habilitado: true },
            ],
            canalesAlerta: [],
            runbooks: [],
            version: 1,
            creadoAt: now,
            actualizadoAt: now,
        });
    }

    static fromSnapshot(props: MonitoreoSaludProps): MonitoreoSalud {
        return new MonitoreoSalud(props);
    }

    // Validation
    private validate(): void {
        // Ensure SLA objectives are reasonable
        for (const sla of this.props.slas) {
            if (sla.tipo === 'UPTIME' && (sla.objetivo < 0 || sla.objetivo > 100)) {
                throw new MonitoreoDomainError('SLA de uptime debe estar entre 0 y 100', 'INVALID_SLA');
            }
            if (sla.tipo === 'LATENCY' && sla.objetivo < 0) {
                throw new MonitoreoDomainError('SLA de latencia no puede ser negativo', 'INVALID_SLA');
            }
        }
    }

    // Component management
    addComponent(component: {
        nombre: string;
        tipo: string;
        region?: string;
        umbrales?: Array<{
            metrica: MetricType;
            warningThreshold: number;
            criticalThreshold: number;
        }>;
    }): string {
        const componentId = uuidv4();

        this.props.componentes.push({
            id: componentId,
            nombre: component.nombre,
            tipo: component.tipo,
            region: component.region,
            estado: 'UNKNOWN',
            metricas: [],
            uptimePercentage: 100,
            consecutiveIncidents: 0,
            umbrales: (component.umbrales || []).map(u => ({
                id: uuidv4(),
                metrica: u.metrica,
                warningThreshold: u.warningThreshold,
                criticalThreshold: u.criticalThreshold,
                comparisonOperator: 'GT' as const,
                windowSeconds: 300,
                consecutiveBreaches: 3,
                enabled: true,
            })),
        });

        this.props.actualizadoAt = new Date().toISOString();
        return componentId;
    }

    removeComponent(componentId: string): void {
        const index = this.props.componentes.findIndex(c => c.id === componentId);
        if (index === -1) {
            throw new MonitoreoDomainError('Componente no encontrado', 'COMPONENT_NOT_FOUND');
        }
        this.props.componentes.splice(index, 1);
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Metric updates
    updateComponentMetrics(componentId: string, metricas: Array<{
        tipo: MetricType;
        valor: number;
        unidad: string;
    }>): void {
        const component = this.props.componentes.find(c => c.id === componentId);
        if (!component) {
            throw new MonitoreoDomainError('Componente no encontrado', 'COMPONENT_NOT_FOUND');
        }

        const now = new Date().toISOString();

        for (const m of metricas) {
            const umbral = component.umbrales.find(u => u.metrica === m.tipo);
            let status: HealthStatus = 'HEALTHY';

            if (umbral) {
                if (umbral.criticalThreshold !== undefined && m.valor >= umbral.criticalThreshold) {
                    status = 'CRITICAL';
                } else if (umbral.warningThreshold !== undefined && m.valor >= umbral.warningThreshold) {
                    status = 'DEGRADED';
                }
            }

            const metricEntry = {
                tipo: m.tipo,
                valor: m.valor,
                unidad: m.unidad,
                timestamp: now,
                umbral: umbral?.criticalThreshold,
                estado: status,
            };

            // Update or add metric
            const existingIndex = component.metricas.findIndex(pm => pm.tipo === m.tipo);
            if (existingIndex >= 0) {
                component.metricas[existingIndex] = metricEntry;
            } else {
                component.metricas.push(metricEntry);
            }
        }

        // Update component state based on metrics
        const criticalMetrics = component.metricas.filter(m => m.estado === 'CRITICAL');
        const degradedMetrics = component.metricas.filter(m => m.estado === 'DEGRADED');

        if (criticalMetrics.length > 0) {
            component.estado = 'CRITICAL';
        } else if (degradedMetrics.length > 0) {
            component.estado = 'DEGRADED';
        } else {
            component.estado = 'HEALTHY';
        }

        this.recalculateOverallHealth();
        this.props.actualizadoAt = new Date().toISOString();
    }

    private recalculateOverallHealth(): void {
        const criticalComponents = this.props.componentes.filter(c => c.estado === 'CRITICAL');
        const degradedComponents = this.props.componentes.filter(c => c.estado === 'DEGRADED');

        if (criticalComponents.length > 0) {
            this.props.estado = 'CRITICAL';
        } else if (degradedComponents.length > 0) {
            this.props.estado = 'DEGRADED';
        } else if (this.props.componentes.length === 0) {
            this.props.estado = 'UNKNOWN';
        } else {
            this.props.estado = 'HEALTHY';
        }
    }

    // Incident management
    createIncident(data: {
        titulo: string;
        descripcion?: string;
        severity: IncidentSeverity;
        componentId?: string;
        metricas?: Array<{ tipo: MetricType; valor: number; umbral: number }>;
    }): string {
        const incidentId = uuidv4();
        const now = new Date().toISOString();

        this.props.incidentesActivos.push({
            id: incidentId,
            titulo: data.titulo,
            severity: data.severity,
            status: 'TRIGGERED',
            triggeredAt: now,
        });

        if (data.componentId) {
            const component = this.props.componentes.find(c => c.id === data.componentId);
            if (component) {
                component.consecutiveIncidents += 1;
                component.lastIncidentAt = now;

                if (component.estado !== 'CRITICAL') {
                    component.estado = 'UNHEALTHY';
                }
            }
        }

        this.recalculateOverallHealth();
        this.props.actualizadoAt = now;

        return incidentId;
    }

    acknowledgeIncident(incidentId: string, usuarioId: string, usuarioNombre: string): void {
        const incident = this.props.incidentesActivos.find(i => i.id === incidentId);
        if (!incident) {
            throw new MonitoreoDomainError('Incidente no encontrado', 'INCIDENT_NOT_FOUND');
        }

        incident.status = 'ACKNOWLEDGED';
        incident.asignadoAId = usuarioId;
        incident.asignadoANombre = usuarioNombre;
        incident.acknowledgedAt = new Date().toISOString();

        this.props.actualizadoAt = new Date().toISOString();
    }

    resolveIncident(incidentId: string, data: {
        causaRaiz?: string;
        solucion?: string;
        impactedServices?: string[];
        impactedUsers?: number;
    }): void {
        const incident = this.props.incidentesActivos.find(i => i.id === incidentId);
        if (!incident) {
            throw new MonitoreoDomainError('Incidente no encontrado', 'INCIDENT_NOT_FOUND');
        }

        const now = new Date().toISOString();
        incident.status = 'RESOLVED';
        incident.resolvedAt = now;

        if (data.causaRaiz) incident.causaRaiz = data.causaRaiz;
        if (data.solucion) incident.solucion = data.solucion;
        if (data.impactedServices) incident.impactedServices = data.impactedServices;
        if (data.impactedUsers) incident.impactedUsers = data.impactedUsers;

        // Calculate MTTR
        const triggeredAt = new Date(incident.triggeredAt).getTime();
        const resolvedAt = new Date(now).getTime();
        incident.mttrMinutes = Math.round((resolvedAt - triggeredAt) / 60000);

        // Remove from active list after resolution
        const index = this.props.incidentesActivos.findIndex(i => i.id === incidentId);
        if (index >= 0) {
            this.props.incidentesActivos.splice(index, 1);
        }

        this.recalculateOverallHealth();
        this.props.actualizadoAt = now;
    }

    // SLA management
    addSLA(sla: {
        nombre: string;
        tipo: 'UPTIME' | 'LATENCY' | 'ERROR_RATE' | 'THROUGHPUT';
        objetivo: number;
        ventana: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    }): void {
        this.props.slas.push({
            id: uuidv4(),
            ...sla,
            habilitado: true,
        });
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Alert channel management
    addAlertChannel(channel: {
        tipo: 'EMAIL' | 'SMS' | 'PUSH' | 'SLACK' | 'TEAMS' | 'WEBHOOK';
        destino: string;
        severityFilter?: IncidentSeverity[];
    }): void {
        this.props.canalesAlerta.push({
            tipo: channel.tipo,
            destino: channel.destino,
            enabled: true,
            severityFilter: channel.severityFilter,
        });
        this.props.actualizadoAt = new Date().toISOString();
    }

    // Runbook management
    addRunbook(runbook: {
        nombre: string;
        descripcion: string;
        pasos: Array<{
            instruccion: string;
            comando?: string;
            expectedResult?: string;
            timeoutSeconds?: number;
        }>;
        applicableIncidents?: string[];
    }): string {
        const runbookId = uuidv4();

        this.props.runbooks.push({
            id: runbookId,
            nombre: runbook.nombre,
            descripcion: runbook.descripcion,
            pasos: runbook.pasos.map((p, index) => ({
                orden: index + 1,
                instruccion: p.instruccion,
                comando: p.comando,
                expectedResult: p.expectedResult,
                timeoutSeconds: p.timeoutSeconds || 30,
            })),
            applicableIncidents: runbook.applicableIncidents || [],
        });

        this.props.actualizadoAt = new Date().toISOString();
        return runbookId;
    }

    // Queries
    getActiveIncidentCount(): number {
        return this.props.incidentesActivos.length;
    }

    getCriticalIncidentCount(): number {
        return this.props.incidentesActivos.filter(i => i.severity === 'P1').length;
    }

    getOverallUptime(): number {
        if (this.props.componentes.length === 0) return 100;
        const sum = this.props.componentes.reduce((acc, c) => acc + c.uptimePercentage, 0);
        return Math.round(sum / this.props.componentes.length * 100) / 100;
    }

    isHealthy(): boolean {
        return this.props.estado === 'HEALTHY' && this.props.incidentesActivos.length === 0;
    }

    // Snapshot
    toSnapshot(): MonitoreoSaludProps {
        return { ...this.props };
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.props.id,
            tenantId: this.props.tenantId,
            nombre: this.props.nombre,
            estado: this.props.estado,
            componentesCount: this.props.componentes.length,
            activeIncidents: this.props.incidentesActivos.length,
            criticalIncidents: this.getCriticalIncidentCount(),
            uptime: this.getOverallUptime(),
            slasCount: this.props.slas.filter(s => s.habilitado).length,
            alertChannelsCount: this.props.canalesAlerta.filter(c => c.enabled).length,
        };
    }
}

// ==================== EXPORTS ====================

export const HEALTH_STATUS_LABELS: Record<HealthStatus, { label: string; color: string; icon: string }> = {
    HEALTHY: { label: 'Saludable', color: '#10B981', icon: 'check-circle' },
    DEGRADED: { label: 'Degradado', color: '#F59E0B', icon: 'alert-triangle' },
    UNHEALTHY: { label: 'No saludable', color: '#EF4444', icon: 'alert-circle' },
    CRITICAL: { label: 'Crítico', color: '#DC2626', icon: 'x-circle' },
    UNKNOWN: { label: 'Desconocido', color: '#6B7280', icon: 'help-circle' },
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, { label: string; color: string; slaMinutes: number }> = {
    P1: { label: 'Crítico', color: '#DC2626', slaMinutes: 15 },
    P2: { label: 'Alto', color: '#EF4444', slaMinutes: 60 },
    P3: { label: 'Medio', color: '#F59E0B', slaMinutes: 240 },
    P4: { label: 'Bajo', color: '#6B7280', slaMinutes: 1440 },
};

export const METRIC_TYPE_LABELS: Record<MetricType, string> = {
    CPU: 'CPU Usage',
    MEMORY: 'Memory Usage',
    DISK: 'Disk Usage',
    NETWORK: 'Network I/O',
    LATENCY: 'Response Latency',
    ERROR_RATE: 'Error Rate',
    REQUEST_RATE: 'Request Rate',
    AVAILABILITY: 'Availability',
};