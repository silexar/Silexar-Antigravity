type Constructor<T = unknown> = new (...args: unknown[]) => T;
type Factory<T = unknown> = () => T;

interface Registration<T = unknown> {
    lifetime: 'singleton' | 'transient';
    factory: Factory<T>;
    instance?: T;
}

class DIContainer {
    private services: Map<string, Registration> = new Map();
    private logger: Console;

    constructor() {
        this.logger = console;
    }

    register<T>(
        token: string,
        factory: Factory<T>,
        lifetime: 'singleton' | 'transient' = 'transient'
    ): void {
        if (this.services.has(token)) {
            this.logger.warn(`[DI] Service "${token}" already registered. Overwriting.`);
        }
        this.services.set(token, { lifetime, factory });
        this.logger.info(`[DI] Registered: ${token} (${lifetime})`);
    }

    registerSingleton<T>(token: string, factory: Factory<T>): void {
        this.register(token, factory, 'singleton');
    }

    registerTransient<T>(token: string, factory: Factory<T>): void {
        this.register(token, factory, 'transient');
    }

    resolve<T>(token: string): T {
        const registration = this.services.get(token);
        if (!registration) {
            throw new Error(`[DI] Service "${token}" not found. Did you forget to register it?`);
        }

        if (registration.lifetime === 'singleton') {
            if (!registration.instance) {
                registration.instance = registration.factory();
            }
            return registration.instance as T;
        }

        return registration.factory() as T;
    }

    has(token: string): boolean {
        return this.services.has(token);
    }

    clear(): void {
        this.services.clear();
        this.logger.info('[DI] Container cleared');
    }
}

export const container = new DIContainer();
export type { DIContainer };
