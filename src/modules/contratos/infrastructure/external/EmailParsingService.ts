export interface ParsedEmail {
    from: string;
    subject: string;
    body: string;
    attachments: string[];
    extractedData: Record<string, string>;
}

export class EmailParsingService {
    async parse(rawEmail: string): Promise<ParsedEmail> {
        const lines = rawEmail.split('\n');
        return {
            from: lines[0] || 'unknown@email.com',
            subject: lines[1] || 'No subject',
            body: lines.slice(2).join('\n'),
            attachments: [],
            extractedData: {}
        };
    }

    async extractContratoData(email: ParsedEmail): Promise<Record<string, string>> {
        return {
            from: email.from,
            subject: email.subject,
            bodyLength: String(email.body.length)
        };
    }

    async classifyIntent(subject: string, body: string): Promise<string> {
        const combined = `${subject} ${body}`.toLowerCase();
        if (combined.includes('urgente')) return 'URGENT';
        if (combined.includes('renovar')) return 'RENEWAL';
        return 'GENERAL';
    }
}

export default new EmailParsingService();