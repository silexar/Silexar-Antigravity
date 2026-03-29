/**
 * 🛡️ VALUE OBJECT: UserRole
 * 
 * Define los niveles de acceso jerárquicos para el sistema Zero-Trust.
 * 
 * @tier TIER_0_SECURITY
 */

export enum UserRole {
    JUNIOR_EXECUTIVE = 'JUNIOR_EXECUTIVE',
    SENIOR_EXECUTIVE = 'SENIOR_EXECUTIVE',
    COMMERCIAL_MANAGER = 'COMMERCIAL_MANAGER',
    ADMINISTRATOR = 'ADMINISTRATOR'
}

export const RolePermissions = {
    [UserRole.JUNIOR_EXECUTIVE]: {
        canVerifyOwn: true,
        canVerifyAll: false,
        canDownloadEvidence: true,
        canGenerateCertificate: false,
        canConfigureAlerts: false,
        viewDetailedAnalytics: false
    },
    [UserRole.SENIOR_EXECUTIVE]: {
        canVerifyOwn: true,
        canVerifyAll: false,
        canDownloadEvidence: true,
        canGenerateCertificate: true,
        canConfigureAlerts: true,
        viewDetailedAnalytics: false
    },
    [UserRole.COMMERCIAL_MANAGER]: {
        canVerifyOwn: true,
        canVerifyAll: true,
        canDownloadEvidence: true,
        canGenerateCertificate: true,
        canConfigureAlerts: true,
        viewDetailedAnalytics: true,
        canOverride: true
    },
    [UserRole.ADMINISTRATOR]: {
        canVerifyOwn: true,
        canVerifyAll: true,
        canDownloadEvidence: true,
        canGenerateCertificate: true,
        canConfigureAlerts: true,
        viewDetailedAnalytics: true,
        canOverride: true,
        canConfigureSystem: true,
        canAuditLogs: true
    }
};
