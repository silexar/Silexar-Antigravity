export interface QualityIssue {
    file: string;
    line: number;
    rule: string;
    severity: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
}

export interface ValidationResult {
    passed: boolean;
    score: number;
    issues: QualityIssue[];
}

class CodeQualityValidatorImpl {
    async validate(filePath: string, content: string): Promise<ValidationResult> {
        const issues: QualityIssue[] = [];
        const lines = content.split('\n');
        
        lines.forEach((line, i) => {
            if (line.length > 120) {
                issues.push({ file: filePath, line: i + 1, rule: 'max-line-length', severity: 'WARNING', message: 'Line too long' });
            }
        });

        return { passed: issues.length === 0, score: 100 - issues.length * 5, issues };
    }

    async validateAll(files: { path: string; content: string }[]): Promise<ValidationResult[]> {
        return Promise.all(files.map(f => this.validate(f.path, f.content)));
    }

    getScore(results: ValidationResult[]): number {
        return results.reduce((sum, r) => sum + r.score, 0) / results.length;
    }
}

export const CodeQualityValidator = new CodeQualityValidatorImpl();
export default CodeQualityValidator;