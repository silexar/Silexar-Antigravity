/**
 * 👑 AGGREGATE ROOT: RegistroEmision
 * 
 * La entidad principal que agrupa todo el proceso de auditoría de una campaña.
 * Controla la consistencia entre materiales, búsquedas y resultados.
 * 
 * @tier TIER_0_ENTERPRISE
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/observability';
import { EstadoVerificacion } from "../value-objects/EstadoVerificacion";
import { MaterialCreativo } from "./MaterialCreativo";
import { CoincidenciaEncontrada } from "./CoincidenciaEncontrada";
import { CertificacionBlockchain } from "../value-objects/CertificacionBlockchain";

export class RegistroEmision {
  private _coincidencias: CoincidenciaEncontrada[] = [];
  
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly clienteId: string,
    public readonly campanaId: string,
    public readonly materiales: MaterialCreativo[],
    private _estado: EstadoVerificacion,
    private _fechaCreacion: Date,
    private _blockchainCertificacion?: CertificacionBlockchain
  ) {}

  // FACTORY METHOD
  public static crearNueva(
    tenantId: string,
    clienteId: string,
    campanaId: string,
    materiales: MaterialCreativo[]
  ): RegistroEmision {
    if (materiales.length === 0) throw new Error("Se requiere al menos un material para auditar.");
    
    // Invariante de negocio: No se puede auditar sin cliente
    if (!clienteId) throw new Error("Cliente ID es obligatorio.");

    return new RegistroEmision(
      uuidv4(),
      tenantId,
      clienteId,
      campanaId,
      materiales,
      'pendiente',
      new Date()
    );
  }

  // DOMAIN USE CASES / BEHAVIORS

  public confirmarInicioProceso(): void {
    if (this._estado !== 'pendiente') throw new Error("Proceso ya iniciado anteriormente.");
    this._estado = 'analizando_audio';
  }

  public registrarCoincidencia(coincidencia: CoincidenciaEncontrada): void {
    // Validar que el material pertenezca a este registro
    const materialExiste = this.materiales.some(m => m.id === coincidencia.materialId);
    if (!materialExiste) {
      throw new Error("Intento de registrar coincidencia de material ajeno a esta campaña.");
    }
    this._coincidencias.push(coincidencia);
  }

  public sellarEnBlockchain(cert: CertificacionBlockchain): void {
    if (this._estado === 'pendiente') throw new Error("No se puede certificar una auditoría no iniciada.");
    
    this._blockchainCertificacion = cert;
    this._estado = this.tieneAlertas() ? 'completada_con_alertas' : 'completada_con_exito';
  }

  public finalizarSinExito(motivo: string): void {
    logger.error(`Auditoría fallida: ${motivo}`);
    this._estado = 'fallida_error_sistema';
  }

  // GETTERS (Encapsulation)
  
  public get estado(): EstadoVerificacion { return this._estado; }
  public get coincidencias(): CoincidenciaEncontrada[] { return [...this._coincidencias]; } // Copia defensiva
  public get certificacion(): CertificacionBlockchain | undefined { return this._blockchainCertificacion; }

  public calcularTasaExito(): number {
    const totalEsperado = this.materiales.length;
    // Lógica simplificada: 1 coincidencia por material, en realidad sería más complejo por horarios
    const materialesEncontrados = new Set(this._coincidencias.map(c => c.materialId)).size;
    return totalEsperado > 0 ? (materialesEncontrados / totalEsperado) * 100 : 0;
  }

  public tieneAlertas(): boolean {
    const tasa = this.calcularTasaExito();
    return tasa < 100; // Alerta si falta algún material
  }
}
