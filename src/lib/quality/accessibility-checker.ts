export interface AccessibilityIssue { type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; }
export const checkAccessibility = async (): Promise<AccessibilityIssue[]> => [];
export default { checkAccessibility };