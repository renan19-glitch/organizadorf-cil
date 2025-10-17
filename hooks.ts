import { useContext } from 'react';
import { AuthContext, BillsContext } from './contexts';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useBills = () => {
    const context = useContext(BillsContext);
    if (context === undefined) {
        throw new Error('useBills must be used within a BillsProvider');
    }
    return context;
};