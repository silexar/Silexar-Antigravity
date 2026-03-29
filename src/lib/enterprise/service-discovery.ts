/**
 * 🔍 SILEXAR PULSE QUANTUM - SERVICE DISCOVERY TIER 0
 * 
 * Sistema de descubrimiento de servicios enterprise con registro automático
 * Health monitoring, load balancing y failover automático
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE SERVICE DISCOVERY
 */

import { qualityLogger } from '../quality/quality-logger';

// 🎯 Service Instance
interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  healthCheckUrl: string;
  metadata: Record<string, unknown>;
  tags: string[];
  weight: number;
  status: 'HEALTHY' | 'UNHEALTHY' | 'STARTING' | 'STOPPING';
  registeredAt: Date;
  lastHealthCheck: Date;
  healthCheckInterval: number;
  timeout: number;
}

// 📊 Service Registry
interface ServiceRegistry {
  services: Map<string, ServiceInstance[]>;
  healthChecks: Map<string, NodeJS.Timeout>;
  metrics: DiscoveryMetrics;
  watchers: Map<string, ServiceWatcher[]>;
}

// 📈 Discovery Metrics
interface DiscoveryMetrics {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  totalInstances: number;
  healthyInstances: number;
  unhealthyInstances: number;
  averageResponseTime: number;
  registrationRate: number;
  deregistrationRate: number;
  timestamp: Date;
}

// 👀 Service Watcher
interface ServiceWatcher {
  id: string;
  serviceName: string;
  callback: (instances: ServiceInstance[]) => void;
  filter?: (instance: ServiceInstance) => boolean;
}

// 🚨 Discovery Event
interface DiscoveryEvent {
  type: 'REGISTER' | 'DEREGISTER' | 'HEALTH_CHANGE' | 'UPDATE';
  service: string;
  instance: ServiceInstance;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ⚖️ Load Balancing Strategy
type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'weighted' | 'random' | 'ip-hash';

/**
 * 🔍 Enterprise Service Discovery Class
 */
export class EnterpriseServiceDiscovery {
  private discoveryId: string;
  private registry: ServiceRegistry;
  private events: DiscoveryEvent[];
  private loadBalancingStrategies: Map<string, LoadBalancingStrategy>;
  private roundRobinCounters: Map<string, number>;
  private connectionCounts: Map<string, number>;
  private isRunning: boolean;

