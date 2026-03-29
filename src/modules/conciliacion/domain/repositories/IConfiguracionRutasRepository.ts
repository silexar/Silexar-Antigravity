import { ConfiguracionRutas } from "../entities/ConfiguracionRutas";

export interface IConfiguracionRutasRepository {
  save(config: ConfiguracionRutas): Promise<void>;
  getActual(): Promise<ConfiguracionRutas | null>;
}
