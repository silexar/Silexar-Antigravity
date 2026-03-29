/**
 * ENTIDAD CAREER PATHWAY - TIER 0 ENTERPRISE
 *
 * @description Modela el plan de carrera del vendedor.
 * Define requisitos para ascenso y próximo nivel (Junior -> Senior, etc.).
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface RequisitoAscenso {
  descripcion: string;
  tipo: 'METRICA' | 'CERTIFICACION' | 'ANTIGUEDAD';
  valorObjetivo?: number;
  valorActual: number;
  cumplido: boolean;
}

export interface CareerPathwayProps {
  id: string;
  vendedorId: string;
  nivelActual: string; // Ej: 'JUNIOR_AE'
  nivelSiguiente: string; // Ej: 'SENIOR_AE'
  fechaInicioNivel: Date;
  requisitos: RequisitoAscenso[];
  listoParaAscenso: boolean;
  comentariosManager?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class CareerPathway {
  private constructor(private props: CareerPathwayProps) {
    this.validate();
  }

  public static create(
    props: Omit<CareerPathwayProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'listoParaAscenso'>
  ): CareerPathway {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new CareerPathway({
      ...props,
      id,
      listoParaAscenso: false,
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: CareerPathwayProps): CareerPathway {
    return new CareerPathway(props);
  }

  private validate(): void {
    if (!this.props.vendedorId) throw new Error('Vendedor requerido');
    if (!this.props.nivelSiguiente) throw new Error('Nivel siguiente requerido');
  }

  // Business Logic
  public actualizarProgresoRequisito(indice: number, nuevoValor: number): void {
      if (indice < 0 || indice >= this.props.requisitos.length) throw new Error('Índice de requisito inválido');
      
      const req = this.props.requisitos[indice];
      req.valorActual = nuevoValor;
      
      if (req.valorObjetivo !== undefined && req.valorActual >= req.valorObjetivo) {
          req.cumplido = true;
      }

      this.verificarElegibilidadAscenso();
      this.props.fechaActualizacion = new Date();
  }

  public marcarRequisitoCumplidoManual(indice: number): void {
      if (indice < 0 || indice >= this.props.requisitos.length) throw new Error('Índice de requisito inválido');
      this.props.requisitos[indice].cumplido = true;
      this.verificarElegibilidadAscenso();
      this.props.fechaActualizacion = new Date();
  }

  private verificarElegibilidadAscenso(): void {
      this.props.listoParaAscenso = this.props.requisitos.every(r => r.cumplido);
  }

  public toSnapshot(): CareerPathwayProps {
    return { ...this.props };
  }
}
