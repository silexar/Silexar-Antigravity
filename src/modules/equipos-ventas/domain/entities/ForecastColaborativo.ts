/**
 * ENTIDAD FORECAST COLABORATIVO - TIER 0 ENTERPRISE
 *
 * @description Permite la construcción de pronósticos de venta colaborativos (Bottom-up).
 * Vendedores envían su commit, gerentes ajustan y consolidan.
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { v4 as uuidv4 } from 'uuid';

export interface ForecastEntry {
  vendedorId: string;
  categoria: 'COMMIT' | 'MOST_LIKELY' | 'BEST_CASE' | 'PIPELINE';
  monto: number;
  probabilidadPonderada: number;
  notas?: string;
  fechaIngreso: Date;
}

export interface ForecastColaborativoProps {
  id: string;
  equipoId: string;
  periodo: string; // '2025-Q1'
  entries: ForecastEntry[];
  ajusteGerencial: number; // Adjustment override by manager
  montoFinalConsolidado: number;
  estado: 'ABIERTO' | 'CERRADO_PRELIMINAR' | 'ENVIADO';
  fechaCierre: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class ForecastColaborativo {
  private constructor(private props: ForecastColaborativoProps) {
    this.validate();
  }

  public static create(
    props: Omit<ForecastColaborativoProps, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'entries' | 'montoFinalConsolidado' | 'estado'>
  ): ForecastColaborativo {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : uuidv4();
    const fecha = new Date();

    return new ForecastColaborativo({
      ...props,
      id,
      entries: [],
      montoFinalConsolidado: 0,
      estado: 'ABIERTO',
      fechaCreacion: fecha,
      fechaActualizacion: fecha,
    });
  }

  public static fromPersistence(props: ForecastColaborativoProps): ForecastColaborativo {
    return new ForecastColaborativo(props);
  }

  private validate(): void {
    if (!this.props.periodo) throw new Error('Periodo requerido');
    if (!this.props.equipoId) throw new Error('Equipo ID requerido');
  }

  // Business Logic
  public agregarEntrada(entry: Omit<ForecastEntry, 'fechaIngreso'>): void {
    if (this.props.estado === 'ENVIADO') throw new Error('El forecast ya fue enviado, no se pueden agregar entradas');
    
    // Remplazar entrada anterior del mismo vendedor y categoría si existe, o agregar nueva
    const index = this.props.entries.findIndex(e => e.vendedorId === entry.vendedorId && e.categoria === entry.categoria);
    
    const newEntry: ForecastEntry = {
        ...entry,
        fechaIngreso: new Date()
    };

    if (index >= 0) {
        this.props.entries[index] = newEntry;
    } else {
        this.props.entries.push(newEntry);
    }
    
    this.recalcularConsolidado();
    this.props.fechaActualizacion = new Date();
  }

  public aplicarAjusteGerencial(montoAjuste: number): void {
      this.props.ajusteGerencial = montoAjuste;
      this.recalcularConsolidado();
      this.props.fechaActualizacion = new Date();
  }

  private recalcularConsolidado(): void {
      // Suma simple de commits + ajustes
      // En un modelo real, esto puede ser mucho más complejo ponderando categorías
      const totalCommit = this.props.entries
        .filter(e => e.categoria === 'COMMIT')
        .reduce((sum, e) => sum + e.monto, 0);
      
      this.props.montoFinalConsolidado = totalCommit + (this.props.ajusteGerencial || 0);
  }
  
  public cerrarPeriodo(): void {
      this.props.estado = 'ENVIADO';
      this.props.fechaActualizacion = new Date();
  }

  public toSnapshot(): ForecastColaborativoProps {
    return { ...this.props };
  }
}
