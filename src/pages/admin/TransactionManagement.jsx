import { useEffect, useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import debounce from 'lodash.debounce';
import { useToast } from '../../customHook/useToast';

function TransactionManagement() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState(''); // '' = All Types
  const [transactionStatus, setTransactionStatus] = useState(''); // '' = All Status

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: 1,
        size: 50,
      };

      if (searchTerm.trim()) params.username = searchTerm.trim();
      if (transactionType) params.type = transactionType;
      if (transactionStatus) params.status = transactionStatus;

      const res = await api.get(API_ENDPOINTS.ADMIN.TRANSCATIONS, { params });

      if (res.success) {
        setTransactions(res.data || []);
      } else {
        setError(res.error || 'Failed to load transactions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce cho search
  const debouncedFetch = useCallback(
    debounce(fetchTransactions, 600),
    [searchTerm, transactionType, transactionStatus]
  );

  useEffect(() => {
    fetchTransactions(); // Gọi ngay khi type/status thay đổi
  }, [transactionType, transactionStatus]);

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (tx.username || '').toLowerCase().includes(searchLower) ||
      (tx.transactionHash || '').toLowerCase().includes(searchLower) ||
      tx.amount?.toString().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <h2 className="text-xl font-semibold text-emerald-400 mb-4">Transaction Management</h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by username / hash / amount"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />

          {/* Filter Type */}
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="Withdraw">Withdraw</option>
            <option value="Deposit">Deposit</option>
            <option value="Swap">Swap</option>
            <option value="Transfer">Transfer</option>
          </select>

          {/* Filter Status */}
          <select
            value={transactionStatus}
            onChange={(e) => setTransactionStatus(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Expired">Expired</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Username</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Currency</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Note/Hash/To</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="py-8 text-center text-slate-400">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="8" className="py-8 text-center text-red-400">{error}</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="8" className="py-8 text-center text-slate-400">No transactions found</td></tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-emerald-500/10 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {tx.transactionTime ? new Date(tx.transactionTime).toLocaleString() : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-400">{tx.username || 'N/A'}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`px-2 py-1 rounded text-xs ${tx.transactionType.includes('Commission') ? 'bg-purple-500/20 text-purple-400' :
                        tx.transactionType === 'Daily' ? 'bg-cyan-500/20 text-cyan-400' :
                        tx.transactionType === 'Deposit' ? 'bg-green-500/20 text-green-400' :
                        tx.transactionType === 'Withdraw' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'}`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-400 font-medium">
                      {formatCurrency(tx.amount || 0, tx.currency || 'USDT')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {tx.fee ? formatCurrency(tx.fee, tx.currency || 'USDT') : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{tx.currency || 'USDT'}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`px-2 py-1 rounded text-xs ${tx.status === 'Success' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        tx.status === 'Expired' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'}`}>
                        {tx.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300 break-all">
                      {tx.transactionNote && <div className="mb-1">{tx.transactionNote}</div>}
                      {tx.transactionHash && <div className="font-mono text-[10px]">{tx.transactionHash}</div>}
                      {tx.toWallet && <div className="font-mono text-[10px] break-all">{tx.toWallet}</div>}
                      {tx.relatedUsername && <div>Related: {tx.relatedUsername}</div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TransactionManagement;