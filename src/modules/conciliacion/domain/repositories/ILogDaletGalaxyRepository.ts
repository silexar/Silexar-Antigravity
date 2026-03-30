import { LogDaletGalaxy } from "../entities/LogDaletGalaxy";

export interface ILogDaletGalaxyRepository {
  save(log: LogDaletGalaxy): Promise<void>;
  findById(id: string): Promise<LogDaletGalaxy | null>;
  findByChecksum(checksum: string): Promise<LogDaletGalaxy | null>;
  findUltimosCargados(limit: number): Promise<LogDaletGalaxy[]>;
}
