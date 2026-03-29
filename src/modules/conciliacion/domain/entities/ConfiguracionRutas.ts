import { AggregateRoot } from "./base/AggregateRoot";
import { RutaArchivoDalet } from "../value-objects/RutaArchivoDalet";
import { FormatoArchivoDalet } from "../value-objects/FormatoArchivoDalet";

interface ConfiguracionRutaItem {
  emisoraId: string;
  rutaPrincipal: RutaArchivoDalet;
  rutaBackup: RutaArchivoDalet;
  formato: FormatoArchivoDalet;
  activo: boolean;
}

interface ConfiguracionRutasProps {
  items: ConfiguracionRutaItem[];
  ultimaActualizacion: Date;
}

export class ConfiguracionRutas extends AggregateRoot<ConfiguracionRutasProps> {
  private constructor(props: ConfiguracionRutasProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<ConfiguracionRutasProps, 'ultimaActualizacion'>, id?: string): ConfiguracionRutas {
    return new ConfiguracionRutas({
      ...props,
      ultimaActualizacion: new Date()
    }, id);
  }

  public obtenerRutaParaEmisora(emisoraId: string): ConfiguracionRutaItem | undefined {
    return this.props.items.find(i => i.emisoraId === emisoraId && i.activo);
  }
}
