import { logger } from '@/lib/observability';
export class PerformanceMonitorService {
  public trackExecution(processName: string, durationMs: number): void {
    logger.info(`[PerfMonitor] Proceso: ${processName} - Duración: ${durationMs}ms`);
    // Simulación de envío a Prometheus/Grafana
  }
}
