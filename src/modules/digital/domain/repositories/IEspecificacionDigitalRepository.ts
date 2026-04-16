import { EspecificacionDigital } from '../entities/EspecificacionDigital';

export interface IEspecificacionDigitalRepository {
  findById(id: string, tenantId: string): Promise<EspecificacionDigital | null>;
  findByCampanaId(campanaId: string, tenantId: string): Promise<EspecificacionDigital | null>;
  findByContratoId(contratoId: string, tenantId: string): Promise<EspecificacionDigital | null>;
  save(especificacion: EspecificacionDigital): Promise<void>;
  update(especificacion: EspecificacionDigital): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
