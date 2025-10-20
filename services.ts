import { supabase } from './src/integrations/supabase/client';
import type { Subscription, Bill } from './types';

// --- Supabase Service ---
export const supabaseService = {
  // AUTH
  signIn: ({ email, password }: any) => {
    return supabase.auth.signInWithPassword({ email, password });
  },
  signOut: () => {
    return supabase.auth.signOut({ scope: 'global' });
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
  updateUserPassword: (password: string) => {
    // This now calls the secure Edge Function
    return supabase.functions.invoke('update-user-password', {
        body: { password },
    });
  },
  sendPasswordResetEmail: (email: string) => {
    const redirectUrl = `${window.location.origin}/update-password`;
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
  },
  
  // PROFILE
  getProfile: (userId: string) => {
    return supabase.from('profiles').select('*').eq('id', userId).single();
  },
  updateProfile: (userId: string, profileData: any) => {
    const { id, ...updateData } = profileData;
    return supabase.from('profiles').update(updateData).eq('id', userId).select().single();
  },

  // BILLS
  getBills: (userId: string) => {
    return supabase.from('bills').select('*').eq('user_id', userId).order('due_date', { ascending: true });
  },
  addBill: (billData: any) => {
    return supabase.from('bills').insert(billData).select().single();
  },
  updateBill: (billId: string, updateData: any) => {
    return supabase.from('bills').update(updateData).eq('id', billId).select().single();
  },
  deleteBill: (billId: string) => {
    return supabase.from('bills').delete().eq('id', billId);
  },

  // CATEGORIES
  getCategories: (userId: string) => {
    return supabase.from('categories').select('*').eq('user_id', userId).order('name', { ascending: true });
  },
  addCategory: (categoryData: { user_id: string; name: string }) => {
    return supabase.from('categories').insert(categoryData).select().single();
  },
  deleteCategory: (categoryId: string) => {
    return supabase.from('categories').delete().eq('id', categoryId);
  },
};