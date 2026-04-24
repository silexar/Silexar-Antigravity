export interface CrearClipEvidenciaDTO {
  tenantId: string;
  verificacionId: string;
  deteccionId?: string;
  urlArchivo: string;
  duracionSegundos: number;
  formato: string;
  horaInicioClip: string;
  horaFinClip: string;
  hashSha256: string;
  transcripcion?: string;
  fechaExpiracion: Date;
  creadoPorId?: string;
}

export interface AprobarClipDTO {
  clipId: string;
  tenantId: string;
  aprobadoPorId: string;
}

export interface ClipEvidenciaResponse {
  id: string;
  tenantId: string;
  verificacionId: string;
  urlArchivo: string;
  duracionSegundos: number;
  horaInicioClip: string;
  horaFinClip: string;
  hashSha256: string;
  aprobado: boolean;
  fechaExpiracion: Date;
  creadoEn: Date;
}
