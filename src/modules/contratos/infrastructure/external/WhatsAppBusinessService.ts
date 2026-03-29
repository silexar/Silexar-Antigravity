/**
 * SILEXAR PULSE - TIER0+ WHATSAPP BUSINESS SERVICE
 * Servicio de WhatsApp Business (Frontend Mock)
 */

export interface WhatsAppMessage {
    readonly id: string;
    readonly to: string;
    readonly content: string;
    readonly type: 'TEXT' | 'TEMPLATE' | 'MEDIA';
    readonly status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
}

export interface WhatsAppTemplate {
    readonly id: string;
    readonly name: string;
    readonly language: string;
    readonly components: unknown[];
}

class WhatsAppBusinessServiceImpl {
    async sendMessage(_to: string, _content: string): Promise<{ success: boolean; messageId?: string }> {
        return { success: true, messageId: `wa_${Date.now()}` };
    }

    async sendTemplate(_to: string, _templateId: string, _params?: Record<string, string>): Promise<{ success: boolean; messageId?: string }> {
        return { success: true, messageId: `wa_${Date.now()}` };
    }

    async getMessageStatus(_messageId: string): Promise<WhatsAppMessage | null> {
        return null;
    }

    async getTemplates(): Promise<WhatsAppTemplate[]> {
        return [];
    }
}

export const WhatsAppBusinessService = new WhatsAppBusinessServiceImpl();
export default WhatsAppBusinessService;