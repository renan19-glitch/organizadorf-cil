export interface User {
  id: string;
  email: string;
  name: string;
  subscription_status: string;
  plan_name?: string;
  next_billing_date?: string;
  subscriber_id?: string;
}

export interface Bill {
  id: string;
  name: string;
  value: number;
  dueDate: Date;
  category: string;
  observations: string;
  isPaid: boolean;
  isRecurring: boolean;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
}

export interface Subscription {
  planName: string;
  status: 'active' | 'inactive';
  nextBillingDate: Date;
}

export enum BillStatus {
  Overdue = 'overdue',
  DueToday = 'due_today',
  Upcoming = 'upcoming',
  Paid = 'paid',
}