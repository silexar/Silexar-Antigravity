import { Entity } from "./base/AggregateRoot";
import { ConfiguracionDistribucion } from "../value-objects/ConfiguracionDistribucion";
import { FranjaHoraria } from "../value-objects/FranjaHoraria";

interface AlgoritmoDistribucionProps {
  nombre: string;
  descripcion: string;
  configuracion: ConfiguracionDistribucion;
  version: string;
  activo: boolean;
}

export class AlgoritmoDistribucion extends Entity<AlgoritmoDistribucionProps> {
  private constructor(props: AlgoritmoDistribucionProps, id?: string) {
    super(props, id);
  }

  public static create(props: AlgoritmoDistribucionProps, id?: string): AlgoritmoDistribucion {
    return new AlgoritmoDistribucion(props, id);
  }

  public sugerirFranja(horaOriginal: Date): FranjaHoraria {
    const hora = horaOriginal.getHours();
    if (hora >= 6 && hora <= 10) return FranjaHoraria.create('PRIME_MATINAL');
    if (hora >= 18 && hora <= 22) return FranjaHoraria.create('PRIME_VESPERTINO');
    if (hora >= 0 && hora <= 5) return FranjaHoraria.create('MADRUGADA');
    return FranjaHoraria.create('RESTO_DIA');
  }
}
