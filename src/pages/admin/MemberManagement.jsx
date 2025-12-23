import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import debounce from 'lodash.debounce'; // Cài lodash nếu chưa có: npm install lodash
import { useToast } from '../../customHook/useToast';

function MemberManagement() {
  const toast = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    username: '',
    vipLevel: '',
    lockWithdraw: '',
    lockTransfer: '',
    lockCommission: '',
    lockSwap: '',
    lockAccount: '',
    investmentPlanId: ''
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // Debounce fetchMembers cho input tìm kiếm (1200ms)
  const debouncedFetchMembers = useCallback(
    debounce(() => {
      fetchMembers();
    }, 1200),
    [filters, page]
  );

  useEffect(() => {
    debouncedFetchMembers();
    return () => {
      debouncedFetchMembers.cancel(); // Cleanup debounce
    };
  }, [debouncedFetchMembers]);

  // Gọi fetch ngay khi chuyển trang (không debounce)
  useEffect(() => {
    fetchMembers();
  }, [page]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, limit, ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) delete params[key];
      });

      const res = await api.get(API_ENDPOINTS.ADMIN.MEMBERS, { params });

      if (res.success) {
        setMembers(res.data?.data || []);
        setPagination(res.data?.pagination || { total: 0, totalPages: 0 });
      } else {
        setError(res.error || 'Failed to load members');
      }
    } catch (err) {
      setError(err.message || 'Failed to load members');
      console.error('Fetch members error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetail = async (id) => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.MEMBER_DETAIL(id));
      if (res.success) {
        setSelectedMember(res.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load member detail');
    }
  };

  const handleLockStatus = async (memberId, lockData) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.MEMBER_LOCK(memberId), lockData);
      if (res.success) {
        toast.success('Lock status updated successfully');
        setShowLockModal(false);
        fetchMembers();
        if (selectedMember && selectedMember.id === memberId) {
          fetchMemberDetail(memberId);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update lock status');
    }
  };

  const handleUpdateMember = async (memberId, updateData) => {
    try {
      const res = await api.put(API_ENDPOINTS.ADMIN.MEMBER_UPDATE(memberId), updateData);
      if (res.success) {
        toast.success('Member updated successfully');
        setShowUpdateModal(false);
        fetchMembers();
        if (selectedMember && selectedMember.id === memberId) {
          fetchMemberDetail(memberId);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update member');
    }
  };

  const handleImpersonate = async (memberId) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.MEMBER_IMPERSONATE(memberId));
      if (res.success && res.data?.token) {
        localStorage.setItem('impersonate_token', res.data.token);
        localStorage.setItem('impersonate_user', JSON.stringify(res.data.user));
        toast.success('Impersonation successful. Redirecting...');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      toast.error(err.message || 'Failed to impersonate member');
    }
  };

  const handleUpdateBalance = async (memberId, balanceData) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.MEMBER_BALANCE(memberId), balanceData);
      if (res.success) {
        toast.success(res.message || 'Balance updated successfully');
        setShowBalanceModal(false);
        fetchMembers();
        if (selectedMember && selectedMember.id === memberId) {
          fetchMemberDetail(memberId);
        }
      }
    } catch (err) {
      toast.err(err.message || 'Failed to update balance');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.MEMBERS_EXPORT, { includeAuth: true });
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Failed to export CSV');
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-emerald-400">Member Management</h2>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <input
            type="text"
            placeholder="Search username..."
            value={filters.username}
            onChange={(e) => updateFilter('username', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
          />
          <select
            value={filters.vipLevel}
            onChange={(e) => updateFilter('vipLevel', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
          >
            <option value="">All VIP Levels</option>
            <option value="0">Member</option>
            <option value="1">VIP 1</option>
            <option value="2">VIP 2</option>
            <option value="3">VIP 3</option>
            <option value="4">VIP 4</option>
            <option value="5">VIP 5</option>
          </select>
          <select
            value={filters.lockWithdraw}
            onChange={(e) => updateFilter('lockWithdraw', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
          >
            <option value="">All Withdraw Status</option>
            <option value="true">Locked</option>
            <option value="false">Unlocked</option>
          </select>
          <select
            value={filters.lockAccount}
            onChange={(e) => updateFilter('lockAccount', e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
          >
            <option value="">All Account Status</option>
            <option value="true">Locked</option>
            <option value="false">Unlocked</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Total Members</div>
            <div className="text-xl font-bold text-emerald-400">{pagination.total || 0}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Active Members</div>
            <div className="text-xl font-bold text-green-400">
              {members.filter(m => m.active !== false).length}
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">Total Investment</div>
            <div className="text-lg font-bold text-blue-400">
              {formatCurrency(
                members.reduce((sum, m) => sum + (m.totalInvestment || 0), 0),
                'USDT'
              )}
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 border border-emerald-500/30">
            <div className="text-xs text-slate-400">VIP Members</div>
            <div className="text-xl font-bold text-purple-400">
              {members.filter(m => (m.vipLevel || 0) > 0).length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-500/30 bg-slate-700/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Username</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Rank</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Leader VIP</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Investment</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Balance USDT</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Balance NOVA</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Sponsor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-red-400">{error}</td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-400">No members found</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-emerald-500/10 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-xs text-slate-300">{member.id}</td>
                    <td className="py-3 px-4 text-xs text-emerald-400 font-medium">
                      {member.username || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{member.email || '--'}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                        {member.vipLevelName || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {member.vipLevel > 0 ? (
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                          VIP {member.vipLevel}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-emerald-400">
                      {formatCurrency(member.totalInvestment || 0, 'USDT')}
                    </td>
                    <td className="py-3 px-4 text-xs text-blue-400">
                      {formatCurrency(member.balanceUSDT || 0, 'USDT')}
                    </td>
                    <td className="py-3 px-4 text-xs text-purple-400">
                      {formatCurrency(member.balanceNOVA || 0, 'NOVA')}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">
                      {member.sponsor ? (
                        <div>
                          <div className="text-emerald-400">{member.sponsor.username || 'N/A'}</div>
                          <div className="text-slate-500 text-[10px]">ID: {member.sponsor.id}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="space-y-1">
                        {member.lockWithdraw && <span className="block text-red-400 text-[10px]">🔒 Withdraw</span>}
                        {member.lockAccount && <span className="block text-red-400 text-[10px]">🔒 Account</span>}
                        {!member.lockWithdraw && !member.lockAccount && (
                          <span className="text-green-400 text-[10px]">✓ Active</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => fetchMemberDetail(member.id)}
                          className="group relative px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded transition-all flex items-center gap-1.5"
                          title="Xem chi tiết"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-[10px] font-medium hidden sm:inline">Xem</span>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                            Xem chi tiết
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowLockModal(true);
                          }}
                          className="group relative px-2.5 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400 rounded transition-all flex items-center gap-1.5"
                          title="Khóa/Mở khóa"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-[10px] font-medium hidden sm:inline">Khóa</span>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                            Khóa/Mở khóa
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowUpdateModal(true);
                          }}
                          className="group relative px-2.5 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 text-green-400 rounded transition-all flex items-center gap-1.5"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-[10px] font-medium hidden sm:inline">Sửa</span>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                            Chỉnh sửa thông tin
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Bạn có chắc muốn đăng nhập thay người dùng này?')) {
                              handleImpersonate(member.id);
                            }
                          }}
                          className="group relative px-2.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 rounded transition-all flex items-center gap-1.5"
                          title="Đăng nhập thay"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-[10px] font-medium hidden sm:inline">Đăng nhập</span>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                            Đăng nhập thay người dùng
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowBalanceModal(true);
                          }}
                          className="group relative px-2.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 hover:border-orange-500/50 text-orange-400 rounded transition-all flex items-center gap-1.5"
                          title="Thay đổi số dư"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[10px] font-medium hidden sm:inline">Số dư</span>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                            Thay đổi số dư
                          </span>
                        </button>
                      </div>
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

      {/* Member Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-emerald-500/50 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-emerald-400">Member Detail</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-red-400"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400">ID</div>
                  <div className="text-white">{selectedMember.id}</div>
                </div>
                <div>
                  <div className="text-slate-400">Username</div>
                  <div className="text-emerald-400">{selectedMember.username}</div>
                </div>
                <div>
                  <div className="text-slate-400">Email</div>
                  <div className="text-white">{selectedMember.email}</div>
                </div>
                <div>
                  <div className="text-slate-400">Name</div>
                  <div className="text-white">{selectedMember.name}</div>
                </div>
                <div>
                  <div className="text-slate-400">VIP Level</div>
                  <div className="text-purple-400">{selectedMember.vipLevelName || `VIP ${selectedMember.vipLevel || 0}`}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Investment</div>
                  <div className="text-emerald-400">{formatCurrency(selectedMember.totalInvestment || 0, 'USDT')}</div>
                </div>
                <div>
                  <div className="text-slate-400">Balance USDT</div>
                  <div className="text-blue-400">{formatCurrency(selectedMember.balanceUSDT || 0, 'USDT')}</div>
                </div>
                <div>
                  <div className="text-slate-400">Balance NOVA</div>
                  <div className="text-purple-400">{formatCurrency(selectedMember.balanceNOVA || 0, 'NOVA')}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Development Commission</div>
                  <div className="text-green-400">{formatCurrency(selectedMember.totalDevelopmentCommission || 0, 'USDT')}</div>
                </div>
              </div>
              {selectedMember.sponsor && (
                <div>
                  <div className="text-slate-400 mb-2">Sponsor</div>
                  <div className="bg-slate-700/50 rounded p-2">
                    <div className="text-emerald-400">{selectedMember.sponsor.username || 'N/A'}</div>
                    <div className="text-xs text-slate-400">{selectedMember.sponsor.email || '--'}</div>
                  </div>
                </div>
              )}
              <div>
                <div className="text-slate-400 mb-2">Lock Status</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedMember.lockStatus || {}).map(([key, value]) => (
                    <div key={key} className={`px-2 py-1 rounded text-xs ${value ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {key}: {value ? '🔒 Locked' : '✓ Unlocked'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6 flex-wrap">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowBalanceModal(true);
                }}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded text-orange-400 text-sm"
              >
                Thay đổi số dư
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowLockModal(true);
                }}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded text-yellow-400 text-sm"
              >
                Manage Locks
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowUpdateModal(true);
                }}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-green-400 text-sm"
              >
                Edit Member
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lock Status Modal */}
      {showLockModal && selectedMember && (
        <LockStatusModal
          member={selectedMember}
          onClose={() => setShowLockModal(false)}
          onSave={(lockData) => handleLockStatus(selectedMember.id, lockData)}
        />
      )}

      {/* Update Member Modal */}
      {showUpdateModal && selectedMember && (
        <UpdateMemberModal
          member={selectedMember}
          onClose={() => setShowUpdateModal(false)}
          onSave={(updateData) => handleUpdateMember(selectedMember.id, updateData)}
        />
      )}

      {/* Update Balance Modal */}
      {showBalanceModal && selectedMember && (
        <UpdateBalanceModal
          member={selectedMember}
          onClose={() => setShowBalanceModal(false)}
          onSave={(balanceData) => handleUpdateBalance(selectedMember.id, balanceData)}
        />
      )}
    </div>
  );
}

// Lock Status Modal Component
function LockStatusModal({ member, onClose, onSave }) {
  console.log(member);
  const [lockData, setLockData] = useState({
    lockWithdraw: member?.lockWithdraw || false,
    lockTransfer: member?.lockTransfer || false,
    lockSwap: member?.lockSwap || false,
    lockDailyInterest: member?.lockDailyInterest || false,
    lockDirectCommission: member?.lockDirectCommission || false,
    lockBinaryCommission: member?.lockBinaryCommission || false,
    lockLeaderCommission: member?.lockLeaderCommission || false,
    lockPOPCommission: member?.lockPOPCommission || false,
    lockAccount: member?.lockAccount || false,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-emerald-500/50 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">Manage Lock Status</h3>
        <div className="space-y-3">
          {Object.entries(lockData).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-300 capitalize">{key.replace('lock', '')}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => {
                  setLockData(prev => ({ ...prev, [key]: e.target.checked }));
                }}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onSave(lockData)}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-400 text-sm"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Update Member Modal Component
function UpdateMemberModal({ member, onClose, onSave }) {
  const [updateData, setUpdateData] = useState({
    name: member?.name || '',
    email: member?.email || '',
    password: '',
    disable2FA: false,
    capVip: member?.capVip || ''
  });
  const [vipLevels, setVipLevels] = useState([]);
  const [loadingVipLevels, setLoadingVipLevels] = useState(true);

  useEffect(() => {
    const fetchVipLevels = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.ADMIN.COMMISSION_VIP);
        if (res.success && res.data) {
          const levels = Array.isArray(res.data) ? res.data : [];
          const formattedLevels = levels.map(vip => ({
            id: vip.id,
            name: vip.tenCap || `VIP ${vip.id}`
          }));
          setVipLevels(formattedLevels);
        }
      } catch (err) {
        console.error('Failed to load VIP levels:', err);
        setVipLevels([
          { id: 1, name: 'VIP 1' },
          { id: 2, name: 'VIP 2' },
          { id: 3, name: 'VIP 3' },
          { id: 4, name: 'VIP 4' },
          { id: 5, name: 'VIP 5' }
        ]);
      } finally {
        setLoadingVipLevels(false);
      }
    };
    fetchVipLevels();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-emerald-500/50 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">Update Member</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={updateData.name}
              onChange={(e) => setUpdateData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={updateData.email}
              onChange={(e) => setUpdateData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">New Password (leave empty to keep current)</label>
            <input
              type="password"
              value={updateData.password}
              onChange={(e) => setUpdateData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={updateData.disable2FA}
              onChange={(e) => setUpdateData(prev => ({ ...prev, disable2FA: e.target.checked }))}
              className="w-5 h-5"
            />
            <span className="text-sm text-slate-300">Disable 2FA</span>
          </label>
          <div>
            <label className="block text-sm text-slate-300 mb-1">VIP Level (Rank)</label>
            {loadingVipLevels ? (
              <div className="text-xs text-slate-400">Loading VIP levels...</div>
            ) : (
              <select
                value={updateData.capVip || ''}
                onChange={(e) => setUpdateData(prev => ({ ...prev, capVip: e.target.value === '' ? null : Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
              >
                <option value="">Member (No VIP)</option>
                {vipLevels.map((vip) => (
                  <option key={vip.id} value={vip.id}>
                    {vip.name}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-slate-400 mt-1">Current: {member.vipLevelName || 'Member'}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              const data = { ...updateData };
              if (!data.password) delete data.password;
              if (!data.disable2FA) delete data.disable2FA;
              if (data.capVip === '') data.capVip = null;
              onSave(data);
            }}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-400 text-sm"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Update Balance Modal Component
function UpdateBalanceModal({ member, onClose, onSave }) {
  const [balanceData, setBalanceData] = useState({
    tokenSymbol: 'USDT',
    amount: '',
    operation: 'add',
    reason: ''
  });

  const currentBalance = balanceData.tokenSymbol === 'USDT'
    ? (member?.balanceUSDT || 0)
    : (member?.balanceNOVA || 0);

  const calculateNewBalance = () => {
    const amountNum = Number(balanceData.amount) || 0;
    if (balanceData.operation === 'set') return amountNum;
    if (balanceData.operation === 'add') return currentBalance + amountNum;
    if (balanceData.operation === 'subtract') return Math.max(0, currentBalance - amountNum);
    return currentBalance;
  };

  const newBalance = calculateNewBalance();
  const amountChanged = newBalance - currentBalance;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-orange-500/50 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold text-orange-400 mb-4">Thay đổi số dư</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Token</label>
            <select
              value={balanceData.tokenSymbol}
              onChange={(e) => setBalanceData(prev => ({ ...prev, tokenSymbol: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            >
              <option value="USDT">USDT</option>
              <option value="NOVA">NOVA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Số dư hiện tại</label>
            <div className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-emerald-400 font-medium">
              {formatCurrency(currentBalance, balanceData.tokenSymbol)}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Thao tác</label>
            <select
              value={balanceData.operation}
              onChange={(e) => setBalanceData(prev => ({ ...prev, operation: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            >
              <option value="add">Thêm vào (+)</option>
              <option value="subtract">Trừ đi (-)</option>
              <option value="set">Đặt giá trị (=)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Số tiền</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={balanceData.amount}
              onChange={(e) => setBalanceData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Nhập số tiền"
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Lý do (tùy chọn)</label>
            <input
              type="text"
              value={balanceData.reason}
              onChange={(e) => setBalanceData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Nhập lý do thay đổi số dư"
              className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded text-white"
            />
          </div>
          {balanceData.amount && (
            <div className="bg-slate-700/50 rounded p-3 border border-emerald-500/30">
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Số dư hiện tại:</span>
                  <span className="text-emerald-400">{formatCurrency(currentBalance, balanceData.tokenSymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thay đổi:</span>
                  <span className={amountChanged >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {amountChanged >= 0 ? '+' : ''}{formatCurrency(amountChanged, balanceData.tokenSymbol)}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t border-slate-600">
                  <span>Số dư mới:</span>
                  <span className="text-blue-400">{formatCurrency(newBalance, balanceData.tokenSymbol)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              if (!balanceData.amount || Number(balanceData.amount) < 0) {
                toast.warning('Vui lòng nhập số tiền hợp lệ');
                return;
              }
              if (balanceData.operation === 'set' && Number(balanceData.amount) < 0) {
                toast.warning('Số dư không thể âm');
                return;
              }
              if (!window.confirm(`Bạn có chắc muốn ${balanceData.operation === 'add' ? 'thêm' : balanceData.operation === 'subtract' ? 'trừ' : 'đặt'} ${formatCurrency(Number(balanceData.amount), balanceData.tokenSymbol)} ${balanceData.tokenSymbol}?`)) {
                return;
              }
              onSave({
                tokenSymbol: balanceData.tokenSymbol,
                amount: Number(balanceData.amount),
                operation: balanceData.operation,
                reason: balanceData.reason || undefined
              });
            }}
            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded text-orange-400 text-sm"
          >
            Xác nhận
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default MemberManagement;