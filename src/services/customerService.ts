import { supabase } from '../lib/supabase';
import { Customer } from '../types';

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      documentId: d.document_id,
      fullName: d.full_name,
      phone: d.phone,
      email: d.email,
      address: d.address,
      createdAt: d.created_at
    }));
  },

  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        document_id: customer.documentId,
        full_name: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return null;
    }

    return {
      id: data.id,
      documentId: data.document_id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      createdAt: data.created_at || new Date().toISOString()
    };
  },

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<boolean> {
    const { error } = await supabase
      .from('customers')
      .update({
        document_id: customer.documentId,
        full_name: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating customer:', error);
      return false;
    }
    return true;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
    return true;
  }
};
