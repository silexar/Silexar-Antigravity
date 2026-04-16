/**
 * TokenCifrado Value Object
 *
 * Encapsula un token cifrado con AES-256-GCM incluyendo
 * el ciphertext, IV (initialization vector) y auth tag.
 */

export interface TokenCifradoProps {
  cipher: string;
  iv: string;
  authTag: string;
}

export class TokenCifrado {
  private constructor(
    private readonly _cipher: string,
    private readonly _iv: string,
    private readonly _authTag: string
  ) {
    if (!_cipher || !_iv || !_authTag) {
      throw new Error('TokenCifrado requiere cipher, iv y authTag');
    }
  }

  static create(props: TokenCifradoProps): TokenCifrado {
    return new TokenCifrado(props.cipher, props.iv, props.authTag);
  }

  get cipher(): string {
    return this._cipher;
  }

  get iv(): string {
    return this._iv;
  }

  get authTag(): string {
    return this._authTag;
  }

  toJSON(): TokenCifradoProps {
    return {
      cipher: this._cipher,
      iv: this._iv,
      authTag: this._authTag
    };
  }

  equals(other: TokenCifrado): boolean {
    return (
      this._cipher === other.cipher &&
      this._iv === other.iv &&
      this._authTag === other.authTag
    );
  }
}
