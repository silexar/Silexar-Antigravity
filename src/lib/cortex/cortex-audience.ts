export interface AudienceSegment { id: string; name: string; size: number; }
class CortexAudienceImpl {
    async analyze(_campaignId: string): Promise<AudienceSegment[]> { return []; }
    async getSegments(): Promise<AudienceSegment[]> { return []; }
}
export const CortexAudience = new CortexAudienceImpl();
export default CortexAudience;