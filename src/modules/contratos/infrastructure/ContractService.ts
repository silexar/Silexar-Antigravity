/**
 * CLIENT-ONLY: This service is for browser use only. Server uses DrizzleContratoRepository.
 *
 * This service stores contracts temporarily in browser localStorage for offline/preview purposes.
 * All server-side contract operations MUST use DrizzleContratoRepository with proper DB persistence.
 */
import { Contract, ContractStatus } from '../domain/Contract';
import { logger } from '@/lib/observability';

// Runtime guard: prevent server-side usage
if (typeof window === 'undefined') {
  throw new Error('ContractService is client-side only. Use DrizzleContratoRepository on the server.');
}

const STORAGE_KEY = 'silexar_contracts_v1';

export class ContractService {
    private contracts: Contract[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Rehydrate dates
                this.contracts = parsed.map((c: { startDate: string; endDate: string; createdAt: string; updatedAt: string; [key: string]: unknown }) => ({
                    ...c,
                    startDate: new Date(c.startDate),
                    endDate: new Date(c.endDate),
                    createdAt: new Date(c.createdAt),
                    updatedAt: new Date(c.updatedAt)
                }));
            } catch (e) {
                logger.error("Failed to load contracts", e instanceof Error ? e : undefined);
                this.contracts = [];
            }
        }
    }

    private saveToStorage() {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.contracts));
    }

    /**
     * WARNING: Dev-only method. Filters in-memory contracts by tenantId.
     * Production MUST use DrizzleContratoRepository with proper DB persistence.
     */
    async getAll(tenantId?: string): Promise<Contract[]> {
        // Simulate network delay for "Tier 0" feel
        await new Promise(resolve => setTimeout(resolve, 400));
        const filtered = tenantId
            ? this.contracts.filter(c => (c as Record<string, unknown>).tenantId === tenantId)
            : this.contracts;
        return [...filtered];
    }

    async create(contract: Contract): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 600));
        this.contracts.push(contract);
        this.saveToStorage();
    }

    async updateStatus(id: string, status: ContractStatus): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));
        const contract = this.contracts.find(c => c.id === id);
        if (contract) {
            contract.status = status;
            contract.updatedAt = new Date();
            this.saveToStorage();
        }
    }

    // AI Simulation
    async analyzeContract(id: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "Cortex Analysis: Contract terms are within optimal range. Risk level: LOW.";
    }
}

export const contractService = new ContractService();
