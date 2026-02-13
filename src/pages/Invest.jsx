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
  const [novaPrice, setNovaPrice] = useState(0);

  // HARDCODED TERMS
  const INVESTMENT_TERMS = [
    { months: 24, days: 720, dailyRate: 0.5 },
    { months: 18, days: 540, dailyRate: 0.4 },
    { months: 12, days: 360, dailyRate: 0.33 },
    { months: 6, days: 180, dailyRate: 0.2 },
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

  const handleInvestClick = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedModalTermMonths(6);
    setSelectedCurrency('USDT');
    setShowModal(true);
  };

  const handleConfirmInvest = async () => {
    const term = INVESTMENT_TERMS.find(t => t.months === selectedModalTermMonths);
    if (!term) {
      toast.error('Please select an investment term');
      return;
    }

    const isUsdt = selectedCurrency === 'USDT';
    const packagePriceUsd = selectedPackage.price;
    const requiredAmount = isUsdt ? packagePriceUsd : (novaPrice > 0 ? packagePriceUsd / novaPrice : 0);

    const balance = isUsdt ? usdtBalance : novaBalance;
    if (balance < requiredAmount) {
      toast.error(`Balance ${selectedCurrency} insufficient (${requiredAmount.toFixed(2)} ${selectedCurrency} required)`);
      return;
    }

    if (!isUsdt && novaPrice <= 0) {
      toast.error('Cant invest right now (NOVA price unavailable)');
      return;
    }

    try {
      setInvesting(true);
      const payload = {
        packageId: selectedPackage.id,
        termMonths: term.months,
        termDays: term.days,
        dailyRate: term.dailyRate,
        currency: selectedCurrency,
        novaPrice: isUsdt ? 0 : novaPrice,
        expectedNovaAmount: isUsdt ? 0 : requiredAmount
      };

      const res = await api.post(API_ENDPOINTS.USER.INVEST, payload);
      if (res?.success === false) {
        throw new Error(res?.message || 'Invest failed');
      }

      await Promise.all([fetchBalances(), fetchHistory()]);

      setShowModal(false);
      setSelectedPackage(null);
      toast.success(`Invested successfully in package ${selectedPackage.name} - ${term.months} months`);
    } catch (error) {
      toast.error(error?.message || 'Invest failed');
    } finally {
      setInvesting(false);
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', button: 'bg-amber-500 hover:bg-amber-400' },
      gray: { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400', button: 'bg-gray-500 hover:bg-gray-400' },
      yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400', button: 'bg-yellow-500 hover:bg-yellow-400' },
      slate: { bg: 'bg-slate-500/20', border: 'border-slate-500/50', text: 'text-slate-400', button: 'bg-slate-500 hover:bg-slate-400' },
      emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', button: 'bg-emerald-500 hover:bg-emerald-400' },
      blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', button: 'bg-blue-500 hover:bg-blue-400' },
      red: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', button: 'bg-red-500 hover:bg-red-400' },
      cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', button: 'bg-cyan-500 hover:bg-cyan-400' },
      purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', button: 'bg-purple-500 hover:bg-purple-400' },
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

  const fetchPackages = useCallback(async () => {
    try {
      setPackagesLoading(true);
      const data = await api.get(API_ENDPOINTS.USER.GET_PACKAGES, { params: { currency: 'USDT' } });
      if (data?.success === false) return;

      setNovaPrice(data.price || 0);

      const items = (data?.data || []).map(pkg => ({
        ...pkg,
        color: colorByName[pkg.name] || 'emerald'
      }));
      setPackages(items);
    } catch (error) {
      console.error('Fetch packages error:', error);
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const data = await api.get(API_ENDPOINTS.USER.GET_MY_INVESTMENTS, {
        params: { page, limit: 10 }
      });
      if (data?.success === false) {
        throw new Error(data?.message || 'Failed to load investment history');
      }
      setHistory(data?.data || []);
      if (data?.pagination) {
        setHistoryPagination(data.pagination);
      }
      setHistoryError('');
    } catch (error) {
      setHistoryError(error.message || 'Failed to load investment history');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
    fetchPackages();
    fetchHistory(historyPage);
  }, [fetchBalances, fetchPackages, fetchHistory, historyPage]);

  const getRequiredAmount = (currency) => {
    const usdPrice = selectedPackage?.price || 0;
    if (currency === 'USDT') return usdPrice;
    return novaPrice > 0 ? usdPrice / novaPrice : 0;
  };

  const requiredAmount = getRequiredAmount(selectedCurrency);

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        {/* Wallet Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'USDT Wallet Balance', value: usdtBalance, currency: 'USDT' },
            { label: 'NOVA Wallet Balance', value: novaBalance, currency: 'NOVA' }
          ].map((item) => (
            <div key={item.currency} className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6 glow-border glow-border-hover">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-400 mb-2">{item.label}</h2>
                  <p className="text-3xl font-bold text-emerald-300">
                    {balancesLoading ? 'Loading...' : formatCurrency(item.value, item.currency)}
                  </p>
                </div>
                <div className="bg-emerald-500/20 rounded-full p-4">
                  <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Packages */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/20 rounded-full p-2">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-emerald-400 uppercase">Investment Packages</h2>
          </div>

          {packagesLoading ? (
            <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6 glow-border text-center text-emerald-300/80">
              Loading packages...
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-6 glow-border text-center text-emerald-300/80">
              No packages available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const colors = getColorClasses(pkg.color);

                return (
                  <div
                    key={pkg.id}
                    className={`bg-slate-700/50 rounded-lg border ${colors.border} p-6 glow-border glow-border-hover transition-all hover:shadow-lg`}
                  >
                    {/* Package Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${colors.text}`}>
                        {pkg.name}
                      </h3>
                      <div className={`${colors.bg} rounded-full p-3`}>
                        <svg
                          className={`w-6 h-6 ${colors.text}`}
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

                    {/* Package Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-emerald-300 dark:text-emerald-200 mb-1">
                        {formatCurrency(pkg.price, 'USDT')}
                      </p>
                      <p className="text-xs text-emerald-300/60 dark:text-emerald-400/60">
                        Minimum investment
                      </p>
                    </div>

                    {/* Package Description */}
                    {pkg.description && (
                      <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-4">
                        {pkg.description}
                      </p>
                    )}

                    {/* Invest Button - LUÔN ACTIVE */}
                    <button
                      onClick={() => handleInvestClick(pkg)}
                      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${colors.button} text-white`}
                    >
                      <svg
                        className="w-5 h-5"
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
                      Invest Now
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Investment History */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/20 rounded-full p-2">
              <svg
                className="w-6 h-6 text-emerald-400"
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
            <h2 className="text-lg font-semibold text-emerald-400 uppercase">
              Investment History
            </h2>
          </div>

          <div className="bg-slate-700/50 rounded-lg border border-emerald-500/50 p-4 glow-border glow-border-hover">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/30">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400">Package</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400">Term</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400">Rate (/day)</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-emerald-400">Status</th>
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
                      className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-xs text-emerald-300/80">
                        <div className="whitespace-nowrap">
                          <div className="font-medium">
                            {item.startDate ? new Date(item.startDate).toLocaleDateString('en-US') : '--'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80">{item.packageName || 'N/A'}</td>
                      <td className="py-3 px-4 text-xs font-medium text-green-400">{formatCurrency(item.amount || 0, 'USDT')}</td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80">{item.termMonths ? `${item.termMonths} months` : '--'}</td>
                      <td className="py-3 px-4 text-xs text-emerald-300/80">{item.dailyRate ? `${Number(item.dailyRate).toFixed(2)}%` : '--'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded ${(item.status || '').toLowerCase().includes('active')
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                        >
                          {(item.status || 'Active').trim()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {/* Modal Confirm Investment */}
      {showModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-700 dark:bg-gray-800 rounded-lg border border-emerald-500/50 p-6 w-full max-w-md glow-border">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-emerald-400">Confirm Investment</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPackage(null);
                }}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-emerald-300/80 mb-1">Package</p>
                <p className="font-semibold text-emerald-400">{selectedPackage.name}</p>
              </div>

              <div>
                <label className="block text-sm text-emerald-300/80 mb-2">Investment Term</label>
                <select
                  value={selectedModalTermMonths}
                  onChange={(e) => setSelectedModalTermMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-600/60 border border-emerald-500/50 rounded-lg text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2334d399'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.3em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {INVESTMENT_TERMS.map((term) => (
                    <option key={term.months} value={term.months} className="bg-slate-800 text-emerald-300">
                      {term.months} months ({term.dailyRate}% daily)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-sm text-emerald-300/80 mb-1">Amount to Pay</p>
                <p className="font-semibold text-emerald-400">
                  {selectedCurrency === 'USDT'
                    ? formatCurrency(requiredAmount, 'USDT')
                    : `${requiredAmount.toFixed(2)} NOVA`}
                </p>
                {selectedCurrency === 'NOVA' && novaPrice > 0 && (
                  <p className="text-xs text-emerald-300/70 mt-1">
                    ≈ {formatCurrency(selectedPackage.price, 'USDT')} USDT (1 NOVA = {formatCurrency(novaPrice, 'USDT')})
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-emerald-300/80 mb-2">Payment Wallet</label>
              <div className="grid grid-cols-2 gap-3">
                {['USDT', 'NOVA'].map((cur) => {
                  const isUsdt = cur === 'USDT';
                  const balance = isUsdt ? usdtBalance : novaBalance;
                  const required = getRequiredAmount(cur);
                  const hasEnough = balance >= required;

                  return (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => setSelectedCurrency(cur)}
                      disabled={!hasEnough || (cur === 'NOVA' && novaPrice <= 0)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${selectedCurrency === cur
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : hasEnough
                            ? 'border-emerald-500/40 hover:border-emerald-500/60 bg-slate-600/40'
                            : 'border-red-500/40 bg-red-500/10 cursor-not-allowed opacity-70'
                        }`}
                    >
                      <div className="font-semibold">{cur} Wallet</div>
                      <div className="text-sm mt-1">
                        {formatCurrency(balance, cur)}
                        {!hasEnough && (
                          <span className="text-red-400 block mt-1 text-xs">
                            Need {required.toFixed(cur === 'USDT' ? 2 : 2)} {cur}
                          </span>
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
                }}
                className="flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-500 text-emerald-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvest}
                disabled={investing || requiredAmount > (selectedCurrency === 'USDT' ? usdtBalance : novaBalance)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${!investing && requiredAmount <= (selectedCurrency === 'USDT' ? usdtBalance : novaBalance)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {investing ? 'Processing...' : 'Confirm & Invest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invest;