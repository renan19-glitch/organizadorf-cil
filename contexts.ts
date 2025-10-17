import { createContext } from 'react';
import type { User, Bill } from './types';

export const AuthContext = createContext<{
    user: User | null;
    loading: boolean;
    updateUser: (user: Partial<User>) => Promise<void>;
    signOut: () => void;
    forceRevalidate: () => Promise<void>;
} | undefined>(undefined);

export const BillsContext = createContext<{
    bills: Bill[];
    addBill: (bill: Omit<Bill, 'id' | 'isPaid'>) => Promise<void>;
    updateBill: (updatedBill: Bill) => Promise<void>;
    deleteBill: (id: string) => Promise<void>;
    togglePaid: (id: string) => Promise<void>;
    loading: boolean;
} | undefined>(undefined);