  constructor() {
    this.discoveryId = `discovery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.events = [];
    this.loadBalancingStrategies = new Map();
    this.roundRobinCounters = new Map();
    this.connectionCounts = new Map();
    this.isRunning = false;

    this.registry = {
      services: new Map(),
      healthChecks: new Map(),
      watchers: new Map(),
      metrics: {
        totalServices: 0,
        healthyServices: 0,
        unhealthyServices: 0,
        totalInstances: 0,
        healthyInstances: 0,
        unhealthyInstances: 0,
        averageResponseTime: 0,
        registrationRate: 0,
        deregistrationRate: 0,
        timestamp: new Date()
      }
    };

    this.startMetricsCollection();

    qualityLogger.info('Enterprise Service Discovery initialized', 'SERVICE_DISCOVERY', {
      discoveryId: this.discoveryId
    });
  }

  /**
   * 🚀 Start Service Discovery
   */
  async start(): Promise<void> {
    try {
      this.isRunning = true;
      
      qualityLogger.info('Service Discovery starting', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId
      });

      // Start background tasks
      this.startCleanupTask();
      this.startEventProcessing();

      qualityLogger.info('Service Discovery started successfully', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId
      });

    } catch (error) {
      qualityLogger.error('Failed to start Service Discovery', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 📝 Register Service Instance
   * @param instance - Service instance to register
   */
  async registerService(instance: ServiceInstance): Promise<void> {
    try {
      const serviceName = instance.name;
      
      if (!this.registry.services.has(serviceName)) {
        this.registry.services.set(serviceName, []);
        this.loadBalancingStrategies.set(serviceName, 'round-robin');
        this.roundRobinCounters.set(serviceName, 0);
      }

      const instances = this.registry.services.get(serviceName)!;
      
      // Check if instance already exists
      const existingIndex = instances.findIndex(i => i.id === instance.id);
      if (existingIndex >= 0) {
        instances[existingIndex] = instance;
      } else {
        instances.push(instance);
      }

      // Start health checking
      this.startHealthCheck(instance);

      // Update metrics
      this.updateMetrics();

      // Emit event
      this.emitEvent('REGISTER', serviceName, instance);

      // Notify watchers
      this.notifyWatchers(serviceName);

      qualityLogger.info('Service instance registered', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        serviceName,
        instanceId: instance.id,
        host: instance.host,
        port: instance.port
      });

    } catch (error) {
      qualityLogger.error('Failed to register service instance', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        instanceId: instance.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 🗑️ Deregister Service Instance
   * @param serviceName - Service name
   * @param instanceId - Instance ID
   */
  async deregisterService(serviceName: string, instanceId: string): Promise<void> {
    try {
      const instances = this.registry.services.get(serviceName);
      if (!instances) return;

      const instanceIndex = instances.findIndex(i => i.id === instanceId);
      if (instanceIndex === -1) return;

      const instance = instances[instanceIndex];
      
      // Stop health checking
      this.stopHealthCheck(instanceId);

      // Remove instance
      instances.splice(instanceIndex, 1);

      // Clean up empty service
      if (instances.length === 0) {
        this.registry.services.delete(serviceName);
        this.loadBalancingStrategies.delete(serviceName);
        this.roundRobinCounters.delete(serviceName);
      }

      // Update metrics
      this.updateMetrics();

      // Emit event
      this.emitEvent('DEREGISTER', serviceName, instance);

      // Notify watchers
      this.notifyWatchers(serviceName);

      qualityLogger.info('Service instance deregistered', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        serviceName,
        instanceId
      });

    } catch (error) {
      qualityLogger.error('Failed to deregister service instance', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        serviceName,
        instanceId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 🔍 Discover Service Instances
   * @param serviceName - Service name
   * @param healthyOnly - Return only healthy instances
   * @returns Service instances
   */
  discoverService(serviceName: string, healthyOnly: boolean = true): ServiceInstance[] {
    const instances = this.registry.services.get(serviceName) || [];
    
    if (healthyOnly) {
      return instances.filter(instance => instance.status === 'HEALTHY');
    }
    
    return [...instances];
  }

  /**
   * ⚖️ Get Load Balanced Instance
   * @param serviceName - Service name
   * @param strategy - Load balancing strategy
   * @param clientInfo - Client information for consistent hashing
   * @returns Selected service instance
   */
  getLoadBalancedInstance(
    serviceName: string, 
    strategy?: LoadBalancingStrategy,
    clientInfo?: { ip?: string; sessionId?: string }
  ): ServiceInstance | null {
    const instances = this.discoverService(serviceName, true);
    if (instances.length === 0) return null;

    const selectedStrategy = strategy || this.loadBalancingStrategies.get(serviceName) || 'round-robin';

    switch (selectedStrategy) {
      case 'round-robin':
        return this.roundRobinSelection(serviceName, instances);
      
      case 'least-connections':
        return this.leastConnectionsSelection(instances);
      
      case 'weighted':
        return this.weightedSelection(instances);
      
      case 'random':
        return this.randomSelection(instances);
      
      case 'ip-hash':
        return this.ipHashSelection(instances, clientInfo?.ip || '');
      
      default:
        return this.roundRobinSelection(serviceName, instances);
    }
  }

  /**
   * 🔄 Round Robin Selection
   * @param serviceName - Service name
   * @param instances - Available instances
   * @returns Selected instance
   */
  private roundRobinSelection(serviceName: string, instances: ServiceInstance[]): ServiceInstance {
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const selectedInstance = instances[counter % instances.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return selectedInstance;
  }

  /**
   * 📊 Least Connections Selection
   * @param instances - Available instances
   * @returns Selected instance
   */
  private leastConnectionsSelection(instances: ServiceInstance[]): ServiceInstance {
    let minConnections = Infinity;
    let selectedInstance = instances[0];

    for (const instance of instances) {
      const connections = this.connectionCounts.get(instance.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedInstance = instance;
      }
    }

    return selectedInstance;
  }

  /**
   * ⚖️ Weighted Selection
   * @param instances - Available instances
   * @returns Selected instance
   */
  private weightedSelection(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.weight;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[instances.length - 1];
  }

  /**
   * 🎲 Random Selection
   * @param instances - Available instances
   * @returns Selected instance
   */
  private randomSelection(instances: ServiceInstance[]): ServiceInstance {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }

  /**
   * 🔗 IP Hash Selection
   * @param instances - Available instances
   * @param clientIP - Client IP address
   * @returns Selected instance
   */
  private ipHashSelection(instances: ServiceInstance[], clientIP: string): ServiceInstance {
    // Simple hash function for consistent selection
    let hash = 0;
    for (let i = 0; i < clientIP.length; i++) {
      const char = clientIP.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const index = Math.abs(hash) % instances.length;
    return instances[index];
  }

  /**
   * 👀 Watch Service Changes
   * @param serviceName - Service name to watch
   * @param callback - Callback function
   * @param filter - Optional filter function
   * @returns Watcher ID
   */
  watchService(
    serviceName: string, 
    callback: (instances: ServiceInstance[]) => void,
    filter?: (instance: ServiceInstance) => boolean
  ): string {
    const watcherId = `watcher_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const watcher: ServiceWatcher = {
      id: watcherId,
      serviceName,
      callback,
      filter
    };

    if (!this.registry.watchers.has(serviceName)) {
      this.registry.watchers.set(serviceName, []);
    }

    this.registry.watchers.get(serviceName)!.push(watcher);

    // Send initial notification
    const instances = this.discoverService(serviceName, false);
    const filteredInstances = filter ? instances.filter(filter) : instances;
    callback(filteredInstances);

    qualityLogger.info('Service watcher registered', 'SERVICE_DISCOVERY', {
      discoveryId: this.discoveryId,
      watcherId,
      serviceName
    });

    return watcherId;
  }

