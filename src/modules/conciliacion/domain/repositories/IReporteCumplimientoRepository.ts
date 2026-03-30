import { ReporteCumplimiento } from "../entities/ReporteCumplimiento";

export interface IReporteCumplimientoRepository {
  save(reporte: ReporteCumplimiento): Promise<void>;
  findById(id: string): Promise<ReporteCumplimiento | null>;
  findByEmisoraAndFecha(emisoraId: string, fecha: Date): Promise<ReporteCumplimiento[]>;
}
