with open("src/services/treasuryService.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_func = """  async getTreasuryMovements(limit = 100): Promise<TreasuryMovement[]> {
    const { data, error } = await supabase
      .from('treasury_movements')
      .select(`
        *,
        treasury_accounts (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },"""

new_func = """  async getTreasuryMovements(limit = 100, filters?: { startDate?: string, endDate?: string, accountId?: string }): Promise<TreasuryMovement[]> {
    let query = supabase
      .from('treasury_movements')
      .select(`
        *,
        treasury_accounts (name)
      `);

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate + 'T00:00:00.000Z');
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate + 'T23:59:59.999Z');
    }
    if (filters?.accountId) {
      query = query.eq('treasury_account_id', filters.accountId);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);

    if (error) throw error;
    return data || [];
  },"""

content = content.replace(old_func, new_func)

with open("src/services/treasuryService.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch treasuryService applied.")

with open("src/components/views/TreasuryView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

state_code = """
  // Transfer Form State
"""
new_state_code = """
  // Mayor Filter State
  const [mayorStartDate, setMayorStartDate] = useState('');
  const [mayorEndDate, setMayorEndDate] = useState('');
  const [mayorAccountId, setMayorAccountId] = useState('');

  const fetchMayorMovements = async () => {
    setIsProcessing(true);
    try {
      const movs = await treasuryService.getTreasuryMovements(500, {
        startDate: mayorStartDate,
        endDate: mayorEndDate,
        accountId: mayorAccountId
      });
      setMovements(movs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Transfer Form State
"""
content = content.replace(state_code, new_state_code)


mayor_tab_old = """      {activeTab === 'mayor' && (
        <div className="glass-card p-0 overflow-hidden animate-fade-in border-slate-200">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 font-display text-sm tracking-wider uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-4">FECHA</th>
                <th className="p-4">CUENTA</th>
                <th className="p-4">TIPO</th>
                <th className="p-4">MÉTODO</th>
                <th className="p-4 text-right">MONTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {new Date(m.created_at || '').toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {m.treasury_accounts?.name || m.treasury_account_id}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      (m.type === 'income' || m.type === 'internal_transfer_in') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {(m.type === 'income' || m.type === 'internal_transfer_in') ? 'INGRESO' : 'EGRESO'}
                    </span>
                  </td>
                  <td className="p-4 text-xs capitalize">{m.payment_method?.replace('_', ' ') || ''}</td>
                  <td className={`p-4 text-right font-mono font-bold ${
                    (m.type === 'income' || m.type === 'internal_transfer_in') ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {(m.type === 'income' || m.type === 'internal_transfer_in') ? '+' : '-'}${Math.abs(m.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}"""

mayor_tab_new = """      {activeTab === 'mayor' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="glass-card p-4 border-slate-200 flex flex-col md:flex-row items-end gap-4 bg-slate-50">
            <div className="w-full md:w-auto">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Desde Fecha</label>
              <input type="date" value={mayorStartDate} onChange={e => setMayorStartDate(e.target.value)} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-[#7A1B28] outline-none" />
            </div>
            <div className="w-full md:w-auto">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Hasta Fecha</label>
              <input type="date" value={mayorEndDate} onChange={e => setMayorEndDate(e.target.value)} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-[#7A1B28] outline-none" />
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Cuenta</label>
              <select value={mayorAccountId} onChange={e => setMayorAccountId(e.target.value)} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-bold focus:border-[#7A1B28] outline-none">
                <option value="">-- TODAS LAS CUENTAS --</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <button onClick={fetchMayorMovements} disabled={isProcessing} className="w-full md:w-auto bg-[#7A1B28] hover:bg-[#5c131d] text-white px-6 py-2.5 rounded-lg text-sm font-bold uppercase disabled:opacity-50 transition-colors">
              Filtrar
            </button>
          </div>

          <div className="glass-card p-0 overflow-hidden border-slate-200">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 font-display text-sm tracking-wider uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-4">FECHA</th>
                  <th className="p-4">CUENTA</th>
                  <th className="p-4 text-right">DEBE (INGRESOS)</th>
                  <th className="p-4 text-right">HABER (EGRESOS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movements.map(m => {
                  const isIncome = m.type === 'income' || m.type === 'internal_transfer_in';
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {new Date(m.created_at || '').toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex flex-col">
                          <span>{m.treasury_accounts?.name || m.treasury_account_id}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-normal uppercase">{m.payment_method?.replace('_', ' ') || ''} - {m.source_type}</span>
                        </div>
                      </td>
                      <td className={`p-4 text-right font-mono font-bold ${isIncome ? 'text-emerald-700' : 'text-slate-300'}`}>
                        {isIncome ? `+${Math.abs(m.amount).toFixed(2)}` : '-'}
                      </td>
                      <td className={`p-4 text-right font-mono font-bold ${!isIncome ? 'text-rose-700' : 'text-slate-300'}`}>
                        {!isIncome ? `-${Math.abs(m.amount).toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  )
                })}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No hay movimientos registrados para estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}"""

content = content.replace(mayor_tab_old, mayor_tab_new)

with open("src/components/views/TreasuryView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch TreasuryView applied.")
