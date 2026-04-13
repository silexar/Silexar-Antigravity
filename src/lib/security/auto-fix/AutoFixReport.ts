/**
 * Sistema de reportes para el auto-fixer de seguridad
 * @module SecurityAutoFix/AutoFixReport
 * 
 * Genera reportes detallados de correcciones aplicadas
 */

import type {
  AutoFixReport,
  FixResult,
  AutoFixStatistics,
  AutoFixConfig,
  SeverityLevel,
  IssueType,
  FixStatus,
} from './types';

/** Opciones de generación de reporte */
export interface ReportOptions {
  /** Formato del reporte */
  format?: 'json' | 'markdown' | 'html' | 'console';
  /** Incluir código corregido */
  includeCode?: boolean;
  /** Incluir estadísticas detalladas */
  detailedStats?: boolean;
  /** Solo errores */
  errorsOnly?: boolean;
  /** Umbral de severidad mínimo */
  minSeverity?: SeverityLevel;
}

/** Entrada resumida para reportes */
interface SummaryEntry {
  file: string;
  issues: number;
  fixed: number;
  failed: number;
  severity: SeverityLevel;
}

/**
 * Generador de reportes para el sistema de auto-fix
 */
export class AutoFixReportGenerator {
  private report: AutoFixReport;
  private options: Required<ReportOptions>;

  constructor(
    config: AutoFixConfig,
    results: FixResult[],
    startTime: Date,
    options: ReportOptions = {}
  ) {
    this.options = {
      format: options.format ?? 'markdown',
      includeCode: options.includeCode ?? false,
      detailedStats: options.detailedStats ?? true,
      errorsOnly: options.errorsOnly ?? false,
      minSeverity: options.minSeverity ?? 'LOW',
    };

    this.report = this.generateReport(config, results, startTime);
  }

  /**
   * Genera el reporte completo
   */
  private generateReport(
    config: AutoFixConfig,
    results: FixResult[],
    startTime: Date
  ): AutoFixReport {
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    // Filtrar por severidad mínima
    const filteredResults = this.filterResults(results);

    const statistics = this.calculateStatistics(filteredResults);
    const filesModified = this.getModifiedFiles(filteredResults);
    const filesCreated = this.getCreatedFiles(filteredResults);
    const summary = this.generateSummary(filteredResults, statistics, filesModified);

    return {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: endTime,
      durationMs,
      config,
      results: filteredResults,
      statistics,
      filesModified,
      filesCreated,
      summary,
    };
  }

  /**
   * Filtra resultados según opciones
   */
  private filterResults(results: FixResult[]): FixResult[] {
    const severityOrder: SeverityLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
    const minSeverityIndex = severityOrder.indexOf(this.options.minSeverity);

    return results.filter(result => {
      const resultSeverityIndex = severityOrder.indexOf(result.issue.severity);
      
      if (resultSeverityIndex > minSeverityIndex) return false;
      if (this.options.errorsOnly && result.status !== 'failed') return false;
      
      return true;
    });
  }

  /**
   * Calcula estadísticas del reporte
   */
  private calculateStatistics(results: FixResult[]): AutoFixStatistics {
    const bySeverity: Record<SeverityLevel, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const byType: Partial<Record<IssueType, number>> = {};

    let totalFixTime = 0;
    let successCount = 0;
    let fixedAutomatically = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let manualReviewCount = 0;

    results.forEach(result => {
      bySeverity[result.issue.severity]++;
      byType[result.issue.type] = (byType[result.issue.type] || 0) + 1;
      totalFixTime += result.executionTimeMs;

      if (result.status === 'applied') {
        successCount++;
        fixedAutomatically++;
      } else if (result.status === 'failed') {
        failedCount++;
      } else if (result.status === 'skipped') {
        skippedCount++;
      } else if (result.status === 'manual_review') {
        manualReviewCount++;
      }
    });

    const totalIssues = results.length;
    const successRate = totalIssues > 0 ? successCount / totalIssues : 0;
    const averageFixTimeMs = totalIssues > 0 ? totalFixTime / totalIssues : 0;

    return {
      totalIssues,
      fixedAutomatically,
      fixedManually: manualReviewCount,
      failed: failedCount,
      skipped: skippedCount,
      pendingReview: manualReviewCount,
      issuesBySeverity: bySeverity,
      issuesByType: byType as Record<IssueType, number>,
      averageFixTimeMs,
      successRate,
      timestamp: new Date(),
    };
  }

