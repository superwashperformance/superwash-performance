-- FASE MAESTRA: Sincronización Real-Time Total

-- 1. Asegurar que las tablas principales emitan eventos Realtime
-- Supabase usa una publicacin llamada "supabase_realtime".
-- Debemos aadir todas las tablas que el Frontend necesita sincronizar en vivo.

ALTER PUBLICATION supabase_realtime ADD TABLE service_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_photos;
ALTER PUBLICATION supabase_realtime ADD TABLE order_services;
ALTER PUBLICATION supabase_realtime ADD TABLE damage_markers;
ALTER PUBLICATION supabase_realtime ADD TABLE cash_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE cash_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;

-- Nota: Si alguna de estas tablas ya estaba en la publicacin, PostgreSQL podra emitir un Warning,
-- pero el comando tendr xito.

-- 2. Trigger para actualizar service_orders.updated_at
-- Esto garantiza que si subimos una foto (en order_photos), la orden principal "despierte" 
-- y el Frontend se entere de que debe recargar esa ODS.

CREATE OR REPLACE FUNCTION notify_ods_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualiza el timestamp de la ODS padre
  UPDATE service_orders 
  SET updated_at = NOW() 
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asociar el trigger a las tablas hijas
DROP TRIGGER IF EXISTS trigger_update_ods_on_photo ON order_photos;
CREATE TRIGGER trigger_update_ods_on_photo
AFTER INSERT OR UPDATE OR DELETE ON order_photos
FOR EACH ROW EXECUTE FUNCTION notify_ods_update();

DROP TRIGGER IF EXISTS trigger_update_ods_on_service ON order_services;
CREATE TRIGGER trigger_update_ods_on_service
AFTER INSERT OR UPDATE OR DELETE ON order_services
FOR EACH ROW EXECUTE FUNCTION notify_ods_update();

DROP TRIGGER IF EXISTS trigger_update_ods_on_damage ON damage_markers;
CREATE TRIGGER trigger_update_ods_on_damage
AFTER INSERT OR UPDATE OR DELETE ON damage_markers
FOR EACH ROW EXECUTE FUNCTION notify_ods_update();

