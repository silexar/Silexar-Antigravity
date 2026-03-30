export interface Attribution { channel: string; weight: number; }
class CortexAttributionImpl { async calculate(_campaignId: string): Promise<Attribution[]> { return []; } }
export const CortexAttribution = new CortexAttributionImpl();
export default CortexAttribution;