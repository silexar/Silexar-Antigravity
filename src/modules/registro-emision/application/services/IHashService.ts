/**
 * IHashService
 * Calcula hash SHA-256 de archivos o buffers.
 */

export interface IHashService {
  calcularSha256(urlArchivo: string): Promise<string>;
  calcularSha256FromBuffer(buffer: Buffer): Promise<string>;
}
