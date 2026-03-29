import { CampanaWizardData } from '../components/types';

export interface CommercialPackage {
    id: string;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    // The "Magic": Pre-defined Technical Specs
    specs: {
        tipo: 'FM' | 'DIGITAL' | 'HYBRID';
        positionStrategy: 'FIXED_START' | 'FIXED_END' | 'ROTATING' | 'JINGLE_LINKED';
        defaultBlocks: string[]; // IDs of blocks to pre-select
        presupuestoBase: number;
        alcanceProyectado: number;
    }
}

export const COMMERCIAL_PACKAGES: CommercialPackage[] = [
    {
        id: 'pack_mesa_central',
        name: 'Auspicio Mesa Central',
        description: 'Dominio total del Prime Informativo (07:00 - 09:30). Incluye menciones en vivo.',
        icon: 'Mic2',
        specs: {
            tipo: 'FM',
            positionStrategy: 'FIXED_START', // Siempre abre tanda
            defaultBlocks: [
                // Lunes a Viernes, Bloques 07:00 a 09:00
                'Lunes-07:00 - 08:00', 'Lunes-08:00 - 09:00',
                'Martes-07:00 - 08:00', 'Martes-08:00 - 09:00',
                'Miércoles-07:00 - 08:00', 'Miércoles-08:00 - 09:00',
                'Jueves-07:00 - 08:00', 'Jueves-08:00 - 09:00',
                'Viernes-07:00 - 08:00', 'Viernes-08:00 - 09:00',
            ],
            presupuestoBase: 4500000,
            alcanceProyectado: 150000
        }
    },
    {
        id: 'pack_rotativo_drive',
        name: 'Rotativo Drive Time',
        description: 'Alta frecuencia en horarios de retorno a casa (18:00 - 20:00).',
        icon: 'Car',
        specs: {
            tipo: 'FM',
            positionStrategy: 'ROTATING',
            defaultBlocks: [
                // Bloques de tarde
                'Lunes-18:00 - 19:00', 'Lunes-19:00 - 20:00',
                'Miércoles-18:00 - 19:00', 'Miércoles-19:00 - 20:00',
                'Viernes-18:00 - 19:00', 'Viernes-19:00 - 20:00'
            ],
            presupuestoBase: 2800000,
            alcanceProyectado: 95000
        }
    },
    {
        id: 'pack_lanzamiento_360',
        name: 'Lanzamiento Marca 360°',
        description: 'Impacto masivo: Aire + Digital + Neuro-Sync.',
        icon: 'Rocket',
        specs: {
            tipo: 'HYBRID',
            positionStrategy: 'JINGLE_LINKED',
            defaultBlocks: [], // Se define dinámicamente
            presupuestoBase: 8000000,
            alcanceProyectado: 500000
        }
    }
];

export class CommercialPackageService {
    static getPackages(): CommercialPackage[] {
        return COMMERCIAL_PACKAGES;
    }

    static applyPackage(pkgId: string, currentData: CampanaWizardData): CampanaWizardData {
        const pkg = COMMERCIAL_PACKAGES.find(p => p.id === pkgId);
        if (!pkg) return currentData;

        return {
            ...currentData,
            tipo: pkg.specs.tipo,
            presupuestoEstimado: pkg.specs.presupuestoBase,
            alcanceEstimado: pkg.specs.alcanceProyectado,
            positionStrategy: pkg.specs.positionStrategy,
            // Pre-fill complex grid data
            // In a real app, this would merge with existing data
            preselectedBlocksIds: pkg.specs.defaultBlocks 
        };
    }
}
