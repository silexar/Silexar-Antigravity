import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
// @ts-expect-error — jsdom ships its own types via the 'jsdom' package but
// has no separate @types/jsdom. The runtime types are available; this
// suppresses the rare tsconfig/bundler combination that fails to resolve them.
import { JSDOM } from 'jsdom';
import { apiUnauthorized, getUserContext, apiForbidden} from '@/lib/api/response';
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// Neuromorphic design validation rules
interface DesignRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (element: Element) => boolean;
  message: string;
}

interface DesignValidationResult {
  ruleId: string;
  ruleName: string;
  severity: 'error' | 'warning' | 'info';
  passed: boolean;
  message: string;
  element?: string;
  suggestion?: string;
}

interface ComponentValidation {
  component: string;
  results: DesignValidationResult[];
  score: number;
  status: 'passed' | 'failed' | 'warning';
}

// Neuromorphic design principles
const neuromorphicDesignRules: DesignRule[] = [
  {
    id: 'neuro-001',
    name: 'Shadow Consistency',
    description: 'Elements must have consistent shadow styling',
    severity: 'error',
    check: (element: Element) => {
      const className = element.className || '';
      const hasNeuroShadow = className.includes('shadow-[') || 
        className.includes('shadow-lg') || 
        className.includes('shadow-xl');
      return hasNeuroShadow;
    },
    message: 'Element lacks proper neuromorphic shadow styling'
  },
  {
    id: 'neuro-002',
    name: 'Color Palette',
    description: 'Must use approved neuromorphic color palette',
    severity: 'error',
    check: (element: Element) => {
      const className = element.className || '';
      const allowedColors = [
        'slate-', 'gray-', 'zinc-', 'neutral-', 'stone-',
        'blue-', 'indigo-', 'purple-', 'pink-'
      ];
      
      return allowedColors.some(color => className.includes(color));
    },
    message: 'Element uses non-approved color palette'
  },
  {
    id: 'neuro-003',
    name: 'Border Radius',
    description: 'Must have appropriate border radius for neuromorphic design',
    severity: 'warning',
    check: (element: Element) => {
      const className = element.className || '';
      const hasBorderRadius = className.includes('rounded-') || 
        className.includes('rounded-lg') || 
        className.includes('rounded-xl');
      return hasBorderRadius;
    },
    message: 'Element lacks proper border radius'
  },
  {
    id: 'neuro-004',
    name: 'Gradient Usage',
    description: 'Should use subtle gradients for depth effect',
    severity: 'info',
    check: (element: Element) => {
      const className = element.className || '';
      const hasGradient = className.includes('bg-gradient-');
      return hasGradient;
    },
    message: 'Consider adding gradient for depth effect'
  },
  {
    id: 'neuro-005',
    name: 'Transition Effects',
    description: 'Must have smooth transition effects',
    severity: 'warning',
    check: (element: Element) => {
      const className = element.className || '';
      const hasTransition = className.includes('transition-') || 
        className.includes('duration-') ||
        className.includes('ease-');
      return hasTransition;
    },
    message: 'Element lacks smooth transition effects'
  },
  {
    id: 'neuro-006',
    name: 'Contrast Ratio',
    description: 'Must maintain WCAG 2.1 AA contrast ratio',
    severity: 'error',
    check: (element: Element) => {
      // This is a simplified check - in real implementation would calculate actual contrast
      const className = element.className || '';
      const hasContrastClasses = className.includes('text-') && className.includes('bg-');
      return hasContrastClasses;
    },
    message: 'Element may not meet WCAG contrast requirements'
  }
];

