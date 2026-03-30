/**
 * ✅ SILEXAR PULSE QUANTUM - SPRINT 1 SECURITY VALIDATION
 * 
 * Script de validación completa del SPRINT 1: Security Foundation
 * Verifica que todos los componentes de seguridad estén funcionando correctamente
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - SPRINT 1 VALIDATION
 */

import { qualityLogger } from '../lib/quality/quality-logger';
import { runSecurityTests } from '../lib/security/security-tests';
import { rateLimiter } from '../lib/security/rate-limiting';
import { auditLogger } from '../lib/security/audit-logger';
import { inputValidator } from '../lib/security/input-validation';

// 🎯 Validation Result
interface Sprint1ValidationResult {
  overallPassed: boolean;
  components: {
    rateLimiting: ComponentValidation;
    auditLogging: ComponentValidation;
    inputValidation: ComponentValidation;
    securityTests: ComponentValidation;
  };
  summary: {
    totalComponents: number;
    passedComponents: number;
    failedComponents: number;
    passRate: number;
  };
  recommendations: string[];
  timestamp: Date;
}

interface ComponentValidation {
  name: string;
  passed: boolean;
  details: string;
  errors?: string[];
  warnings?: string[];
}

/**
 * ✅ Sprint 1 Security Validator Class
 */
export class Sprint1SecurityValidator {
  private validationId: string;