  /**
   * Obtiene lista de archivos modificados
   */
  private getModifiedFiles(results: FixResult[]): string[] {
    const files = new Set<string>();
    results
      .filter(r => r.status === 'applied')
      .forEach(r => files.add(r.issue.filePath));
    return Array.from(files).sort();
  }

  /**
   * Obtiene lista de archivos creados
   */
  private getCreatedFiles(results: FixResult[]): string[] {
    // Por ahora, ningún fix crea archivos
    // Esto se puede extender en el futuro
    return [];
  }

  /**
   * Genera resumen ejecutivo
   */
  private generateSummary(results: FixResult[], statistics: AutoFixStatistics, filesModified: string[]): string {
    const parts: string[] = [
      `## Resumen de Auto-Corrección de Seguridad`,
      ``,
      `- **Total de issues detectados:** ${statistics.totalIssues}`,
      `- **Corregidos automáticamente:** ${statistics.fixedAutomatically}`,
      `- **Requieren revisión manual:** ${statistics.pendingReview}`,
      `- **Fallidos:** ${statistics.failed}`,
      `- **Omitidos:** ${statistics.skipped}`,
      `- **Tasa de éxito:** ${(statistics.successRate * 100).toFixed(1)}%`,
      `- **Tiempo promedio de fix:** ${statistics.averageFixTimeMs.toFixed(2)}ms`,
      ``,
      `### Distribución por Severidad`,
      `- 🔴 HIGH: ${statistics.issuesBySeverity.HIGH}`,
      `- 🟡 MEDIUM: ${statistics.issuesBySeverity.MEDIUM}`,
      `- 🔵 LOW: ${statistics.issuesBySeverity.LOW}`,
    ];

    if (statistics.fixedAutomatically > 0) {
      parts.push(
        ``,
        `✅ **${statistics.fixedAutomatically} issues fueron corregidos automáticamente**`,
        `Los cambios han sido aplicados a ${filesModified.length} archivo(s).`
      );
    }

    if (statistics.pendingReview > 0) {
      parts.push(
        ``,
        `⚠️ **${statistics.pendingReview} issues requieren revisión manual**`,
        `Por favor revisa los issues marcados con estado "manual_review".`
      );
    }

    if (statistics.failed > 0) {
      parts.push(
        ``,
        `❌ **${statistics.failed} correcciones fallaron**`,
        `Revisa los errores detallados en la sección de resultados.`
      );
    }

    return parts.join('\n');
  }

  /**
   * Genera reporte en formato JSON
   */
  toJSON(): string {
    return JSON.stringify(this.report, null, 2);
  }

