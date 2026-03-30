export interface BetterAuthSession { userId: string; token: string; expiresAt: Date; }
export const createAuthClient = () => ({ signIn: async () => null, signOut: async () => true, getSession: async () => null as BetterAuthSession | null });
export const betterAuthClient = createAuthClient();
export default betterAuthClient;
