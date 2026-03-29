import { MetricasEmision } from "../entities/MetricasEmision";

export interface IMetricasEmisionRepository {
  save(metricas: MetricasEmision): Promise<void>;
  findByEmisora(emisoraId: string): Promise<MetricasEmision[]>;
  getUltimas(emisoraId: string, limit: number): Promise<MetricasEmision[]>;
}
