export interface HostProfile {
  id: string;
  name: string;
  programName: string;
  station: string;
  voiceId: string; // ID of the cloned model
  provider: 'ELEVENLABS' | 'OPENAI' | 'GEMINI';
  basePace: number; // Words Per Minute (e.g., 140)
  intonationStyle: 'energetic' | 'calm' | 'authoritative';
}

export class HostVoiceManager {
  
  private static hosts: HostProfile[] = [
    {
      id: 'host-julio-cesar',
      name: 'Julio César Rodríguez',
      programName: 'La Mañana',
      station: 'Radio BioBio',
      voiceId: 'cloned-jc-rodriguez-v1',
      provider: 'ELEVENLABS',
      basePace: 155, // Fast talker
      intonationStyle: 'energetic'
    },
    {
      id: 'host-rafa-araneda',
      name: 'Rafael Araneda',
      programName: 'Cuéntamelo Todo',
      station: 'Radio Pudahuel',
      voiceId: 'cloned-rafa-araneda-v2',
      provider: 'ELEVENLABS',
      basePace: 135, // More paused, emotional
      intonationStyle: 'calm'
    },
    {
      id: 'host-generic-news',
      name: 'Conductor Noticiero',
      programName: 'Informativo Central',
      station: 'Todas',
      voiceId: 'gemini-news-anchor',
      provider: 'GEMINI',
      basePace: 145,
      intonationStyle: 'authoritative'
    }
  ];

  static getHostsByStation(station: string): HostProfile[] {
    if (station === 'Todas') return this.hosts;
    return this.hosts.filter(h => h.station === station || h.station === 'Todas');
  }

  static getHostById(hostId: string): HostProfile | undefined {
    return this.hosts.find(h => h.id === hostId);
  }
}
