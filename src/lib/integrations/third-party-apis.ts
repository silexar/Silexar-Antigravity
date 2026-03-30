export interface ThirdPartyAPI { name: string; endpoint: string; }
export const THIRD_PARTY_APIS: ThirdPartyAPI[] = [];
export const callAPI = async (_apiName: string, _data: unknown): Promise<unknown> => null;
export default { THIRD_PARTY_APIS, callAPI };