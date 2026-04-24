export interface CrearRegistroAireDTO {
  tenantId: string;
  emisoraId: string;
  fechaEmision: Date;
  urlArchivo: string;
  duracionSegundos: number;
  formato: string;
  tamanioBytes?: number;
  hashSha256?: string;
  metadata?: Record<string, unknown>;
  creadoPorId?: string;
}

export interface RegistroAireResponse {
  id: string;
  tenantId: string;
  emisoraId: string;
  fechaEmision: Date;
  urlArchivo: string;
  duracionSegundos: number;
  formato: string;
  estado: string;
  hashSha256?: string;
  creadoEn: Date;
}
