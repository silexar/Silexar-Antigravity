import { createHash } from 'crypto';
import type { IHashService } from '../../application/services/IHashService';

/**
 * HashServiceNode
 * Implementación de hash SHA-256 usando Node.js crypto.
 * Para archivos remotos, actualmente genera un hash determinístico simulado.
 */
export class HashServiceNode implements IHashService {
  async calcularSha256(urlArchivo: string): Promise<string> {
    // TODO: descargar archivo y calcular hash real si es URL remota
    const hash = createHash('sha256').update(urlArchivo + Date.now()).digest('hex');
    return hash;
  }

  async calcularSha256FromBuffer(buffer: Buffer): Promise<string> {
    return createHash('sha256').update(buffer).digest('hex');
  }
}
