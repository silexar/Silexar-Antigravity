export interface PlatformConfig { name: string; credentials: Record<string, string>; }
class DigitalPlatformsManagerImpl {
    async connect(): Promise<boolean> { return true; }
    async disconnect(): Promise<void> { /* Disconnect */ }
    async getPlatforms(): Promise<string[]> { return ['facebook', 'google', 'linkedin']; }
}
export const DigitalPlatformsManager = new DigitalPlatformsManagerImpl();
export default DigitalPlatformsManager;