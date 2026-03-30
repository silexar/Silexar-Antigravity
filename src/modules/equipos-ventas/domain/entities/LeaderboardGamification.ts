/**
 * ENTIDAD LEADERBOARD GAMIFICATION - TIER 0 ENTERPRISE
 *
 * @description Gestiona rankings, medallas y puntos para motivar al equipo de ventas.
 * Soporta competiciones temporales y logros desbloqueables.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string; // Referencia a icono o URL
  puntos: number;
  fechaObtencion: Date;
}

export interface ParticipanteRanking {
  vendedorId: string;
  nombre: string;
  avatarUrl?: string;
  puntaje: number;
  posicion: number;
  tendencia: 'SUBE' | 'BAJA' | 'IGUAL';
  ultimaActualizacion: Date;
}

export interface LeaderboardGamificationProps {
  id: string;
  nombre: string;
  tipo: 'VENTAS_BRUTAS' | 'CANTIDAD_DEALS' | 'NUEVOS_CLIENTES' | 'MIXTO';
  periodoInicio: Date;
  periodoFin: Date;
  participantes: ParticipanteRanking[];
  reglasPuntaje: Record<string, number>; // Ej: {'VENTA': 10, 'REUNION': 2}
  premios: string[];
  activo: boolean; // Si el concurso está vigente
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class LeaderboardGamification {
  private constructor(private props: LeaderboardGamificationProps) {
    this.validate();
  }

  public static create(
    props: Omit<LeaderboardGamificationProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'activo' | 'participantes'>
  ): LeaderboardGamification {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new LeaderboardGamification({
        ...props,
        id,
        activo: true,
        participantes: [],
        fechaCreacion: fecha,
        fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: LeaderboardGamificationProps): LeaderboardGamification {
    return new LeaderboardGamification(props);
  }

  private validate(): void {
    if (this.props.periodoInicio >= this.props.periodoFin) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    if (!this.props.nombre) {
        throw new Error('El leaderboard debe tener un nombre');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get top3(): ParticipanteRanking[] {
    return this.props.participantes
      .sort((a, b) => b.puntaje - a.puntaje)
      .slice(0, 3);
  }

  // Business Logic
  public actualizarPuntaje(vendedorId: string, puntosExtra: number): void {
    if (!this.props.activo) throw new Error('El leaderboard no está activo');

    const participante = this.props.participantes.find(p => p.vendedorId === vendedorId);
    if (participante) {
      participante.puntaje += puntosExtra;
      participante.ultimaActualizacion = new Date();
    } else {
        // En un escenario real, deberíamos obtener datos del vendedor.
        // Aquí asumimos que se agregará correctamente mediante otro método o se maneja la excepción.
        // Simulamos agregar si no existe para simplificar
         throw new Error('Participante no encontrado en el leaderboard');
    }
    
    this.recalcularPosiciones();
    this.props.fechaActualizacion = new Date();
  }

  public agregarParticipante(vendedor: { id: string, nombre: string, avatarUrl?: string }): void {
      if (this.props.participantes.some(p => p.vendedorId === vendedor.id)) return;

      this.props.participantes.push({
          vendedorId: vendedor.id,
          nombre: vendedor.nombre,
          avatarUrl: vendedor.avatarUrl,
          puntaje: 0,
          posicion: this.props.participantes.length + 1,
          tendencia: 'IGUAL',
          ultimaActualizacion: new Date()
      });
      this.recalcularPosiciones();
  }

  private recalcularPosiciones(): void {
    this.props.participantes.sort((a, b) => b.puntaje - a.puntaje);
    this.props.participantes.forEach((p, index) => {
        const nuevaPosicion = index + 1;
        if (p.posicion !== nuevaPosicion) {
            p.tendencia = nuevaPosicion < p.posicion ? 'SUBE' : 'BAJA';
            p.posicion = nuevaPosicion;
        } else {
            p.tendencia = 'IGUAL';
        }
    });
  }
  
  public finalizar(): void {
      this.props.activo = false;
      this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): LeaderboardGamificationProps {
    return { ...this.props };
  }
}
