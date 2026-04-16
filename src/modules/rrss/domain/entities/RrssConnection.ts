import { PlataformaRrssVO } from '../value-objects/PlataformaRrss';
import { TokenCifrado } from '../value-objects/TokenCifrado';

export interface RrssConnectionProps {
  id: string;
  tenantId: string;
  userId: string;
  plataforma: string;
  accountId: string;
  accountName?: string;
  accountAvatar?: string;
  accessToken: TokenCifrado;
  refreshToken?: TokenCifrado;
  scopes: string[];
  expiresAt?: Date;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export class RrssConnection {
  private constructor(private readonly props: RrssConnectionProps) {
    if (!props.id) throw new Error('id es requerido');
    if (!props.tenantId) throw new Error('tenantId es requerido');
    if (!props.userId) throw new Error('userId es requerido');
    if (!props.accountId) throw new Error('accountId es requerido');
    this.plataformaVO; // triggers validation
  }

  static create(props: RrssConnectionProps): RrssConnection {
    return new RrssConnection({
      ...props,
      scopes: props.scopes || [],
      creadoEn: props.creadoEn || new Date(),
    });
  }

  static reconstitute(props: RrssConnectionProps): RrssConnection {
    return new RrssConnection(props);
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get userId(): string { return this.props.userId; }
  get accountId(): string { return this.props.accountId; }
  get accountName(): string | undefined { return this.props.accountName; }
  get accountAvatar(): string | undefined { return this.props.accountAvatar; }
  get scopes(): string[] { return this.props.scopes; }
  get expiresAt(): Date | undefined { return this.props.expiresAt; }
  get creadoEn(): Date { return this.props.creadoEn || new Date(); }
  get actualizadoEn(): Date | undefined { return this.props.actualizadoEn; }

  get plataformaVO(): PlataformaRrssVO {
    return PlataformaRrssVO.create(this.props.plataforma);
  }

  get plataforma(): string {
    return this.plataformaVO.value;
  }

  get accessToken(): TokenCifrado {
    return this.props.accessToken;
  }

  get refreshToken(): TokenCifrado | undefined {
    return this.props.refreshToken;
  }

  estaExpirado(): boolean {
    if (!this.props.expiresAt) return false;
    return new Date() >= this.props.expiresAt;
  }

  actualizarToken(accessToken: TokenCifrado, refreshToken?: TokenCifrado, expiresAt?: Date): RrssConnection {
    return RrssConnection.reconstitute({
      ...this.props,
      accessToken,
      refreshToken,
      expiresAt,
      actualizadoEn: new Date(),
    });
  }

  toJSON() {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      userId: this.props.userId,
      plataforma: this.plataforma,
      accountId: this.props.accountId,
      accountName: this.props.accountName,
      accountAvatar: this.props.accountAvatar,
      accessToken: this.props.accessToken.toJSON(),
      refreshToken: this.props.refreshToken?.toJSON(),
      scopes: this.props.scopes,
      expiresAt: this.props.expiresAt,
      creadoEn: this.props.creadoEn,
      actualizadoEn: this.props.actualizadoEn,
    };
  }
}
