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

  // State theo dõi withdraw nào đang được xử lý (approve hoặc cancel)
  const [processingWithdrawId, setProcessingWithdrawId] = useState(null);

  const getFormattedDate = (withdraw) => {
    const timestamp = Number(withdraw.transactionTime || withdraw.createdAt);

    if (isNaN(timestamp) || timestamp <= 0) {
      return '--';
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return '--';
    }

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
      console.log('Withdraw API Response:', res); // DEBUG

      if (res.success) {
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

  const handleAction = async (withdrawId, action) => { // action: 'approve' hoặc 'cancel'
    const actionText = action === 'approve' ? 'duyệt' : 'hủy';
    if (!confirm(`Bạn có chắc muốn ${actionText} lệnh rút tiền này?`)) return;

    setProcessingWithdrawId(withdrawId); // Khóa nút ngay lập tức

    try {
      const endpoint =
        action === 'approve'
          ? API_ENDPOINTS.ADMIN.WITHDRAW_APPROVE
          : API_ENDPOINTS.ADMIN.WITHDRAW_CANCEL;

      const res = await api.post(endpoint, { withdrawId });

      if (res.success) {
        toast.success(`Đã ${actionText} lệnh rút tiền thành công`);
        fetchWithdraws(); // Refresh danh sách
      } else {
        toast.error(res.error || `Không thể ${actionText} lệnh rút tiền`);
      }
    } catch (err) {
      toast.error(err.message || `Không thể ${actionText} lệnh rút tiền`);
    } finally {
      setProcessingWithdrawId(null); // Mở khóa sau khi xong
    }
  };

  const handleApprove = (withdrawId) => handleAction(withdrawId, 'approve');
  const handleCancel = (withdrawId) => handleAction(withdrawId, 'cancel');

  const calculateFee = (amount) => {
    if (!amount || amount <= 0) return 0;
    return amount < 100 ? 1 : +(amount * 0.01).toFixed(2);
  };

  const filteredWithdraws = withdraws.filter((withdraw) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (withdraw.username || '').toLowerCase().includes(searchLower) ||
      (withdraw.email || '').toLowerCase().includes(searchLower) ||
      (withdraw.toWallet || '').toLowerCase().includes(searchLower)
    );
  });

  const isProcessing = (id) => processingWithdrawId === id;

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-3 sm:mb-4">
          Quản lý Rút tiền
        </h2>

        {/* Filters */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="Tìm theo username, email, địa chỉ ví..."
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
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Ngày</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Số lượng</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Phí</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Nhận được</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Tiền tệ</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Địa chỉ ví</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Trạng thái</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">Đang tải...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : filteredWithdraws.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">Không tìm thấy lệnh rút tiền</td>
                </tr>
              ) : (
                filteredWithdraws.map((withdraw) => {
                  const fee = calculateFee(withdraw.transactionAmount);
                  const receivedAmount = (withdraw.transactionAmount || 0) - fee;
                  const isPending = (withdraw.transactionStatus || '').toLowerCase() === 'pending';
                  const processing = isProcessing(withdraw.id);

                  return (
                    <tr key={withdraw.id} className="border-b border-emerald-500/10 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {getFormattedDate(withdraw)}
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
                        <span
                          className={`px-2 py-1 rounded ${
                            (withdraw.transactionStatus || '').toLowerCase() === 'success'
                              ? 'bg-green-500/20 text-green-400'
                              : (withdraw.transactionStatus || '').toLowerCase() === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {withdraw.transactionStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="flex gap-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApprove(withdraw.id)}
                                disabled={processing}
                                className={`px-3 py-1 text-white rounded transition-colors text-xs flex items-center gap-1.5 ${
                                  processing
                                    ? 'bg-green-700 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                {processing ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      />
                                    </svg>
                                    Đang duyệt...
                                  </>
                                ) : (
                                  'Duyệt'
                                )}
                              </button>

                              <button
                                onClick={() => handleCancel(withdraw.id)}
                                disabled={processing}
                                className={`px-3 py-1 text-white rounded transition-colors text-xs flex items-center gap-1.5 ${
                                  processing
                                    ? 'bg-red-700 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600'
                                }`}
                              >
                                {processing ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4 text-white"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      />
                                    </svg>
                                    Đang hủy...
                                  </>
                                ) : (
                                  'Hủy'
                                )}
                              </button>
                            </>
                          ) : (
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Đang tải...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : filteredWithdraws.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Không tìm thấy lệnh rút tiền</div>
          ) : (
            filteredWithdraws.map((withdraw) => {
              const fee = calculateFee(withdraw.transactionAmount);
              const receivedAmount = (withdraw.transactionAmount || 0) - fee;
              const address = withdraw.toWallet || '';
              const isPending = (withdraw.transactionStatus || '').toLowerCase() === 'pending';
              const processing = isProcessing(withdraw.id);

              return (
                <div key={withdraw.id} className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-emerald-400 truncate">
                        {withdraw.username || 'N/A'}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-2 ${
                        (withdraw.transactionStatus || '').toLowerCase() === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : (withdraw.transactionStatus || '').toLowerCase() === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {withdraw.transactionStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400">Ngày:</span>
                      {getFormattedDate(withdraw)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số lượng:</span>
                      <span className="text-emerald-400 font-medium">
                        {formatCurrency(withdraw.transactionAmount || 0, withdraw.transactionCurrency || 'USDT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phí:</span>
                      <span className="text-orange-400 font-medium">
                        {formatCurrency(fee, withdraw.transactionCurrency || 'USDT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nhận được:</span>
                      <span className="text-blue-400 font-medium">
                        {formatCurrency(receivedAmount, withdraw.transactionCurrency || 'USDT')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tiền tệ:</span>
                      <span>{withdraw.transactionCurrency || 'USDT'}</span>
                    </div>
                    {address && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ví:</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {address.slice(0, 8)}...{address.slice(-6)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(withdraw.id)}
                        disabled={processing}
                        className={`flex-1 px-3 py-2 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                          processing ? 'bg-green-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {processing && (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        )}
                        {processing ? 'Đang duyệt...' : 'Duyệt'}
                      </button>

                      <button
                        onClick={() => handleCancel(withdraw.id)}
                        disabled={processing}
                        className={`flex-1 px-3 py-2 text-white rounded transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                          processing ? 'bg-red-700 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {processing && (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        )}
                        {processing ? 'Đang hủy...' : 'Hủy'}
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
              disabled={page === 1 || loading}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-emerald-400 transition-colors"
            >
              Trước
            </button>
            <span className="text-sm text-slate-400">
              Trang {page} / {pagination.totalPages} ({pagination.total} lệnh)
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || loading}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-emerald-400 transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WithdrawManagement;