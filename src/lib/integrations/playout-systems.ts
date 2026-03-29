export interface PlayoutSystem { id: string; status: 'ONLINE' | 'OFFLINE'; }
class PlayoutSystemsImpl { async list(): Promise<PlayoutSystem[]> { return []; } async connect(): Promise<boolean> { return true; } }
export const PlayoutSystems = new PlayoutSystemsImpl();
export default PlayoutSystems;