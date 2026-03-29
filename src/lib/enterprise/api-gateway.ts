/**
 * 🚀 SILEXAR PULSE QUANTUM - API GATEWAY TIER 0
 * 
 * Gateway centralizado enterprise con rate limiting, authentication y routing inteligente
 * Arquitectura de microservicios con load balancing y circuit breaker
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - ENTERPRISE API GATEWAY
 */

import { qualityLogger } from '../quality/quality-logger';

// 🔧 Gateway Configuration
interface GatewayConfig {
  port: number;
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  authentication: {
    enabled: boolean;
    jwtSecret: string;
    tokenExpiry: number;
  };
  routing: {
    services: ServiceRoute[];
    loadBalancing: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
    healthCheckInterval: number;
  };
  security: {
    cors: boolean;
    helmet: boolean;
    rateLimitByIP: boolean;
    ddosProtection: boolean;
  };
}

// 🎯 Service Route Configuration
interface ServiceRoute {
  id: string;
  name: string;
  path: string;
  target: string;
  weight: number;
  healthCheck: string;
  timeout: number;
  retries: number;
  circuitBreaker: {
    enabled: boolean;
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
}

// 📊 Gateway Metrics
interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeConnections: number;
  rateLimitedRequests: number;
  circuitBreakerTrips: number;
  timestamp: Date;
}

// 🚨 Gateway Alert
interface GatewayAlert {
  id: string;
  type: 'RATE_LIMIT' | 'SERVICE_DOWN' | 'HIGH_LATENCY' | 'CIRCUIT_BREAKER' | 'SECURITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  service?: string;
  timestamp: Date;
  resolved: boolean;
}

// 🔄 Request Context
interface RequestContext {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: Record<string, unknown>;
  clientIP: string;
  userAgent: string;
  timestamp: Date;
  authenticated: boolean;
  userId?: string;
}

// 📈 Response Context
interface ResponseContext {
  statusCode: number;
  headers: Record<string, string>;
  body?: Record<string, unknown>;
  responseTime: number;
  service: string;
  cached: boolean;
  timestamp: Date;
}

/**
 * 🚀 Enterprise API Gateway Class
 */
export class EnterpriseAPIGateway {
  private gatewayId: string;
  private config: GatewayConfig;
  private services: Map<string, ServiceRoute>;
  private metrics: GatewayMetrics;
  private alerts: GatewayAlert[];
  private rateLimitStore: Map<string, { count: number; resetTime: number }>;
  private circuitBreakers: Map<string, { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; failures: number; lastFailure: Date }>;
  private isRunning: boolean;

