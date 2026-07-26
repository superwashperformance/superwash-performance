import { supabase } from '../lib/supabase';
import { InventoryItem, InventoryCategory } from '../types';

/**
 * Transforms a raw Supabase row into our frontend InventoryItem interface
 */
const mapToInventoryItem = (data: any): InventoryItem => {
  return {
    id: data.id,
    sku: data.sku,
    name: data.name,
    category: data.category as InventoryCategory,
    stock: Number(data.stock),
    minStock: Number(data.min_stock),
    unitCost: Number(data.unit_cost),
    unitOfMeasure: data.unit_measure,
    responsiblePerson: data.responsible_person || 'Detailer Principal',
    lastUpdated: new Date(data.last_updated).toLocaleString('es-ES'),
  };
};

export const inventoryService = {
  /**
   * Fetches all inventory items
   */
  async getInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    return (data || []).map(mapToInventoryItem);
  },

  /**
   * Updates the stock of an inventory item
   */
  async updateStock(itemId: string, newStock: number): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .update({ 
        stock: newStock,
        last_updated: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  /**
   * Deletes an inventory item from Supabase
   */
  async deleteItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  /**
   * Optional: Seeds the database with mock data if it's empty.
   */
  async seedMockDataIfNeeded(mockData: InventoryItem[]): Promise<void> {
    const { count, error } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error checking inventory count:', error);
      return;
    }

    if (count === 0) {
      const rows = mockData.map(item => ({
        // We let Supabase generate the ID if we want, or use the mock IDs. 
        // Using mock IDs might conflict with UUID format if they are just "1", "2". 
        // The mock data uses "INV-..." which is NOT a UUID.
        // The table schema expects UUID for id. So we omit id.
        category: item.category,
        sku: item.sku,
        name: item.name,
        stock: item.stock,
        min_stock: item.minStock,
        unit_cost: item.unitCost,
        unit_of_measure: item.unitOfMeasure,
        responsible_person: item.responsiblePerson
      }));

      const { error: insertError } = await supabase.from('inventory').insert(rows);
      if (insertError) {
        console.error('Error seeding inventory:', insertError);
      } else {
        console.log('Inventory mock data seeded successfully!');
      }
    }
  }
};
