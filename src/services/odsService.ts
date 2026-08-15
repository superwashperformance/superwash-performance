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
    branchId: data.branch_id || undefined,
    branchName: data.branches?.name || 'Sede Principal (Las Mercedes)',
    receptionAgent: 'Agente Recepción', // Can be mapped from profiles
    assignedTechnician: 'Técnico Asignado', // Can be mapped from profiles
    priority: data.priority || 'normal',
    status: data.status as ODSStatus,
    entryDate: new Date(data.entry_date).toLocaleString('es-ES'),
    observations: data.observations || '',
    belongingsList: data.belongings_list || [],
    checklist: (data.checklist_items || []).map((item: any) => ({
      id: item.id,
      key: item.item_key,
      label: item.label,
      condition: item.condition,
      notes: item.notes,
    })),
    damageMarkers: (data.damage_markers || []).map((marker: any) => ({
      id: marker.id,
      x: Number(marker.x_pos),
      y: Number(marker.y_pos),
      view: marker.view_name,
      type: marker.damage_type,
      severity: marker.severity,
      description: marker.description,
    })),
    photos: (data.order_photos || []).map((photo: any) => ({
      id: photo.id,
      photoUrl: photo.photo_url,
      category: photo.category,
      caption: photo.caption,
      createdAt: new Date(photo.created_at).toLocaleTimeString(),
    })),
    services: (data.order_services || []).map((srv: any) => ({
      serviceId: srv.id, // we map table ID to serviceId for UI list
      serviceName: srv.service_name,
      category: srv.category,
      unitPrice: Number(srv.unit_price),
      quantity: Number(srv.quantity),
      totalPrice: Number(srv.total_price),
    })),
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
        branches ( name ),
        customers ( full_name, phone ),
        vehicles ( plate, brand, model, year, color ),
        order_photos ( id, photo_url, category, caption, created_at ),
        order_services ( id, service_name, category, unit_price, quantity, total_price ),
        checklist_items ( id, item_key, label, condition, notes ),
        damage_markers ( id, x_pos, y_pos, view_name, damage_type, severity, description )
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
      let finalCustomerId = odsData.customerId;
      if (!finalCustomerId || finalCustomerId.startsWith('cust-') || finalCustomerId.length < 10) {
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
        finalCustomerId = customerData.id;
      }

      let finalVehicleId = odsData.vehicleId;
      if (!finalVehicleId || finalVehicleId.startsWith('veh-') || finalVehicleId.length < 10) {
        // 2. Create vehicle
        const [brand, ...modelParts] = odsData.vehicleBrandModel.split(' ');
        const { data: vehicleData, error: vehError } = await supabase
          .from('vehicles')
          .insert({
            customer_id: finalCustomerId,
            plate: odsData.vehiclePlate,
            brand: brand || 'Desconocido',
            model: modelParts.join(' ') || 'Desconocido',
            year: odsData.vehicleYear || 2024,
            color: odsData.vehicleColor,
          })
          .select()
          .single();

        if (vehError) throw vehError;
        finalVehicleId = vehicleData.id;
      }

      // 3. Create ODS
      const { data: orderData, error: orderError } = await supabase
        .from('service_orders')
        .insert({
          customer_id: finalCustomerId,
          vehicle_id: finalVehicleId,
          branch_id: odsData.branchId || null,
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

      const orderId = orderData.id;

      // 4. Insert nested records
      if (odsData.photos && odsData.photos.length > 0) {
        const photosPayload = odsData.photos.map((p) => ({
          order_id: orderId,
          photo_url: p.photoUrl,
          category: p.category,
          caption: p.caption,
        }));
        await supabase.from('order_photos').insert(photosPayload);
      }

      if (odsData.services && odsData.services.length > 0) {
        const servicesPayload = odsData.services.map((s) => ({
          order_id: orderId,
          service_name: s.serviceName,
          category: s.category,
          unit_price: s.unitPrice,
          quantity: s.quantity,
          total_price: s.totalPrice,
        }));
        await supabase.from('order_services').insert(servicesPayload);
      }

      if (odsData.checklist && odsData.checklist.length > 0) {
        const checklistPayload = odsData.checklist.map((c) => ({
          order_id: orderId,
          item_key: c.key,
          label: c.label,
          condition: c.condition,
          notes: c.notes || '',
        }));
        await supabase.from('checklist_items').insert(checklistPayload);
      }

      if (odsData.damageMarkers && odsData.damageMarkers.length > 0) {
        const damagePayload = odsData.damageMarkers.map((d) => ({
          order_id: orderId,
          x_pos: d.x,
          y_pos: d.y,
          view_name: d.view,
          damage_type: d.type,
          severity: d.severity,
          description: d.description,
        }));
        await supabase.from('damage_markers').insert(damagePayload);
      }

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
        vehicles!inner ( plate, brand, model, year, color ),
        order_photos ( id, photo_url, category, caption, created_at ),
        order_services ( id, service_name, category, unit_price, quantity, total_price ),
        checklist_items ( id, item_key, label, condition, notes ),
        damage_markers ( id, x_pos, y_pos, view_name, damage_type, severity, description )
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
   * Deletes a photo from an ODS
   */
  async addPhotoToOrder(orderId: string, photoUrl: string, category: string, caption: string): Promise<any> {
    const { data, error } = await supabase.from('order_photos').insert({
      order_id: orderId,
      photo_url: photoUrl,
      category: category,
      caption: caption,
    }).select().single();
    
    if (error) {
      console.error('Error adding photo to order:', error);
      throw error;
    }
    
    return {
      id: data.id,
      photoUrl: data.photo_url,
      category: data.category,
      caption: data.caption,
      createdAt: new Date(data.created_at).toLocaleTimeString('es-ES')
    };
  },

  async deletePhoto(photoId: string): Promise<void> {
    const { error } = await supabase
      .from('order_photos')
      .delete()
      .eq('id', photoId);

    if (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  /**
   * Deletes an ODS from Supabase
   */
  async deleteODS(orderId: string, photos: { photoUrl: string }[] = []): Promise<void> {
    // 1. Eliminar registro en base de datos primero
    // Si RLS falla, esto arrojará error (o afectará 0 filas, pero lo controlaremos)
    const { error, count } = await supabase
      .from('service_orders')
      .delete({ count: 'exact' })
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting ODS:', error);
      throw error;
    }

    // 2. Si count es 0, significa que no se borr (ej. por RLS o no existe)
    if (count === 0) {
      throw new Error('No se pudo eliminar la ODS. Verifica tus permisos o si la ODS existe.');
    }

    // 3. Si llegamos aqu, el ODS se borr exitosamente de BD.
    // Ahora intentamos borrar las imgenes de Storage.
    if (photos && photos.length > 0) {
      const pathsToDelete = photos.map(p => {
        const basePath = '/ods-photos/';
        const index = p.photoUrl.indexOf(basePath);
        return index !== -1 ? p.photoUrl.substring(index + basePath.length) : null;
      }).filter(p => p !== null) as string[];

      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage.from('ods-photos').remove(pathsToDelete);
        if (storageError) {
          console.error('Error eliminando fotos del storage:', storageError);
          // ODS se borr pero Storage fall
          throw new Error('SUCCESS_DB_FAIL_STORAGE');
        }
      }
    }
  },

  /**
   * Adds an extra service to an existing ODS
   */
  async addExtraService(orderId: string, serviceName: string, price: number, currentSubtotal: number, currentTotal: number): Promise<{ id: string }> {
    // 1. Insert into order_services
    const { data: serviceData, error: serviceError } = await supabase
      .from('order_services')
      .insert({
        order_id: orderId,
        service_name: serviceName,
        category: 'extra',
        unit_price: price,
        quantity: 1,
        total_price: price
      })
      .select('id')
      .single();

    if (serviceError) {
      console.error('Error adding extra service:', serviceError);
      throw serviceError;
    }

    // 2. Update service_orders amounts
    const { error: updateError } = await supabase
      .from('service_orders')
      .update({
        subtotal_amount: currentSubtotal + price,
        total_amount: currentTotal + price
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating ODS amounts:', updateError);
      throw updateError;
    }
    
    return serviceData;
  },

  /**
   * Updates an existing service in an ODS
   */
  async updateService(orderId: string, serviceId: string, serviceName: string, unitPrice: number, quantity: number, totalPrice: number, newSubtotal: number, newTotal: number): Promise<void> {
    // 1. Update order_services
    const { error: serviceError } = await supabase
      .from('order_services')
      .update({
        service_name: serviceName,
        unit_price: unitPrice,
        quantity: quantity,
        total_price: totalPrice
      })
      .eq('id', serviceId);

    if (serviceError) {
      console.error('Error updating service:', serviceError);
      throw serviceError;
    }

    // 2. Update service_orders amounts
    const { error: updateError } = await supabase
      .from('service_orders')
      .update({
        subtotal_amount: newSubtotal,
        total_amount: newTotal
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating ODS amounts:', updateError);
      throw updateError;
    }
  }
};
