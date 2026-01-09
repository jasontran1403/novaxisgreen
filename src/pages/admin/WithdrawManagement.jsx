import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../customHook/useToast';

function WithdrawManagement() {
  const toast = useToast();
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // Thêm hàm helper này ở đầu component
  const getFormattedDate = (withdraw) => {
    const timestamp = Number(withdraw.transactionTime || withdraw.createdAt);

    if (isNaN(timestamp) || timestamp <= 0) {
      return '--';
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return '--';
    }

    // Format giống desktop cho nhất quán
    return (
      <div className="text-right">
        <div>
          {date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
        <div className="text-slate-500">
          {date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchWithdraws();
  }, [page, statusFilter]);

  const fetchWithdraws = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };
      const res = await api.get(API_ENDPOINTS.ADMIN.WITHDRAWS, { params });
      console.log('Withdraw API Response:', res); // DEBUG: mở console xem

      if (res.success) {
        // Sửa chính: lấy array từ res.data.data
        setWithdraws(res.data?.data || []);
        setPagination(res.data?.pagination || { total: 0, totalPages: 0 });
      } else {
        setError(res.error || 'Failed to load withdraws');
      }
    } catch (err) {
      setError(err.message || 'Failed to load withdraws');
      console.error('Fetch withdraws error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawId) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;

    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.WITHDRAW_APPROVE, { withdrawId });
      if (res.success) {
        toast.success('Withdrawal approved successfully');
        fetchWithdraws();
      } else {
        toast.error(res.data || 'Failed to approve withdrawal');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve withdrawal');
    }
  };

  const handleCancel = async (withdrawId) => {
    if (!confirm('Are you sure you want to cancel this withdrawal?')) return;

    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.WITHDRAW_CANCEL, { withdrawId });
      if (res.success) {
        toast.success('Withdrawal cancelled successfully');
        fetchWithdraws();
      } else {
        toast.error(res.error || 'Failed to cancel withdrawal');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel withdrawal');
    }
  };

  const calculateFee = (amount) => {
    if (!amount || amount <= 0) return 0;
    return amount < 100 ? 1 : +(amount * 0.01).toFixed(2);
  };

  // Filter search ở frontend
  const filteredWithdraws = withdraws.filter((withdraw) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (withdraw.username || '').toLowerCase().includes(searchLower) ||
      (withdraw.email || '').toLowerCase().includes(searchLower) ||
      (withdraw.toWallet || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4">Withdraw Management</h2>

        {/* Filters */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="Search by username, email, wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Success</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Received</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Currency</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Wallet Address</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : filteredWithdraws.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">No withdrawals found</td>
                </tr>
              ) : (
                filteredWithdraws.map((withdraw) => {
                  const fee = calculateFee(withdraw.transactionAmount);
                  const receivedAmount = (withdraw.transactionAmount || 0) - fee;
                  return (
                    <tr key={withdraw.id} className="border-b border-emerald-500/10 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {(() => {
                          const timestamp = Number(withdraw.transactionTime || withdraw.createdAt);
                          if (isNaN(timestamp) || timestamp <= 0) {
                            return <span className="text-red-400">Invalid Date</span>;
                          }
                          const date = new Date(timestamp);

                          // Optional: double-check if date is valid
                          if (isNaN(date.getTime())) {
                            return <span className="text-red-400">Invalid Date</span>;
                          }

                          return (
                            <div className="text-xs text-emerald-300/80 whitespace-nowrap">
                              <div className="font-medium">
                                {date.toLocaleTimeString('en-GB', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                              <div className="text-emerald-300/60">
                                {date.toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        <div>{withdraw.username || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-400 font-medium">
                        {formatCurrency(withdraw.transactionAmount || 0, withdraw.transactionCurrency || 'USDT')}
                      </td>
                      <td className="py-3 px-4 text-xs text-orange-400 font-medium">
                        {formatCurrency(fee, withdraw.transactionCurrency || 'USDT')}
                      </td>
                      <td className="py-3 px-4 text-xs text-blue-400 font-medium">
                        {formatCurrency(receivedAmount, withdraw.transactionCurrency || 'USDT')}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {withdraw.transactionCurrency || 'USDT'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                        {withdraw.toWallet
                          ? `${withdraw.toWallet.slice(0, 10)}...${withdraw.toWallet.slice(-8)}`
                          : '--'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className={`px-2 py-1 rounded ${(withdraw.transactionStatus || '').toLowerCase() === 'success' ? 'bg-green-500/20 text-green-400' :
                          (withdraw.transactionStatus || '').toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                          {withdraw.transactionStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="flex gap-2">
                          {(withdraw.transactionStatus || '').toLowerCase() === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(withdraw.id)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors text-xs"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleCancel(withdraw.id)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs"
                              >
                                Hủy
                              </button>
                            </>
                          )}
                          {(withdraw.transactionStatus || '').toLowerCase() !== 'pending' && (
                            <span className="text-slate-500 text-xs">--</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Giữ nguyên logic, chỉ thêm safe access */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : filteredWithdraws.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No withdrawals found</div>
          ) : (
            filteredWithdraws.map((withdraw) => {
              const fee = calculateFee(withdraw.transactionAmount);
              const receivedAmount = (withdraw.transactionAmount || 0) - fee;
              const address = withdraw.toWallet || '';
              return (
                <div key={withdraw.id} className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-emerald-400 truncate">
                        {withdraw.username || 'N/A'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-2 ${(withdraw.transactionStatus || '').toLowerCase() === 'completed' ? 'bg-green-500/20 text-green-400' :
                      (withdraw.transactionStatus || '').toLowerCase() === 'approved' ? 'bg-blue-500/20 text-blue-400' :
                        (withdraw.transactionStatus || '').toLowerCase() === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                      }`}>
                      {withdraw.transactionStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Date:</span>
                      {getFormattedDate(withdraw)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(withdraw.transactionAmount || 0, withdraw.transactionCurrency || 'USDT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fee:</span>
                      <span className="text-orange-400 font-medium">
                        {formatCurrency(fee, withdraw.transactionCurrency || 'USDT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Received:</span>
                      <span className="text-blue-400 font-medium">
                        {formatCurrency(receivedAmount, withdraw.transactionCurrency || 'USDT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Currency:</span>
                      <span>{withdraw.transactionCurrency || 'USDT'}</span>
                    </div>
                    {address && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Wallet:</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {address.slice(0, 8)}...{address.slice(-6)}
                        </span>
                      </div>
                    )}
                  </div>
                  {(withdraw.transactionStatus || '').toLowerCase() === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(withdraw.id)}
                        className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors text-sm font-medium"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleCancel(withdraw.id)}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-sm font-medium"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-emerald-400 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-emerald-400 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WithdrawManagement;