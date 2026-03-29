import { AuditoriaRecuperacion } from "../entities/AuditoriaRecuperacion";

export interface IAuditoriaRecuperacionRepository {
  save(auditoria: AuditoriaRecuperacion): Promise<void>;
  findByRecuperacionId(recuperacionId: string): Promise<AuditoriaRecuperacion[]>;
  findByUsuario(usuarioId: string): Promise<AuditoriaRecuperacion[]>;
}
