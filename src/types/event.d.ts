interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    location?: string;
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