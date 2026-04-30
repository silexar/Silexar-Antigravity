/**
 * ENTIDAD AGENDA INTELIGENTE - TIER 0 ENTERPRISE
 * 
 * @description Gestión de la agenda diaria del vendedor generada por IA.
 * Prioriza tareas basadas en Deal Scoring y vencimientos.
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export enum TipoTareaAgenda {
  LLAMADA = 'LLAMADA',
  REUNION = 'REUNION',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  PROPUESTA = 'PROPUESTA',
  SEGUIMIENTO = 'SEGUIMIENTO',
  ADMINISTRATIVO = 'ADMINISTRATIVO'
}

export enum PrioridadTarea {
  CRITICA = 'CRITICA', // Vencimientos inminente, Deal Hot
  ALTA = 'ALTA', // Deal Warm, Seguimiento
  MEDIA = 'MEDIA', // Prospección
  BAJA = 'BAJA' // Admin
}

export interface TareaAgenda {
  id: string; // Tarea individual dentro de la agenda
  titulo: string;
  descripcion: string;
  tipo: TipoTareaAgenda;
  prioridad: PrioridadTarea;
  entidadRelacionadaId?: string; // DealId, ClienteId
  entidadTipo?: string; // 'DEAL', 'CLIENTE', 'CONTRATO'
  fechaHoraSugerida: Date;
  completada: boolean;
  resultado?: string; // "Cliente no contestó", "Reunión agendada"
  scoreImpacto: number; // Impacto estimado en quota (0-100)
}

export interface AgendaInteligenteProps {
  id: string;
  vendedorId: string;
  fecha: Date; // Agenda del día 2025-05-20
  tareas: TareaAgenda[];
  progresoDia: number; // % tareas completadas
  scoreProductividad: number; // 0-100 calculado al cierre del día
  generadoPorIA: boolean;
  metadata: Record<string, unknown>;
}

export class AgendaInteligente {
  private constructor(private props: AgendaInteligenteProps) {
    this.validate();
  }

  public static create(props: Omit<AgendaInteligenteProps, 'id' | 'progresoDia' | 'scoreProductividad'>): AgendaInteligente {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid-' + Date.now();
    
    return new AgendaInteligente({
      ...props,
      id,
      progresoDia: 0,
      scoreProductividad: 0,
      metadata: props.metadata || {}
    });
  }

  public static fromPersistence(props: AgendaInteligenteProps): AgendaInteligente {
    return new AgendaInteligente(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('Vendedor requerido');
    if (this.props.tareas.length === 0 && this.props.generadoPorIA) {
      // Permitimos agenda vacía si es manual, pero IA debería generar algo
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get vendedorId(): string { return this.props.vendedorId; }
  get tareasPendientes(): TareaAgenda[] { return this.props.tareas.filter(t => !t.completada); }
  get progreso(): number { return this.props.progresoDia; }

  // Métodos de Dominio
  public completarTarea(tareaId: string, resultado?: string): void {
    const tarea = this.props.tareas.find(t => t.id === tareaId);
    if (!tarea) throw new Error('Tarea no encontrada');
    
    tarea.completada = true;
    tarea.resultado = resultado;
    
    this.recalcularProgreso();
  }

  public agregarTareaManual(tarea: Omit<TareaAgenda, 'id' | 'completada'>): void {
    const nuevaTarea: TareaAgenda = {
      ...tarea,
      id: uuidv4(),
      completada: false,
      scoreImpacto: tarea.scoreImpacto || 0
    };
    this.props.tareas.push(nuevaTarea);
    this.recalcularProgreso();
  }

  public posponerTarea(tareaId: string, nuevaFecha: Date): void {
    const tarea = this.props.tareas.find(t => t.id === tareaId);
    if (!tarea) throw new Error('Tarea no encontrada');
    tarea.fechaHoraSugerida = nuevaFecha;
  }

  private recalcularProgreso(): void {
    const total = this.props.tareas.length;
    if (total === 0) {
      this.props.progresoDia = 100;
      return;
    }
    const completadas = this.props.tareas.filter(t => t.completada).length;
    this.props.progresoDia = Math.round((completadas / total) * 100);
    
    // Score de productividad simple: % completado ponderado por prioridad
    // (Lógica completa iría en servicio de dominio o handler)
  }

  public toSnapshot(): AgendaInteligenteProps {
    return { ...this.props };
  }
}
