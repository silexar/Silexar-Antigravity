export interface VoiceEngineConfig { model: string; language: string; }
class CortexVoiceEngineImpl { async synthesize(): Promise<Blob> { return new Blob(); } async transcribe(): Promise<string> { return ''; } }
export const CortexVoiceEngine = new CortexVoiceEngineImpl();
export default CortexVoiceEngine;
