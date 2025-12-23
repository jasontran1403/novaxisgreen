import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.error || 'Failed to load dashboard stats');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-emerald-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: '👥',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50'
    },
    {
      title: 'Active Investments',
      value: stats.activeInvestments || 0,
      icon: '📈',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50'
    },
    {
      title: 'Pending Deposits',
      value: stats.pendingDeposits || 0,
      icon: '💰',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50'
    },
    {
      title: 'Pending Withdraws',
      value: stats.pendingWithdraws || 0,
      icon: '💸',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50'
    },
    {
      title: 'Total Admins',
      value: stats.totalAdmins || 0,
      icon: '👑',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50'
    }
  ];

  const financialCards = [
    {
      title: 'Total Investment Value',
      value: formatCurrency(stats.totalInvestmentValue || 0, 'USDT'),
      icon: '💵',
      color: 'text-green-400'
    },
    {
      title: 'Total NOVA Balance',
      value: formatCurrency(stats.totalNovaBalance || 0, 'NOVA'),
      icon: '🔷',
      color: 'text-purple-400'
    },
    {
      title: 'Total USDT Balance',
      value: formatCurrency(stats.totalUsdtBalance || 0, 'USDT'),
      icon: '💵',
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-6">
        <h2 className="text-2xl font-semibold text-emerald-400 mb-6">Dashboard Overview</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-2xl font-bold ${card.color}`}>
                  {card.value.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-slate-400">{card.title}</div>
            </div>
          ))}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {financialCards.map((card, index) => (
            <div
              key={index}
              className="bg-slate-700/50 border border-emerald-500/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{card.icon}</span>
              </div>
              <div className={`text-lg font-semibold ${card.color} mb-1`}>
                {card.value}
              </div>
              <div className="text-sm text-slate-400">{card.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/deposits"
            className="bg-slate-700/50 hover:bg-slate-700 border border-emerald-500/30 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm text-emerald-400">Deposit Management</div>
          </a>
          <a
            href="/admin/withdraws"
            className="bg-slate-700/50 hover:bg-slate-700 border border-emerald-500/30 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">💸</div>
            <div className="text-sm text-emerald-400">Withdraw Management</div>
          </a>
          <a
            href="/admin/members"
            className="bg-slate-700/50 hover:bg-slate-700 border border-emerald-500/30 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm text-emerald-400">Member Management</div>
          </a>
          <a
            href="/admin/settings"
            className="bg-slate-700/50 hover:bg-slate-700 border border-emerald-500/30 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm text-emerald-400">Settings</div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

