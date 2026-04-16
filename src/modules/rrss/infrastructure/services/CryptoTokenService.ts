import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { ICryptoTokenService } from '../../application/services/ICryptoTokenService';
import { TokenCifrado } from '../../domain/value-objects/TokenCifrado';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

export class CryptoTokenService implements ICryptoTokenService {
  private readonly masterKey: Buffer;

  constructor(secret: string) {
    if (!secret || secret.length < 16) {
      throw new Error('CryptoTokenService requiere un secret de al menos 16 caracteres');
    }
    // Derivar una clave fija de 32 bytes a partir del secret usando una salt fija interna
    this.masterKey = scryptSync(secret, 'silexar-rrss-salt-v1', KEY_LENGTH);
  }

  encrypt(plainText: string): TokenCifrado {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return TokenCifrado.create({
      cipher: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    });
  }

  decrypt(token: TokenCifrado): string {
    const decipher = createDecipheriv(
      ALGORITHM,
      this.masterKey,
      Buffer.from(token.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(token.authTag, 'hex'));

    let decrypted = decipher.update(token.cipher, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
