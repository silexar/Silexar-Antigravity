export interface LinkedInConfig { accountId: string; accessToken: string; }
class LinkedInAdsConnectorImpl { async publish(): Promise<string> { return `li_${Date.now()}`; } }
export const LinkedInAdsConnector = new LinkedInAdsConnectorImpl();
export default LinkedInAdsConnector;