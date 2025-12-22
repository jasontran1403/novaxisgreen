import { useEffect, useState } from 'react';
import BinaryTreeView from '../../components/BinaryTreeView';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';

function BinaryTreeAdmin() {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDepth, setMaxDepth] = useState(10);
  const [viewMode, setViewMode] = useState('system'); // 'system' or 'user'
  const [userId, setUserId] = useState('');
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  useEffect(() => {
    if (viewMode === 'system') {
      loadSystemTree();
    } else if (viewMode === 'user') {
      loadUserList();
    }
  }, [maxDepth, viewMode]);

  const loadUserList = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get(API_ENDPOINTS.ADMIN.MEMBERS, {
        params: {
          page: 1,
          limit: 1000, // Lấy nhiều user
          searchTerm: userSearchTerm || undefined
        }
      });
      if (res.success) {
        const users = res.data || [];
        setUserList(users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.name
        })));
      }
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadSystemTree = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.BINARY_TREE_SYSTEM, {
        params: { maxDepth }
      });
      if (res.success) {
        setTreeData(res.data);
      } else {
        setError(res.error || 'Failed to load system tree');
      }
    } catch (err) {
      setError(err.message || 'Failed to load system tree');
    } finally {
      setLoading(false);
    }
  };

  const loadUserTree = async () => {
    if (!userId) {
      alert('Please enter user ID');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.BINARY_TREE_USER(userId), {
        params: { maxDepth }
      });
      if (res.success) {
        setTreeData(res.data);
      } else {
        setError(res.error || 'Failed to load user tree');
      }
    } catch (err) {
      setError(err.message || 'Failed to load user tree');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.BINARY_TREE_SEARCH, {
        params: { username: searchTerm }
      });
      if (res.success) {
        setTreeData(res.data);
        if (!res.found) {
          setError('No member found');
        }
      } else {
        setError(res.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = viewMode === 'user' && userId ? { userId, maxDepth } : { maxDepth };
      const res = await api.get(API_ENDPOINTS.ADMIN.BINARY_TREE_EXPORT, { params });
      // Tạo blob và download
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `binary-tree-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to export CSV');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-emerald-400">Binary Tree Admin</h2>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors"
          >
            📥 Export CSV
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-3 mb-4">
          {/* Row 1: View Mode and Max Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value);
                  setTreeData(null);
                  setUserId('');
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="system">System Tree</option>
                <option value="user">User Tree</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Max Depth</label>
              <input
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                min="1"
                max="50"
                className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div className="flex items-end">
              {viewMode === 'user' ? (
                <button
                  onClick={loadUserTree}
                  disabled={!userId}
                  className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Load Tree
                </button>
              ) : (
                <button
                  onClick={loadSystemTree}
                  className="w-full px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>

          {/* Row 2: User Selection (only for user mode) */}
          {viewMode === 'user' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-700/30 rounded-lg p-3 border border-emerald-500/20">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Select User</label>
                <div className="relative">
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm appearance-none pr-8"
                    disabled={loadingUsers}
                  >
                    <option value="">-- Select User --</option>
                    {userList.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} (ID: {user.id}) {user.name ? `- ${user.name}` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {loadingUsers ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
                    ) : (
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {userList.length} users loaded
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Search Users</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadUserList()}
                    placeholder="Search username..."
                    className="flex-1 px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <button
                    onClick={loadUserList}
                    className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors"
                    title="Refresh user list"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by username..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-emerald-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm transition-colors"
          >
            🔍 Search
          </button>
        </div>

        {/* Tree View */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-emerald-400">Loading tree...</div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        ) : (
          <BinaryTreeView
            treeData={treeData}
            onLoadFullTree={async (depth) => {
              setMaxDepth(depth);
              if (viewMode === 'system') {
                await loadSystemTree();
              } else {
                await loadUserTree();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default BinaryTreeAdmin;

