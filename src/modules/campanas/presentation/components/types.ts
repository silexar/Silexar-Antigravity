
export interface AdTargetingProfileState {
    bateriaMinima?: number;
    wifiOnly?: boolean;
    excludePublicWifi?: boolean;
    estadoMovimiento?: 'ANY' | 'STATIONARY' | 'WALKING' | 'COMMUTING' | 'DRIVING';
    mood?: 'NEUTRAL' | 'HIGH_ENERGY' | 'FOCUS' | 'CHILL' | 'MELANCHOLIC';
    maxCognitiveLoad?: number;
    weatherTriggers?: string[];
}

export interface NeuromorphicProfileState {
    adaptivePacing?: boolean;
    softVoiceNight?: boolean;
    emphasizeCTA?: boolean;
    pitchShift?: number;
}

export interface CampanaWizardData {
    nombre: string;
    descripcion: string;
    tipo: 'FM' | 'DIGITAL' | 'HYBRID' | null;
    anuncianteId?: string;
    producto?: string; // New field for Naming Convention
    // Long-Term Logic
    startDate?: Date;
    endDate?: Date;
    competitorExclusion?: string[]; // e.g. ['Chevrolet', 'Hyundai']
    adTargetingProfile?: AdTargetingProfileState;
    neuromorphicProfile?: NeuromorphicProfileState;
    presupuestoEstimado?: number;
    alcanceEstimado?: number;
    // Gap Closure: Traffic Logic & Admin
    positionStrategy?: 'FIXED_START' | 'FIXED_END' | 'ROTATING' | 'JINGLE_LINKED';
    documents?: { name: string; type: string; date: string }[];
    auditLog?: { user: string; action: string; timestamp: string }[];
    // Automation Carrier
    preselectedBlocksIds?: string[];
}

export interface StepProps {
    data: CampanaWizardData;
    updateData: (newData: Partial<CampanaWizardData>) => void;
}
