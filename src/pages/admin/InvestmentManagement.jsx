import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import debounce from 'lodash.debounce';
import { useToast } from '../../customHook/useToast';

function InvestmentManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Marketing users state
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [marketingUsers, setMarketingUsers] = useState([]);
  const [loadingMarketing, setLoadingMarketing] = useState(false);

  const [showLockPopModal, setShowLockPopModal] = useState(false);
  const [lockingPop, setLockingPop] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    username: ''
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // Debounce fetchInvestments cho input tìm kiếm (1200ms)
  const debouncedFetchInvestments = useCallback(
    debounce(() => {
      fetchInvestments();
    }, 1200),
    [filters, page]
  );

  useEffect(() => {
    debouncedFetchInvestments();
    return () => {
      debouncedFetchInvestments.cancel();
    };
  }, [debouncedFetchInvestments]);

  // Gọi fetch ngay khi chuyển trang (không debounce)
  useEffect(() => {
    fetchInvestments();
  }, [page]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError('');

      const params = { page, limit };

      // Add username filter if exists
      if (filters.username && filters.username.trim()) {
        params.username = filters.username.trim();
      }

      const res = await api.get(API_ENDPOINTS.ADMIN.INVESTMENTS, { params });

      if (res.success) {
        setInvestments(res.data?.data || []);
        setPagination(res.data?.pagination || { total: 0, totalPages: 0 });
      } else {
        setError(res.error || 'Failed to load investments');
      }
    } catch (err) {
      setError(err.message || 'Failed to load investments');
      console.error('Fetch investments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvestment = async (investmentId) => {
    return;
    try {
      setRevoking(true);
      const res = await api.post(API_ENDPOINTS.ADMIN.INVESTMENT_REVOKE(investmentId));

      if (res.success) {
        toast.success(res.message || 'Investment revoked successfully');
        setShowRevokeModal(false);
        fetchInvestments(); // Reload list

        // Show summary
        if (res.data) {
          const summary = `
            Thu hồi thành công!
            - Số users bị ảnh hưởng: ${res.data.affectedUsers}
            - Direct Commission: $${res.data.directCommissionRevoked?.toFixed(2) || 0}
            - Binary Commission: $${res.data.binaryCommissionRevoked?.toFixed(2) || 0}
            - Leader Commission: $${res.data.leaderCommissionRevoked?.toFixed(2) || 0}
            - POP Commission: $${res.data.popCommissionRevoked?.toFixed(2) || 0}
            - Total USD: $${res.data.totalUsdRevoked?.toFixed(2) || 0}
          `.trim();

          setTimeout(() => {
            toast.success(summary);
          }, 500);
        }
      } else {
        toast.error(res.message || res.error || 'Failed to revoke investment');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to revoke investment');
      console.error('Revoke investment error:', err);
    } finally {
      setRevoking(false);
    }
  };

  const handleLockPop = async (investmentId) => {
    try {
      setLockingPop(true);
      // Endpoint thực tế - thay bằng endpoint backend của bạn
      // Ví dụ: POST /api/admin/investments/{id}/lock-pop
      const res = await api.get(API_ENDPOINTS.ADMIN.INVESTMENT_LOCK_POP(investmentId));

      if (res.success) {
        toast.success(res.message || 'Đã khóa POP Commission thành công');
        setShowLockPopModal(false);
        fetchInvestments(); // Reload bảng
      } else {
        toast.error(res.message || res.error || 'Không thể khóa POP Commission');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi khóa POP Commission');
      console.error('Lock POP error:', err);
    } finally {
      setLockingPop(false);
    }
  };

  // ========================================
  // MARKETING USERS FUNCTIONS
  // ========================================

  const fetchMarketingUsers = async () => {
    try {
      setLoadingMarketing(true);
      const res = await api.get(API_ENDPOINTS.ADMIN.MARKETING_USER);

      if (res.success) {
        setMarketingUsers(res.data || []);
      } else {
        toast.error(res.error || 'Failed to load marketing users');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load marketing users');
      console.error('Fetch marketing users error:', err);
    } finally {
      setLoadingMarketing(false);
    }
  };

  const handleShowMarketingModal = () => {
    setShowMarketingModal(true);
    fetchMarketingUsers();
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Calculate stats
  const totalValue = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const activeCount = investments.filter(inv => inv.status === 'Active').length;
  const completedCount = investments.filter(inv => inv.status === 'Completed').length;
  const revokedCount = investments.filter(inv => inv.isRevoked).length;

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-emerald-400">Investment Management</h2>

          {/* Marketing Users Button */}
          <button
            onClick={handleShowMarketingModal}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded text-purple-400 text-sm font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Marketing Users</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by username..."
            value={filters.username}
            onChange={(e) => updateFilter('username', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Total Investments</div>
            <div className="text-xl font-bold text-emerald-400">{pagination.total || 0}</div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Total Value</div>
            <div className="text-lg font-bold text-blue-400">
              {formatCurrency(totalValue, 'USDT')}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Active / Completed</div>
            <div className="text-sm font-bold">
              <span className="text-green-400">{activeCount}</span>
              <span className="text-slate-500"> / </span>
              <span className="text-blue-400">{completedCount}</span>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Revoked</div>
            <div className="text-xl font-bold text-red-400">{revokedCount}</div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Username</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Package</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Daily Rate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Progress</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">POP Commisison</th>
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
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">No investments found</td>
                </tr>
              ) : (
                investments.map((investment) => (
                  <tr
                    key={investment.id}
                    className={`border-b border-emerald-500/10 hover:bg-slate-700/30 ${investment.isRevoked ? 'opacity-60' : ''
                      }`}
                  >
                    <td className="py-3 px-4 text-xs text-slate-300">{investment.id}</td>

                    <td className="py-3 px-4 text-xs text-emerald-400 font-medium">
                      {investment.username || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-300">
                      {investment.packageName || 'N/A'}
                    </td>

                    <td className="py-3 px-4 text-xs text-blue-400 font-medium">
                      {formatCurrency(investment.amount || 0, 'USDT')}
                    </td>

                    <td className="py-3 px-4 text-xs text-purple-400">
                      {(investment.dailyRate || 0).toFixed(2)}%
                    </td>

                    <td className="py-3 px-4 text-xs">
                      <div className="text-slate-300">
                        {investment.daysPaid || 0} / {investment.cycles || 0} days
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${((investment.daysPaid || 0) / (investment.cycles || 1)) * 100}%`
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-400">
                      {formatDate(investment.investmentDate)}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {investment.isRevoked ? (
                        <div>
                          <span className="block text-red-400 font-medium">🚫 Revoked</span>
                        </div>
                      ) : investment.status === 'Active' ? (
                        <span className="text-green-400">✓ Active</span>
                      ) : investment.status === 'Completed' ? (
                        <span className="text-blue-400">✓ Completed</span>
                      ) : (
                        <span className="text-slate-400">{investment.status}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedInvestment(investment);
                          setShowLockPopModal(true);
                        }}
                        disabled={investment.isLockPop || lockingPop}
                        className={`group relative px-2.5 py-1.5 border rounded transition-all flex items-center gap-1.5 min-w-[80px] justify-center
      ${investment.isLockPop || lockingPop
                            ? 'bg-slate-700/50 border-slate-600 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 hover:border-purple-500/50 text-purple-400 cursor-pointer'
                          }`}
                      >
                        <span className="text-[10px] font-medium hidden sm:inline">
                          {investment.isLockPop ? '🚫  Locked' : 'Lock POP'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-emerald-400"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-emerald-400"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Revoke Confirmation Modal */}
      {showRevokeModal && selectedInvestment && (
        <RevokeConfirmationModal
          investment={selectedInvestment}
          onClose={() => setShowRevokeModal(false)}
          onConfirm={() => handleRevokeInvestment(selectedInvestment.id)}
          loading={revoking}
        />
      )}

      {showLockPopModal && selectedInvestment && (
        <LockPopConfirmationModal
          investment={selectedInvestment}
          onClose={() => setShowLockPopModal(false)}
          onConfirm={() => handleLockPop(selectedInvestment.id)}
          loading={lockingPop}
        />
      )}

      {/* Marketing Users Modal */}
      {showMarketingModal && (
        <MarketingUsersModal
          marketingUsers={marketingUsers}
          loading={loadingMarketing}
          onClose={() => setShowMarketingModal(false)}
          onRefresh={fetchMarketingUsers}
          toast={toast}
        />
      )}
    </div>
  );
}

// Revoke Confirmation Modal Component
function RevokeConfirmationModal({ investment, onClose, onConfirm, loading }) {

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-orange-500/50 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-orange-400 mb-4">⚠️ Xác nhận thu hồi gói đầu tư</h3>

        <div className="space-y-3 mb-6">
          <div className="bg-slate-700/50 rounded p-3 border border-emerald-500/30">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-400">ID:</div>
              <div className="text-white font-medium">{investment.id}</div>

              <div className="text-slate-400">Username:</div>
              <div className="text-emerald-400 font-medium">{investment.username}</div>

              <div className="text-slate-400">Package:</div>
              <div className="text-white">{investment.packageName}</div>

              <div className="text-slate-400">Amount:</div>
              <div className="text-blue-400 font-medium">{formatCurrency(investment.amount, 'USDT')}</div>

              <div className="text-slate-400">Progress:</div>
              <div className="text-white">{investment.daysPaid} / {investment.cycles} days</div>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-500/50 rounded p-3">
            <div className="text-red-400 text-sm space-y-1">
              <div className="font-semibold">⚠️ Hành động này sẽ:</div>
              <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                <li>Thu hồi tất cả Direct Commission</li>
                <li>Thu hồi tất cả Binary Commission</li>
                <li>Thu hồi tất cả Leader Commission</li>
                <li>Thu hồi tất cả POP Commission</li>
                <li>Trừ doanh số Placement</li>
                <li>Trừ Maxout ban đầu</li>
              </ul>
              <div className="font-semibold mt-2">✅ Không thu hồi:</div>
              <ul className="list-disc list-inside text-xs ml-2">
                <li>Daily Interest (lãi ngày - giữ lại)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded text-orange-400 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : '✓ Xác nhận thu hồi'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

// Marketing Users Modal Component
function MarketingUsersModal({ marketingUsers, loading, onClose, onRefresh, toast }) {
  const [usernamesInput, setUsernamesInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);

  const handleAddUsers = async () => {
    if (!usernamesInput.trim()) {
      toast.error('Vui lòng nhập username');
      return;
    }

    try {
      setAdding(true);
      const res = await api.post(API_ENDPOINTS.ADMIN.ADD_MARKETING_USER, {
        usernames: usernamesInput.trim()
      });

      if (res.success) {
        toast.success(res.message || 'Đã thêm users vào marketing');
        setUsernamesInput('');
        onRefresh();
      } else {
        toast.error(res.error || res.message || 'Failed to add users');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add users');
      console.error('Add marketing users error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveUser = async (username) => {
    try {
      setRemoving(username);
      const res = await api.delete(API_ENDPOINTS.ADMIN.REMOVE_MARKETING_USER(username));

      if (res.success) {
        toast.success(res.message || `Đã xóa ${username} khỏi marketing`);
        onRefresh();
      } else {
        toast.error(res.error || res.message || 'Failed to remove user');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove user');
      console.error('Remove marketing user error:', err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-purple-500/50 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-purple-400 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Marketing Users
            <span className="text-sm text-slate-400">({marketingUsers.length})</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Users Section */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30 mb-4">
          <div className="text-sm text-slate-300 mb-2">Thêm users vào marketing:</div>
          <div className="text-xs text-slate-400 mb-2">
            Nhập username, phân tách bằng dấu chấm phẩy (;)
            <br />
            Ví dụ: <span className="text-purple-400">user1;user2;user3</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={usernamesInput}
              onChange={(e) => setUsernamesInput(e.target.value)}
              placeholder="username1;username2;username3..."
              className="flex-1 px-3 py-2 bg-slate-700 border border-purple-500/30 rounded text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
              disabled={adding}
            />
            <button
              onClick={handleAddUsers}
              disabled={adding || !usernamesInput.trim()}
              className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded text-purple-400 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {adding ? (
                <span>Đang thêm...</span>
              ) : (
                <span>+ Thêm</span>
              )}
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-slate-400">Loading...</div>
          ) : marketingUsers.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              Chưa có marketing users
            </div>
          ) : (
            <div className="space-y-2">
              {/* marketingUsers is now array of strings */}
              {marketingUsers.map((username, index) => (
                <div
                  key={index}
                  className="bg-slate-700/50 rounded-lg p-3 border border-purple-500/30 flex items-center justify-between hover:bg-slate-700/70 transition-all"
                >
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{username}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(username)}
                    disabled={removing === username}
                    className="ml-4 p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa khỏi marketing"
                  >
                    {removing === username ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// Lock POP Confirmation Modal
function LockPopConfirmationModal({ investment, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-purple-500/50 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-purple-400 mb-4">🔒 Xác nhận khóa POP Commission</h3>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-700/50 rounded p-4 border border-emerald-500/30">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-400">ID:</div>
              <div className="text-white font-medium">{investment.id}</div>
              <div className="text-slate-400">Username:</div>
              <div className="text-emerald-400 font-medium">{investment.username}</div>
              <div className="text-slate-400">Package:</div>
              <div className="text-white">{investment.packageName}</div>
              <div className="text-slate-400">Amount:</div>
              <div className="text-blue-400 font-medium">{formatCurrency(investment.amount, 'USDT')}</div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-500/50 rounded p-4">
            <div className="text-purple-300 text-sm">
              <p className="font-semibold">Hành động này sẽ:</p>
              <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                <li>Khóa vĩnh viễn POP Commission của gói</li>
                <li>Không ảnh hưởng đến Daily Interest</li>
              </ul>
              <p className="font-bold mt-3 text-yellow-400">Không thể hoàn tác!</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500 rounded text-purple-200 font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Đang khóa...' : '🔒 Xác nhận khóa POP'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default InvestmentManagement;