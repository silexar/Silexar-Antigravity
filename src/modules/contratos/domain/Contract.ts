import { z } from 'zod';

// Value Objects
export const ContractIdSchema = z.string().uuid();
export const ContractNumberSchema = z.string().regex(/^CON-\d{4}-\d{4}$/);

export enum ContractStatus {
    DRAFT = 'borrador',
    REVIEW = 'revision',
    APPROVAL = 'aprobacion',
    SIGNED = 'firmado',
    ACTIVE = 'activo',
    PAUSED = 'pausado',
    FINISHED = 'finalizado',
    CANCELLED = 'cancelado'
}

export interface ContractFinancials {
    grossAmount: number;
    netAmount: number;
    currency: 'CLP' | 'USD' | 'UF';
    tax: number;
}

export class Contract {
    constructor(
        public readonly id: string,
        public readonly number: string,
        public status: ContractStatus,
        public advertiserId: string,
        public financials: ContractFinancials,
        public startDate: Date,
        public endDate: Date,
        public tags: string[] = [],
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) { }

    static create(
        advertiserId: string,
        financials: ContractFinancials,
        startDate: Date,
        endDate: Date
    ): Contract {
        // Tier 0 Validation: Dates
        if (startDate >= endDate) {
            throw new Error("Start date must be before end date");
        }
        // Tier 0 Validation: Amounts
        if (financials.netAmount <= 0) {
            throw new Error("Net amount must be positive");
        }

        const id = crypto.randomUUID();
        const number = `CON-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        return new Contract(
            id,
            number,
            ContractStatus.DRAFT,
            advertiserId,
            financials,
            startDate,
            endDate
        );
    }

    updateStatus(newStatus: ContractStatus) {
        // State machine validation could go here
        this.status = newStatus;
        this.updatedAt = new Date();
    }
}
