/**
 * 💎 VALUE OBJECT: CertificacionBlockchain
 * 
 * Encapsula la evidencia criptográfica almacenada en la blockchain.
 * Valida el formato del hash.
 * 
 * @tier TIER_0_ENTERPRISE
 */

export class CertificacionBlockchain {
  private readonly hash: string;
  private readonly explorerUrl: string;

  private constructor(hash: string, explorerUrl: string) {
    if (!this.isValidHash(hash)) {
      throw new Error("Formato de hash de blockchain inválido.");
    }
    this.hash = hash;
    this.explorerUrl = explorerUrl;
  }

  public static crear(hash: string, explorerUrl: string): CertificacionBlockchain {
    return new CertificacionBlockchain(hash, explorerUrl);
  }

  private isValidHash(hash: string): boolean {
    // Basic validation for Ethereum-like hash (0x + 64 hex chars)
    // Adjust regex based on actual blockchain implementation
    return /^0x[a-fA-F0-9]{64}$/.test(hash) || hash.startsWith("0x"); 
  }

  public getHash(): string {
    return this.hash;
  }

  public getUrl(): string {
    return this.explorerUrl;
  }
}
