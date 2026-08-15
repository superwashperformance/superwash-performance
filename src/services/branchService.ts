import { supabase } from '../lib/supabase';
import { Branch } from '../types';

// Payload sanitized to avoid 'email' column schema cache errors
export const branchService = {
  async getBranches(): Promise<Branch[]> {
    const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async getActiveBranches(): Promise<Branch[]> {
    // Como la columna is_active no existe, devolvemos todas las sedes
    const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async createBranch(branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
    const { data, error } = await supabase.from('branches').insert([{
      name: branchData.name,
      address: branchData.address,
      phone: branchData.phone
    }]).select().single();
    if (error) throw error;
    return data;
  },
  async updateBranch(id: string, branchData: Partial<Branch>): Promise<Branch> {
    // Solo enviamos los campos que existen en la tabla (schema) para evitar errores si llegan datos heredados
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };
    
    if (branchData.name !== undefined) updatePayload.name = branchData.name;
    if (branchData.address !== undefined) updatePayload.address = branchData.address;
    if (branchData.phone !== undefined) updatePayload.phone = branchData.phone;


    const { data, error } = await supabase.from('branches').update(updatePayload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
