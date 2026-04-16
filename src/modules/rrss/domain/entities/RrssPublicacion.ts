import { EstadoPublicacionRrssVO } from '../value-objects/EstadoPublicacion';

export interface RrssPublicacionProps {
  id: string;
  tenantId: string;
  connectionId: string;
  campanaId?: string | null;
  contratoId?: string | null;
  contenido: string;
  hashtags?: string[];
  mediaUrls?: string[];
  estado: string;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  externalPostId?: string | null;
  externalPostUrl?: string | null;
  errorLog?: string | null;
  creadoPorId: string;
  creadoEn?: Date;
  actualizadoEn?: Date | null;
}

export class RrssPublicacion {
  private constructor(private readonly props: RrssPublicacionProps) {
    if (!props.id) throw new Error('id es requerido');
    if (!props.tenantId) throw new Error('tenantId es requerido');
    if (!props.connectionId) throw new Error('connectionId es requerido');
    if (!props.contenido || props.contenido.trim().length === 0) {
      throw new Error('contenido es requerido');
    }
    this.estadoVO; // triggers validation
  }

  static create(props: Omit<RrssPublicacionProps, 'creadoEn'> & { creadoEn?: Date }): RrssPublicacion {
    return new RrssPublicacion({
      ...props,
      hashtags: props.hashtags || [],
      mediaUrls: props.mediaUrls || [],
      estado: props.estado || 'borrador',
      creadoEn: props.creadoEn || new Date(),
    });
  }

  static reconstitute(props: RrssPublicacionProps): RrssPublicacion {
    return new RrssPublicacion(props);
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get connectionId(): string { return this.props.connectionId; }
  get campanaId(): string | null | undefined { return this.props.campanaId; }
  get contratoId(): string | null | undefined { return this.props.contratoId; }
  get contenido(): string { return this.props.contenido; }
  get hashtags(): string[] { return this.props.hashtags || []; }
  get mediaUrls(): string[] { return this.props.mediaUrls || []; }
  get scheduledAt(): Date | null | undefined { return this.props.scheduledAt; }
  get publishedAt(): Date | null | undefined { return this.props.publishedAt; }
  get externalPostId(): string | null | undefined { return this.props.externalPostId; }
  get externalPostUrl(): string | null | undefined { return this.props.externalPostUrl; }
  get errorLog(): string | null | undefined { return this.props.errorLog; }
  get creadoPorId(): string { return this.props.creadoPorId; }
  get creadoEn(): Date { return this.props.creadoEn || new Date(); }
  get actualizadoEn(): Date | null | undefined { return this.props.actualizadoEn; }

  get estadoVO(): EstadoPublicacionRrssVO {
    return EstadoPublicacionRrssVO.create(this.props.estado);
  }

  get estado(): string {
    return this.estadoVO.value;
  }

  programar(fecha: Date): RrssPublicacion {
    if (!this.estadoVO.esModificable) {
      throw new Error('No se puede programar una publicación que ya fue publicada o cancelada');
    }
    if (fecha <= new Date()) {
      throw new Error('La fecha de programación debe ser futura');
    }
    return RrssPublicacion.reconstitute({
      ...this.props,
      estado: 'programada',
      scheduledAt: fecha,
      actualizadoEn: new Date(),
    });
  }

  marcarPublicada(externalPostId: string, externalPostUrl?: string): RrssPublicacion {
    return RrssPublicacion.reconstitute({
      ...this.props,
      estado: 'publicada',
      externalPostId,
      externalPostUrl: externalPostUrl || this.props.externalPostUrl,
      publishedAt: new Date(),
      actualizadoEn: new Date(),
    });
  }

  marcarFallida(error: string): RrssPublicacion {
    return RrssPublicacion.reconstitute({
      ...this.props,
      estado: 'fallida',
      errorLog: error,
      actualizadoEn: new Date(),
    });
  }

  cancelar(): RrssPublicacion {
    if (this.estadoVO.value === 'publicada') {
      throw new Error('No se puede cancelar una publicación ya publicada');
    }
    return RrssPublicacion.reconstitute({
      ...this.props,
      estado: 'cancelada',
      actualizadoEn: new Date(),
    });
  }

  actualizarDatos(data: Partial<Omit<RrssPublicacionProps, 'id' | 'tenantId' | 'creadoEn'>>): RrssPublicacion {
    if (!this.estadoVO.esModificable) {
      throw new Error('No se puede modificar una publicación en estado ' + this.estado);
    }
    return RrssPublicacion.reconstitute({
      ...this.props,
      ...data,
      actualizadoEn: new Date(),
    });
  }

  toJSON() {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      connectionId: this.props.connectionId,
      campanaId: this.props.campanaId,
      contratoId: this.props.contratoId,
      contenido: this.props.contenido,
      hashtags: this.props.hashtags,
      mediaUrls: this.props.mediaUrls,
      estado: this.estado,
      scheduledAt: this.props.scheduledAt,
      publishedAt: this.props.publishedAt,
      externalPostId: this.props.externalPostId,
      externalPostUrl: this.props.externalPostUrl,
      errorLog: this.props.errorLog,
      creadoPorId: this.props.creadoPorId,
      creadoEn: this.props.creadoEn,
      actualizadoEn: this.props.actualizadoEn,
    };
  }
}
