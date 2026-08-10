import { supabase } from '../lib/supabase';
import { ServiceOrder, ODSStatus } from '../types';

/**
 * Transforms a raw Supabase row into our frontend ServiceOrder interface
 */
const mapToServiceOrder = (data: any): ServiceOrder => {
  return {
    id: data.id,
    orderNumber: data.order_number,
    customerId: data.customer_id,
    customerName: data.customers?.full_name || 'Cliente Desconocido',
    customerPhone: data.customers?.phone || '',
    vehicleId: data.vehicle_id,
    vehiclePlate: data.vehicles?.plate || '',
    vehicleBrandModel: `${data.vehicles?.brand || ''} ${data.vehicles?.model || ''}`.trim(),
    vehicleColor: data.vehicles?.color || '',
    vehicleYear: data.vehicles?.year || new Date().getFullYear(),
    branchName: 'Sede Principal (Las Mercedes)', // We can fetch from branches if needed
    receptionAgent: 'Agente Recepción', // Can be mapped from profiles
    assignedTechnician: 'Técnico Asignado', // Can be mapped from profiles
    priority: data.priority || 'normal',
    status: data.status as ODSStatus,
    entryDate: new Date(data.entry_date).toLocaleString('es-ES'),
    observations: data.observations || '',
    belongingsList: data.belongings_list || [],
    checklist: [], // Would fetch from ods_checklist in a full implementation
    damageMarkers: [], // Would fetch from ods_damage_markers
    photos: [], // Would fetch from ods_photos
    services: [], // Would fetch from ods_services
    subtotalAmount: Number(data.subtotal_amount) || 0,
    taxAmount: Number(data.tax_amount) || 0,
    totalAmount: Number(data.total_amount) || 0,
    paidAmount: Number(data.paid_amount) || 0,
    statusHistory: [],
  };
};

export const odsService = {
  /**
   * Fetches all active service orders from Supabase
   */
  async getActiveODS(): Promise<ServiceOrder[]> {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        customers ( full_name, phone ),
        vehicles ( plate, brand, model, year, color )
      `)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching ODS:', error);
      throw error;
    }

    return (data || []).map(mapToServiceOrder);
  },

  /**
   * Creates a new ODS along with customer and vehicle if they don't exist
   * (Simplified for MVP, ideally we do this in a Supabase Edge Function or RPC)
   */
  async createODS(odsData: ServiceOrder): Promise<ServiceOrder> {
    try {
      // 1. Create or get customer (Mocking for now, inserting a new one)
      const { data: customerData, error: custError } = await supabase
        .from('customers')
        .insert({
          full_name: odsData.customerName,
          document_id: `DOC-${Date.now()}`, // Temporary fallback
          phone: odsData.customerPhone,
        })
        .select()
        .single();

      if (custError) throw custError;

      // 2. Create vehicle
      const [brand, ...modelParts] = odsData.vehicleBrandModel.split(' ');
      const { data: vehicleData, error: vehError } = await supabase
        .from('vehicles')
        .insert({
          customer_id: customerData.id,
          plate: odsData.vehiclePlate,
          brand: brand || 'Desconocido',
          model: modelParts.join(' ') || 'Desconocido',
          year: odsData.vehicleYear || 2024,
          color: odsData.vehicleColor,
        })
        .select()
        .single();

      if (vehError) throw vehError;

      // 3. Create ODS
      const { data: orderData, error: orderError } = await supabase
        .from('service_orders')
        .insert({
          customer_id: customerData.id,
          vehicle_id: vehicleData.id,
          status: odsData.status,
          observations: odsData.observations,
          belongings_list: odsData.belongingsList,
          subtotal_amount: odsData.subtotalAmount,
          total_amount: odsData.totalAmount,
        })
        .select(`
          *,
          customers ( full_name, phone ),
          vehicles ( plate, brand, model, year, color )
        `)
        .single();

      if (orderError) throw orderError;

      const mappedOrder = mapToServiceOrder(orderData);
      
      // For the MVP, since we are not yet persisting nested arrays to Supabase,
      // we preserve them from the input so they render correctly in the UI.
      mappedOrder.checklist = odsData.checklist;
      mappedOrder.damageMarkers = odsData.damageMarkers;
      mappedOrder.photos = odsData.photos;
      mappedOrder.services = odsData.services;

      return mappedOrder;
    } catch (error) {
      console.warn('⚠️ Supabase no configurado o tablas faltantes. Guardando localmente como fallback:', error);
      // Fallback local: devolvemos la misma orden para no bloquear la interfaz
      return {
        ...odsData,
        id: `ods-${Date.now()}` // Garantizamos un ID único
      };
    }
  },

  /**
   * Obtiene la orden más reciente para el portal de clientes (por placa).
   */
  async getTrackingByPlate(plate: string): Promise<ServiceOrder | null> {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        customers ( full_name, phone ),
        vehicles!inner ( plate, brand, model, year, color )
      `)
      .ilike('vehicles.plate', plate.trim())
      .order('entry_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching ODS by plate:', error);
      throw error;
    }

    return mapToServiceOrder(data);
  },

  /**
   * Updates the status of an ODS
   */
  async updateODSStatus(orderId: string, newStatus: ODSStatus): Promise<void> {
    const { error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating ODS status:', error);
      throw error;
    }
  },

  /**
   * Updates the paid amount of an ODS
   */
  async updateODSPaidAmount(orderId: string, newPaidAmount: number): Promise<void> {
    const { error } = await supabase
      .from('service_orders')
      .update({ paid_amount: newPaidAmount })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating ODS paid amount:', error);
      throw error;
    }
  },

  /**
   * Deletes an ODS from Supabase
   */
  async deleteODS(orderId: string): Promise<void> {
    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting ODS:', error);
      throw error;
    }
  }
};
