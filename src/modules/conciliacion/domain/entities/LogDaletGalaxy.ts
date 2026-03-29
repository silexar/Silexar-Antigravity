import { Entity } from "./base/AggregateRoot";
import { RutaArchivoDalet } from "../value-objects/RutaArchivoDalet";
import { FormatoArchivoDalet } from "../value-objects/FormatoArchivoDalet";
import { ValidadorFormato } from "../value-objects/ValidadorFormato";

interface LogDaletGalaxyProps {
  ruta: RutaArchivoDalet;
  formato: FormatoArchivoDalet;
  fechaCarga: Date;
  checksum: string;
  validacion: ValidadorFormato;
  numeroLineas: number;
}

export class LogDaletGalaxy extends Entity<LogDaletGalaxyProps> {
  private constructor(props: LogDaletGalaxyProps, id?: string) {
    super(props, id);
  }

  public static create(props: LogDaletGalaxyProps, id?: string): LogDaletGalaxy {
    return new LogDaletGalaxy(props, id);
  }

  public get isValido(): boolean {
    return this.props.validacion.isValid;
  }
}
