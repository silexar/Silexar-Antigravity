import { RutaArchivoDalet } from "../../domain/value-objects/RutaArchivoDalet";
import { logger } from '@/lib/observability';

export class FileSystemWatcherService {
  private watchers: Map<string, unknown> = new Map();

  public watchDirectory(ruta: RutaArchivoDalet, _onFileCreated: (filename: string) => void): void {
    logger.info(`[FSWatcher] Monitoreando directorio: ${ruta.value}`);
    // Simulación de watcher
    this.watchers.set(ruta.value, { active: true });
  }

  public stopWatching(ruta: RutaArchivoDalet): void {
    this.watchers.delete(ruta.value);
    logger.info(`[FSWatcher] Detenido monitoreo en: ${ruta.value}`);
  }
}
