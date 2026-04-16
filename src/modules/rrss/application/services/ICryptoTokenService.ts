import { TokenCifrado } from '../../domain/value-objects/TokenCifrado';

export interface ICryptoTokenService {
  encrypt(plainText: string): TokenCifrado;
  decrypt(token: TokenCifrado): string;
}
