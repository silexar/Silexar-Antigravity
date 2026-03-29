import { AggregateRoot } from "./base/AggregateRoot";
import { BackupState } from "../value-objects/BackupState";

interface BackupSeguridadProps {
  nombre: string;
  descripcion: string;
  estado: BackupState;
  size: number;
  path: string;
  usuarioId: string;
}

export class BackupSeguridad extends AggregateRoot<BackupSeguridadProps> {
  private constructor(props: BackupSeguridadProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<BackupSeguridadProps, 'estado'>, id?: string): BackupSeguridad {
    return new BackupSeguridad({
      ...props,
      estado: BackupState.create('INICIAL')
    }, id);
  }

  public iniciar(): void {
      this.props.estado = BackupState.create('EN_PROCESO');
  }

  public finalizar(checksum: string, size: number): void {
      this.props.estado = BackupState.create('COMPLETADO', checksum);
      this.props.size = size;
  }

  public fallar(error: string): void {
      this.props.estado = BackupState.create('FALLIDO', error);
  }

  get isCompletado(): boolean {
      return this.props.estado.isSuccess();
  }
}
