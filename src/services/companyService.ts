import { supabase } from '../lib/supabase';

export interface CompanySettings {
  id: string;
  name: string;
  document_id: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const companyService = {
  async getCompanySettings(): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching company settings:', error);
      return null;
    }
    
    return data;
  },

  async updateCompanySettings(id: string, updates: Partial<CompanySettings>): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
    
    return data;
  },
  
  async updateFirstCompanySettings(updates: Partial<CompanySettings>): Promise<CompanySettings | null> {
    const existing = await this.getCompanySettings();
    if (existing) {
      return this.updateCompanySettings(existing.id, updates);
    } else {
      return this.createCompanySettings({
        name: updates.name || 'Empresa',
        document_id: updates.document_id || 'J-123',
        address: updates.address,
        phone: updates.phone,
        email: updates.email
      });
    }
  },
  
  async createCompanySettings(settings: Omit<CompanySettings, 'id'>): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('company_settings')
      .insert([settings])
      .select()
      .single();

    if (error) {
      console.error('Error creating company settings:', error);
      throw error;
    }
    
    return data;
  }
};