  /**
   * Genera reporte en formato Markdown
   */
  toMarkdown(): string {
    const lines: string[] = [
      `# Reporte de Auto-Corrección de Seguridad`,
      ``,
      `**Generado:** ${this.report.timestamp.toISOString()}`,
      `**Duración:** ${(this.report.durationMs / 1000).toFixed(2)}s`,
      `**Report ID:** ${this.report.id}`,
      ``,
      this.report.summary,
      ``,
      `---`,
      ``,
    ];

    // Estadísticas detalladas
    if (this.options.detailedStats) {
      lines.push(
        `## Estadísticas Detalladas`,
        ``,
        `### Issues por Tipo`,
        ``
      );

      const sortedTypes = Object.entries(this.report.statistics.issuesByType)
        .sort(([, a], [, b]) => b - a);

      for (const [type, count] of sortedTypes) {
        lines.push(`- \`${type}\`: ${count}`);
      }

      lines.push('');
    }

    // Archivos modificados
    if (this.report.filesModified.length > 0) {
      lines.push(
        `## Archivos Modificados`,
        ``
      );
      this.report.filesModified.forEach(file => {
        lines.push(`- \`${file}\``);
      });
      lines.push('');
    }

    // Resultados detallados
    lines.push(
      `## Detalle de Resultados`,
      ``
    );

    const groupedResults = this.groupResultsByFile();
    
    for (const [file, results] of groupedResults) {
      lines.push(
        `### ${file}`,
        ``
      );

      results.forEach(result => {
        const statusEmoji = this.getStatusEmoji(result.status);
        lines.push(
          `#### ${statusEmoji} ${result.issue.type} (${result.issue.severity})`,
          `- **Línea:** ${result.issue.line}:${result.issue.column}`,
          `- **Estado:** ${result.status}`,
          `- **Mensaje:** ${result.issue.message}`,
          `- **Confianza:** ${(result.issue.confidence * 100).toFixed(0)}%`
        );

        if (this.options.includeCode) {
          lines.push(
            `- **Código original:**`,
            `  \`\`\`typescript`,
            `  ${result.issue.originalCode}`,
            `  \`\`\``
          );

          if (result.appliedFix) {
            lines.push(
              `- **Código corregido:**`,
              `  \`\`\`typescript`,
              `  ${result.appliedFix}`,
              `  \`\``
            );
          }
        }

        if (result.error) {
          lines.push(`- **Error:** ${result.error}`);
        }

        lines.push('');
      });
    }

    // Recomendaciones
    lines.push(
      `## Recomendaciones`,
      ``,
      this.generateRecommendations(),
      ``,
      `---`,
      ``,
      `*Reporte generado por Silexar Pulse Security Auto-Fixer*`
    );

    return lines.join('\n');
  }

