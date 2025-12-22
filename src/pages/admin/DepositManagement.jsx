import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

function DepositManagement() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.DEPOSITS);
      if (res.success) {
        setDeposits(res.data || []);
      } else {
        setError(res.error || 'Failed to load deposits');
      }
    } catch (err) {
      setError(err.message || 'Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapToMainWallet = async (depositId) => {
    if (!confirm('Are you sure you want to swap this deposit to main wallet?')) {
      return;
    }

    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.DEPOSIT_SWAP, { depositId });
      if (res.success) {
        alert('Deposit swapped to main wallet successfully');
        fetchDeposits();
      } else {
        alert(res.error || 'Failed to swap deposit');
      }
    } catch (err) {
      alert(err.message || 'Failed to swap deposit');
    }
  };

  const filteredDeposits = deposits.filter(deposit => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (deposit.username || '').toLowerCase().includes(searchLower) ||
      (deposit.email || '').toLowerCase().includes(searchLower) ||
      (deposit.txHash || '').toLowerCase().includes(searchLower) ||
      deposit.amount?.toString().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4">Deposit Management</h2>

        {/* Search */}
        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            placeholder="Search by username, email, txHash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Currency</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Tx Hash</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No deposits found</td>
                </tr>
              ) : (
                filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="border-b border-emerald-500/10 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {deposit.date ? new Date(deposit.date).toLocaleString() : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      <div>{deposit.username || deposit.email || 'N/A'}</div>
                      {deposit.email && deposit.username && (
                        <div className="text-slate-500 text-xs">{deposit.email}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-400 font-medium">
                      {formatCurrency(deposit.amount || 0, deposit.currency || 'USDT')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{deposit.currency || 'USDT'}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                      {deposit.txHash ? `${deposit.txHash.slice(0, 10)}...${deposit.txHash.slice(-8)}` : '--'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        deposit.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {deposit.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {deposit.status === 'pending' && (
                        <button
                          onClick={() => handleSwapToMainWallet(deposit.id)}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors text-xs"
                        >
                          Swap
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : filteredDeposits.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No deposits found</div>
          ) : (
            filteredDeposits.map((deposit) => (
              <div key={deposit.id} className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-emerald-400 truncate">
                      {deposit.username || deposit.email || 'N/A'}
                    </div>
                    {deposit.email && deposit.username && (
                      <div className="text-xs text-slate-400 truncate">{deposit.email}</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-2 ${
                    deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    deposit.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {deposit.status || 'pending'}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Date:</span>
                    <span>{deposit.date ? new Date(deposit.date).toLocaleString() : '--'}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(deposit.amount || 0, deposit.currency || 'USDT')}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Currency:</span>
                    <span>{deposit.currency || 'USDT'}</span>
                  </div>
                  {deposit.txHash && (
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Tx Hash:</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {deposit.txHash.slice(0, 8)}...{deposit.txHash.slice(-6)}
                      </span>
                    </div>
                  )}
                </div>
                {deposit.status === 'pending' && (
                  <button
                    onClick={() => handleSwapToMainWallet(deposit.id)}
                    className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors text-sm font-medium"
                  >
                    Swap to Main Wallet
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DepositManagement;

