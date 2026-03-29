export interface AuditTrailEntry { id: string; action: string; timestamp: Date; }
export const auditTrailMiddleware = (_req: unknown, _res: unknown, next: () => void) => { next(); };
export default { auditTrailMiddleware };