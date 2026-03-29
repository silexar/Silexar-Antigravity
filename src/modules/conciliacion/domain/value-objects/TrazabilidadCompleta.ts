import { z } from "zod";

export interface TrazabilidadItem {
  timestamp: Date;
  accion: string;
  usuario: string;
  metadata?: Record<string, unknown>;
}

export class TrazabilidadCompleta {
  private readonly _eventos: TrazabilidadItem[];

  private constructor(eventos: TrazabilidadItem[]) {
    this._eventos = eventos;
  }

  public get eventos(): TrazabilidadItem[] {
    return [...this._eventos];
  }

  public static create(eventos: TrazabilidadItem[]): TrazabilidadCompleta {
    const schema = z.array(z.object({
      timestamp: z.date(),
      accion: z.string(),
      usuario: z.string(),
      metadata: z.record(z.string(), z.any()).optional()
    }));
    schema.parse(eventos);
    return new TrazabilidadCompleta(eventos);
  }

  public static empty(): TrazabilidadCompleta {
    return new TrazabilidadCompleta([]);
  }

  public addEvento(evento: TrazabilidadItem): TrazabilidadCompleta {
    return new TrazabilidadCompleta([...this._eventos, evento]);
  }
}
