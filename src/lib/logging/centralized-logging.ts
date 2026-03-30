export interface LogEntry { level: string; message: string; timestamp: Date; }
export const log = (level: string, message: string): LogEntry => ({ level, message, timestamp: new Date() });
export const logInfo = (message: string) => log('INFO', message);
export const logError = (message: string) => log('ERROR', message);
export default { log, logInfo, logError };