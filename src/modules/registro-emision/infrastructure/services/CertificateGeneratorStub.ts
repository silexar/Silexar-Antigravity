import { randomUUID } from 'crypto';
import type { ICertificateGeneratorService, CertificateData, CertificateResult } from '../../application/services/ICertificateGeneratorService';

/**
 * CertificateGeneratorStub
 * Stub de generación de certificados PDF.
 * Simula creación de un archivo PDF en disco/cloud.
 */
export class CertificateGeneratorStub implements ICertificateGeneratorService {
  async generar(data: CertificateData): Promise<CertificateResult> {
    await this._delay(150 + Math.random() * 200);

    const certId = randomUUID();
    return {
      urlCertificado: `/uploads/certificados/${certId}.pdf`,
      numeroCertificado: data.numeroCertificado,
      exito: true,
    };
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
