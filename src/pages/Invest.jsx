import { useCallback, useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import { API_ENDPOINTS } from '../config/apiConfig';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../customHook/useToast';

function Invest() {
  const toast = useToast();
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [novaBalance, setNovaBalance] = useState(0);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedTermMonths, setSelectedTermMonths] = useState(6);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedModalTermMonths, setSelectedModalTermMonths] = useState(6);
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [showModal, setShowModal] = useState(false);
  const [investing, setInvesting] = useState(false);

  // HARDCODED TERMS - No database fetch needed
  const INVESTMENT_TERMS = [
    { months: 6, days: 180, dailyRate: 0.2 },
    { months: 12, days: 360, dailyRate: 0.33 },
    { months: 18, days: 540, dailyRate: 0.4 },
    { months: 24, days: 720, dailyRate: 0.5 }
  ];

  const colorByName = {
    Bronze: 'amber',
    Silver: 'gray',
    Gold: 'yellow',
    Platinum: 'slate',
    Emerald: 'emerald',
    Sapphire: 'blue',
    Ruby: 'red',
    Diamond: 'cyan',
    'Crown Diamond': 'purple'
  };

  const handleInvestClick = async (pkg) => {
    setSelectedPackage(pkg);
    setSelectedModalTermMonths(selectedTermMonths);
    setSelectedCurrency('USDT');
    setShowModal(true);
  };

  const handleConfirmInvest = async () => {
    const term = INVESTMENT_TERMS.find(t => t.months === selectedModalTermMonths);
    if (!term) {
      alert('Please select an investment term');
      return;
    }

    const balanceToUse = selectedCurrency === 'USDT' ? usdtBalance : novaBalance;
    if (balanceToUse < selectedPackage.price) {
      alert(`Insufficient ${selectedCurrency} balance for this package`);
      return;
    }

    try {
      setInvesting(true);
      const payload = {
        packageId: selectedPackage.id,
        termMonths: term.months,
        termDays: term.days,
        dailyRate: term.dailyRate,
        currency: selectedCurrency
      };
      const res = await api.post(API_ENDPOINTS.USER.INVEST, payload);
      if (res?.success === false) {
        throw new Error(res?.message || 'Investment failed');
      }

      // Refresh balances & history
      await Promise.all([fetchBalances(), fetchHistory()]);

      setShowModal(false);
      setSelectedPackage(null);
      setSelectedModalTermMonths(6);
      setSelectedCurrency('USDT');
      toast.success(`Successfully invested in ${selectedPackage.name} package for ${term.months} months`);
    } catch (error) {
      toast.error(error?.message || 'Investment failed');
    } finally {
      setInvesting(false);
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      amber: {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/50',
        text: 'text-amber-400',
        button: 'bg-amber-500 hover:bg-amber-400',
      },
      gray: {
        bg: 'bg-gray-500/20',
        border: 'border-gray-500/50',
        text: 'text-gray-400',
        button: 'bg-gray-500 hover:bg-gray-400',
      },
      yellow: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        button: 'bg-yellow-500 hover:bg-yellow-400',
      },
      slate: {
        bg: 'bg-slate-500/20',
        border: 'border-slate-500/50',
        text: 'text-slate-400',
        button: 'bg-slate-500 hover:bg-slate-400',
      },
      emerald: {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/50',
        text: 'text-emerald-400',
        button: 'bg-emerald-500 hover:bg-emerald-400',
      },
      blue: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/50',
        text: 'text-blue-400',
        button: 'bg-blue-500 hover:bg-blue-400',
      },
      red: {
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        button: 'bg-red-500 hover:bg-red-400',
      },
      cyan: {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/50',
        text: 'text-cyan-400',
        button: 'bg-cyan-500 hover:bg-cyan-400',
      },
      purple: {
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/50',
        text: 'text-purple-400',
        button: 'bg-purple-500 hover:bg-purple-400',
      },
    };
    return colorMap[color] || colorMap.emerald;
  };

  const fetchBalances = useCallback(async () => {
    try {
      setBalancesLoading(true);
      const data = await api.get(API_ENDPOINTS.USER.GET_BALANCE);
      if (data?.success === false) return;
      setUsdtBalance(Number(data?.data?.usdtBalance || 0));
      setNovaBalance(Number(data?.data?.novaBalance || 0));
    } catch (error) {
      console.error('Fetch balances error:', error);
    } finally {
      setBalancesLoading(false);
    }
  }, []);

  const fetchPackages = useCallback(async (currency = 'USDT') => {
    try {
      setPackagesLoading(true);
      const data = await api.get(API_ENDPOINTS.USER.GET_PACKAGES, {
        params: { currency }
      });
      if (data?.success === false) return null;
      const items = (data?.data || []).map((pkg) => ({
        ...pkg,
        color: colorByName[pkg.name] || 'emerald'
      }));
      setPackages(items);

      // Auto-select first package if none selected
      if (items.length > 0 && !selectedPackageId) {
        setSelectedPackageId(items[0].id);
      }

      return items;
    } catch (error) {
      console.error('Fetch packages error:', error);
      return null;
    } finally {
      setPackagesLoading(false);
    }
  }, [selectedPackageId]);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const data = await api.get(API_ENDPOINTS.USER.GET_MY_INVESTMENTS, {
        params: { page, limit: 10 }
      });
      if (data?.success === false) {
        throw new Error(data?.message || 'Unable to fetch investment history');
      }
      setHistory(data?.data || []);
      if (data?.pagination) {
        setHistoryPagination(data.pagination);
      }
      setHistoryError('');
    } catch (error) {
      setHistoryError(error.message || 'Lỗi tải lịch sử đầu tư');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
    fetchPackages();
    fetchHistory(historyPage);
  }, [fetchBalances, fetchPackages, fetchHistory, historyPage]);

  // Get currently selected package
  const currentPackage = packages.find(pkg => pkg.id === selectedPackageId);

  const renderPackageCard = () => {
    if (packagesLoading) {
      return (
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border">
          <div className="text-center text-emerald-300/80 dark:text-emerald-400/80">
            Loading packages...
          </div>
        </div>
      );
    }

    if (!packages.length) {
      return (
        <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border">
          <div className="text-center text-emerald-300/80 dark:text-emerald-400/80">
            No packages available.
          </div>
        </div>
      );
    }

    if (!currentPackage) {
      return null;
    }

    const colors = getColorClasses(currentPackage.color);

    // Check if user has enough balance
    const hasEnoughBalance = usdtBalance >= currentPackage.price;

    return (
      <div className={`bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border ${colors.border} p-6 glow-border glow-border-hover relative z-10`}>
        {/* Package Selector */}
        <div className="mb-4 relative z-20">
          <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
            Select Investment Package
          </label>
          <div className="relative">
            <select
              value={selectedPackageId || ''}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2334d399'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">
                  {pkg.name} - {formatCurrency(pkg.price, 'USDT')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Term Selector - HARDCODED */}
        <div className="mb-6 relative z-20">
          <label className="block text-sm font-medium text-emerald-400 dark:text-emerald-300 mb-2">
            Select Investment Term
          </label>
          <div className="relative">
            <select
              value={selectedTermMonths}
              onChange={(e) => setSelectedTermMonths(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-300 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2334d399'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              {INVESTMENT_TERMS.map((term) => (
                <option key={term.months} value={term.months} className="bg-slate-700 dark:bg-gray-800 text-emerald-300 dark:text-emerald-400">
                  {term.months} months ({term.dailyRate}%/day)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Package Details */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-2xl font-bold ${colors.text}`}>
            {currentPackage.name}
          </h3>
          <div className={`${colors.bg} rounded-full p-3`}>
            <svg
              className={`w-8 h-8 ${colors.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200 mb-2">
            {formatCurrency(currentPackage.price, 'USDT')}
          </p>
          <p className="text-sm text-emerald-300/60 dark:text-emerald-400/60">
            Minimum investment amount
          </p>

          {/* Balance warning */}
          {!hasEnoughBalance && (
            <p className="text-sm text-red-400 dark:text-red-300 mt-2">
              ⚠️ Insufficient USDT balance. Required: {formatCurrency(currentPackage.price, 'USDT')}
            </p>
          )}
        </div>

        <button
          onClick={() => handleInvestClick(currentPackage)}
          disabled={!hasEnoughBalance}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${hasEnoughBalance
              ? `${colors.button} text-white dark:text-gray-900`
              : 'bg-slate-600/50 text-emerald-300/50 dark:bg-gray-700/50 dark:text-emerald-400/50 cursor-not-allowed'
            }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {!hasEnoughBalance ? 'Insufficient Balance' : 'Invest Now'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Wallet Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'USDT Wallet Balance', value: usdtBalance, currency: 'USDT' },
            { label: 'NOVA Wallet Balance', value: novaBalance, currency: 'NOVA' }
          ].map((item) => (
            <div key={item.currency} className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 glow-border glow-border-hover">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 mb-2">
                    {item.label}
                  </h2>
                  <p className="text-3xl font-bold text-emerald-300 dark:text-emerald-200">
                    {balancesLoading ? 'Loading...' : formatCurrency(item.value, item.currency)}
                  </p>
                </div>
                <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-4">
                  <svg
                    className="w-12 h-12 text-emerald-400 dark:text-emerald-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Package - Single Card with Select */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-emerald-400 dark:text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
              Investment Package
            </h2>
          </div>

          <div className="mx-auto">
            {renderPackageCard()}
          </div>
        </div>

        {/* Investment History */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-emerald-400 dark:text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300 uppercase">
              Investment History
            </h2>
          </div>

          <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-4 glow-border glow-border-hover">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/30 dark:border-emerald-400/30">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">Package</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">Term</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">Rate (/day)</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400 dark:text-emerald-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-xs text-emerald-300/80">
                        Loading history...
                      </td>
                    </tr>
                  )}
                  {!historyLoading && historyError && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-xs text-red-300">
                        {historyError}
                      </td>
                    </tr>
                  )}
                  {!historyLoading && !historyError && history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 px-4 text-center text-xs text-emerald-300/80">
                        No investment history available.
                      </td>
                    </tr>
                  )}
                  {!historyLoading && !historyError && history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-emerald-500/10 dark:border-emerald-400/10 hover:bg-emerald-500/5 dark:hover:bg-emerald-400/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-emerald-300 dark:text-emerald-400">
                        {(() => {
                          const timestamp = Number(item.startDate || item.startDate);
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
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                        {item.packageName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-green-400 dark:text-green-300">
                        {formatCurrency(item.amount || 0, 'USDT')}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                        {item.termMonths ? `${item.termMonths} months` : '--'}
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80 dark:text-emerald-400/80">
                        {item.dailyRate ? `${Number(item.dailyRate).toFixed(2)}%` : '--'}
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const normalizedStatus = (item.status || '').toString().trim().toLowerCase();
                          const isActive = normalizedStatus.includes('active')
                          const label = isActive ? 'Active' : item.status || 'Active';
                          return (
                            <span
                              className={`text-xs px-2 py-1 rounded ${isActive
                                ? 'bg-green-500/20 text-green-400 dark:text-green-300'
                                : 'bg-yellow-500/20 text-yellow-400 dark:text-yellow-300'
                                }`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!historyLoading && !historyError && history.length > 0 && (
              <Pagination
                currentPage={historyPagination.page}
                totalPages={historyPagination.totalPages}
                totalItems={historyPagination.total}
                itemsPerPage={historyPagination.limit}
                onPageChange={(page) => {
                  setHistoryPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Investment Confirmation Modal */}
      {showModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-slate-700 dark:bg-gray-800 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 w-full max-w-md glow-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-emerald-400 dark:text-emerald-300">
                Confirm Investment
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPackage(null);
                  setSelectedModalTermMonths(6);
                }}
                className="text-emerald-400 hover:text-emerald-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-2">
                Package: <span className="font-semibold text-emerald-400 dark:text-emerald-300">{selectedPackage.name}</span>
              </p>
              <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-2">
                Term: <span className="font-semibold text-emerald-400 dark:text-emerald-300">
                  {selectedModalTermMonths} months ({INVESTMENT_TERMS.find(t => t.months === selectedModalTermMonths)?.dailyRate}%/day)
                </span>
              </p>
              <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80">
                Amount: <span className="font-semibold text-emerald-400 dark:text-emerald-300">{formatCurrency(selectedPackage.price, selectedCurrency)}</span>
              </p>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 gap-2">
                {['USDT'].map((cur) => {
                  const balance = cur === 'USDT' ? usdtBalance : novaBalance;
                  const hasBalance = balance >= selectedPackage.price;

                  return (
                    <button
                      key={cur}
                      onClick={() => setSelectedCurrency(cur)}
                      disabled={!hasBalance}
                      className={`w-full p-3 rounded-lg border-2 transition-all ${selectedCurrency === cur
                          ? 'border-emerald-500 bg-emerald-500/20 dark:bg-emerald-400/20'
                          : hasBalance
                            ? 'border-emerald-500/30 bg-slate-600/50 dark:bg-gray-700/50 hover:border-emerald-500/50'
                            : 'border-red-500/30 bg-red-500/10 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold ${hasBalance ? 'text-emerald-200' : 'text-red-400'}`}>
                          {cur} Wallet
                        </span>
                        <span className={`text-xs ${hasBalance ? 'text-emerald-200/80' : 'text-red-400/80'}`}>
                          {formatCurrency(balance, cur)}
                        </span>
                        {!hasBalance && (
                          <span className="text-xs text-red-400">Insufficient</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPackage(null);
                  setSelectedModalTermMonths(6);
                }}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-emerald-300 dark:text-emerald-400 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvest}
                disabled={
                  investing ||
                  (selectedCurrency === 'USDT' && usdtBalance < selectedPackage.price) ||
                  (selectedCurrency === 'NOVA' && novaBalance < selectedPackage.price)
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${!investing &&
                    ((selectedCurrency === 'USDT' && usdtBalance >= selectedPackage.price) ||
                      (selectedCurrency === 'NOVA' && novaBalance >= selectedPackage.price))
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-gray-900'
                    : 'bg-slate-600/50 text-emerald-300/50 dark:bg-gray-700/50 dark:text-emerald-400/50 cursor-not-allowed'
                  }`}
              >
                {investing ? 'Processing...' : 'Confirm Investment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invest;