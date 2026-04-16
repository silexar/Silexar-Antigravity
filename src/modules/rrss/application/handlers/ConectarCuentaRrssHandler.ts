import { Result } from '@/lib/utils/result';
import { RrssConnection } from '../../domain/entities/RrssConnection';
import { IRrssConnectionRepository } from '../../domain/repositories/IRrssConnectionRepository';
import { ConectarCuentaRrssCommand } from '../commands/ConectarCuentaRrssCommand';
import { ICryptoTokenService } from '../services/ICryptoTokenService';
import { TokenCifrado } from '../../domain/value-objects/TokenCifrado';
import { randomUUID } from 'crypto';

export class ConectarCuentaRrssHandler {
  constructor(
    private readonly repo: IRrssConnectionRepository,
    private readonly crypto: ICryptoTokenService
  ) {}

  async execute(command: ConectarCuentaRrssCommand): Promise<Result<RrssConnection>> {
    try {
      const { input } = command;
      const existing = await this.repo.findByAccountId(
        input.tenantId,
        input.plataforma,
        input.accountId
      );
      if (existing) {
        return Result.fail('Ya existe una conexión para esta cuenta');
      }

      const accessToken = this.crypto.encrypt(input.accessToken);
      const refreshToken = input.refreshToken
        ? this.crypto.encrypt(input.refreshToken)
        : undefined;

      const connection = RrssConnection.create({
        id: randomUUID(),
        tenantId: input.tenantId,
        userId: input.userId,
        plataforma: input.plataforma,
        accountId: input.accountId,
        accountName: input.accountName,
        accountAvatar: input.accountAvatar,
        accessToken,
        refreshToken,
        scopes: input.scopes,
        expiresAt: input.expiresAt,
      });

      await this.repo.saveConnection(connection);
      return Result.ok(connection);
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Error al conectar cuenta RRSS');
    }
  }
}
