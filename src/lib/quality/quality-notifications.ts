export interface QualityNotification { type: 'PASS' | 'FAIL'; metric: string; }
export const sendQualityNotification = async (): Promise<boolean> => true;
export default { sendQualityNotification };