import { supabase } from '../lib/supabase';
import { Agent } from '../types';

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }

    return data || [];
  },

  async createAgent(agentData: Omit<Agent, 'id'>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert([agentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      throw error;
    }

    return data;
  },

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      throw error;
    }

    return data;
  },

  async deleteAgent(id: string): Promise<void> {
    // We do soft delete by setting is_active to false, 
    // or we can physically delete it. The user said "los elimino", so let's do hard delete to keep it simple,
    // or soft delete if they might be linked. The schema has is_active.
    // Let's just do physical delete since they don't have relationships yet.
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  }
};