  constructor(config: GatewayConfig) {
    this.gatewayId = `gateway_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.config = config;
    this.services = new Map();
    this.rateLimitStore = new Map();
    this.circuitBreakers = new Map();
    this.alerts = [];
    this.isRunning = false;

    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      activeConnections: 0,
      rateLimitedRequests: 0,
      circuitBreakerTrips: 0,
      timestamp: new Date()
    };

    this.initializeServices();
    this.startHealthChecks();

    qualityLogger.info('Enterprise API Gateway initialized', 'API_GATEWAY', {
      gatewayId: this.gatewayId,
      servicesCount: this.services.size
    });
  }

  /**
   * 🚀 Start API Gateway
   */
  async start(): Promise<void> {
    try {
      this.isRunning = true;
      
      qualityLogger.info('API Gateway starting', 'API_GATEWAY', {
        gatewayId: this.gatewayId,
        port: this.config.port
      });

      // Start metrics collection
      this.startMetricsCollection();

      // Start security monitoring
      this.startSecurityMonitoring();

      qualityLogger.info('API Gateway started successfully', 'API_GATEWAY', {
        gatewayId: this.gatewayId
      });

    } catch (error) {
      qualityLogger.error('Failed to start API Gateway', 'API_GATEWAY', {
        gatewayId: this.gatewayId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 🔄 Process Request
   * @param request - Incoming request
   * @returns Response
   */
  async processRequest(request: RequestContext): Promise<ResponseContext> {
    const startTime = Date.now();
    
    try {
      // Update metrics
      this.metrics.totalRequests++;
      this.metrics.activeConnections++;

      // Rate limiting check
      if (!this.checkRateLimit(request.clientIP)) {
        this.metrics.rateLimitedRequests++;
        this.createAlert('RATE_LIMIT', 'HIGH', `Rate limit exceeded for IP: ${request.clientIP}`);
        
        return {
          statusCode: 429,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Rate limit exceeded' },
          responseTime: Date.now() - startTime,
          service: 'gateway',
          cached: false,
          timestamp: new Date()
        };
      }

      // Authentication check
      if (this.config.authentication.enabled && !request.authenticated) {
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Authentication required' },
          responseTime: Date.now() - startTime,
          service: 'gateway',
          cached: false,
          timestamp: new Date()
        };
      }

      // Route to service
      const service = this.findMatchingService(request.path);
      if (!service) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Service not found' },
          responseTime: Date.now() - startTime,
          service: 'gateway',
          cached: false,
          timestamp: new Date()
        };
      }

      // Circuit breaker check
      if (!this.checkCircuitBreaker(service.id)) {
        this.metrics.circuitBreakerTrips++;
        this.createAlert('CIRCUIT_BREAKER', 'HIGH', `Circuit breaker open for service: ${service.name}`);
        
        return {
          statusCode: 503,
          headers: { 'Content-Type': 'application/json' },
          body: { error: 'Service temporarily unavailable' },
          responseTime: Date.now() - startTime,
          service: service.name,
          cached: false,
          timestamp: new Date()
        };
      }

      // Forward request to service
      const response = await this.forwardRequest(request, service);
      
      // Update metrics
      this.metrics.successfulRequests++;
      this.updateResponseTimeMetrics(Date.now() - startTime);

      return response;

    } catch (error) {
      this.metrics.failedRequests++;
      
      qualityLogger.error('Request processing failed', 'API_GATEWAY', {
        gatewayId: this.gatewayId,
        requestId: request.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Internal server error' },
        responseTime: Date.now() - startTime,
        service: 'gateway',
        cached: false,
        timestamp: new Date()
      };
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * 🔒 Check Rate Limit
   * @param clientIP - Client IP address
   * @returns Whether request is allowed
   */
  private checkRateLimit(clientIP: string): boolean {
    const now = Date.now();
    const windowMs = this.config.rateLimiting.windowMs;
    const maxRequests = this.config.rateLimiting.maxRequests;

    const key = `rate_limit_${clientIP}`;
    const current = this.rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  /**
   * 🔄 Check Circuit Breaker
   * @param serviceId - Service ID
   * @returns Whether service is available
   */
  private checkCircuitBreaker(serviceId: string): boolean {
    const breaker = this.circuitBreakers.get(serviceId);
    if (!breaker) {
      this.circuitBreakers.set(serviceId, {
        state: 'CLOSED',
        failures: 0,
        lastFailure: new Date()
      });
      return true;
    }

    const now = Date.now();
    const service = this.services.get(serviceId);
    if (!service) return false;

    switch (breaker.state) {
      case 'CLOSED':
        return true;
      
      case 'OPEN':
        if (now - breaker.lastFailure.getTime() > service.circuitBreaker.resetTimeout) {
          breaker.state = 'HALF_OPEN';
          return true;
        }
        return false;
      
      case 'HALF_OPEN':
        return true;
      
      default:
        return false;
    }
  }

  /**
   * 🎯 Find Matching Service
   * @param path - Request path
   * @returns Matching service route
   */
  private findMatchingService(path: string): ServiceRoute | null {
    for (const service of this.services.values()) {
      if (path.startsWith(service.path)) {
        return service;
      }
    }
    return null;
  }

  /**
   * 📡 Forward Request to Service
   * @param request - Request context
   * @param service - Target service
   * @returns Response from service
   */
  private async forwardRequest(request: RequestContext, service: ServiceRoute): Promise<ResponseContext> {
    const startTime = Date.now();
    
    try {
      // Simulate service call (in real implementation, use HTTP client)
      const mockResponse = await this.simulateServiceCall(service, request);
      
      const responseTime = Date.now() - startTime;
      
      // Update circuit breaker on success
      this.updateCircuitBreakerSuccess(service.id);
      
      return {
        statusCode: mockResponse.status,
        headers: mockResponse.headers,
        body: mockResponse.data,
        responseTime,
        service: service.name,
        cached: false,
        timestamp: new Date()
      };

    } catch (error) {
      // Update circuit breaker on failure
      this.updateCircuitBreakerFailure(service.id);
      
      throw error;
    }
  }

  /**
   * 🔄 Update Circuit Breaker Success
   * @param serviceId - Service ID
   */
  private updateCircuitBreakerSuccess(serviceId: string): void {
    const breaker = this.circuitBreakers.get(serviceId);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'CLOSED';
    }
  }

  /**
   * 🚨 Update Circuit Breaker Failure
   * @param serviceId - Service ID
   */
  private updateCircuitBreakerFailure(serviceId: string): void {
    const breaker = this.circuitBreakers.get(serviceId);
    const service = this.services.get(serviceId);
    
    if (breaker && service) {
      breaker.failures++;
      breaker.lastFailure = new Date();
      
      if (breaker.failures >= service.circuitBreaker.threshold) {
        breaker.state = 'OPEN';
      }
    }
  }

  /**
   * 🎭 Simulate Service Call
   * @param service - Target service
   * @param request - Request context
   * @returns Mock response
   */
  private async simulateServiceCall(service: ServiceRoute, request: RequestContext): Promise<{ status: number; headers: Record<string, string>; data: Record<string, unknown> }> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Service temporarily unavailable');
    }
    
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      data: {
        message: `Response from ${service.name}`,
        timestamp: new Date().toISOString(),
        requestId: request.id
      }
    };
  }

  /**
   * 🚨 Create Alert
   * @param type - Alert type
   * @param severity - Alert severity
   * @param message - Alert message
   * @param service - Optional service name
   */
  private createAlert(
    type: GatewayAlert['type'], 
    severity: GatewayAlert['severity'], 
    message: string, 
    service?: string
  ): void {
    const alert: GatewayAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      severity,
      message,
      service,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(alert);

    qualityLogger.warn(`Gateway alert: ${message}`, 'API_GATEWAY', {
      gatewayId: this.gatewayId,
      alertId: alert.id,
      type,
      severity,
      service
    });
  }

  /**
   * 📊 Update Response Time Metrics
   * @param responseTime - Response time in ms
   */
  private updateResponseTimeMetrics(responseTime: number): void {
    const totalRequests = this.metrics.totalRequests;
    const currentAverage = this.metrics.averageResponseTime;
    
    this.metrics.averageResponseTime = 
      ((currentAverage * (totalRequests - 1)) + responseTime) / totalRequests;
  }

  /**
   * 🔧 Initialize Services
   */
  private initializeServices(): void {
    this.config.routing.services.forEach(service => {
      this.services.set(service.id, service);
      
      // Initialize circuit breaker
      this.circuitBreakers.set(service.id, {
        state: 'CLOSED',
        failures: 0,
        lastFailure: new Date()
      });
    });

    qualityLogger.info('Services initialized', 'API_GATEWAY', {
      gatewayId: this.gatewayId,
      servicesCount: this.services.size
    });
  }

  /**
   * 🏥 Start Health Checks
   */
  private startHealthChecks(): void {
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.routing.healthCheckInterval);
  }

  /**
   * 🏥 Perform Health Checks
   */
  private async performHealthChecks(): Promise<void> {
    for (const service of this.services.values()) {
      try {
        // Simulate health check (in real implementation, make HTTP request to health endpoint)
        const isHealthy = Math.random() > 0.1; // 90% healthy
        
        if (!isHealthy) {
          this.createAlert('SERVICE_DOWN', 'HIGH', `Service ${service.name} health check failed`, service.name);
        }
        
      } catch (error) {
        this.createAlert('SERVICE_DOWN', 'CRITICAL', `Service ${service.name} is unreachable`, service.name);
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
   * 📊 Update Metrics
   */
  private updateMetrics(): void {
    this.metrics.timestamp = new Date();
    
    // Check for high latency
    if (this.metrics.averageResponseTime > 1000) {
      this.createAlert('HIGH_LATENCY', 'MEDIUM', `High average response time: ${this.metrics.averageResponseTime}ms`);
    }
    
    qualityLogger.info('Gateway metrics updated', 'API_GATEWAY', {
      gatewayId: this.gatewayId,
      metrics: this.metrics
    });
  }

  /**
   * 🛡️ Start Security Monitoring
   */
  private startSecurityMonitoring(): void {
    setInterval(() => {
      this.performSecurityChecks();
    }, 60000); // Check every minute
  }

  /**
   * 🛡️ Perform Security Checks
   */
  private performSecurityChecks(): void {
    // Check for suspicious activity patterns
    const recentAlerts = this.alerts.filter(a => 
      a.timestamp.getTime() > Date.now() - 300000 && // Last 5 minutes
      a.type === 'RATE_LIMIT'
    );

    if (recentAlerts.length > 10) {
      this.createAlert('SECURITY', 'HIGH', 'Potential DDoS attack detected - multiple rate limit violations');
    }
  }

  /**
   * 📊 Get Gateway Metrics
   * @returns Current gateway metrics
   */
  getMetrics(): GatewayMetrics {
    return { ...this.metrics };
  }

  /**
   * 🚨 Get Active Alerts
   * @returns Active alerts
   */
  getActiveAlerts(): GatewayAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * ✅ Resolve Alert
   * @param alertId - Alert ID to resolve
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      
      qualityLogger.info('Alert resolved', 'API_GATEWAY', {
        gatewayId: this.gatewayId,
        alertId
      });
    }
  }

  /**
   * 🔧 Get Gateway Configuration
   * @returns Gateway configuration
   */
  getConfiguration(): GatewayConfig {
    return { ...this.config };
  }

  /**
   * 🛑 Stop Gateway
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    qualityLogger.info('API Gateway stopped', 'API_GATEWAY', {
      gatewayId: this.gatewayId
    });
  }
}

// 🔧 Default Gateway Configuration
export const defaultGatewayConfig: GatewayConfig = {
  port: 8080,
  rateLimiting: {
    windowMs: 60000, // 1 minute
    maxRequests: 1000,
    skipSuccessfulRequests: false
  },
  authentication: {
    enabled: true,
    jwtSecret: process.env.JWT_SECRET || '',
    tokenExpiry: 3600 // 1 hour
  },
  routing: {
    services: [
      {
        id: 'crm-service',
        name: 'CRM Service',
        path: '/api/crm',
        target: 'http://crm-service:3001',
        weight: 1,
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          enabled: true,
          threshold: 5,
          timeout: 30000,
          resetTimeout: 60000
        }
      },
      {
        id: 'inventory-service',
        name: 'Inventory Service',
        path: '/api/inventory',
        target: 'http://inventory-service:3002',
        weight: 1,
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          enabled: true,
          threshold: 5,
          timeout: 30000,
          resetTimeout: 60000
        }
      },
      {
        id: 'contracts-service',
        name: 'Contracts Service',
        path: '/api/contracts',
        target: 'http://contracts-service:3003',
        weight: 1,
        healthCheck: '/health',
        timeout: 5000,
        retries: 3,
        circuitBreaker: {
          enabled: true,
          threshold: 5,
          timeout: 30000,
          resetTimeout: 60000
        }
      }
    ],
    loadBalancing: 'round-robin',
    healthCheckInterval: 30000
  },
  security: {
    cors: true,
    helmet: true,
    rateLimitByIP: true,
    ddosProtection: true
  }
};

// 🛡️ Global API Gateway Instance
export const enterpriseAPIGateway = new EnterpriseAPIGateway(defaultGatewayConfig);

// 🔧 Utility Functions
export function createAPIGateway(config: GatewayConfig): EnterpriseAPIGateway {
  return new EnterpriseAPIGateway(config);
}

export async function startGateway(): Promise<void> {
  return enterpriseAPIGateway.start();
}

export function getGatewayMetrics(): GatewayMetrics {
  return enterpriseAPIGateway.getMetrics();
}

export default EnterpriseAPIGateway;