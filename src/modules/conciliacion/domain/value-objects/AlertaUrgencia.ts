import { z } from "zod";

export type AlertaUrgenciaValue = 'INFORMATIVA' | 'IMPORTANTE' | 'CRITICA' | 'BLOQUEANTE';

export class AlertaUrgencia {
  private readonly _value: AlertaUrgenciaValue;

  private constructor(value: AlertaUrgenciaValue) {
    this._value = value;
  }

  public get value(): AlertaUrgenciaValue {
    return this._value;
  }

  public static create(value: string): AlertaUrgencia {
    const schema = z.enum(['INFORMATIVA', 'IMPORTANTE', 'CRITICA', 'BLOQUEANTE']);
    const validValue = schema.parse(value);
    return new AlertaUrgencia(validValue);
  }

  public isHighPriority(): boolean {
    return this._value === 'CRITICA' || this._value === 'BLOQUEANTE';
  }

  public equals(other: AlertaUrgencia): boolean {
    if (!other) return false;
    return this._value === other.value;
  }
}
