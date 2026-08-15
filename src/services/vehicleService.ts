import { supabase } from '../lib/supabase';
import { Vehicle } from '../types';

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      plate: d.plate,
      brand: d.brand,
      model: d.model,
      year: d.year,
      color: d.color,
      customerId: d.owner_id
    }));
  },

  async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        owner_id: vehicle.customerId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      return null;
    }

    return {
      id: data.id,
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      color: data.color,
      customerId: data.owner_id
    };
  }
};
