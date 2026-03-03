interface Event {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    location?: string;
    type: 'payment' | 'task';
    value?: number | string;
    color?: string;
    paymentInfo?: PaymentData;
    isRecurring?: boolean;
    recurrence?: RecurringEvent;
}

interface PaymentData {
    amount: number;
    currency: string;
    method: string;
    transactionId?: string;
}

interface RecurringEvent {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
}