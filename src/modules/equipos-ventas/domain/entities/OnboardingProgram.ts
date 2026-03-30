/**
 * ENTIDAD ONBOARDING PROGRAM - TIER 0 ENTERPRISE
 *
 * @description Gestiona el proceso de inducción y ramp-up de nuevos vendedores.
 * Rastrea progreso en módulos de capacitación y certificación.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface ModuloOnboarding {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'VIDEO' | 'EXAMEN' | 'ROLEPLAY' | 'SHADOWING';
  duracionEstimadaMinutos: number;
  completado: boolean;
  puntajeObtenido?: number;
  fechaCompletado?: Date;
  aprobadoPorId?: string; // Mentor o Manager
}

export interface OnboardingProgramProps {
  id: string;
  vendedorId: string;
  mentorId?: string;
  fechaInicio: Date;
  fechaFinEstimada: Date;
  modulos: ModuloOnboarding[];
  estado: 'EN_PROGRESO' | 'COMPLETADO' | 'RE Retrasado' | 'ABANDONADO';
  porcentajeAvance: number;
  calificacionFinal?: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class OnboardingProgram {
  private constructor(private props: OnboardingProgramProps) {
    this.validate();
  }

  public static create(
    props: Omit<OnboardingProgramProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'estado' | 'porcentajeAvance' | 'modulos'>
  ): OnboardingProgram {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new OnboardingProgram({
      ...props,
      id,
      modulos: [], // Se agregan módulos posteriormente o en la creación si se pasaran
      estado: 'EN_PROGRESO',
      porcentajeAvance: 0,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: OnboardingProgramProps): OnboardingProgram {
    return new OnboardingProgram(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('Vendedor requerido');
  }

  // Business Logic
  public agregarModulo(modulo: Omit<ModuloOnboarding, 'id' | 'completado'>): void {
      const nuevoModulo: ModuloOnboarding = {
          ...modulo,
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4(),
          completado: false
      };
      this.props.modulos.push(nuevoModulo);
      this.recalcularAvance();
  }

  public marcarModuloCompletado(moduloId: string, puntaje?: number, aprobadoPorId?: string): void {
      const modulo = this.props.modulos.find(m => m.id === moduloId);
      if (!modulo) throw new Error('Módulo no encontrado');

      modulo.completado = true;
      modulo.fechaCompletado = new Date();
      if (puntaje !== undefined) modulo.puntajeObtenido = puntaje;
      if (aprobadoPorId) modulo.aprobadoPorId = aprobadoPorId;

      this.recalcularAvance();
      this.props.fechaActualizacion = new Date();
  }

  private recalcularAvance(): void {
      if (this.props.modulos.length === 0) {
          this.props.porcentajeAvance = 0;
          return;
      }
      const completados = this.props.modulos.filter(m => m.completado).length;
      this.props.porcentajeAvance = Math.round((completados / this.props.modulos.length) * 100);

      if (this.props.porcentajeAvance === 100) {
          this.props.estado = 'COMPLETADO';
      }
  }

  public toSnapshot(): OnboardingProgramProps {
    return { ...this.props };
  }
}
