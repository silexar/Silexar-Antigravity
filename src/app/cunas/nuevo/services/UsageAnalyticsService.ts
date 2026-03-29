export interface UsageMetrics {
  totalEmissions: number;
  periodActiveDays: number;
  dailyAverage: number;
  stations: { name: string; percentage: number; count: number }[];
  interactions: {
    usersAccessed: number;
    downloads: number;
    modifications: number;
    distributions: number;
  };
  performance: {
    estimatedReach: number; // in millions
    frequency: number;
    grp: number;
    cpm: number;
  };
}

export class UsageAnalyticsService {
  /**
   * Obtiene métricas simuladas de uso y performance
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getMetrics(_: string): Promise<UsageMetrics> {
    // Mock simulation
    return {
      totalEmissions: 156,
      periodActiveDays: 45,
      dailyAverage: 3.5,
      stations: [
        { name: 'Radio Corazón', percentage: 72, count: 112 },
        { name: 'FM Dos', percentage: 18, count: 28 },
        { name: 'La Clave', percentage: 10, count: 16 }
      ],
      interactions: {
        usersAccessed: 8,
        downloads: 23,
        modifications: 2,
        distributions: 5
      },
      performance: {
        estimatedReach: 2.3, // M
        frequency: 8.5,
        grp: 145,
        cpm: 2850
      }
    };
  }
}
