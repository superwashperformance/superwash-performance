import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dzxgspbjhbfboakycbff.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SECRET_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eGdzcGJqaGJmYm9ha3ljYmZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA3NzY2NSwiZXhwIjoyMTAwNjUzNjY1fQ.6Scfm23KJz84SxILn7OnzRejGIg_lXyu1CyiJ_dVXgU';

// Cliente autenticado con el usuario real
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Cliente admin solo para setup inicial de datos (crear cliente de prueba)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function runTests() {
  console.log('--- INICIANDO TEST DEL SISTEMA FINANCIERO (10 PRUEBAS) ---\n');

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    console.error('ERROR: Falta configurar TEST_USER_EMAIL y/o TEST_USER_PASSWORD en .env');
    process.exit(1);
  }

  try {
    console.log(`Iniciando sesión como: ${email}...`);
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authErr) throw { step: 'LOGIN', err: authErr };
    console.log('Login exitoso. Continuando con las pruebas...\n');

    // 0. Ensure we have an active cash session for THIS user
    const user_id = authData.user.id;
    let { data: activeSession, error: sessionErr } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('opened_by', user_id)
      .is('closed_at', null)
      .limit(1)
      .single();

    if (sessionErr || !activeSession) {
      console.log('Abriendo sesión de caja para las pruebas...');
      const { data: newSession, error: createSessionErr } = await supabase.rpc('rpc_open_cash_session', {
        p_idempotency_key: crypto.randomUUID()
      });
      if (createSessionErr) throw { step: 'ABRIR SESION', err: createSessionErr };
      activeSession = { id: newSession };
    }
    const sessionId = activeSession.id;
    console.log('Sesión de caja activa:', sessionId);

    // Create test customer
    let { data: customer } = await supabaseAdmin.from('customers').select('id, full_name').limit(1).single();
    if (!customer) {
      customer = { id: crypto.randomUUID(), full_name: 'Test Customer' };
      await supabaseAdmin.from('customers').insert({ id: customer.id, full_name: customer.full_name, document_id: '123', phone: '123' });
    }
    const customerId = customer.id;

    // Create dummy service orders for the test
    const odsContadoId = crypto.randomUUID();
    const odsCreditoId = crypto.randomUUID();
    const odsCredito2Id = crypto.randomUUID();
    
    // We get a dummy vehicle first to satisfy foreign key (if it exists)
    let { data: vehicle } = await supabaseAdmin.from('vehicles').select('id').limit(1).single();
    if (!vehicle) {
      vehicle = { id: crypto.randomUUID() };
      await supabaseAdmin.from('vehicles').insert({ id: vehicle.id, license_plate: 'TEST-123', customer_id: customerId });
    }
    
    await supabaseAdmin.from('service_orders').insert([
      { id: odsContadoId, customer_id: customerId, vehicle_id: vehicle.id, status: 'completed', total_amount: 15000 },
      { id: odsCreditoId, customer_id: customerId, vehicle_id: vehicle.id, status: 'completed', total_amount: 30000 },
      { id: odsCredito2Id, customer_id: customerId, vehicle_id: vehicle.id, status: 'completed', total_amount: 1000 }

    ]);

    // 1. ODS CONTADO (B001)
    console.log('\n--- PRUEBA 1: VENTA DE CONTADO ---');
    const { data: contadoData, error: contadoErr } = await supabase.rpc('rpc_process_contado_sale', {
      p_customer_id: customerId,
      p_order_id: odsContadoId,
      p_total: 100,
      p_payments: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', amount: 100, method: 'efectivo' }],
      p_idempotency_key: crypto.randomUUID()
    });
    if (contadoErr) throw { step: 'PRUEBA 1', err: contadoErr };
    console.log('  -> Contado procesado. Resultado:', contadoData);
    const { data: docContado } = await supabase.from('commercial_documents').select('*').eq('id', contadoData).single();
    console.log(`  -> Generado: ${docContado.document_number} | Total: ${docContado.total_amount}`);

    // 2. ODS CUENTA CORRIENTE (CC002)
    console.log('\n--- PRUEBA 2: VENTA CUENTA CORRIENTE ---');
    const { data: creditoData, error: creditoErr } = await supabase.rpc('rpc_process_credit_sale', {
      p_customer_id: customerId,
      p_order_id: odsCreditoId,
      p_total: 500,
      p_idempotency_key: crypto.randomUUID()
    });
    if (creditoErr) throw { step: 'PRUEBA 2', err: creditoErr };
    const { data: docCredito } = await supabase.from('commercial_documents').select('*').eq('id', creditoData).single();
    console.log(`  -> Generado: ${docCredito.document_number} | Deuda: ${docCredito.total_amount} | Pagado: ${docCredito.paid_amount}`);

    // 3. RECIBO COBRANZA PARCIAL (REC004)
    console.log('\n--- PRUEBA 3: COBRANZA PARCIAL DE CC002 ---');
    const { data: recData, error: recErr } = await supabase.rpc('rpc_process_collection_receipt', {
      p_document_id: docCredito.id,
      p_total: 200,
      p_payments: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', amount: 200, method: 'transferencia' }],
      p_idempotency_key: crypto.randomUUID()
    });
    if (recErr) throw { step: 'PRUEBA 3', err: recErr };
    const { data: docCreditoUpdated } = await supabase.from('commercial_documents').select('*').eq('id', docCredito.id).single();
    console.log(`  -> CC002 actualizado | Pagado: ${docCreditoUpdated.paid_amount} | Saldo restante: ${docCreditoUpdated.total_amount - docCreditoUpdated.paid_amount}`);

    // 4. SEGUNDO ABONO HASTA LLEGAR A CERO
    console.log('\n--- PRUEBA 4: SEGUNDO ABONO HASTA $0 ---');
    const { error: rec2Err } = await supabase.rpc('rpc_process_collection_receipt', {
      p_document_id: docCredito.id,
      p_total: 300, // 500 total - 200 previous
      p_payments: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', amount: 300, method: 'efectivo' }],
      p_idempotency_key: crypto.randomUUID()
    });
    if (rec2Err) throw { step: 'PRUEBA 4', err: rec2Err };
    const { data: docCreditoZero } = await supabase.from('commercial_documents').select('*').eq('id', docCredito.id).single();
    console.log(`  -> CC002 actualizado | Pagado: ${docCreditoZero.paid_amount} | Saldo restante: ${docCreditoZero.total_amount - docCreditoZero.paid_amount}`);

    // 5. SOBREPAGO (Debe fallar)
    console.log('\n--- PRUEBA 5: SOBREPAGO DEBE SER RECHAZADO ---');
    const { error: excesoErr } = await supabase.rpc('rpc_process_collection_receipt', {
      p_document_id: docCredito.id,
      p_total: 10,
      p_payments: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', amount: 10, method: 'efectivo' }],
      p_idempotency_key: crypto.randomUUID()
    });
    if (excesoErr) {
      console.log(`  -> CORRECTO: Error al intentar cobrar en exceso -> ${excesoErr.message}`);
    } else {
      throw { step: 'PRUEBA 5', err: new Error('Se permitió cobrar en exceso!') };
    }

    // 6. NC SOBRE B001
    console.log('\n--- PRUEBA 6: NC003 SOBRE B001 (CONTADO) ---');
    const { error: ncContadoErr } = await supabase.rpc('rpc_create_credit_note', {
      p_original_doc_id: docContado.id,
      p_amount: 50,
      p_refunds: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', method: 'efectivo', amount: 50 }],
      p_idempotency_key: crypto.randomUUID()
    });
    if (ncContadoErr) throw { step: 'PRUEBA 6', err: ncContadoErr };
    const { data: docContadoNC } = await supabase.from('commercial_documents').select('*').eq('id', docContado.id).single();
    console.log(`  -> B001 actualizado | Total: ${docContadoNC.total_amount} | Anulado: ${docContadoNC.annulled_amount}`);

    // 7. NC SUPERIOR AL SALDO (Debe fallar)
    console.log('\n--- PRUEBA 7: NC SUPERIOR AL SALDO DISPONIBLE ---');
    const { error: ncExcesoErr } = await supabase.rpc('rpc_create_credit_note', {
      p_original_doc_id: docContado.id,
      p_amount: 100, // already annulled 50, only 50 left
            p_refunds: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', method: 'efectivo', amount: 100 }],
      p_idempotency_key: crypto.randomUUID()
    });
    if (ncExcesoErr) {
      console.log(`  -> CORRECTO: Error al intentar anular en exceso -> ${ncExcesoErr.message}`);
    } else {
      throw { step: 'PRUEBA 7', err: new Error('Se permitió anular en exceso!') };
    }

    // 8. NC PARCIAL SOBRE CC002
    console.log('\n--- PRUEBA 8: NC PARCIAL SOBRE CC002 ---');
    // We need a new CC002 with debt to test this cleanly, since the other is $0
    const { data: cc2Id } = await supabase.rpc('rpc_process_credit_sale', {
      p_customer_id: customerId, p_order_id: odsCredito2Id, p_total: 1000, p_idempotency_key: crypto.randomUUID()
    });
    const { error: ncCC2Err } = await supabase.rpc('rpc_create_credit_note', {
      p_original_doc_id: cc2Id,
      p_amount: 200,
            p_refunds: null,
      p_idempotency_key: crypto.randomUUID()
    });
    if (ncCC2Err) throw { step: 'PRUEBA 8', err: ncCC2Err };
    const { data: docCC2 } = await supabase.from('commercial_documents').select('*').eq('id', cc2Id).single();
    console.log(`  -> CC002 actualizado | Total: ${docCC2.total_amount} | Anulado: ${docCC2.annulled_amount} | Deuda Restante: ${docCC2.total_amount - docCC2.paid_amount - docCC2.annulled_amount}`);

    // 9. CONCURRENCIA
    console.log('\n--- PRUEBA 9: CONCURRENCIA SIMULTÁNEA ---');
    // Attempt 2 payments of 500 on a debt of 800 simultaneously
    const p1 = supabase.rpc('rpc_process_collection_receipt', {
      p_document_id: cc2Id, p_total: 500, p_payments: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', amount: 500, method: 'efectivo' }], p_idempotency_key: crypto.randomUUID()
    });
    const p2 = supabase.rpc('rpc_process_collection_receipt', {
      p_document_id: cc2Id, p_total: 500, p_payments: [{ account_id: '3335d54f-98eb-45d9-a6ec-fbbc4c8e4f34', amount: 500, method: 'efectivo' }], p_idempotency_key: crypto.randomUUID()
    });
    
    const [res1, res2] = await Promise.all([p1, p2]);
    let successCount = 0;
    let failCount = 0;
    if (!res1.error) successCount++; else failCount++;
    if (!res2.error) successCount++; else failCount++;
    
    console.log(`  -> Intentos: 2 | Exitosos: ${successCount} | Rechazados: ${failCount}`);
    if (successCount > 1) {
      throw { step: 'PRUEBA 9', err: new Error('Se permitieron múltiples pagos concurrentes causando sobrepago!') };
    }
    const { data: docCC2Final } = await supabase.from('commercial_documents').select('*').eq('id', cc2Id).single();
    console.log(`  -> Saldo Final CC002: ${docCC2Final.total_amount - docCC2Final.paid_amount - docCC2Final.annulled_amount}`);

    // 10. CIERRE DE CAJA
    console.log('\n--- PRUEBA 10: CIERRE DE CAJA ---');
    const { data: sessionCloseData, error: sessionCloseErr } = await supabase.rpc('rpc_close_cash_session', {
      p_session_id: sessionId,
      p_declared_amounts: { 'efectivo': 900, 'transferencia': 200 } // Example declaration
    });
    if (sessionCloseErr) throw { step: 'PRUEBA 10', err: sessionCloseErr };
    console.log(`  -> Sesión cerrada exitosamente.`);
    
    const { data: finalSession } = await supabase.from('cash_sessions').select('*').eq('id', sessionId).single();
    console.log(`  -> Totales Calculados (Expected):`, finalSession.expected_amounts);
    console.log(`  -> Diferencia (Differences):`, finalSession.differences);

    console.log('\n🎉 TODAS LAS 10 PRUEBAS PASARON EXITOSAMENTE 🎉');

  } catch (errWrapper) {
    console.error('\n!!! ERROR DURANTE LAS PRUEBAS !!!');
    console.error(`Paso que falló: ${errWrapper.step}`);
    console.error(`Mensaje de Error:`, errWrapper.err?.message || errWrapper.err);
    console.error(`Detalles Completos:`, JSON.stringify(errWrapper.err, null, 2));
  }
}

runTests();
