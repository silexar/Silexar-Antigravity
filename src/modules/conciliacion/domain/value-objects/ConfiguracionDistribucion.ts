import { z } from "zod";

export interface ConfiguracionDistribucionProps {
  maxSpotsPorBloque: number;
  priorizarPrimeTime: boolean;
  margenSeguridadMinutos: number;
  permitirSobreventa: boolean;
}

export class ConfiguracionDistribucion {
  private readonly _props: ConfiguracionDistribucionProps;

  private constructor(props: ConfiguracionDistribucionProps) {
    this._props = props;
  }

  public get props(): ConfiguracionDistribucionProps {
    return { ...this._props };
  }

  public static create(props: ConfiguracionDistribucionProps): ConfiguracionDistribucion {
    const schema = z.object({
      maxSpotsPorBloque: z.number().int().min(1).max(20),
      priorizarPrimeTime: z.boolean(),
      margenSeguridadMinutos: z.number().int().min(0).max(60),
      permitirSobreventa: z.boolean()
    });
    schema.parse(props);
    return new ConfiguracionDistribucion(props);
  }

  public static default(): ConfiguracionDistribucion {
      return new ConfiguracionDistribucion({
          maxSpotsPorBloque: 3,
          priorizarPrimeTime: true,
          margenSeguridadMinutos: 5,
          permitirSobreventa: false
      });
  }
}
