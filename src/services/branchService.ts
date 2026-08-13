import { supabase } from '../lib/supabase';
import { Branch } from '../types';

export const branchService = {
  async getBranches(): Promise<Branch[]> {
    const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async getActiveBranches(): Promise<Branch[]> {
    const { data, error } = await supabase.from('branches').select('*').eq('is_active', true).order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async createBranch(branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
    const { data, error } = await supabase.from('branches').insert([{
      name: branchData.name,
      address: branchData.address,
      phone: branchData.phone,
      email: branchData.email || null,
      is_active: branchData.is_active !== undefined ? branchData.is_active : true
    }]).select().single();
    if (error) throw error;
    return data;
  },
  async updateBranch(id: string, branchData: Partial<Branch>): Promise<Branch> {
    const { data, error } = await supabase.from('branches').update({
      ...branchData,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
