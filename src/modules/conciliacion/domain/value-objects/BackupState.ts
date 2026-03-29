import { z } from "zod";

export type BackupStatus = 'INICIAL' | 'EN_PROCESO' | 'COMPLETADO' | 'FALLIDO';

export class BackupState {
  private readonly _status: BackupStatus;
  private readonly _timestamp: Date;
  private readonly _checksum?: string;

  private constructor(status: BackupStatus, timestamp: Date, checksum?: string) {
    this._status = status;
    this._timestamp = timestamp;
    this._checksum = checksum;
  }

  public get status(): BackupStatus {
    return this._status;
  }

  public get timestamp(): Date {
    return this._timestamp;
  }

  public get checksum(): string | undefined {
    return this._checksum;
  }

  public static create(status: string, checksum?: string): BackupState {
    const schema = z.enum(['INICIAL', 'EN_PROCESO', 'COMPLETADO', 'FALLIDO']);
    const validStatus = schema.parse(status);
    return new BackupState(validStatus, new Date(), checksum);
  }

  public isSuccess(): boolean {
    return this._status === 'COMPLETADO';
  }

  public equals(other: BackupState): boolean {
    if (!other) return false;
    return this._status === other.status && this._checksum === other.checksum;
  }
}