// Component-specific validation rules
const componentValidationRules: Record<string, DesignRule[]> = {
  'NeuromorphicCard': [
    {
      id: 'card-001',
      name: 'Card Shadow Depth',
      description: 'Cards must have appropriate shadow depth',
      severity: 'error',
      check: (element: Element) => {
        const className = element.className || '';
        return className.includes('shadow-[') || className.includes('shadow-xl');
      },
      message: 'Card lacks proper shadow depth'
    },
    {
      id: 'card-002',
      name: 'Card Border',
      description: 'Cards should have subtle borders',
      severity: 'warning',
      check: (element: Element) => {
        const className = element.className || '';
        return className.includes('border-') && !className.includes('border-2');
      },
      message: 'Card border may be too prominent'
    }
  ],
  'NeuromorphicButton': [
    {
      id: 'button-001',
      name: 'Button Hover Effects',
      description: 'Buttons must have hover state effects',
      severity: 'error',
      check: (element: Element) => {
        const className = element.className || '';
        return className.includes('hover:');
      },
      message: 'Button lacks hover state effects'
    },
    {
      id: 'button-002',
      name: 'Button Active State',
      description: 'Buttons must have active state effects',
      severity: 'warning',
      check: (element: Element) => {
        const className = element.className || '';
        return className.includes('active:');
      },
      message: 'Button lacks active state effects'
    }
  ],
  'NeuromorphicInput': [
    {
      id: 'input-001',
      name: 'Input Focus State',
      description: 'Inputs must have focus state styling',
      severity: 'error',
      check: (element: Element) => {
        const className = element.className || '';
        return className.includes('focus:');
      },
      message: 'Input lacks focus state styling'
    }
  ]
};

// Design validator class
export class NeuromorphicDesignValidator {
  private static instance: NeuromorphicDesignValidator;
  
  static getInstance(): NeuromorphicDesignValidator {
    if (!this.instance) {
      this.instance = new NeuromorphicDesignValidator();
    }
    return this.instance;
  }

  validateComponent(html: string, componentName: string): ComponentValidation {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const element = document.body.firstElementChild;
    
    if (!element) {
      return {
        component: componentName,
        results: [{
          ruleId: 'general',
          ruleName: 'HTML Structure',
          severity: 'error',
          passed: false,
          message: 'Invalid HTML structure'
        }],
        score: 0,
        status: 'failed'
      };
    }

    const results: DesignValidationResult[] = [];
    
    // Apply general neuromorphic rules
    neuromorphicDesignRules.forEach(rule => {
      const passed = rule.check(element);
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        passed,
        message: passed ? 'Rule passed' : rule.message,
        element: element.tagName,
        suggestion: passed ? undefined : this.generateSuggestion(rule)
      });
    });

    // Apply component-specific rules
    const specificRules = componentValidationRules[componentName as keyof typeof componentValidationRules] || [];
    specificRules.forEach(rule => {
      const passed = rule.check(element);
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        passed,
        message: passed ? 'Rule passed' : rule.message,
        element: element.tagName,
        suggestion: passed ? undefined : this.generateSuggestion(rule)
      });
    });

    // Calculate score
    const totalRules = results.length;
    const passedRules = results.filter(r => r.passed).length;
    const score = Math.round((passedRules / totalRules) * 100);

    // Determine status
    const hasErrors = results.some(r => r.severity === 'error' && !r.passed);
    const hasWarnings = results.some(r => r.severity === 'warning' && !r.passed);
    
    let status: 'passed' | 'failed' | 'warning' = 'passed';
    if (hasErrors) {
      status = 'failed';
    } else if (hasWarnings) {
      status = 'warning';
    }

    return {
      component: componentName,
      results,
      score,
      status
    };
  }

  validatePage(html: string, pageName: string): {
    page: string;
    components: ComponentValidation[];
    overallScore: number;
    status: 'passed' | 'failed' | 'warning';
  } {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find all neuromorphic components
    const components = document.querySelectorAll('[class*="Neuromorphic"]');
    const validations: ComponentValidation[] = [];

    components.forEach((element: Element) => {
      const className = element.className || '';
      const componentMatch = className.match(/Neuromorphic(\w+)/);
      
      if (componentMatch) {
        const componentName = componentMatch[1];
        const componentHtml = element.outerHTML;
        const validation = this.validateComponent(componentHtml, `Neuromorphic${componentName}`);
        validations.push(validation);
      }
    });

    // Calculate overall score
    const totalScore = validations.reduce((sum, v) => sum + v.score, 0);
    const overallScore = validations.length > 0 ? Math.round(totalScore / validations.length) : 0;

    // Determine overall status
    const hasFailed = validations.some(v => v.status === 'failed');
    const hasWarnings = validations.some(v => v.status === 'warning');
    
    let status: 'passed' | 'failed' | 'warning' = 'passed';
    if (hasFailed) {
      status = 'failed';
    } else if (hasWarnings) {
      status = 'warning';
    }

    return {
      page: pageName,
      components: validations,
      overallScore,
      status
    };
  }

  private generateSuggestion(rule: DesignRule): string {
    const suggestions: { [key: string]: string } = {
      'neuro-001': 'Add shadow classes like "shadow-xl" or custom shadow with "shadow-[0_4px_12px_rgba(0,0,0,0.3)]"',
      'neuro-002': 'Use approved colors like slate, gray, blue, indigo, purple, or pink',
      'neuro-003': 'Add border radius with classes like "rounded-lg" or "rounded-xl"',
      'neuro-004': 'Consider adding gradient with "bg-gradient-to-r from-slate-800 to-slate-900"',
      'neuro-005': 'Add transition effects with "transition-all duration-300"',
      'neuro-006': 'Ensure proper contrast between text and background colors',
      'card-001': 'Add deeper shadow with "shadow-xl" or custom shadow values',
      'card-002': 'Use subtle border like "border border-slate-700/50"',
      'button-001': 'Add hover effects with "hover:scale-105 hover:shadow-lg"',
      'button-002': 'Add active state with "active:scale-95"',
      'input-001': 'Add focus state with "focus:ring-2 focus:ring-blue-500/50"'
    };

    return suggestions[rule.id] || 'Review component styling for neuromorphic design compliance';
  }

  generateReport(validations: ComponentValidation[]): string {
    const lines: string[] = [];
    lines.push('# Neuromorphic Design Validation Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    validations.forEach(validation => {
      lines.push(`## ${validation.component}`);
      lines.push(`**Score**: ${validation.score}/100`);
      lines.push(`**Status**: ${validation.status.toUpperCase()}`);
      lines.push('');

      if (validation.results.length > 0) {
        lines.push('### Validation Results:');
        validation.results.forEach(result => {
          const status = result.passed ? '✅' : '❌';
          const severity = result.severity.toUpperCase();
          lines.push(`${status} **${result.ruleName}** (${severity}): ${result.message}`);
          if (result.suggestion) {
            lines.push(`   💡 Suggestion: ${result.suggestion}`);
          }
        });
        lines.push('');
      }
    });

    return lines.join('\n');
  }
}

