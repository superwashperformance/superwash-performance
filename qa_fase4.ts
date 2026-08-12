import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestResult {
  Test: string;
  Resultado: string; // CRÍTICO, ALTO, MEDIO, BAJO, PASSED
  Evidencia: string;
  Observación: string;
}

const results: TestResult[] = [];

function record(test: string, status: string, obs: string, evidence: string) {
  results.push({ Test: test, Resultado: status, Observación: obs, Evidencia: evidence });
  console.log(`[${status}] ${test} - ${obs}`);
}

async function runQA() {
  console.log("=== INICIANDO FASE 4 QA INTEGRAL ===");

  // PASO 1 - Verificación de entorno
  try {
    // Attempt Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@superwash.com',
      password: 'admin123'
    });

    if (authError || !authData.user) {
      record('Verificación de entorno: Autenticación', 'CRÍTICO', `Fallo al iniciar sesión: ${authError?.message || 'No user'}`, 'Auth Error');
      return report();
    } else {
      record('Verificación de entorno: Autenticación', 'PASSED', 'Login exitoso', `User ID: ${authData.user.id}`);
    }

    // Verify profile and role
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
      
    if (profError || !profile) {
      record('Verificación de entorno: Perfiles/Roles', 'CRÍTICO', 'No se pudo leer el profile o RLS lo bloquea', profError?.message || 'Not found');
    } else {
      record('Verificación de entorno: Perfiles/Roles', 'PASSED', `Profile obtenido. Rol: ${profile.role}`, `Profile ID: ${profile.id}`);
    }

    // Verify Tables exist (try to read 1 row from each)
    const tables = ['cash_sessions', 'collections', 'collection_payments', 'treasury_movements', 'current_account_movements', 'cash_transactions'];
    for (const t of tables) {
      const { error } = await supabase.from(t).select('id').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is no rows, which is fine
        record(`Verificación de entorno: Tabla ${t}`, 'CRÍTICO', `Error accediendo a tabla ${t}: ${error.message}`, error.code);
      } else {
        record(`Verificación de entorno: Tabla ${t}`, 'PASSED', `Tabla ${t} accesible y RLS permite lectura`, 'Ok');
      }
    }

    // We can't verify RPC existence without calling them, which we will do in PASO 2.
    
    // Check if there is an active session, if not we will open one for the next tests
    let { data: session } = await supabase.from('cash_sessions').select('*').eq('opened_by', authData.user.id).in('status', ['open', 'counting']).limit(1).maybeSingle();

    if (!session) {
      // PASO 2 - Flujo Caja: Apertura
      const idempotencyKey = crypto.randomUUID();
      const { data: openSessionId, error: openError } = await supabase.rpc('rpc_open_cash_session', { p_idempotency_key: idempotencyKey });
      
      if (openError) {
        record('Flujo Caja: Apertura', 'CRÍTICO', `Fallo RPC rpc_open_cash_session: ${openError.message}`, openError.code);
      } else {
        record('Flujo Caja: Apertura', 'PASSED', 'Sesión abierta con éxito', `Session ID: ${openSessionId}`);
        session = { id: openSessionId };
        
        // Intento de segunda apertura
        const { error: secondOpenError } = await supabase.rpc('rpc_open_cash_session', { p_idempotency_key: crypto.randomUUID() });
        if (secondOpenError) {
          record('Flujo Caja: Segunda apertura', 'PASSED', 'PostgreSQL bloqueó correctamente segunda apertura', secondOpenError.message);
        } else {
          record('Flujo Caja: Segunda apertura', 'CRÍTICO', 'PostgreSQL permitió abrir una segunda sesión paralela', 'Se esperaba error de restricción');
        }
      }
    } else {
      record('Flujo Caja: Apertura', 'PASSED', 'Ya existe una sesión abierta, usando existente', `Session ID: ${session.id}`);
    }

    // PASO 2 - Flujo Caja: Cobranza simple & Múltiples medios
    if (session) {
      const customerId = '00000000-0000-0000-0000-000000000001'; // Try a dummy UUID or fetch a real customer
      let realCustomer;
      const { data: custData } = await supabase.from('customers').select('id').limit(1).maybeSingle();
      if (custData) {
        realCustomer = custData.id;
      } else {
        // Just use a random UUID if no customer exists, might fail if foreign key is enforced, but let's see
        realCustomer = crypto.randomUUID();
      }

      // Fetch a treasury account to use
      const { data: accData } = await supabase.from('treasury_accounts').select('id').eq('active', true).limit(1).maybeSingle();
      
      if (accData) {
        const idempotencyKeyCobro = crypto.randomUUID();
        const payments = [
          { account_id: accData.id, amount: 50, method: 'efectivo' },
          { account_id: accData.id, amount: 50, method: 'zelle' }
        ];
        
        const { data: collectionId, error: colError } = await supabase.rpc('rpc_process_collection', {
          p_customer_id: realCustomer,
          p_amount: 100,
          p_payments: payments,
          p_idempotency_key: idempotencyKeyCobro
        });

        if (colError) {
          record('Flujo Caja: Cobranza Múltiples medios', 'CRÍTICO', `Error procesando cobranza: ${colError.message}`, colError.code);
        } else {
          record('Flujo Caja: Cobranza Múltiples medios', 'PASSED', 'Cobranza múltiple procesada', `Collection ID: ${collectionId}`);
          
          // Verificación de collection, collection_payments, treasury_movements, current_account_movements
          const { data: cols } = await supabase.from('collections').select('*').eq('id', collectionId).single();
          const { data: pays } = await supabase.from('collection_payments').select('*').eq('collection_id', collectionId);
          const { data: trea } = await supabase.from('treasury_movements').select('*').eq('source_type', 'collection').eq('source_id', collectionId);
          const { data: curr } = await supabase.from('current_account_movements').select('*').eq('source_type', 'collection').eq('source_id', collectionId);

          if (cols && pays && pays.length === 2 && trea && trea.length === 2 && curr && curr.length === 1) {
            record('Flujo Caja: Verificación de Tablas Financieras', 'PASSED', 'Todos los registros anidados se crearon correctamente', '1 Collection, 2 Payments, 2 Treasury Movs, 1 CA Mov');
          } else {
            record('Flujo Caja: Verificación de Tablas Financieras', 'CRÍTICO', 'Faltan registros financieros', `cols:${!!cols}, pays:${pays?.length}, trea:${trea?.length}, curr:${curr?.length}`);
          }

          // Doble click / reintento con misma idempotency key
          const { error: dupError } = await supabase.rpc('rpc_process_collection', {
            p_customer_id: realCustomer,
            p_amount: 100,
            p_payments: payments,
            p_idempotency_key: idempotencyKeyCobro
          });

          if (dupError) {
            record('Flujo Caja: Idempotencia en cobranza', 'PASSED', 'Bloqueo correcto de duplicados', dupError.message);
          } else {
            record('Flujo Caja: Idempotencia en cobranza', 'CRÍTICO', 'No se bloqueó el reintento (misma key)', 'Transacción duplicada');
          }

          // PASO 3 - Anulación
          const idempotencyKeyCobro2 = crypto.randomUUID();
          const { data: collectionId2, error: col2Error } = await supabase.rpc('rpc_process_collection', {
            p_customer_id: realCustomer,
            p_amount: 100,
            p_payments: payments,
            p_idempotency_key: idempotencyKeyCobro2
          });

          if (collectionId2) {
            const idempotencyKeyAnul = crypto.randomUUID();
            const { error: annulError } = await supabase.rpc('rpc_annul_collection', {
              p_collection_id: collectionId, // anulamos la PRIMERA
              p_reason: 'Prueba de anulación QA',
              p_idempotency_key: idempotencyKeyAnul
            });

            if (annulError) {
              record('Anulación: Ejecución', 'CRÍTICO', `Error anulando colección: ${annulError.message}`, annulError.code);
            } else {
              record('Anulación: Ejecución', 'PASSED', 'Anulación de primera cobranza ejecutada', 'Ok');
              
              // Verificaciones anulación
              const { data: col1 } = await supabase.from('collections').select('status').eq('id', collectionId).single();
              const { data: col2 } = await supabase.from('collections').select('status').eq('id', collectionId2).single();
              const { data: revTrea } = await supabase.from('treasury_movements').select('*').eq('source_type', 'collection').eq('source_id', collectionId).eq('type', 'out');
              const { data: revCurr } = await supabase.from('current_account_movements').select('*').eq('source_type', 'collection_annulment').eq('source_id', collectionId);

              if (col1?.status === 'annulled' && col2?.status === 'valid' && revTrea && revTrea.length === 2 && revCurr && revCurr.length === 1) {
                record('Anulación: Verificación', 'PASSED', 'Contra-asientos creados y status actualizado correctamente; segunda cobranza intacta', 'Ok');
              } else {
                record('Anulación: Verificación', 'CRÍTICO', 'Los contra-asientos no cuadran o la segunda cobranza fue afectada', `col1:${col1?.status} col2:${col2?.status}`);
              }
            }
          }
        }
      } else {
        record('Verificación de entorno: Cuentas', 'CRÍTICO', 'No hay cuentas de tesorería para operar', 'Se requiere al menos 1 cuenta activa');
      }
    }

    // PASO 4 - Transferencia
    const { data: accs } = await supabase.from('treasury_accounts').select('id, balance').eq('active', true).limit(2);
    if (accs && accs.length >= 2) {
      const fromAcc = accs[0];
      const toAcc = accs[1];
      const transferKey = crypto.randomUUID();
      
      const { data: transferOutId, error: transError } = await supabase.rpc('rpc_internal_transfer', {
        p_from_account_id: fromAcc.id,
        p_to_account_id: toAcc.id,
        p_amount: 10,
        p_method: 'transferencia',
        p_session_id: session?.id || null,
        p_idempotency_key: transferKey
      });

      if (transError) {
        record('Transferencia: Ejecución', 'CRÍTICO', `Error en transferencia: ${transError.message}`, transError.code);
      } else {
        record('Transferencia: Ejecución', 'PASSED', 'Transferencia interna ejecutada', `Out ID: ${transferOutId}`);
        // Verificaciones
        const { data: tOut } = await supabase.from('treasury_movements').select('*').eq('id', transferOutId).single();
        const { data: tIn } = await supabase.from('treasury_movements').select('*').eq('source_type', 'internal_transfer').eq('source_id', transferOutId).eq('type', 'in').single();
        
        if (tOut && tIn && tOut.amount === -10 && tIn.amount === 10) {
          record('Transferencia: Verificación', 'PASSED', 'Egreso e ingreso cuadran perfectamente. Sin impacto en CC.', 'Ok');
        } else {
          record('Transferencia: Verificación', 'CRÍTICO', 'Movimientos de transferencia no cuadran', 'Error lógico');
        }
      }
    } else {
      record('Transferencia: Ejecución', 'ALTO', 'No hay 2 cuentas para probar transferencia', 'Faltan datos');
    }

    // PASO 5 - Cierre
    if (session) {
      const closeKey = crypto.randomUUID();
      const declared = { 'efectivo': 50, 'zelle': 50 }; // Asumimos algo
      const { error: closeError } = await supabase.rpc('rpc_close_cash_session', {
        p_session_id: session.id,
        p_declared_amounts: declared,
        p_idempotency_key: closeKey
      });

      if (closeError) {
        record('Cierre de Caja', 'CRÍTICO', `Error al cerrar caja: ${closeError.message}`, closeError.code);
      } else {
        record('Cierre de Caja', 'PASSED', 'Caja cerrada exitosamente', 'Ok');
        
        // Imposibilidad de nuevas operaciones
        const afterCloseKey = crypto.randomUUID();
        const { error: opsError } = await supabase.rpc('rpc_process_collection', {
          p_customer_id: crypto.randomUUID(),
          p_amount: 10,
          p_payments: [],
          p_idempotency_key: afterCloseKey
        });

        if (opsError) {
          record('Cierre de Caja: Imposibilidad oper.', 'PASSED', 'Se rechazó operación con caja cerrada', opsError.message);
        } else {
          record('Cierre de Caja: Imposibilidad oper.', 'CRÍTICO', 'Se permitió operar sin sesión abierta (o con caja cerrada)', 'Fallo en restricción de sesión');
        }
      }
    }

    // PASO 6 - Legacy
    const { error: legacyInsertError } = await supabase.from('cash_transactions').insert([{ amount: 100, type: 'payment', paymentMethod: 'efectivo', date: new Date().toISOString(), customerName: 'Test' }]);
    if (legacyInsertError) {
      record('Legacy Freeze', 'PASSED', 'cash_transactions bloqueó INSERT', legacyInsertError.message);
    } else {
      record('Legacy Freeze', 'CRÍTICO', 'cash_transactions permitió INSERT', 'RLS falló');
    }

    // PASO 9 - Integridad
    // Not easy to test SUM programmatically via RPC but we can try summing via data fetch.
    const { data: cols } = await supabase.from('collections').select('id, total_amount, status');
    const { data: pays } = await supabase.from('collection_payments').select('collection_id, amount');
    let integrityPassed = true;
    let integrityIssue = '';

    if (cols && pays) {
      for (const c of cols) {
        const sum = pays.filter(p => p.collection_id === c.id).reduce((a,b) => a + b.amount, 0);
        if (sum !== c.total_amount) {
          integrityPassed = false;
          integrityIssue = `Colección ${c.id} tiene total ${c.total_amount} pero la suma de pagos es ${sum}`;
          break;
        }
      }
      if (integrityPassed) {
        record('Integridad Financiera: Cuadratura', 'PASSED', 'Las sumas de collection_payments coinciden con collections.total_amount', 'Ok');
      } else {
        record('Integridad Financiera: Cuadratura', 'CRÍTICO', 'Descuadre detectado', integrityIssue);
      }
    }

  } catch (err: any) {
    record('Error global en QA', 'CRÍTICO', err.message, err.stack);
  }

  report();
}

function report() {
  console.log("\n=============================");
  console.log("REPORTE DE QA INTEGRAL");
  console.log("=============================\n");
  
  const markdown = [
    '| Test | Resultado | Evidencia | Observación |',
    '|---|---|---|---|'
  ];

  results.forEach(r => {
    markdown.push(`| ${r.Test} | **${r.Resultado}** | ${r.Evidencia} | ${r.Observación} |`);
  });

  console.log(markdown.join('\n'));
}

runQA();
