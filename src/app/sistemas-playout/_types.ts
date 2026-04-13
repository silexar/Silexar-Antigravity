export interface PlayoutSystem {
  id: string;
  name: string;
  type: 'dalet' | 'wideorbit' | 'sara' | 'rcs' | 'marketron' | 'nexgen' | 'radiotraffic';
  version: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSync: string;
  stationId: string;
  connectionConfig: {
    host: string;
    port: number;
    protocol: 'ftp' | 'http' | 'tcp' | 'api';
    credentials: {
      username: string;
      password: string;
    };
  };
  features: {
    import: boolean;
    export: boolean;
    monitoring: boolean;
    realtime: boolean;
  };
  metrics: {
    uptime: number;
    latency: number;
    successRate: number;
    lastError?: string;
  };
}

export interface SyncJob {
  id: string;
  systemId: string;
  type: 'import' | 'export' | 'sync';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  endTime?: string;
  itemsProcessed: number;
  totalItems: number;
  errors: string[];
}

export interface SystemLog {
  id: string;
  systemId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, unknown>;
}

export interface SystemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Station {
  id: string;
  name: string;
  type: string;
}