// API endpoints
export async function POST(request: NextRequest) {
  try {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();

  const perm = checkPermission(ctx, 'campanas', 'read');
  if (!perm) return apiForbidden();
    const body = await request.json();
    const { html, componentName, pageName } = body;

    if (!html) {
      return NextResponse.json(
        { success: false, error: 'HTML content is required' },
        { status: 400 }
      );
    }

    const validator = NeuromorphicDesignValidator.getInstance();
    let result;

    if (componentName) {
      result = validator.validateComponent(html, componentName);
    } else if (pageName) {
      result = validator.validatePage(html, pageName);
    } else {
      return NextResponse.json(
        { success: false, error: 'Either componentName or pageName must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Design validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ctx = getUserContext(request);
    if (!ctx.userId) return apiUnauthorized();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const rules = {
      general: neuromorphicDesignRules,
      componentSpecific: componentValidationRules
    };

    if (format === 'markdown') {
      const markdown = `# Neuromorphic Design Rules

## General Rules
${neuromorphicDesignRules.map(rule => `
### ${rule.name} (${rule.severity})
${rule.description}
- **ID**: ${rule.id}
- **Severity**: ${rule.severity}
`).join('\n')}

## Component-Specific Rules
${Object.entries(componentValidationRules).map(([component, rules]) => `
### ${component}
${rules.map(rule => `
#### ${rule.name} (${rule.severity})
${rule.description}
- **ID**: ${rule.id}
`).join('\n')}
`).join('\n')}
`;

      return new NextResponse(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="neuromorphic-design-rules.md"'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: rules,
      meta: {
        totalGeneralRules: neuromorphicDesignRules.length,
        totalComponentRules: Object.keys(componentValidationRules).length
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve design rules',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}