  /**
   * Genera reporte en formato HTML
   */
  toHTML(): string {
    const css = `
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #1a1a1a; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        h3 { color: #555; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .stat-label { color: #666; font-size: 0.9em; }
        .severity-high { color: #dc2626; }
        .severity-medium { color: #ea580c; }
        .severity-low { color: #2563eb; }
        .status-applied { color: #16a34a; }
        .status-failed { color: #dc2626; }
        .status-pending { color: #ca8a04; }
        .file-section { margin: 20px 0; padding: 15px; border-left: 4px solid #e0e0e0; }
        .code-block { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: 'Consolas', monospace; font-size: 0.9em; }
        .recommendations { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        th { background: #f5f5f5; font-weight: 600; }
        tr:hover { background: #f9f9f9; }
      </style>
    `;

    const stats = this.report.statistics;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Auto-Fix Report</title>
  ${css}
</head>
<body>
  <h1>🔒 Reporte de Auto-Corrección de Seguridad</h1>
  
  <div class="summary">
    <p><strong>Generado:</strong> ${this.report.timestamp.toLocaleString('es-ES')}</p>
    <p><strong>Duración:</strong> ${(this.report.durationMs / 1000).toFixed(2)}s</p>
    <p><strong>ID:</strong> ${this.report.id}</p>
  </div>

  <h2>📊 Estadísticas</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-value">${stats.totalIssues}</div>
      <div class="stat-label">Total Issues</div>
    </div>
    <div class="stat-card">
      <div class="stat-value status-applied">${stats.fixedAutomatically}</div>
      <div class="stat-label">Auto-Fixed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value status-pending">${stats.pendingReview}</div>
      <div class="stat-label">Pendientes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value status-failed">${stats.failed}</div>
      <div class="stat-label">Fallidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${(stats.successRate * 100).toFixed(1)}%</div>
      <div class="stat-label">Tasa de Éxito</div>
    </div>
  </div>

  <h2>🎯 Distribución por Severidad</h2>
  <table>
    <tr>
      <th>Severidad</th>
      <th>Cantidad</th>
      <th>Porcentaje</th>
    </tr>
    <tr>
      <td class="severity-high">🔴 HIGH</td>
      <td>${stats.issuesBySeverity.HIGH}</td>
      <td>${stats.totalIssues > 0 ? ((stats.issuesBySeverity.HIGH / stats.totalIssues) * 100).toFixed(1) : 0}%</td>
    </tr>
    <tr>
      <td class="severity-medium">🟡 MEDIUM</td>
      <td>${stats.issuesBySeverity.MEDIUM}</td>
      <td>${stats.totalIssues > 0 ? ((stats.issuesBySeverity.MEDIUM / stats.totalIssues) * 100).toFixed(1) : 0}%</td>
    </tr>
    <tr>
      <td class="severity-low">🔵 LOW</td>
      <td>${stats.issuesBySeverity.LOW}</td>
      <td>${stats.totalIssues > 0 ? ((stats.issuesBySeverity.LOW / stats.totalIssues) * 100).toFixed(1) : 0}%</td>
    </tr>
  </table>

  <h2>📁 Archivos Modificados</h2>
  <ul>
    ${this.report.filesModified.map(f => `<li><code>${f}</code></li>`).join('')}
  </ul>

  <h2>📝 Detalle de Resultados</h2>
  ${this.generateHTMLResults()}

  <h2>💡 Recomendaciones</h2>
  <div class="recommendations">
    ${this.generateRecommendations().replace(/\n/g, '<br>')}
  </div>

  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 0.9em;">
    <em>Reporte generado por Silexar Pulse Security Auto-Fixer</em>
  </footer>
</body>
</html>`;
  }

  /**
   * Genera salida para consola
   */
  toConsole(): string {
    const stats = this.report.statistics;
    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║          SECURITY AUTO-FIX REPORT                            ║',
      '╚══════════════════════════════════════════════════════════════╝',
      '',
      `📊 TOTAL ISSUES: ${stats.totalIssues}`,
      `   ✅ Fixed: ${stats.fixedAutomatically}`,
      `   ⚠️  Pending: ${stats.pendingReview}`,
      `   ❌ Failed: ${stats.failed}`,
      `   ⏭️  Skipped: ${stats.skipped}`,
      '',
      `🎯 SUCCESS RATE: ${(stats.successRate * 100).toFixed(1)}%`,
      `⏱️  DURATION: ${(this.report.durationMs / 1000).toFixed(2)}s`,
      '',
      'SEVERITY DISTRIBUTION:',
      `   🔴 HIGH:   ${stats.issuesBySeverity.HIGH.toString().padStart(3)}`,
      `   🟡 MEDIUM: ${stats.issuesBySeverity.MEDIUM.toString().padStart(3)}`,
      `   🔵 LOW:    ${stats.issuesBySeverity.LOW.toString().padStart(3)}`,
      '',
    ];

    if (stats.fixedAutomatically > 0) {
      lines.push(
        'FILES MODIFIED:',
        ...this.report.filesModified.map(f => `   ✓ ${f}`),
        ''
      );
    }

    if (stats.failed > 0) {
      const failed = this.report.results.filter(r => r.status === 'failed');
      lines.push(
        'FAILED FIXES:',
        ...failed.map(f => `   ✗ ${f.issue.filePath}:${f.issue.line} - ${f.error}`),
        ''
      );
    }

    lines.push(
      '────────────────────────────────────────────────────────────────',
      'Report ID: ' + this.report.id,
      'Generated: ' + this.report.timestamp.toISOString()
    );

    return lines.join('\n');
  }

  /**
   * Agrupa resultados por archivo
   */
  private groupResultsByFile(): Map<string, FixResult[]> {
    const grouped = new Map<string, FixResult[]>();
    
    this.report.results.forEach(result => {
      const existing = grouped.get(result.issue.filePath) || [];
      existing.push(result);
      grouped.set(result.issue.filePath, existing);
    });

    // Ordenar por severidad
    for (const [, results] of grouped) {
      results.sort((a, b) => {
        const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return severityOrder[a.issue.severity] - severityOrder[b.issue.severity];
      });
    }

    return grouped;
  }

  /**
   * Obtiene emoji según estado
   */
  private getStatusEmoji(status: FixStatus): string {
    const emojis: Record<FixStatus, string> = {
      applied: '✅',
      failed: '❌',
      skipped: '⏭️',
      pending: '⏳',
      manual_review: '👀',
    };
    return emojis[status];
  }

  /**
   * Genera resultados en HTML
   */
  private generateHTMLResults(): string {
    const grouped = this.groupResultsByFile();
    const sections: string[] = [];

    for (const [file, results] of grouped) {
      const fileSection = [
        `<div class="file-section">`,
        `<h3>${file}</h3>`,
        '<table>',
        '<tr><th>Type</th><th>Severity</th><th>Line</th><th>Status</th><th>Message</th></tr>',
        ...results.map(r => `
          <tr>
            <td><code>${r.issue.type}</code></td>
            <td class="severity-${r.issue.severity.toLowerCase()}">${r.issue.severity}</td>
            <td>${r.issue.line}:${r.issue.column}</td>
            <td class="status-${r.status}">${r.status}</td>
            <td>${r.issue.message}</td>
          </tr>
        `),
        '</table>',
        '</div>',
      ];
      sections.push(fileSection.join(''));
    }

    return sections.join('');
  }

  /**
   * Genera recomendaciones basadas en resultados
   */
  private generateRecommendations(): string {
    const recommendations: string[] = [];
    const stats = this.report.statistics;

    if (stats.issuesBySeverity.HIGH > 0) {
      recommendations.push(
        '🔴 **Prioridad Alta:** Hay issues de severidad HIGH que requieren atención inmediata.'
      );
    }

    if (stats.failed > stats.totalIssues * 0.2) {
      recommendations.push(
        '⚠️ La tasa de fallos es alta (>20%). Considera revisar la configuración del auto-fixer.'
      );
    }

    if (stats.pendingReview > 5) {
      recommendations.push(
        '📋 Hay varios issues pendientes de revisión manual. Programa tiempo para revisarlos.'
      );
    }

    const topIssues = Object.entries(stats.issuesByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    if (topIssues.length > 0) {
      recommendations.push(
        `🎯 **Issues más comunes:** ${topIssues.map(([type, count]) => `${type} (${count})`).join(', ')}. Considera agregar validaciones preventivas.`
      );
    }

    if (stats.successRate < 0.7) {
      recommendations.push(
        '📚 La tasa de éxito es baja. Revisa la documentación de patrones soportados.'
      );
    }

    recommendations.push(
      '🔄 Ejecuta `npm run security:autofix` regularmente para mantener el código limpio.'
    );

    return recommendations.join('\n\n');
  }

  /**
   * Exporta reporte en el formato especificado
   */
  export(): string {
    switch (this.options.format) {
      case 'json':
        return this.toJSON();
      case 'html':
        return this.toHTML();
      case 'console':
        return this.toConsole();
      case 'markdown':
      default:
        return this.toMarkdown();
    }
  }

  /**
   * Obtiene el reporte raw
   */
  getReport(): AutoFixReport {
    return this.report;
  }

  /**
   * Guarda reporte a archivo
   */
  async saveToFile(outputPath: string): Promise<void> {
    const { promises: fs } = await import('fs');
    const content = this.export();
    await fs.writeFile(outputPath, content, 'utf-8');
  }
}

export default AutoFixReportGenerator;
