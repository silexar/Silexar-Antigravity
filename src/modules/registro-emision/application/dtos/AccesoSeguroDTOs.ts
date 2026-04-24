export interface CrearAccesoSeguroDTO {
  tenantId: string;
  verificacionId?: string;
  clipEvidenciaId?: string;
  tipoLink?: 'unico' | 'basket';
  itemsJson?: Array<{
    materialNombre: string;
    spxCode?: string;
    clipUrl?: string;
    imageUrl?: string;
    esDigital?: boolean;
    horaEmision?: string;
  }>;
  materialNombre?: string;
  spxCode?: string;
  clipUrl?: string;
  imageUrl?: string;
  esDigital?: boolean;
  clienteNombre?: string;
  clienteEmail: string;
  campanaNombre?: string;
  usosPermitidos?: number;
  creadoPorId?: string;
  creadoPorNombre?: string;
}

export interface ValidarAccesoDTO {
  codigoAcceso: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegistrarDescargaDTO {
  accesoId: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccesoSeguroResponse {
  id: string;
  linkUuid: string;
  codigoAcceso: string;
  estado: string;
  clienteEmail: string;
  clipUrl?: string;
  fechaExpiracion: Date;
  usosPermitidos: number;
  usosRealizados: number;
}
