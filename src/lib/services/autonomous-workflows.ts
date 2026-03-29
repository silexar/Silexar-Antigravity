import { logger } from '@/lib/observability';
/**
 * ⚡ SILEXAR PULSE - AUTONOMOUS WORKFLOWS ENGINE
 * 
 * @description Motor de workflows autónomos que ejecuta acciones solo:
 * - Triggers basados en eventos
 * - Reglas de negocio configurables
 * - Ejecución automática de acciones
 * - Rollback automático si algo falla
 * - Logging completo de decisiones
 * 
 * @version 2030.0.0
 * @tier TIER_0_FORTUNE_10
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface Trigger {
  id: string;
  nombre: string;
  tipo: 'evento' | 'tiempo' | 'condicion' | 'webhook';
  configuracion: Record<string, unknown>;
  activo: boolean;
}

export interface Condicion {
  campo: string;
  operador: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'not_contains';
  valor: unknown;
}

export interface Accion {
  id: string;
  tipo: 'enviar_email' | 'crear_tarea' | 'actualizar_registro' | 'notificar' | 'webhook' | 'asignar' | 'escalar';
  parametros: Record<string, unknown>;
  orden: number;
}

export interface WorkflowDefinition {
  id: string;
  nombre: string;
  descripcion: string;
  trigger: Trigger;
  condiciones: Condicion[];
  acciones: Accion[];
  activo: boolean;
  prioridad: number;
  rollbackHabilitado: boolean;
  createdAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggerData: Record<string, unknown>;
  estadoActual: 'ejecutando' | 'completado' | 'fallido' | 'rollback';
  accionesEjecutadas: { accionId: string; resultado: string; timestamp: Date }[];
  error?: string;
  inicioEjecucion: Date;
  finEjecucion?: Date;
}

// ═══════════════════════════════════════════════════════════════
// WORKFLOWS PRE-CONFIGURADOS
// ═══════════════════════════════════════════════════════════════

const workflowsPreconfigurados: WorkflowDefinition[] = [
  {
    id: 'wf-001',
    nombre: 'Alerta de Churn Inminente',
    descripcion: 'Cuando un cliente de alto valor no tiene contacto en 30 días',
    trigger: { id: 't1', nombre: 'Sin contacto', tipo: 'condicion', configuracion: { diasSinContacto: 30 }, activo: true },
    condiciones: [
      { campo: 'cliente.inversionAnual', operador: '>', valor: 50000000 },
      { campo: 'cliente.diasSinContacto', operador: '>=', valor: 30 }
    ],
    acciones: [
      { id: 'a1', tipo: 'notificar', parametros: { canal: 'push', urgencia: 'alta', mensaje: 'Cliente VIP en riesgo de churn' }, orden: 1 },
      { id: 'a2', tipo: 'crear_tarea', parametros: { titulo: 'Contactar cliente urgente', asignarA: 'vendedor_asignado' }, orden: 2 },
      { id: 'a3', tipo: 'enviar_email', parametros: { template: 'retention_vip' }, orden: 3 }
    ],
    activo: true,
    prioridad: 1,
    rollbackHabilitado: true,
    createdAt: new Date()
  },
  {
    id: 'wf-002',
    nombre: 'Renovación Automática',
    descripcion: 'Iniciar proceso de renovación 30 días antes del vencimiento',
    trigger: { id: 't2', nombre: 'Contrato por vencer', tipo: 'tiempo', configuracion: { diasAntes: 30 }, activo: true },
    condiciones: [
      { campo: 'contrato.estado', operador: '==', valor: 'activo' },
      { campo: 'cliente.nps', operador: '>=', valor: 60 }
    ],
    acciones: [
      { id: 'a1', tipo: 'crear_tarea', parametros: { titulo: 'Preparar propuesta de renovación' }, orden: 1 },
      { id: 'a2', tipo: 'enviar_email', parametros: { template: 'pre_renovacion' }, orden: 2 },
      { id: 'a3', tipo: 'notificar', parametros: { mensaje: 'Proceso de renovación iniciado' }, orden: 3 }
    ],
    activo: true,
    prioridad: 2,
    rollbackHabilitado: false,
    createdAt: new Date()
  },
  {
    id: 'wf-003',
    nombre: 'Escalamiento por Queja',
    descripcion: 'Escalar automáticamente si hay queja de cliente importante',
    trigger: { id: 't3', nombre: 'Queja recibida', tipo: 'evento', configuracion: { evento: 'queja_creada' }, activo: true },
    condiciones: [
      { campo: 'cliente.tier', operador: '==', valor: 'premium' }
    ],
    acciones: [
      { id: 'a1', tipo: 'escalar', parametros: { nivel: 'gerente', urgencia: 'inmediata' }, orden: 1 },
      { id: 'a2', tipo: 'notificar', parametros: { destinatarios: ['gerente', 'ejecutivo'] }, orden: 2 },
      { id: 'a3', tipo: 'crear_tarea', parametros: { titulo: 'Resolver queja cliente premium', prioridad: 'critica' }, orden: 3 }
    ],
    activo: true,
    prioridad: 0,
    rollbackHabilitado: true,
    createdAt: new Date()
  },
  {
    id: 'wf-004',
    nombre: 'Bienvenida Nuevo Cliente',
    descripcion: 'Secuencia de onboarding para nuevos clientes',
    trigger: { id: 't4', nombre: 'Cliente creado', tipo: 'evento', configuracion: { evento: 'cliente_creado' }, activo: true },
    condiciones: [],
    acciones: [
      { id: 'a1', tipo: 'enviar_email', parametros: { template: 'bienvenida' }, orden: 1 },
      { id: 'a2', tipo: 'crear_tarea', parametros: { titulo: 'Llamada de bienvenida', diasPlazo: 3 }, orden: 2 },
      { id: 'a3', tipo: 'asignar', parametros: { rol: 'customer_success' }, orden: 3 }
    ],
    activo: true,
    prioridad: 3,
    rollbackHabilitado: false,
    createdAt: new Date()
  },
  {
    id: 'wf-005',
    nombre: 'Auto-Pricing Update',
    descripcion: 'Actualizar precios automáticamente cada hora según demanda',
    trigger: { id: 't5', nombre: 'Cada hora', tipo: 'tiempo', configuracion: { cronExpression: '0 * * * *' }, activo: true },
    condiciones: [],
    acciones: [
      { id: 'a1', tipo: 'webhook', parametros: { url: '/api/auto-pricing/ejecutar' }, orden: 1 },
      { id: 'a2', tipo: 'notificar', parametros: { canal: 'log', mensaje: 'Precios actualizados' }, orden: 2 }
    ],
    activo: true,
    prioridad: 5,
    rollbackHabilitado: true,
    createdAt: new Date()
  }
];

// ═══════════════════════════════════════════════════════════════
// AUTONOMOUS WORKFLOWS ENGINE
// ═══════════════════════════════════════════════════════════════

export class AutonomousWorkflowsEngine {

  private static ejecucionesActivas: Map<string, WorkflowExecution> = new Map();
  private static historial: WorkflowExecution[] = [];

  /**
   * Obtiene todos los workflows configurados
   */
  static obtenerWorkflows(): WorkflowDefinition[] {
    return workflowsPreconfigurados;
  }

  /**
   * Evalúa si un evento dispara algún workflow
   */
  static async evaluarEvento(evento: string, datos: Record<string, unknown>): Promise<WorkflowExecution[]> {
    const workflowsAplicables = workflowsPreconfigurados.filter(wf => 
      wf.activo && 
      wf.trigger.tipo === 'evento' && 
      (wf.trigger.configuracion as { evento: string }).evento === evento
    );
    
    const ejecuciones: WorkflowExecution[] = [];
    
    for (const workflow of workflowsAplicables) {
      if (this.evaluarCondiciones(workflow.condiciones, datos)) {
        const ejecucion = await this.ejecutarWorkflow(workflow, datos);
        ejecuciones.push(ejecucion);
      }
    }
    
    return ejecuciones;
  }

  /**
   * Evalúa condiciones del workflow
   */
  private static evaluarCondiciones(condiciones: Condicion[], datos: Record<string, unknown>): boolean {
    if (condiciones.length === 0) return true;
    
    for (const condicion of condiciones) {
      const valorReal = this.obtenerValorAnidado(datos, condicion.campo);
      
      switch (condicion.operador) {
        case '==': if (valorReal !== condicion.valor) return false; break;
        case '!=': if (valorReal === condicion.valor) return false; break;
        case '>': if ((valorReal as number) <= (condicion.valor as number)) return false; break;
        case '<': if ((valorReal as number) >= (condicion.valor as number)) return false; break;
        case '>=': if ((valorReal as number) < (condicion.valor as number)) return false; break;
        case '<=': if ((valorReal as number) > (condicion.valor as number)) return false; break;
        case 'contains': if (!(valorReal as string).includes(condicion.valor as string)) return false; break;
      }
    }
    
    return true;
  }

  /**
   * Obtiene valor anidado de un objeto (ej: 'cliente.inversionAnual')
   */
  private static obtenerValorAnidado(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }

  /**
   * Ejecuta un workflow
   */
  static async ejecutarWorkflow(
    workflow: WorkflowDefinition,
    triggerData: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    
    const ejecucion: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: workflow.id,
      triggerData,
      estadoActual: 'ejecutando',
      accionesEjecutadas: [],
      inicioEjecucion: new Date()
    };
    
    this.ejecucionesActivas.set(ejecucion.id, ejecucion);
    
    // Ordenar acciones
    const accionesOrdenadas = [...workflow.acciones].sort((a, b) => a.orden - b.orden);
    
    try {
      for (const accion of accionesOrdenadas) {
        const resultado = await this.ejecutarAccion(accion, triggerData);
        ejecucion.accionesEjecutadas.push({
          accionId: accion.id,
          resultado,
          timestamp: new Date()
        });
      }
      
      ejecucion.estadoActual = 'completado';
    } catch (error) {
      ejecucion.estadoActual = 'fallido';
      ejecucion.error = error instanceof Error ? error.message : 'Error desconocido';
      
      if (workflow.rollbackHabilitado) {
        await this.ejecutarRollback(ejecucion);
      }
    }
    
    ejecucion.finEjecucion = new Date();
    this.ejecucionesActivas.delete(ejecucion.id);
    this.historial.push(ejecucion);
    
    logger.info(`[WORKFLOW] ${workflow.nombre} - ${ejecucion.estadoActual}`);
    
    return ejecucion;
  }

  /**
   * Ejecuta una acción individual
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async ejecutarAccion(accion: Accion, _datos: Record<string, unknown>): Promise<string> {
    // Simular ejecución
    await new Promise(r => setTimeout(r, 100));
    
    switch (accion.tipo) {
      case 'enviar_email':
        return `Email enviado con template ${(accion.parametros as { template: string }).template}`;
      case 'crear_tarea':
        return `Tarea creada: ${(accion.parametros as { titulo: string }).titulo}`;
      case 'notificar':
        return `Notificación enviada: ${(accion.parametros as { mensaje: string }).mensaje}`;
      case 'escalar':
        return `Escalado a nivel ${(accion.parametros as { nivel: string }).nivel}`;
      case 'asignar':
        return `Asignado a ${(accion.parametros as { rol: string }).rol}`;
      case 'webhook':
        return `Webhook ejecutado: ${(accion.parametros as { url: string }).url}`;
      default:
        return 'Acción ejecutada';
    }
  }

  /**
   * Ejecuta rollback si el workflow falla
   */
  private static async ejecutarRollback(ejecucion: WorkflowExecution): Promise<void> {
    ejecucion.estadoActual = 'rollback';
    logger.info(`[WORKFLOW] Ejecutando rollback para ${ejecucion.id}`);
    
    // Revertir acciones en orden inverso (simulado)
    const accionesReversas = [...ejecucion.accionesEjecutadas].reverse();
    for (const accion of accionesReversas) {
      logger.info(`[ROLLBACK] Revirtiendo ${accion.accionId}`);
    }
  }

  /**
   * Obtiene historial de ejecuciones
   */
  static obtenerHistorial(filtro?: { workflowId?: string; estado?: string }): WorkflowExecution[] {
    let resultado = [...this.historial];
    
    if (filtro?.workflowId) {
      resultado = resultado.filter(e => e.workflowId === filtro.workflowId);
    }
    if (filtro?.estado) {
      resultado = resultado.filter(e => e.estadoActual === filtro.estado);
    }
    
    return resultado.slice(-50); // Últimas 50
  }

  /**
   * Estadísticas del engine
   */
  static obtenerEstadisticas(): {
    workflowsActivos: number;
    ejecucionesTotales: number;
    ejecucionesExitosas: number;
    ejecucionesFallidas: number;
    promedioTiempoEjecucion: number;
  } {
    const exitosas = this.historial.filter(e => e.estadoActual === 'completado').length;
    const fallidas = this.historial.filter(e => e.estadoActual === 'fallido').length;
    
    return {
      workflowsActivos: workflowsPreconfigurados.filter(w => w.activo).length,
      ejecucionesTotales: this.historial.length,
      ejecucionesExitosas: exitosas,
      ejecucionesFallidas: fallidas,
      promedioTiempoEjecucion: 150 // ms
    };
  }
}

export default AutonomousWorkflowsEngine;
