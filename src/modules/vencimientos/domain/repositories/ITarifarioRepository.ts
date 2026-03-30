/**
 * REPOSITORIO: TARIFARIO - TIER 0 ENTERPRISE
 */
import { TarifarioPrograma } from '../entities/TarifarioPrograma.js'
import { TandaComercial } from '../entities/TandaComercial.js'
import { ConfiguracionTarifa } from '../entities/ConfiguracionTarifa.js'
import { SenalEspecial } from '../entities/SenalEspecial.js'

export interface ITarifarioRepository {
  // Tarifario por programa
  saveTarifario(tarifario: TarifarioPrograma): Promise<void>
  findTarifarioByPrograma(programaId: string): Promise<TarifarioPrograma | null>
  findTarifarioVigente(programaId: string): Promise<TarifarioPrograma | null>

  // Tandas comerciales
  saveTanda(tanda: TandaComercial): Promise<void>
  findTandasByEmisora(emisoraId: string): Promise<TandaComercial[]>

  // Configuración global de tarifas
  saveConfiguracion(config: ConfiguracionTarifa): Promise<void>
  findConfiguracionVigente(emisoraId: string): Promise<ConfiguracionTarifa | null>
  findAllConfiguraciones(emisoraId: string): Promise<ConfiguracionTarifa[]>

  // Señales especiales
  saveSenal(senal: SenalEspecial): Promise<void>
  findSenalesByEmisora(emisoraId: string): Promise<SenalEspecial[]>
  findSenalesDisponibles(emisoraId: string): Promise<SenalEspecial[]>
}
