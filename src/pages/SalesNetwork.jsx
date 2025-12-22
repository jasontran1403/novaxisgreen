import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function SalesNetwork() {
  const [summary, setSummary] = useState({
    selfSales: 0,
    directSales: 0,
    currency: 'USDT',
  });
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');

  const currency = summary.currency || 'USDT';

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [search, fromDate, toDate]);

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      setError('');
      const res = await ApiService.get(API_ENDPOINTS.NETWORK.SALES_SUMMARY);
      if (res?.success === false) {
        setError(res?.message || 'Unable to load sales data');
        setSummary((prev) => ({ ...prev, selfSales: 0, directSales: 0 }));
        return;
      }
      const data = res?.data || res || {};
      setSummary({
        selfSales: Number(data.selfSales ?? data.personalSales ?? data.mySales ?? 0),
        directSales: Number(data.directSales ?? data.teamSales ?? data.networkSales ?? 0),
        currency: data.currency || 'USDT',
      });
    } catch (err) {
      console.error('Failed to load sales summary', err);
      setError(err?.message || 'Unable to load sales data');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingList(true);
      setError('');
      const res = await ApiService.get(`${API_ENDPOINTS.NETWORK.DIRECT_SALES}${queryString}`);
      if (res?.success === false) {
        setError(res?.message || 'Unable to load direct list');
        setMembers([]);
        return;
      }
      const data = res?.data || res || [];
      setMembers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error('Failed to load direct sales list', err);
      setError(err?.message || 'Unable to load direct list');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [queryString]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/40 dark:border-emerald-400/40 p-6 glow-border glow-border-hover relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20"></div>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300">
                Sales Network
              </h2>
              <p className="text-xs text-emerald-300/70 dark:text-emerald-400/70">
                Sales are based on your direct referrals. The list below excludes your own account.
              </p>
            </div>
            {error && (
              <span className="text-xs text-red-400">{error}</span>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-600/40 dark:bg-gray-700/40 rounded-lg p-4 border border-emerald-500/40 dark:border-emerald-400/40">
              <p className="text-sm text-emerald-300/70">Your Sales</p>
              <p className="text-2xl font-bold text-emerald-300">
                {loadingSummary ? '...' : formatCurrency(summary.selfSales, currency)}
              </p>
            </div>
            <div className="bg-slate-600/40 dark:bg-gray-700/40 rounded-lg p-4 border border-emerald-500/40 dark:border-emerald-400/40">
              <p className="text-sm text-emerald-300/70">Direct Sales</p>
              <p className="text-2xl font-bold text-emerald-300">
                {loadingSummary ? '...' : formatCurrency(summary.directSales, currency)}
              </p>
            </div>
            <div className="bg-slate-600/40 dark:bg-gray-700/40 rounded-lg p-4 border border-emerald-500/40 dark:border-emerald-400/40">
              <p className="text-sm text-emerald-300/70">Total</p>
              <p className="text-2xl font-bold text-emerald-300">
                {loadingSummary ? '...' : formatCurrency((summary.selfSales || 0) + (summary.directSales || 0), currency)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-emerald-300/70 mb-1">Search by Username</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-600/60 dark:bg-gray-700/60 border border-emerald-500/30 dark:border-emerald-400/30 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
            <div>
              <label className="block text-xs text-emerald-300/70 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-600/60 dark:bg-gray-700/60 border border-emerald-500/30 dark:border-emerald-400/30 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
            <div>
              <label className="block text-xs text-emerald-300/70 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-600/60 dark:bg-gray-700/60 border border-emerald-500/30 dark:border-emerald-400/30 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              />
            </div>
          </div>

          {/* List */}
          <div className="bg-slate-600/40 dark:bg-gray-700/40 rounded-lg border border-emerald-500/30 dark:border-emerald-400/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-slate-700/50 dark:bg-gray-800/50 text-left text-xs uppercase text-emerald-300/80">
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">NOVA Balance</th>
                    <th className="py-3 px-4">USDT Balance</th>
                    <th className="py-3 px-4">Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingList ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-emerald-300/70">
                        Loading...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-emerald-300/70">
                        No data
                      </td>
                    </tr>
                  ) : (
                    members.map((member, idx) => (
                      <tr
                        key={member.username || idx}
                        className="border-t border-emerald-500/20 dark:border-emerald-400/20 text-sm text-emerald-100"
                      >
                        <td className="py-3 px-4 font-semibold text-emerald-200">
                          {member.username || '—'}
                        </td>
                        <td className="py-3 px-4 text-emerald-300/80">
                          {member.registeredAt
                            ? new Date(member.registeredAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-emerald-200">
                          {formatCurrency(Number(member.balanceNOVA || 0), 'NOVA')}
                        </td>
                        <td className="py-3 px-4 text-emerald-200">
                          {formatCurrency(Number(member.balanceUSDT || 0), 'USDT')}
                        </td>
                        <td className="py-3 px-4 uppercase text-emerald-300">
                          {member.position || member.branch || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesNetwork;

