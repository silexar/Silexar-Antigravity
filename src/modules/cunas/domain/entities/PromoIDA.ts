/**
 * ENTITY: PROMO IDA — TIER 0
 *
 * Representa un contenido promocional variable con plantillas dinámicas.
 * Permite definir textos base con {VARIABLES} que se resuelven en tiempo
 * de emisión, soportando eventos, precios, fechas y datos del anunciante.
 */

import { EstadoCuna, type EstadoCunaValor } from '../value-objects/EstadoCuna';
import { CunaId } from '../value-objects/CunaId';

export interface VariableIDA {
  nombre: string;          // Ej: "{EVENTO}"
  tipo: 'texto' | 'numero' | 'fecha' | 'telefono' | 'url' | 'auto';
  valorPorDefecto?: string | null;
  descripcion?: string | null;
  requerida: boolean;
}

export interface PromoIDAProps {
  id: string;
  tenantId: string;
  codigo: string;
  nombre: string;
  estado: EstadoCunaValor;
  anuncianteId: string;
  campanaId?: string | null;
  contratoId?: string | null;
  // Contenido de la IDA
  plantillaTexto: string;          // Texto con {VARIABLES} embebidas
  variables: VariableIDA[];        // Definición de cada variable
  duracionEstimadaSegundos: number;
  // Audio generado desde la plantilla resuelta
  audioGeneradoId?: string | null;
  necesitaConversionAudio: boolean;
  // Versionado
  version: number;
  esVersionActual: boolean;
  versionAnteriorId?: string | null;
  // Vigencia
  fechaInicioVigencia?: Date | null;
  fechaFinVigencia?: Date | null;
  // Aprobación
  aprobadoPorId?: string | null;
  fechaAprobacion?: Date | null;
  motivoRechazo?: string | null;
  // Auditoría
  subidoPorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PromoIDA {
  private constructor(private props: PromoIDAProps) {}

  static create(
    props: Omit<PromoIDAProps, 'id' | 'estado' | 'version' | 'esVersionActual' | 'createdAt' | 'updatedAt'>
    & { id?: string }
  ): PromoIDA {
    const now = new Date();
    return new PromoIDA({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      estado: 'borrador',
      version: 1,
      esVersionActual: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: PromoIDAProps): PromoIDA {
    return new PromoIDA(props);
  }

  get promoId(): CunaId { return CunaId.fromString(this.props.codigo); }
  get estadoPromo(): EstadoCuna { return EstadoCuna.create(this.props.estado); }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get codigo(): string { return this.props.codigo; }
  get nombre(): string { return this.props.nombre; }
  get estado(): EstadoCunaValor { return this.props.estado; }
  get anuncianteId(): string { return this.props.anuncianteId; }
  get plantillaTexto(): string { return this.props.plantillaTexto; }
  get variables(): VariableIDA[] { return [...this.props.variables]; }
  get duracionEstimadaSegundos(): number { return this.props.duracionEstimadaSegundos; }
  get audioGeneradoId(): string | null { return this.props.audioGeneradoId ?? null; }
  get necesitaConversionAudio(): boolean { return this.props.necesitaConversionAudio; }
  get version(): number { return this.props.version; }
  get fechaFinVigencia(): Date | null { return this.props.fechaFinVigencia ?? null; }
  get subidoPorId(): string { return this.props.subidoPorId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Resuelve la plantilla reemplazando {VARIABLES} con valores dados.
   * Lanza error si hay variables requeridas sin valor.
   */
  resolverPlantilla(valores: Record<string, string>): string {
    let texto = this.props.plantillaTexto;
    for (const variable of this.props.variables) {
      const valor = valores[variable.nombre] ?? variable.valorPorDefecto ?? null;
      if (!valor && variable.requerida) {
        throw new Error(`Variable requerida sin valor: ${variable.nombre}`);
      }
      if (valor) {
        texto = texto.replace(new RegExp(variable.nombre.replace(/[{}]/g, '\\$&'), 'g'), valor);
      }
    }
    return texto;
  }

  /** Verifica que todas las variables requeridas estén definidas en la plantilla */
  validarPlantilla(): { valida: boolean; errores: string[] } {
    const errores: string[] = [];
    for (const variable of this.props.variables) {
      if (!this.props.plantillaTexto.includes(variable.nombre)) {
        errores.push(`Variable ${variable.nombre} definida pero no usada en la plantilla`);
      }
    }
    // Detectar variables en plantilla sin definición
    const patron = /\{[A-Z_]+\}/g;
    const enPlantilla = this.props.plantillaTexto.match(patron) ?? [];
    for (const v of enPlantilla) {
      if (!this.props.variables.some(def => def.nombre === v)) {
        errores.push(`Variable ${v} usada en plantilla pero no definida`);
      }
    }
    return { valida: errores.length === 0, errores };
  }

  actualizarPlantilla(plantilla: string, variables: VariableIDA[]): void {
    this.props.plantillaTexto = plantilla;
    this.props.variables = variables;
    this.props.updatedAt = new Date();
  }

  registrarAudioGenerado(audioId: string): void {
    this.props.audioGeneradoId = audioId;
    this.props.necesitaConversionAudio = false;
    this.props.updatedAt = new Date();
  }

  aprobar(aprobadoPorId: string): void {
    const nuevoEstado = this.estadoPromo.transicionarA('aprobada');
    const now = new Date();
    this.props.estado = nuevoEstado.valor;
    this.props.aprobadoPorId = aprobadoPorId;
    this.props.fechaAprobacion = now;
    this.props.updatedAt = now;
  }

  rechazar(rechazadoPorId: string, motivo: string): void {
    const nuevoEstado = this.estadoPromo.transicionarA('rechazada');
    const now = new Date();
    this.props.estado = nuevoEstado.valor;
    this.props.aprobadoPorId = rechazadoPorId;
    this.props.motivoRechazo = motivo;
    this.props.updatedAt = now;
  }

  enviarARevision(): void {
    const nuevoEstado = this.estadoPromo.transicionarA('pendiente_aprobacion');
    this.props.estado = nuevoEstado.valor;
    this.props.updatedAt = new Date();
  }

  esVigente(): boolean {
    const ahora = new Date();
    if (this.props.fechaInicioVigencia && ahora < this.props.fechaInicioVigencia) return false;
    if (this.props.fechaFinVigencia && ahora > this.props.fechaFinVigencia) return false;
    return true;
  }

  diasParaVencer(): number {
    if (!this.props.fechaFinVigencia) return -1;
    const diff = this.props.fechaFinVigencia.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  toJSON(): PromoIDAProps {
    return { ...this.props, variables: this.props.variables.map(v => ({ ...v })) };
  }
}