  constructor() {
    this.validationId = `sprint1_validation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    qualityLogger.info('Sprint 1 Security Validator initialized', 'SPRINT1_VALIDATION', {
      validationId: this.validationId
    });
  }

  /**
   * 🚀 Run Complete Sprint 1 Validation
   * @returns Complete validation results
   */
  async validateSprint1Security(): Promise<Sprint1ValidationResult> {
    const startTime = Date.now();

    qualityLogger.info('Starting Sprint 1 Security validation', 'SPRINT1_VALIDATION', {
      validationId: this.validationId
    });

    try {
      // Validate each component
      const rateLimitingValidation = await this.validateRateLimiting();
      const auditLoggingValidation = await this.validateAuditLogging();
      const inputValidationValidation = await this.validateInputValidation();
      const securityTestsValidation = await this.validateSecurityTests();

      const components = {
        rateLimiting: rateLimitingValidation,
        auditLogging: auditLoggingValidation,
        inputValidation: inputValidationValidation,
        securityTests: securityTestsValidation
      };

      // Calculate summary
      const componentArray = Object.values(components);
      const passedComponents = componentArray.filter(c => c.passed).length;
      const failedComponents = componentArray.filter(c => !c.passed).length;
      const passRate = (passedComponents / componentArray.length) * 100;
      const overallPassed = failedComponents === 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(components);

      const result: Sprint1ValidationResult = {
        overallPassed,
        components,
        summary: {
          totalComponents: componentArray.length,
          passedComponents,
          failedComponents,
          passRate
        },
        recommendations,
        timestamp: new Date()
      };

      const duration = Date.now() - startTime;

      qualityLogger.info('Sprint 1 Security validation completed', 'SPRINT1_VALIDATION', {
        validationId: this.validationId,
        overallPassed: result.overallPassed,
        passRate: result.summary.passRate,
        duration
      });

      return result;

    } catch (error) {
      qualityLogger.error('Sprint 1 Security validation failed', 'SPRINT1_VALIDATION', {
        validationId: this.validationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * 🚦 Validate Rate Limiting Component
   */
  private async validateRateLimiting(): Promise<ComponentValidation> {
    try {
      // Test basic functionality
      const testIdentifier = 'validation-test-user';
      await rateLimiter.clearRateLimit(testIdentifier);
      
      // Check if rate limiter is working
      const status = await rateLimiter.checkRateLimit(testIdentifier, 'api-general');
      
      if (typeof status.limit !== 'number' || typeof status.remaining !== 'number') {
        throw new Error('Rate limiter not returning proper status structure');
      }

      // Check statistics
      const stats = rateLimiter.getStatistics();
      if (typeof stats.totalConfigs !== 'number' || stats.totalConfigs < 1) {
        throw new Error('Rate limiter should have at least one configuration');
      }

      return {
        name: 'Rate Limiting',
        passed: true,
        details: `Rate limiting functional with ${stats.totalConfigs} configurations and ${stats.activeKeys} active keys`
      };

    } catch (error) {
      return {
        name: 'Rate Limiting',
        passed: false,
        details: 'Rate limiting validation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * 📝 Validate Audit Logging Component
   */
  private async validateAuditLogging(): Promise<ComponentValidation> {
    try {
      // Test basic logging
      const initialCount = auditLogger.queryEvents().length;
      
      auditLogger.logEvent({
        eventType: 'LOGIN_SUCCESS' as any,
        severity: 'LOW' as any,
        userId: 'validation-test',
        resource: 'VALIDATION_TEST',
        action: 'TEST_LOG',
        details: { validationTest: true },
        success: true
      });

      const newCount = auditLogger.queryEvents().length;
      if (newCount <= initialCount) {
        throw new Error('Audit logger not logging events properly');
      }

      // Test querying
      const events = auditLogger.queryEvents({ userId: 'validation-test' }, 5);
      if (events.length === 0) {
        throw new Error('Audit logger not querying events properly');
      }

      // Test statistics
      const stats = auditLogger.getStatistics(1);
      if (typeof stats.totalEvents !== 'number') {
        throw new Error('Audit logger statistics not working properly');
      }

      return {
        name: 'Audit Logging',
        passed: true,
        details: `Audit logging functional with ${stats.totalEvents} events in last hour`
      };

    } catch (error) {
      return {
        name: 'Audit Logging',
        passed: false,
        details: 'Audit logging validation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * 🛡️ Validate Input Validation Component
   */
  private async validateInputValidation(): Promise<ComponentValidation> {
    try {
      // Test string validation
      const stringResult = inputValidator.validateString('test string', {
        required: true,
        minLength: 5,
        maxLength: 20
      });

      if (!stringResult.isValid) {
        throw new Error('Input validator not validating strings properly');
      }

      // Test email validation
      const emailResult = inputValidator.validateEmail('test@example.com', true);
      if (!emailResult.isValid) {
        throw new Error('Input validator not validating emails properly');
      }

      // Test security pattern detection
      const maliciousInput = inputValidator.validateString('<script>alert("test")</script>', {
        strictMode: true
      });

      if (maliciousInput.isValid) {
        throw new Error('Input validator not detecting security violations');
      }

      // Test statistics
      const stats = inputValidator.getStatistics();
      if (!stats.supportedValidations || stats.supportedValidations.length === 0) {
        throw new Error('Input validator statistics not working properly');
      }

      return {
        name: 'Input Validation',
        passed: true,
        details: `Input validation functional with ${stats.securityPatternsCount} security patterns and ${stats.supportedValidations.length} validation types`
      };

    } catch (error) {
      return {
        name: 'Input Validation',
        passed: false,
        details: 'Input validation validation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * 🧪 Validate Security Tests Component
   */
  private async validateSecurityTests(): Promise<ComponentValidation> {
    try {
      // Run the complete security test suite
      const testResults = await runSecurityTests();

      if (!testResults.overallPassed) {
        const failedTests = testResults.results.filter(r => !r.passed);
        throw new Error(`${failedTests.length} security tests failed: ${failedTests.map(t => t.testName).join(', ')}`);
      }

      if (testResults.totalTests === 0) {
        throw new Error('No security tests were executed');
      }

      return {
        name: 'Security Tests',
        passed: true,
        details: `All ${testResults.totalTests} security tests passed (${testResults.passedTests}/${testResults.totalTests})`
      };

    } catch (error) {
      return {
        name: 'Security Tests',
        passed: false,
        details: 'Security tests validation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * 💡 Generate Recommendations
   */
  private generateRecommendations(components: Sprint1ValidationResult['components']): string[] {
    const recommendations: string[] = [];

    // Check each component and generate specific recommendations
    Object.values(components).forEach(component => {
      if (!component.passed) {
        recommendations.push(`Fix ${component.name}: ${component.errors?.join(', ') || 'Unknown issue'}`);
      }
    });

    // General recommendations
    if (components.rateLimiting.passed) {
      recommendations.push('Consider implementing Redis for production rate limiting storage');
    }

    if (components.auditLogging.passed) {
      recommendations.push('Set up log rotation and archival for audit logs');
    }

    if (components.inputValidation.passed) {
      recommendations.push('Implement input validation middleware in all API routes');
    }

    if (components.securityTests.passed) {
      recommendations.push('Integrate security tests into CI/CD pipeline');
    }

    // If all passed, add optimization recommendations
    if (Object.values(components).every(c => c.passed)) {
      recommendations.push('All Sprint 1 security components are functional - ready for production deployment');
      recommendations.push('Consider implementing additional security monitoring and alerting');
      recommendations.push('Set up automated security scanning in CI/CD pipeline');
    }

    return recommendations;
  }

  /**
   * 📊 Get Validation Summary
   */
  getValidationSummary(): {
    validationId: string;
    componentsStatus: Record<string, boolean>;
  } {
    return {
      validationId: this.validationId,
      componentsStatus: {
        rateLimiting: false, // Will be updated after validation
        auditLogging: false,
        inputValidation: false,
        securityTests: false
      }
    };
  }
}

// 🛡️ Global Sprint 1 Validator Instance
export const sprint1Validator = new Sprint1SecurityValidator();

// 🔧 Utility Functions
export async function validateSprint1(): Promise<Sprint1ValidationResult> {
  return sprint1Validator.validateSprint1Security();
}

export async function quickSecurityCheck(): Promise<{
  rateLimitingWorking: boolean;
  auditLoggingWorking: boolean;
  inputValidationWorking: boolean;
  overallHealthy: boolean;
}> {
  try {
    // Quick checks without full validation
    const rateLimitingWorking = rateLimiter.getStatistics().totalConfigs > 0;
    const auditLoggingWorking = auditLogger.queryEvents({}, 1).length >= 0;
    const inputValidationWorking = inputValidator.getStatistics().supportedValidations.length > 0;
    
    const overallHealthy = rateLimitingWorking && auditLoggingWorking && inputValidationWorking;

    return {
      rateLimitingWorking,
      auditLoggingWorking,
      inputValidationWorking,
      overallHealthy
    };
  } catch (error) {
    return {
      rateLimitingWorking: false,
      auditLoggingWorking: false,
      inputValidationWorking: false,
      overallHealthy: false
    };
  }
}

// 🚀 Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    try {
      const quickCheck = await quickSecurityCheck();
      qualityLogger.info('Sprint 1 Security quick check completed', 'SPRINT1_QUICK_CHECK', quickCheck);
    } catch (error) {
      qualityLogger.error('Sprint 1 Security quick check failed', 'SPRINT1_QUICK_CHECK', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, 2000); // Run after 2 seconds to allow system initialization
}