  /**
   * 🚫 Unwatch Service
   * @param serviceName - Service name
   * @param watcherId - Watcher ID
   */
  unwatchService(serviceName: string, watcherId: string): void {
    const watchers = this.registry.watchers.get(serviceName);
    if (!watchers) return;

    const watcherIndex = watchers.findIndex(w => w.id === watcherId);
    if (watcherIndex >= 0) {
      watchers.splice(watcherIndex, 1);
      
      if (watchers.length === 0) {
        this.registry.watchers.delete(serviceName);
      }

      qualityLogger.info('Service watcher unregistered', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        watcherId,
        serviceName
      });
    }
  }

  /**
   * 🏥 Start Health Check
   * @param instance - Service instance
   */
  private startHealthCheck(instance: ServiceInstance): void {
    // Stop existing health check if any
    this.stopHealthCheck(instance.id);

    const healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck(instance);
    }, instance.healthCheckInterval);

    this.registry.healthChecks.set(instance.id, healthCheckInterval);
  }

  /**
   * 🛑 Stop Health Check
   * @param instanceId - Instance ID
   */
  private stopHealthCheck(instanceId: string): void {
    const healthCheck = this.registry.healthChecks.get(instanceId);
    if (healthCheck) {
      clearInterval(healthCheck);
      this.registry.healthChecks.delete(instanceId);
    }
  }

  /**
   * 🏥 Perform Health Check
   * @param instance - Service instance
   */
  private async performHealthCheck(instance: ServiceInstance): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate health check (in real implementation, make HTTP request)
      const isHealthy = await this.simulateHealthCheck(instance);
      const responseTime = Date.now() - startTime;
      
      const previousStatus = instance.status;
      instance.status = isHealthy ? 'HEALTHY' : 'UNHEALTHY';
      instance.lastHealthCheck = new Date();

      // Update average response time
      this.updateAverageResponseTime(responseTime);

      // Emit event if status changed
      if (previousStatus !== instance.status) {
        this.emitEvent('HEALTH_CHANGE', instance.name, instance);
        this.notifyWatchers(instance.name);
      }

      // Update metrics
      this.updateMetrics();

    } catch (error) {
      instance.status = 'UNHEALTHY';
      instance.lastHealthCheck = new Date();
      
      qualityLogger.warn('Health check failed', 'SERVICE_DISCOVERY', {
        discoveryId: this.discoveryId,
        instanceId: instance.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 🎭 Simulate Health Check
   * @param instance - Service instance
   * @returns Health status
   */
  private async simulateHealthCheck(instance: ServiceInstance): Promise<boolean> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    // Simulate occasional health check failures
    return Math.random() > 0.1; // 90% success rate
  }

  /**
   * 📊 Update Average Response Time
   * @param responseTime - Response time in ms
   */
  private updateAverageResponseTime(responseTime: number): void {
    const currentAverage = this.registry.metrics.averageResponseTime;
    const totalChecks = this.registry.metrics.totalInstances;
    
    if (totalChecks === 0) {
      this.registry.metrics.averageResponseTime = responseTime;
    } else {
      this.registry.metrics.averageResponseTime = 
        ((currentAverage * totalChecks) + responseTime) / (totalChecks + 1);
    }
  }

  /**
   * 📊 Update Metrics
   */
  private updateMetrics(): void {
    let totalServices = 0;
    let healthyServices = 0;
    let totalInstances = 0;
    let healthyInstances = 0;

    for (const [serviceName, instances] of this.registry.services) {
      totalServices++;
      totalInstances += instances.length;
      
      const healthyCount = instances.filter(i => i.status === 'HEALTHY').length;
      healthyInstances += healthyCount;
      
      if (healthyCount > 0) {
        healthyServices++;
      }
    }

    this.registry.metrics = {
      ...this.registry.metrics,
      totalServices,
      healthyServices,
      unhealthyServices: totalServices - healthyServices,
      totalInstances,
      healthyInstances,
      unhealthyInstances: totalInstances - healthyInstances,
      timestamp: new Date()
    };
  }

  /**
   * 📡 Emit Event
   * @param type - Event type
   * @param service - Service name
   * @param instance - Service instance
   */
  private emitEvent(type: DiscoveryEvent['type'], service: string, instance: ServiceInstance): void {
    const event: DiscoveryEvent = {
      type,
      service,
      instance,
      timestamp: new Date()
    };

    this.events.push(event);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    qualityLogger.info('Discovery event emitted', 'SERVICE_DISCOVERY', {
      discoveryId: this.discoveryId,
      eventType: type,
      service,
      instanceId: instance.id
    });
  }

  /**
   * 👀 Notify Watchers
   * @param serviceName - Service name
   */
  private notifyWatchers(serviceName: string): void {
    const watchers = this.registry.watchers.get(serviceName);
    if (!watchers) return;

    const instances = this.discoverService(serviceName, false);

    for (const watcher of watchers) {
      try {
        const filteredInstances = watcher.filter ? instances.filter(watcher.filter) : instances;
        watcher.callback(filteredInstances);
      } catch (error) {
        qualityLogger.error('Watcher notification failed', 'SERVICE_DISCOVERY', {
          discoveryId: this.discoveryId,
          watcherId: watcher.id,
          serviceName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * 📊 Start Metrics Collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // Update every 30 seconds
  }

  /**
   * 🧹 Start Cleanup Task
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.performCleanup();
    }, 300000); // Cleanup every 5 minutes
  }

  /**
   * 🧹 Perform Cleanup
   */
  private performCleanup(): void {
    const now = Date.now();
    const staleThreshold = 300000; // 5 minutes

    for (const [serviceName, instances] of this.registry.services) {
      const staleInstances = instances.filter(instance => 
        now - instance.lastHealthCheck.getTime() > staleThreshold
      );

      for (const staleInstance of staleInstances) {
        this.deregisterService(serviceName, staleInstance.id);
      }
    }
  }

  /**
   * 🔄 Start Event Processing
   */
  private startEventProcessing(): void {
    // Event processing can be extended for external integrations
    setInterval(() => {
      // Process events for external systems
    }, 10000); // Process every 10 seconds
  }

  /**
   * 📊 Get Discovery Metrics
   * @returns Current discovery metrics
   */
  getMetrics(): DiscoveryMetrics {
    return { ...this.registry.metrics };
  }

  /**
   * 📋 Get All Services
   * @returns All registered services
   */
  getAllServices(): Record<string, ServiceInstance[]> {
    const result: Record<string, ServiceInstance[]> = {};
    
    for (const [serviceName, instances] of this.registry.services) {
      result[serviceName] = [...instances];
    }
    
    return result;
  }

  /**
   * 📜 Get Recent Events
   * @param limit - Number of events to return
   * @returns Recent discovery events
   */
  getRecentEvents(limit: number = 100): DiscoveryEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * 🛑 Stop Service Discovery
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Stop all health checks
    for (const healthCheck of this.registry.healthChecks.values()) {
      clearInterval(healthCheck);
    }
    
    this.registry.healthChecks.clear();
    
    qualityLogger.info('Service Discovery stopped', 'SERVICE_DISCOVERY', {
      discoveryId: this.discoveryId
    });
  }
}

// 🛡️ Global Service Discovery Instance
export const enterpriseServiceDiscovery = new EnterpriseServiceDiscovery();

// 🔧 Utility Functions
export function createServiceDiscovery(): EnterpriseServiceDiscovery {
  return new EnterpriseServiceDiscovery();
}

export async function registerService(instance: ServiceInstance): Promise<void> {
  return enterpriseServiceDiscovery.registerService(instance);
}

export function discoverService(serviceName: string, healthyOnly?: boolean): ServiceInstance[] {
  return enterpriseServiceDiscovery.discoverService(serviceName, healthyOnly);
}

export function getLoadBalancedInstance(
  serviceName: string, 
  strategy?: LoadBalancingStrategy,
  clientInfo?: { ip?: string; sessionId?: string }
): ServiceInstance | null {
  return enterpriseServiceDiscovery.getLoadBalancedInstance(serviceName, strategy, clientInfo);
}

export default EnterpriseServiceDiscovery;