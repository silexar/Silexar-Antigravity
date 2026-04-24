/**
 * ICertificateGeneratorService
 * Genera certificados de emisión (PDF o imagen) a partir de una verificación y clip.
 * Stub para futura integración con PDFKit / Puppeteer.
 */

export interface CertificateData {
  numeroCertificado: string;
  fechaEmision: Date;
  anuncianteNombre?: string;
  campanaNombre?: string;
  materialNombre?: string;
  emisoraNombre?: string;
  horaDetectada: string;
  duracionSegundos: number;
  hashSha256: string;
  fechaVerificacion: Date;
  verificadoPor?: string;
}

export interface CertificateResult {
  urlCertificado: string;
  numeroCertificado: string;
  exito: boolean;
  error?: string;
}

export interface ICertificateGeneratorService {
  generar(data: CertificateData): Promise<CertificateResult>;
}
